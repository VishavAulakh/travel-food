# POS Integration Plan
**Date:** 2026-05-21  
**BILLING POS:** Tauri desktop app + NestJS cloud backend  
**Integration goal:** Restaurants using BILLING POS for dine-in → also manage food delivery via same platform

---

## 1. Integration Vision

```
Restaurant Owner's Full Stack:
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE BACKEND                            │
│              (BILLING NestJS + Food Delivery modules)        │
│                                                              │
│  Products/Menu ──────────────────── Shared                  │
│  Customers ──────────────────────── Shared                  │
│  Analytics ──────────────────────── Shared                  │
│  Branches ───────────────────────── Shared                  │
│  ReviewRise ─────────────────────── Shared                  │
│  Tax Rules ──────────────────────── Shared                  │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Dine-In POS   │    │      Food Delivery              │ │
│  │   (Tauri App)   │    │   (Customer Mobile App)         │ │
│  │                 │    │                                 │ │
│  │  • Invoice gen  │    │  • Online orders                │ │
│  │  • Print bills  │    │  • Delivery tracking            │ │
│  │  • Offline sync │    │  • Rider management             │ │
│  │  • Table mgmt   │    │  • Delivery zones               │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            RESTAURANT PORTAL (Web — Next.js)             │ │
│  │  Menu Mgmt · Dine-In Orders · Delivery Orders ·         │ │
│  │  Analytics · Staff · Zones · ReviewRise                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Shared Data — No Changes Needed

These BILLING modules work for BOTH POS dine-in and food delivery without modification:

### Products/Menu
```
BILLING product model → food delivery menu item
- name, description, image_url
- base_price, tax_rule_id
- category_id (menu section)
- is_active (toggle item availability)
- track_inventory (optional — for items with limited stock)
- product_variants (sizes: Small/Medium/Large)
```

The same product catalog is shared. A restaurant creates their menu once in BILLING. It appears in:
- Tauri POS for dine-in staff
- Customer mobile app for online ordering

### Customers
Food delivery customers and POS walk-in customers can share the same CRM table. Linking happens via phone number:
- Customer orders online → `customers` table row created
- Customer walks in to POS → cashier searches by phone → same row
- Both interactions appear in customer history
- ReviewRise cooldown applies across both channels

### Analytics
BILLING analytics module → extend to include delivery metrics:
- Revenue from dine-in vs delivery vs takeaway breakdown
- Delivery order volumes by hour
- Rider performance metrics
- Combined customer lifetime value (dine-in + delivery)

### ReviewRise
Current flow:
- POS invoice paid → ReviewRise trigger → review request

Extended flow:
- Delivery order marked delivered → ReviewRise trigger → review request
- Same module, same configuration, same Google redirect

No new code needed. Just call the existing reviewrise trigger service.

---

## 3. Invoice Linkage

Delivery orders create invoices in the same `invoices` table with `visit_type = 'delivery'`:

```sql
-- Current visit types: 'dine_in', 'takeaway'
-- Add: 'delivery'
-- Link delivery order to invoice:
delivery_orders.invoice_id → invoices.id
invoices.visit_type = 'delivery'
```

This means:
- All POS + delivery revenue in a single `invoices` table
- Unified analytics dashboard
- Single GST/VAT accounting
- Unified invoice numbering (INV-2026-00001 whether dine-in or delivery)

---

## 4. POS + Delivery Dashboard Integration

### Current BILLING Frontend (restaurant portal) — Pages to Add:

```
/portal/dashboard       → Show combined POS + delivery metrics
/portal/orders          → NEW: incoming delivery orders queue
/portal/invoices        → EXISTING: already shows all invoices (add delivery filter)
/portal/products        → EXISTING: menu management (works for delivery too)
/portal/customers       → EXISTING: CRM (works for delivery customers)
/portal/analytics       → EXISTING: extend with delivery breakdown
/portal/zones           → NEW: delivery zone polygon editor
/portal/hours           → NEW: opening hours + acceptance toggle
/portal/riders          → NEW: rider oversight (for admin)
```

### Unified Dashboard Metrics
```typescript
// dashboard page — extend existing stats endpoint
interface DashboardStats {
  // Existing
  todayRevenue: number;
  invoiceCount: number;
  reviewScore: number;
  syncHealth: SyncHealth;
  
  // New: food delivery
  deliveryOrders: {
    pending: number;
    preparing: number;
    enRoute: number;
    completedToday: number;
  };
  deliveryRevenue: number;
  averageDeliveryTime: number;  // minutes
  activeRiders: number;
  isAcceptingOrders: boolean;   // toggle
}
```

---

## 5. Plugin:Restaurant → Plugin:FoodDelivery

BILLING has a `plugin:restaurant` concept for tables, covers, and KOT (Kitchen Order Ticket).

For food delivery, add `plugin:food-delivery`:
- Delivery zone configuration UI
- Rider management
- Delivery analytics
- Commission tracking
- Time slot configuration

```typescript
// plugins table: add new plugin entry
{
  slug: 'plugin:food-delivery',
  name: 'Food Delivery',
  description: 'Enable online ordering and delivery management',
  version: '1.0.0',
  price_inr: 0,  // or monthly fee
  manifest_url: 'https://cdn.golocal.com/plugins/food-delivery/manifest.json'
}
```

Restaurants subscribe to `plugin:food-delivery` → activates delivery features in portal.

---

## 6. Tauri POS Extensions (Minimal Changes)

The Tauri POS app handles dine-in only. For food delivery orders to appear on the POS screen (e.g., so kitchen sees all orders — both walk-in and delivery):

### WebSocket Event Extension
New WebSocket event for POS to receive:
```typescript
// Backend emits to Tauri POS:
{
  event: 'delivery.order.placed',
  payload: {
    orderId: 'xxx',
    orderNumber: 'DEL-2026-0001',
    items: [...],
    customerNotes: 'No onions',
    deliveryAddress: 'summarized',
    estimatedPickupTime: '14:35'
  }
}
```

The Tauri POS displays a delivery order notification banner. Kitchen staff acknowledge it, prep starts.

**This is the ONLY change to the existing Tauri app** — add a new event listener and a UI panel for delivery orders. All existing POS functionality unchanged.

---

## 7. Database Conflict Prevention

Key constraint: Both POS (Tauri, offline-capable) and delivery (cloud-only) write to the same `invoices` table.

**Solution: Invoice numbering prefixes**
```
Dine-in/takeaway POS:   INV-2026-00001
Delivery orders:         DEL-2026-00001
```

Different sequence, no conflict. Both appear in analytics combined.

**Offline sync safety:**
- Delivery orders are cloud-only (no offline) — placed via customer app → internet required
- POS invoices can be offline → cloud sync
- No conflict because different number sequences

---

## 8. Migration Strategy (Existing BILLING Restaurants)

For restaurants already using BILLING who want to add food delivery:

1. Subscribe to `plugin:food-delivery` in portal
2. Configure delivery zones (new UI)
3. Set opening hours
4. Configure minimum order + delivery fees
5. Restaurant automatically becomes visible in customer app
6. Accept first delivery order via portal orders queue

**Estimated onboarding time:** 15 minutes per restaurant  
**Technical changes to existing BILLING data:** Zero — all food delivery data is additive

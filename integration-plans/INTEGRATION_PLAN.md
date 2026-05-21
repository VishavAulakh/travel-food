# Integration Plan — Food Delivery ↔ eCommerce ↔ BILLING
**Date:** 2026-05-21

---

## 1. Three-System Integration Map

```
┌──────────────────────────────────────────────────────────────────┐
│                    GOLOCAL ECOSYSTEM                              │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐  │
│  │  GoLocal eCommerce       │  │  ReviewRise Billing OS       │  │
│  │  (Medusa v2 + Next.js)   │  │  (NestJS + PostgreSQL)       │  │
│  │                          │  │                              │  │
│  │  UK Online Store         │  │  POS + Food Delivery         │  │
│  │  Physical products       │  │  Restaurant management       │  │
│  │  Postal delivery         │  │  Multi-tenant                │  │
│  └──────────────────────────┘  └──────────────────────────────┘  │
│              │                              │                     │
│              │                              │                     │
│              ▼                              ▼                     │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              SHARED INFRASTRUCTURE                        │   │
│  │   ReviewRise (reputation) · Stripe (billing)              │   │
│  │   Customer identity · Analytics                           │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. GoLocal eCommerce Integration

### 2.1 What's Shared
- **Customer accounts:** If a user registers on GoLocal eCommerce (Medusa), their email could be used for food delivery app. However, the auth systems are different (Medusa vs BILLING JWT). For MVP, maintain separate accounts. Post-MVP: consider SSO or shared email lookup.
- **Stripe:** Both systems use Stripe. Same Stripe account can serve both (separate Products/Customers). No technical conflict.
- **ReviewRise:** Both systems can trigger ReviewRise. eCommerce → post-purchase reviews. Food delivery → post-delivery reviews. Same ReviewRise platform, different triggers.

### 2.2 What Stays Separate
- Product catalogs are completely separate:
  - eCommerce: physical products shipped by Royal Mail
  - Food delivery: restaurant menu items delivered by rider
- Order models are incompatible (Medusa checkout ≠ food delivery order)
- Auth tokens are different systems

### 2.3 Future Integration Opportunity
Post-MVP:
- "GoLocal Marketplace": combine restaurants AND products in one app
- Shared loyalty points (earn points on both food delivery + eCommerce)
- Unified customer profile

---

## 3. BILLING ↔ Food Delivery Integration

This is the core integration — food delivery IS built ON TOP OF BILLING.

### 3.1 Shared Immediately (Zero Effort)

| BILLING Module | Food Delivery Use |
|---|---|
| Auth (JWT + RBAC) | Restaurant staff login, add customer/rider roles |
| Tenants | Each restaurant = a BILLING tenant |
| Products | Restaurant menu items = BILLING products |
| Categories | Menu sections = BILLING categories |
| Customers | Delivery customers = BILLING customers |
| Branches | Restaurant locations |
| Analytics | Restaurant revenue + delivery metrics combined |
| ReviewRise | Post-delivery review requests |
| Stripe subscriptions | Restaurant's monthly SaaS subscription |
| Redis + BullMQ | Delivery job queues use same infrastructure |
| Socket.io | Delivery tracking uses same WebSocket server |

### 3.2 Shared After Minor Extensions

| Component | Extension |
|---|---|
| invoices | Add `visit_type = 'delivery'` + `delivery_orders.invoice_id` |
| Auth RBAC | Add `customer` and `rider` roles |
| Socket.io events | Add delivery tracking events |
| Analytics | Extend with delivery metrics |
| Dashboard | Add delivery widget |

### 3.3 New (Delivery-Specific)

| Component | Status |
|---|---|
| delivery_orders table | New (extends invoices) |
| riders table | New user type |
| delivery_zones table | New (geography) |
| opening_hours table | New |
| rider_earnings table | New |
| food-delivery NestJS module | New |
| riders NestJS module | New |
| zones NestJS module | New |
| tracking NestJS module | New |

---

## 4. Data Flow: Order Placed

```
Customer App → POST /delivery/orders
                    │
                    ├── 1. Check delivery zone coverage (zones service)
                    ├── 2. Create invoice record (invoices table, visit_type='delivery')
                    ├── 3. Create delivery_order record (delivery_orders table)
                    ├── 4. Create Stripe Payment Intent (existing Stripe module)
                    ├── 5. Return payment intent client_secret to mobile
                    │
Customer App → Stripe Payment Sheet
                    │
Stripe Webhook → POST /stripe/webhook (existing webhook handler)
                    │
                    ├── 6. Mark invoice as paid
                    ├── 7. Mark delivery_order status = 'placed'
                    ├── 8. Emit Socket.io event to restaurant portal
                    ├── 9. Push notification to restaurant staff
                    └── 10. BullMQ: start order-timeout job (5 min to accept)
```

---

## 5. Data Flow: Delivery Completed

```
Rider App → PATCH /delivery/orders/:id/delivered
                │
                ├── 1. Update delivery_order.status = 'delivered'
                ├── 2. Update delivery_order.delivered_at
                ├── 3. Calculate commission: platform_fee = total * 0.15
                ├── 4. Create rider_earnings record
                ├── 5. Stripe Connect: transfer to restaurant account
                ├── 6. Stripe Connect: transfer to rider account
                ├── 7. Emit Socket.io: order:ORDER_ID:status_change (DELIVERED)
                ├── 8. Push notification to customer: "Your order is delivered!"
                └── 9. ReviewRise trigger (existing reviewrise module)
                          │
                          └── SMS/WhatsApp → customer → Google review request
```

---

## 6. Multi-Tenant Model for Food Delivery

```
Public schema:
├── tenants (each restaurant = one tenant)
├── subscriptions (restaurant SaaS plan)
└── plugins (plugin:food-delivery subscription per restaurant)

tenant_{restaurant_id} schema:
├── products (restaurant menu)
├── categories (menu sections)
├── customers (delivery customers for this restaurant)
├── invoices (all orders: POS + delivery)
├── delivery_orders (food delivery orders)
├── delivery_zones (restaurant's delivery geography)
├── opening_hours
├── restaurant_settings
├── riders (riders available to this restaurant)
├── rider_earnings
└── analytics tables
```

**Key design choice:** Riders are tenant-scoped. A rider registered with Restaurant A cannot see Restaurant B's orders. This prevents driver sharing across competitors — each restaurant manages their own rider fleet.

**Alternative** (post-MVP): Platform-level rider pool where any rider can pick up from any restaurant. This requires moving riders to the public schema.

---

## 7. ReviewRise Integration Detail

The existing ReviewRise integration in BILLING fires when:
- An invoice is marked as paid (for POS dine-in customers)

For food delivery, the trigger fires when:
- `delivery_orders.status` changes to `delivered`

```typescript
// In food-delivery.service.ts
async markDelivered(orderId: string) {
  // ... update order status
  
  // Reuse EXISTING reviewrise trigger
  await this.reviewriseService.triggerReview({
    invoiceId: order.invoiceId,
    customerId: order.customerId,
    branchId: order.branchId,
    wasOffline: false,
  });
  
  // ReviewRise handles: cooldown check, customer opt-out, Google redirect config
  // ZERO new ReviewRise code needed
}
```

---

## 8. Commission Model

```
Order total: £20.00
Platform commission: 15% = £3.00
Rider earning: £4.50 (flat + distance)
Restaurant payout: £20.00 - £3.00 - £4.50 = £12.50

Stripe flow:
- Customer pays £20.00 + £2.50 delivery fee = £22.50
- Stripe holds the full amount
- After delivery confirmed:
  - Transfer £12.50 to restaurant Stripe Connect account
  - Transfer £4.50 to rider Stripe Connect account
  - Platform retains £3.00 + £2.50 delivery fee = £5.50
```

---

## 9. Go-Live Checklist

### Technical Integration
- [ ] food-delivery NestJS module imports existing auth, customers, products, reviewrise modules
- [ ] Stripe webhook handler extended for delivery order payment
- [ ] Socket.io gateway extended for delivery events
- [ ] BullMQ queues added for delivery jobs
- [ ] Restaurant portal new pages deployed (orders, zones, hours)

### Data
- [ ] PostGIS enabled in production PostgreSQL
- [ ] Delivery migrations applied
- [ ] At least 3 restaurants seeded with menu, zones, hours
- [ ] At least 5 riders onboarded and verified

### Infrastructure
- [ ] Stripe Connect enabled for UK
- [ ] Twilio account for SMS OTP
- [ ] Google Maps API key with all required APIs enabled
- [ ] BILLING backend deployed to Railway (or existing server)
- [ ] Restaurant portal deployed to Vercel
- [ ] EAS project configured
- [ ] Customer app TestFlight build
- [ ] Rider app TestFlight build

# Backend Architecture — Food Delivery Extension
**Date:** 2026-05-21  
**Decision:** Extend existing BILLING NestJS backend  
**New Modules Required:** food-delivery, riders, zones, tracking

---

## 1. Architectural Decision: Extend BILLING Backend

### Why Extend (Not Build New)
The BILLING NestJS backend at `D:\Root\Tech\Projects\Commercial\BlackBull\Production_Github\BILLING\backend` already provides:

✅ 15+ production-ready NestJS modules  
✅ Multi-tenant PostgreSQL (schema-per-tenant)  
✅ JWT + device token authentication  
✅ Redis + BullMQ queue infrastructure  
✅ Socket.io WebSocket layer  
✅ Stripe subscription management  
✅ Product/inventory management  
✅ Customer CRM  
✅ Analytics engine  
✅ ReviewRise integration (post-delivery reviews = zero new code)  
✅ Prisma ORM  

**Estimated effort saved: 3-4 months of backend engineering**

### Extension Strategy
Add 4 new NestJS modules to the existing backend:
```
BILLING/backend/src/modules/
├── [existing 15 modules — DO NOT TOUCH]
├── food-delivery/      ← NEW: delivery order lifecycle
├── riders/             ← NEW: rider management + earnings
├── zones/              ← NEW: delivery zones + opening hours
└── tracking/           ← NEW: real-time GPS broadcasting
```

---

## 2. New Database Schema (Tenant Tables)

All new tables extend the existing tenant schema (`tenant_{id}`).  
Migration approach: Prisma Migrate, same pattern as existing.

### `restaurant_settings`
Restaurant-level delivery configuration:
```sql
CREATE TABLE restaurant_settings (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL,
  min_order_amount          NUMERIC(10,2) DEFAULT 0,
  delivery_fee_flat         NUMERIC(10,2) DEFAULT 0,
  delivery_fee_per_km       NUMERIC(10,2) DEFAULT 0,
  max_delivery_radius_km    NUMERIC(10,2) DEFAULT 5,
  estimated_prep_minutes    INTEGER DEFAULT 25,
  is_accepting_orders       BOOLEAN DEFAULT TRUE,
  auto_accept_orders        BOOLEAN DEFAULT FALSE, -- auto-confirm without staff click
  commission_pct            NUMERIC(5,2) DEFAULT 15.00, -- platform commission %
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);
```

### `delivery_zones`
Geographic delivery zones per restaurant:
```sql
CREATE TABLE delivery_zones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id         UUID REFERENCES branches(id) ON DELETE CASCADE,
  name              VARCHAR(100) NOT NULL,      -- "Zone A — 3km"
  zone_type         VARCHAR(32) DEFAULT 'radius', -- 'radius' or 'polygon'
  center_lat        NUMERIC(10,8),               -- for radius zones
  center_lng        NUMERIC(11,8),
  radius_km         NUMERIC(10,2),               -- for radius zones
  polygon           JSONB,                        -- GeoJSON for polygon zones
  delivery_fee      NUMERIC(10,2) DEFAULT 0,
  min_order_amount  NUMERIC(10,2) DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 30,
  is_active         BOOLEAN DEFAULT TRUE,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- PostGIS index for fast geo lookups
CREATE INDEX idx_delivery_zones_branch ON delivery_zones(branch_id);
```

### `opening_hours`
```sql
CREATE TABLE opening_hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL,       -- 0=Sunday, 1=Monday...6=Saturday
  opens_at        TIME NOT NULL,          -- "09:00:00"
  closes_at       TIME NOT NULL,          -- "22:00:00"
  is_closed       BOOLEAN DEFAULT FALSE,
  UNIQUE(branch_id, day_of_week)
);
```

### `delivery_orders`
The core delivery order table, linked to invoices:
```sql
CREATE TABLE delivery_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id            UUID REFERENCES invoices(id),
  branch_id             UUID REFERENCES branches(id),
  customer_id           UUID REFERENCES customers(id),
  rider_id              UUID REFERENCES riders(id),

  -- Status machine
  status                VARCHAR(32) NOT NULL DEFAULT 'placed',
  -- placed|confirmed|preparing|ready_for_pickup|rider_assigned|picked_up|en_route|delivered|cancelled|refunded

  -- Delivery address (snapshot at order time)
  delivery_address      JSONB NOT NULL,
  -- { line1, line2, city, postcode, lat, lng, notes }

  -- Timing
  estimated_prep_minutes    INTEGER,
  estimated_delivery_minutes INTEGER,
  confirmed_at          TIMESTAMPTZ,
  preparing_at          TIMESTAMPTZ,
  ready_at              TIMESTAMPTZ,
  rider_assigned_at     TIMESTAMPTZ,
  picked_up_at          TIMESTAMPTZ,
  delivered_at          TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  -- Customer
  customer_notes        TEXT,
  customer_phone        VARCHAR(20),

  -- Financials
  subtotal              NUMERIC(12,2) NOT NULL,
  delivery_fee          NUMERIC(10,2) DEFAULT 0,
  tip_amount            NUMERIC(10,2) DEFAULT 0,
  discount_amount       NUMERIC(10,2) DEFAULT 0,
  total                 NUMERIC(12,2) NOT NULL,
  platform_commission_pct  NUMERIC(5,2) DEFAULT 15.00,
  platform_fee_amount      NUMERIC(10,2),
  restaurant_payout_amount NUMERIC(10,2),

  -- Cancellation
  cancelled_by          VARCHAR(32),   -- customer|restaurant|platform|rider
  cancellation_reason   TEXT,
  refund_status         VARCHAR(32),   -- pending|processing|refunded

  -- Tracking
  tracking_started_at   TIMESTAMPTZ,
  last_rider_lat        NUMERIC(10,8),
  last_rider_lng        NUMERIC(11,8),
  last_location_at      TIMESTAMPTZ,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delivery_orders_branch ON delivery_orders(branch_id, status);
CREATE INDEX idx_delivery_orders_rider ON delivery_orders(rider_id, status);
CREATE INDEX idx_delivery_orders_customer ON delivery_orders(customer_id);
CREATE INDEX idx_delivery_orders_created ON delivery_orders(created_at DESC);
```

### `riders`
```sql
CREATE TABLE riders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  phone                 VARCHAR(20) UNIQUE NOT NULL,
  email                 VARCHAR(255) UNIQUE,
  profile_photo_url     TEXT,

  -- Vehicle
  vehicle_type          VARCHAR(32) DEFAULT 'bicycle', -- bicycle|motorcycle|car
  vehicle_make_model    VARCHAR(100),
  license_plate         VARCHAR(20),
  vehicle_photo_url     TEXT,

  -- Status
  status                VARCHAR(32) DEFAULT 'pending_approval', -- pending_approval|active|inactive|suspended
  is_available          BOOLEAN DEFAULT FALSE,    -- online/offline toggle
  is_verified           BOOLEAN DEFAULT FALSE,    -- KYC verified

  -- Live location (updated every 3s while active)
  current_lat           NUMERIC(10,8),
  current_lng           NUMERIC(11,8),
  location_updated_at   TIMESTAMPTZ,

  -- Stats
  total_deliveries      INTEGER DEFAULT 0,
  total_earnings        NUMERIC(14,2) DEFAULT 0,
  rating                NUMERIC(3,2) DEFAULT 0.00,
  rating_count          INTEGER DEFAULT 0,

  -- Auth
  password_hash         TEXT,
  refresh_token_hash    TEXT,

  -- Timestamps
  last_online_at        TIMESTAMPTZ,
  approved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_riders_status ON riders(status, is_available);
CREATE INDEX idx_riders_location ON riders(current_lat, current_lng) 
  WHERE is_available = TRUE;
```

### `rider_earnings`
```sql
CREATE TABLE rider_earnings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id          UUID REFERENCES riders(id),
  delivery_order_id UUID REFERENCES delivery_orders(id),
  base_earning      NUMERIC(10,2) NOT NULL,
  tip_amount        NUMERIC(10,2) DEFAULT 0,
  bonus_amount      NUMERIC(10,2) DEFAULT 0,
  total_earning     NUMERIC(10,2) GENERATED ALWAYS AS (base_earning + tip_amount + bonus_amount) STORED,
  status            VARCHAR(32) DEFAULT 'pending',  -- pending|processing|paid
  payout_reference  VARCHAR(255),
  earned_at         TIMESTAMPTZ NOT NULL,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rider_earnings_rider ON rider_earnings(rider_id, status);
```

### `rider_ratings`
```sql
CREATE TABLE rider_ratings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id          UUID REFERENCES riders(id),
  delivery_order_id UUID REFERENCES delivery_orders(id),
  customer_id       UUID REFERENCES customers(id),
  rating            INTEGER NOT NULL,    -- 1-5
  comment           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. New NestJS Modules

### 3.1 `food-delivery` Module (Core Order Lifecycle)

```
src/modules/food-delivery/
├── food-delivery.module.ts
├── food-delivery.controller.ts
├── food-delivery.service.ts
├── food-delivery.gateway.ts      ← Socket.io gateway
├── dto/
│   ├── create-order.dto.ts
│   ├── update-order-status.dto.ts
│   └── delivery-address.dto.ts
└── jobs/
    ├── order-timeout.job.ts      ← Auto-cancel unconfirmed orders
    └── rider-assignment.job.ts   ← Auto-assign available rider
```

**Key API Endpoints:**
```
POST   /delivery/orders                    ← Customer places order
GET    /delivery/orders                    ← List orders (filtered by role)
GET    /delivery/orders/:id                ← Order detail
PATCH  /delivery/orders/:id/confirm        ← Restaurant confirms
PATCH  /delivery/orders/:id/preparing      ← Kitchen started
PATCH  /delivery/orders/:id/ready          ← Food ready for pickup
PATCH  /delivery/orders/:id/assign-rider   ← Assign rider
PATCH  /delivery/orders/:id/picked-up      ← Rider confirms pickup
PATCH  /delivery/orders/:id/delivered      ← Delivery confirmed
PATCH  /delivery/orders/:id/cancel         ← Cancel order
GET    /delivery/orders/:id/tracking       ← Live tracking state
```

**Socket.io Events (extending existing gateway):**
```
// Server → Client
order:{orderId}:status_change   → { status, timestamp }
order:{orderId}:rider_location  → { lat, lng }
order:{orderId}:eta_update      → { estimatedMinutes }

// Client → Server  
join_order_room:{orderId}       ← Customer/restaurant subscribes
leave_order_room:{orderId}
rider_location_update           ← Rider pushes GPS every 3s
```

### 3.2 `riders` Module

```
src/modules/riders/
├── riders.module.ts
├── riders.controller.ts        ← Rider-facing endpoints
├── riders.service.ts
├── riders-admin.controller.ts  ← Admin management endpoints
└── dto/
    ├── register-rider.dto.ts
    ├── update-rider-location.dto.ts
    └── rider-availability.dto.ts
```

**Key API Endpoints:**
```
POST   /riders/auth/register    ← Rider self-registration
POST   /riders/auth/login
POST   /riders/auth/refresh

GET    /riders/me               ← Rider profile
PATCH  /riders/me               ← Update profile
PATCH  /riders/me/availability  ← Toggle online/offline
POST   /riders/me/location      ← Push GPS location (called every 3s while active)

GET    /riders/me/orders        ← Current and past orders
GET    /riders/me/earnings      ← Earnings breakdown
GET    /riders/me/earnings/summary ← Daily/weekly totals

# Admin
GET    /admin/riders            ← All riders
PATCH  /admin/riders/:id/approve
PATCH  /admin/riders/:id/suspend
GET    /admin/riders/available  ← Currently online riders (for dispatch)
```

### 3.3 `zones` Module

```
src/modules/zones/
├── zones.module.ts
├── zones.controller.ts
├── zones.service.ts
└── dto/
    ├── create-zone.dto.ts
    └── check-coverage.dto.ts
```

**Key API Endpoints:**
```
GET    /zones/:branchId         ← All delivery zones for a restaurant
POST   /zones/:branchId         ← Create zone (restaurant admin)
PATCH  /zones/:id
DELETE /zones/:id

POST   /zones/check-coverage    ← Does address fall in any zone?
  Request: { branchId, lat, lng }
  Response: { covered: true, zone: {...}, deliveryFee: 2.50, estimatedMinutes: 35 }

GET    /opening-hours/:branchId
PUT    /opening-hours/:branchId ← Set all 7 days at once

GET    /zones/nearby-restaurants  ← Given lat/lng, find open restaurants
  Request: { lat, lng, limit: 20 }
  Response: [{ restaurant, distance, deliveryFee, estimatedTime }]
```

### 3.4 `tracking` Module

```
src/modules/tracking/
├── tracking.module.ts
├── tracking.controller.ts
├── tracking.service.ts         ← Redis Pub/Sub bridge
└── tracking.gateway.ts         ← Socket.io gateway
```

**Redis Architecture for Live Tracking:**
```
// Rider sends location update → REST endpoint
POST /tracking/location
{ riderId, orderId, lat, lng, bearing, speed }

// Service writes to Redis
Redis.set(`rider:${riderId}:location`, JSON.stringify({ lat, lng, bearing, timestamp }))
Redis.publish(`order:${orderId}:tracking`, JSON.stringify({ lat, lng, bearing }))

// Socket.io gateway subscribes to Redis channels
// Broadcasts to connected clients in order room
// No polling required — pure event-driven
```

---

## 4. Modified Existing Modules

### Auth Module — Add Roles
```typescript
// Add to existing RBAC
export enum UserRole {
  // Existing
  SUPERADMIN = 'superadmin',
  TENANT_ADMIN = 'tenant_admin',
  BRANCH_MANAGER = 'branch_manager',
  CASHIER = 'cashier',
  VIEWER = 'viewer',
  
  // New
  CUSTOMER = 'customer',      // Food delivery customer
  RIDER = 'rider',            // Delivery rider
}
```

### Invoices Module — Delivery Metadata
```typescript
// Extend existing CreateInvoiceDto
interface DeliveryInvoiceExtension {
  visitType: 'delivery' | 'dine_in' | 'takeaway';  // already exists
  deliveryOrderId?: string;  // link to delivery_orders table
}
```

### ReviewRise Module — Post-Delivery Trigger
No code changes needed. The existing ReviewRise trigger fires on invoice payment.  
Food delivery invoice payment = delivery completion → automatic ReviewRise trigger.

---

## 5. Real-Time Architecture Detail

```
Customer App (Socket.io client)
       │
       ├── connect: wss://api.golocal.com/ws
       ├── auth: { token: JWT }
       ├── emit: join_order_room:ORDER_ID
       │
       │
Rider App (Socket.io client)
       │
       ├── connect + auth
       ├── emit: rider_location_update: { lat, lng, orderId }
       │
       ▼
Socket.io Server (NestJS Gateway — extends existing)
       │
       ├── rider_location_update received
       ├── Write to Redis: rider:RIDER_ID:location
       ├── Publish to Redis: order:ORDER_ID:tracking
       │
       ▼
Redis Pub/Sub subscriber (in NestJS)
       │
       ├── Receive from: order:ORDER_ID:tracking
       ├── Broadcast to Socket.io room: order:ORDER_ID
       │
       ▼
Customer App receives: order:ORDER_ID:rider_location
       │
       └── Update map marker (Reanimated animated position)
```

---

## 6. Queue Jobs (BullMQ — extending existing)

```typescript
// New queues to add to existing BullMQ setup
const NEW_QUEUES = [
  'order-notifications',   // FCM push to customer/rider
  'order-timeout',         // Auto-cancel unconfirmed orders after 5min
  'rider-assignment',      // Find available rider for ready orders
  'commission-calculation', // Calculate platform fees post-delivery
  'earnings-payout',       // Batch rider payout processing
  'delivery-analytics',    // Update analytics after delivery
];
```

---

## 7. API Route Structure (Complete)

```
/v1/ (existing)
├── auth/
├── tenants/
├── branches/
├── products/
├── customers/
├── invoices/
├── sync/
├── analytics/
├── reviewrise/
├── plugins/
├── subscriptions/
├── devices/
├── updates/
└── admin/

/v1/ (new — food delivery)
├── delivery/
│   ├── orders/
│   ├── restaurants/        ← Public: browse restaurants
│   └── menu/               ← Public: restaurant menu
├── riders/
│   ├── auth/
│   ├── me/
│   └── me/earnings/
├── zones/
├── tracking/
└── customer/               ← Customer profile management
    ├── me/
    ├── me/addresses/
    └── me/orders/
```

---

## 8. Environment Extensions

```env
# Add to existing BILLING backend .env

# PostGIS (for geographic queries)
ENABLE_POSTGIS=true

# Food delivery
PLATFORM_COMMISSION_PCT=15
DEFAULT_DELIVERY_RADIUS_KM=5
ORDER_CONFIRMATION_TIMEOUT_MINUTES=5
RIDER_ACCEPTANCE_TIMEOUT_MINUTES=3

# Rider payout
STRIPE_CONNECT_CLIENT_ID=ca_xxx  # Stripe Connect for rider payouts

# Real-time tracking (Redis — already configured)
# Uses existing REDIS_URL
RIDER_LOCATION_UPDATE_INTERVAL_SECONDS=3
RIDER_LOCATION_EXPIRY_SECONDS=30
```

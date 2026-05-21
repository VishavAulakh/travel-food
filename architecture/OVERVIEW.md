# Food Delivery Platform — Architecture Overview
**Version:** 1.0  
**Date:** 2026-05-21  
**Status:** Recommended Architecture (Pre-Implementation)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FOOD DELIVERY ECOSYSTEM                                │
│                                                                              │
│  ┌──────────────────────────┐    ┌──────────────────────────────────────┐   │
│  │   CUSTOMER APP           │    │   RIDER APP                          │   │
│  │   (Expo / React Native)  │    │   (Expo / React Native)              │   │
│  │                          │    │                                      │   │
│  │  • Restaurant browsing   │    │  • Order accept/reject               │   │
│  │  • Menu + cart           │    │  • Navigation (Google Maps)          │   │
│  │  • Checkout + payments   │    │  • Live GPS broadcast                │   │
│  │  • Live order tracking   │    │  • Delivery confirmation             │   │
│  │  • Push notifications    │    │  • Earnings dashboard                │   │
│  │  • Review system         │    │  • Online/offline toggle             │   │
│  │  • Account + history     │    │  • Payout history                    │   │
│  └──────────────┬───────────┘    └──────────────────┬───────────────────┘   │
│                 │                                    │                       │
│                 └─────────────────┬─────────────────┘                       │
│                                   │ HTTPS + WebSocket (TLS 1.3)            │
│                                   │                                         │
│  ┌────────────────────────────────▼────────────────────────────────────┐    │
│  │                    API GATEWAY / BFF LAYER                           │    │
│  │                    (NestJS — New food-delivery module)               │    │
│  │                                                                      │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │    │
│  │  │ Orders API   │ │ Riders API   │ │ Zones API    │ │ Tracking   │ │    │
│  │  │ /delivery/   │ │ /riders/     │ │ /zones/      │ │ WebSocket  │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │    │
│  └─────────────────────────────┬────────────────────────────────────────┘    │
│                                │                                             │
│  ┌─────────────────────────────▼────────────────────────────────────────┐   │
│  │              EXISTING BILLING BACKEND (NestJS — REUSED)              │   │
│  │                                                                       │   │
│  │  Auth · Tenants · Products · Customers · Analytics                   │   │
│  │  Branches · Devices · ReviewRise · Stripe · Super Admin              │   │
│  │  Redis · BullMQ · Socket.io · PostgreSQL (multi-tenant)              │   │
│  └─────────────────────────────┬────────────────────────────────────────┘   │
│                                │                                             │
│                 ┌──────────────┴───────────────┐                            │
│                 │                              │                            │
│  ┌──────────────▼──────────────┐  ┌────────────▼──────────────────────┐    │
│  │   RESTAURANT PORTAL         │  │   SUPER ADMIN DASHBOARD           │    │
│  │   (Next.js 14 — Extended)   │  │   (Next.js 14 — Extended)         │    │
│  │                             │  │                                   │    │
│  │  • Live orders queue        │  │  • Restaurant approvals           │    │
│  │  • Menu management          │  │  • Subscription management        │    │
│  │  • Delivery zones           │  │  • Commission management          │    │
│  │  • Analytics                │  │  • Analytics platform-wide        │    │
│  │  • Staff management         │  │  • Rider management               │    │
│  │  • Opening hours            │  │  • Dispute resolution             │    │
│  └─────────────────────────────┘  └───────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Decision

### 2.1 Mobile Apps (Customer + Rider)
| Decision | Choice | Rationale |
|---|---|---|
| Framework | **Expo + React Native** | Single codebase iOS+Android, EAS Build, OTA updates, massive ecosystem |
| Navigation | **Expo Router v3** | File-based routing, deep links, web-compatible |
| Styling | **NativeWind v4** | Tailwind CSS syntax on React Native, matches existing web stack |
| Animations | **React Native Reanimated v3 + Gesture Handler** | 60fps native animations, industry standard |
| State | **Zustand** | Already used in BILLING frontend, lightweight, no boilerplate |
| Data fetching | **TanStack Query (React Query)** | Cache, background refetch, mutations with rollback |
| Storage | **MMKV** | 10x faster than AsyncStorage, synchronous |
| Maps | **react-native-maps (Google Maps)** | Mature, App Store safe, full feature set |
| Push notifications | **Expo Notifications + FCM** | Unified iOS/Android, reliable |
| Auth | **Custom JWT** (reuse BILLING auth) | No 3rd party dependency, full control |
| Payments | **Stripe React Native SDK** | App Store compliant, Apple/Google Pay support |
| OTA updates | **Expo EAS Update** | App Store compliant for JS changes |
| Build/Deploy | **EAS Build** | Managed iOS/Android builds, CI/CD |

### 2.2 Backend
| Decision | Choice | Rationale |
|---|---|---|
| Primary backend | **Extend BILLING NestJS** | 15+ modules already built, auth, DB, Redis all running |
| New modules | `food-delivery`, `riders`, `zones`, `tracking` | NestJS module pattern, drops into existing app |
| Database | **Extend existing PostgreSQL** | Add delivery tables to tenant schema, same Prisma ORM |
| Real-time | **Extend existing Socket.io** | Already installed in BILLING, add delivery channels |
| Queue | **Extend existing BullMQ/Redis** | Already running, add delivery job queues |
| Geo queries | **PostGIS extension** | For delivery zone calculations |
| Rider tracking | **Redis Pub/Sub** → Socket.io | Low latency GPS broadcasting |

### 2.3 Restaurant Portal
| Decision | Choice | Rationale |
|---|---|---|
| Framework | **Extend BILLING Next.js 14** | 11 pages already built, design system exists |
| New pages | Orders queue, Delivery zones, Rider tracking | Add to existing app router |
| Real-time orders | **Socket.io client** (already in BILLING frontend) | Extend existing WS connection |
| Component library | **shadcn/ui + Framer Motion** (already in BILLING) | Consistent design system |

### 2.4 Infrastructure
| Component | Choice |
|---|---|
| Deployment | Railway (backend) + Vercel (frontend) + EAS (mobile) |
| Database | Railway PostgreSQL or Supabase |
| Redis | Railway Redis or Upstash |
| File storage | Cloudflare R2 or AWS S3 |
| CDN | Cloudflare |
| Monitoring | Sentry (mobile + backend) |
| Analytics | PostHog (product analytics) |

---

## 3. Data Architecture for Food Delivery

### 3.1 New Tables (to add to tenant schema)
```sql
-- Restaurant delivery configuration
delivery_settings (
  restaurant_id, min_order_amount, delivery_fee_flat,
  delivery_fee_per_km, max_delivery_radius_km,
  estimated_prep_minutes, is_accepting_orders
)

-- Delivery zones (GeoJSON polygons)
delivery_zones (
  id, restaurant_id, name, polygon JSONB,
  delivery_fee, min_order_amount, is_active
)

-- Opening hours
opening_hours (
  id, restaurant_id, day_of_week, opens_at, closes_at, is_closed
)

-- Delivery orders (extends existing invoice model)
delivery_orders (
  id, invoice_id, customer_id, rider_id,
  status, -- placed|confirmed|preparing|ready|picked_up|delivered|cancelled
  delivery_address JSONB,
  estimated_delivery_at, actual_delivery_at,
  customer_notes, cancellation_reason,
  platform_commission_pct, platform_fee_amount
)

-- Riders (new user type)
riders (
  id, name, phone, email, vehicle_type, 
  license_plate, profile_photo_url,
  is_available, current_lat, current_lng,
  total_deliveries, rating, status -- active|inactive|suspended
)

-- Rider location stream (short-lived, Redis preferred)
-- Store in Redis: rider:{rider_id}:location → { lat, lng, timestamp }
-- Broadcast via Socket.io to order room

-- Rider earnings
rider_earnings (
  id, rider_id, order_id, base_earning,
  tip_amount, bonus_amount, status -- pending|paid
)
```

### 3.2 Order Lifecycle State Machine
```
PLACED
  ↓ (restaurant confirms, triggers prep timer)
CONFIRMED
  ↓ (kitchen starts, timer shown to customer)
PREPARING
  ↓ (food ready, dispatch to available rider)
READY_FOR_PICKUP
  ↓ (rider accepts)
RIDER_ASSIGNED
  ↓ (rider arrives at restaurant)
PICKED_UP
  ↓ (rider en route, live tracking active)
EN_ROUTE
  ↓ (rider delivers)
DELIVERED ──→ ReviewRise trigger (post-delivery review request)
  
At any stage:
CANCELLED (by customer, restaurant, or platform)
REFUNDED (post-cancellation)
```

---

## 4. Real-time Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REAL-TIME EVENTS                          │
│                                                              │
│  Rider GPS update (every 3s while delivering)               │
│       │                                                      │
│       ▼                                                      │
│  POST /tracking/location                                     │
│       │                                                      │
│       ├── Write to Redis: rider:{id}:location               │
│       │                                                      │
│       └── Publish to Redis channel: order:{orderId}:tracking│
│                 │                                            │
│                 ▼                                            │
│  Socket.io server subscribes to Redis channel               │
│                 │                                            │
│  ┌──────────────▼──────────────────────────────────────┐   │
│  │  Room: order:{orderId}                               │   │
│  │  Members: customer app, restaurant portal           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Order status changes:                                       │
│  Backend → emit to room: order:{orderId}:status_change      │
│  → Customer app updates tracking screen                     │
│  → Restaurant portal updates order queue                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Integration with ReviewRise

After delivery completion:
1. `delivery_orders` status → `DELIVERED`
2. BullMQ job queued: `reviewrise_trigger`
3. BILLING reviewrise module fires (already built)
4. Customer receives WhatsApp/SMS review request
5. ReviewRise funnel handles rating → Google redirect

This is **zero new code** — reuses the entire existing ReviewRise pipeline.

---

## 6. Folder Structure (New Mobile Apps)

```
food-delivery/
├── apps/
│   ├── customer-app/          ← Expo app (customer)
│   │   ├── app/               ← Expo Router file-based routing
│   │   │   ├── (auth)/        ← Unauthenticated routes
│   │   │   ├── (tabs)/        ← Main tab navigation
│   │   │   │   ├── index.tsx  ← Home: restaurant feed
│   │   │   │   ├── search.tsx ← Restaurant search
│   │   │   │   ├── orders.tsx ← Order history
│   │   │   │   └── account.tsx
│   │   │   ├── restaurant/[id]/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   └── track/[orderId]/
│   │   ├── components/        ← Shared UI components
│   │   ├── stores/            ← Zustand stores
│   │   ├── hooks/             ← Custom hooks
│   │   └── lib/               ← API client, utils
│   │
│   ├── rider-app/             ← Expo app (rider)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx  ← Available orders
│   │   │   │   ├── active.tsx ← Current delivery
│   │   │   │   └── earnings.tsx
│   │   │   └── delivery/[orderId]/
│   │   ├── components/
│   │   ├── stores/
│   │   └── lib/
│   │
│   └── shared/                ← Shared types, utils, API client
│       ├── types/
│       ├── api/
│       └── hooks/
│
├── backend/                   ← Extends BILLING NestJS backend
│   └── src/modules/
│       ├── food-delivery/     ← NEW: order workflow
│       ├── riders/            ← NEW: rider management
│       ├── zones/             ← NEW: delivery zones
│       └── tracking/          ← NEW: GPS tracking
│
└── eas.json                   ← EAS Build configuration
```

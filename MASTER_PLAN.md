# GoLocal Food Delivery — Master Plan
**Date:** 2026-05-21  
**Status:** Research Complete → Ready for Implementation  
**Analyst:** Lead Architecture + Research AI

---

## EXECUTIVE SUMMARY

After deep analysis of both existing codebases (GoLocal eCommerce + ReviewRise Billing OS) and comprehensive web research into 2025-2026 technology stacks, this document presents the definitive architecture for a production-grade food delivery ecosystem.

**The most important finding:** The existing BILLING NestJS backend provides ~3-4 months of pre-built infrastructure that is directly applicable to food delivery. Building on top of it — not replacing it or working around it — is the single biggest effort multiplier available.

**MVP timeline: 10 weeks**  
**Team: 2-3 engineers**  
**Effort savings vs starting from scratch: 60-70%**

---

## SYSTEM ARCHITECTURE

### Four Products

```
1. CUSTOMER APP          — Expo React Native (iOS + Android)
2. RIDER APP             — Expo React Native (iOS + Android)
3. RESTAURANT PORTAL     — Next.js 14 web (extend BILLING frontend)
4. SUPER ADMIN           — Next.js 14 web (extend BILLING super-admin)
```

### One Backend (Extended BILLING NestJS)

```
Existing (DO NOT TOUCH):
  auth, tenants, products, customers, invoices, analytics,
  branches, devices, reviewrise, stripe, plugins, super-admin,
  sync, redis, BullMQ, Socket.io

New (ADD):
  food-delivery (order lifecycle)
  riders (rider management + earnings)
  zones (delivery zones + opening hours)
  tracking (real-time GPS via Redis Pub/Sub → Socket.io)
```

---

## FINAL TECHNOLOGY STACK

### Mobile (Customer + Rider Apps)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Expo SDK 53 + EAS | OTA updates, single codebase, App Store safe |
| Navigation | Expo Router v3 | File-based, automatic deep links |
| Styling | NativeWind v4 | Tailwind syntax (912k/week downloads) |
| Animations | Reanimated v3 + Lottie + Moti | 60fps native thread animations |
| State | Zustand | Already in BILLING frontend |
| Data fetching | TanStack Query | Cache, background refetch |
| Storage | MMKV | 10x faster than AsyncStorage |
| Maps | react-native-maps | 16k stars, industry standard |
| Auth | BILLING JWT (extended) | Reuse existing, no new cost |
| Payments | Stripe React Native | App Store compliant, Apple/Google Pay |
| Notifications | expo-notifications | Free, 41ms latency |
| OTA | EAS Update | Only compliant option (CodePush is dead) |

### Backend

| Layer | Choice | Reason |
|---|---|---|
| Framework | NestJS (extend BILLING) | 15 modules already built |
| Database | PostgreSQL + PostGIS | Existing + geo queries |
| Queue | BullMQ (existing) | Extend with delivery queues |
| Real-time | Socket.io (existing) + Redis Pub/Sub | Rider tracking |
| ORM | Prisma (existing) | Add delivery migrations |
| Payments | Stripe + Stripe Connect | Orders + payouts |
| SMS OTP | Twilio | Rider/customer phone auth |
| Deployment | Railway | Managed, WebSocket support |

### Frontend (Portals)

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (extend BILLING) | 11 pages + design system already built |
| Deployment | Vercel | Automatic, CDN |
| Components | shadcn/ui + Framer Motion | Already in BILLING |
| Real-time | Socket.io client (existing) | Extend for delivery events |

---

## KEY ARCHITECTURAL DECISIONS (Summary)

1. **Extend BILLING, not Medusa** — BILLING's multi-tenant + NestJS maps perfectly to multi-restaurant
2. **Expo over React Native CLI** — EAS Update is the only OTA solution post-CodePush death
3. **NativeWind over Tamagui** — 10x more downloads, team knows Tailwind
4. **Custom JWT over Clerk** — Existing auth system, no monthly cost, full multi-tenant support
5. **Redis Pub/Sub over Firebase** — Already running in BILLING, zero new infrastructure
6. **Monolith first** — Add modules to existing NestJS, split to microservices when needed
7. **PostGIS for zones** — Sub-10ms geographic queries with spatial indexes
8. **ReviewRise = zero effort** — Existing module fires on delivery completion automatically

---

## REUSE SCORECARD

| BILLING Component | Food Delivery Use | Effort to Reuse |
|---|---|---|
| NestJS backend | Foundation | ZERO — already running |
| Auth/JWT | Restaurant + rider + customer login | LOW — add 2 roles |
| PostgreSQL multi-tenant | Multi-restaurant | ZERO — already schema-per-tenant |
| Products/categories | Menu management | ZERO — direct reuse |
| Customers | Food delivery CRM | ZERO — direct reuse |
| Analytics | Restaurant dashboard | LOW — extend charts |
| Branches | Restaurant locations | ZERO — direct reuse |
| ReviewRise | Post-delivery reviews | ZERO — call existing trigger |
| Stripe | Restaurant subscriptions | ZERO — already working |
| Redis/BullMQ | Delivery queues | LOW — add new queue names |
| Socket.io | Order tracking | LOW — add new events |
| Next.js frontend | Restaurant portal | LOW — add 5 pages |
| shadcn design system | Portal UI | ZERO — already styled |
| Super admin | Platform management | LOW — add delivery metrics |

---

## GITHUB REPOS TO STUDY

| Repo | Stars | Use |
|---|---|---|
| enatega/food-delivery-multivendor | 1,200+ | Architecture reference, rider app patterns |
| adrianhajdin/food_ordering | 308 | Customer app code quality reference |
| anchetaWern/React-Native-Food-Delivery | 283 | Real-time tracking implementation |
| medusajs/medusa-eats | 247 | Order workflow state machine |

---

## MVP ROADMAP (10 WEEKS)

```
WEEK 1-2:  Foundation
  → Database migrations (PostGIS, new tables)
  → New NestJS module skeletons
  → Customer + rider auth endpoints
  → Expo app scaffolds (both apps)

WEEK 3-4:  Core Ordering
  → Restaurant browse API
  → Menu API
  → Zone coverage check
  → Order placement
  → Stripe payment flow
  → Customer app: home → restaurant → cart → checkout

WEEK 5-6:  Rider + Real-time
  → Rider availability + assignment
  → Socket.io tracking gateway
  → Redis Pub/Sub location broadcasting
  → Rider app: orders feed → active delivery → earnings
  → Customer app: live tracking screen

WEEK 7-8:  Restaurant Portal
  → /portal/orders (Kanban live queue)
  → /portal/zones (zone editor)
  → /portal/hours (opening hours)
  → Dashboard delivery metrics widget

WEEK 9:    Integration + Polish
  → End-to-end test all 3 apps
  → Stripe refund flows
  → ReviewRise delivery trigger
  → Error handling + Sentry

WEEK 10:   App Store Submission
  → EAS Production builds
  → App Store Connect submission
  → Play Store submission
  → Soft launch (1 city, curated restaurants)
```

---

## DOCUMENTATION INDEX

```
travel food/
├── MASTER_PLAN.md                    ← THIS FILE
├── research/
│   └── CODEBASE_ANALYSIS.md          ← Both codebases deep analysis
├── architecture/
│   └── OVERVIEW.md                   ← System architecture diagram + decisions
├── mobile/
│   └── MOBILE_STACK.md               ← Complete Expo stack with code examples
├── backend/
│   └── BACKEND_ARCHITECTURE.md       ← NestJS extensions + full DB schema
├── rider/
│   └── RIDER_APP.md                  ← Rider app screens + GPS tracking
├── restaurant-portal/
│   └── RESTAURANT_PORTAL.md          ← Portal pages (existing + new)
├── repos/
│   └── GITHUB_REPOS.md               ← All reference repos with evaluation
├── animations/
│   └── ANIMATION_SYSTEM.md           ← Reanimated + Lottie + Moti patterns
├── appstore-approval/
│   └── APP_STORE_GUIDE.md            ← Approval checklist (both stores)
├── payments/
│   └── PAYMENT_STACK.md              ← Stripe flow with code examples
├── maps/
│   └── MAPS_GUIDE.md                 ← Maps + live tracking + PostGIS
├── auth/
│   └── AUTH_STRATEGY.md              ← JWT extension + OTP + Apple Sign-In
├── notifications/
│   └── NOTIFICATION_STRATEGY.md      ← Push notification implementation
├── decisions/
│   └── ARCHITECTURE_DECISIONS.md     ← 10 ADRs with rationale
├── pos-integration/
│   └── POS_INTEGRATION.md            ← BILLING POS ↔ food delivery integration
├── integration-plans/
│   └── INTEGRATION_PLAN.md           ← Three-system integration plan
├── implementation-roadmap/
│   └── MVP_ROADMAP.md                ← 10-week sprint plan
├── deployment/
│   └── DEPLOYMENT_STRATEGY.md        ← Railway + Vercel + EAS setup
├── comparisons/
│   └── FRAMEWORK_COMPARISON.md       ← Head-to-head library comparisons
└── risks/
    └── RISKS.md                      ← Risk register with mitigations
```

---

## HOW TO START TOMORROW

### Day 1 Actions (Backend Engineer)
```bash
# 1. Enable PostGIS on development DB
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# 2. Create new NestJS module files
cd BILLING/backend/src/modules
mkdir food-delivery riders zones tracking

# 3. Create Prisma migration for new tables
# Add tables: restaurant_settings, delivery_zones, opening_hours,
#             delivery_orders, riders, rider_earnings

# 4. Run migration
npx prisma migrate dev --name add_food_delivery
```

### Day 1 Actions (Mobile Engineer)
```bash
# 1. Create Expo apps
npx create-expo-app customer-app --template blank-typescript
npx create-expo-app rider-app --template blank-typescript

# 2. Install core packages
cd customer-app
npx expo install nativewind react-native-reanimated react-native-gesture-handler
npx expo install expo-router expo-location react-native-maps
npx expo install @tanstack/react-query zustand react-native-mmkv
npx expo install @stripe/stripe-react-native expo-notifications
npx expo install expo-secure-store expo-haptics lottie-react-native

# 3. Configure EAS
eas init
eas build:configure

# 4. Install dev client
eas build --platform all --profile development
```

### Week 1 Goal
- Both mobile apps run on physical devices
- BILLING backend starts with new empty modules
- Database has new food delivery tables
- Customer can register/login via phone OTP

---

## LONG-TERM SCALABLE ROADMAP

```
Q3 2026 (Post-MVP):
  • Promo codes + discounts
  • Multiple saved addresses
  • Item customizations (extras, notes)
  • Restaurant search + filters
  • Rating system

Q4 2026:
  • Scheduled orders
  • Loyalty points
  • Multiple payment methods (wallet)
  • Rider payout via Stripe Connect
  • Marketing push notifications (OneSignal)

2027:
  • Multi-restaurant cart
  • Grocery delivery vertical
  • Platform-level rider pool (riders shared across restaurants)
  • AI-powered ETA prediction
  • Dynamic pricing (surge pricing)
  • B2B corporate ordering
  • Plugin marketplace (restaurants add features)
```

---

*Last updated: 2026-05-21 | This document should be updated after each sprint*

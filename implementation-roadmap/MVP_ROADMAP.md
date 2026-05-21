# MVP Roadmap — Food Delivery Ecosystem
**Date:** 2026-05-21  
**Target MVP:** 10 weeks  
**Goal:** First live delivery from a real restaurant to a real customer

---

## MILESTONE OVERVIEW

```
Week 1-2:   Foundation (backend extensions, mobile scaffolds)
Week 3-4:   Core flows (ordering, zone checking)
Week 5-6:   Rider system + real-time tracking
Week 7-8:   Restaurant portal delivery pages
Week 9:     Integration testing + payments
Week 10:    App Store submission + soft launch
```

---

## PHASE 1: FOUNDATION (Week 1-2)

### Backend
**Priority: Get the database and API ready**

- [ ] Add PostGIS extension to PostgreSQL
- [ ] Create Prisma migrations for new tables:
  - `restaurant_settings`
  - `delivery_zones`
  - `opening_hours`
  - `delivery_orders`
  - `riders`
  - `rider_earnings`
- [ ] Add `customer` and `rider` roles to BILLING auth RBAC
- [ ] Create `food-delivery` NestJS module (skeleton)
- [ ] Create `riders` NestJS module (skeleton)
- [ ] Create `zones` NestJS module (skeleton)
- [ ] Create `tracking` NestJS module (skeleton)
- [ ] Implement customer auth endpoints (OTP phone auth)
- [ ] Implement rider auth endpoints

**Deliverable:** Running local backend with all new tables + auth working

### Mobile
**Priority: Expo project setup**

- [ ] Initialize `customer-app` with Expo SDK 53
- [ ] Initialize `rider-app` with Expo SDK 53
- [ ] Configure NativeWind v4 in both apps
- [ ] Configure Expo Router v3 file structure
- [ ] Configure MMKV storage
- [ ] Set up TanStack Query + Zustand stores
- [ ] Set up API client with auto-refresh interceptor
- [ ] Configure EAS Build (eas.json with dev/staging/prod profiles)
- [ ] Build custom dev client (includes react-native-maps, MMKV, etc.)

**Deliverable:** Both apps build and run on physical devices

---

## PHASE 2: CORE ORDERING FLOW (Week 3-4)

### Backend
- [ ] Restaurant browse API (`GET /delivery/restaurants` — nearby, open, zone coverage)
- [ ] Menu API (`GET /delivery/menu/:branchId`)
- [ ] Delivery zone check API (`POST /zones/check-coverage`)
- [ ] Order placement API (`POST /delivery/orders`)
- [ ] Order status API (`GET /delivery/orders/:id`)
- [ ] Payment Intent creation (`POST /delivery/payment-intent`)
- [ ] Stripe webhook handler (confirm payment → update order status)
- [ ] Restaurant notification on new order (Socket.io + push)

### Customer App
- [ ] Home screen (restaurant cards with skeleton loaders)
- [ ] Restaurant detail page (menu sections + items)
- [ ] Add to cart + cart state (Zustand)
- [ ] Cart screen (items, totals, delivery fee)
- [ ] Address selection (Google Places autocomplete)
- [ ] Checkout screen (order summary + payment)
- [ ] Stripe Payment Sheet integration
- [ ] Order placed confirmation + Lottie animation

**Deliverable:** Customer can browse → add to cart → pay → order placed

---

## PHASE 3: RIDER SYSTEM + REAL-TIME (Week 5-6)

### Backend
- [ ] Available rider API (`GET /riders/available`)
- [ ] Rider assignment logic (auto-assign closest rider)
- [ ] Order status update endpoints (confirm, preparing, ready, picked up, delivered)
- [ ] Rider location endpoint (`POST /tracking/location`)
- [ ] Redis Pub/Sub for location broadcasting
- [ ] Socket.io gateway: `join_order_room`, `rider_location_update`, order status events
- [ ] Push notifications: all order status transitions

### Rider App
- [ ] Auth (phone OTP)
- [ ] Available orders feed (list of nearby orders to accept)
- [ ] Order accept/decline flow
- [ ] Active delivery screen (map with route)
- [ ] GPS broadcast while on delivery (expo-location watchPosition)
- [ ] Pickup confirmation UI
- [ ] Delivery confirmation + photo/signature (optional MVP)
- [ ] Earnings dashboard (today/week/month)

### Customer App
- [ ] Live tracking screen (map + rider position)
- [ ] Order status timeline
- [ ] Socket.io real-time updates
- [ ] ETA display (calculated from distance)
- [ ] Rating screen after delivery

**Deliverable:** End-to-end delivery: customer orders → rider picks up → customer tracks live → delivered

---

## PHASE 4: RESTAURANT PORTAL (Week 7-8)

### Portal (extends BILLING Next.js frontend)
- [ ] `/portal/orders` — Live incoming orders queue (Socket.io)
  - Ring notification for new orders
  - Accept/reject with one click
  - Set prep time
  - Mark as ready for pickup
- [ ] `/portal/zones` — Delivery zone editor
  - Draw zones on map
  - Set delivery fee per zone
  - Enable/disable zones
- [ ] `/portal/hours` — Opening hours
  - Day-by-day schedule
  - "Accepting orders" quick toggle
- [ ] Extend `/portal/dashboard` — Add delivery metrics widget
- [ ] Extend `/portal/analytics` — Delivery vs dine-in breakdown

**Deliverable:** Restaurant can manage incoming delivery orders and configure delivery settings

---

## PHASE 5: INTEGRATION + POLISH (Week 9)

- [ ] End-to-end test: full order lifecycle (all 3 apps)
- [ ] Stripe refund flow (cancellations)
- [ ] ReviewRise post-delivery trigger
- [ ] Cancellation flows (customer, restaurant, rider)
- [ ] Error handling + offline states (no internet)
- [ ] Push notification QA on real devices
- [ ] Performance profiling (animations at 60fps)
- [ ] Sentry error monitoring in all apps

---

## PHASE 6: APP STORE SUBMISSION (Week 10)

### Pre-submission
- [ ] Apple Developer account configured
- [ ] Google Play Console configured
- [ ] Privacy Policy URL live
- [ ] At least 3 test restaurants onboarded
- [ ] Complete test delivery on real devices (iOS + Android)
- [ ] EAS Build production builds

### Submission
- [ ] Customer app → App Store Connect submission
- [ ] Customer app → Play Store submission
- [ ] Rider app → App Store (Internal Testing first)
- [ ] Rider app → Play Store (Internal Testing first)

**Deliverable:** Apps submitted to both stores

---

## POST-MVP BACKLOG (Weeks 11-20)

| Feature | Priority | Effort |
|---|---|---|
| Multiple delivery addresses (saved) | HIGH | LOW |
| Promo codes + discounts | HIGH | MEDIUM |
| Restaurant search + filters | HIGH | MEDIUM |
| Item customizations (notes, extras) | HIGH | MEDIUM |
| Scheduled orders (order for later) | MEDIUM | MEDIUM |
| Rating system for restaurants | MEDIUM | LOW |
| Rating system for riders | MEDIUM | LOW |
| Tip flow (post-delivery) | MEDIUM | LOW |
| Loyalty points | MEDIUM | HIGH |
| Rider earnings weekly payout | MEDIUM | MEDIUM |
| Multi-restaurant cart | LOW | HIGH |
| Subscription (free delivery) | LOW | MEDIUM |
| AR food preview | LOW | HIGH |
| Chat with restaurant | LOW | MEDIUM |
| Referral program | LOW | MEDIUM |

---

## TEAM STRUCTURE RECOMMENDATION

| Role | Responsibility | Count |
|---|---|---|
| Full-stack engineer | BILLING backend extensions | 1 |
| React Native dev | Customer app + Rider app | 1-2 |
| Frontend dev | Restaurant portal (Next.js) | 1 |
| QA | End-to-end testing | 0.5 |
| Designer | UI/UX for mobile screens | 0.5 |

**Minimum viable team for 10 weeks:** 2-3 engineers

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| App Store rejection (location permissions) | Medium | HIGH | Follow guide strictly, test permissions flow carefully |
| Google Maps API cost overrun | Low | Medium | Set billing alerts at £50/month |
| BILLING backend conflicts | Low | High | Add food delivery in separate modules, don't touch existing |
| Rider supply (no riders at launch) | HIGH | HIGH | Onboard 5+ riders before customer app launch |
| Restaurant quality | Medium | HIGH | Curate first 10 restaurants carefully |
| Stripe Connect UK approval | Low | Medium | Apply for Stripe Connect early (can take days) |
| PostGIS performance | Low | Low | Index spatial columns, monitor query times |

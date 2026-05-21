# Architecture Decision Record (ADR Log)
**Date:** 2026-05-21  
**Format:** ADR (Architecture Decision Records)

---

## ADR-001: Extend BILLING NestJS Backend (Not Medusa, Not New Backend)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Three options existed for the food delivery backend:
1. Extend GoLocal's Medusa v2 backend
2. Build a new NestJS backend from scratch
3. Extend the existing BILLING NestJS backend

**Decision:** Extend BILLING NestJS backend.

**Rationale:**
- BILLING backend has 15+ production-ready modules: auth, tenants, products, customers, analytics, reviewrise, stripe, branches, devices, plugins, super-admin — all directly applicable
- Multi-tenant PostgreSQL schema model maps perfectly to multi-restaurant marketplace
- ReviewRise integration = automatic post-delivery reviews with zero new code
- Redis + BullMQ + Socket.io already running — real-time delivery tracking infrastructure ready
- Stripe module already built — restaurant subscription billing
- 3-4 months of backend engineering already done
- Medusa is single-tenant eCommerce, not a multi-restaurant marketplace — forcing food delivery on it would be architectural malpractice

**What we add:** 4 new NestJS modules: `food-delivery`, `riders`, `zones`, `tracking`

**Risks:**
- BILLING backend is not 100% complete (65%) — new food delivery work must be disciplined about not breaking existing features
- Multi-tenancy means food delivery customers are platform-level, not tenant-level — requires careful schema design

---

## ADR-002: Expo + EAS (Not React Native CLI)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Two options for mobile framework:
1. Expo (managed/bare workflow) + EAS Build + EAS Update
2. React Native CLI with bare workflow

**Decision:** Expo with EAS Build and EAS Update.

**Rationale:**
- EAS Build: single-command iOS and Android builds without Xcode/Android Studio expertise
- EAS Update: OTA hotfixes in hours (CodePush was deprecated March 2025 — no alternative)
- Expo Router v3: file-based navigation = Next.js-like DX the team already knows
- 99% of production requirements covered without native code
- New Architecture (Fabric) enabled by default in SDK 53+
- App Store compliance: EAS Update is compliant for JS/asset changes

**Risks:**
- Some native features (background geolocation for rider app) require custom dev client
- Expo Go cannot run apps with MMKV, background location, or Stripe native SDK

**Mitigation:** Use `expo-dev-client` for development builds from day one (not Expo Go)

---

## ADR-003: NativeWind v4 for Mobile Styling (Not Tamagui or Unistyles)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Three viable options for React Native styling:
1. NativeWind v4 (Tailwind CSS syntax)
2. Tamagui v1.1 (universal design system)
3. Unistyles v3 (minimal runtime)

**Decision:** NativeWind v4

**Rationale:**
- 912,000 weekly npm downloads vs 90k (Tamagui) vs 68k (Unistyles)
- Team already knows Tailwind CSS from BILLING frontend and GoLocal storefront
- Build-time compilation = zero runtime performance cost
- Easiest onboarding for any full-stack developer
- Active development, v4 is mature stable

**Risks:**
- Not a full design system (no animation tokens built-in)
- For complex animations, still need Reanimated separately

---

## ADR-004: Custom JWT Auth (Not Clerk/Firebase/Supabase)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for mobile auth:
1. Clerk (@clerk/expo)
2. Firebase Auth
3. Supabase Auth
4. Extend existing BILLING JWT auth

**Decision:** Extend existing BILLING JWT auth.

**Rationale:**
- BILLING already has complete auth: JWT, refresh tokens, device tokens, RBAC
- Adding Clerk = $99+/month cost, external dependency, migration complexity
- Multi-tenant model requires tenant context in tokens — Clerk doesn't natively support this
- Adding `customer` and `rider` roles to existing RBAC is minimal effort
- Full control over token claims, refresh strategy, and revocation

**What we add:**
- `customer` role in RBAC
- `rider` role in RBAC
- Phone OTP endpoints (Twilio SMS)
- Apple Sign-In endpoint
- Google OAuth endpoint

**Note:** If there were no existing backend, Clerk would be the recommendation.

---

## ADR-005: Expo Notifications (Not OneSignal or FCM directly)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for push notifications:
1. Expo Notifications (wraps APNs + FCM via Expo servers)
2. OneSignal
3. Firebase Cloud Messaging directly

**Decision:** Expo Notifications for MVP, with OneSignal evaluation at 10k+ users.

**Rationale:**
- Free with Expo (no per-message cost)
- 41ms median latency (vs 221ms OneSignal)
- Simplest integration in Expo apps
- No vendor lock-in for core transactional notifications
- If marketing segmentation needed later, add OneSignal independently

**Risks:**
- No built-in segmentation (can't send "all users in London" without custom DB query)
- If Expo push service has outage, notifications fail — mitigate with fallback FCM direct

---

## ADR-006: react-native-maps (Not Mapbox or expo-maps)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for maps:
1. react-native-maps (Google Maps + Apple Maps)
2. Mapbox (react-native-mapbox-maps)
3. expo-maps (new, alpha)

**Decision:** react-native-maps v1.27+ with Google Maps provider.

**Rationale:**
- 16k GitHub stars, 96k weekly downloads — industry standard
- Expo compatible with `npx expo install react-native-maps`
- Google Maps: best UK coverage, accurate directions
- expo-maps is alpha (breaking changes expected) — too risky for production
- Mapbox is cheaper at scale (5x) but adds complexity; evaluate at 100k orders/month

**Switch to Mapbox if:** Monthly Google Maps API costs exceed £200.

---

## ADR-007: Restaurant Portal on Existing BILLING Frontend (Not New App)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for restaurant portal:
1. New dedicated Next.js app
2. Extend BILLING Next.js 14 frontend
3. Expo web (mobile-first)

**Decision:** Extend BILLING Next.js 14 frontend.

**Rationale:**
- BILLING frontend already has: products (menu), customers, analytics, branches, settings
- All 11 pages built with consistent design system (shadcn/ui + Framer Motion + GSAP)
- Same backend API — extend existing pages, add new delivery-specific pages
- Dark glassmorphism design system already matches premium food delivery aesthetic
- Food delivery-specific pages to add: live orders queue, delivery zone config, rider tracking

**What we add:** ~5 new Next.js pages to existing BILLING frontend:
- `/portal/orders` — live incoming orders (real-time via Socket.io)
- `/portal/zones` — delivery zone polygon editor
- `/portal/hours` — opening hours management
- `/portal/riders` — rider oversight
- `/portal/delivery-analytics` — delivery-specific metrics

---

## ADR-008: PostGIS for Geographic Delivery Zones (Not GeoJSON in App)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for delivery zone geographic checks:
1. PostGIS (PostgreSQL extension)
2. App-level polygon math
3. Google Maps Geometry API

**Decision:** PostGIS.

**Rationale:**
- PostgreSQL already in use (BILLING database)
- PostGIS adds geometric `CONTAINS` checks at DB level — single SQL query to check if address is in any zone
- Spatially indexed — sub-10ms for zone lookups even with 1000s of zones
- App-level polygon math is unreliable at scale and moves complexity to the wrong place
- Google Geometry API = per-request cost

---

## ADR-009: Redis Pub/Sub for Real-time Rider Tracking (Not Firebase RTDB)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for live rider location broadcasting:
1. Redis Pub/Sub → Socket.io broadcast
2. Firebase Realtime Database
3. Ably

**Decision:** Redis Pub/Sub → Socket.io for MVP.

**Rationale:**
- Redis already running in BILLING backend (BullMQ uses it)
- Socket.io already installed in BILLING backend (catalog update events)
- Zero new infrastructure: extend existing Socket.io gateway
- Sub-100ms latency for location updates
- Horizontally scalable with Redis Cluster

**If we need to scale:** Replace Redis Pub/Sub with Ably (managed WebSocket at scale).

---

## ADR-010: Monolith First (Not Microservices)

**Date:** 2026-05-21  
**Status:** DECIDED

**Context:**  
Options for service architecture:
1. Monolith (add modules to BILLING NestJS)
2. Microservices from the start (separate services per domain)

**Decision:** Monolith first — add modules to existing NestJS app.

**Rationale:**
- BILLING backend is already a well-structured NestJS monolith
- Microservices require Kubernetes/message bus (RabbitMQ/Kafka) = 2-3 months extra infrastructure
- Food delivery at startup scale (< 10k orders/day) does not need microservices
- NestJS module system provides enough separation to split later if needed
- Split into microservices when specific scaling problems emerge (e.g., tracking service overwhelms main process)

**Split trigger:** When tracking/WebSocket load exceeds 20% of server CPU.

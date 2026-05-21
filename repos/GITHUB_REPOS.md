# GitHub Repositories — Research & Reference
**Date:** 2026-05-21  
**Source:** Web research via agent + verification

---

## TIER 1 — Primary Reference Repos (High Value)

### 1. enatega/food-delivery-multivendor
**URL:** https://github.com/enatega/food-delivery-multivendor  
**Stars:** 1,200+ | **Forks:** 526 | **Last Commit:** Nov 2025 (v2.0.8)  
**License:** MIT (frontend only — backend is proprietary/paid)  
**Tech:** React Native + React.js + Node.js + MongoDB + Firebase + GraphQL + Expo  

**What it contains:**
- Customer app (React Native + Expo)
- Rider/driver app (React Native)
- Restaurant dashboard (React.js)
- Admin panel (React.js)
- GraphQL API

**Why valuable:**
- Multi-vendor marketplace architecture (most complete open-source)
- Three separate mobile apps showing architecture split
- Real-time tracking reference
- Review/rating system reference
- Multi-language, multi-currency

**Effort savings:** Study as architecture reference, especially multi-vendor patterns and rider app structure.

**Limitations:**
- Backend is proprietary — can't use directly
- MongoDB (we use PostgreSQL) 
- GraphQL (we use REST + WebSocket)
- No TypeScript throughout

**App Store safe:** Yes (production apps on stores)  
**Use for:** Architecture reference, UI patterns, rider app flows

---

### 2. adrianhajdin/food_ordering
**URL:** https://github.com/adrianhajdin/food_ordering  
**Stars:** 308 | **Forks:** 152  
**License:** Not specified  
**Tech:** React Native + TypeScript + Expo + NativeWind + Appwrite  

**What it contains:**
- Customer ordering app
- Clean TypeScript architecture (91.9% TypeScript)
- Zustand for state management
- Sentry for error tracking
- Google Auth
- Cart + checkout flow

**Why valuable:**
- Best code quality of all food delivery React Native repos
- Full TypeScript (matches our stack)
- NativeWind styling (matches our choice)
- Zustand (matches BILLING frontend pattern)
- Modern Expo patterns

**Effort savings:** Use as direct code reference for customer app architecture.

**Limitations:**
- Appwrite backend (replace with our NestJS)
- No rider app
- No real-time tracking

**App Store safe:** Yes  
**Use for:** Customer app code patterns, TypeScript structure, cart/checkout flow

---

### 3. anchetaWern/React-Native-Food-Delivery
**URL:** https://github.com/anchetaWern/React-Native-Food-Delivery  
**Stars:** 283 | **Forks:** 177  
**Tech:** React Native + Pusher + Firebase + react-native-maps  

**What it contains:**
- Ordering app
- Driver app
- Server (admin/restaurant)
- Real-time chat
- Live driver tracking with react-native-maps
- Push notifications (Pusher Beams)
- Three-app ecosystem architecture

**Why valuable:**
- Shows the complete 3-app architecture (ordering + driver + restaurant)
- Real-time location tracking implementation
- Driver → customer tracking with animated map markers

**Limitations:**
- No TypeScript
- Pusher dependency (we use Socket.io)
- Older codebase

**App Store safe:** Yes  
**Use for:** Real-time tracking implementation, 3-app architecture patterns

---

### 4. medusajs/medusa-eats
**URL:** https://github.com/medusajs/medusa-eats  
**Stars:** 247 | **Forks:** 76  
**Tech:** Medusa 2.0 + Next.js 14 + TypeScript + Tailwind  

**What it contains:**
- Full order → prep → driver → delivery workflow
- Custom Medusa modules (restaurant, driver, delivery)
- Long-running Medusa Workflows for async order lifecycle
- Real-time updates via Server-Sent Events
- Three user types

**Why valuable:**
- Proves Medusa can be extended for food delivery
- Shows Medusa Workflow patterns for async order state machines
- Official Medusa team project (quality reference)

**Limitations:**
- Demo only — not actively maintained
- Medusa-specific patterns don't transfer to our NestJS backend directly
- No mobile app

**App Store safe:** N/A (web only)  
**Use for:** Order workflow state machine patterns, Medusa integration ideas (if we ever expose food delivery via Medusa)

---

## TIER 2 — Architecture Reference Repos

### 5. vmmmvr/Food-delivery-microservices
**URL:** https://github.com/vmmmvr/Food-delivery-microservices  
**Stars:** Low (early stage)  
**Tech:** NestJS + Docker + RabbitMQ  

**Why valuable:** Shows NestJS microservices pattern for food delivery. Most aligned to our backend stack.  
**Use for:** NestJS module architecture patterns when we need to split services

---

### 6. DavidBarcenas/food-delivery-backend
**URL:** https://github.com/DavidBarcenas/food-delivery-backend  
**Tech:** Node.js  

**Features:** Clients, restaurants, orders, delivery men, mailing  
**Use for:** Backend data model reference

---

### 7. Crunch-Garage/food-delivery
**URL:** https://github.com/Crunch-Garage/food-delivery  
**License:** GNU GPL v3.0  
**Tech:** GoLang + PostgreSQL  

**Why valuable:** PostgreSQL schema design for food delivery, geographic queries  
**Use for:** Database schema patterns for rider assignment

---

## TIER 3 — UI Component / Animation Libraries

### 8. React Native Reanimated
**URL:** https://github.com/software-mansion/react-native-reanimated  
**Stars:** 10,700+  
**Publisher:** Software Mansion  
**Version:** 3.x (v4 in development)  

**Use for:** All animations — cart bounces, skeleton loaders, page transitions, animated map markers

---

### 9. Lottie React Native
**URL:** https://github.com/lottie-react-native/lottie-react-native  
**Stars:** 16,000+  
**Version:** 7.3.6 (published 3 months ago — actively maintained)  
**Expo:** `npx expo install lottie-react-native`  

**Use for:** 
- Order placed success animation
- Loading states
- Empty state illustrations
- Splash screen

**LottieFiles** (source for animations): https://lottiefiles.com/featured  
Search: "food delivery", "order confirmed", "rider", "loading food"  
Cost: Many free, premium from $9/mo

---

### 10. Moti (Declarative Reanimated)
**URL:** https://github.com/nandorojo/moti  
**Stars:** 4,100+  
**Publisher:** Fernando Rojo  

**Use for:** Skeleton loaders (`moti/skeleton`), entrance animations, declarative Reanimated patterns

---

### 11. NativeWind
**URL:** https://github.com/marklawlor/nativewind  
**Stars:** 7,789  
**Weekly downloads:** 912,000+  
**Version:** v4+ (stable)  

**Use for:** All styling in mobile apps. Same Tailwind syntax as web (BILLING frontend, GoLocal storefront).

---

## Admin Dashboard Templates

### 12. satnaing/shadcn-admin (FREE)
**URL:** https://github.com/satnaing/shadcn-admin  
**Stars:** 4,500+  
**Tech:** shadcn/ui + Vite + React + TypeScript + Tailwind  

**Use for:** Restaurant portal base template (free, clean, modern)

---

### 13. BILLING Frontend (Already Built — Our Own)
**Path:** `BILLING/frontend/`  
**Status:** 85% complete  

**Reuse:** Extend this as the restaurant portal. Add delivery-specific pages (orders queue, zone management).  
Already has: Dashboard, analytics, products, customers, branches, settings.

---

## Maps Libraries

### 14. react-native-maps
**URL:** https://github.com/react-native-maps/react-native-maps  
**Stars:** 16,000+  
**Version:** v1.27.2  
**Weekly downloads:** 96,000+  

**Install:** `npx expo install react-native-maps`  
**Config:** Add Google Maps API key to app.json  

**Use for:** Restaurant map on home screen, delivery tracking map, zone visualization

---

### 15. expo-location
**URL:** Built into Expo SDK  
**Version:** SDK 53+  
**Install:** `npx expo install expo-location`  

**Use for:**
- Customer: current location for restaurant search + delivery address
- Rider: GPS broadcast while on delivery

---

## Push Notifications

### 16. expo-notifications (Transactional)
**URL:** Built into Expo SDK  
**Use for:** Order status updates, ETA alerts, delivery confirmation  
**Cost:** Free (Expo servers)

### 17. OneSignal (Future: Marketing)
**URL:** https://github.com/OneSignal/react-native-onesignal  
**Stars:** 1,200+  
**Use for:** Promotional campaigns, re-engagement, abandoned cart recovery  
**Cost:** Free tier (10k subscribers), $9/mo Growth

---

## Auth

### 18. expo-secure-store
**URL:** Built into Expo SDK  
**Use for:** Secure JWT token storage (hardware-backed AES-256 on-device)  
**Pattern:** Store access_token + refresh_token, rotate on 401

---

## Payments

### 19. @stripe/stripe-react-native
**URL:** https://github.com/stripe/stripe-react-native  
**Stars:** 1,900+  
**Publisher:** Stripe (official)  
**Install:** `yarn add @stripe/stripe-react-native`  

**Features:**
- Card payment sheet (Apple Pay + Google Pay native)
- Payment intents
- Setup intents (save card)
- Stripe Connect (rider payouts)

**App Store compliance:** ✅ Fully compliant  

---

## Development Tools

### 20. Reactotron
**URL:** https://github.com/infinitered/reactotron  
**Stars:** 14,500+  
**Use for:** Debug API calls, state inspection, async storage

### 21. @sentry/react-native
**URL:** https://github.com/getsentry/sentry-react-native  
**Use for:** Crash reporting, performance monitoring  
**Cost:** Free tier (generous), $26/mo team

---

## Summary Table

| Repo | Stars | Primary Use | Effort Savings |
|---|---|---|---|
| enatega/food-delivery-multivendor | 1.2k | Multi-vendor architecture reference | HIGH |
| adrianhajdin/food_ordering | 308 | Customer app code patterns | HIGH |
| anchetaWern/React-Native-Food-Delivery | 283 | Real-time tracking patterns | MEDIUM |
| medusajs/medusa-eats | 247 | Order workflow reference | MEDIUM |
| react-native-reanimated | 10.7k | Animations (required) | HIGH |
| lottie-react-native | 16k | Micro-animations | MEDIUM |
| nativewind | 7.8k | Styling (required) | HIGH |
| moti | 4.1k | Skeleton loaders | LOW |
| react-native-maps | 16k | Maps (required) | HIGH |
| stripe/stripe-react-native | 1.9k | Payments (required) | HIGH |
| satnaing/shadcn-admin | 4.5k | Restaurant portal template | MEDIUM |

# Framework Comparisons — Final Decisions
**Date:** 2026-05-21  
**Source:** Web research (2025-2026 data) + codebase analysis

---

## 1. Mobile Framework

| | Expo + EAS | React Native CLI | Flutter |
|---|---|---|---|
| iOS + Android one codebase | ✅ | ✅ | ✅ |
| OTA updates | ✅ EAS Update | ❌ CodePush dead | ❌ |
| App Store approval ease | ✅ High | Medium | Medium |
| Team knowledge (JS/TS) | ✅ Full reuse | ✅ Full reuse | ❌ New language |
| Animation quality | ✅ Reanimated | ✅ Reanimated | ✅ Native |
| Build complexity | ✅ EAS cloud | ❌ Xcode/Android needed | Medium |
| Expo Go for demo | ✅ Instant | ❌ Manual setup | ❌ |
| Ecosystem | ✅ Huge | ✅ Huge | Large |
| Maintenance | ✅ Low | Medium | Medium |
| **DECISION** | **✅ CHOSEN** | | |

---

## 2. Styling Library

| | NativeWind v4 | Tamagui v1.1 | Unistyles v3 |
|---|---|---|---|
| Weekly downloads (npm) | 912,000 | 90,000 | 68,000 |
| GitHub stars | 7,789 | 13,568 | 2,730 |
| Team familiarity | ✅ Tailwind = yes | ❌ New API | ❌ New API |
| Performance | ✅ Compile-time | ✅ Compiler-based | ✅ Minimal runtime |
| Animation support | Reanimated | Built-in (compiler) | Reanimated |
| Design system | Manual | Built-in | Manual |
| Documentation | Good | Excellent | Good |
| **DECISION** | **✅ CHOSEN** | | |

---

## 3. Navigation

| | Expo Router v3 | React Navigation v7 |
|---|---|---|
| File-based routing | ✅ Yes | ❌ Config-based |
| Deep links | ✅ Automatic | Manual |
| TypeScript | ✅ Built-in | ✅ Good |
| Team familiarity | ✅ Next.js parallel | New API |
| Deep linking for orders | ✅ Automatic | Manual |
| Tab + stack + modal | ✅ | ✅ |
| Web compatibility | ✅ | ❌ |
| **DECISION** | **✅ CHOSEN** | |

---

## 4. State Management

| | Zustand | Jotai | Redux Toolkit |
|---|---|---|---|
| Already in BILLING frontend | ✅ Yes | ❌ No | ❌ No |
| Bundle size | ✅ <1kb | ✅ Small | ❌ Large |
| Boilerplate | ✅ None | ✅ None | ❌ High |
| Async/server state | Via TanStack Query | Via TanStack Query | Built-in RTK Query |
| Persistence (MMKV) | ✅ Easy | Medium | Medium |
| Learning curve | ✅ Minimal | Low | Medium |
| **DECISION** | **✅ CHOSEN** | | |

---

## 5. Maps

| | react-native-maps | Mapbox | expo-maps |
|---|---|---|---|
| GitHub stars | 16,000 | 1,500 | N/A (Expo SDK) |
| Weekly downloads | 96,000 | N/A | N/A |
| Expo compatibility | ✅ Full | Medium | ✅ Full (alpha) |
| UK coverage quality | ✅ Google Maps | ✅ Good | ✅ Google/Apple |
| Pricing (10k orders/day) | ~£100-200/mo | ~£20-40/mo | Free (Apple) / paid (Google) |
| Background tracking | Via expo-location | Via Mapbox SDK | Via expo-location |
| Stability | ✅ Production | ✅ Production | ❌ Alpha |
| **DECISION** | **✅ CHOSEN (switch to Mapbox at scale)** | | |

---

## 6. Authentication

| | Extend BILLING JWT | Clerk | Firebase Auth | Supabase Auth |
|---|---|---|---|---|
| Cost | Free (existing) | $99+/mo | Free tier | Free tier |
| Already integrated | ✅ 15 modules | ❌ New | ❌ New | ❌ New |
| Multi-tenant support | ✅ Native | ❌ Manual | ❌ Manual | ❌ Manual |
| Phone OTP | Add Twilio | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Apple Sign-In | Add | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Expo support | ✅ | ✅ Excellent | Good | Good |
| Maintenance burden | Low | Low | Low | Low |
| **DECISION** | **✅ CHOSEN** | | | |

---

## 7. Push Notifications

| | expo-notifications | OneSignal | Firebase FCM |
|---|---|---|---|
| Cost | Free | Free/paid | Free |
| Latency | 41ms median | 221ms median | Variable |
| Integration complexity | ✅ Minimal | Medium | High |
| Marketing features | ❌ None | ✅ Excellent | ❌ None |
| Reliability | Good | ✅ Excellent | ✅ Excellent |
| iOS compliance | ✅ | ✅ | ✅ |
| **DECISION** | **✅ CHOSEN (MVP)** | Future add-on | |

---

## 8. Backend for Delivery Layer

| | Extend BILLING NestJS | Medusa v2 | New NestJS |
|---|---|---|---|
| Time to production | ✅ 6-8 weeks | 12-16 weeks | 14-18 weeks |
| Auth built | ✅ Complete | ✅ Complete | ❌ Build |
| Multi-tenant | ✅ Schema-per-tenant | ❌ Single tenant | ❌ Build |
| Analytics | ✅ Complete | ❌ Basic | ❌ Build |
| ReviewRise | ✅ Complete | ❌ Not applicable | ❌ Build |
| Stripe subscriptions | ✅ Complete | ❌ | ❌ Build |
| Real-time (Socket.io) | ✅ Installed | ❌ SSE only | ❌ Build |
| Redis + BullMQ | ✅ Running | Partial | ❌ Build |
| **DECISION** | **✅ CHOSEN** | | |

---

## 9. Real-time Tracking

| | Redis Pub/Sub → Socket.io | Firebase RTDB | Ably |
|---|---|---|---|
| Infrastructure required | Redis (already running) | Firebase project | Ably account |
| Cost at 1k orders/day | Free (existing Redis) | Free tier | ~$10/mo |
| Cost at 100k orders/day | Redis Cluster ($50/mo) | ~$50/mo | ~$200/mo |
| Latency | <50ms | ~100-300ms | <100ms |
| Message ordering | ✅ Redis Streams | ❌ Not guaranteed | ✅ Guaranteed |
| Development complexity | Medium | ✅ Low | Low |
| **DECISION** | **✅ CHOSEN (MVP)** | | Migrate at scale |

---

## 10. OTA Update Solution

| | EAS Update | CodePush | Capgo |
|---|---|---|---|
| Status | ✅ Active | ❌ DEPRECATED Mar 2025 | Active |
| App Store compliant | ✅ | Was ✅, now dead | ✅ |
| Expo integration | ✅ Native | N/A | Good |
| Cost | Free tier | Dead | $14+/mo |
| **DECISION** | **✅ CHOSEN** | DO NOT USE | |

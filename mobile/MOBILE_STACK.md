# Mobile Stack — Customer App + Rider App
**Date:** 2026-05-21  
**Decision:** FINAL  
**Framework:** Expo + React Native

---

## 1. Framework Decision: Expo + EAS

**Chosen:** Expo SDK 53+ with EAS Build + EAS Update

**Why Expo over React Native CLI:**
- Single command builds iOS + Android via EAS Build
- OTA updates via EAS Update (CodePush deprecated March 2025)
- 99% of production requirements covered without native code
- New Architecture (Fabric) enabled by default
- Managed workflow eliminates Xcode/Android Studio friction
- Active Expo team development, best DX in 2025

**Why NOT bare React Native CLI:**
- No OTA update solution (CodePush is dead)
- Xcode/Android Studio expertise required on CI
- No competitive advantage for food delivery use case

---

## 2. Full Technology Stack

```
apps/
├── customer-app/   (Expo SDK 53+)
└── rider-app/      (Expo SDK 53+)
```

### Core Framework
| Package | Version | Role |
|---|---|---|
| `expo` | SDK 53+ | Core framework |
| `expo-router` | v3+ | File-based navigation |
| `react-native` | 0.77+ | Underlying framework |
| `typescript` | 5.x | Type safety |

### Navigation
| Package | Role |
|---|---|
| `expo-router` | Primary navigation (file-based) |
| `@expo/vector-icons` | Icon set (Ionicons, MaterialIcons) |

### Styling & UI
| Package | Version | Role |
|---|---|---|
| `nativewind` | v4+ | Tailwind CSS for React Native (912k/week downloads) |
| `tailwindcss` | 3.x | Config via tailwind.config.js |
| `react-native-safe-area-context` | latest | Safe area insets |
| `react-native-gesture-handler` | latest | Pan, swipe, pinch gestures |
| `react-native-reanimated` | v3/4 | 60fps animations on native thread |

### Animations
| Package | Role |
|---|---|
| `react-native-reanimated` v3+ | Cart bounce, screen transitions, skeleton loaders |
| `lottie-react-native` | Micro-animations (loading, success, order placed) |
| `moti` | Declarative Reanimated wrappers (skeleton loaders, entrance animations) |

### State Management
| Package | Role |
|---|---|
| `zustand` | Global state (cart, user, order) — same as BILLING frontend |
| `@tanstack/react-query` | Server state, caching, background refetch |
| `react-native-mmkv` | Fast persistent storage (10x faster than AsyncStorage) |

### Maps & Location
| Package | Role |
|---|---|
| `react-native-maps` | v1.27+ — Map display, restaurant pins, rider tracking |
| `expo-location` | Customer location, rider GPS broadcast |
| `react-native-background-geolocation` | Rider background GPS (requires custom dev build) |

### Networking
| Package | Role |
|---|---|
| `axios` / `ky` | HTTP client |
| `socket.io-client` | WebSocket (order tracking, live updates) |
| `@tanstack/react-query` | Query/mutation caching |

### Authentication
| Package | Role |
|---|---|
| Custom JWT | Reuse BILLING NestJS auth — no 3rd party needed |
| `expo-secure-store` | Token storage (AES-256 hardware-backed) |
| `expo-auth-session` | OAuth flows (Google, Apple Sign-In) |
| `expo-apple-authentication` | Apple Sign-In (required by App Store) |

> **Why not Clerk?** BILLING already has a complete JWT auth system with device tokens, refresh tokens, and RBAC. Adding Clerk would introduce a dependency and monthly cost while duplicating existing infrastructure. We extend the existing auth by adding a `customer` and `rider` role.

### Payments
| Package | Role |
|---|---|
| `@stripe/stripe-react-native` | Card collection, payment intents |
| Native Apple Pay (via Stripe) | Apple Pay for iOS |
| Native Google Pay (via Stripe) | Google Pay for Android |

### Push Notifications
| Package | Role |
|---|---|
| `expo-notifications` | Transactional alerts (order status, ETA updates) |
| Expo Push Token | Server sends to `/api/notify` → Expo server → APNs/FCM |

### Media
| Package | Role |
|---|---|
| `expo-image` | Optimized image loading with caching (replaces FastImage) |
| `expo-blur` | Blur effects for modals, glass cards |

### Utilities
| Package | Role |
|---|---|
| `date-fns` | Date/time formatting |
| `react-native-phone-number-input` | Phone input with country code |
| `@react-native-community/netinfo` | Network status (online/offline) |
| `expo-haptics` | Haptic feedback (add to cart, confirm, etc.) |
| `expo-clipboard` | Copy order/tracking IDs |

### Dev Tools
| Package | Role |
|---|---|
| `expo-dev-client` | Custom dev builds for Expo |
| `@sentry/react-native` | Error monitoring |
| `reactotron-react-native` | Debug inspector |

---

## 3. Expo Router v3 Navigation Structure

### Customer App
```
app/
├── _layout.tsx              ← Root layout (providers, Stripe, auth guard)
├── (auth)/
│   ├── _layout.tsx          ← Auth stack layout
│   ├── login.tsx            ← Phone/email login
│   ├── register.tsx         ← Registration
│   └── verify.tsx           ← OTP verification
├── (tabs)/
│   ├── _layout.tsx          ← Bottom tab bar
│   ├── index.tsx            ← Home: restaurant feed
│   ├── search.tsx           ← Search restaurants + dishes
│   ├── orders.tsx           ← Order history
│   └── account.tsx          ← Profile, addresses, preferences
├── restaurant/
│   └── [id]/
│       ├── index.tsx        ← Restaurant page (menu + info)
│       └── item/[itemId].tsx ← Item detail + customization
├── cart/
│   └── index.tsx            ← Cart review + promo codes
├── checkout/
│   ├── address.tsx          ← Delivery address selection
│   ├── payment.tsx          ← Payment method + order summary
│   └── confirm.tsx          ← Order placed confirmation
└── track/
    └── [orderId].tsx        ← Live order tracking map
```

### Rider App
```
app/
├── _layout.tsx
├── (auth)/
│   ├── login.tsx
│   └── verify.tsx
├── (tabs)/
│   ├── _layout.tsx          ← Bottom tab bar
│   ├── index.tsx            ← Available orders feed
│   ├── active.tsx           ← Active delivery (map + route)
│   └── earnings.tsx         ← Daily/weekly earnings
├── delivery/
│   └── [orderId]/
│       ├── index.tsx        ← Delivery detail (restaurant → customer)
│       ├── pickup.tsx       ← At restaurant: confirm pickup
│       └── deliver.tsx      ← En route: navigation + delivery confirm
└── profile/
    └── index.tsx            ← Rider profile, vehicle, documents
```

---

## 4. Animation System

### Cart Add Animation (Reanimated)
```typescript
// Product card → floating cart button bounce
const cartScale = useSharedValue(1);
const addToCart = () => {
  cartScale.value = withSequence(
    withTiming(1.3, { duration: 150 }),
    withSpring(1, { damping: 8 })
  );
  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

### Skeleton Loader (Moti)
```typescript
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

// Restaurant card placeholder while loading
<Skeleton colorMode="dark" width={200} height={100} radius={8} />
```

### Page Transitions (Expo Router)
- Default: Native slide transitions (iOS) / fade+translate (Android)
- Custom for order confirmation: spring scale entrance

### Order Placed Lottie
- File: `assets/animations/order-placed.json`
- Trigger: After checkout confirms
- Duration: 2 seconds, then navigate to tracking

---

## 5. EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" }
    },
    "production": {
      "env": { "APP_ENV": "production" },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "team@blackbull.com",
        "ascAppId": "APP_STORE_CONNECT_ID",
        "appleTeamId": "TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## 6. Environment Setup

```env
# .env (customer-app)
EXPO_PUBLIC_API_URL=https://api.golocal.com/v1
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
EXPO_PUBLIC_SENTRY_DSN=https://...
EXPO_PUBLIC_APP_ENV=production
```

---

## 7. Performance Targets

| Metric | Target | Method |
|---|---|---|
| Cold start | < 1.5s | Pre-built navigation, MMKV for instant state restore |
| Restaurant list load | < 300ms | TanStack Query prefetch + skeleton |
| Cart add animation | 16ms (60fps) | Reanimated native thread |
| Map render | < 500ms | Lazy-load markers, cluster at low zoom |
| Push notification → visible | < 1s | Expo Push Service SLA |
| Order status update | < 2s | Socket.io + Zustand update |

---

## 8. Key Implementation Notes

1. **Background location** (rider app) requires custom dev build (not Expo Go) — needs expo-dev-client
2. **Apple Sign-In** is required by App Store if you support any OAuth social login
3. **Stripe initialization** must happen before any payment screen renders
4. **Socket.io connection** should reconnect automatically — use exponential backoff
5. **MMKV** requires custom dev build — cannot use with standard Expo Go
6. **expo-notifications** requires device registration on first app launch
7. **Maps** require Google Maps API key in app.json for both iOS and Android

# Deployment Strategy
**Date:** 2026-05-21

---

## 1. Infrastructure Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   PRODUCTION INFRASTRUCTURE                  │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │   Mobile Apps    │    │   Restaurant Portal + Admin  │   │
│  │   EAS Build      │    │   Vercel                     │   │
│  │   EAS Update     │    │   (Next.js 14)               │   │
│  └──────────────────┘    └──────────────────────────────┘   │
│                                       │                      │
│                           ┌───────────▼──────────────────┐  │
│                           │   Railway (backend)           │  │
│                           │   NestJS + workers            │  │
│                           └───────────┬──────────────────┘  │
│                                       │                      │
│                ┌──────────────────────┼─────────────────┐   │
│                │                      │                  │   │
│    ┌───────────▼──────┐  ┌────────────▼──────┐  ┌───────▼─┐ │
│    │ Railway          │  │ Railway Redis     │  │ Cloudflare│ │
│    │ PostgreSQL       │  │ (or Upstash)      │  │ R2/CDN    │ │
│    │ (+ PostGIS)      │  │                   │  │           │ │
│    └──────────────────┘  └───────────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend — Railway

**Why Railway over Coolify:**
- BILLING backend is not yet on Coolify — Railway is simpler for NestJS
- Managed PostgreSQL with PostGIS extension support
- Redis managed instance
- Auto-deploy on git push
- WebSocket support (Socket.io)

**Railway Services:**
```
food-delivery-api     → NestJS backend (port 3000)
food-delivery-worker  → BullMQ workers (same code, WORKER_MODE=true)
food-delivery-db      → PostgreSQL 16 + PostGIS
food-delivery-redis   → Redis 7
```

**Environment:** `railway.toml`
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"

[deploy]
startCommand = "node dist/main.js"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

---

## 3. Frontend — Vercel

**Restaurant Portal (extends BILLING Next.js frontend):**
```bash
# Deploy restaurant portal
cd BILLING/frontend
vercel deploy --prod
```

**Vercel Config:** `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "env": {
    "NEXT_PUBLIC_API_URL": "@food-api-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

---

## 4. Mobile — EAS Build + EAS Update

### Build Strategy
```bash
# Development (internal team)
eas build --platform all --profile development

# Staging (beta testers)
eas build --platform all --profile preview

# Production (App Store / Play Store)
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### OTA Updates (EAS Update)
```bash
# Fix a bug without App Store review:
eas update --branch production --message "Fix cart total calculation"

# Rollback if needed:
eas update:rollback --branch production
```

**Update Strategy:**
- Bug fixes → OTA update (same day)
- New features (no native changes) → OTA update  
- Native permission changes → Full App Store build (plan 1-2 weeks for review)
- SDK version bumps → Full App Store build

---

## 5. Database Migration Strategy

```bash
# On Railway: migrations run automatically on deploy
npx prisma migrate deploy

# For PostGIS setup (one-time):
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Rollback (manual):
npx prisma migrate rollback
```

**Never run migrations directly in production** — always through Railway deploy pipeline.

---

## 6. Environment Variables

### Backend (.env.production)
```env
# Existing BILLING vars (unchanged)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New food delivery vars
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+447700000000
PLATFORM_COMMISSION_PCT=15
GOOGLE_MAPS_API_KEY=AIza...
APPLE_CLIENT_SECRET=...
GOOGLE_OAUTH_CLIENT_ID=...
SENTRY_DSN=https://...
```

### Customer App (.env)
```env
EXPO_PUBLIC_API_URL=https://api.golocal.com/v1
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
EXPO_PUBLIC_SENTRY_DSN=https://...
```

---

## 7. Monitoring

### Error Tracking
- **Sentry** — All three platforms (customer app, rider app, backend)
- `@sentry/react-native` in both Expo apps
- `@sentry/nestjs` in backend
- Alert on: crash rate > 1%, API error rate > 5%

### Performance
- **Railway Metrics** — CPU, memory, request rate
- **Custom health endpoint:** `GET /health` returns DB + Redis status
- Alert on: response time > 2s p95, DB pool exhausted

### Business Metrics
- **PostHog** (product analytics) — order funnel, conversion, drop-off
- Custom events: restaurant_viewed, item_added, order_placed, order_cancelled, delivery_completed

---

## 8. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test
      - run: npm run build
      # Railway auto-deploys on push to main

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      # Vercel auto-deploys on push to main

  mobile-ota:
    # Only runs when mobile JS changes, not native changes
    if: contains(github.event.commits[0].message, '[mobile]')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas update --branch production --non-interactive
```

---

## 9. Domain Structure

```
api.golocal.com         → Railway NestJS backend
portal.golocal.com      → Vercel Next.js restaurant portal
admin.golocal.com       → Vercel Next.js super admin
ws.golocal.com          → WebSocket server (Railway, same backend)

App Store listing:
- "GoLocal — Food Delivery" (customer app)
- "GoLocal Rider" (rider app)
```

---

## 10. Scaling Path

**Current capacity (1 Railway instance):**
- ~500 concurrent users
- ~1,000 orders/day
- ~100 concurrent WebSocket connections

**Scale triggers:**
| Metric | Threshold | Action |
|---|---|---|
| CPU > 70% sustained | 10k orders/day | Add 2nd Railway instance |
| WebSocket connections > 500 | Growth | Extract tracking to separate Socket.io server |
| DB connections > 80% pool | Growth | PgBouncer connection pooling |
| Redis memory > 80% | Growth | Redis Cluster |
| Map API cost > £200/mo | Scale | Switch to Mapbox |

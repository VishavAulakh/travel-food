# Travel Food

Food delivery platform built on top of ReviewRise Billing OS.

## Apps

| App | Description | Stack |
|---|---|---|
| `apps/customer-app` | Customer iOS + Android app | Expo SDK 56, React 19, NativeWind v4 |
| `apps/rider-app` | Rider iOS + Android app | Expo SDK 56, React 19, NativeWind v4 |

## Documentation

All architecture decisions, integration plans, and MVP roadmap are in the root folders:
- `MASTER_PLAN.md` — start here
- `architecture/` — system design
- `backend/` — NestJS extension plan
- `mobile/` — full mobile stack reference
- `implementation-roadmap/` — 10-week sprint plan

## Getting started

```bash
# Customer app
cd apps/customer-app
cp .env.example .env
npm start

# Rider app
cd apps/rider-app
cp .env.example .env
npm start
```

## Architecture

Backend: extend [ReviewRise BILLING NestJS](https://github.com/vishavaulakh/BILLING)  
Restaurant portal: extend BILLING Next.js 14 frontend  
Mobile: Expo + EAS Build + EAS Update

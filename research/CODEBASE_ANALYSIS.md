# Codebase Analysis — GoLocal Food Delivery Ecosystem
**Date:** 2026-05-21  
**Analyst:** Lead Architecture AI  
**Projects Studied:** eCommerce (GoLocal) + BILLING (ReviewRise Billing OS)

---

## EXECUTIVE SUMMARY

Two mature production codebases exist that provide an enormous head start for the food delivery ecosystem. The BILLING project is the primary integration target — its multi-tenant NestJS backend, restaurant plugin architecture, product/inventory system, and customer CRM maps almost perfectly to a food delivery restaurant management layer. The eCommerce project (Medusa v2) provides a mature UK-focused product catalog and checkout system with less direct applicability to food delivery.

**Verdict:** Build the food delivery platform primarily extending the BILLING backend, NOT Medusa. Add a new `plugin:food-delivery` module to the existing NestJS backend.

---

## 1. ECOMMERCE PROJECT (GoLocal — Medusa v2)

### 1.1 Identity
| Property | Value |
|---|---|
| Stack | Medusa v2.14.2 + Next.js 15 App Router |
| Architecture | pnpm monorepo — apps/backend + apps/storefront |
| Deployment | Coolify (VPS self-hosted) |
| Region | United Kingdom (GBP) |
| DB | PostgreSQL via Medusa internals |
| Auth | Staff: custom httpOnly cookie (`staff_token`); Customer: Medusa JWT |

### 1.2 What Exists
**Backend (Medusa v2)**
- Full products/variants/categories/collections CRUD
- Cart + Checkout + Orders (full Medusa API, no staff UI yet)
- Promotions/discounts engine (Medusa native + custom `golocal-discounts` module)
- Customers CRM (Medusa API, no staff UI)
- Inventory tracking (Medusa API, no staff UI)
- Price lists + Draft orders (installed, no UI)
- Multi-region/currency support (Europe region, GBP primary)
- Custom banner/promotional system
- 13-key RBAC permission system on admin routes
- Coolify auto-deploy on push to main

**Frontend (Next.js 15 — Customer Storefront)**
- Full shopping experience: browse → cart → checkout → confirmation
- Customer account area (login, orders, addresses, profile)
- Multi-region routing (`/[countryCode]/(main)/*`)
- Dark/light mode toggle
- Animated hero banner + promotional carousel
- Product image gallery with variant selection
- Stripe frontend SDK installed (not yet backend-configured)

**Frontend (Next.js 15 — Staff Portal)**
- Products CRUD (full, including images and variants)
- Collections CRUD
- Categories CRUD + 2-level hierarchy
- Discounts CRUD (full with product/category scoping)
- Banners CRUD (with live preview)
- Dashboard with permission-gated card grid
- Proxy pattern: `/staff/api/proxy/[...path]` → Medusa admin APIs

### 1.3 What Does NOT Exist
- Orders management UI (❌ critical gap)
- Customers management UI (❌)
- Inventory management UI (❌)
- Payment gateway backend (❌ — Stripe not configured)
- Email notifications (❌)
- Rider/delivery concept (❌ — eCommerce model only)
- Restaurant concept (❌ — single-tenant eCommerce store)
- Real-time order tracking (❌)
- Push notifications (❌)

### 1.4 Food Delivery Relevance
**HIGH value:**
- Product/variant catalog model → menu items
- Discount/promotion system → restaurant promos
- Customer account system → app user accounts

**LOW value for food delivery:**
- Medusa's shipping provider model is physical postal, not food delivery zones
- Single-tenant model conflicts with multi-restaurant marketplace
- UK/GBP focus while food delivery may be broader
- Staff portal would need complete rebuild for restaurant management

### 1.5 Integration Opportunity
- Share the product catalog patterns (Medusa → BILLING product model is similar)
- Share customer account authentication if both platforms need a unified login
- Medusa as a product PIM (Product Information Manager) feeding BILLING
- Do NOT attempt to force food delivery onto Medusa's architecture

---

## 2. BILLING PROJECT (ReviewRise Billing OS — NestJS)

### 2.1 Identity
| Property | Value |
|---|---|
| Stack | NestJS 10 + PostgreSQL 16 + Redis 7 + BullMQ |
| Frontend | Next.js 14 App Router |
| Desktop | Tauri 2 (Rust + React) |
| ORM | Prisma |
| Auth | JWT (15min) + Refresh tokens (30d) + Device tokens |
| Multi-tenancy | Schema-per-tenant PostgreSQL |
| Deployment | Docker Compose (dev), Railway/AWS (prod) |
| Completion | ~65% overall |

### 2.2 What Exists — Backend (NestJS)
**Fully built modules:**
| Module | Status | Notes |
|---|---|---|
| auth | ✅ | JWT, refresh, device token register/rotate/revoke |
| tenants | ✅ | CRUD, plan management, usage tracking |
| products | ✅ | Catalog CRUD, SKU, barcode, bulk import, full-text search |
| categories | ✅ | Tree structure, reorder |
| tax-rules | ✅ | GST/VAT support, CGST/SGST/IGST breakdown |
| customers | ✅ | CRM, search, import, history, GDPR delete |
| invoices | ✅ | Create, void, PDF, reprint, stats |
| sync | ✅ | Device↔cloud sync, idempotency, conflict resolution |
| reviewrise | ✅ | ReviewRise bridge, queue, logs, manual trigger |
| analytics | ✅ | Revenue, top products, peak hours, cashier performance |
| branches | ✅ | Multi-branch, per-branch ReviewRise settings |
| devices | ✅ | Fleet management, heartbeat, revoke |
| redis | ✅ | Redis service wrapper |
| plugins | ✅ | Marketplace, subscribe/unsubscribe |
| stripe | ✅ | Checkout, portal, webhook, subscription status |
| super-admin | ✅ | Tenant management, platform revenue, feature flags |

**Plugin architecture:**
- `plugin:retail` — SKU, sizes, variants
- `plugin:restaurant` — Tables, covers, menu, KOT ← **DIRECTLY RELEVANT**
- `plugin:salon` — Appointments
- `plugin:pharmacy` — Prescriptions
- `plugin:auto` — Job cards

### 2.3 What Exists — Frontend (Next.js 14)
All pages built and wired to real APIs:
- Dashboard (metrics, invoice feed, ReviewRise panel, sync health)
- Invoices (list, filter, void, pagination)
- Products (catalog CRUD, bulk import, inline edit)
- Customers (CRM, invoice history, tags)
- Analytics (charts, peak-hours heatmap, revenue by day)
- ReviewRise (funnel KPIs, automation panel)
- Plugins marketplace
- Devices fleet
- Branches management
- Settings (6-tab: General, Billing, Notifications, Integrations, Security, Danger)
- Auth (login, 3-step register, forgot/reset password)
- Subscription/billing plans

### 2.4 What Exists — Desktop (Tauri)
- POS UI (React): order panel, product grid, payment modal, customer search
- Rust backend: invoice generation, sync daemon, printer bridge, barcode scanner, auto-updater
- SQLite encrypted (SQLCipher AES-256)
- Full offline-first architecture

### 2.5 Database Schema — Key Tables
**Public schema (platform):**
- `tenants` — multi-tenant registry with business_type, plan, ReviewRise link
- `subscriptions` — Stripe-integrated SaaS plans
- `plugins` — marketplace registry
- `update_channels` — desktop update management

**Per-tenant schema (`tenant_{id}`):**
- `branches` — multi-location support with ReviewRise per-branch
- `devices` — desktop device fleet
- `users` — RBAC (superadmin, tenant_admin, branch_manager, cashier, viewer)
- `products` + `product_variants` — catalog with barcode, FTS search
- `categories` — hierarchical
- `tax_rules` — GST/VAT with CGST/SGST/IGST
- `customers` — CRM with loyalty points, spend tracking, ReviewRise cooldown
- `invoices` + `invoice_items` + `payments` — full billing lifecycle
- `inventory` + `inventory_movements` — stock tracking
- `offline_sync_queue` + `sync_logs` — device sync infrastructure
- `reviewrise_logs` — full audit trail

### 2.6 API Surface
**50+ endpoints across:**
- Auth (register, login, refresh, device auth)
- Tenants, Branches, Devices
- Products (CRUD, search, barcode, bulk import)
- Customers (CRUD, history, import, GDPR)
- Invoices (CRUD, void, PDF, stats)
- Sync API (invoices, customers, inventory, ReviewRise, analytics, cache)
- Analytics (revenue, products, peak hours, review funnel)
- Plugins (subscribe, configure)
- Subscriptions (Stripe checkout/portal/webhook)
- Super admin (tenant management, revenue, feature flags, update deploy)
- WebSocket: catalog updates, forced updates, device revoke

### 2.7 Food Delivery Relevance
**CRITICAL value — directly reusable:**
- Multi-tenant architecture → each restaurant is a tenant
- `plugin:restaurant` → extend to `plugin:food-delivery`
- Products/categories system → menu management
- Customers system → food delivery customer accounts
- Inventory system → ingredient/item availability
- Analytics → restaurant performance dashboard
- Branches → restaurant locations/zones
- Super admin → platform owner managing all restaurants
- Stripe subscription → restaurant SaaS billing
- ReviewRise → post-delivery review requests

**Missing for food delivery:**
- Delivery zone management (geographic radius/polygon)
- Rider management (separate user type, earnings, availability)
- Order workflow (placed → confirmed → preparing → picked up → delivered)
- Real-time tracking (rider GPS stream to customer)
- Time slots (opening hours, delivery windows)
- Cart/ordering flow (customer places order, restaurant accepts)
- Commission management (platform takes % per order)
- Customer mobile app (Tauri desktop ≠ mobile app)

---

## 3. INTEGRATION OPPORTUNITY MAP

```
┌─────────────────────────────────────────────────────────────┐
│                 FOOD DELIVERY PLATFORM                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         CUSTOMER MOBILE APP (Expo/React Native)       │  │
│  │  Browse → Cart → Order → Track → Review               │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │               RIDER APP (Expo/React Native)           │  │
│  │  Accept → Navigate → Deliver → Earn                   │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │    FOOD DELIVERY API LAYER (NEW NestJS module)         │  │
│  │    Extends existing BILLING NestJS backend             │  │
│  │                                                        │  │
│  │  • Orders (delivery lifecycle)                         │  │
│  │  • Riders (new user type)                              │  │
│  │  • Zones (delivery geography)                          │  │
│  │  • Real-time (Socket.io – already installed)           │  │
│  │  • Commissions (platform fee engine)                   │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐  │
│  │     EXISTING BILLING BACKEND (REUSE AS-IS)            │  │
│  │     NestJS + PostgreSQL + Redis + BullMQ              │  │
│  │                                                        │  │
│  │  ✅ Tenants (restaurant = tenant)                      │  │
│  │  ✅ Products/Categories (menu management)              │  │
│  │  ✅ Customers (shared with delivery)                   │  │
│  │  ✅ Analytics (restaurant dashboard)                   │  │
│  │  ✅ Auth (JWT + device tokens)                         │  │
│  │  ✅ ReviewRise (post-delivery reviews)                 │  │
│  │  ✅ Stripe (restaurant subscriptions)                  │  │
│  │  ✅ Branches (restaurant locations)                    │  │
│  │  ✅ Super Admin (platform management)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RESTAURANT PORTAL (Extend BILLING frontend)          │  │
│  │  Next.js 14 — add delivery-specific pages             │  │
│  │  • Orders queue (live)                                 │  │
│  │  • Menu management (already ~80% built as "products") │  │
│  │  • Delivery zone config                               │  │
│  │  • Analytics (already built)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. WHAT SHOULD BE REUSED (DO NOT REBUILD)

| Component | Location | Reuse Strategy |
|---|---|---|
| NestJS backend | BILLING/backend | Add new modules, do not replace |
| Multi-tenant PostgreSQL | BILLING DB | Add delivery tables to tenant schema |
| Auth system (JWT + refresh) | BILLING auth module | Add `rider` role to RBAC |
| Products/menu API | BILLING products module | Use as menu management |
| Customer CRM | BILLING customers module | Delivery customers = billing customers |
| Analytics | BILLING analytics module | Extend with delivery metrics |
| ReviewRise bridge | BILLING reviewrise module | Trigger after delivery completion |
| Stripe subscriptions | BILLING stripe module | Restaurant SaaS billing |
| Super admin | BILLING super-admin module | Extend with delivery platform metrics |
| Redis/BullMQ | BILLING infrastructure | Add delivery job queues |
| Socket.io | BILLING WebSocket layer | Extend for real-time order tracking |
| Design system | BILLING frontend | React component library |
| Branches | BILLING branches module | Restaurant locations/outlets |

## 5. WHAT NEEDS TO BE BUILT NEW

| Component | Why New | Effort |
|---|---|---|
| Customer mobile app (Expo) | No mobile exists | HIGH |
| Rider mobile app (Expo) | No mobile exists | MEDIUM |
| `food-delivery` NestJS module | Delivery-specific logic | MEDIUM |
| Delivery zone management | Geographic delivery areas | MEDIUM |
| Real-time order tracking | GPS stream from rider → customer | MEDIUM |
| Order workflow state machine | New lifecycle model | MEDIUM |
| Rider management system | New user type + earnings | MEDIUM |
| Commission engine | Platform % per order | LOW |
| Time slot / opening hours | Schedule management | LOW |
| Restaurant onboarding portal pages | Extend BILLING frontend | LOW |

---

## 6. WHAT SHOULD NOT BE TOUCHED

- BILLING Tauri desktop app — POS system for dine-in, separate product
- BILLING sync engine — for offline POS scenarios
- GoLocal eCommerce storefront — separate product (UK eCommerce)
- Medusa backend — keep isolated, don't pollute with food delivery concerns
- BILLING Stripe module — use as-is for restaurant subscriptions

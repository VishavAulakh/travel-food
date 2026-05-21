# Risk Register
**Date:** 2026-05-21

---

## TECHNICAL RISKS

### R-001: BILLING Backend Compatibility
**Risk:** Adding food delivery modules breaks existing BILLING functionality  
**Probability:** Low  
**Impact:** HIGH  
**Mitigation:**
- All new code in separate NestJS modules — no modification to existing modules
- Comprehensive test suite before deploying
- Feature flag: deploy food delivery endpoints behind `FOOD_DELIVERY_ENABLED=true` env var
- Railway staging environment to test against a copy of production DB

---

### R-002: PostGIS Extension on Existing DB
**Risk:** Adding PostGIS extension to existing BILLING PostgreSQL breaks schema  
**Probability:** Low  
**Impact:** Medium  
**Mitigation:**
- PostGIS is additive — creating an extension never breaks existing tables
- Test on staging first: `CREATE EXTENSION IF NOT EXISTS postgis;`
- If Railway managed DB doesn't support PostGIS: use Haversine formula in app layer (fallback)

---

### R-003: App Store Rejection — Background Location
**Risk:** Apple rejects rider app due to background location usage  
**Probability:** Medium  
**Impact:** HIGH (blocks rider app launch)  
**Mitigation:**
- Follow app store guide exactly (see `/appstore-approval/APP_STORE_GUIDE.md`)
- Request "Always" location ONLY after rider starts a delivery, not on first launch
- Write detailed app review notes explaining the location usage
- Test with TestFlight before submitting to App Store review
- Have demo video ready showing the delivery tracking in action

---

### R-004: Stripe Connect UK Approval
**Risk:** Stripe Connect application for rider payouts takes time or is rejected  
**Probability:** Low  
**Impact:** Medium (MVP can launch without payouts, pay riders manually)  
**Mitigation:**
- Apply for Stripe Connect as early as possible (Week 1 of development)
- Launch MVP with manual rider payment tracking in database
- Add Stripe Connect payouts in Phase 2

---

### R-005: Google Maps API Costs
**Risk:** Maps API costs unexpectedly high at scale  
**Probability:** Medium  
**Impact:** Low-Medium  
**Mitigation:**
- Set billing alert in Google Cloud at £100/month
- Use caching for restaurant location markers (don't reload map on every scroll)
- Switch to Mapbox (5x cheaper) when costs exceed £200/month
- Plan for Mapbox migration in the architecture from day one

---

### R-006: Real-time WebSocket Scale
**Risk:** Socket.io server overwhelmed by concurrent rider location updates  
**Probability:** Low at MVP, Medium at scale  
**Impact:** Medium (degraded tracking experience)  
**Mitigation:**
- Redis Pub/Sub architecture already distributes load
- Set location update interval to 3 seconds (not 1 second)
- Monitor WebSocket connection count in Railway metrics
- Extract tracking gateway to separate server when connections > 500

---

### R-007: Offline Race Conditions (POS + Delivery)
**Risk:** BILLING POS offline invoices conflict with food delivery online orders  
**Probability:** Very Low  
**Impact:** Low  
**Mitigation:**
- Separate invoice number sequences (INV-* for POS, DEL-* for delivery)
- Delivery orders are cloud-only (require internet) — no offline conflict possible
- POS sync engine already handles POS invoice conflicts independently

---

## BUSINESS RISKS

### R-008: Rider Supply Problem
**Risk:** Customer app launches with no available riders → terrible experience  
**Probability:** HIGH  
**Impact:** HIGH (catastrophic for launch)  
**Mitigation:**
- Recruit minimum 10 riders BEFORE customer app launches
- Soft launch in one neighborhood where riders are available
- Restaurant "closed for delivery" fallback until rider supply is adequate

---

### R-009: Restaurant Quality
**Risk:** First restaurants are low quality → bad app reviews  
**Probability:** Medium  
**Impact:** HIGH (early reviews shape App Store ranking)  
**Mitigation:**
- Manually curate first 10 restaurants — quality partners only
- Personal relationship with first restaurant partners
- Don't open platform to general restaurant applications at launch

---

### R-010: Regulatory (UK Food Delivery)
**Risk:** UK food hygiene and delivery regulations not followed  
**Probability:** Low (restaurants responsible for their own compliance)  
**Impact:** Medium  
**Mitigation:**
- Restaurants confirm food hygiene rating during onboarding
- Display food hygiene rating in app (UK Food Standards Agency)
- Terms of service require restaurants to maintain regulatory compliance

---

### R-011: Payment Disputes (Chargebacks)
**Risk:** High chargeback rate from disputed food delivery orders  
**Probability:** Medium  
**Impact:** Medium (Stripe may restrict account)  
**Mitigation:**
- Clear refund policy displayed at checkout
- Automatic refund for restaurant-cancelled orders
- Photo proof of delivery available in rider app
- Dispute resolution process in admin portal

---

## PRIORITY ORDER

| Risk | Priority | Action Owner |
|---|---|---|
| R-008 Rider supply | 🔴 CRITICAL | Business |
| R-003 App Store location | 🔴 CRITICAL | Engineering |
| R-001 Backend compatibility | 🟡 HIGH | Engineering |
| R-009 Restaurant quality | 🟡 HIGH | Business |
| R-004 Stripe Connect | 🟡 HIGH | Business/Engineering |
| R-005 Maps costs | 🟢 MONITOR | Engineering |
| R-006 WebSocket scale | 🟢 MONITOR | Engineering |
| R-002 PostGIS | 🟢 LOW | Engineering |
| R-007 Offline race | 🟢 LOW | Engineering |
| R-010 Regulatory | 🟢 LOW | Legal |
| R-011 Chargebacks | 🟢 MONITOR | Business |

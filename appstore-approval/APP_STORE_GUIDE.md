# App Store & Play Store Approval Guide
**Date:** 2026-05-21  
**Priority:** CRITICAL — build for approval from day one

---

## 1. Overview

Food delivery apps are heavily scrutinized by both Apple and Google review teams.  
Failure modes: payment policy violations, excessive permissions, background location misuse, crash rates.  
This guide ensures the app passes first review.

---

## 2. Apple App Store — Key Requirements

### 2.1 In-App Purchase Rule (CRITICAL)
**Rule:** If your app sells anything where Apple facilitates payment, Apple takes 15-30%.  
**Food delivery exception:** Selling physical goods (real food) is EXEMPT from Apple's IAP requirement.  
✅ Using Stripe for food delivery payments is FULLY allowed.  
❌ If you sell "virtual" subscriptions (customer Premium membership), you MUST use Apple IAP.  

**Action items:**
- Use Stripe for all food order payments (no Apple IAP required)
- If launching a "premium" customer tier — use Apple IAP for that feature
- Never route real money through Stripe disguised as virtual goods

### 2.2 Location Permissions
```
Always-On location → HIGH RISK → requires justification

CORRECT approach:
- Customer app: "When in Use" location only
- Rider app: "When in Use" + optional "Always" during delivery

Usage description strings (Info.plist):
NSLocationWhenInUseUsageDescription:
  "GoLocal uses your location to find nearby restaurants and calculate delivery addresses."

NSLocationAlwaysAndWhenInUseUsageDescription (Rider app only):
  "GoLocal needs continuous location access while you're on a delivery to track your route."
```

**Implementation rule:** Request `Always` permission ONLY after the rider starts a delivery. Never on first launch. iOS will auto-downgrade to "While Using App" if you request "Always" too early.

### 2.3 Background Location (Rider App)
- Add to Xcode: `UIBackgroundModes` → `location`
- iOS reviews background location usage carefully
- Write clear metadata in App Store Connect: "Required for real-time delivery tracking when app is in background"
- Apple may ask for demo video showing the background location in use
- Use `react-native-background-geolocation` (most App Store-friendly implementation)

### 2.4 Notification Permissions
```
// CORRECT: Request notifications only when user would expect it
// WRONG: Request notifications on first app launch

// Request after:
// - User places first order
// - User visits "notifications" settings
// - User sees clear explanation of what notifications they'll receive

expo-notifications approach:
const { status } = await Notifications.requestPermissionsAsync({
  ios: { allowAlert: true, allowBadge: true, allowSound: true }
});
```

### 2.5 Apple Sign-In Requirement
**Rule:** If your app offers ANY social login (Google, Facebook, etc.), you MUST also offer Apple Sign-In.  
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

// Required if you have Google Sign-In
<AppleAuthentication.AppleAuthenticationButton
  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
  cornerRadius={8}
  style={{ width: 200, height: 44 }}
  onPress={handleAppleLogin}
/>
```

### 2.6 Privacy Policy Requirements
- Must have a Privacy Policy URL in App Store Connect
- Must be accessible from within the app (Settings → Privacy Policy link)
- Must cover: location data, payment data, order history, customer data sharing
- GDPR compliance section required for EU users

### 2.7 App Store Screenshots Requirements
- iPhone 6.9" (iPhone 15 Pro Max) — REQUIRED
- iPad 13" (if universal app)
- Show real UI, not mockups
- Show the core flow: browse → order → track
- No screenshots of in-progress or broken features

---

## 3. Google Play Store — Key Requirements

### 3.1 Sensitive Permissions Declaration
Google now requires declaration for:
- `ACCESS_BACKGROUND_LOCATION` — justify in Data Safety section
- `RECEIVE_SMS` (for OTP) — justify or use alternative
- `READ_PHONE_STATE` — avoid if possible

**App review process:**
- Declaration form at: Play Console → App Content → Data Safety
- Describe every data type collected: location, payments, order history

### 3.2 Target API Level
- Must target Android 14 (API 34) by end of 2025
- Expo SDK 53+ targets this correctly by default

### 3.3 Background Location
- Similar to iOS: must justify in declaration
- Google Play policy: background location in food delivery is acceptable IF user triggers it (starting a delivery)

### 3.4 Play Store Listing
- Feature graphic (1024 x 500px) required
- At least 2 screenshots (phone)
- Content rating: Everyone (no mature content)

---

## 4. OTA Update Compliance

### 4.1 What EAS Update CAN push
✅ Bug fixes in JavaScript  
✅ UI/UX changes  
✅ Restaurant data, menu updates  
✅ Animation improvements  
✅ Feature additions that don't need new native APIs  
✅ Payment flow improvements (if Stripe integration unchanged)  

### 4.2 What REQUIRES App Store Build
❌ New native permissions (new location access type)  
❌ New native library additions  
❌ Changes to app's core purpose  
❌ Major navigation structure changes  
❌ SDK version upgrades  

### 4.3 Microsoft CodePush is DEAD (March 2025)
All existing CodePush deployments must migrate to EAS Update.  
EAS Update is the only compliant OTA solution for Expo in 2026.

---

## 5. Common Rejection Reasons for Food Delivery Apps

| Rejection Reason | Prevention |
|---|---|
| "App requests location permission but doesn't use it" | Only request location when needed, show map immediately after |
| "Apple Sign-In not offered with social login" | Always add Apple Sign-In if you add any social login |
| "App crashes on first launch" | Thorough testing on real devices before submission |
| "Payment outside Apple system for digital goods" | Use Stripe only for physical food orders — OK |
| "Incomplete functionality" | Submit when core flow is working end-to-end |
| "Misleading screenshots" | Show real app screens, not Figma mockups |
| "Privacy policy link broken" | Test the link from App Store Connect before submitting |
| "Background location not justified" | Only rider app, clear description, triggered by user |
| "App template" | Ensure the app looks complete and functional, not a starter |
| "In-app purchases not using IAP" | Only applies to digital goods — food orders are fine |

---

## 6. Pre-Submission Checklist

### Technical
- [ ] App runs without crashes on real iPhone (not simulator)
- [ ] App runs without crashes on real Android device
- [ ] All screens work without internet (graceful offline state)
- [ ] Payment flow works end-to-end with real Stripe test
- [ ] Push notifications working on real device
- [ ] Location permissions properly scoped (not requesting more than needed)
- [ ] Apple Sign-In implemented (if any social login)
- [ ] All API calls use HTTPS
- [ ] No console.log in production build
- [ ] Sentry error monitoring configured

### App Store Connect
- [ ] Privacy policy URL live and accessible
- [ ] Screenshots uploaded (iPhone 6.9" minimum)
- [ ] App description written (clear, no keyword stuffing)
- [ ] Category: Food & Drink
- [ ] Age rating: 4+ (food delivery, no mature content)
- [ ] Export compliance answered
- [ ] Data safety section completed (Play Store)

### Business
- [ ] Stripe account verified (not test mode in production)
- [ ] At least 3 restaurants onboarded and visible in app
- [ ] At least 1 test order placed successfully
- [ ] Rider app tested with complete delivery flow

---

## 7. App Store Category & Metadata

```
App Name: GoLocal Food Delivery  (or brand name)
Category: Primary: Food & Drink
Subtitle (iOS): "Order food from local restaurants"
Keywords: food delivery, restaurant, order food, local food, takeaway
Age Rating: 4+
Content Rights: Does not contain, display, or access third-party content
```

---

## 8. App Privacy Labels (iOS)

Required privacy label declarations:

| Data Type | Collected | Linked to User | Used for Tracking |
|---|---|---|---|
| Location (precise) | Yes | Yes | No |
| Name | Yes | Yes | No |
| Phone Number | Yes | Yes | No |
| Email | Yes | Yes | No |
| Payment Info | Yes | Yes | No |
| Purchase History | Yes | Yes | No |
| Crash Data | Yes | No | No |

Mark accurately — false declarations can result in app removal.

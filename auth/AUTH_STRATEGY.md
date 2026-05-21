# Authentication Strategy
**Date:** 2026-05-21  
**Decision:** Extend BILLING JWT auth — NO third-party auth provider needed

---

## 1. Decision: Reuse BILLING Auth

**Why NOT Clerk/Firebase/Supabase:**
- BILLING already has a complete, production-grade JWT auth system
- 5+ existing modules depend on it (tenants, devices, products, sync, etc.)
- Adding Clerk = monthly cost + additional dependency + migration risk
- Our multi-tenant model (schema-per-tenant) requires tenant context in every token — Clerk doesn't handle this natively

**What we extend:**
- Add `customer` and `rider` user types to the existing RBAC
- Add phone number + OTP authentication (for customer/rider onboarding)
- Add Apple Sign-In / Google OAuth for customer app
- Add rider-specific endpoints (availability, location)

---

## 2. Current BILLING Auth System (Already Built)

```
POST /auth/register         ← Tenant registration
POST /auth/login            ← JWT + refresh token
POST /auth/refresh          ← Rotate tokens
POST /auth/logout           ← Invalidate refresh
POST /auth/device/register  ← Desktop device token
```

**Token format (existing):**
```json
{
  "sub": "user_uuid",
  "tenantId": "tenant_uuid",
  "role": "tenant_admin|branch_manager|cashier|viewer",
  "iat": 1716000000,
  "exp": 1716000900
}
```

---

## 3. New Auth Endpoints (to add)

### Customer Auth
```
POST /customer/auth/register        ← Phone + name + email
POST /customer/auth/send-otp        ← Send SMS OTP
POST /customer/auth/verify-otp      ← Verify OTP → JWT
POST /customer/auth/google          ← Google OAuth
POST /customer/auth/apple           ← Apple Sign-In (required)
POST /customer/auth/refresh
POST /customer/auth/logout
```

### Rider Auth
```
POST /rider/auth/register           ← Phone + name + vehicle info
POST /rider/auth/send-otp
POST /rider/auth/verify-otp
POST /rider/auth/refresh
POST /rider/auth/logout
```

---

## 4. Token Extensions

### Customer JWT
```json
{
  "sub": "customer_uuid",
  "role": "customer",
  "phone": "+447700900123",
  "iat": 1716000000,
  "exp": 1716000900
}
```
Note: No `tenantId` — customers are platform-level, not tenant-specific.

### Rider JWT
```json
{
  "sub": "rider_uuid",
  "role": "rider",
  "isAvailable": true,
  "iat": 1716000000,
  "exp": 1716000900
}
```

---

## 5. Mobile Token Storage

```typescript
// lib/auth/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'golocal_access_token';
const REFRESH_KEY = 'golocal_refresh_token';

export const tokenStorage = {
  getToken: () => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  setRefresh: (token: string) => SecureStore.setItemAsync(REFRESH_KEY, token),
  clearAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};
```

---

## 6. Auto-Refresh on 401

```typescript
// lib/api/client.ts
import axios from 'axios';
import { tokenStorage } from '../auth/tokenStorage';

const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await tokenStorage.getRefresh();
      if (!refreshToken) {
        await tokenStorage.clearAll();
        router.replace('/auth/login');
        return;
      }
      
      try {
        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/customer/auth/refresh`, {
          refreshToken
        });
        await tokenStorage.setToken(data.accessToken);
        await tokenStorage.setRefresh(data.refreshToken);
        
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(error.config);
      } catch {
        await tokenStorage.clearAll();
        router.replace('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 7. Apple Sign-In (Required for App Store)

```typescript
// app/(auth)/login.tsx
import * as AppleAuthentication from 'expo-apple-authentication';

const AppleSignInButton = () => {
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // Send Apple credential to backend
      const { data } = await api.post('/customer/auth/apple', {
        identityToken: credential.identityToken,
        user: credential.user,
        fullName: credential.fullName,
        email: credential.email,
      });
      
      await tokenStorage.setToken(data.accessToken);
      await tokenStorage.setRefresh(data.refreshToken);
      router.replace('/(tabs)');
      
    } catch (error) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        showToast({ type: 'error', message: 'Apple Sign-In failed' });
      }
    }
  };
  
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{ width: '100%', height: 48 }}
      onPress={handleAppleLogin}
    />
  );
};
```

---

## 8. OTP Phone Auth (SMS)

```typescript
// Backend: NestJS customer auth service
import * as twilio from 'twilio';

@Injectable()
export class CustomerAuthService {
  private twilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  
  async sendOTP(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    
    // Store in Redis with expiry
    await this.redis.set(`otp:${phone}`, otp, 'EX', 600);
    
    await this.twilio.messages.create({
      body: `Your GoLocal code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    
    return { sent: true };
  }
  
  async verifyOTP(phone: string, otp: string) {
    const stored = await this.redis.get(`otp:${phone}`);
    if (stored !== otp) throw new UnauthorizedException('Invalid OTP');
    
    await this.redis.del(`otp:${phone}`);
    
    // Get or create customer
    let customer = await this.customersRepo.findByPhone(phone);
    if (!customer) {
      customer = await this.customersRepo.create({ phone });
    }
    
    return this.generateTokens(customer);
  }
}
```

---

## 9. Zustand Auth Store (Mobile)

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'auth' });

interface AuthState {
  user: Customer | Rider | null;
  isAuthenticated: boolean;
  login: (tokens: Tokens) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (tokens) => {
        await tokenStorage.setToken(tokens.accessToken);
        await tokenStorage.setRefresh(tokens.refreshToken);
        const user = await api.get('/customer/me').then(r => r.data);
        set({ user, isAuthenticated: true });
      },
      
      logout: async () => {
        await api.post('/customer/auth/logout').catch(() => {});
        await tokenStorage.clearAll();
        set({ user: null, isAuthenticated: false });
      },
      
      refreshUser: async () => {
        const user = await api.get('/customer/me').then(r => r.data);
        set({ user });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.getString(name) ?? null,
        setItem: (name, value) => storage.set(name, value),
        removeItem: (name) => storage.delete(name),
      })),
    }
  )
);
```

---

## 10. Route Guards (Expo Router)

```typescript
// app/(auth)/_layout.tsx — Redirect if already logged in
export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Stack />;
}

// app/(tabs)/_layout.tsx — Redirect if not logged in
export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return (
    <Tabs screenOptions={{ tabBarStyle: { backgroundColor: '#111827' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
```

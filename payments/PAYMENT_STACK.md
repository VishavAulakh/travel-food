# Payment Stack — Food Delivery
**Date:** 2026-05-21  
**Primary:** Stripe React Native SDK  
**Secondary:** Stripe Connect (rider payouts)

---

## 1. Payment Architecture

```
Customer places order
        │
        ▼
Stripe React Native SDK (mobile)
  → Payment Sheet (card, Apple Pay, Google Pay)
  → Creates Payment Intent on our backend
        │
        ▼
NestJS Backend (payment-intents endpoint)
  → Creates Stripe Payment Intent
  → Confirms payment
  → Marks order as paid
  → Triggers delivery workflow
        │
        ├── Restaurant receives order
        │
        ├── Platform takes commission
        │       │
        │       ▼
        │   Stripe (holds funds)
        │
        └── After delivery confirmed
                │
                ▼
            Stripe Connect → Transfer to restaurant's Stripe account
            Stripe Connect → Transfer to rider's Stripe account (earnings)
```

---

## 2. Required Packages

```bash
# Install
yarn add @stripe/stripe-react-native

# app.json plugin (Expo)
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.golocal.food",
          "enableGooglePay": true
        }
      ]
    ]
  }
}
```

---

## 3. Implementation

### 3.1 App Root Setup
```typescript
// app/_layout.tsx
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.golocal.food"
      urlScheme="golocal"
    >
      <Stack />
    </StripeProvider>
  );
}
```

### 3.2 Checkout Payment Flow
```typescript
// app/checkout/payment.tsx
import { useStripe } from '@stripe/stripe-react-native';

const CheckoutPaymentScreen = ({ orderId, total }: Props) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  
  const initializePayment = async () => {
    // 1. Create payment intent on backend
    const { clientSecret, ephemeralKey, customerId } = await api.createPaymentIntent({
      orderId,
      amount: Math.round(total * 100), // pence
      currency: 'gbp',
    });
    
    // 2. Init payment sheet
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'GoLocal Food',
      customerId,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: clientSecret,
      allowsDelayedPaymentMethods: false,
      defaultBillingDetails: { name: user.name },
      appearance: {
        colors: {
          primary: '#FF6B35',
          background: '#111827',
          componentBackground: '#1F2937',
          primaryText: '#FFFFFF',
          secondaryText: '#9CA3AF',
        }
      },
      applePay: {
        merchantCountryCode: 'GB',
      },
      googlePay: {
        merchantCountryCode: 'GB',
        currencyCode: 'gbp',
      },
    });
    
    if (error) throw error;
  };
  
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await initializePayment();
      
      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code === 'Canceled') return; // User cancelled
        throw error;
      }
      
      // Payment successful
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/checkout/confirm?orderId=${orderId}`);
      
    } catch (error) {
      showToast({ type: 'error', message: 'Payment failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View>
      <OrderSummary total={total} />
      <Button onPress={handlePayment} loading={isLoading}>
        Pay £{(total).toFixed(2)}
      </Button>
    </View>
  );
};
```

### 3.3 Backend Payment Intent Creation
```typescript
// NestJS: food-delivery.controller.ts
@Post('payment-intent')
@UseGuards(CustomerAuthGuard)
async createPaymentIntent(@Body() dto: CreatePaymentIntentDto, @Req() req) {
  const order = await this.deliveryService.getOrder(dto.orderId);
  
  // Validate order belongs to this customer
  if (order.customerId !== req.user.id) throw new ForbiddenException();
  
  // Create or get Stripe customer
  const stripeCustomer = await this.stripeService.getOrCreateCustomer(req.user);
  const ephemeralKey = await stripe.ephemeralKeys.create({ customer: stripeCustomer.id });
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // pence
    currency: 'gbp',
    customer: stripeCustomer.id,
    metadata: {
      orderId: order.id,
      restaurantId: order.branchId,
    },
    automatic_payment_methods: { enabled: true },
  });
  
  return {
    clientSecret: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customerId: stripeCustomer.id,
  };
}

@Post('stripe/webhook')
async handleStripeWebhook(@Req() req, @Headers('stripe-signature') sig) {
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  if (event.type === 'payment_intent.succeeded') {
    const orderId = event.data.object.metadata.orderId;
    await this.deliveryService.markOrderPaid(orderId);
    // → triggers order confirmation workflow
    // → notifies restaurant via WebSocket
    // → sends push notification to customer
  }
  
  return { received: true };
}
```

---

## 4. Stripe Connect (Restaurant + Rider Payouts)

### Setup
- Restaurant onboarding: Stripe Connect Express accounts
- Rider onboarding: Stripe Connect Express accounts
- Platform holds funds → transfers after delivery confirmation

```typescript
// Restaurant onboarding
const account = await stripe.accounts.create({
  type: 'express',
  country: 'GB',
  email: restaurant.contactEmail,
  capabilities: {
    transfers: { requested: true },
  },
});

const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${DASHBOARD_URL}/stripe-refresh`,
  return_url: `${DASHBOARD_URL}/stripe-success`,
  type: 'account_onboarding',
});
// Redirect restaurant to accountLink.url for KYC
```

### Transfer After Delivery
```typescript
// After delivery.status = 'delivered'
const transferRestaurant = await stripe.transfers.create({
  amount: Math.round(order.restaurantPayoutAmount * 100),
  currency: 'gbp',
  destination: restaurant.stripeAccountId,
  transfer_group: order.id,
});

const transferRider = await stripe.transfers.create({
  amount: Math.round(rider.baseEarning * 100),
  currency: 'gbp',
  destination: rider.stripeAccountId,
  transfer_group: order.id,
});
```

---

## 5. Tip Flow (Post-Delivery)

```typescript
// After delivery confirmation, show tip screen
const TipScreen = ({ orderId, riderId }: Props) => {
  const tipOptions = [
    { label: '10%', value: 0.10 },
    { label: '15%', value: 0.15 },
    { label: '20%', value: 0.20 },
    { label: 'Custom', value: null },
  ];
  
  const handleTip = async (tipPercentage: number) => {
    const tipAmount = orderTotal * tipPercentage;
    
    // Create separate payment intent for tip
    const { clientSecret } = await api.createTipPaymentIntent({ orderId, tipAmount });
    
    // Present payment sheet for tip
    const { error } = await presentPaymentSheet();
    if (!error) {
      await api.confirmTip({ orderId, riderId, tipAmount });
      // Tip distributed: 100% to rider
    }
  };
  
  return <TipSelectionUI onTip={handleTip} />;
};
```

---

## 6. Refund Flow

```typescript
// When order is cancelled (restaurant or platform initiated)
@Post('orders/:id/cancel')
async cancelOrder(@Param('id') orderId: string, @Body() dto: CancelOrderDto) {
  const order = await this.deliveryService.cancelOrder(orderId, dto.reason, dto.cancelledBy);
  
  // Issue Stripe refund
  if (order.stripePaymentIntentId && order.paymentStatus === 'paid') {
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      reason: 'requested_by_customer',
    });
    
    // Update order refund status
    await this.deliveryService.markRefundInitiated(orderId);
  }
  
  // Notify customer
  await this.notificationsService.sendPush({
    userId: order.customerId,
    title: 'Order Cancelled',
    body: `Your order from ${order.restaurantName} has been cancelled. Refund initiated.`,
  });
  
  return { success: true };
}
```

---

## 7. App Store Compliance Summary

| Payment Type | Method | App Store OK |
|---|---|---|
| Food orders (physical goods) | Stripe | ✅ Yes |
| Premium customer subscription | Apple IAP | ✅ Required |
| Tips | Stripe | ✅ Yes |
| Rider top-up | Stripe Connect | ✅ Yes |
| Promo code discounts | Stripe | ✅ Yes |

**Rule:** Real food = Stripe is fine. Digital upgrades/subscriptions = must use Apple IAP.

# Push Notification Strategy
**Date:** 2026-05-21  
**Primary:** Expo Notifications (transactional)  
**Future:** OneSignal (marketing/engagement)

---

## 1. Stack Decision

| Use Case | Solution | Why |
|---|---|---|
| Order status updates | expo-notifications | Free, fast (41ms median), built into Expo |
| ETA alerts | expo-notifications | Same infrastructure |
| Delivery confirmation | expo-notifications | With haptic feedback |
| New order alerts (restaurant) | expo-notifications | Restaurant web app via FCM direct |
| New order alerts (rider) | expo-notifications | Push to rider app |
| Marketing campaigns | OneSignal (later) | Segmentation, analytics |

---

## 2. Setup

### Installation
```bash
npx expo install expo-notifications expo-device
```

### app.json
```json
{
  "expo": {
    "plugins": [
      ["expo-notifications", {
        "icon": "./assets/notification-icon.png",
        "color": "#FF6B35",
        "sounds": ["./assets/notification-sound.wav"]
      }]
    ]
  }
}
```

---

## 3. Token Registration (Mobile)

```typescript
// hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  
  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return; // Won't work in simulator
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    
    // Register token with backend
    await api.post('/customer/me/push-token', { token: pushToken.data });
    setToken(pushToken.data);
    
    // Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'notification-sound.wav',
      });
    }
  };
  
  useEffect(() => {
    registerForPushNotifications();
    
    // Handle notification tap when app is background/closed
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const { orderId } = response.notification.request.content.data;
      if (orderId) router.push(`/track/${orderId}`);
    });
    
    return () => responseListener.remove();
  }, []);
  
  return { token };
};
```

---

## 4. Backend — Sending Notifications

```typescript
// services/notifications.service.ts
@Injectable()
export class NotificationsService {
  async sendOrderStatusUpdate(customerId: string, order: DeliveryOrder) {
    const user = await this.customersRepo.findById(customerId);
    if (!user.pushToken) return;
    
    const messages = {
      placed: { title: 'Order Placed!', body: `Your order is being sent to ${order.restaurantName}` },
      confirmed: { title: 'Order Confirmed!', body: `${order.restaurantName} is preparing your food` },
      preparing: { title: 'Kitchen is cooking!', body: `Estimated ready in ${order.estimatedPrepMinutes} min` },
      rider_assigned: { title: 'Rider assigned!', body: `${order.riderName} will pick up your order` },
      picked_up: { title: 'Your food is on the way!', body: `${order.riderName} is heading to you` },
      delivered: { title: 'Delivered! 🎉', body: 'Enjoy your meal! Tap to rate your experience' },
      cancelled: { title: 'Order Cancelled', body: `${order.cancellationReason}. Refund initiated.` },
    };
    
    const message = messages[order.status];
    if (!message) return;
    
    await this.sendExpoNotification({
      to: user.pushToken,
      title: message.title,
      body: message.body,
      data: { orderId: order.id, status: order.status },
      sound: 'default',
      channelId: 'orders',
      priority: 'high',
    });
  }
  
  async sendNewOrderToRestaurant(branchId: string, order: DeliveryOrder) {
    // Restaurant uses web app — send via FCM directly or web push
    // OR: restaurant manager has the mobile app too
    const staff = await this.branchesRepo.getActiveStaff(branchId);
    
    await Promise.all(staff.map(s => 
      s.pushToken ? this.sendExpoNotification({
        to: s.pushToken,
        title: '🔔 New Order!',
        body: `Order #${order.orderNumber} — £${order.total}`,
        data: { orderId: order.id, type: 'new_order' },
        sound: 'default',
        priority: 'high',
      }) : null
    ));
  }
  
  async sendNewDeliveryToRider(riderId: string, order: DeliveryOrder) {
    const rider = await this.ridersRepo.findById(riderId);
    if (!rider.pushToken) return;
    
    await this.sendExpoNotification({
      to: rider.pushToken,
      title: '📦 New Delivery Request',
      body: `${order.restaurantName} → ${order.deliveryAddress.line1} · £${order.riderEarning.toFixed(2)}`,
      data: { orderId: order.id, type: 'delivery_request' },
      sound: 'default',
      priority: 'high',
    });
  }
  
  private async sendExpoNotification(message: ExpoPushMessage) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const data = await response.json();
    
    // Handle failed tokens
    if (data.data?.status === 'error') {
      if (data.data.details?.error === 'DeviceNotRegistered') {
        // Remove invalid push token
        await this.removeInvalidToken(message.to);
      }
    }
  }
}
```

---

## 5. Notification Types

| Notification | Who | Trigger | Priority |
|---|---|---|---|
| Order placed | Customer | Order created | High |
| Order confirmed | Customer | Restaurant accepts | High |
| Preparing | Customer | Restaurant marks preparing | Normal |
| Rider assigned | Customer | Rider accepts delivery | High |
| Picked up | Customer | Rider marks pickup | High |
| Delivered | Customer | Rider marks delivered | High |
| Cancelled | Customer | Any cancellation | High |
| Refund processed | Customer | Stripe webhook | Normal |
| New order | Restaurant staff | Order placed | High (sound on) |
| Delivery request | Rider | Order ready for pickup | High (sound on) |
| Order cancelled | Rider | Customer/restaurant cancels | High |

---

## 6. In-App Notification Handling

```typescript
// Show in-app toast when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // If on tracking screen for this order — don't show banner (already seeing it live)
    const currentRoute = router.getCurrentRoute();
    const orderId = notification.request.content.data?.orderId;
    
    if (currentRoute === `/track/${orderId}`) {
      return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false };
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,  // Don't use badge for order updates
    };
  },
});
```

---

## 7. Restaurant Web Push (for portal)

Since the restaurant portal is a Next.js web app, use Web Push API:

```typescript
// next.js restaurant portal: lib/push.ts
export const subscribeToWebPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
  
  await api.post('/branches/push-subscription', { subscription });
};
```

This enables browser push notifications for new orders even when the restaurant portal tab is not in focus.

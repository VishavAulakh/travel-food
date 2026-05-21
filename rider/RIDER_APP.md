# Rider App — Architecture & Feature Plan
**Date:** 2026-05-21  
**Framework:** Expo + React Native (separate app from customer app)

---

## 1. Rider App Architecture

The rider app is a **separate Expo app** from the customer app — different icon, different store listing, different bundle ID.

**Rationale:**
- Fundamentally different UX (delivery-centric, not ordering-centric)
- Background location usage requires separate app privacy justification
- Different App Store category (Navigation / Business)
- Riders are vetted separately (KYC, vehicle verification)

---

## 2. Screens

```
(auth)/
├── login.tsx          ← Phone OTP login
├── register.tsx       ← Name, phone, vehicle details
└── verify.tsx         ← Document verification pending

(tabs)/
├── index.tsx          ← Available orders feed
├── active.tsx         ← Current active delivery
└── earnings.tsx       ← Earnings dashboard

delivery/[orderId]/
├── index.tsx          ← Delivery detail view
├── pickup.tsx         ← At restaurant: confirm pickup
└── deliver.tsx        ← En route + final delivery

profile/
└── index.tsx          ← Vehicle, documents, settings
```

---

## 3. Available Orders Screen

```typescript
// app/(tabs)/index.tsx
const AvailableOrdersScreen = () => {
  const socket = useSocket();
  const { isAvailable, toggleAvailability } = useRiderStore();
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  
  useEffect(() => {
    if (isAvailable) {
      // Listen for nearby order requests
      socket.on('delivery.request', (order) => {
        setAvailableOrders(prev => [...prev, order]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      });
      
      // Order taken by another rider
      socket.on('delivery.request.cancelled', ({ orderId }) => {
        setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      });
    }
    return () => {
      socket.off('delivery.request');
      socket.off('delivery.request.cancelled');
    };
  }, [isAvailable]);
  
  return (
    <View className="flex-1 bg-background">
      {/* Availability Toggle */}
      <View className="p-4 bg-card m-4 rounded-2xl flex-row items-center justify-between">
        <View>
          <Text className="text-white font-bold text-lg">
            {isAvailable ? 'You\'re Online' : 'You\'re Offline'}
          </Text>
          <Text className="text-muted-foreground text-sm">
            {isAvailable ? 'Ready to receive orders' : 'Tap to go online'}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          trackColor={{ true: '#16a34a', false: '#374151' }}
        />
      </View>
      
      {/* Orders */}
      {isAvailable ? (
        availableOrders.length > 0 ? (
          <FlatList
            data={availableOrders}
            renderItem={({ item }) => (
              <OrderRequestCard 
                order={item}
                onAccept={() => acceptOrder(item.id)}
                onReject={() => rejectOrder(item.id)}
                expiresIn={30}  // 30 seconds to accept
              />
            )}
          />
        ) : (
          <EmptyState 
            animation="waiting-for-orders"
            title="Waiting for orders..."
            subtitle="Stay in your delivery zone"
          />
        )
      ) : (
        <OfflineState />
      )}
    </View>
  );
};
```

---

## 4. Active Delivery Screen

```typescript
// app/(tabs)/active.tsx
const ActiveDeliveryScreen = () => {
  const { activeOrder } = useRiderStore();
  const { startTracking, stopTracking } = useRiderTracking(activeOrder?.id);
  
  if (!activeOrder) {
    return <NoActiveDelivery />;
  }
  
  return (
    <View className="flex-1">
      {/* Map (top 60% of screen) */}
      <TrackingMap
        origin={activeOrder.restaurantLocation}
        destination={
          activeOrder.status === 'rider_assigned' 
            ? activeOrder.restaurantLocation  // Navigate to restaurant
            : activeOrder.deliveryLocation     // Navigate to customer
        }
        showRouteFromCurrentLocation
      />
      
      {/* Delivery info panel (bottom 40%) */}
      <View className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl p-6">
        <DeliveryPhaseIndicator status={activeOrder.status} />
        
        {activeOrder.status === 'rider_assigned' && (
          <PickupPanel 
            restaurant={activeOrder.restaurant}
            orderNumber={activeOrder.orderNumber}
            onArrivedAtRestaurant={() => notifyArrivedAtRestaurant(activeOrder.id)}
          />
        )}
        
        {activeOrder.status === 'picked_up' && (
          <DropoffPanel
            customer={activeOrder.customer}
            address={activeOrder.deliveryAddress}
            items={activeOrder.items}
            onDelivered={() => confirmDelivered(activeOrder.id)}
          />
        )}
      </View>
    </View>
  );
};
```

---

## 5. GPS Tracking Implementation

```typescript
// hooks/useRiderTracking.ts
import * as Location from 'expo-location';

export const useRiderTracking = (orderId: string | null) => {
  const socket = useSocket();
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  
  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Required',
        'Please enable location to accept deliveries',
        [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
      );
      return;
    }
    
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,    // Every 3 seconds
        distanceInterval: 5,   // Or every 5 meters
      },
      async (location) => {
        // Send to backend
        socket.emit('rider_location_update', {
          orderId,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          bearing: location.coords.heading ?? 0,
          speed: location.coords.speed ?? 0,
          accuracy: location.coords.accuracy,
          timestamp: new Date(location.timestamp).toISOString(),
        });
      }
    );
  }, [orderId, socket]);
  
  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
  }, []);
  
  // Auto start/stop based on orderId
  useEffect(() => {
    if (orderId) startTracking();
    else stopTracking();
    return () => stopTracking();
  }, [orderId]);
  
  return { startTracking, stopTracking };
};
```

---

## 6. Order Accept/Reject Flow

```typescript
// 30-second countdown to accept
const OrderRequestCard = ({ order, onAccept, onReject, expiresIn }: Props) => {
  const [timeLeft, setTimeLeft] = useState(expiresIn);
  const timerProgress = useSharedValue(1);
  
  useEffect(() => {
    timerProgress.value = withTiming(0, { duration: expiresIn * 1000 });
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onReject(); // Auto-reject when timer expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${timerProgress.value * 100}%`
  }));
  
  return (
    <MotiView 
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      className="bg-card m-4 rounded-2xl overflow-hidden"
    >
      {/* Timer bar */}
      <Animated.View style={progressStyle} className="h-1 bg-primary" />
      
      <View className="p-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-white font-bold text-lg">{order.restaurantName}</Text>
          <Text className="text-primary font-bold text-lg">£{order.riderEarning.toFixed(2)}</Text>
        </View>
        
        <View className="flex-row gap-4 mb-4">
          <InfoPill icon="📍" label={`${order.distanceKm}km`} />
          <InfoPill icon="⏱" label={`~${order.estimatedMinutes} min`} />
          <InfoPill icon="📦" label={`${order.itemCount} items`} />
        </View>
        
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={onReject}
            className="flex-1 py-3 bg-destructive/20 rounded-xl items-center"
          >
            <Text className="text-destructive font-semibold">Decline ({timeLeft}s)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onAccept}
            className="flex-2 py-3 bg-primary rounded-xl items-center flex-1"
          >
            <Text className="text-white font-bold">Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MotiView>
  );
};
```

---

## 7. Earnings Dashboard

```typescript
// app/(tabs)/earnings.tsx
const EarningsScreen = () => {
  const { data } = useQuery({
    queryKey: ['rider-earnings'],
    queryFn: () => api.get('/riders/me/earnings/summary'),
  });
  
  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* Today's total */}
      <Card className="mb-4">
        <Text className="text-muted-foreground">Today's Earnings</Text>
        <CounterAnimation value={data?.today ?? 0} prefix="£" decimals={2} />
        <Text className="text-muted-foreground">{data?.deliveriesToday} deliveries</Text>
      </Card>
      
      {/* This week */}
      <Card className="mb-4">
        <WeeklyBarChart data={data?.weeklyBreakdown} />
      </Card>
      
      {/* Breakdown */}
      <Card>
        <EarningsBreakdown 
          baseEarnings={data?.baseEarnings}
          tips={data?.tips}
          bonuses={data?.bonuses}
        />
      </Card>
      
      {/* Payout history */}
      <PayoutHistoryList payouts={data?.payouts} />
    </ScrollView>
  );
};
```

---

## 8. App Store Listing (Rider App)

```
App Name: GoLocal Rider
Category: Business
Subtitle: "Deliver orders & earn money"
Description: "Accept delivery requests, navigate to restaurants and customers, track your earnings."
Age Rating: 4+
Background Location: Required for real-time delivery tracking
```

**Privacy labels:** Location (precise, while using app and when backgrounded during delivery), earnings data

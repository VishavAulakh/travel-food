# Animation System — Food Delivery Premium UI
**Date:** 2026-05-21  
**Stack:** React Native Reanimated v3 + Lottie + Moti + Gesture Handler

---

## 1. Animation Stack Decision

```
┌─────────────────────────────────────────────────────────┐
│ React Native Reanimated v3                               │
│ → ALL performance-critical animations                    │
│ → Cart bounce, scroll effects, transitions, gestures     │
│ → 60fps+ animations on native thread (not JS thread)    │
├─────────────────────────────────────────────────────────┤
│ Lottie React Native v7.3.6                               │
│ → Complex branded micro-animations                       │
│ → Order placed, delivery confirmed, loading states       │
│ → JSON animation files from LottieFiles.com             │
├─────────────────────────────────────────────────────────┤
│ Moti v0.x                                                │
│ → Skeleton loaders (Skeleton component)                  │
│ → Entrance animations (fadeIn, slideIn)                  │
│ → Declarative Reanimated wrapper                         │
├─────────────────────────────────────────────────────────┤
│ Expo Haptics                                             │
│ → Touch feedback on add-to-cart, confirm, errors        │
│ → ImpactFeedback (light/medium/heavy)                   │
│ → NotificationFeedback (success/warning/error)          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Key Animation Patterns

### 2.1 Add to Cart
```typescript
import { useSharedValue, withSequence, withSpring, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AddToCartButton = ({ onPress }: Props) => {
  const scale = useSharedValue(1);
  const cartBadgeScale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const cartBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cartBadgeScale.value }]
  }));
  
  const handlePress = () => {
    // Button bounce
    scale.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    // Cart badge bounce
    cartBadgeScale.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withSpring(1, { damping: 6 })
    );
    // Haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={handlePress} className="bg-primary rounded-full px-6 py-3">
        <Text className="text-white font-bold">Add to cart</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### 2.2 Restaurant Card Scroll Effect (Parallax Header)
```typescript
import { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, interpolate } from 'react-native-reanimated';

const RestaurantPage = () => {
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });
  
  const headerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: interpolate(scrollY.value, [0, 200], [0, -50], 'clamp')
    }],
    opacity: interpolate(scrollY.value, [0, 150], [1, 0.7], 'clamp')
  }));
  
  return (
    <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
      <Animated.View style={headerStyle}>
        <Image source={{ uri: restaurant.coverImage }} className="h-48 w-full" />
      </Animated.View>
      {/* Menu content */}
    </Animated.ScrollView>
  );
};
```

### 2.3 Skeleton Loader (Moti)
```typescript
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';

const RestaurantCardSkeleton = () => (
  <MotiView className="bg-card rounded-2xl overflow-hidden m-4">
    <Skeleton colorMode="dark" width="100%" height={150} radius={0} />
    <View className="p-4 gap-2">
      <Skeleton colorMode="dark" width={180} height={18} radius={4} />
      <Skeleton colorMode="dark" width={120} height={14} radius={4} />
      <View className="flex-row gap-4">
        <Skeleton colorMode="dark" width={60} height={12} radius={4} />
        <Skeleton colorMode="dark" width={60} height={12} radius={4} />
      </View>
    </View>
  </MotiView>
);

// Usage with loading state
const RestaurantList = () => {
  const { data, isLoading } = useRestaurants();
  
  if (isLoading) {
    return (
      <>
        {[1,2,3].map(i => <RestaurantCardSkeleton key={i} />)}
      </>
    );
  }
  return data?.map(r => <RestaurantCard key={r.id} restaurant={r} />);
};
```

### 2.4 Order Placed Success (Lottie)
```typescript
import LottieView from 'lottie-react-native';

const OrderConfirmedScreen = ({ orderId }: Props) => {
  const animation = useRef<LottieView>(null);
  
  useEffect(() => {
    animation.current?.play();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <LottieView
        ref={animation}
        source={require('@/assets/animations/order-placed.json')}
        style={{ width: 200, height: 200 }}
        autoPlay
        loop={false}
        onAnimationFinish={() => {
          // Navigate to tracking after animation
          router.replace(`/track/${orderId}`);
        }}
      />
      <Text className="text-2xl font-bold text-foreground mt-4">Order Placed!</Text>
      <Text className="text-muted-foreground mt-2">Waiting for restaurant to confirm</Text>
    </View>
  );
};
```

### 2.5 Live Order Tracking — Animated Rider Marker
```typescript
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const TrackingMap = ({ riderLocation, route }: Props) => {
  const markerLat = useSharedValue(riderLocation.lat);
  const markerLng = useSharedValue(riderLocation.lng);
  
  // Smooth GPS update transitions
  useEffect(() => {
    markerLat.value = withSpring(riderLocation.lat, { damping: 20 });
    markerLng.value = withSpring(riderLocation.lng, { damping: 20 });
  }, [riderLocation]);
  
  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: riderLocation.lat,
        longitude: riderLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation
      followsUserLocation={false}
    >
      <Marker coordinate={{ latitude: markerLat.value, longitude: markerLng.value }}>
        <RiderMarkerIcon bearing={riderLocation.bearing} />
      </Marker>
      <Polyline coordinates={route} strokeColor="#FF6B35" strokeWidth={3} />
    </MapView>
  );
};
```

### 2.6 Bottom Sheet Cart (Gesture Handler)
```typescript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const CartBottomSheet = ({ isVisible, onClose, children }: Props) => {
  const translateY = useSharedValue(600);  // Start off-screen
  
  useEffect(() => {
    translateY.value = withSpring(isVisible ? 0 : 600, {
      damping: 25,
      stiffness: 300,
    });
  }, [isVisible]);
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150) {
        translateY.value = withSpring(600);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });
  
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));
  
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View className="w-12 h-1 bg-muted rounded-full mx-auto my-2" />
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
```

### 2.7 Order Status Progress Bar
```typescript
const OrderStatusBar = ({ status }: { status: OrderStatus }) => {
  const steps = ['placed', 'confirmed', 'preparing', 'picked_up', 'en_route', 'delivered'];
  const currentIndex = steps.indexOf(status);
  
  const progressWidth = useSharedValue(0);
  
  useEffect(() => {
    progressWidth.value = withSpring((currentIndex / (steps.length - 1)) * 100);
  }, [status]);
  
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`
  }));
  
  return (
    <View className="my-4">
      <View className="h-2 bg-muted rounded-full">
        <Animated.View style={progressStyle} className="h-full bg-primary rounded-full" />
      </View>
      <Text className="text-primary font-medium mt-2">{STATUS_LABELS[status]}</Text>
    </View>
  );
};
```

---

## 3. Lottie Animations Required

Source animations from https://lottiefiles.com (free tier available):

| Animation | Trigger | Search Term |
|---|---|---|
| Order placed | After checkout success | "order confirmed" "checkmark" |
| Cooking/preparing | Restaurant confirmed | "cooking" "chef" "food prep" |
| Rider on way | Picked up status | "delivery bike" "scooter delivery" |
| Delivered | Final status | "package delivered" "success" |
| Empty cart | Cart is empty | "empty box" "shopping empty" |
| No restaurants | No results | "empty food" "no results" |
| Loading food | Initial load | "food loading" "plate spinner" |
| Error state | API errors | "error" "oops" |

---

## 4. Performance Rules

1. **NEVER run animations on the JS thread** — use Reanimated's `useAnimatedStyle` not `Animated.Value`
2. **Keep FlatList scrolling at 60fps** — use `getItemLayout` when items are fixed height
3. **Memoize components** that receive animation values — `React.memo` + `useCallback`
4. **Lazy-load Lottie** — import only on screens that use it
5. **Skeleton > spinner** — skeletons reduce perceived wait time by 40%
6. **Haptic timing** — fire haptic BEFORE animation starts (user feels action immediately)
7. **Map marker updates** — use `withSpring` not `withTiming` for GPS position changes (smoother)
8. **Reduce bridge calls** — all animation work in worklets on UI thread

---

## 5. Screen-by-Screen Animation Plan

| Screen | Animation |
|---|---|
| Home feed | Restaurant cards fade-in stagger (Moti), skeleton loaders |
| Restaurant page | Parallax header image scroll |
| Menu items | Add-to-cart button bounce + cart badge pulse |
| Cart | Item swipe-to-delete (Gesture Handler), total price spring update |
| Checkout | Progress steps with animated underline |
| Order placed | Lottie success animation → navigate |
| Order tracking | Animated rider marker on map, status progress bar |
| Delivered | Lottie delivery animation, rating prompt slide-up |
| Earnings (Rider) | Number counter animation for daily total |

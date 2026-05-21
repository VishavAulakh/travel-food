# Maps & Location Tracking Guide
**Date:** 2026-05-21

---

## 1. Library Decisions

### Customer App
- **react-native-maps** v1.27.2 — map display, restaurant pins
- **expo-location** — current location for address detection
- **PostGIS** (backend) — zone coverage checks, distance calculations

### Rider App
- **react-native-maps** — navigation map, route display
- **expo-location** — GPS for delivery tracking
- **react-native-background-geolocation** — background GPS (custom dev build required)

---

## 2. Setup

### app.json
```json
{
  "expo": {
    "plugins": [
      ["expo-location", {
        "locationAlwaysAndWhenInUsePermission":
          "GoLocal needs your location to track your delivery route.",
        "locationWhenInUsePermission":
          "GoLocal uses your location to find nearby restaurants."
      }],
      ["react-native-maps", {
        "googleMapsApiKey": "GOOGLE_MAPS_API_KEY_HERE"
      }]
    ],
    "android": {
      "config": {
        "googleMaps": { "apiKey": "GOOGLE_MAPS_ANDROID_KEY" }
      }
    }
  }
}
```

### Google Cloud Console — APIs to Enable
- Maps SDK for Android
- Maps SDK for iOS
- Directions API (rider route calculation)
- Geocoding API (address → lat/lng)
- Places API (address autocomplete)

**Cost estimate at food delivery scale:**
- Maps SDK: Free for ≤28,000 mobile loads/month, then $7/1000
- Directions: $10/1000 requests
- Geocoding: $5/1000 requests
- At 1000 orders/day: ~$50-100/month initially

---

## 3. Customer App — Restaurant Map

```typescript
// components/RestaurantMapView.tsx
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const RestaurantMapView = ({ restaurants, userLocation }: Props) => (
  <MapView
    provider={PROVIDER_GOOGLE}
    style={{ flex: 1 }}
    initialRegion={{
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }}
    showsUserLocation
    showsMyLocationButton
    customMapStyle={DARK_MAP_STYLE}  // Match app dark theme
  >
    {restaurants.map(r => (
      <Marker
        key={r.id}
        coordinate={{ latitude: r.lat, longitude: r.lng }}
        onPress={() => router.push(`/restaurant/${r.id}`)}
      >
        <RestaurantMapPin name={r.name} rating={r.rating} />
      </Marker>
    ))}
  </MapView>
);
```

---

## 4. Live Rider Tracking (Customer View)

```typescript
// app/track/[orderId].tsx
import { useEffect, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSocket } from '@/hooks/useSocket';

const TrackOrderScreen = ({ orderId }: Props) => {
  const mapRef = useRef<MapView>(null);
  const [riderLocation, setRiderLocation] = useState<Location | null>(null);
  const socket = useSocket();
  
  useEffect(() => {
    // Join order tracking room
    socket.emit('join_order_room', orderId);
    
    // Listen for rider location updates
    socket.on(`order:${orderId}:rider_location`, (location) => {
      setRiderLocation(location);
      
      // Auto-pan map to include both rider and delivery address
      mapRef.current?.fitToCoordinates(
        [location, deliveryAddress],
        { edgePadding: { top: 80, right: 40, bottom: 80, left: 40 }, animated: true }
      );
    });
    
    return () => {
      socket.emit('leave_order_room', orderId);
      socket.off(`order:${orderId}:rider_location`);
    };
  }, [orderId]);
  
  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={{ flex: 2 }}>
        {riderLocation && (
          <Marker coordinate={{ latitude: riderLocation.lat, longitude: riderLocation.lng }}>
            <RiderBikeIcon bearing={riderLocation.bearing} />
          </Marker>
        )}
        <Marker coordinate={deliveryAddress} title="Your location">
          <HomeIcon />
        </Marker>
        {route && (
          <Polyline coordinates={route} strokeColor="#FF6B35" strokeWidth={3} lineDashPattern={[5, 3]} />
        )}
      </MapView>
      <OrderStatusPanel orderId={orderId} />
    </View>
  );
};
```

---

## 5. Rider App — GPS Broadcasting

```typescript
// hooks/useRiderTracking.ts
import * as Location from 'expo-location';
import { useSocket } from './useSocket';

export const useRiderTracking = (orderId: string | null) => {
  const socket = useSocket();
  const watchId = useRef<Location.LocationSubscription | null>(null);
  
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    
    watchId.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,    // Every 3 seconds
        distanceInterval: 10,  // Or every 10 meters
      },
      (location) => {
        socket.emit('rider_location_update', {
          orderId,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          bearing: location.coords.heading,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        });
      }
    );
  };
  
  const stopTracking = () => {
    watchId.current?.remove();
    watchId.current = null;
  };
  
  useEffect(() => {
    if (orderId) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [orderId]);
};
```

---

## 6. Backend — Delivery Zone Check (PostGIS)

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add spatial column to delivery_zones
ALTER TABLE delivery_zones ADD COLUMN geom GEOMETRY(Polygon, 4326);

-- Spatial index
CREATE INDEX idx_delivery_zones_geom ON delivery_zones USING GIST (geom);

-- Check if point is in any delivery zone for a branch
SELECT 
  dz.*,
  ST_Distance(
    geom::geography, 
    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
  ) / 1000 as distance_km
FROM delivery_zones dz
WHERE branch_id = $3
  AND is_active = TRUE
  AND ST_Contains(geom, ST_SetSRID(ST_MakePoint($2, $1), 4326))
ORDER BY sort_order
LIMIT 1;
```

```typescript
// NestJS: zones.service.ts
async checkCoverage(branchId: string, lat: number, lng: number) {
  const result = await this.prisma.$queryRaw`
    SELECT id, name, delivery_fee, estimated_minutes, distance_km
    FROM delivery_zones
    WHERE branch_id = ${branchId}
      AND is_active = TRUE
      AND ST_Contains(
        ST_SetSRID(polygon_geom, 4326),
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      )
    ORDER BY sort_order LIMIT 1
  `;
  
  if (!result.length) {
    return { covered: false };
  }
  
  return {
    covered: true,
    zone: result[0],
    deliveryFee: result[0].delivery_fee,
    estimatedMinutes: result[0].estimated_minutes,
  };
}
```

---

## 7. Address Autocomplete (Google Places)

```typescript
// components/AddressSearch.tsx
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const AddressSearch = ({ onSelect }: Props) => (
  <GooglePlacesAutocomplete
    placeholder="Enter delivery address"
    onPress={(data, details = null) => {
      const lat = details?.geometry?.location?.lat;
      const lng = details?.geometry?.location?.lng;
      onSelect({ 
        formatted: data.description,
        lat, lng 
      });
    }}
    query={{
      key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      language: 'en',
      components: 'country:gb',  // UK only
    }}
    fetchDetails
    styles={{ container: { flex: 0 }, textInput: { backgroundColor: '#1F2937' } }}
  />
);
```

**Package:** `react-native-google-places-autocomplete`  
**Stars:** 2,400+, actively maintained

---

## 8. Dark Map Style

```typescript
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
];
```

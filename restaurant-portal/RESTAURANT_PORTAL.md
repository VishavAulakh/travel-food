# Restaurant Portal — Architecture & Feature Plan
**Date:** 2026-05-21  
**Decision:** Extend BILLING Next.js 14 frontend  
**Location:** BILLING/frontend/

---

## 1. Current State (Already Built)

The BILLING Next.js 14 frontend has 85% of restaurant management built:

| Page | Status | Delivery Use |
|---|---|---|
| Dashboard | ✅ Built + wired | Extend with delivery metrics |
| Products/Menu | ✅ Full CRUD | Direct reuse as menu management |
| Categories | ✅ Full CRUD | Menu sections (Starters, Mains, etc.) |
| Customers | ✅ Full CRUD | Customer history (POS + delivery combined) |
| Invoices | ✅ Full list/void | Order history (delivery invoices appear here) |
| Analytics | ✅ Charts + heatmaps | Extend with delivery breakdown |
| Branches | ✅ Multi-branch | Restaurant locations |
| Settings | ✅ 6 tabs | Add delivery config tab |
| ReviewRise | ✅ Full panel | Post-delivery reviews automatic |
| Auth | ✅ Login/register | Direct reuse |

**Estimated: 80% of portal is ALREADY BUILT.**

---

## 2. New Pages to Add (Delivery-Specific)

### 2.1 `/portal/orders` — Live Orders Queue (NEW — CRITICAL)

This is the most important new page. Restaurant staff see incoming delivery orders in real-time.

**Features:**
- Real-time incoming order notifications (Socket.io + sound)
- Order cards showing: items, customer, delivery address, total, time
- Accept / Reject with one click
- Set estimated prep time when accepting
- "Ready for pickup" button when food is prepared
- Order history tab (past orders of the day)

**Implementation:**
```typescript
// pages/portal/orders/page.tsx (Next.js 14 App Router)
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const socket = useSocket();
  
  useEffect(() => {
    // Listen for new orders
    socket.on('delivery.order.placed', (order) => {
      setOrders(prev => [order, ...prev]);
      // Browser notification + sound
      new Audio('/sounds/new-order.mp3').play();
      document.title = `(${orders.length + 1}) New Order!`;
    });
    
    socket.on('delivery.order.status_change', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status } : o
      ));
    });
    
    return () => {
      socket.off('delivery.order.placed');
      socket.off('delivery.order.status_change');
    };
  }, [socket]);
  
  const pendingOrders = orders.filter(o => o.status === 'placed');
  const activeOrders = orders.filter(o => 
    ['confirmed', 'preparing', 'ready_for_pickup', 'rider_assigned', 'picked_up'].includes(o.status)
  );
  
  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Column 1: New Orders */}
      <OrderColumn 
        title="New Orders" 
        orders={pendingOrders}
        action="confirm"
        accentColor="yellow"
      />
      
      {/* Column 2: In Progress */}
      <OrderColumn 
        title="In Kitchen" 
        orders={activeOrders.filter(o => ['confirmed', 'preparing'].includes(o.status))}
        action="mark_ready"
        accentColor="blue"
      />
      
      {/* Column 3: Ready / Dispatched */}
      <OrderColumn 
        title="Ready / Out for Delivery" 
        orders={activeOrders.filter(o => ['ready_for_pickup', 'rider_assigned', 'picked_up', 'en_route'].includes(o.status))}
        accentColor="green"
      />
    </div>
  );
}
```

**UI Design:** Kanban board (3 columns: New → Preparing → Dispatched)  
Matches the BILLING dark glassmorphism design system.

---

### 2.2 `/portal/zones` — Delivery Zone Editor (NEW)

Restaurant configures their delivery geography.

**Features:**
- Interactive map with Google Maps
- Draw circular radius zones or custom polygons
- Set delivery fee per zone
- Set minimum order per zone
- Enable/disable zones
- Preview customer coverage area

```typescript
// components/ZoneEditor.tsx
import { GoogleMap, Circle, Polygon, DrawingManager } from '@react-google-maps/api';

const ZoneEditor = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  
  return (
    <GoogleMap
      center={restaurantLocation}
      zoom={12}
      mapContainerStyle={{ height: '500px', width: '100%' }}
      options={{ styles: DARK_MAP_STYLE }}
    >
      {zones.map(zone => (
        zone.type === 'radius' 
          ? <Circle center={zone.center} radius={zone.radiusMeters} />
          : <Polygon paths={zone.polygonCoords} />
      ))}
      
      <DrawingManager
        drawingMode="circle"
        onCircleComplete={handleCircleComplete}
        onPolygonComplete={handlePolygonComplete}
      />
    </GoogleMap>
  );
};
```

---

### 2.3 `/portal/hours` — Opening Hours (NEW)

```typescript
// Simple 7-day schedule editor
const HoursPage = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <Card>
      <div className="space-y-4">
        {/* Quick toggle */}
        <div className="flex items-center justify-between p-4 bg-card rounded-xl">
          <div>
            <h3 className="font-semibold">Accepting Orders</h3>
            <p className="text-muted-foreground text-sm">Temporarily stop receiving orders</p>
          </div>
          <Switch checked={isAccepting} onCheckedChange={toggleAcceptance} />
        </div>
        
        {/* Day-by-day hours */}
        {days.map((day, index) => (
          <DayHoursRow 
            key={day}
            day={day}
            dayIndex={index}
            hours={hours[index]}
            onChange={(h) => updateHours(index, h)}
          />
        ))}
      </div>
    </Card>
  );
};
```

---

### 2.4 Dashboard Extension — Delivery Metrics Widget

```typescript
// Add to existing dashboard page
const DeliveryMetricsWidget = () => {
  const { data } = useQuery({
    queryKey: ['delivery-today-metrics'],
    queryFn: () => api.get('/delivery/stats/today'),
    refetchInterval: 30000, // refresh every 30s
  });
  
  return (
    <Card className="col-span-2">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          label="Orders Today" 
          value={data?.totalOrders} 
          trend={data?.ordersTrend}
          icon="🛵"
        />
        <MetricCard 
          label="Pending" 
          value={data?.pendingOrders}
          color={data?.pendingOrders > 5 ? 'red' : 'green'}
          icon="⏳"
        />
        <MetricCard 
          label="Delivery Revenue" 
          value={`£${data?.deliveryRevenue.toFixed(2)}`}
          icon="💰"
        />
        <MetricCard 
          label="Avg Delivery Time" 
          value={`${data?.avgDeliveryMinutes} min`}
          icon="⚡"
        />
      </div>
    </Card>
  );
};
```

---

## 3. Modified Existing Pages

### Products → Menu Management
The existing products page already handles everything needed for menu management:
- Add/edit/delete dishes with images
- Variants (sizes, options)
- Pricing
- Categories (menu sections)

**Only additions needed:**
- "Available for delivery" toggle per item (maps to `is_active` flag)
- Dietary labels (vegetarian, vegan, spicy, allergens) — add to `metadata` JSONB

### Settings → Add Delivery Tab
Add a 7th tab to the existing 6-tab settings page:
- Minimum order amount
- Delivery fee configuration
- Commission display
- Connect to Stripe (for payouts)

---

## 4. UI/UX Standards

All new pages follow existing BILLING design system:
- Background: `#111827`
- Cards: `#1F2937`
- Accent: `#16a34a` (green) + `#FF6B35` (delivery orange accent)
- Font: Geist
- Components: shadcn/ui
- Animations: Framer Motion (already installed)
- Icons: lucide-react (already installed)

**New components needed:**
- `<OrderCard />` — delivery order display card
- `<OrderStatusBadge />` — status pill with color coding
- `<ZoneMap />` — Google Maps zone editor
- `<DayHoursRow />` — opening hours day row
- `<DeliveryMetricsWidget />` — delivery KPI cards
- `<RiderPing />` — rider location on restaurant portal map

---

## 5. Real-time Integration

Restaurant portal already has Socket.io infrastructure pattern from BILLING.  
Extend existing WebSocket client connection:

```typescript
// lib/socket.ts (extend existing)
const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: getAccessToken() }
});

// NEW: Listen for delivery events
socket.on('delivery.order.placed', handler);
socket.on('delivery.order.status_change', handler);
socket.on('delivery.rider.location', handler);  // For portal map view
```

---

## 6. Build Estimate

| Page/Feature | Effort |
|---|---|
| Orders queue (Kanban) | 4 days |
| Zone editor (Google Maps) | 3 days |
| Opening hours | 1 day |
| Dashboard delivery widget | 1 day |
| Analytics delivery breakdown | 1 day |
| Menu/products dietary labels | 0.5 days |
| Settings delivery tab | 1 day |
| **Total** | **~11.5 days** |

Compared to building a fresh restaurant portal from scratch: ~40-60 days.  
**Estimated effort saving: 75%** by extending BILLING frontend.

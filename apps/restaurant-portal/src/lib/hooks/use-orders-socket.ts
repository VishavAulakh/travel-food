"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { DeliveryOrder, OrderStatus } from "@/types";

export function useOrdersSocket(
  branchId: string | null,
  onNewOrder: (order: DeliveryOrder) => void,
  onStatusChange: (orderId: string, status: OrderStatus) => void
): { isConnected: boolean } {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Stable refs so the socket callbacks never go stale between renders
  const onNewOrderRef = useRef(onNewOrder);
  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => { onNewOrderRef.current = onNewOrder; }, [onNewOrder]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);

  useEffect(() => {
    // localStorage is only available in the browser
    let token = "";
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("restaurant-auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.state?.token ?? "";
        }
      } catch {
        // ignore parse errors
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3002";

    const socket: Socket = io(`${baseUrl}/ws`, {
      auth: { token },
      autoConnect: false,
    });

    socketRef.current = socket;

    // ── Connection events ─────────────────────────────────────────────────
    socket.on("connect", () => {
      setIsConnected(true);
      if (branchId && token) {
        socket.emit("join_restaurant_room", { branchId, token });
      }
    });
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));

    // ── Order events ──────────────────────────────────────────────────────
    socket.on("delivery.order.placed", (order: DeliveryOrder) => {
      // Play notification sound (file may not exist in dev – swallow errors)
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.play().catch(() => {/* ignore AbortError / no-file */});
      } catch {
        // Audio API not available (e.g. SSR hydration mismatch)
      }

      onNewOrderRef.current(order);
    });

    socket.on(
      "delivery.order.status_change",
      ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
        onStatusChangeRef.current(orderId, status);
      }
    );

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Re-connect when branchId changes so we join the correct room
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  return { isConnected };
}

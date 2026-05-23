import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { OrderStatus } from "../../lib/mock/orders";
import { ORDER_STATUS_META } from "../../lib/mock/orders";

type Props = {
  status: OrderStatus;
  size?: "sm" | "md";
};

const STATUS_COLOR: Record<OrderStatus, { bg: string; fg: string }> = {
  placed: { bg: "#FFF4F0", fg: "#C23B14" },
  confirmed: { bg: "#FEF3C7", fg: "#92400E" },
  preparing: { bg: "#FFEDD5", fg: "#9A3412" },
  ready: { bg: "#DBEAFE", fg: "#1E40AF" },
  picked_up: { bg: "#E0E7FF", fg: "#3730A3" },
  on_the_way: { bg: "#DCFCE7", fg: "#166534" },
  delivered: { bg: "#F0FDF4", fg: "#15803D" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
};

export function OrderStatusBadge({ status, size = "sm" }: Props) {
  const meta = ORDER_STATUS_META[status];
  const colors = STATUS_COLOR[status];
  const sizeCls = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";
  const textCls = size === "sm" ? "text-2xs" : "text-xs";

  return (
    <View
      className={`flex-row items-center rounded-md ${sizeCls}`}
      style={{ backgroundColor: colors.bg }}
    >
      <Ionicons
        name={meta.icon as any}
        size={size === "sm" ? 10 : 12}
        color={colors.fg}
        style={{ marginRight: 4 }}
      />
      <Text className={`font-bold ${textCls} uppercase tracking-wide`} style={{ color: colors.fg }}>
        {meta.label}
      </Text>
    </View>
  );
}

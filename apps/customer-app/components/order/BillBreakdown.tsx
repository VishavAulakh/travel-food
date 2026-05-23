import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatINR } from "../../lib/format";
import { Divider } from "../ui/Divider";

type Props = {
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  discountPaise?: number;
  totalPaise: number;
  showTitle?: boolean;
};

export function BillBreakdown({
  itemsTotalPaise,
  deliveryFeePaise,
  taxPaise,
  discountPaise = 0,
  totalPaise,
  showTitle = true,
}: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-ink-100">
      {showTitle ? (
        <View className="flex-row items-center mb-3">
          <Ionicons name="receipt-outline" size={16} color="#0A0A0A" />
          <Text className="text-ink-900 font-bold text-sm ml-2">Bill Details</Text>
        </View>
      ) : null}

      <Row label="Item Total" value={formatINR(itemsTotalPaise)} />
      <Row
        label="Delivery Fee"
        value={
          deliveryFeePaise === 0 ? "FREE" : formatINR(deliveryFeePaise)
        }
        valueColor={deliveryFeePaise === 0 ? "#16A34A" : undefined}
        valueStrikethrough={deliveryFeePaise === 0}
      />
      {discountPaise > 0 ? (
        <Row
          label="Promo Discount"
          value={`- ${formatINR(discountPaise)}`}
          valueColor="#16A34A"
          icon="pricetag"
        />
      ) : null}
      <Row label="Taxes & Charges" value={formatINR(taxPaise)} />

      <Divider className="my-3" dashed />

      <View className="flex-row items-center justify-between">
        <Text className="text-ink-900 font-bold text-base">TO PAY</Text>
        <Text className="text-ink-900 font-extrabold text-lg">
          {formatINR(totalPaise)}
        </Text>
      </View>

      {discountPaise > 0 ? (
        <View className="mt-3 bg-success/10 rounded-lg px-3 py-2 flex-row items-center">
          <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
          <Text className="text-success text-xs font-semibold ml-2">
            You saved {formatINR(discountPaise)} on this order
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  valueColor,
  valueStrikethrough,
  icon,
}: {
  label: string;
  value: string;
  valueColor?: string;
  valueStrikethrough?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <View className="flex-row items-center">
        {icon ? <Ionicons name={icon} size={12} color="#737373" style={{ marginRight: 6 }} /> : null}
        <Text className="text-ink-600 text-sm">{label}</Text>
      </View>
      <Text
        className="text-sm font-medium"
        style={{
          color: valueColor ?? "#171717",
          textDecorationLine: valueStrikethrough ? "line-through" : "none",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

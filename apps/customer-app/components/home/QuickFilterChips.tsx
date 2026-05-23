import React, { useState } from "react";
import { ScrollView } from "react-native";
import { Chip } from "../ui/Chip";

type Filter = {
  key: string;
  label: string;
  icon?: React.ComponentProps<typeof Chip>["icon"];
};

const DEFAULT_FILTERS: Filter[] = [
  { key: "filter", label: "Filter", icon: "options-outline" },
  { key: "sort", label: "Sort By", icon: "swap-vertical" },
  { key: "fast", label: "Fast Delivery" },
  { key: "rating", label: "Rating 4.0+" },
  { key: "veg", label: "Pure Veg" },
  { key: "offers", label: "Offers" },
];

type Props = {
  filters?: Filter[];
  onChange?: (active: string[]) => void;
};

// Horizontally scrolling filter row — multi-select for toggle filters,
// pseudo-toggle for "Filter"/"Sort By" entry points.
export function QuickFilterChips({ filters = DEFAULT_FILTERS, onChange }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setActive(next);
    onChange?.(Array.from(next));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {filters.map((f) => (
        <Chip
          key={f.key}
          label={f.label}
          icon={f.icon}
          active={active.has(f.key)}
          onPress={() => toggle(f.key)}
        />
      ))}
    </ScrollView>
  );
}

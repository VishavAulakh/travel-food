import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";
import { shadows } from "../../lib/theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  haptic?: "light" | "medium" | "heavy" | "success" | "none";
  className?: string;
  subLabel?: string;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand",
  secondary: "bg-ink-900",
  outline: "bg-white border border-ink-200",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const variantText: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-ink-900",
  ghost: "text-brand",
  danger: "text-white",
};

const sizeClasses: Record<Size, { container: string; text: string; iconSize: number }> = {
  sm: { container: "px-4 py-2 rounded-lg", text: "text-sm font-semibold", iconSize: 16 },
  md: { container: "px-5 py-3.5 rounded-xl", text: "text-base font-semibold", iconSize: 18 },
  lg: { container: "px-6 py-4 rounded-2xl", text: "text-base font-bold", iconSize: 20 },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  iconPosition = "left",
  fullWidth,
  haptic = "medium",
  className,
  subLabel,
}: Props) {
  const isDisabled = disabled || loading;
  const sizeConfig = sizeClasses[size];

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      haptic={isDisabled ? "none" : haptic}
      scaleTo={0.97}
      style={[
        variant === "primary" && !isDisabled ? shadows.brand : null,
        isDisabled ? { opacity: 0.5 } : null,
      ]}
      className={`${variantClasses[variant]} ${sizeConfig.container} ${
        fullWidth ? "self-stretch" : "self-start"
      } items-center justify-center flex-row ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#0A0A0A" : "#fff"} />
      ) : (
        <>
          {icon && iconPosition === "left" ? (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={variant === "outline" ? "#0A0A0A" : "#fff"}
              style={{ marginRight: 8 }}
            />
          ) : null}
          <View className="items-center">
            <Text className={`${variantText[variant]} ${sizeConfig.text}`}>{label}</Text>
            {subLabel ? (
              <Text
                className={`${variantText[variant]} text-2xs opacity-80 mt-0.5`}
              >
                {subLabel}
              </Text>
            ) : null}
          </View>
          {icon && iconPosition === "right" ? (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={variant === "outline" ? "#0A0A0A" : "#fff"}
              style={{ marginLeft: 8 }}
            />
          ) : null}
        </>
      )}
    </PressableScale>
  );
}

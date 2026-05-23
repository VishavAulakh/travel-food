import { cn } from "@/lib/utils";

interface VegNonvegIndicatorProps {
  isVeg: boolean;
  className?: string;
}

export function VegNonvegIndicator({ isVeg, className }: VegNonvegIndicatorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center flex-shrink-0",
        "rounded-[3px] border-2",
        isVeg ? "border-green-500" : "border-[#8B2500]",
        className
      )}
      style={{ width: 14, height: 14 }}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <div
        className={cn(
          "rounded-full",
          isVeg ? "bg-green-500" : "bg-[#8B2500]"
        )}
        style={{ width: 6, height: 6 }}
      />
    </div>
  );
}

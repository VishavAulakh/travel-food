"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { X, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "@/types";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/mock/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priceRupees: z
    .number({ invalid_type_error: "Enter a valid price" })
    .positive("Price must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  isVeg: z.boolean(),
  imageUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  isAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

export type AddEditProductSheetProps = {
  open: boolean;
  onClose: () => void;
  item?: MenuItem | null;
  onSave: (item: Omit<MenuItem, "id"> & { id?: string }) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddEditProductSheet({
  open,
  onClose,
  item,
  onSave,
}: AddEditProductSheetProps) {
  const isEditMode = Boolean(item);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      priceRupees: undefined,
      category: "",
      isVeg: true,
      imageUrl: "",
      isAvailable: true,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        description: item.description ?? "",
        priceRupees: item.pricePaise / 100,
        category: item.category,
        isVeg: item.isVeg,
        imageUrl: item.imageUrl ?? "",
        isAvailable: item.isAvailable,
      });
    } else {
      reset({
        name: "",
        description: "",
        priceRupees: undefined,
        category: "",
        isVeg: true,
        imageUrl: "",
        isAvailable: true,
      });
    }
  }, [item, reset, open]);

  const isVegValue = watch("isVeg");
  const categoryValue = watch("category");

  const onSubmit = async (values: FormValues) => {
    const payload: Omit<MenuItem, "id"> & { id?: string } = {
      ...(item?.id ? { id: item.id } : {}),
      name: values.name,
      description: values.description || undefined,
      pricePaise: Math.round(values.priceRupees * 100),
      category: values.category,
      isVeg: values.isVeg,
      imageUrl: values.imageUrl || undefined,
      isAvailable: values.isAvailable,
    };

    onSave(payload);
    toast.success(isEditMode ? "Item updated!" : "Item saved!");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />

        {/* Content — full-width bottom sheet on mobile, centered modal on sm+ */}
        <Dialog.Content
          className={cn(
            "fixed z-50 bg-[hsl(240,10%,7%)] border border-white/[0.08] shadow-2xl",
            "focus:outline-none",
            // Mobile: bottom sheet
            "bottom-0 left-0 right-0 rounded-t-2xl max-h-[92dvh] overflow-y-auto",
            // Desktop: centered modal
            "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:rounded-2xl sm:max-w-lg sm:w-full sm:max-h-[90dvh]",
            "data-[state=open]:animate-slide-up sm:data-[state=open]:animate-fade-in"
          )}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {isEditMode ? "Edit Item" : "Add New Item"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Chicken Biryani"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && (
                <p className="text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Short description of the dish..."
                rows={2}
                {...register("description")}
                className={cn(
                  "flex w-full rounded-md border border-input bg-secondary/40 px-3 py-2",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "resize-none transition-colors"
                )}
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="priceRupees">Price (₹) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  ₹
                </span>
                <Input
                  id="priceRupees"
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0"
                  className={cn("pl-7", errors.priceRupees && "border-destructive")}
                  {...register("priceRupees", { valueAsNumber: true })}
                />
              </div>
              {errors.priceRupees && (
                <p className="text-xs text-red-400">{errors.priceRupees.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger
                      className={cn(
                        "flex h-10 w-full items-center justify-between rounded-md border border-input",
                        "bg-secondary/40 px-3 py-2 text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                        "data-[placeholder]:text-muted-foreground",
                        errors.category && "border-destructive"
                      )}
                    >
                      <Select.Value placeholder="Select a category" />
                      <Select.Icon>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        className={cn(
                          "z-[200] overflow-hidden rounded-xl border border-white/[0.08]",
                          "bg-[hsl(240,10%,9%)] shadow-xl",
                          "data-[state=open]:animate-fade-in"
                        )}
                        position="popper"
                        sideOffset={4}
                      >
                        <Select.Viewport className="p-1">
                          {CATEGORIES.map((cat) => (
                            <Select.Item
                              key={cat}
                              value={cat}
                              className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2",
                                "text-sm text-foreground outline-none",
                                "data-[highlighted]:bg-white/[0.06] data-[highlighted]:text-foreground",
                                "data-[state=checked]:text-primary"
                              )}
                            >
                              <Select.ItemText>{cat}</Select.ItemText>
                              <Select.ItemIndicator className="absolute right-3">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-400">{errors.category.message}</p>
              )}
            </div>

            {/* Veg / Non-veg toggle chips */}
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setValue("isVeg", true)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150",
                    isVegValue
                      ? "bg-green-500/15 border-green-500/60 text-green-400"
                      : "bg-transparent border-white/[0.12] text-muted-foreground hover:border-white/25"
                  )}
                >
                  <span>🟢</span> Veg
                </button>
                <button
                  type="button"
                  onClick={() => setValue("isVeg", false)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150",
                    !isVegValue
                      ? "bg-red-500/15 border-red-500/60 text-red-400"
                      : "bg-transparent border-white/[0.12] text-muted-foreground hover:border-white/25"
                  )}
                >
                  <span>🔴</span> Non-Veg
                </button>
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://images.unsplash.com/..."
                {...register("imageUrl")}
                className={cn(errors.imageUrl && "border-destructive")}
              />
              {errors.imageUrl && (
                <p className="text-xs text-red-400">{errors.imageUrl.message}</p>
              )}
            </div>

            {/* Available switch */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Show on delivery menu
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers can order this item
                </p>
              </div>
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Available for delivery"
                  />
                )}
              />
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-1 pb-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={isSubmitting}
              >
                {isEditMode ? "Update Item" : "Save Item"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

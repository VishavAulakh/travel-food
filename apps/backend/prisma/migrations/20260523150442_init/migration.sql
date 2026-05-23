-- CreateEnum
CREATE TYPE "DeliveryOrderStatus" AS ENUM ('placed', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "RiderStatus" AS ENUM ('active', 'suspended');

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "gstin" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantUsers" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurantUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantOtps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurantOtps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menuCategories" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menuCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menuItems" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "vegNonVeg" TEXT NOT NULL DEFAULT 'veg',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menuItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryCustomers" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveryCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customerAddresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "line" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customerAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customerOtps" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customerOtps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryOrders" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT,
    "riderId" TEXT,
    "orderNumber" TEXT NOT NULL,
    "status" "DeliveryOrderStatus" NOT NULL DEFAULT 'placed',
    "subtotalPaise" INTEGER NOT NULL,
    "deliveryFeePaise" INTEGER NOT NULL DEFAULT 4900,
    "platformFeePaise" INTEGER NOT NULL DEFAULT 500,
    "taxPaise" INTEGER NOT NULL DEFAULT 0,
    "discountPaise" INTEGER NOT NULL DEFAULT 0,
    "totalPaise" INTEGER NOT NULL,
    "promoCode" TEXT,
    "deliveryAddressLine" TEXT NOT NULL,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "specialInstructions" TEXT,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 35,
    "confirmedAt" TIMESTAMP(3),
    "prepStartedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveryOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryOrderItems" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPricePaise" INTEGER NOT NULL,

    CONSTRAINT "deliveryOrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riders" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "vehicleType" TEXT NOT NULL DEFAULT 'bike',
    "vehicleNumber" TEXT,
    "status" "RiderStatus" NOT NULL DEFAULT 'active',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "riders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riderOtps" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riderOtps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riderEarnings" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'delivery',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riderEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveryZones" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "minOrderPaise" INTEGER NOT NULL DEFAULT 15000,
    "deliveryFeePaise" INTEGER NOT NULL DEFAULT 4900,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveryZones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openingHours" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,

    CONSTRAINT "openingHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_slug_key" ON "restaurants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "branches_restaurantId_code_key" ON "branches"("restaurantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantUsers_phone_key" ON "restaurantUsers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "deliveryCustomers_phone_key" ON "deliveryCustomers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "deliveryOrders_orderNumber_key" ON "deliveryOrders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "riders_phone_key" ON "riders"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "riderEarnings_orderId_key" ON "riderEarnings"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "deliveryZones_branchId_key" ON "deliveryZones"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "openingHours_branchId_dayOfWeek_key" ON "openingHours"("branchId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantUsers" ADD CONSTRAINT "restaurantUsers_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantUsers" ADD CONSTRAINT "restaurantUsers_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantOtps" ADD CONSTRAINT "restaurantOtps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "restaurantUsers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menuCategories" ADD CONSTRAINT "menuCategories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menuItems" ADD CONSTRAINT "menuItems_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menuItems" ADD CONSTRAINT "menuItems_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menuCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customerAddresses" ADD CONSTRAINT "customerAddresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "deliveryCustomers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customerOtps" ADD CONSTRAINT "customerOtps_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "deliveryCustomers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrders" ADD CONSTRAINT "deliveryOrders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrders" ADD CONSTRAINT "deliveryOrders_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrders" ADD CONSTRAINT "deliveryOrders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "deliveryCustomers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrders" ADD CONSTRAINT "deliveryOrders_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrderItems" ADD CONSTRAINT "deliveryOrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "deliveryOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryOrderItems" ADD CONSTRAINT "deliveryOrderItems_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menuItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riderOtps" ADD CONSTRAINT "riderOtps_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riderEarnings" ADD CONSTRAINT "riderEarnings_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riderEarnings" ADD CONSTRAINT "riderEarnings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "deliveryOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryZones" ADD CONSTRAINT "deliveryZones_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveryZones" ADD CONSTRAINT "deliveryZones_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "openingHours" ADD CONSTRAINT "openingHours_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "openingHours" ADD CONSTRAINT "openingHours_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

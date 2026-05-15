-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NURSE', 'DIETITIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('DIABETIC', 'LOW_SODIUM', 'POST_SURGERY', 'RENAL', 'REGULAR');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('PENDING_AFTER', 'COMPLETE');

-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('STAPLE', 'PROTEIN', 'VEGETABLE', 'FRUIT', 'BEVERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_INTAKE', 'CRITICAL_INTAKE', 'MISSED_MEAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ward" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "dietType" "DietType" NOT NULL,
    "kcalTarget" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MealStatus" NOT NULL DEFAULT 'PENDING_AFTER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPhoto" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "type" "PhotoType" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameBM" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "kcalPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealFoodItem" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "foodItemId" TEXT,
    "portionG" DOUBLE PRECISION NOT NULL,
    "photoType" "PhotoType" NOT NULL,
    "kcalTotal" DOUBLE PRECISION NOT NULL,
    "nameBM" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,

    CONSTRAINT "MealFoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionResult" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "kcalBefore" DOUBLE PRECISION NOT NULL,
    "kcalAfter" DOUBLE PRECISION NOT NULL,
    "kcalActual" DOUBLE PRECISION NOT NULL,
    "carbsActual" DOUBLE PRECISION NOT NULL,
    "proteinActual" DOUBLE PRECISION NOT NULL,
    "fatActual" DOUBLE PRECISION NOT NULL,
    "percentageEaten" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "NutritionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "dietitianId" TEXT,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionResult_mealLogId_key" ON "NutritionResult"("mealLogId");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPhoto" ADD CONSTRAINT "MealPhoto_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFoodItem" ADD CONSTRAINT "MealFoodItem_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFoodItem" ADD CONSTRAINT "MealFoodItem_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionResult" ADD CONSTRAINT "NutritionResult_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

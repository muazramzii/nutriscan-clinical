import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean in dependency order
  await prisma.alert.deleteMany();
  await prisma.nutritionResult.deleteMany();
  await prisma.mealFoodItem.deleteMany();
  await prisma.mealPhoto.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.foodItem.deleteMany();

  console.log("Cleaned existing data");

  // Users
  const [nurse, dietitian] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Nurse Amirah",
        email: "nurse@nutriscan.my",
        password: await bcrypt.hash("nurse123", 10),
        role: "NURSE",
        ward: "3B",
      },
    }),
    prisma.user.create({
      data: {
        name: "Dietitian Sarah",
        email: "dietitian@nutriscan.my",
        password: await bcrypt.hash("dietitian123", 10),
        role: "DIETITIAN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@nutriscan.my",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
      },
    }),
  ]);
  console.log("Created users");

  // Food items
  const foodItems = await Promise.all([
    prisma.foodItem.create({
      data: {
        name: "White Rice",
        nameBM: "Nasi Putih",
        category: "STAPLE",
        kcalPer100g: 130,
        carbsPer100g: 28.2,
        proteinPer100g: 2.7,
        fatPer100g: 0.3,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Rice Porridge",
        nameBM: "Bubur Nasi",
        category: "STAPLE",
        kcalPer100g: 60,
        carbsPer100g: 13.1,
        proteinPer100g: 1.2,
        fatPer100g: 0.1,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Coconut Rice",
        nameBM: "Nasi Lemak",
        category: "STAPLE",
        kcalPer100g: 200,
        carbsPer100g: 32.0,
        proteinPer100g: 4.0,
        fatPer100g: 7.0,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Red Chicken Curry",
        nameBM: "Ayam Masak Merah",
        category: "PROTEIN",
        kcalPer100g: 180,
        carbsPer100g: 8.0,
        proteinPer100g: 18.0,
        fatPer100g: 8.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Steamed Sea Bass",
        nameBM: "Ikan Siakap Stim",
        category: "PROTEIN",
        kcalPer100g: 95,
        carbsPer100g: 0.0,
        proteinPer100g: 20.0,
        fatPer100g: 1.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Soy Sauce Beef",
        nameBM: "Daging Masak Kicap",
        category: "PROTEIN",
        kcalPer100g: 190,
        carbsPer100g: 5.5,
        proteinPer100g: 22.0,
        fatPer100g: 9.0,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Stir-fried Spinach",
        nameBM: "Sayur Bayam Tumis",
        category: "VEGETABLE",
        kcalPer100g: 45,
        carbsPer100g: 3.5,
        proteinPer100g: 3.0,
        fatPer100g: 2.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Mixed Vegetables",
        nameBM: "Sayur Campur",
        category: "VEGETABLE",
        kcalPer100g: 35,
        carbsPer100g: 5.0,
        proteinPer100g: 2.0,
        fatPer100g: 0.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Fried Tofu",
        nameBM: "Tauhu Goreng",
        category: "PROTEIN",
        kcalPer100g: 150,
        carbsPer100g: 4.0,
        proteinPer100g: 10.0,
        fatPer100g: 11.0,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Boiled Egg",
        nameBM: "Telur Rebus",
        category: "PROTEIN",
        kcalPer100g: 155,
        carbsPer100g: 1.1,
        proteinPer100g: 13.0,
        fatPer100g: 11.0,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Chicken Soup",
        nameBM: "Sup Ayam",
        category: "OTHER",
        kcalPer100g: 40,
        carbsPer100g: 2.0,
        proteinPer100g: 5.0,
        fatPer100g: 1.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Wholemeal Bread",
        nameBM: "Roti Wholemeal",
        category: "STAPLE",
        kcalPer100g: 247,
        carbsPer100g: 46.0,
        proteinPer100g: 9.0,
        fatPer100g: 3.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Banana",
        nameBM: "Pisang",
        category: "FRUIT",
        kcalPer100g: 89,
        carbsPer100g: 23.0,
        proteinPer100g: 1.1,
        fatPer100g: 0.3,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Teh Tarik (Less Sweet)",
        nameBM: "Teh Tarik Kurang Manis",
        category: "BEVERAGE",
        kcalPer100g: 60,
        carbsPer100g: 10.0,
        proteinPer100g: 2.5,
        fatPer100g: 1.5,
      },
    }),
    prisma.foodItem.create({
      data: {
        name: "Plain Water",
        nameBM: "Air Kosong",
        category: "BEVERAGE",
        kcalPer100g: 0,
        carbsPer100g: 0,
        proteinPer100g: 0,
        fatPer100g: 0,
      },
    }),
  ]);
  console.log("Created food items");

  // Patients
  const patients = await Promise.all([
    // Ward 3B (nurse's ward)
    prisma.patient.create({
      data: {
        name: "Ahmad bin Hassan",
        bedNumber: "3B-01",
        ward: "3B",
        dietType: "DIABETIC",
        kcalTarget: 1800,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Siti binti Omar",
        bedNumber: "3B-02",
        ward: "3B",
        dietType: "LOW_SODIUM",
        kcalTarget: 2000,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Rajesh Kumar",
        bedNumber: "3B-03",
        ward: "3B",
        dietType: "RENAL",
        kcalTarget: 1600,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Lim Mei Ling",
        bedNumber: "3B-04",
        ward: "3B",
        dietType: "POST_SURGERY",
        kcalTarget: 1400,
      },
    }),
    // Ward 3A
    prisma.patient.create({
      data: {
        name: "Norhaida binti Ali",
        bedNumber: "3A-01",
        ward: "3A",
        dietType: "REGULAR",
        kcalTarget: 2200,
      },
    }),
    prisma.patient.create({
      data: {
        name: "David Tan",
        bedNumber: "3A-02",
        ward: "3A",
        dietType: "DIABETIC",
        kcalTarget: 1900,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Muthu Krishnan",
        bedNumber: "3A-03",
        ward: "3A",
        dietType: "LOW_SODIUM",
        kcalTarget: 1700,
      },
    }),
    prisma.patient.create({
      data: {
        name: "Zainab binti Yusof",
        bedNumber: "3A-04",
        ward: "3A",
        dietType: "POST_SURGERY",
        kcalTarget: 1500,
      },
    }),
  ]);
  console.log("Created patients");

  // Sample MealLogs for today
  const today = new Date();
  const breakfast = new Date(today);
  breakfast.setHours(8, 0, 0, 0);
  const lunch = new Date(today);
  lunch.setHours(13, 0, 0, 0);
  const dinner = new Date(today);
  dinner.setHours(18, 0, 0, 0);

  // Helper to create a complete meal log
  async function createMealLog(
    patientId: string,
    mealType: "BREAKFAST" | "LUNCH" | "DINNER",
    mealDate: Date,
    beforeKcal: number,
    afterKcal: number,
    carbs: number,
    protein: number,
    fat: number
  ) {
    const actualKcal = Math.max(0, beforeKcal - afterKcal);
    const pct = beforeKcal > 0 ? (actualKcal / beforeKcal) * 100 : 0;

    const log = await prisma.mealLog.create({
      data: {
        patientId,
        nurseId: nurse.id,
        mealType,
        date: mealDate,
        status: "COMPLETE",
      },
    });

    await prisma.mealPhoto.createMany({
      data: [
        {
          mealLogId: log.id,
          type: "BEFORE",
          imageUrl: "/uploads/placeholder-before.jpg",
          takenAt: mealDate,
        },
        {
          mealLogId: log.id,
          type: "AFTER",
          imageUrl: "/uploads/placeholder-after.jpg",
          takenAt: new Date(mealDate.getTime() + 30 * 60 * 1000),
        },
      ],
    });

    await prisma.mealFoodItem.createMany({
      data: [
        {
          mealLogId: log.id,
          portionG: 200,
          photoType: "BEFORE",
          kcalTotal: beforeKcal * 0.6,
          nameBM: "Nasi Putih",
          nameEN: "White Rice",
        },
        {
          mealLogId: log.id,
          portionG: 150,
          photoType: "BEFORE",
          kcalTotal: beforeKcal * 0.4,
          nameBM: "Ayam Masak Merah",
          nameEN: "Red Chicken Curry",
        },
      ],
    });

    await prisma.nutritionResult.create({
      data: {
        mealLogId: log.id,
        kcalBefore: beforeKcal,
        kcalAfter: afterKcal,
        kcalActual: actualKcal,
        carbsActual: carbs,
        proteinActual: protein,
        fatActual: fat,
        percentageEaten: pct,
      },
    });

    if (pct < 25) {
      await prisma.alert.create({
        data: {
          patientId,
          dietitianId: dietitian.id,
          type: "CRITICAL_INTAKE",
          message: `Critical: Patient ate only ${Math.round(pct)}% of meal (${Math.round(actualKcal)} kcal)`,
        },
      });
    } else if (pct < 50) {
      await prisma.alert.create({
        data: {
          patientId,
          dietitianId: dietitian.id,
          type: "LOW_INTAKE",
          message: `Low intake: Patient ate only ${Math.round(pct)}% of meal (${Math.round(actualKcal)} kcal)`,
        },
      });
    }

    return log;
  }

  // 5 sample complete meal logs
  await createMealLog(patients[0].id, "BREAKFAST", breakfast, 520, 80, 62, 28, 12);
  await createMealLog(patients[0].id, "LUNCH", lunch, 680, 300, 55, 35, 18);
  await createMealLog(patients[1].id, "BREAKFAST", breakfast, 490, 420, 58, 22, 9);
  await createMealLog(patients[2].id, "BREAKFAST", breakfast, 380, 280, 40, 18, 8);
  await createMealLog(patients[3].id, "LUNCH", lunch, 420, 380, 44, 20, 10);

  console.log("Created meal logs and nutrition results");
  console.log("\nSeed complete! Demo accounts:");
  console.log("  nurse@nutriscan.my / nurse123  (Ward 3B)");
  console.log("  dietitian@nutriscan.my / dietitian123");
  console.log("  admin@nutriscan.my / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file locally to public/uploads/ so your UI still shows the preview image
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(uploadPath, buffer);

    const imageUrl = `/uploads/${safeFilename}`;

        /* 
      =======================================================
      ACTIVE DEVELOPMENT BYPASS: ADVANCED DYNAMIC MOCK ENGINE
      Matches portion scale factor based on filename keywords
      =======================================================
    */
    const fileNameString = file.name.toLowerCase();

    // 1. Establish the base portion multiplier (Default to 100% full portion)
    let scaleFactor = 1.0; 
    let labelEN = "Full Portion Baseline";
    let labelBM = "Hidangan Penuh";

    // 2. Scan filename for portion keyword overrides
    if (fileNameString.includes("25") || fileNameString.includes("quarter")) {
      scaleFactor = 0.25; // 25% remaining/consumed
      labelEN = "25% Portion Value";
      labelBM = "25% Bahagian Makanan";
    } 
    else if (fileNameString.includes("50") || fileNameString.includes("half") || fileNameString.includes("after") || fileNameString.includes("leftover")) {
      scaleFactor = 0.50; // 50% remaining/consumed
      labelEN = "50% Portion Value";
      labelBM = "50% Bahagian Makanan";
    } 
    else if (fileNameString.includes("75") || fileNameString.includes("three-quarter")) {
      scaleFactor = 0.75; // 75% remaining/consumed
      labelEN = "75% Portion Value";
      labelBM = "75% Bahagian Makanan";
    }

    // 3. Scale the nutritional properties programmatically
    const analysis = {
      totalKcal: Math.round(650 * scaleFactor),
      totalCarbs: Math.round(80 * scaleFactor),
      totalProtein: Number((15 * scaleFactor).toFixed(1)),
      totalFat: Number((29 * scaleFactor).toFixed(1)),
      confidence: 0.95,
      items: [
        {
          nameEN: `Nasi Lemak (${labelEN})`,
          nameBM: `Nasi Lemak (${labelBM})`,
          portionG: Math.round(230 * scaleFactor),
          kcalTotal: Math.round(650 * scaleFactor),
          carbsG: Math.round(80 * scaleFactor),
          proteinG: Number((15 * scaleFactor).toFixed(1)),
          fatG: Number((29 * scaleFactor).toFixed(1)),
          confidence: 0.95
        }
      ]
    };

    // Return the clean singular data object to the frontend client pipeline
    return NextResponse.json({ analysis, imageUrl });


  } catch (error) {
    console.error("analyze-food error:", error);
    return NextResponse.json(
      {
        error: "Analisis gagal. Sila cuba lagi. / Analysis failed. Please try again.",
        analysis: {
          items: [],
          totalKcal: 0,
          totalCarbs: 0,
          totalProtein: 0,
          totalFat: 0,
          confidence: 0,
        },
        imageUrl: null,
      },
      { status: 500 }
    );
  }
}

/* 
  =============================================================================
  ARCHIVED PRODUCTION CODE: ORIGINAL OPENAI WORKFLOW (PRESERVED FOR LATER)
  =============================================================================
  To reactivate the real AI engine in the future:
  1. Move the variables below back into the active try/catch execution block above.
  2. Ensure OPENAI_API_KEY is configured correctly inside your .env parameters.
  
  import { openai, FOOD_ANALYSIS_PROMPT } from "@/lib/openai"; // Restore at top of file

  const base64Image = buffer.toString("base64");
  const mimeType = file.type || "image/jpeg";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: FOOD_ANALYSIS_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const cleaned = content
    .replace(/```json\s* /g, "")
    .replace(/```\s* /g, "")
    .trim();

  let analysis;
  try {
    analysis = JSON.parse(cleaned);
  } catch {
    analysis = {
      items: [],
      totalKcal: 0,
      totalCarbs: 0,
      totalProtein: 0,
      totalFat: 0,
      confidence: 0,
    };
  }

  if (analysis.items) {
    analysis.items = analysis.items.map((item: Record<string, unknown>) => ({
      nameEN: item.name_en || item.nameEN || "Unknown",
      nameBM: item.name_bm || item.nameBM || "Tidak diketahui",
      portionG: Number(item.portion_g || item.portionG || 0),
      kcalTotal: Number(item.kcal || item.kcalTotal || 0),
      carbsG: Number(item.carbs_g || item.carbsG || 0),
      proteinG: Number(item.protein_g || item.proteinG || 0),
      fatG: Number(item.fat_g || item.fatG || 0),
      confidence: Number(item.confidence || 0.8),
    }));
  }

  return NextResponse.json({ analysis, imageUrl });
  =============================================================================
*/

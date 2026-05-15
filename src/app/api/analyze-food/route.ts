import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openai, FOOD_ANALYSIS_PROMPT } from "@/lib/openai";
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

    // Save file to public/uploads/
    const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uploadPath = path.join(uploadDir, safeFilename);
    fs.writeFileSync(uploadPath, buffer);

    const imageUrl = `/uploads/${safeFilename}`;
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
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      // Fallback if GPT returns unparseable JSON
      analysis = {
        items: [],
        totalKcal: 0,
        totalCarbs: 0,
        totalProtein: 0,
        totalFat: 0,
        confidence: 0,
      };
    }

    // Normalise field names from GPT response
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
  } catch (error) {
    console.error("analyze-food error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed. Please try again.",
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

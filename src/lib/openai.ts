import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const FOOD_ANALYSIS_PROMPT = `You are a Malaysian clinical dietitian assistant analyzing a hospital meal tray photo.
Identify all visible Malaysian food items on the tray. For each item provide accurate nutritional estimates based on standard Malaysian food composition tables.
Return ONLY a valid JSON object with no explanation, no markdown, no code blocks. Use this exact format:
{
  "items": [
    {
      "nameEN": "English name",
      "nameBM": "Bahasa Malaysia name",
      "portionG": 200,
      "kcalTotal": 260,
      "carbsG": 56.4,
      "proteinG": 5.4,
      "fatG": 0.6,
      "confidence": 0.92
    }
  ],
  "totalKcal": 260,
  "totalCarbs": 56.4,
  "totalProtein": 5.4,
  "totalFat": 0.6,
  "confidence": 0.9
}`;

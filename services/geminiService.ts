import { GoogleGenAI, Type } from "@google/genai";
import { AiResponse } from '../types';

let genAI: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const getFocusTip = async (): Promise<string | null> => {
  if (!genAI) return null;

  try {
    const model = 'gemini-2.5-flash';
    // Prompt changed to request Japanese response
    const response = await genAI.models.generateContent({
      model: model,
      contents: "深い集中と生産性のための短くパンチの効いたモチベーションのヒントを1つ、日本語で教えてください。引用符は含めず、15〜20文字程度の短い文にしてください。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: {
              type: Type.STRING,
            },
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    const data = JSON.parse(jsonText) as AiResponse;
    return data.tip;
  } catch (error) {
    console.error("Error fetching AI tip:", error);
    return null;
  }
};
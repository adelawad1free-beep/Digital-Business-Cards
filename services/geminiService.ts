
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const generateProfessionalBio = async (
  name: string,
  title: string,
  company: string,
  keywords: string,
  lang: Language
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = lang === 'en' 
    ? `Generate a professional, concise, and engaging bio for a digital business card. 
       Name: ${name}
       Title: ${title}
       Company: ${company}
       Keywords: ${keywords}
       Language: English. Keep it under 150 characters.`
    : `أنشئ نبذة مهنية قصيرة وجذابة لبطاقة أعمال رقمية. 
       الاسم: ${name}
       المسمى الوظيفي: ${title}
       الشركة: ${company}
       الكلمات المفتاحية: ${keywords}
       اللغة: العربية. يجب أن تكون أقل من 150 حرفاً.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    // استخدام الخاصية .text مباشرة
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Bio Error:", error);
    return "";
  }
};


import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Fix: Correct usage of Gemini API following the latest guidelines for professional bio generation
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
    // Fix: Using ai.models.generateContent with a direct model name string
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    // Fix: response.text is a property, not a method
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Bio Error:", error);
    return "";
  }
};

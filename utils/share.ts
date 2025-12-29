
import LZString from 'lz-string';
import { CardData } from '../types';

/**
 * تنظيف الكائن من الحقول الفارغة لتقليل حجم الرابط
 */
const minifyCardData = (data: CardData) => {
  const minified: any = {};
  (Object.keys(data) as Array<keyof CardData>).forEach((key) => {
    if (data[key] !== "" && data[key] !== null && data[key] !== undefined) {
      if (Array.isArray(data[key]) && (data[key] as any).length === 0) return;
      minified[key] = data[key];
    }
  });
  // التأكد من إزالة الصورة إذا كانت Base64 لمنع تجاوز حد طول الرابط
  if (minified.profileImage && minified.profileImage.startsWith('data:')) {
    minified.profileImage = "";
  }
  return minified;
};

/**
 * تحويل كائن البطاقة إلى سلسلة نصية مضغوطة
 */
export const encodeCardData = (data: CardData): string => {
  const cleanData = minifyCardData(data);
  const jsonStr = JSON.stringify(cleanData);
  return LZString.compressToEncodedURIComponent(jsonStr);
};

export const decodeCardData = (code: string): CardData | null => {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(code);
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to decode card data", e);
    return null;
  }
};

export const generateShareUrl = (data: CardData): string => {
  const code = encodeCardData(data);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?c=${code}`;
};

/**
 * خدمة اختصار الروابط باستخدام TinyURL
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    if (response.ok) {
      return await response.text();
    }
    return longUrl;
  } catch (error) {
    console.error("Shortening failed:", error);
    return longUrl;
  }
};

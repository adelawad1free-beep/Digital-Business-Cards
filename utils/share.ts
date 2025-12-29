
import LZString from 'lz-string';
import { CardData } from '../types';

/**
 * تحويل كائن البطاقة إلى سلسلة نصية مضغوطة
 */
export const encodeCardData = (data: CardData): string => {
  // نسخة من البيانات بدون الصورة إذا كانت Base64 لتجنب خطأ 414
  const dataToEncode = { ...data };
  
  if (dataToEncode.profileImage && dataToEncode.profileImage.startsWith('data:')) {
    console.warn("Base64 image detected. Stripping from URL to prevent 414 error.");
    dataToEncode.profileImage = ""; // نحذفها من الرابط ونعتمد على التخزين السحابي
  }

  const jsonStr = JSON.stringify(dataToEncode);
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

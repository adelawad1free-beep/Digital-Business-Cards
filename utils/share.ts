
import LZString from 'lz-string';
import { CardData } from '../types';

/**
 * تحويل كائن البطاقة إلى سلسلة نصية مضغوطة ومشفرة للرابط
 */
export const encodeCardData = (data: CardData): string => {
  const jsonStr = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(jsonStr);
};

/**
 * فك تشفير البيانات من الرابط واستعادتها ككائن بطاقة
 */
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

/**
 * توليد رابط المشاركة الكامل
 */
export const generateShareUrl = (data: CardData): string => {
  const code = encodeCardData(data);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?c=${code}`;
};

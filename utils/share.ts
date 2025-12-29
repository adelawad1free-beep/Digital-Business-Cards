
import { CardData } from '../types';

export const generateSerialId = (): string => {
  const part1 = Math.floor(100 + Math.random() * 900);
  const part2 = Math.floor(100 + Math.random() * 900);
  return `${part1}-${part2}`;
};

/**
 * توليد الرابط باستخدام معلمة u لضمان عمل الرابط على جميع أنواع الاستضافة
 * وتجنب أخطاء 404 في تطبيقات الصفحة الواحدة (SPA)
 */
export const generateShareUrl = (data: CardData): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  // نستخدم ?u= لضمان التوافق البرمجي وتجنب مشاكل التوجيه في الخادم
  return `${baseUrl}?u=${data.id}`;
};

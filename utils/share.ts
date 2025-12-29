
import { CardData } from '../types';

export const generateSerialId = (): string => {
  const part1 = Math.floor(100 + Math.random() * 900);
  const part2 = Math.floor(100 + Math.random() * 900);
  return `${part1}-${part2}`;
};

/**
 * توليد الرابط ليكون مباشراً بعد الدومين: domain.com/username
 */
export const generateShareUrl = (data: CardData): string => {
  const baseUrl = window.location.origin;
  // نستخدم المعرف المخصص (slug) مباشرة بعد الدومين
  return `${baseUrl}/${data.id}`;
};


import { CardData } from '../types';

/**
 * وظيفة مساعدة لتحويل رابط صورة إلى Base64
 * ضرورية لأن نظام vCard يتطلب الصورة مدمجة نصياً
 */
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to convert image for vCard:", e);
    return null;
  }
};

export const downloadVCard = async (data: CardData) => {
  const cleanName = (data.name || '').trim();
  const cleanTitle = (data.title || '').trim();
  const cleanOrg = (data.company || '').trim();
  const cleanPhone = (data.phone || '').replace(/\s/g, '');
  const cleanEmail = (data.email || '').trim();
  const cleanWeb = (data.website || '').trim();

  let vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanName}`,
    `N:;${cleanName};;;`,
    `TITLE:${cleanTitle}`,
    `ORG:${cleanOrg}`,
    `TEL;TYPE=CELL:${cleanPhone}`,
    `EMAIL;TYPE=INTERNET:${cleanEmail}`,
    `URL:${cleanWeb}`,
    `ADR;TYPE=WORK:;;${data.location || ''};;;`,
    `NOTE:${data.bio || ''}`,
  ];

  // التعامل مع الصورة الشخصية
  if (data.profileImage) {
    if (data.profileImage.startsWith('data:image/')) {
      // إذا كانت الصورة قديمة (Base64)
      const base64Data = data.profileImage.split(',')[1];
      const mimeType = data.profileImage.split(';')[0].split(':')[1].toUpperCase();
      const type = mimeType.split('/')[1] || 'JPEG';
      vcard.push(`PHOTO;TYPE=${type};ENCODING=b:${base64Data}`);
    } else if (data.profileImage.startsWith('http')) {
      // إذا كانت الصورة جديدة (رابط من Storage) - نقوم بتحويلها
      const base64Data = await imageUrlToBase64(data.profileImage);
      if (base64Data) {
        vcard.push(`PHOTO;TYPE=JPEG;ENCODING=b:${base64Data}`);
      }
    }
  }

  vcard.push('END:VCARD');

  const vcardString = vcard.join('\r\n');
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${cleanName.replace(/\s+/g, '_') || 'contact'}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

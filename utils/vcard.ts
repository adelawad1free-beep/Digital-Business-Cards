
import { CardData } from '../types';

export const downloadVCard = (data: CardData) => {
  // تنظيف الروابط والبيانات مع إضافة حماية ضد القيم غير المعرفة
  const cleanName = (data.name || '').trim();
  const cleanTitle = (data.title || '').trim();
  const cleanOrg = (data.company || '').trim();
  const cleanPhone = (data.phone || '').replace(/\s/g, '');
  const cleanEmail = (data.email || '').trim();
  const cleanWeb = (data.website || '').trim();

  // بناء محتوى vCard
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

  // إضافة الصورة إذا كانت بصيغة Base64 (التي نستخدمها في التطبيق)
  if (data.profileImage && data.profileImage.startsWith('data:image/')) {
    const base64Data = data.profileImage.split(',')[1];
    const mimeType = data.profileImage.split(';')[0].split(':')[1].toUpperCase();
    const type = mimeType.split('/')[1] || 'JPEG';
    vcard.push(`PHOTO;TYPE=${type};ENCODING=b:${base64Data}`);
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

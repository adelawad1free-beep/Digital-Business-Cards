
/**
 * خدمة معالجة الصور ورفعها بناءً على إعدادات الموقع
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar',
  config?: { storageType?: 'database' | 'server', uploadUrl?: string }
): Promise<string | null> => {
  if (!file) return null;

  // 1. معالجة الصورة أولاً (الضغط وتغيير الحجم حسب النوع)
  // هذا يضمن أن الجودة العالية تُطبق على الأنماط، والضغط يُطبق على البروفايل قبل الرفع
  const processedBase64 = await processImageClientSide(file, type);
  if (!processedBase64) return null;

  // 2. إذا كان الخيار هو الرفع على السيرفر الخاص
  if (config?.storageType === 'server' && config.uploadUrl) {
    try {
      const formData = new FormData();
      
      // تحويل الصورة المعالجة إلى Blob لإرسالها كملف
      const blob = await base64ToBlob(processedBase64);
      
      // إضافة اسم ملف (مهم جداً لنجاح استقبال الملف في PHP)
      const fileName = file.name || (type + '.jpg');
      formData.append('file', blob, fileName); 
      formData.append('type', type);

      const response = await fetch(config.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server Error Details:", errorText);
        throw new Error("Server upload failed with status " + response.status);
      }
      
      const result = await response.json();
      return result.url || result.data?.url || null;
    } catch (error) {
      console.error("Private Server Upload Error:", error);
      alert("فشل الرفع إلى السيرفر الخاص. تأكد من أن ملف الـ PHP موجود وصلاحيات مجلد الرفع (777)");
      return null;
    }
  }

  // 3. التخزين في قاعدة البيانات (Base64)
  return processedBase64;
};

/**
 * دالة معالجة الصور في المتصفح (تصغير الأبعاد وضبط الجودة)
 */
async function processImageClientSide(file: File, type: 'avatar' | 'background' | 'logo'): Promise<string | null> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = () => reject("File reading error");
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // إعدادات مخصصة لكل نوع لضمان الدقة المطلوبة
          let MAX_SIZE = 800; // الافتراضي
          let quality = 0.8;  // الافتراضي

          if (type === 'avatar') {
            MAX_SIZE = 450;    // صور البروفايل (صغيرة ومضغوطة)
            quality = 0.65;    
          } else if (type === 'background') {
            MAX_SIZE = 1920;   // الأنماط والخلفيات (دقة HD عالية جداً)
            quality = 0.95;    // أعلى جودة ممكنة
          } else if (type === 'logo') {
            MAX_SIZE = 1000;
            quality = 0.9;
          }

          let width = img.width;
          let height = img.height;

          // الحفاظ على النسبة
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // تحويلها دائماً إلى JPEG للضغط المثالي
          const base64String = canvas.toDataURL('image/jpeg', quality);
          resolve(base64String);
        };
      };
    });
  } catch (error) {
    console.error("Image Processing Error:", error);
    return null;
  }
}

/**
 * تحويل Base64 إلى Blob
 */
async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}

/**
 * خدمة معالجة الصور وتحويلها إلى Base64 لتخزينها مباشرة في قاعدة البيانات (Firestore)
 * تم الاستغناء عن Firebase Storage بناءً على طلب المستخدم
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar'
): Promise<string | null> => {
  if (!file) return null;

  try {
    // ضغط الصورة وتحويلها إلى Base64
    const processImage = (f: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onerror = () => reject("File reading error");
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onerror = () => reject("Image loading error");
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // تحديد الحجم الأقصى بناءً على نوع الصورة لضمان عدم تجاوز حد Firestore (1MB)
          // الصور الشخصية أصغر، الخلفيات أكبر قليلاً
          let MAX_SIZE = type === 'background' ? 1200 : 600; 
          let quality = 0.7; // تقليل الجودة قليلاً لتقليل الحجم النصي

          let width = img.width;
          let height = img.height;

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
          
          // تصدير الصورة كـ Base64 بصيغة JPEG لتقليل الحجم
          const base64String = canvas.toDataURL('image/jpeg', quality);
          resolve(base64String);
        };
      };
    });

    const resultBase64 = await processImage(file);
    
    // التحقق من أن حجم السلسلة النصية لا يسبب مشاكل (Firestore limit 1MB)
    // السلسلة النصية تشغل حوالي 1.33 ضعف حجم الملف الأصلي
    if (resultBase64.length > 800000) { // حوالي 800 كيلوبايت كحد أقصى للأمان
        console.warn("Image is too large for database storage, even after compression.");
    }

    return resultBase64;

  } catch (error: any) {
    console.error("Image Processing Error:", error);
    return null;
  }
};
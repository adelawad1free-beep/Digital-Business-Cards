
/**
 * خدمة معالجة الصور وتحويلها لـ Base64 للتخزين داخل Firestore
 * تم تحديثها لدعم دقة عالية للخلفيات ودقة متوسطة للصور الشخصية
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar'
): Promise<string | null> => {
  try {
    const compressAndGetBase64 = (f: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // تحديد الأبعاد بناءً على نوع الصورة
          // الخلفية تحتاج دقة أعلى لتظهر بوضوح عند التكبير أو على الشاشات الكبيرة
          let MAX_SIZE = 400; 
          let quality = 0.7;

          if (type === 'background') {
            MAX_SIZE = 1200; // دقة عالية للخلفيات
            quality = 0.85;  // جودة ضغط أقل للحفاظ على التفاصيل
          } else if (type === 'logo') {
            MAX_SIZE = 600;
            quality = 0.8;
          }

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
          
          // تحسين تنعيم الصورة عند التصغير
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          // تحويل الصورة إلى JPEG بالدقة المطلوبة
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject("Image Load Error");
      };
      reader.onerror = () => reject("File Read Error");
    });

    console.log(`Processing ${type} image locally...`);
    const base64Result = await compressAndGetBase64(file);
    return base64Result;
  } catch (error) {
    console.error("Local Image Processing Error:", error);
    return null;
  }
};

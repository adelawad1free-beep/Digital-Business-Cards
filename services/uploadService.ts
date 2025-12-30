
/**
 * خدمة معالجة الصور وتحويلها لـ Base64 للتخزين داخل Firestore
 * هذا الحل يتجاوز الحاجة لـ Firebase Storage أو خدمات خارجية
 */
export const uploadImageToCloud = async (file: File): Promise<string | null> => {
  try {
    // نقوم بضغط الصورة وتصغير أبعادها لضمان عدم تجاوز حجم وثيقة Firestore (1MB)
    const compressAndGetBase64 = (f: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // نستخدم أبعاد متوسطة (400px) كافية للبطاقة الرقمية وتقلل الحجم جداً
          const MAX_SIZE = 400; 
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
          ctx?.drawImage(img, 0, 0, width, height);
          
          // تحويل الصورة إلى JPEG بضغط 0.6 (توازن مثالي بين الحجم والجودة)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          resolve(compressedBase64);
        };
        img.onerror = () => reject("Image Load Error");
      };
      reader.onerror = () => reject("File Read Error");
    });

    console.log("Processing image locally for Firestore storage...");
    const base64Result = await compressAndGetBase64(file);
    return base64Result;
  } catch (error) {
    console.error("Local Image Processing Error:", error);
    return null;
  }
};

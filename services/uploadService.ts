
import { storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * خدمة معالجة الصور ورفعها إلى Firebase Storage
 * تم التحديث لدعم الرفع السحابي الحقيقي لضمان قابلية التوسع
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar'
): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'anonymous';

    // ضغط الصورة محلياً لتقليل الحجم وتسريع التحميل
    const compressToBlob = (f: File): Promise<Blob> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          let MAX_SIZE = 512; // حجم كافٍ جداً للصور الشخصية
          let quality = 0.8;

          if (type === 'background') {
            MAX_SIZE = 1440; // دقة عالية للخلفيات
            quality = 0.85;
          } else if (type === 'logo') {
            MAX_SIZE = 600;
            quality = 0.9;
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
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject("Compression failed");
          }, 'image/jpeg', quality);
        };
      };
    });

    const compressedBlob = await compressToBlob(file);

    // إنشاء مسار فريد للملف لضمان عدم الكتابة فوق صور قديمة
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${type}_${timestamp}_${randomString}.jpg`;
    const storagePath = `uploads/${userId}/${type}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    // عملية الرفع
    const uploadResult = await uploadBytes(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
      customMetadata: {
        'uploadedBy': userId,
        'type': type
      }
    });

    // الحصول على رابط التحميل النهائي
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return downloadUrl;

  } catch (error) {
    console.error("Cloud Upload Error:", error);
    return null;
  }
};

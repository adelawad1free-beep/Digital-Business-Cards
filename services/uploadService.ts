
import { storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * خدمة معالجة الصور ورفعها إلى Firebase Storage
 * تم تحسينها لمعالجة أخطاء الصلاحيات (Unauthorized)
 */
export const uploadImageToCloud = async (
  file: File, 
  type: 'avatar' | 'background' | 'logo' = 'avatar'
): Promise<string | null> => {
  if (!file) return null;

  try {
    const user = auth.currentUser;
    
    // منع الرفع إذا لم يكن هناك مستخدم مسجل لتجنب خطأ unauthorized
    if (!user) {
      console.error("Cloud Upload Error: User must be authenticated to upload files.");
      return null;
    }

    const userId = user.uid;

    // ضغط الصورة محلياً لتقليل الحجم وتسريع التحميل
    const compressToBlob = (f: File): Promise<Blob> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onerror = () => reject("File reading error");
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onerror = () => reject("Image loading error");
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          let MAX_SIZE = type === 'background' ? 1600 : 800; 
          let quality = 0.8;

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

    // إنشاء مسار فريد للملف يعتمد على معرف المستخدم الفعلي
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${type}_${timestamp}_${randomString}.jpg`;
    const storagePath = `uploads/${userId}/${type}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    const metadata = {
      contentType: 'image/jpeg',
      customMetadata: {
        'uploadedBy': userId,
        'type': type,
        'originalName': file.name
      }
    };

    const uploadResult = await uploadBytes(storageRef, compressedBlob, metadata);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    return downloadUrl;

  } catch (error: any) {
    if (error.code === 'storage/unauthorized') {
      console.error("Cloud Upload Error: Firebase Storage Rules block this upload. Make sure rules allow write access to path: uploads/{userId}/...");
    } else {
      console.error("Cloud Upload Error:", error);
    }
    return null;
  }
};

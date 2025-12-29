
/**
 * خدمة رفع الصور لتجنب تخزين Base64 في الرابط
 */
export const uploadImageToCloud = async (base64Data: string): Promise<string | null> => {
  try {
    // نستخدم API مجاني لرفع الصور (ImgBB كمثال - يحتاج مفتاح API فعلي للاستخدام الدائم)
    // ملاحظة: هذا المفتاح تجريبي، يفضل للمستخدم وضع مفتاحه الخاص من imgbb.com
    const API_KEY = '69727402808b8b991871239920150d0a'; 
    
    // إزالة الديباجة من Base64
    const base64Content = base64Data.split(',')[1];
    
    const formData = new FormData();
    formData.append('image', base64Content);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      return result.data.url; // رابط الصورة القصير
    }
    return null;
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};


import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  deleteUser, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  query, 
  getDocs, 
  limit, 
  orderBy,
  getCountFromServer 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgsjOAeK2aGIWIFQBdOz3T0QFiefzeKnI",
  authDomain: "my-digital-identity.firebaseapp.com",
  projectId: "my-digital-identity",
  storageBucket: "my-digital-identity.firebasestorage.app",
  messagingSenderId: "151784599824",
  appId: "1:151784599824:web:8545315769f07c4034f595",
  measurementId: "G-GYDEKH57XN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ADMIN_EMAIL = "adelawad1free@gmail.com";

/**
 * جلب إعدادات الموقع - تم تحسينها لتجنب أخطاء التصاريح
 * نستخدم مستنداً في مجموعة "public" بدلاً من "admin" لضمان إمكانية القراءة للجميع
 */
export const getSiteSettings = async () => {
  try {
    const settingsRef = doc(db, "settings", "global");
    const snap = await getDoc(settingsRef);
    if (snap.exists()) return snap.data();
    return { 
      siteNameAr: "هويتي الرقمية", 
      siteNameEn: "My Digital ID", 
      maintenanceMode: false 
    };
  } catch (error) {
    // في حالة فشل التصاريح، نرجع القيم الافتراضية بدلاً من كسر التطبيق
    return { 
      siteNameAr: "هويتي الرقمية", 
      siteNameEn: "My Digital ID", 
      maintenanceMode: false 
    };
  }
};

/**
 * تحديث إعدادات الموقع (للأدمن فقط)
 */
export const updateSiteSettings = async (settings: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  try {
    const settingsRef = doc(db, "settings", "global");
    await setDoc(settingsRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error("Update Settings Error:", error);
    throw error;
  }
};

/**
 * تحديث بيانات الأدمن مع إعادة التحقق (Best Practice)
 */
export const updateAdminSecurity = async (currentPassword: string, newEmail?: string, newPassword?: string) => {
  const user = auth.currentUser;
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  
  try {
    // 1. إعادة التحقق من كلمة المرور الحالية (ممارسة أمنية عالمية)
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // 2. تحديث البريد الإلكتروني إذا تم تغييره
    if (newEmail && newEmail !== user.email) {
      await updateEmail(user, newEmail);
    }

    // 3. تحديث كلمة المرور إذا تم إدخالها
    if (newPassword) {
      await updatePassword(user, newPassword);
    }
    
    return true;
  } catch (error: any) {
    console.error("Security Update Error:", error);
    throw error;
  }
};

// --- وظائف إدارة البطاقات ---

export const isSlugAvailable = async (slug: string, currentUserId?: string): Promise<boolean> => {
  if (!slug || slug.length < 3) return false;
  try {
    const cardRef = doc(db, "public_cards", slug.toLowerCase());
    const snap = await getDoc(cardRef);
    if (!snap.exists()) return true;
    const data = snap.data();
    return data.ownerId === currentUserId;
  } catch (error) {
    return false;
  }
};

export const saveCardToDB = async (userId: string, cardData: any) => {
  try {
    const dataToSave = { 
      ...cardData, 
      ownerId: userId,
      updatedAt: new Date().toISOString()
    };
    const cardRef = doc(db, "public_cards", cardData.id.toLowerCase());
    await setDoc(cardRef, dataToSave);
    const userCardRef = doc(db, "users", userId, "cards", "primary");
    await setDoc(userCardRef, dataToSave);
    return true;
  } catch (error: any) {
    throw error;
  }
};

export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId.toLowerCase());
    const snap = await getDoc(cardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    return null;
  }
};

export const getUserPrimaryCard = async (userId: string) => {
  try {
    const userCardRef = doc(db, "users", userId, "cards", "primary");
    const snap = await getDoc(userCardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    return null;
  }
};

export const deleteCardByAdmin = async (cardId: string, ownerId: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  try {
    await deleteDoc(doc(db, "public_cards", cardId.toLowerCase()));
    await deleteDoc(doc(db, "users", ownerId, "cards", "primary"));
    return true;
  } catch (error) {
    throw error;
  }
};

export const getAdminStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  try {
    const coll = collection(db, "public_cards");
    const snapshot = await getCountFromServer(coll);
    const q = query(coll, orderBy("updatedAt", "desc"), limit(100));
    const querySnapshot = await getDocs(q);
    const recentCards = querySnapshot.docs.map(doc => doc.data());
    return {
      totalCards: snapshot.data().count,
      recentCards
    };
  } catch (e) {
    return { totalCards: 0, recentCards: [] };
  }
};


import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
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
  getCountFromServer,
  where
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
export const googleProvider = new GoogleAuthProvider();
export const ADMIN_EMAIL = "adelawad1free@gmail.com";

// وظيفة مساعدة لتنظيف البيانات من قيم undefined التي تسبب فشل الحفظ في Firestore
const sanitizeData = (data: any) => {
  const clean: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      if (data[key] !== null && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        clean[key] = sanitizeData(data[key]);
      } else {
        clean[key] = data[key];
      }
    }
  });
  return clean;
};

export const getAuthErrorMessage = (code: string, lang: 'ar' | 'en'): string => {
  const isAr = lang === 'ar';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return isAr ? 'هذا البريد الإلكتروني مستخدم بالفعل.' : 'This email is already in use.';
    case 'auth/weak-password':
      return isAr ? 'كلمة المرور الجديدة ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).' : 'New password is too weak (min 6 characters).';
    case 'auth/requires-recent-login':
      return isAr ? 'يرجى تسجيل الدخول مرة أخرى لتنفيذ هذا الإجراء.' : 'Please re-login to perform this action.';
    default:
      return isAr ? 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.' : 'An unexpected error occurred.';
  }
};

export const getSiteSettings = async () => {
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return snap.exists() ? snap.data() : null;
  } catch (error) { return null; }
};

export const updateSiteSettings = async (settings: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  const cleanSettings = sanitizeData(settings);
  await setDoc(doc(db, "settings", "global"), { ...cleanSettings, updatedAt: new Date().toISOString() }, { merge: true });
};

export const saveCustomTemplate = async (template: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  const templateId = template.id || `custom_${Date.now()}`;
  const cleanTemplate = sanitizeData(template);
  await setDoc(doc(db, "custom_templates", templateId), {
    ...cleanTemplate,
    id: templateId,
    updatedAt: new Date().toISOString()
  });
};

export const getAllTemplates = async () => {
  try {
    const snap = await getDocs(collection(db, "custom_templates"));
    const templates = snap.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id } as any;
    });
    return templates.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  } catch (error: any) {
    console.error("Fetch templates error:", error);
    return [];
  }
};

export const deleteTemplate = async (id: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  if (!id) throw new Error("ID required");
  await deleteDoc(doc(db, "custom_templates", id));
};

export const saveCardToDB = async (userId: string, cardData: any, oldId?: string) => {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error("Auth required");
  const finalOwnerId = cardData.ownerId || userId || currentUid;
  
  // تنظيف البيانات من أي قيم undefined قبل الحفظ
  const cleanCardData = sanitizeData(cardData);
  const dataToSave = { ...cleanCardData, ownerId: finalOwnerId, updatedAt: new Date().toISOString() };
  const newId = cardData.id.toLowerCase();
  
  if (oldId && oldId.toLowerCase() !== newId) {
    await deleteDoc(doc(db, "public_cards", oldId.toLowerCase()));
    await deleteDoc(doc(db, "users", finalOwnerId, "cards", oldId.toLowerCase()));
  }
  
  await Promise.all([
    setDoc(doc(db, "public_cards", newId), dataToSave),
    setDoc(doc(db, "users", finalOwnerId, "cards", newId), dataToSave)
  ]);
};

export const getCardBySerial = async (serialId: string) => {
  try {
    const snap = await getDoc(doc(db, "public_cards", serialId.toLowerCase()));
    return snap.exists() ? snap.data() : null;
  } catch (error) { return null; }
};

export const getUserCards = async (userId: string) => {
  try {
    const snap = await getDocs(query(collection(db, "users", userId, "cards"), orderBy("updatedAt", "desc")));
    return snap.docs.map(doc => doc.data());
  } catch (error) { return []; }
};

export const deleteUserCard = async (ownerId: string, cardId: string) => {
  await Promise.all([
    deleteDoc(doc(db, "public_cards", cardId.toLowerCase())),
    deleteDoc(doc(db, "users", ownerId, "cards", cardId.toLowerCase()))
  ]);
};

export const isSlugAvailable = async (slug: string, currentUserId?: string): Promise<boolean> => {
  if (!slug || slug.length < 3) return false;
  try {
    const snap = await getDoc(doc(db, "public_cards", slug.toLowerCase()));
    if (!snap.exists()) return true;
    return snap.data().ownerId === currentUserId;
  } catch (error) { return false; }
};

export const getAdminStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  try {
    const snapshot = await getCountFromServer(collection(db, "public_cards"));
    const querySnapshot = await getDocs(query(collection(db, "public_cards"), orderBy("updatedAt", "desc"), limit(50)));
    return { totalCards: snapshot.data().count, recentCards: querySnapshot.docs.map(doc => doc.data()) };
  } catch (error) { return { totalCards: 0, recentCards: [] }; }
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const sendPasswordReset = async (email: string) => sendPasswordResetEmail(auth, email);

export const updateUserSecurity = async (currentPassword: string, newEmail: string, newPassword?: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("auth/no-user");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  if (newEmail && newEmail !== user.email) await updateEmail(user, newEmail);
  if (newPassword) await updatePassword(user, newPassword);
};

export const updateAdminSecurity = updateUserSecurity;

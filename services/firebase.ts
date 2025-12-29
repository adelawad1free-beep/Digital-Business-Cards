
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
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
 * حفظ البطاقة في Firestore
 * يتم الحفظ في مكانين:
 * 1. public_cards: للوصول العام عبر الرابط.
 * 2. users/{uid}/cards/primary: لتمكين المستخدم من تعديلها لاحقاً.
 */
export const saveCardToDB = async (userId: string, cardData: any) => {
  try {
    const dataToSave = { 
      ...cardData, 
      ownerId: userId,
      updatedAt: new Date().toISOString()
    };

    // 1. تحديث النسخة العامة
    const cardRef = doc(db, "public_cards", cardData.id);
    await setDoc(cardRef, dataToSave);
    
    // 2. تحديث نسخة المستخدم الخاصة للتحرير
    const userCardRef = doc(db, "users", userId, "cards", "primary");
    await setDoc(userCardRef, dataToSave);
    
    return true;
  } catch (error: any) {
    console.error("Firestore Save Error:", error);
    throw error;
  }
};

/**
 * جلب البطاقة عبر الرقم التسلسلي (للملف الشخصي العام)
 */
export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId);
    const snap = await getDoc(cardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    console.error("Firestore Read Error:", error);
    return null;
  }
};

/**
 * جلب بطاقة المستخدم المسجل الحالية (للتحرير)
 */
export const getUserPrimaryCard = async (userId: string) => {
  try {
    const userCardRef = doc(db, "users", userId, "cards", "primary");
    const snap = await getDoc(userCardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    console.error("Firestore User Card Error:", error);
    return null;
  }
};

/**
 * إحصائيات المسؤول
 */
export const getAdminStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }

  const coll = collection(db, "public_cards");
  const snapshot = await getCountFromServer(coll);
  
  const q = query(coll, orderBy("updatedAt", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  const recentCards = querySnapshot.docs.map(doc => doc.data());

  return {
    totalCards: snapshot.data().count,
    recentCards
  };
};

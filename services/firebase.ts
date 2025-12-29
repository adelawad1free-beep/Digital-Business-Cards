
import { initializeApp } from "firebase/app";
import { getAuth, deleteUser } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy,
  getCountFromServer 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
export const storage = getStorage(app);

export const ADMIN_EMAIL = "adelawad1free@gmail.com";

/**
 * رفع صورة إلى Firebase Storage
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const storageRef = ref(storage, `users/${userId}/profile_${Date.now()}.${fileExtension}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

/**
 * التحقق من توفر اسم الرابط
 */
export const isSlugAvailable = async (slug: string, currentUserId?: string): Promise<boolean> => {
  if (!slug || slug.length < 3) return false;
  
  try {
    const cardRef = doc(db, "public_cards", slug.toLowerCase());
    const snap = await getDoc(cardRef);
    
    if (!snap.exists()) return true;
    
    const data = snap.data();
    return data.ownerId === currentUserId;
  } catch (error) {
    console.error("Availability Check Error:", error);
    return false;
  }
};

/**
 * حفظ البطاقة في Firestore
 */
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
    console.error("Firestore Save Error:", error);
    throw error;
  }
};

export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId.toLowerCase());
    const snap = await getDoc(cardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    console.error("Firestore Read Error:", error);
    return null;
  }
};

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

export const deleteUserAccountAndData = async (userId: string, cardId?: string) => {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) throw new Error("Unauthorized");

    if (cardId) {
      await deleteDoc(doc(db, "public_cards", cardId.toLowerCase()));
    }
    await deleteDoc(doc(db, "users", userId, "cards", "primary"));
    await deleteUser(user);
    return true;
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    throw error;
  }
};

export const deleteCardByAdmin = async (cardId: string, ownerId: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  try {
    await deleteDoc(doc(db, "public_cards", cardId.toLowerCase()));
    await deleteDoc(doc(db, "users", ownerId, "cards", "primary"));
    return true;
  } catch (error) {
    console.error("Admin Delete Error:", error);
    throw error;
  }
};

export const getAdminStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  const coll = collection(db, "public_cards");
  const snapshot = await getCountFromServer(coll);
  const q = query(coll, orderBy("updatedAt", "desc"), limit(50));
  const querySnapshot = await getDocs(q);
  const recentCards = querySnapshot.docs.map(doc => doc.data());

  return {
    totalCards: snapshot.data().count,
    recentCards
  };
};

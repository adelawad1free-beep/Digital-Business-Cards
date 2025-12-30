
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

// وظيفة استعادة كلمة السر
export const sendPasswordReset = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// وظيفة الدخول عبر جوجل
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

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
    return { 
      siteNameAr: "هويتي الرقمية", 
      siteNameEn: "My Digital ID", 
      maintenanceMode: false 
    };
  }
};

export const updateSiteSettings = async (settings: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  try {
    const settingsRef = doc(db, "settings", "global");
    await setDoc(settingsRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    throw error;
  }
};

export const saveCardToDB = async (userId: string, cardData: any, oldId?: string) => {
  try {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) throw new Error("Authentication required");

    const finalOwnerId = cardData.ownerId || userId || currentUid;
    
    const dataToSave = { 
      ...cardData, 
      ownerId: finalOwnerId,
      updatedAt: new Date().toISOString()
    };

    const newId = cardData.id.toLowerCase();
    const cleanOldId = oldId?.toLowerCase();

    if (cleanOldId && cleanOldId !== newId) {
      try {
        await deleteDoc(doc(db, "public_cards", cleanOldId));
        await deleteDoc(doc(db, "users", finalOwnerId, "cards", cleanOldId));
      } catch (e) {
        console.warn("Cleanup error (ignored)");
      }
    }

    await Promise.all([
      setDoc(doc(db, "public_cards", newId), dataToSave),
      setDoc(doc(db, "users", finalOwnerId, "cards", newId), dataToSave)
    ]);
    
    return true;
  } catch (error: any) {
    console.error("Save Error:", error);
    throw error;
  }
};

export const deleteUserCard = async (ownerId: string, cardId: string) => {
  const cleanId = cardId.toLowerCase();
  let publicDeleted = false;
  let userDeleted = false;

  try {
    await deleteDoc(doc(db, "public_cards", cleanId));
    publicDeleted = true;
  } catch (error: any) {
    console.warn("Could not delete from public index:", error.message);
  }

  try {
    await deleteDoc(doc(db, "users", ownerId, "cards", cleanId));
    userDeleted = true;
  } catch (error: any) {
    console.warn("Could not delete from user collection:", error.message);
  }

  if (!publicDeleted && !userDeleted) {
    throw new Error("Missing or insufficient permissions.");
  }
  
  return true;
};

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

export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId.toLowerCase());
    const snap = await getDoc(cardRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    return null;
  }
};

export const getUserCards = async (userId: string) => {
  try {
    const cardsCol = collection(db, "users", userId, "cards");
    const q = query(cardsCol, orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  } catch (error: any) {
    return [];
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

export const updateUserSecurity = async (currentPassword: string, newEmail: string, newPassword?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required");

  try {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    if (newEmail && newEmail !== user.email) {
      await updateEmail(user, newEmail);
    }

    if (newPassword) {
      await updatePassword(user, newPassword);
    }
    
    return true;
  } catch (error: any) {
    console.error("User Security Update Error:", error);
    throw error;
  }
};

export const updateAdminSecurity = updateUserSecurity;

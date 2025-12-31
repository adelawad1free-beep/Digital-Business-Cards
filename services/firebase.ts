
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

/**
 * 🛠️ حل مشكلة "Permission Denied":
 * 1. اذهب إلى Firebase Console > Firestore > Rules
 * 2. انسخ القواعد التالية والصقها هناك:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /custom_templates/{id} { allow read: if true; allow write: if request.auth.token.email == "adelawad1free@gmail.com"; }
 *     match /settings/global { allow read: if true; allow write: if request.auth.token.email == "adelawad1free@gmail.com"; }
 *     match /public_cards/{id} { allow read: if true; allow create: if request.auth != null; allow update, delete: if request.auth.token.email == "adelawad1free@gmail.com" || (request.auth != null && resource.data.ownerId == request.auth.uid); }
 *     match /users/{userId}/{allPaths=**} { allow read, write: if request.auth != null && (request.auth.uid == userId || request.auth.token.email == "adelawad1free@gmail.com"); }
 *   }
 * }
 */

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

export const getSiteSettings = async () => {
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    return null;
  }
};

export const updateSiteSettings = async (settings: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await setDoc(doc(db, "settings", "global"), { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
};

export const saveCustomTemplate = async (template: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await setDoc(doc(db, "custom_templates", template.id), {
    ...template,
    updatedAt: new Date().toISOString()
  });
};

export const getAllTemplates = async () => {
  try {
    const snap = await getDocs(collection(db, "custom_templates"));
    const templates = snap.docs.map(doc => doc.data() as any);
    
    // الترتيب: الميزة (isFeatured) أولاً، ثم حسب رقم الترتيب (order)، ثم الأحدث
    return templates.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Firebase Auth Error: Please apply the Security Rules in your Firebase Console.");
    }
    return [];
  }
};

export const deleteTemplate = async (id: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await deleteDoc(doc(db, "custom_templates", id));
};

export const saveCardToDB = async (userId: string, cardData: any, oldId?: string) => {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) throw new Error("Auth required");
  const finalOwnerId = cardData.ownerId || userId || currentUid;
  const dataToSave = { ...cardData, ownerId: finalOwnerId, updatedAt: new Date().toISOString() };
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

// Fix: Implement updateUserSecurity to handle re-authentication and profile updates (email and password)
export const updateUserSecurity = async (currentPassword: string, newEmail: string, newPassword?: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No user logged in or user has no email address");
  
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  
  if (newEmail && newEmail !== user.email) {
    await updateEmail(user, newEmail);
  }
  
  if (newPassword) {
    await updatePassword(user, newPassword);
  }
};

// Fix: Export updateAdminSecurity as it is expected in AdminDashboard.tsx for managing admin credentials
export const updateAdminSecurity = updateUserSecurity;

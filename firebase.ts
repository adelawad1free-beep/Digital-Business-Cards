
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User
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
  where,
  increment,
  updateDoc,
  getAggregateFromServer,
  sum,
  serverTimestamp,
  startAt,
  endAt
} from "firebase/firestore";
import { CardData, TemplateCategory, VisualStyle } from "./types";

export { doc, getDoc };

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

// --- User Management ---

export const searchUsersByEmail = async (emailSearch: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) return [];
  if (!emailSearch || emailSearch.length < 3) return [];
  
  try {
    const q = query(
      collection(db, "users_registry"),
      where("email", ">=", emailSearch.toLowerCase()),
      where("email", "<=", emailSearch.toLowerCase() + "\uf8ff"),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
};

export const syncUserProfile = async (user: User) => {
  if (!user) return;
  try {
    const userRef = doc(db, "users_registry", user.uid);
    const snap = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email?.toLowerCase(),
      lastLogin: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: userData.lastLogin,
        role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
      });
    } else {
      await updateDoc(userRef, userData);
    }
  } catch (error) {
    console.warn("Registry sync failed:", error);
  }
};

export const getAllUsersWithStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  try {
    const usersSnap = await getDocs(query(collection(db, "users_registry"), orderBy("createdAt", "desc")));
    const users = usersSnap.docs.map(doc => doc.data());
    const cardsSnap = await getDocs(collection(db, "public_cards"));
    const allCards = cardsSnap.docs.map(doc => doc.data());

    return users.map(user => {
      const userCards = allCards.filter(card => card.ownerId === user.uid);
      return {
        ...user,
        cardCount: userCards.length,
        totalViews: userCards.reduce((acc, card) => acc + (card.viewCount || 0), 0),
        lastCardUpdate: userCards.length > 0 ? userCards.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0].updatedAt : null
      };
    });
  } catch (error) {
    throw error;
  }
};

// --- Auth Helpers ---

export const getAuthErrorMessage = (code: string, lang: 'ar' | 'en'): string => {
  const isAr = lang === 'ar';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return isAr ? 'هذا البريد الإلكتروني مستخدم بالفعل.' : 'This email is already in use.';
    case 'auth/weak-password':
      return isAr ? 'كلمة المرور الجديدة ضعيفة جداً.' : 'New password is too weak.';
    default:
      return isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.';
  }
};

// --- App Core ---

export const getSiteSettings = async () => {
  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    return snap.exists() ? snap.data() : null;
  } catch (error) { return null; }
};

export const updateSiteSettings = async (settings: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await setDoc(doc(db, "settings", "global"), { ...sanitizeData(settings), updatedAt: new Date().toISOString() }, { merge: true });
};

export const saveCustomTemplate = async (template: any) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  const templateId = template.id || `custom_${Date.now()}`;
  await setDoc(doc(db, "custom_templates", templateId), {
    ...sanitizeData(template),
    id: templateId,
    updatedAt: new Date().toISOString()
  });
};

export const getAllTemplates = async () => {
  try {
    const snap = await getDocs(collection(db, "custom_templates"));
    const templates = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
    return templates.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.order || 0) - (b.order || 0);
    });
  } catch (error) { return []; }
};

export const deleteTemplate = async (id: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await deleteDoc(doc(db, "custom_templates", id));
};

export async function saveCardToDB({ cardData, oldId }: { cardData: CardData, oldId?: string }) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Auth required");
  
  const finalOwnerId = cardData.ownerId || currentUser.uid;
  const dataToSave = { 
    ...sanitizeData(cardData), 
    ownerId: finalOwnerId,
    ownerEmail: cardData.ownerEmail || currentUser.email || '',
    updatedAt: new Date().toISOString(),
    isActive: cardData.isActive ?? true,
    viewCount: cardData.viewCount || 0
  };
  const newId = cardData.id.toLowerCase();
  
  if (oldId && oldId.toLowerCase() !== newId) {
    await deleteDoc(doc(db, "public_cards", oldId.toLowerCase()));
    await deleteDoc(doc(db, "users", finalOwnerId, "cards", oldId.toLowerCase()));
  }
  
  await Promise.all([
    setDoc(doc(db, "public_cards", newId), dataToSave),
    setDoc(doc(db, "users", finalOwnerId, "cards", newId), dataToSave)
  ]);
}

export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId.toLowerCase());
    const snap = await getDoc(cardRef);
    if (snap.exists()) {
      updateDoc(cardRef, { viewCount: increment(1) }).catch(() => {});
      return snap.data();
    }
    return null;
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
    const totalSnap = await getCountFromServer(collection(db, "public_cards"));
    const viewSumSnap = await getAggregateFromServer(collection(db, "public_cards"), { totalViews: sum('viewCount') });
    const recentDocs = await getDocs(query(collection(db, "public_cards"), orderBy("updatedAt", "desc"), limit(100)));
    return { 
      totalCards: totalSnap.data().count, 
      activeCards: totalSnap.data().count,
      totalViews: viewSumSnap.data().totalViews || 0,
      recentCards: recentDocs.docs.map(doc => doc.data()) 
    };
  } catch (error) { 
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const snap = await getDocs(collection(db, "template_categories"));
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as TemplateCategory)).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) { return []; }
};

export const saveTemplateCategory = async (category: Partial<TemplateCategory>) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  const catId = category.id || `cat_${Date.now()}`;
  await setDoc(doc(db, "template_categories", catId), { ...sanitizeData(category), id: catId }, { merge: true });
  return catId;
};

export const deleteTemplateCategory = async (id: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await deleteDoc(doc(db, "template_categories", id));
};

export const getAllVisualStyles = async () => {
  try {
    const snap = await getDocs(collection(db, "visual_styles"));
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as VisualStyle));
  } catch (error) { return []; }
};

export const saveVisualStyle = async (style: Partial<VisualStyle>) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  const styleId = style.id || `style_${Date.now()}`;
  await setDoc(doc(db, "visual_styles", styleId), { 
    ...sanitizeData(style), 
    id: styleId, 
    updatedAt: new Date().toISOString(),
    createdAt: style.createdAt || new Date().toISOString()
  }, { merge: true });
  return styleId;
};

export const deleteVisualStyle = async (id: string) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await deleteDoc(doc(db, "visual_styles", id));
};

export const toggleCardStatus = async (cardId: string, ownerId: string, isActive: boolean) => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  await Promise.all([
    updateDoc(doc(db, "public_cards", cardId.toLowerCase()), { isActive }),
    updateDoc(doc(db, "users", ownerId, "cards", cardId.toLowerCase()), { isActive })
  ]);
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


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
  serverTimestamp
} from "firebase/firestore";
import { CardData, TemplateCategory, VisualStyle } from "../types";

// تصدير الأدوات الأساسية لاستخدامها في المكونات
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

// --- وظائف إدارة المستخدمين (User Management) ---

export const syncUserProfile = async (user: User) => {
  if (!user) return;
  try {
    const userRef = doc(db, "users_registry", user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      lastLogin: new Date().toISOString(),
      updatedAt: serverTimestamp()
    };

    // استخدام setDoc مع merge لضمان عدم مسح تاريخ التسجيل الأصلي
    await setDoc(userRef, {
      ...userData,
      createdAt: userData.lastLogin, // سيتم تجاهلها إذا كان الحقل موجوداً بفضل merge
      role: user.email === ADMIN_EMAIL ? 'admin' : 'user'
    }, { merge: true });
  } catch (error) {
    console.warn("User registry sync skipped (Permission denied or network issue):", error);
  }
};

export const getAllUsersWithStats = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) throw new Error("Admin only");
  
  try {
    // 1. جلب كافة المسجلين
    const usersSnap = await getDocs(query(collection(db, "users_registry"), orderBy("createdAt", "desc")));
    const users = usersSnap.docs.map(doc => doc.data());

    // 2. جلب كافة البطاقات لحساب عددها لكل مستخدم
    const cardsSnap = await getDocs(collection(db, "public_cards"));
    const allCards = cardsSnap.docs.map(doc => doc.data());

    // 3. ربط البيانات وعمل الإحصائيات
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
    console.error("Error fetching user stats:", error);
    throw error;
  }
};

// --- وظائف التوثيق (Auth Helpers) ---

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

// --- وظائف الإعدادات والأنماط ---

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
      if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
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
  const finalOwnerEmail = cardData.ownerEmail || currentUser.email || '';

  const dataToSave = { 
    ...sanitizeData(cardData), 
    ownerId: finalOwnerId,
    ownerEmail: finalOwnerEmail,
    updatedAt: new Date().toISOString(),
    isActive: cardData.isActive ?? true,
    viewCount: cardData.viewCount || 0
  };
  const newId = cardData.id.toLowerCase();
  
  const isNewCard = !oldId;
  const oldCardSnap = oldId ? await getDoc(doc(db, "public_cards", oldId.toLowerCase())) : null;
  const oldTemplateId = oldCardSnap?.exists() ? oldCardSnap.data().templateId : null;

  if (oldId && oldId.toLowerCase() !== newId) {
    await deleteDoc(doc(db, "public_cards", oldId.toLowerCase()));
    await deleteDoc(doc(db, "users", finalOwnerId, "cards", oldId.toLowerCase()));
  }
  
  await Promise.all([
    setDoc(doc(db, "public_cards", newId), dataToSave),
    setDoc(doc(db, "users", finalOwnerId, "cards", newId), dataToSave)
  ]);

  if (cardData.templateId) {
    try {
      if (isNewCard) {
        await updateDoc(doc(db, "custom_templates", cardData.templateId), { usageCount: increment(1) });
      } else if (oldTemplateId && oldTemplateId !== cardData.templateId) {
        await updateDoc(doc(db, "custom_templates", oldTemplateId), { usageCount: increment(-1) });
        await updateDoc(doc(db, "custom_templates", cardData.templateId), { usageCount: increment(1) });
      }
    } catch (e) {}
  }
}

export const getCardBySerial = async (serialId: string) => {
  try {
    const cardRef = doc(db, "public_cards", serialId.toLowerCase());
    const snap = await getDoc(cardRef);
    if (snap.exists()) {
      updateDoc(cardRef, { 
        viewCount: increment(1),
        lastViewedAt: new Date().toISOString()
      }).catch(() => {});
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
  const cardSnap = await getDoc(doc(db, "public_cards", cardId.toLowerCase()));
  const templateId = cardSnap.exists() ? cardSnap.data().templateId : null;
  await Promise.all([
    deleteDoc(doc(db, "public_cards", cardId.toLowerCase())),
    deleteDoc(doc(db, "users", ownerId, "cards", cardId.toLowerCase()))
  ]);
  if (templateId) {
    try {
      await updateDoc(doc(db, "custom_templates", templateId), { usageCount: increment(-1) });
    } catch (e) {}
  }
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeQuery = query(collection(db, "public_cards"), where("updatedAt", ">=", thirtyDaysAgo.toISOString()));
    const activeSnap = await getCountFromServer(activeQuery);
    const viewSumSnap = await getAggregateFromServer(collection(db, "public_cards"), { totalViews: sum('viewCount') });
    const recentDocs = await getDocs(query(collection(db, "public_cards"), orderBy("updatedAt", "desc"), limit(100)));
    return { 
      totalCards: totalSnap.data().count, 
      activeCards: activeSnap.data().count,
      totalViews: viewSumSnap.data().totalViews || 0,
      recentCards: recentDocs.docs.map(doc => doc.data()) 
    };
  } catch (error) { 
    console.error("Error fetching admin stats:", error);
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

export const updateAdminSecurity = updateUserSecurity;

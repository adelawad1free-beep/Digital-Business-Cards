
import React, { useState } from 'react';
import { auth, signInWithGoogle, sendPasswordReset } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Language } from '../types';
import { X, Mail, Lock, Loader2, UserPlus, LogIn, Key, ArrowLeft, Info, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  lang: Language;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

type AuthView = 'login' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ lang, onClose, onSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [resetSent, setResetSent] = useState(false);

  const isRtl = lang === 'ar';
  const t = (ar: string, en: string) => isRtl ? ar : en;

  const getErrorMessage = (errorCode: string): React.ReactNode => {
    const currentDomain = window.location.hostname;
    
    switch (errorCode) {
      case 'auth/user-not-found': return t('هذا الحساب غير مسجل لدينا', 'User not found');
      case 'auth/wrong-password': 
      case 'auth/invalid-credential':
        return t('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Invalid email or password');
      case 'auth/email-already-in-use': return t('هذا البريد مستخدم بالفعل', 'Email already in use');
      case 'auth/weak-password': return t('كلمة المرور ضعيفة جداً', 'Password is too weak');
      case 'auth/popup-closed-by-user': return t('تم إغلاق نافذة تسجيل الدخول قبل الإكمال', 'Sign-in popup closed before completion');
      case 'auth/operation-not-allowed': return t('تسجيل الدخول عبر جوجل غير مفعل في إعدادات Firebase', 'Google sign-in is not enabled in Firebase Console');
      case 'auth/unauthorized-domain': 
        return (
          <div className="space-y-2">
            <p className="font-black">{t('هذا النطاق غير مصرح له', 'Unauthorized Domain')}</p>
            <p className="opacity-80">{t(`يجب إضافة النطاق (${currentDomain}) في إعدادات Firebase (Authorized Domains).`, `You must add (${currentDomain}) to Authorized Domains in Firebase Console.`)}</p>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              className="flex items-center gap-1 text-blue-500 underline mt-1"
            >
              {t('افتح Firebase Console', 'Open Firebase Console')} <ExternalLink size={12} />
            </a>
          </div>
        );
      default: return t(`حدث خطأ: ${errorCode}`, `Error: ${errorCode}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user.uid);
      } else if (view === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user.uid);
      } else if (view === 'forgot') {
        await sendPasswordReset(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      if (user) onSuccess(user.uid);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all font-medium`;
  const labelClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-2 block";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-8 md:p-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             {view === 'forgot' && (
                <button onClick={() => setView('login')} className="p-2 -mr-2 text-gray-400 hover:text-blue-500 transition-colors">
                   <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
                </button>
             )}
             <h3 className="text-2xl font-black dark:text-white">
               {view === 'login' ? t('تسجيل دخول', 'Welcome Back') : 
                view === 'signup' ? t('حساب جديد', 'Create Account') : 
                t('استعادة الحساب', 'Reset Password')}
             </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {resetSent ? (
          <div className="text-center py-10 animate-fade-in">
             <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
             </div>
             <h4 className="text-xl font-black dark:text-white mb-2">{t('تم الإرسال!', 'Email Sent!')}</h4>
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {t('لقد أرسلنا رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى تفقد صندوق الوارد.', 'We have sent a reset link to your email. Please check your inbox.')}
             </p>
             <button 
               onClick={() => { setView('login'); setResetSent(false); }}
               className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-sm"
             >
                {t('العودة لتسجيل الدخول', 'Back to Login')}
             </button>
          </div>
        ) : (
          <>
            {/* Google Button */}
            {(view === 'login' || view === 'signup') && (
              <div className="space-y-6">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  <span className="dark:text-white">{t('الدخول عبر جوجل', 'Continue with Google')}</span>
                </button>

                <div className="flex items-center gap-4 py-2">
                   <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('أو عبر البريد', 'OR EMAIL')}</span>
                   <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className={labelClasses}>{t('البريد الإلكتروني', 'Email Address')}</label>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="mail@example.com"
                  />
                </div>
              </div>

              {view !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className={labelClasses}>{t('كلمة المرور', 'Password')}</label>
                    <button 
                      type="button" onClick={() => setView('forgot')}
                      className="text-[10px] font-black text-blue-600 uppercase hover:underline mb-2"
                    >
                      {t('نسيت كلمة السر؟', 'Forgot?')}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input 
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-2 items-start p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl animate-shake">
                   <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                   <div className="text-red-600 dark:text-red-400 text-xs font-bold leading-tight">{error}</div>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (view === 'login' ? <LogIn size={20} /> : view === 'signup' ? <UserPlus size={20} /> : <Key size={20} />)}
                {view === 'login' ? t('دخول', 'Sign In') : view === 'signup' ? t('إنشاء حساب', 'Create Account') : t('إرسال رابط الاستعادة', 'Send Reset Link')}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <button 
                onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                {view === 'login' 
                  ? t('ليس لديك حساب؟ سجل الآن', "Don't have an account? Sign Up")
                  : t('لديك حساب بالفعل؟ سجل دخولك', "Already have an account? Log In")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

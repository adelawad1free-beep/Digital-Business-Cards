
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Language } from '../types';
import { X, Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  lang: Language;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ lang, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess(userCredential.user.uid);
    } catch (err: any) {
      setError(lang === 'ar' ? 'حدث خطأ في البيانات، يرجى التأكد' : 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black dark:text-white">
            {isLogin 
              ? (lang === 'ar' ? 'تسجيل دخول' : 'Login') 
              : (lang === 'ar' ? 'حساب جديد' : 'Sign Up')}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className={`w-full ${isRtl ? 'pr-4 pl-12' : 'pl-12 pr-4'} py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all`}
                placeholder="example@mail.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className={`w-full ${isRtl ? 'pr-4 pl-12' : 'pl-12 pr-4'} py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? (lang === 'ar' ? 'دخول' : 'Sign In') : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            {isLogin 
              ? (lang === 'ar' ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Sign Up")
              : (lang === 'ar' ? 'لديك حساب بالفعل؟ سجل دخولك' : "Already have an account? Log In")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

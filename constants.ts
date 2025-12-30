
import { TranslationStrings, CardData, Language } from './types';

export const LANGUAGES_CONFIG: Record<Language, { name: string, native: string, dir: 'rtl' | 'ltr', flag: string }> = {
  ar: { name: 'Arabic', native: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  en: { name: 'English', native: 'English', dir: 'ltr', flag: '🇺🇸' },
  es: { name: 'Spanish', native: 'Español', dir: 'ltr', flag: '🇪🇸' },
  fr: { name: 'French', native: 'Français', dir: 'ltr', flag: '🇫🇷' },
  de: { name: 'German', native: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  zh: { name: 'Chinese', native: '中文', dir: 'ltr', flag: '🇨🇳' },
  ja: { name: 'Japanese', native: '日本語', dir: 'ltr', flag: '🇯🇵' },
  pt: { name: 'Portuguese', native: 'Português', dir: 'ltr', flag: '🇵🇹' },
  ru: { name: 'Russian', native: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  hi: { name: 'Hindi', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' }
};

export const TRANSLATIONS: TranslationStrings = {
  // Navigation & General
  appName: { 
    en: 'My Digital Identity', ar: 'هويتي الرقمية', es: 'Mi Identidad Digital', fr: 'Mon Identité Numérique', 
    de: 'Meine Digitale Identität', zh: '我的数字身份', ja: 'マイデジタルアイデンティティ', pt: 'Minha Identidade Digital',
    ru: 'Моя цифровая личность', hi: 'मेरी डिजिटल पहचान'
  },
  home: { en: 'Home', ar: 'الرئيسية', es: 'Inicio', fr: 'Accueil', de: 'Startseite', zh: '首页', ja: 'ホーム', pt: 'Início', ru: 'Главная', hi: 'होम' },
  myCards: { en: 'My Cards', ar: 'بطاقاتي', es: 'Mis Tarjetas', fr: 'Mes Cartes', de: 'Meine Karten', zh: '我的卡片', ja: 'マイカード', pt: 'Meus Cartões', ru: 'Мои карты', hi: 'मेरे कार्ड' },
  account: { en: 'Account', ar: 'الحساب', es: 'Cuenta', fr: 'Compte', de: 'Konto', zh: '账户', ja: 'アカウント', pt: 'Conta', ru: 'Аккаунт', hi: 'खाता' },
  admin: { en: 'Admin', ar: 'الإدارة', es: 'Admin', fr: 'Admin', de: 'Admin', zh: '管理', ja: '管理者', pt: 'Admin', ru: 'Админ', hi: 'व्यवस्थापक' },
  login: { en: 'Login', ar: 'دخول', es: 'Acceder', fr: 'Connexion', de: 'Anmelden', zh: '登录', ja: 'ログイン', pt: 'Entrar', ru: 'Войти', hi: 'لॉगين' },
  logout: { en: 'Logout', ar: 'خروج', es: 'Salir', fr: 'Déخطوة', de: 'Abmelden', zh: '退出', ja: 'ログアウト', pt: 'Sair', ru: 'Выйти', hi: 'لॉगआउट' },

  // Home Page
  heroBadge: { 
    en: 'AI-Powered Digital Cards', ar: 'بطاقات رقمية مدعومة بالذكاء الاصطناعي', 
    es: 'Tarjetas digitales con IA', fr: 'Cartes numériques par IA',
    de: 'KI-gesteuerte Digitalkarten', zh: '人工智能驱动的数字卡片',
    ja: 'AI駆動のデジタルカード', pt: 'Cartões Digitais com IA',
    ru: 'Цифровые карты с ИИ', hi: 'एआई-संचالت डिजिटल कार्ड'
  },
  heroTitle: { 
    en: 'Networking, Reimagined.', ar: 'التواصل، بأسلوب جديد.',
    es: 'Networking, reinventado.', fr: 'Le réseau, réinventé.',
    de: 'Networking, neu gedacht.', zh: '社交网络，重新定义。',
    ja: 'ネットワーキング、再構築。', pt: 'Networking, reinventado.',
    ru: 'Нетворкинг, переосмысление.', hi: 'नेटवर्كينغ، تعزيز التواصل.'
  },
  heroDesc: { 
    en: 'Your professional identity, smart and fast. Replace your paper cards with a smart digital profile.', 
    ar: 'هويتك المهنية، بذكاء وسرعة. استبدل بطاقاتك الورقية بملف شخصي ذكي.',
    es: 'Tu identidad profesional, inteligente y rápida. Reemplaza tus tarjetas de papel.',
    fr: 'Votre identité professionnelle, intelligente et rapide. Remplacez vos cartes papier.',
    de: 'Ihre professionelle Identität, intelligent und schnell. Ersetzen Sie Ihre Papierkarten.',
    zh: '您的专业身份，智能且快速。用智能数字档案取代纸质名片。',
    ja: 'あなたのプロフェッショナルなアイデンティティ،スマートでスピーディー.紙のカードをスマートなデジタルプロフィールに.',
    pt: 'Sua identidade profissional, inteligente e rápida. Substitua seus cartões de papel.',
    ru: 'Ваша профессиональная идентичность, умная и быстрая. Замените бумажные карты.',
    hi: 'आपकी पेशेवर पहचान, स्मार्ट और तेज़। अपने पेपर कार्ड को स्मार्ट डिजिटल प्रोफाइल से बदलें।'
  },
  createBtn: { 
    en: 'Create My Card', ar: 'إنشاء بطاقتي', es: 'Crear mi tarjeta', fr: 'Créer ma carte',
    de: 'Karte erstellen', zh: '创建我的卡片', ja: 'カードを作成', pt: 'Criار meu cartão',
    ru: 'Создать карту', hi: 'मेरी आईडी बनाएं'
  },

  // Editor Section
  customLink: { en: 'Custom Link', ar: 'رابط مخصص', es: 'Enlace personalizado', fr: 'Lien personnalisé', de: 'Benutzerdefinierter Link', zh: '自定义链接', ja: 'カスタムリンク', pt: 'Link personalizado', ru: 'Своя ссылка', hi: 'كستم لينك' },
  linkHint: { en: 'Your unique ID:', ar: 'رابطك الفريد:', es: 'Tu ID único:', fr: 'Votre ID unique:', de: 'Ihre eindeutige ID:', zh: '您的唯一ID：', ja: 'あなたの固有ID：', pt: 'Seu ID exclusivo:', ru: 'Ваш уникальный ID:', hi: 'आपकी विशिष्ट आईडी:' },
  checkAvailability: { en: 'Check', ar: 'تحقق', es: 'Verificar', fr: 'Vérifier', de: 'Prüfen', zh: '检查', ja: '確認', pt: 'Verificar', ru: 'Проверить', hi: 'जांचें' },
  imageSource: { en: 'Profile Image', ar: 'الصورة الشخصية', es: 'Imagen de perfil', fr: 'Photo de profil', de: 'Profilbild', zh: '个人头像', ja: 'プロフィール画像', pt: 'Imagem de perfil', ru: 'Фото профиля', hi: 'प्रोफ़ाइल छवि' },
  directLink: { en: 'Direct Link', ar: 'رابط مباشر', es: 'Enlace directo', fr: 'Lien direct', de: 'Direkter Link', zh: '直接链接', ja: 'ダイレクトリンク', pt: 'Link direto', ru: 'Прямая ссылка', hi: 'डायरेक्ट لينك' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', zh: '全名', ja: '氏名', pt: 'Nome completo', ru: 'Полное имя', hi: 'पूरा नाम' },
  placeholderName: { en: 'John Doe', ar: 'أحمد محمد', es: 'Juan Pérez', fr: 'Jean Dupont', de: 'Max Mustermann', zh: '张三', ja: '山田太郎', pt: 'João Silva', ru: 'Иван Иванов', hi: 'राहुल कुमार' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي', es: 'Cargo', fr: 'Poste', de: 'Berufsbezeichnung', zh: '职位', ja: '役職', pt: 'Cargo', ru: 'Должность', hi: 'पद' },
  placeholderTitle: { en: 'Software Engineer', ar: 'مهندس برمجيات', es: 'Ingeniero de Software', fr: 'Ingénieur Logiciel', de: 'Softwareentwickler', zh: '软件工程师', ja: 'ソフトウェアエンジニア', pt: 'Engenheiro de Software', ru: 'Программный инженер', hi: 'سॉफ्टवेयर इंजीनियर' },
  company: { en: 'Company', ar: 'الشركة', es: 'Empresa', fr: 'Entreprise', de: 'Unternehmen', zh: '公司', ja: '会社', pt: 'Empresa', ru: 'Компания', hi: 'कंपनी' },
  bio: { en: 'Bio', ar: 'النبذة', es: 'Biografía', fr: 'Bio', de: 'Bio', zh: '简介', ja: '自己紹介', pt: 'Bio', ru: 'О себе', hi: 'जीवनी' },
  aiBio: { en: 'AI Generate', ar: 'توليد ذكي', es: 'Generar con IA', fr: 'Générer par IA', de: 'KI-Generierung', zh: '人工智能生成', ja: 'AI生成', pt: 'Gerar com IA', ru: 'Создать ИИ', hi: 'एआई जेनरेट' },
  email: { en: 'Email', ar: 'البريد الإلكتروني', es: 'Correo', fr: 'Email', de: 'E-Mail', zh: '电子邮件', ja: 'メール', pt: 'E-mail', ru: 'Email', hi: 'ईमेल' },
  phone: { en: 'Phone', ar: 'رقم الهاتف', es: 'Teléfono', fr: 'Téléphone', de: 'Telefon', zh: '电话', ja: '電話番号', pt: 'Telefone', ru: 'Телефон', hi: 'फ़ोन' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'واتساب' },
  website: { en: 'Website', ar: 'الموقع الإلكتروني', es: 'Sitio web', fr: 'Site Web', de: 'Webseite', zh: '网站', ja: 'ウェブサイト', pt: 'Site', ru: 'Веб-сайт', hi: 'वेبسايت' },
  socials: { en: 'Social Links', ar: 'روابط التواصل', es: 'Redes sociales', fr: 'Réseaux sociaux', de: 'Soziale Netzwerke', zh: '社交链接', ja: 'SNSリンク', pt: 'Redes sociais', ru: 'Соцсети', hi: 'सोशल लिंक' },
  theme: { en: 'Theme', ar: 'السمة', es: 'Tema', fr: 'Thème', de: 'Design', zh: '主题', ja: 'テーマ', pt: 'Tema', ru: 'Тема', hi: 'थीम' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التعديلات', es: 'Guardar cambios', fr: 'Enregistrer', de: 'Speichern', zh: '保存更改', ja: '変更を保存', pt: 'Salvar alterações', ru: 'Сохранить', hi: 'परिवर्तन सहेजें' },

  // Preview / Public Profile
  saveContact: { 
    en: 'Save Contact', ar: 'حفظ جهة الاتصال', es: 'Guardar contacto', fr: 'Enregistrer le contact',
    de: 'Kontakt speichern', zh: '保存联系人', ja: '連絡先を保存', pt: 'Salvar contato',
    ru: 'Сохранить контакт', hi: 'संपर्क سहेजें'
  },
  call: { en: 'Call', ar: 'اتصال', es: 'Llamar', fr: 'Appeler', de: 'Anrufen', zh: '呼叫', ja: '電話', pt: 'Ligar', ru: 'Позвонить', hi: 'كول' },
  whatsappBtn: { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'واتساب' },

  // Card Manager
  manageCards: { en: 'Manage Cards', ar: 'إدارة البطاقات', es: 'Gestionar tarjetas', fr: 'Gérer les cartes', de: 'Karten verwalten', zh: '管理卡片', ja: 'カード管理', pt: 'Gerenciar cartões', ru: 'Управление картами', hi: 'कार्ड प्रबंधित करें' },
  edit: { en: 'Edit', ar: 'تعديل', es: 'Editar', fr: 'Modifier', de: 'Bearbeiten', zh: '编辑', ja: '編集', pt: 'Editar', ru: 'Правка', hi: 'संपादित करें' },
  view: { en: 'View', ar: 'عرض', es: 'Ver', fr: 'Voir', de: 'Ansehen', zh: '查看', ja: '見る', pt: 'Ver', ru: 'Просмотр', hi: 'देखें' },
  delete: { en: 'Delete', ar: 'حذف', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', zh: '删除', ja: '削除', pt: 'Excluir', ru: 'Удалить', hi: 'مٹا دیں' },
  
  // Auth
  welcomeBack: { en: 'Welcome Back', ar: 'أهلاً بك مجدداً', es: 'Bienvenido de nuevo', fr: 'Bon retour', de: 'Willkommen zurück', zh: '欢迎回来', ja: 'おかえりなさい', pt: 'Bem-vindo de volta', ru: 'С возвращением', hi: 'वाپसी पर स्वागत है' },
  createAccount: { en: 'Create Account', ar: 'إنشاء حساب', es: 'Crear cuenta', fr: 'Créer un compte', de: 'Konto erstellen', zh: '创建账户', ja: 'アカウント作成', pt: 'Criar conta', ru: 'Создать аккаунт', hi: 'खाता बनाएं' }
};

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'whatsapp_social', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'github', name: 'GitHub' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'threads', name: 'Threads' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'behance', name: 'Behance' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'discord', name: 'Discord' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'spotify', name: 'Spotify' }
];

export const THEME_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0f172a', '#C5A059'];

export const THEME_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

export const SAMPLE_DATA: Record<string, Partial<CardData>> = {
  ar: { name: 'أحمد محمد', title: 'مستشار تقني', company: 'هويتي', bio: 'خبير في التحول الرقمي.', themeType: 'color', themeColor: '#2563eb', themeGradient: THEME_GRADIENTS[0], backgroundImage: '', isDark: false, socialLinks: [] },
  en: { name: 'John Doe', title: 'Software Engineer', company: 'NextID', bio: 'Building the future of networking.', themeType: 'color', themeColor: '#2563eb', themeGradient: THEME_GRADIENTS[0], backgroundImage: '', isDark: false, socialLinks: [] }
};

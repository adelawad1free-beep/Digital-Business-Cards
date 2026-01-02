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
  hi: { name: 'Hindi', native: 'हिंदी', dir: 'ltr', flag: '🇮🇳' },
};

export const THEME_COLORS = [
  // Professional Blues
  '#2563eb', '#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', 
  // Nature & Greens
  '#14b8a6', '#10b981', '#22c55e', '#84cc16', 
  // Warm & Luxury
  '#eab308', '#f97316', '#ef4444', '#f43f5e', '#db2777', 
  // Purple & Royal
  '#d946ef', '#a855f7', '#7c3aed', '#6366f1', 
  // Neutral & Dark
  '#4b5563', '#1e293b', '#0f172a', '#000000',
  // New Trendy Colors
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4AF37', '#C0C0C0', '#8E44AD', '#2C3E50', '#E67E22'
];

export const THEME_GRADIENTS = [
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  // New Aurora & Soft Gradients
  'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to right, #434343 0%, #000000 100%)',
  'linear-gradient(45deg, #8baaaa 0%, #ae8b9c 100%)',
  'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
  'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)'
];

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X (Twitter)' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'whatsapp_social', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'threads', name: 'Threads' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'github', name: 'GitHub' },
  { id: 'behance', name: 'Behance' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'discord', name: 'Discord' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'spotify', name: 'Spotify' }
];

export const BACKGROUND_PRESETS = [
  // Row 1: Abstract & Artistic
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
  // Row 2: Office & Professional (Clean)
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800',
  // Row 3: Celebrations & Joy (Special Occasions - No People)
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800', // Balloons (Fixed with active link)
  'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=800', // Fireworks
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', // Confetti
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', // Festive Lights
  // Row 4: More Joy & Flowers
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800', // Gift Box
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', // Gold Sparkles
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', // Colorful Decorations
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800', // Pink Party Vibes
  // Row 5: Nature & Serenity
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
  // Row 6: Luxury Textures
  'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1504333638930-c8787321eee0?auto=format&fit=crop&q=80&w=800'
];

export const PATTERN_PRESETS = [
  { id: 'none', name: 'None', svg: '' },
  { id: 'dots', name: 'Dots', svg: '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="2" cy="2" r="1" fill="currentColor"/></svg>' },
  { id: 'grid', name: 'Grid', svg: '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/></svg>' },
  { id: 'lines', name: 'Lines', svg: '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M 0 10 L 20 10" fill="none" stroke="currentColor" stroke-width="0.5"/></svg>' },
  { id: 'cross', name: 'Cross', svg: '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M 10 0 L 10 20 M 0 10 L 20 10" fill="none" stroke="currentColor" stroke-width="0.5"/></svg>' }
];

export const SVG_PRESETS = [
  { id: 'wave', name: 'Wave', svg: '<svg viewBox="0 0 1440 320"><path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>' },
  { id: 'curve', name: 'Curve', svg: '<svg viewBox="0 0 1440 320"><path fill="currentColor" d="M0,96L120,122.7C240,149,480,203,720,213.3C960,224,1200,192,1320,176L1440,160L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>' }
];

export const SAMPLE_DATA: Record<string, Partial<CardData>> = {
  en: {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    company: 'Tech Innovations',
    bio: 'Passionate about building scalable web applications and exploring the latest AI technologies.',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    whatsapp: '12345678900',
    website: 'https://johndoe.dev',
    isDark: false,
    themeType: 'gradient',
    themeGradient: THEME_GRADIENTS[0],
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: '#' },
      { platformId: 'github', platform: 'GitHub', url: '#' }
    ]
  },
  ar: {
    name: 'أحمد محمد',
    title: 'مهندس برمجيات أول',
    company: 'ابتكارات التقنية',
    bio: 'شغوف ببناء تطبيقات الويب القابلة للتوسع واستكشاف أحدث تقنيات الذكاء الاصطناعي.',
    email: 'ahmed.m@example.com',
    phone: '+966 50 123 4567',
    whatsapp: '966501234567',
    website: 'https://ahmed.dev',
    isDark: false,
    themeType: 'gradient',
    themeGradient: THEME_GRADIENTS[0],
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: '#' },
      { platformId: 'x', platform: 'X', url: '#' }
    ]
  }
};

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'NextID', ar: 'هويتي', es: 'NextID', fr: 'NextID', de: 'NextID', zh: 'NextID', ja: 'NextID', pt: 'NextID', ru: 'NextID', hi: 'NextID' },
  home: { en: 'Home', ar: 'الرئيسية', es: 'Inicio', fr: 'Accueil', de: 'Startseite', zh: '首页', ja: 'ホーム', pt: 'Início', ru: 'Главная', hi: 'होम' },
  templates: { en: 'Templates', ar: 'القوالب', es: 'Plantillas', fr: 'Modèles', de: 'Vorlagen', zh: '模板', ja: 'テンプレート', pt: 'Modelos', ru: 'Шаблоны', hi: 'टेम्पलेट्स' },
  myCards: { en: 'My Cards', ar: 'بطاقاتي', es: 'Mis Tarjetas', fr: 'Mes Cartes', de: 'Meine Karten', zh: '我的名片', ja: 'マイカード', pt: 'Meus Cardões', ru: 'Мои Карточки', hi: 'मेरे कार्ड' },
  admin: { en: 'Admin', ar: 'الإدارة', es: 'Admin', fr: 'Admin', de: 'Admin', zh: '管理', ja: '管理', pt: 'Admin', ru: 'Админ', hi: 'प्रशासन' },
  account: { en: 'Account', ar: 'الحساب', es: 'Cuenta', fr: 'Compte', de: 'Konto', zh: '账户', ja: 'アカウント', pt: 'Conta', ru: 'Аккауنت', hi: 'खाتا' },
  login: { en: 'Login', ar: 'دخول', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden', zh: '登录', ja: 'ログイン', pt: 'Entrar', ru: 'Вход', hi: 'لॉगين' },
  logout: { en: 'Logout', ar: 'خروج', es: 'Cerrar sesión', fr: 'Déconnexion', de: 'Abmelden', zh: '退出', ja: 'ログアウト', pt: 'Sair', ru: 'Выход', hi: 'لॉगأوت' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التعديلات', es: 'Guardار', fr: 'Enregistrer', de: 'Speichern', zh: '保存更改', ja: '変更を保存', pt: 'Salvar', ru: 'Сохранить', hi: 'परيفيرتن سيهجين' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', zh: '全名', ja: 'フルネーム', pt: 'Nome Completo', ru: 'Полное имя', hi: 'पूرا نام' },
  placeholderName: { en: 'Enter your name', ar: 'أدخل اسمك الكامل', es: 'Ingresa tu nombre', fr: 'Entrez votre nom', de: 'Name eingeben', zh: '输入姓名', ja: '名前を入力', pt: 'Digite seu nome', ru: 'Введите имя', hi: 'अपना नाम दर्ज करें' },
  theme: { en: 'Theme', ar: 'السمة', es: 'Tema', fr: 'Thème', de: 'Theما', zh: '主题', ja: 'テーマ', pt: 'Tema', ru: 'Тема', hi: 'थीم' },
  saveContact: { en: 'Save Contact', ar: 'حفظ جهة الاتصال', es: 'Guardar contacto', fr: 'Enregistrer le contact', de: 'Kontakt speichern', zh: '保存联系人', ja: '連絡先を保存', pt: 'Salvar contato', ru: 'Сохранить контакт', hi: 'संपرك سيهجين' },
  call: { en: 'Call', ar: 'اتصال', es: 'Llamar', fr: 'Appeler', de: 'Anrufen', zh: '呼叫', ja: '電話', pt: 'Ligar', ru: 'Позвонить', hi: 'كول كرين' },
  whatsappBtn: { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'واتساب' },
  heroBadge: { en: 'Create your digital identity', ar: 'أنشئ هويتك الرقمية الآن', es: 'Crea tu identity digital', fr: 'Créez votre حديتé numérique', de: 'Erstellen Sie Ihre digitale Identität', zh: '创建您的数字身份', ja: 'デジタルアイデンティティを作成', pt: 'Crie sua identidade digital', ru: 'Создайте цифровую личность', hi: 'अपनी डिजिटल पहचान बनाएं' },
  heroTitle: { en: 'Professional Digital Business Cards', ar: 'بطاقات أعمال رقمية احترافية', es: 'Tarjetas de visita digitales', fr: 'Cartes de visite numériques', de: 'Digitale Visitenكarten', zh: '专业数字名片', ja: 'プロフェッショナルな名片', pt: 'Cartões de Visita Digitais', ru: 'Цифровые визитки', hi: 'पेशےور डिजिटल बिजनेस कार्ड' },
  heroDesc: { en: 'The easiest way to share your professional profile with the world.', ar: 'الطريقة الأسهل لمشاركة ملفك المهني مع العالم.', es: 'La forma más fácil de compartir tu perfil.', fr: 'Le moyen le plus simple de partager votre profil.', de: 'Der einfachste Weg, Ihr Profil zu teilen.', zh: '分享您的个人资料的最简单方法。', ja: 'プロフィールを共有する最も簡単な方法。', pt: 'A maneira más fácil de compartilhar seu perfil.', ru: 'Самый простой способ поделиться своим профилем.', hi: 'अपनी प्रोफ़ائل साझा کرنے کا सबसे आसान तरीका।' },
  createBtn: { en: 'Create Now', ar: 'ابدأ الآن', es: 'Crear ahora', fr: 'Créer maintenant', de: 'Jetzt erstellen', zh: '立即创建', ja: '今すぐ创建', pt: 'Criar ahora', ru: 'Создать сейчас', hi: 'अभी बनाएं' },
  template: { en: 'Layout Template', ar: 'قالب التوزيع', es: 'Plantilla', fr: 'Modèle', de: 'Layout', zh: '布局模板', ja: 'レイاولت', pt: 'Modelo de Layout', ru: 'Шаблон макета', hi: 'लेاولٹ टेम्पलेट' },
  selectTemplate: { en: 'Select Style', ar: 'اختر النمط الهيكلي', es: 'Seleccionar estilo', fr: 'Choisir le style', de: 'Stil wählen', zh: '选择样式', ja: 'スタイルを選択', pt: 'Selecionar Estilo', ru: 'Выбрать стиль', hi: 'शैली चुनें' },
  bio: { en: 'Professional Bio', ar: 'النبذة المهنية', es: 'Bio profesional', fr: 'Bio professionnelle', de: 'Professionelle Bio', zh: '职业简介', ja: 'プロフィールの概要', pt: 'Bio Profissional', ru: 'Биография', hi: 'पेशेور जैव' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني', es: 'Correo electrónico', fr: 'Email', de: 'E-Mail', zh: '电子邮件', ja: 'メールアドレス', pt: 'E-mail', ru: 'Эل. почта', hi: 'ईमेल पता' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف', es: 'Teléfono', fr: 'Téléphone', de: 'Telefon', zh: '电话号码', ja: '電話番号', pt: 'Telefone', ru: 'Телефон', hi: 'फ़ون نمبر' },
  whatsapp: { en: 'WhatsApp', ar: 'رقم الواتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'واتس اب' },
  website: { en: 'Website URL', ar: 'رابط الموقع', es: 'Sitio web', fr: 'Site web', de: 'Webseite', zh: '网址', ja: 'ウェブサイト', pt: 'Website', ru: 'Веب-сайт', hi: 'वेبسايٹ' },
  socials: { en: 'Social Links', ar: 'روابط التواصل', es: 'Redes sociales', fr: 'Réseaux sociaux', de: 'Soziale Netzwerke', zh: '社交链接', ja: 'ソーシャルリンク', pt: 'Redes Sociais', ru: 'Соцсети', hi: 'सोशल لينك' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي', es: 'Cargo', fr: 'Postه', de: 'Berufsbezeichnung', zh: '职位', ja: '役職', pt: 'Cargo', ru: 'Должность', hi: 'पद' },
  company: { en: 'Company', ar: 'الشركة', es: 'Empresa', fr: 'Entreprise', de: 'Firma', zh: '公司', ja: '会社', pt: 'Empresa', ru: 'Компания', hi: 'कंपनी' },
  templatesTitle: { en: 'Discover Our Templates', ar: 'اكتشف قوالبنا الاحترافية', es: 'Descubre plantillas', fr: 'Découvrez nos modèles', de: 'Vorlagen entdecken', zh: '发现我们的模板', ja: 'テンプレートを探す', pt: 'Descubرا nossos modelos', ru: 'Наши шаблоны', hi: 'हमारे टेम्पलेट्स' },
  templatesDesc: { en: 'Choose the perfect design that reflects your professional identity.', ar: 'اختر التصميم المثالي الذي يعكس هويتك المهنية الراقية.', es: 'Elige el diseño perfecto.', fr: 'Choisissez le design parfait.', de: 'Wählen Sie das perfekte Design.', zh: '选择反映您身份的完美設計。', ja: 'あなたのアイデンティティを反映するデザインを選択してください。', pt: 'Escolha o design perfecto.', ru: 'Выберите идеальный дизайн.', hi: 'अपनी पहचान को दर्शाने वाला डिज़ाइन चुनें।' },
  useTemplate: { en: 'Use This Design', ar: 'استخدم هذا التصميم', es: 'Usar este diseño', fr: 'Utiliser ce design', de: 'Dieses Design nutzen', zh: '使用此 design', ja: 'このデザインを使用', pt: 'Usar este design', ru: 'Использовать этот تصميم', hi: 'इस डिज़ाइन का उपयोग करें' },
  noCardsYet: { en: 'No cards yet', ar: 'لا توجد بطاقات حتى الآن', es: 'Sin tarjetas aún', fr: 'Pas encore de كارتس', de: 'Noch keine Karten', zh: '暂无名片', ja: 'まだカードはありません', pt: 'Nenhum cartão ainda', ru: 'Нет карточек', hi: 'अभी तक کوئی كارد نهي' },
  supportProject: { en: 'Support this free project', ar: 'ادعم استمرارية هذا المشروع المجاني', es: 'Apoya este proyecto', fr: 'Soutenir ce projet', de: 'Projekt unterstützen', zh: '支持这个项目', ja: 'プロジェクトを支援する', pt: 'Apoie este projeto', ru: 'Поддержать проект', hi: 'परियोजना का समर्थन करें' },
  buyMeCoffee: { en: 'Buy Me a Coffee', ar: 'ادعمني بكوب قهوة', es: 'Invítame a un café', fr: 'Payez-moi un café', de: 'Kaffee ausgeben', zh: '请我喝杯咖啡', ja: 'コーヒーをおごる', pt: 'Pague-me um café', ru: 'Купить мне кофе', hi: 'مجھے ایک कॉफ़ी पिलाएँ' },
  
  invitationPrefix: { en: 'Invited by', ar: 'يتشرف', es: 'Invitado por', fr: 'Invité par', de: 'Eingeladen von', zh: '受邀于', ja: '招待者', pt: 'Convidado por', ru: 'Приглашен', hi: 'کے द्वारा आमंत्रित' },
  invitationWelcome: { en: 'Welcomes you to', ar: 'بدعوتكم لحضور', es: 'Te invita a', fr: 'Vous invite à', de: 'Lädt Sie ein zu', zh: '欢迎您参加', ja: 'あなたを歓迎します', pt: 'Convida você para', ru: 'Приغلابت вас на', hi: 'आपका स्वागत करता है' },

  editTemplate: { en: 'Edit Template', ar: 'تعديل القالب', es: 'Editar plantilla', fr: 'Modifier le modèle', de: 'Vorlage bearbeiten', zh: '编辑模板', ja: 'テンプレートを編集', pt: 'Editar Modelo', ru: 'Изменить шаблон', hi: 'टेम्पलेट संपादित करें' },
  saveTemplate: { en: 'Save Template', ar: 'حفظ القالب', es: 'Guardar plantilla', fr: 'Enregistrer le modèle', de: 'Vorlage speichern', zh: '保存模板', ja: 'テンプレートを保存', pt: 'Salvar Modelo', ru: 'Сохранить шаблон', hi: 'टेम्पलेट سيهجين' },
  appearance: { en: 'Appearance', ar: 'المظهر', es: 'Apariencia', fr: 'Apparence', de: 'Aussehen', zh: '外观', ja: '外観', pt: 'Aparência', ru: 'Внешний вид', hi: 'ديكاوت' },
  color: { en: 'Color', ar: 'لون', es: 'Color', fr: 'Couleur', de: 'Farbe', zh: '颜色', ja: '色', pt: 'Cor', ru: 'Цвет', hi: 'رنگ' },
  gradient: { en: 'Gradient', ar: 'تدرج', es: 'Degradado', fr: 'Dégradé', de: 'Verlauf', zh: '渐变', ja: 'グラデーション', pt: 'Gradiente', ru: 'Гراضيانت', hi: 'تدرج' },
  image: { en: 'Image', ar: 'صورة', es: 'Imagen', fr: 'Image', de: 'Bild', zh: '图片', ja: '画像', pt: 'Imagem', ru: 'Изображение', hi: 'छви' },
  upload: { en: 'Upload', ar: 'رفع', es: 'Subir', fr: 'Télécharger', de: 'Hochladen', zh: '上传', ja: 'アップロード', pt: 'Carregar', ru: 'Загрузить', hi: 'التحميل' },
  header: { en: 'Header', ar: 'الترويسة', es: 'Encabezado', fr: 'En-tête', de: 'Header', zh: '页眉', ja: 'ヘッダー', pt: 'Cabeçalho', ru: 'Шапка', hi: 'हेڈر' },
  avatar: { en: 'Avatar', ar: 'الصورة الشخصية', es: 'Avatar', fr: 'Avatar', de: 'Avatar', zh: '头像', ja: 'アバター', pt: 'Avatar', ru: 'Аватар', hi: 'أوتار' },
  positioning: { en: 'Positioning', ar: 'التموضع', es: 'Posicionamiento', fr: 'Positionnement', de: 'Positionierung', zh: '定位', ja: '配置', pt: 'Posicionamento', ru: 'Позиционирование', hi: 'التموضع' },
  height: { en: 'Height', ar: 'الارتفاع', es: 'Altura', fr: 'Hauteur', de: 'Höhe', zh: '高度', ja: '高さ', pt: 'Altura', ru: 'Высота', hi: 'ऊंचाई' },
  size: { en: 'Size', ar: 'الحجم', es: 'Tamaño', fr: 'Taille', de: 'Größe', zh: '尺寸', ja: 'サイズ', pt: 'Tamanho', ru: 'Размер', hi: 'أكار' },
  yOffset: { en: 'Y Offset', ar: 'الإزاحة الرأسية', es: 'Desplazamiento Y', fr: 'Décalage Y', de: 'Y-Versatz', zh: 'Y偏移', ja: 'Yオフセット', pt: 'Deslocamento Y', ru: 'Смещение по Y', hi: 'Y آفسیٹ' },
  name: { en: 'Name', ar: 'الاسم', es: 'Nombre', fr: 'Nom', de: 'Name', zh: '名称', ja: '名前', pt: 'Nome', ru: 'Имя', hi: 'نام' },
  buttons: { en: 'Buttons', ar: 'الأزرار', es: 'Botones', fr: 'Boutons', de: 'Buttons', zh: '按钮', ja: 'ボタン', pt: 'Botões', ru: 'Кнопكي', hi: 'بتون' },
  socialLinks: { en: 'Socials', ar: 'التواصل', es: 'Social', fr: 'Social', de: 'Soziales', zh: '社交', ja: 'ソーシャル', pt: 'Social', ru: 'Соцсети', hi: 'सोशल' },
  classic: { en: 'Classic', ar: 'كلاسيك', es: 'Clásico', fr: 'Classique', de: 'Klassisch', zh: '经典', ja: 'クラシック', pt: 'Clássico', ru: 'Классика', hi: 'كلاسك' },
  split: { en: 'Split', ar: 'منقسم', es: 'Dividido', fr: 'Dividido', de: 'Geteilt', zh: '分屏', ja: 'スプリット', pt: 'Dividido', ru: 'Разделение', hi: 'विबाजित' },
  overlay: { en: 'Overlay', ar: 'متداخل', es: 'Superpuesto', fr: 'Superposé', de: 'Overlay', zh: '叠加', ja: 'أوفرلاي', pt: 'Sobreposto', ru: 'Наложение', hi: 'أوفرلاي' },
  minimal: { en: 'Minimal', ar: 'بسيط', es: 'Mínimo', fr: 'Minimal', de: 'Minimal', zh: '极简', ja: 'ミニمال', pt: 'Mínimo', ru: 'Минимализм', hi: 'نظام بسيط' },
  circle: { en: 'Circle', ar: 'دائري', es: 'Círculo', fr: 'Cercle', de: 'Kreis', zh: '圆形', ja: 'サークル', pt: 'Círculo', ru: 'Круг', hi: 'وريت' },
  squircle: { en: 'Squircle', ar: 'منحنٍ', es: 'Squircle', fr: 'Squircle', de: 'Squircle', zh: '圆角', ja: 'スクワークل', pt: 'Squircle', ru: 'سكويركل', hi: 'اسكويكل' },
  hidden: { en: 'Hidden', ar: 'إخفاء', es: 'Ocultو', fr: 'Caché', de: 'Verborgen', zh: '隐藏', ja: '非表示', pt: 'Oculto', ru: 'Скрыто', hi: 'تشبا هوا' },
  showQrCode: { en: 'Show QR Code', ar: 'إظهار رمز الـ QR', es: 'Mostrar código QR', fr: 'Afficher le code QR', de: 'QR-Code anzeigen' }
};

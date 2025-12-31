
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

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'NextID', ar: 'هويتي', es: 'NextID', fr: 'NextID', de: 'NextID', zh: 'NextID', ja: 'NextID', pt: 'NextID', ru: 'NextID', hi: 'NextID' },
  home: { en: 'Home', ar: 'الرئيسية', es: 'Inicio', fr: 'Accueil', de: 'Startseite', zh: '首页', ja: 'ホーム', pt: 'Início', ru: 'Главная', hi: 'होम' },
  templates: { en: 'Templates', ar: 'القوالب', es: 'Plantillas', fr: 'Modèles', de: 'Vorlagen', zh: '模板', ja: 'テンプレート', pt: 'Modelos', ru: 'Шаблоны', hi: 'टेम्पलेट्स' },
  myCards: { en: 'My Cards', ar: 'بطاقاتي', es: 'Mis Tarjetas', fr: 'Mes Cartes', de: 'Meine Karten', zh: '我的名片', ja: 'マイカード', pt: 'Meus Cartões', ru: 'Мои Карточки', hi: 'मेरे कार्ड' },
  admin: { en: 'Admin', ar: 'الإدارة', es: 'Admin', fr: 'Admin', de: 'Admin', zh: '管理', ja: '管理', pt: 'Admin', ru: 'Админ', hi: 'प्रशासन' },
  account: { en: 'Account', ar: 'الحساب', es: 'Cuenta', fr: 'Compte', de: 'Konto', zh: '账户', ja: 'アカウント', pt: 'Conta', ru: 'Аккаунт', hi: 'खाता' },
  login: { en: 'Login', ar: 'دخول', es: 'Iniciar sesión', fr: 'Connexion', de: 'Anmelden', zh: '登录', ja: 'ログイン', pt: 'Entrar', ru: 'Вход', hi: 'लॉगिन' },
  logout: { en: 'Logout', ar: 'خروج', es: 'Cerrar sesión', fr: 'Déconnexion', de: 'Abmelden', zh: '退出', ja: 'ログアウト', pt: 'Sair', ru: 'Выход', hi: 'लॉगआउट' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التعديلات', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', zh: '保存更改', ja: '変更を保存', pt: 'Salvar', ru: 'Сохранить', hi: 'परिवर्तन सहेजें' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل', es: 'Nombre completo', fr: 'Nom complet', de: 'Vollständiger Name', zh: '全名', ja: 'フルネーム', pt: 'Nome Completo', ru: 'Полное имя', hi: 'पूरा नाम' },
  placeholderName: { en: 'Enter your name', ar: 'أدخل اسمك الكامل', es: 'Ingresa tu nombre', fr: 'Entrez votre nom', de: 'Name eingeben', zh: '输入姓名', ja: '名前を入力', pt: 'Digite seu nome', ru: 'Введите имя', hi: 'अपना नाम दर्ज करें' },
  theme: { en: 'Theme', ar: 'السمة', es: 'Tema', fr: 'Thème', de: 'Thema', zh: '主题', ja: 'テーマ', pt: 'Tema', ru: 'Тема', hi: 'थीम' },
  saveContact: { en: 'Save Contact', ar: 'حفظ جهة الاتصال', es: 'Guardar contacto', fr: 'Enregistrer le contact', de: 'Kontakt speichern', zh: '保存联系人', ja: '連絡先を保存', pt: 'Salvar contato', ru: 'Сохранить контакт', hi: 'संपर्क सहेजें' },
  call: { en: 'Call', ar: 'اتصال', es: 'Llamar', fr: 'Appeler', de: 'Anrufen', zh: '呼叫', ja: '電話', pt: 'Ligar', ru: 'Позвонить', hi: 'कॉल करें' },
  whatsappBtn: { en: 'WhatsApp', ar: 'واتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'WhatsApp' },
  heroBadge: { en: 'Create your digital identity', ar: 'أنشئ هويتك الرقمية الآن', es: 'Crea tu identidad digital', fr: 'Créez votre identité numérique', de: 'Erstellen Sie Ihre digitale Identität', zh: '创建您的数字身份', ja: 'デジタルアイデンティティを作成', pt: 'Crie sua identidade digital', ru: 'Создайте цифровую личность', hi: 'अपनी डिजिटल पहचान बनाएं' },
  heroTitle: { en: 'Professional Digital Business Cards', ar: 'بطاقات أعمال رقمية احترافية', es: 'Tarjetas de visita digitales', fr: 'Cartes de visite numériques', de: 'Digitale Visitenkarten', zh: '专业数字名片', ja: 'プロフェッショナルな名片', pt: 'Cartões de Visita Digitais', ru: 'Цифровые визитки', hi: 'पेशेवर डिजिटल बिजनेस कार्ड' },
  heroDesc: { en: 'The easiest way to share your professional profile with the world.', ar: 'الطريقة الأسهل لمشاركة ملفك المهني مع العالم.', es: 'La forma más fácil de compartir tu perfil.', fr: 'Le moyen le plus simple de partager votre profil.', de: 'Der einfachste Weg, Ihr Profil zu teilen.', zh: '分享您的个人资料的最简单方法。', ja: 'プロフィールを共有する最も簡単な方法。', pt: 'A maneira mais fácil de compartilhar seu perfil.', ru: 'Самый простой способ поделиться своим профилем.', hi: 'अपनी प्रोफ़ाइल साझा करने का सबसे आसान तरीका।' },
  createBtn: { en: 'Create Now', ar: 'ابدأ الآن', es: 'Crear ahora', fr: 'Créer maintenant', de: 'Jetzt erstellen', zh: '立即创建', ja: '今すぐ作成', pt: 'Criar agora', ru: 'Создать сейчас', hi: 'अभी बनाएं' },
  template: { en: 'Layout Template', ar: 'قالب التوزيع', es: 'Plantilla', fr: 'Modèle', de: 'Layout', zh: '布局模板', ja: 'レイアウト', pt: 'Modelo de Layout', ru: 'Шаблон макета', hi: 'लेआउट टेम्पलेट' },
  selectTemplate: { en: 'Select Style', ar: 'اختر النمط الهيكلي', es: 'Seleccionar estilo', fr: 'Choisir le style', de: 'Stil wählen', zh: '选择样式', ja: 'スタイルを選択', pt: 'Selecionar Estilo', ru: 'Выбрать стиль', hi: 'शैली चुनें' },
  bio: { en: 'Professional Bio', ar: 'النبذة المهنية', es: 'Bio profesional', fr: 'Bio professionnelle', de: 'Professionelle Bio', zh: '职业简介', ja: 'プロフィールの概要', pt: 'Bio Profissional', ru: 'Биография', hi: 'पेशेवर जैव' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني', es: 'Correo electrónico', fr: 'Email', de: 'E-Mail', zh: '电子邮件', ja: 'メールアドレス', pt: 'E-mail', ru: 'Эл. почта', hi: 'ईमेल पता' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف', es: 'Teléfono', fr: 'Téléphone', de: 'Telefon', zh: '电话号码', ja: '電話番号', pt: 'Telefone', ru: 'Телефон', hi: 'फ़ोन नंबर' },
  whatsapp: { en: 'WhatsApp', ar: 'رقم الواتساب', es: 'WhatsApp', fr: 'WhatsApp', de: 'WhatsApp', zh: 'WhatsApp', ja: 'WhatsApp', pt: 'WhatsApp', ru: 'WhatsApp', hi: 'व्हाट्सएप' },
  website: { en: 'Website URL', ar: 'رابط الموقع', es: 'Sitio web', fr: 'Site web', de: 'Webseite', zh: '网址', ja: 'ウェブサイト', pt: 'Website', ru: 'Веб-сайт', hi: 'वेबसाइट' },
  socials: { en: 'Social Links', ar: 'روابط التواصل', es: 'Redes sociales', fr: 'Réseaux sociaux', de: 'Soziale Netzwerke', zh: '社交链接', ja: 'ソーシャルリンク', pt: 'Redes Sociais', ru: 'Соцсети', hi: 'सोशल लिंक' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي', es: 'Cargo', fr: 'Poste', de: 'Berufsbezeichnung', zh: '职位', ja: '役職', pt: 'Cargo', ru: 'Должность', hi: 'पद' },
  company: { en: 'Company', ar: 'الشركة', es: 'Empresa', fr: 'Entreprise', de: 'Firma', zh: '公司', ja: '会社', pt: 'Empresa', ru: 'Компания', hi: 'कंपनी' },
  templatesTitle: { en: 'Discover Our Templates', ar: 'اكتشف قوالبنا الاحترافية', es: 'Descubre plantillas', fr: 'Découvrez nos modèles', de: 'Vorlagen entdecken', zh: '发现我们的模板', ja: 'テンプレートを探す', pt: 'Descubra nossos modelos', ru: 'Наши шаблоны', hi: 'हमारे टेम्पलेट्स' },
  templatesDesc: { en: 'Choose the perfect design that reflects your professional identity.', ar: 'اختر التصميم المثالي الذي يعكس هويتك المهنية الراقية.', es: 'Elige el diseño perfecto.', fr: 'Choisissez le design parfait.', de: 'Wählen Sie das perfekte Design.', zh: '选择反映您身份的完美设计。', ja: 'あなたのアイデンティティを反映するデザインを選択してください。', pt: 'Escolha o design perfeito.', ru: 'Выберите идеальный дизайн.', hi: 'अपनी पहचान को दर्शाने वाला डिज़ाइन चुनें।' },
  useTemplate: { en: 'Use This Design', ar: 'استخدم هذا التصميم', es: 'Usar este diseño', fr: 'Utiliser ce design', de: 'Dieses Design nutzen', zh: '使用此设计', ja: 'このデザインを使用', pt: 'Usar este design', ru: 'Использовать этот дизайн', hi: 'इस डिज़ाइन का उपयोग करें' },
  noCardsYet: { en: 'No cards yet', ar: 'لا توجد بطاقات حتى الآن', es: 'Sin tarjetas aún', fr: 'Pas encore de cartes', de: 'Noch keine Karten', zh: '暂无名片', ja: 'まだカードはありません', pt: 'Nenhum cartão ainda', ru: 'Нет карточек', hi: 'अभी तक कोई कार्ड नहीं' },
  
  // Template Builder
  editTemplate: { en: 'Edit Template', ar: 'تعديل القالب', es: 'Editar plantilla', fr: 'Modifier le modèle', de: 'Vorlage bearbeiten', zh: '编辑模板', ja: 'テンプレートを編集', pt: 'Editar Modelo', ru: 'Изменить шаблон', hi: 'टेम्पलेट संपादित करें' },
  saveTemplate: { en: 'Save Template', ar: 'حفظ القالب', es: 'Guardar plantilla', fr: 'Enregistrer le modèle', de: 'Vorlage speichern', zh: '保存模板', ja: 'テンプレートを保存', pt: 'Salvar Modelo', ru: 'Сохранить шаблон', hi: 'टेम्पलेट सहेजें' },
  appearance: { en: 'Appearance', ar: 'المظهر', es: 'Apariencia', fr: 'Apparence', de: 'Aussehen', zh: '外观', ja: '外観', pt: 'Aparência', ru: 'Внешний вид', hi: 'दिखावट' },
  color: { en: 'Color', ar: 'لون', es: 'Color', fr: 'Couleur', de: 'Farbe', zh: '颜色', ja: '色', pt: 'Cor', ru: 'Цвет', hi: 'रंग' },
  gradient: { en: 'Gradient', ar: 'تدرج', es: 'Degradado', fr: 'Dégradé', de: 'Verlauf', zh: '渐变', ja: 'グラデーション', pt: 'Gradiente', ru: 'Градиент', hi: 'ढाल' },
  image: { en: 'Image', ar: 'صورة', es: 'Imagen', fr: 'Image', de: 'Bild', zh: '图片', ja: '画像', pt: 'Imagem', ru: 'Изображение', hi: 'छवि' },
  upload: { en: 'Upload', ar: 'رفع', es: 'Subir', fr: 'Télécharger', de: 'Hochladen', zh: '上传', ja: 'アップロード', pt: 'Carregar', ru: 'Загрузить', hi: 'अपलोड' },
  header: { en: 'Header', ar: 'الترويسة', es: 'Encabezado', fr: 'En-tête', de: 'Header', zh: '页眉', ja: 'ヘッダー', pt: 'Cabeçalho', ru: 'Шапка', hi: 'हेडर' },
  avatar: { en: 'Avatar', ar: 'الصورة الشخصية', es: 'Avatar', fr: 'Avatar', de: 'Avatar', zh: '头像', ja: 'アバター', pt: 'Avatar', ru: 'Аватар', hi: 'अवतार' },
  positioning: { en: 'Positioning', ar: 'التموضع', es: 'Posicionamiento', fr: 'Positionnement', de: 'Positionierung', zh: '定位', ja: '配置', pt: 'Posicionamento', ru: 'Позиционирование', hi: 'पोजीशनिंग' },
  height: { en: 'Height', ar: 'الارتفاع', es: 'Altura', fr: 'Hauteur', de: 'Höhe', zh: '高度', ja: '高さ', pt: 'Altura', ru: 'Высота', hi: 'ऊंचाई' },
  size: { en: 'Size', ar: 'الحجم', es: 'Tamaño', fr: 'Taille', de: 'Größe', zh: '尺寸', ja: 'サイズ', pt: 'Tamanho', ru: 'Размер', hi: 'आकार' },
  yOffset: { en: 'Y Offset', ar: 'الإزاحة الرأسية', es: 'Desplazamiento Y', fr: 'Décalage Y', de: 'Y-Versatz', zh: 'Y偏移', ja: 'Yオフセット', pt: 'Deslocamento Y', ru: 'Смещение по Y', hi: 'Y ऑफ़सेट' },
  name: { en: 'Name', ar: 'الاسم', es: 'Nombre', fr: 'Nom', de: 'Name', zh: '名称', ja: '名前', pt: 'Nome', ru: 'Имя', hi: 'नाम' },
  buttons: { en: 'Buttons', ar: 'الأزرار', es: 'Botones', fr: 'Boutons', de: 'Buttons', zh: '按钮', ja: 'ボタン', pt: 'Botões', ru: 'Кнопки', hi: 'बटन' },
  socialLinks: { en: 'Socials', ar: 'التواصل', es: 'Social', fr: 'Social', de: 'Soziales', zh: '社交', ja: 'ソーシャル', pt: 'Social', ru: 'Соцсети', hi: 'सोशल' },
  classic: { en: 'Classic', ar: 'كلاسيك', es: 'Clásico', fr: 'Classique', de: 'Klassisch', zh: '经典', ja: 'クラシック', pt: 'Clássico', ru: 'Классика', hi: 'क्लासिक' },
  split: { en: 'Split', ar: 'منقسم', es: 'Dividido', fr: 'Divisé', de: 'Geteilt', zh: '分屏', ja: 'スプリット', pt: 'Dividido', ru: 'Разделение', hi: 'विभाजित' },
  overlay: { en: 'Overlay', ar: 'متداخل', es: 'Superpuesto', fr: 'Superposé', de: 'Overlay', zh: '叠加', ja: 'オーバーレイ', pt: 'Sobreposto', ru: 'Наложение', hi: 'ओवरले' },
  minimal: { en: 'Minimal', ar: 'بسيط', es: 'Mínimo', fr: 'Minimal', de: 'Minimal', zh: '极简', ja: 'ミニマル', pt: 'Mínimo', ru: 'Минимализм', hi: 'न्यूनतम' },
  circle: { en: 'Circle', ar: 'دائري', es: 'Círculo', fr: 'Cercle', de: 'Kreis', zh: '圆形', ja: 'サークル', pt: 'Círculo', ru: 'Круг', hi: 'वृत्त' },
  squircle: { en: 'Squircle', ar: 'منحنٍ', es: 'Squircle', fr: 'Squircle', de: 'Squircle', zh: '圆角', ja: 'スクワークル', pt: 'Squircle', ru: 'Сквиркл', hi: 'स्क्विर्कल' },
  hidden: { en: 'Hidden', ar: 'إخفاء', es: 'Oculto', fr: 'Caché', de: 'Verborgen', zh: '隐藏', ja: '非表示', pt: 'Oculto', ru: 'Скрыто', hi: 'छिपा हुआ' }
};

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

export const SAMPLE_DATA: Record<string, Partial<CardData>> = {
  ar: { 
    name: 'عبدالله محمد', 
    title: 'مستشار تطوير أعمال', 
    company: 'هويتي التقنية', 
    bio: 'خبير في استراتيجيات التحول الرقمي مع خبرة تزيد عن 10 سنوات في بناء الهوية الرقمية للشركات والأفراد.', 
    email: 'abdullah@example.com',
    phone: '+966500000000',
    whatsapp: '966500000000',
    website: 'www.myidentity.sa',
    templateId: 'classic', 
    themeType: 'gradient', 
    themeGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    profileImage: '',
    isDark: false, 
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platformId: 'x', platform: 'X', url: 'https://x.com' },
      { platformId: 'instagram', platform: 'Instagram', url: 'https://instagram.com' }
    ] 
  },
  en: { 
    name: 'Alexander Smith', 
    title: 'Senior Solutions Architect', 
    company: 'NextID Global', 
    bio: 'Passionate about crafting seamless digital experiences and architectural solutions for modern businesses.', 
    email: 'alex@example.com',
    phone: '+1 555 123 4567',
    whatsapp: '15551234567',
    website: 'www.nextid.com',
    templateId: 'classic', 
    themeType: 'gradient', 
    themeGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    profileImage: '',
    isDark: false, 
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platformId: 'x', platform: 'X', url: 'https://x.com' },
      { platformId: 'github', platform: 'GitHub', url: 'https://github.com' }
    ] 
  }
};

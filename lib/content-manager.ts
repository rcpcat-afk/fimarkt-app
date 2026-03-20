// ─── Fimarkt İçerik Yöneticisi (App) ─────────────────────────────────────────
// Web (fimarkt-web/lib/content-manager.ts) ile senkron tutulmalıdır.
// Bölüm 8 Admin Overhaul'unda CMS/API'ye bağlanacak.

export interface Stat        { value: number; suffix: string; label: string }
export interface Value       { icon: string; title: string; desc: string }
export interface FaqItem     { q: string; a: string }
export interface FaqCategory { id: string; icon: string; label: string; items: FaqItem[] }
export interface LegalSection { id: string; heading: string; content: string }
export interface LegalDoc    { title: string; lastUpdated: string; sections: LegalSection[] }

// ── Hakkımızda ───────────────────────────────────────────────────────────────

export const ABOUT = {
  hero: {
    badge:    "🏭 Türkiye'nin 3D Ekosistemi",
    title:    "Fimarkt Hikayesi",
    subtitle: "Kayseri'den dünyaya: 3D baskıyı herkes için erişilebilir kılmak amacıyla yola çıktık.",
  },
  stats: [
    { value: 500,  suffix: "+",  label: "Tamamlanan Baskı" },
    { value: 200,  suffix: "+",  label: "Sanat Eseri"      },
    { value: 50,   suffix: "+",  label: "Mühendis"         },
    { value: 4,    suffix: ".8★", label: "Müşteri Puanı"   },
  ] satisfies Stat[],
  story: `Fimarkt, 2023 yılında Kayseri'de küçük bir garaj atölyesinde doğdu. Kurucularımız, 3D baskı teknolojisinin hem bireyler hem de işletmeler için ne kadar dönüştürücü olabileceğini gördüklerinde, bu teknolojiyi herkes için erişilebilir kılmak üzere harekete geçtiler.\n\nBugün Fimarkt; Fidrop (anlık fiyatlandırmalı 3D üretim hizmeti), Sanatkat (özgün 3D sanat eserleri pazaryeri) ve Mağaza olmak üzere üç ana sütun üzerine inşa edilmiş Türkiye'nin ilk tam entegre 3D ekosistemidir.`,
  vision:  "Türkiye'yi 3D üretim teknolojisinde küresel bir merkez haline getirmek; her bireyin ve her işletmenin dijital tasarımını fiziksel ürüne dönüştürebileceği bir dünya kurmak.",
  mission: "3D baskı ekosisteminin her halkasını — üretim, sanat ve mühendislik — tek bir güvenilir platformda buluşturarak kullanıcılara zaman, maliyet ve erişim avantajı sağlamak.",
  values: [
    { icon: "⚡", title: "Hız",               desc: "Fidrop teknolojisiyle saniyeler içinde fiyat, günler içinde ürün." },
    { icon: "🔒", title: "Güven",             desc: "Escrow ödeme sistemi — para, teslimata kadar güvende."           },
    { icon: "🎨", title: "Yaratıcılık",       desc: "Tasarımdan ürüne geçişte sınır yok. Hayal et, üretelim."        },
    { icon: "🌱", title: "Sürdürülebilirlik", desc: "Dijital üretimle israfı minimuma indiriyoruz."                   },
  ] satisfies Value[],
  location: "Mimarsinan OSB Mah. Teknoloji Cad. No:5, Melikgazi / Kayseri",
  founded:  "2023",
} as const;

// ── SSS ──────────────────────────────────────────────────────────────────────

export const FAQ: { categories: FaqCategory[] } = {
  categories: [
    {
      id: "siparis", icon: "📦", label: "Sipariş & Teslimat",
      items: [
        { q: "Siparişimi nasıl takip edebilirim?",    a: "Hesabım → Siparişlerim bölümünden anlık kargo takibini yapabilirsiniz. Ayrıca sipariş durumu değişikliklerinde bildirim alırsınız." },
        { q: "Teslimat süresi ne kadar?",              a: "Standart ürünler 2–5 iş günü, Fidrop özel üretimler 3–7 iş günüdür. Sanatkat eserleri satıcıya göre değişebilir." },
        { q: "Uluslararası kargo yapıyor musunuz?",    a: "Şu an yalnızca Türkiye içi teslimat yapılmaktadır. Yurt dışı kargo yakında hizmete girecektir." },
        { q: "Siparişimi iptal edebilir miyim?",      a: "Üretim başlamadan önce siparişinizi iptal edebilirsiniz. Üretim aşamasındaki siparişler için müşteri hizmetleriyle iletişime geçin." },
        { q: "Kargo ücreti ne kadar?",                a: "500₺ ve üzeri siparişlerde kargo ücretsizdir. Altında kalan siparişlerde sabit 29₺ uygulanır." },
      ],
    },
    {
      id: "odeme", icon: "💳", label: "Ödeme & Güvenlik",
      items: [
        { q: "Hangi ödeme yöntemleri var?",           a: "Kredi/banka kartı, havale/EFT ve kapıda ödeme mevcuttur. Ödeme altyapımız İyzico Escrow ile güvence altındadır." },
        { q: "Escrow sistemi nasıl çalışır?",          a: "Ödemeniz, siparişiniz teslim edilene kadar Escrow hesabında tutulur. Teslimden sonra ödeme satıcıya aktarılır." },
        { q: "Kart bilgilerim güvende mi?",            a: "Evet. Kart bilgileriniz sistemimizde saklanmaz. Tüm ödemeler PCI-DSS sertifikalı İyzico üzerinden işlenir." },
        { q: "İade koşulları nelerdir?",               a: "Hasarlı veya hatalı ürünlerde 14 gün içinde iade yapılabilir. Dijital dosya satışlarında iade geçerli değildir." },
      ],
    },
    {
      id: "fidrop", icon: "🚀", label: "Fidrop (3D Üretim)",
      items: [
        { q: "Hangi dosya formatları destekleniyor?",  a: "STL, OBJ ve 3MF formatları desteklenmektedir. Maksimum dosya boyutu 100MB'dır." },
        { q: "Fiyat hesaplama nasıl çalışır?",         a: "Dosyanızı yüklerken Fimarkt Python motoru hacim ve malzemeyi analiz ederek saniyeler içinde fiyat sunar." },
        { q: "Hangi 3D baskı teknolojileri var?",      a: "FDM (PLA, PETG, ABS), SLA (Resin) ve SLS (Nylon) teknolojileri mevcuttur." },
        { q: "Minimum sipariş miktarı var mı?",        a: "Hayır, tek parça siparişe kadar üretim yapıyoruz." },
        { q: "Tasarımım gizli tutulacak mı?",          a: "Evet. STL/OBJ dosyaları şifreli olarak saklanır ve sadece üretim ekibimiz erişebilir." },
      ],
    },
  ],
};

// ── İletişim ─────────────────────────────────────────────────────────────────

export const CONTACT = {
  email:        "destek@fimarkt.com.tr",
  phone:        "+90 (352) 000 00 00",
  whatsapp:     "+90 532 000 00 00",
  whatsappLink: "https://wa.me/905320000000",
  address:      "Mimarsinan OSB Mah. Teknoloji Cad. No:5",
  city:         "Melikgazi / Kayseri, Türkiye",
  workingHours: "Pazartesi – Cuma: 09:00 – 18:00",
  mapsDeepLink: "https://maps.google.com/?q=Melikgazi+Kayseri",
} as const;

// ── Hukuki Belgeler ───────────────────────────────────────────────────────────

export const LEGAL: Record<"gizlilik" | "kullanim" | "kvkk", LegalDoc> = {
  gizlilik: {
    title: "Gizlilik Politikası", lastUpdated: "21 Mart 2026",
    sections: [
      { id: "toplanan-bilgiler",    heading: "1. Toplanan Bilgiler",           content: "Fimarkt olarak hizmetlerimizi kullanmanız sırasında ad, soyad, e-posta, telefon, teslimat adresi ve ödeme bilgileri toplanmaktadır. Teknik veriler (IP adresi, tarayıcı bilgisi) de otomatik kaydedilir." },
      { id: "bilgilerin-kullanimi", heading: "2. Bilgilerin Kullanımı",        content: "Sipariş işleme, teslimat yönetimi, müşteri desteği ve kampanya bildirimleri (onayınız dahilinde) için kullanılmaktadır." },
      { id: "veri-guvenligi",       heading: "3. Veri Güvenliği",              content: "Verileriniz SSL/TLS şifreleme ile korunmaktadır. Ödeme bilgileriniz sistemimizde saklanmaz; İyzico üzerinden işlenir." },
      { id: "cerezler",             heading: "4. Çerezler",                    content: "Temel işlevler için zorunlu çerezler kullanılmaktadır. Analitik çerezler için tercihlerinizi yönetebilirsiniz." },
      { id: "haklariniz",           heading: "5. Haklarınız",                  content: "KVKK kapsamında verilerinize erişim, düzeltme, silme ve veri taşınabilirliği haklarınız mevcuttur. destek@fimarkt.com.tr üzerinden başvurabilirsiniz." },
    ],
  },
  kullanim: {
    title: "Kullanım Koşulları", lastUpdated: "21 Mart 2026",
    sections: [
      { id: "kabul",              heading: "1. Koşulların Kabulü",           content: "Fimarkt platformunu kullanarak bu Kullanım Koşulları'nı kabul etmiş sayılırsınız." },
      { id: "hesap",             heading: "2. Hesap Yükümlülükleri",         content: "Hesap güvenliğinden siz sorumlusunuz. Sahte bilgi ile hesap oluşturmak yasaktır." },
      { id: "fidrop-sartlari",   heading: "3. Fidrop Üretim Koşulları",      content: "Yüklenen tasarımların telif haklarına sahip olduğunuzu beyan edersiniz. Ticari marka ihlali içeren tasarımlar kabul edilmez." },
      { id: "sorumluluk-siniri", heading: "4. Sorumluluk Sınırı",            content: "Fimarkt üçüncü taraf satışlarda aracı sıfatıyla hareket eder. Escrow sistemiyle alıcı ve satıcı hakları korunur." },
      { id: "degisiklikler",     heading: "5. Koşulların Değiştirilmesi",    content: "Fimarkt bu koşulları önceden bildirimde bulunarak değiştirme hakkını saklı tutar." },
    ],
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni", lastUpdated: "21 Mart 2026",
    sections: [
      { id: "veri-sorumlusu",   heading: "1. Veri Sorumlusu",               content: "6698 sayılı KVKK uyarınca veri sorumlusu Fimarkt Teknoloji A.Ş.'dir. Adres: Mimarsinan OSB Mah. No:5, Melikgazi / Kayseri." },
      { id: "islenen-veriler",  heading: "2. İşlenen Kişisel Veriler",      content: "Kimlik bilgileri, iletişim bilgileri, finansal kayıtlar ve teknik veriler işlenmektedir." },
      { id: "isleme-amaci",     heading: "3. İşleme Amaçları",              content: "Sözleşme ifası, müşteri hizmetleri, yasal yükümlülükler ve hizmet kalitesinin iyileştirilmesi amaçlarıyla işlenmektedir." },
      { id: "aktarim",          heading: "4. Veri Aktarımı",                content: "Kargo şirketleri, İyzico ödeme altyapısı ve yasal zorunluluklar kapsamında kamu kurumlarıyla paylaşılabilir." },
      { id: "haklariniz",       heading: "5. Haklarınız",                   content: "KVKK'nın 11. maddesi uyarınca; erişim, düzeltme, silme, kısıtlama ve itiraz haklarınız mevcuttur. destek@fimarkt.com.tr üzerinden 30 gün içinde yanıt alırsınız." },
    ],
  },
};

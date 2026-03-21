// ─── Fimarkt Sanatçı Mock Data ────────────────────────────────────────────────

export interface Artist {
  id:             string;
  name:           string;
  slug:           string;
  avatarSeed:     string;
  coverSeed:      string;
  verified:       boolean;
  bio:            string;
  location:       string;
  since:          string;
  followersCount: number;
  likesTotal:     number;
  worksCount:     number;
  badges:         string[];
  specialties:    string[];
  socialLinks:    { instagram?: string; artstation?: string; twitter?: string };
}

const ARTISTS: Artist[] = [
  {
    id: "a-001",
    name: "Mert Karakoç",
    slug: "mert-karakoc",
    avatarSeed: "mert_avatar",
    coverSeed: "mert_cover",
    verified: true,
    bio: "Türkiye'nin öncü dijital heykel sanatçılarından biriyim. ZBrush ve Blender ile anatomik figürler ve Anadolu mitolojisinden ilham alan çalışmalar üretiyorum. Eserlerimin %80'i dünya çapında sanatçılar tarafından basılmış ve sahnelenmiştir.",
    location: "İstanbul, Türkiye",
    since: "2019",
    followersCount: 4820,
    likesTotal: 31400,
    worksCount: 38,
    badges: ["Doğrulanmış Sanatçı", "Çok İndirilen", "Yılın Sanatçısı"],
    specialties: ["Anatomik Heykel", "Büst", "Mitolojik Figürler"],
    socialLinks: { instagram: "@mertkarakoc3d", artstation: "mertkarakoc" },
  },
  {
    id: "a-002",
    name: "Zeynep Aydın",
    slug: "zeynep-aydin",
    avatarSeed: "zeynep_avatar",
    coverSeed: "zeynep_cover",
    verified: true,
    bio: "Mimari tasarım ve parametrik form konusunda uzmanlaşmış dijital tasarımcıyım. Osmanlı ve Selçuklu mimarisinden ilham alarak modern geometrik yapılar oluşturuyorum. Baskıya hazır, hata-toleranslı dosyalar sunmak önceliğimdir.",
    location: "Ankara, Türkiye",
    since: "2020",
    followersCount: 2940,
    likesTotal: 18700,
    worksCount: 24,
    badges: ["Doğrulanmış Sanatçı", "Baskıya Hazır"],
    specialties: ["Mimari Modeller", "Parametrik Tasarım", "Dekoratif Objeler"],
    socialLinks: { instagram: "@zeynepaydin_3d", artstation: "zeynepaydin" },
  },
  {
    id: "a-003",
    name: "Kerem Yılmaz",
    slug: "kerem-yilmaz",
    avatarSeed: "kerem_avatar",
    coverSeed: "kerem_cover",
    verified: false,
    bio: "Fantezi ve bilim-kurgu evrenlerinden ilham alan karakter ve yaratık tasarımları yapıyorum. Her dosya tam baskı desteğiyle gelir, ayrıca support-free versiyonlar da sunuyorum.",
    location: "İzmir, Türkiye",
    since: "2021",
    followersCount: 1650,
    likesTotal: 9200,
    worksCount: 19,
    badges: ["Hızlı Yanıt"],
    specialties: ["Karakter Tasarımı", "Yaratık", "Fantezi"],
    socialLinks: { instagram: "@keremyilmaz_sculpt", artstation: "keremyilmaz" },
  },
  {
    id: "a-004",
    name: "Aslı Demir",
    slug: "asli-demir",
    avatarSeed: "asli_avatar",
    coverSeed: "asli_cover",
    verified: true,
    bio: "Doğadan ilham alan organik formlar ve biyomimetik tasarımlar üretiyorum. Vazo, kase ve dekoratif objelerim her evde baskıya hazırdır. Açık kaynak felsefesini benimseyerek birçok dosyamı ücretsiz sunuyorum.",
    location: "Bursa, Türkiye",
    since: "2020",
    followersCount: 3310,
    likesTotal: 22800,
    worksCount: 31,
    badges: ["Doğrulanmış Sanatçı", "Topluluk Favorisi"],
    specialties: ["Organik Tasarım", "Ev Dekorasyonu", "Biyomimikri"],
    socialLinks: { instagram: "@asli_creates", twitter: "@asli3d" },
  },
];

export function getArtist(slug: string): Artist | null {
  return ARTISTS.find((a) => a.slug === slug) ?? null;
}

export function getAllArtists(): Artist[] {
  return ARTISTS;
}

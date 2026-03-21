// ─── Fimarkt Satıcı Mock Data ─────────────────────────────────────────────────
// Gerçek API entegrasyonuna kadar bu data kullanılır.
// Seller slug'ları products.ts içindeki seller.slug değerleriyle eşleşmeli.

export interface Seller {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  followerCount: number;
  orderCount: number;
  since: string;
  responseRate: number;
  badges: string[];
  bio: string;
  location: string;
  categories: string[];
}

const SELLERS: Seller[] = [
  {
    id: "s-001",
    name: "FiTeknik Mağazası",
    slug: "fiteknik",
    coverImage: "https://picsum.photos/seed/fiteknik_cover/1200/300",
    verified: true,
    rating: 4.8,
    reviewCount: 1240,
    followerCount: 3820,
    orderCount: 9450,
    since: "2021",
    responseRate: 97,
    badges: ["Güvenilir Satıcı", "Hızlı Teslimat", "Gold Partner"],
    bio: "Türkiye'nin önde gelen 3D baskı ekipmanları satıcısıyız. Bambu Lab, Prusa ve Creality markalarının yetkili distribütörüyüz. 2021'den bu yana 9.000+ siparişi zamanında ve sorunsuz teslim ettik. Profesyonel kullanıcılardan hobi meraklılarına kadar herkese hizmet veriyoruz.",
    location: "İstanbul, Türkiye",
    categories: ["FDM Yazıcılar", "Reçine Yazıcılar", "Yedek Parça"],
  },
  {
    id: "s-002",
    name: "3D Dünya",
    slug: "3d-dunya",
    coverImage: "https://picsum.photos/seed/3ddunya_cover/1200/300",
    verified: true,
    rating: 4.9,
    reviewCount: 870,
    followerCount: 2100,
    orderCount: 5230,
    since: "2020",
    responseRate: 99,
    badges: ["Güvenilir Satıcı", "Premium Satıcı"],
    bio: "Prusa ve yüksek hassasiyetli FDM yazıcılar konusunda uzmanız. Mühendislik ve prototipleme projelerine özel danışmanlık hizmeti de sunuyoruz.",
    location: "Ankara, Türkiye",
    categories: ["FDM Yazıcılar", "Teknik Filamentler"],
  },
  {
    id: "s-003",
    name: "CrealityTR",
    slug: "creality-tr",
    coverImage: "https://picsum.photos/seed/creality_cover/1200/300",
    verified: true,
    rating: 4.6,
    reviewCount: 2340,
    followerCount: 5600,
    orderCount: 18700,
    since: "2019",
    responseRate: 94,
    badges: ["Güvenilir Satıcı", "Çok Satan"],
    bio: "Creality markasının Türkiye yetkili servisi ve distribütörüyüz. Tüm Creality ürünleri için garanti ve teknik destek sağlıyoruz.",
    location: "İzmir, Türkiye",
    categories: ["FDM Yazıcılar", "Yedek Parça", "Sarf Malzeme"],
  },
  {
    id: "s-004",
    name: "AnyCubeShop",
    slug: "anycubeshop",
    coverImage: "https://picsum.photos/seed/anycube_cover/1200/300",
    verified: false,
    rating: 4.5,
    reviewCount: 560,
    followerCount: 980,
    orderCount: 3100,
    since: "2022",
    responseRate: 91,
    badges: ["Hızlı Teslimat"],
    bio: "Anycubic ürünleri ve reçine baskı ekipmanları konusunda uzmanlaşmış mağazamız. Başlangıç seviyesinden profesyonele tüm modeller stokta.",
    location: "Bursa, Türkiye",
    categories: ["FDM Yazıcılar", "Reçine Yazıcılar"],
  },
  {
    id: "s-005",
    name: "Filament Dükkânı",
    slug: "filament-dukkani",
    coverImage: "https://picsum.photos/seed/filament_cover/1200/300",
    verified: true,
    rating: 4.7,
    reviewCount: 3100,
    followerCount: 7200,
    orderCount: 22000,
    since: "2018",
    responseRate: 96,
    badges: ["Güvenilir Satıcı", "Hızlı Teslimat", "En Çok Satılan"],
    bio: "Türkiye'nin en geniş filament koleksiyonuna sahibiz. eSUN, Polymaker, Prusament ve daha fazlası. 100+ renk ve 20+ farklı malzeme seçeneğiyle yanınızdayız.",
    location: "İstanbul, Türkiye",
    categories: ["Standart Filamentler", "Teknik Filamentler"],
  },
  {
    id: "s-006",
    name: "ZaxeShop",
    slug: "zaxeshop",
    coverImage: "https://picsum.photos/seed/zaxe_cover/1200/300",
    verified: false,
    rating: 4.6,
    reviewCount: 420,
    followerCount: 750,
    orderCount: 1800,
    since: "2023",
    responseRate: 88,
    badges: ["Yerli Üretim"],
    bio: "Yerli 3D baskı teknolojisi Zaxe'nin resmi mağazası. Zaxe Z1, Z3 ve X3 modelleri ile filamentleri için doğru adres.",
    location: "İstanbul, Türkiye",
    categories: ["FDM Yazıcılar", "Standart Filamentler"],
  },
];

export function getSeller(slug: string): Seller | null {
  return SELLERS.find((s) => s.slug === slug) ?? null;
}

export function getAllSellers(): Seller[] {
  return SELLERS;
}

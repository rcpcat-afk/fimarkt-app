import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";

const SECTIONS = [
  {
    id: "banner",
    title: "🖼️ Ana Sayfa Banner",
    desc: "Banner başlığı ve alt yazısını düzenle",
    fields: [
      {
        key: "banner_title",
        label: "Banner Başlığı",
        placeholder: "Fimarkt'a Hoş Geldiniz",
      },
      {
        key: "banner_subtitle",
        label: "Banner Alt Yazı",
        placeholder: "Türkiye'nin 3D baskı marketi",
      },
      {
        key: "banner_cta",
        label: "Buton Yazısı",
        placeholder: "Alışverişe Başla",
      },
    ],
  },
  {
    id: "featured",
    title: "⭐ Öne Çıkan",
    desc: "Öne çıkan ürün ID'lerini virgülle gir",
    fields: [
      {
        key: "featured_ids",
        label: "Ürün ID'leri",
        placeholder: "123, 456, 789",
      },
    ],
  },
  {
    id: "campaign",
    title: "🎯 Kampanya",
    desc: "Aktif kampanya bilgisi",
    fields: [
      {
        key: "campaign_title",
        label: "Kampanya Başlığı",
        placeholder: "Yaz İndirimi",
      },
      {
        key: "campaign_desc",
        label: "Kampanya Açıklaması",
        placeholder: "%20 indirim fırsatı",
      },
      { key: "campaign_code", label: "İndirim Kodu", placeholder: "YAZ20" },
    ],
  },
  {
    id: "contact",
    title: "📞 İletişim Bilgileri",
    desc: "Destek hattı ve WhatsApp numarası",
    fields: [
      { key: "whatsapp", label: "WhatsApp", placeholder: "+905001234567" },
      {
        key: "support_email",
        label: "Destek E-posta",
        placeholder: "destek@fimarkt.com.tr",
      },
      {
        key: "support_phone",
        label: "Destek Telefon",
        placeholder: "+905001234567",
      },
    ],
  },
];

type Material = {
  id: string;
  name: string;
  colors: { name: string; active: boolean }[];
  gramPrice: number;
  hourlyRate: number;
  fixedCost: number;
  profitMargin: number;
  density?: number;
  active: boolean;
};

type Technology = {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  materials: Material[];
};

const DEFAULT_TECHNOLOGIES: Technology[] = [
  {
    id: "fdm-standart",
    name: "FDM Standart",
    icon: "🏭",
    color: "#ff6b2b",
    active: true,
    materials: [
      {
        id: "pla",
        name: "PLA",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: true },
          { name: "Kırmızı", active: true },
          { name: "Mavi", active: true },
          { name: "Sarı", active: true },
          { name: "Yeşil", active: true },
          { name: "Turuncu", active: true },
          { name: "Mor", active: true },
          { name: "Pembe", active: true },
          { name: "Şeffaf", active: true },
          { name: "Altın", active: true },
          { name: "Gümüş", active: true },
          { name: "Parlak Kırmızı", active: false },
          { name: "Parlak Mavi", active: false },
          { name: "Açık Mavi", active: false },
          { name: "Lacivert", active: false },
          { name: "Koyu Yeşil", active: false },
          { name: "Açık Yeşil", active: false },
          { name: "Kahverengi", active: false },
          { name: "Bej", active: false },
          { name: "Krem", active: false },
          { name: "Silk Altın", active: false },
          { name: "Silk Gümüş", active: false },
          { name: "Silk Bakır", active: false },
          { name: "Silk Bronz", active: false },
          { name: "Mat Siyah", active: false },
          { name: "Mat Beyaz", active: false },
          { name: "Mat Gri", active: false },
          { name: "Floresan Sarı", active: false },
          { name: "Floresan Turuncu", active: false },
          { name: "Karbon Görünüm", active: false },
          { name: "Ahşap Görünüm", active: false },
          { name: "Mermer Görünüm", active: false },
          { name: "Karanlıkta Parlayan", active: false },
          { name: "Gökkuşağı", active: false },
        ],
        gramPrice: 0.35,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.24,
        active: true,
      },
      {
        id: "pla-plus",
        name: "PLA+",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: true },
          { name: "Kırmızı", active: true },
          { name: "Mavi", active: true },
          { name: "Sarı", active: true },
          { name: "Yeşil", active: true },
          { name: "Turuncu", active: true },
          { name: "Mor", active: true },
          { name: "Pembe", active: true },
          { name: "Şeffaf", active: false },
          { name: "Altın", active: false },
          { name: "Gümüş", active: false },
          { name: "Açık Mavi", active: false },
          { name: "Lacivert", active: false },
          { name: "Kahverengi", active: false },
          { name: "Bej", active: false },
        ],
        gramPrice: 0.4,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.24,
        active: true,
      },
      {
        id: "abs",
        name: "ABS",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: true },
          { name: "Kırmızı", active: true },
          { name: "Mavi", active: true },
          { name: "Sarı", active: true },
          { name: "Yeşil", active: true },
          { name: "Turuncu", active: true },
          { name: "Mor", active: false },
          { name: "Pembe", active: false },
          { name: "Şeffaf", active: false },
          { name: "Altın", active: false },
          { name: "Gümüş", active: false },
        ],
        gramPrice: 0.32,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.04,
        active: true,
      },
      {
        id: "petg",
        name: "PETG",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: true },
          { name: "Şeffaf", active: true },
          { name: "Mavi", active: true },
          { name: "Kırmızı", active: true },
          { name: "Yeşil", active: true },
          { name: "Turuncu", active: false },
          { name: "Mor", active: false },
          { name: "Sarı", active: false },
          { name: "Açık Mavi", active: false },
          { name: "Lacivert", active: false },
        ],
        gramPrice: 0.4,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.27,
        active: true,
      },
      {
        id: "tpu",
        name: "TPU",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Şeffaf", active: true },
          { name: "Kırmızı", active: true },
          { name: "Mavi", active: true },
          { name: "Sarı", active: false },
          { name: "Yeşil", active: false },
          { name: "Turuncu", active: false },
          { name: "Mor", active: false },
          { name: "Pembe", active: false },
          { name: "Gri", active: false },
        ],
        gramPrice: 0.55,
        hourlyRate: 45,
        fixedCost: 25,
        profitMargin: 30,
        density: 1.21,
        active: true,
      },
      {
        id: "asa",
        name: "ASA",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: true },
          { name: "Kırmızı", active: false },
          { name: "Mavi", active: false },
          { name: "Sarı", active: false },
          { name: "Yeşil", active: false },
          { name: "Turuncu", active: false },
          { name: "Mor", active: false },
        ],
        gramPrice: 0.45,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.07,
        active: true,
      },
      {
        id: "hips",
        name: "HIPS",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Siyah", active: true },
          { name: "Gri", active: false },
          { name: "Kırmızı", active: false },
          { name: "Mavi", active: false },
          { name: "Sarı", active: false },
        ],
        gramPrice: 0.35,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.07,
        active: true,
      },
      {
        id: "pva",
        name: "PVA",
        colors: [{ name: "Doğal", active: true }],
        gramPrice: 0.8,
        hourlyRate: 40,
        fixedCost: 20,
        profitMargin: 30,
        density: 1.19,
        active: true,
      },
    ],
  },
  {
    id: "fdm-endustriyel",
    name: "FDM Endüstriyel",
    icon: "⚙️",
    color: "#f97316",
    active: true,
    materials: [
      {
        id: "nylon-pa6",
        name: "Nylon PA6",
        colors: [
          { name: "Siyah", active: true },
          { name: "Doğal", active: true },
        ],
        gramPrice: 0.7,
        hourlyRate: 55,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.13,
        active: true,
      },
      {
        id: "nylon-pa12",
        name: "Nylon PA12",
        colors: [
          { name: "Siyah", active: true },
          { name: "Doğal", active: true },
        ],
        gramPrice: 0.75,
        hourlyRate: 55,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.01,
        active: true,
      },
      {
        id: "pc",
        name: "PC (Polikarbonat)",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
          { name: "Beyaz", active: true },
        ],
        gramPrice: 0.65,
        hourlyRate: 55,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.2,
        active: true,
      },
      {
        id: "cf-pla",
        name: "Carbon Fiber PLA",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 0.9,
        hourlyRate: 55,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.3,
        active: true,
      },
      {
        id: "cf-petg",
        name: "Carbon Fiber PETG",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 0.95,
        hourlyRate: 55,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.3,
        active: true,
      },
      {
        id: "cf-nylon",
        name: "Carbon Fiber Nylon",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 1.1,
        hourlyRate: 60,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.15,
        active: true,
      },
      {
        id: "metal-fill",
        name: "Metal Fill",
        colors: [
          { name: "Demir", active: true },
          { name: "Pirinç", active: true },
          { name: "Bakır", active: true },
        ],
        gramPrice: 1.2,
        hourlyRate: 55,
        fixedCost: 40,
        profitMargin: 30,
        density: 3.5,
        active: true,
      },
      {
        id: "wood-fill",
        name: "Wood Fill",
        colors: [
          { name: "Açık Ahşap", active: true },
          { name: "Koyu Ahşap", active: true },
          { name: "Bambu", active: false },
        ],
        gramPrice: 0.6,
        hourlyRate: 40,
        fixedCost: 25,
        profitMargin: 30,
        density: 1.15,
        active: true,
      },
    ],
  },
  {
    id: "fdm-yuksek",
    name: "FDM Yüksek Performans",
    icon: "🔥",
    color: "#dc2626",
    active: false,
    materials: [
      {
        id: "peek",
        name: "PEEK",
        colors: [
          { name: "Doğal", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 8.0,
        hourlyRate: 200,
        fixedCost: 150,
        profitMargin: 30,
        density: 1.32,
        active: false,
      },
      {
        id: "pei",
        name: "PEI (ULTEM)",
        colors: [{ name: "Doğal", active: true }],
        gramPrice: 7.0,
        hourlyRate: 180,
        fixedCost: 150,
        profitMargin: 30,
        density: 1.27,
        active: false,
      },
      {
        id: "ultem-9085",
        name: "ULTEM 9085",
        colors: [{ name: "Doğal", active: true }],
        gramPrice: 9.0,
        hourlyRate: 200,
        fixedCost: 150,
        profitMargin: 30,
        density: 1.34,
        active: false,
      },
      {
        id: "cf-peek",
        name: "Carbon Fiber PEEK",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 12.0,
        hourlyRate: 220,
        fixedCost: 180,
        profitMargin: 30,
        density: 1.4,
        active: false,
      },
    ],
  },
  {
    id: "sla",
    name: "SLA Reçine",
    icon: "💎",
    color: "#6366f1",
    active: true,
    materials: [
      {
        id: "resin-standart",
        name: "Standart Reçine",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
          { name: "Şeffaf", active: true },
          { name: "Mavi", active: true },
          { name: "Kırmızı", active: true },
          { name: "Sarı", active: false },
          { name: "Yeşil", active: false },
          { name: "Turuncu", active: false },
          { name: "Mor", active: false },
          { name: "Pembe", active: false },
        ],
        gramPrice: 0.9,
        hourlyRate: 60,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "resin-abs",
        name: "ABS-like Reçine",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 1.0,
        hourlyRate: 60,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "resin-seffaf",
        name: "Şeffaf Reçine",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Sarı Şeffaf", active: false },
          { name: "Mavi Şeffaf", active: false },
          { name: "Yeşil Şeffaf", active: false },
        ],
        gramPrice: 1.1,
        hourlyRate: 65,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "resin-esnek",
        name: "Esnek Reçine",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 1.2,
        hourlyRate: 65,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "resin-castable",
        name: "Castable Reçine",
        colors: [
          { name: "Sarı", active: true },
          { name: "Turuncu", active: false },
        ],
        gramPrice: 2.5,
        hourlyRate: 80,
        fixedCost: 50,
        profitMargin: 30,
        density: 1.15,
        active: true,
      },
      {
        id: "resin-dental",
        name: "Dental Reçine",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Pembe", active: true },
          { name: "Şeffaf", active: true },
        ],
        gramPrice: 3.0,
        hourlyRate: 90,
        fixedCost: 60,
        profitMargin: 30,
        density: 1.12,
        active: true,
      },
      {
        id: "resin-engineering",
        name: "Engineering Reçine",
        colors: [
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 2.0,
        hourlyRate: 75,
        fixedCost: 45,
        profitMargin: 30,
        density: 1.15,
        active: true,
      },
    ],
  },
  {
    id: "dlp",
    name: "DLP Reçine",
    icon: "🔵",
    color: "#3b82f6",
    active: false,
    materials: [
      {
        id: "dlp-standart",
        name: "Standart Reçine",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
          { name: "Şeffaf", active: true },
        ],
        gramPrice: 0.85,
        hourlyRate: 55,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.1,
        active: false,
      },
      {
        id: "dlp-abs",
        name: "ABS-like",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
        ],
        gramPrice: 0.95,
        hourlyRate: 55,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.1,
        active: false,
      },
      {
        id: "dlp-esnek",
        name: "Esnek",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 1.15,
        hourlyRate: 60,
        fixedCost: 35,
        profitMargin: 30,
        density: 1.1,
        active: false,
      },
    ],
  },
  {
    id: "msla",
    name: "MSLA (LCD) Reçine",
    icon: "📱",
    color: "#8b5cf6",
    active: true,
    materials: [
      {
        id: "msla-standart",
        name: "Standart Reçine",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
          { name: "Şeffaf", active: true },
          { name: "Kırmızı", active: true },
          { name: "Mavi", active: true },
          { name: "Yeşil", active: false },
          { name: "Sarı", active: false },
          { name: "Turuncu", active: false },
          { name: "Mor", active: false },
          { name: "Pembe", active: false },
        ],
        gramPrice: 0.8,
        hourlyRate: 55,
        fixedCost: 25,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "msla-abs",
        name: "ABS-like",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 0.9,
        hourlyRate: 55,
        fixedCost: 25,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "msla-esnek",
        name: "Esnek",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 1.1,
        hourlyRate: 60,
        fixedCost: 30,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
      {
        id: "msla-8k",
        name: "8K Yüksek Detay",
        colors: [
          { name: "Gri", active: true },
          { name: "Beyaz", active: true },
        ],
        gramPrice: 1.3,
        hourlyRate: 70,
        fixedCost: 40,
        profitMargin: 30,
        density: 1.1,
        active: true,
      },
    ],
  },
  {
    id: "sls",
    name: "SLS (Toz)",
    icon: "⚡",
    color: "#06b6d4",
    active: true,
    materials: [
      {
        id: "sls-pa12",
        name: "PA12",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
          { name: "Doğal", active: false },
        ],
        gramPrice: 1.8,
        hourlyRate: 120,
        fixedCost: 80,
        profitMargin: 30,
        density: 1.01,
        active: true,
      },
      {
        id: "sls-pa11",
        name: "PA11",
        colors: [
          { name: "Doğal", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 2.0,
        hourlyRate: 120,
        fixedCost: 80,
        profitMargin: 30,
        density: 1.03,
        active: true,
      },
      {
        id: "sls-tpu",
        name: "TPU Toz",
        colors: [
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 2.2,
        hourlyRate: 130,
        fixedCost: 90,
        profitMargin: 30,
        density: 1.2,
        active: true,
      },
      {
        id: "sls-pp",
        name: "PP",
        colors: [
          { name: "Doğal", active: true },
          { name: "Beyaz", active: true },
        ],
        gramPrice: 1.9,
        hourlyRate: 120,
        fixedCost: 80,
        profitMargin: 30,
        density: 0.91,
        active: true,
      },
      {
        id: "sls-pa12gb",
        name: "PA12 GB (Cam Dolgulu)",
        colors: [{ name: "Gri", active: true }],
        gramPrice: 2.1,
        hourlyRate: 125,
        fixedCost: 85,
        profitMargin: 30,
        density: 1.08,
        active: true,
      },
    ],
  },
  {
    id: "mjf",
    name: "MJF (Multi Jet Fusion)",
    icon: "🚀",
    color: "#0ea5e9",
    active: true,
    materials: [
      {
        id: "mjf-pa12",
        name: "PA12",
        colors: [
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 2.5,
        hourlyRate: 150,
        fixedCost: 100,
        profitMargin: 30,
        density: 1.01,
        active: true,
      },
      {
        id: "mjf-pa12gb",
        name: "PA12 GB",
        colors: [{ name: "Gri", active: true }],
        gramPrice: 2.8,
        hourlyRate: 155,
        fixedCost: 105,
        profitMargin: 30,
        density: 1.08,
        active: true,
      },
      {
        id: "mjf-tpu",
        name: "TPU",
        colors: [
          { name: "Gri", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 3.0,
        hourlyRate: 160,
        fixedCost: 110,
        profitMargin: 30,
        density: 1.2,
        active: true,
      },
      {
        id: "mjf-pa11",
        name: "PA11",
        colors: [{ name: "Doğal", active: true }],
        gramPrice: 2.6,
        hourlyRate: 150,
        fixedCost: 100,
        profitMargin: 30,
        density: 1.03,
        active: true,
      },
    ],
  },
  {
    id: "dmls",
    name: "Metal (DMLS/SLM)",
    icon: "🔩",
    color: "#94a3b8",
    active: false,
    materials: [
      {
        id: "metal-316l",
        name: "316L Paslanmaz Çelik",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 12.0,
        hourlyRate: 400,
        fixedCost: 200,
        profitMargin: 30,
        density: 7.9,
        active: false,
      },
      {
        id: "metal-174ph",
        name: "17-4 PH Çelik",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 13.0,
        hourlyRate: 420,
        fixedCost: 200,
        profitMargin: 30,
        density: 7.78,
        active: false,
      },
      {
        id: "metal-titanium",
        name: "Titanyum Ti6Al4V",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 25.0,
        hourlyRate: 500,
        fixedCost: 300,
        profitMargin: 30,
        density: 4.43,
        active: false,
      },
      {
        id: "metal-aluminyum",
        name: "Alüminyum AlSi10Mg",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 8.0,
        hourlyRate: 350,
        fixedCost: 180,
        profitMargin: 30,
        density: 2.67,
        active: false,
      },
      {
        id: "metal-kobalt",
        name: "Kobalt Krom",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 30.0,
        hourlyRate: 550,
        fixedCost: 350,
        profitMargin: 30,
        density: 8.3,
        active: false,
      },
      {
        id: "metal-inconel",
        name: "İnkonel 625",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 35.0,
        hourlyRate: 600,
        fixedCost: 400,
        profitMargin: 30,
        density: 8.44,
        active: false,
      },
      {
        id: "metal-maraging",
        name: "Maraging Çelik",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 20.0,
        hourlyRate: 480,
        fixedCost: 280,
        profitMargin: 30,
        density: 8.0,
        active: false,
      },
    ],
  },
  {
    id: "binder-jetting",
    name: "Binder Jetting (Metal)",
    icon: "🏗️",
    color: "#64748b",
    active: false,
    materials: [
      {
        id: "bj-316l",
        name: "316L Çelik",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 10.0,
        hourlyRate: 380,
        fixedCost: 180,
        profitMargin: 30,
        density: 7.9,
        active: false,
      },
      {
        id: "bj-bakir",
        name: "Bakır",
        colors: [{ name: "Bakır", active: true }],
        gramPrice: 15.0,
        hourlyRate: 400,
        fixedCost: 200,
        profitMargin: 30,
        density: 8.96,
        active: false,
      },
      {
        id: "bj-demir",
        name: "Demir",
        colors: [{ name: "Metalik Ham", active: true }],
        gramPrice: 8.0,
        hourlyRate: 350,
        fixedCost: 170,
        profitMargin: 30,
        density: 7.87,
        active: false,
      },
    ],
  },
  {
    id: "polyjet",
    name: "Polyjet/Multijet",
    icon: "🎨",
    color: "#ec4899",
    active: false,
    materials: [
      {
        id: "pj-rijit",
        name: "Rijit Malzeme",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Gri", active: true },
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 5.0,
        hourlyRate: 250,
        fixedCost: 150,
        profitMargin: 30,
        density: 1.18,
        active: false,
      },
      {
        id: "pj-esnek",
        name: "Esnek Malzeme",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 6.0,
        hourlyRate: 270,
        fixedCost: 160,
        profitMargin: 30,
        density: 1.18,
        active: false,
      },
      {
        id: "pj-cok",
        name: "Çok Malzemeli",
        colors: [{ name: "Karışık", active: true }],
        gramPrice: 8.0,
        hourlyRate: 300,
        fixedCost: 200,
        profitMargin: 30,
        density: 1.18,
        active: false,
      },
    ],
  },
  {
    id: "seramik",
    name: "Seramik/Beton",
    icon: "🏺",
    color: "#a16207",
    active: false,
    materials: [
      {
        id: "seramik-beyaz",
        name: "Seramik",
        colors: [
          { name: "Beyaz", active: true },
          { name: "Doğal", active: true },
        ],
        gramPrice: 4.0,
        hourlyRate: 180,
        fixedCost: 100,
        profitMargin: 30,
        density: 1.7,
        active: false,
      },
      {
        id: "beton",
        name: "Beton",
        colors: [{ name: "Gri", active: true }],
        gramPrice: 2.0,
        hourlyRate: 150,
        fixedCost: 80,
        profitMargin: 30,
        density: 2.3,
        active: false,
      },
    ],
  },
  {
    id: "karbon-fiber",
    name: "Continuous Karbon Fiber",
    icon: "🏎️",
    color: "#1e293b",
    active: false,
    materials: [
      {
        id: "cf-nylon-cont",
        name: "Karbon Fiber + Nylon",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 5.0,
        hourlyRate: 200,
        fixedCost: 120,
        profitMargin: 30,
        density: 1.2,
        active: false,
      },
      {
        id: "cf-pla-cont",
        name: "Karbon Fiber + PLA",
        colors: [{ name: "Siyah", active: true }],
        gramPrice: 4.5,
        hourlyRate: 190,
        fixedCost: 110,
        profitMargin: 30,
        density: 1.2,
        active: false,
      },
      {
        id: "kevlar-nylon",
        name: "Kevlar + Nylon",
        colors: [
          { name: "Sarı", active: true },
          { name: "Siyah", active: true },
        ],
        gramPrice: 6.0,
        hourlyRate: 220,
        fixedCost: 140,
        profitMargin: 30,
        density: 1.38,
        active: false,
      },
      {
        id: "cam-fiber",
        name: "Cam Fiber + Nylon",
        colors: [
          { name: "Şeffaf", active: true },
          { name: "Beyaz", active: true },
        ],
        gramPrice: 4.0,
        hourlyRate: 190,
        fixedCost: 110,
        profitMargin: 30,
        density: 1.2,
        active: false,
      },
    ],
  },
];
const ALL_ACTIVE_TECHNOLOGIES = DEFAULT_TECHNOLOGIES.map((t) => ({
  ...t,
  active: true,
  materials: t.materials.map((m) => ({
    ...m,
    active: true,
    colors: m.colors.map((c) => ({ ...c, active: true })),
  })),
}));
export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "general" | "print3d" | "techprofiles"
  >("general");
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>(
    ALL_ACTIVE_TECHNOLOGIES,
  );
  const [expandedTech, setExpandedTech] = useState<string | null>(null);
  const [expandedMat, setExpandedMat] = useState<string | null>(null);
  const [techSaved, setTechSaved] = useState(false);
  const [techLoading, setTechLoading] = useState(false);
  const [techProfiles, setTechProfiles] = useState({
    fdm: { shell_flow_rate: 4.0, infill_flow_rate: 8.0, power_w: 200.0 },
    fdm_endustriyel: {
      shell_flow_rate: 8.0,
      infill_flow_rate: 16.0,
      power_w: 300.0,
    },
    fdm_yuksek: {
      shell_flow_rate: 12.0,
      infill_flow_rate: 24.0,
      power_w: 350.0,
    },
    sla: {
      bottom_layer_count: 5,
      bottom_exposure_sec: 30.0,
      normal_exposure_sec: 8.0,
      lift_distance_mm: 5.0,
      lift_speed: 60.0,
      retract_speed: 120.0,
      light_off_delay: 1.0,
    },
    dlp: {
      bottom_layer_count: 5,
      bottom_exposure_sec: 20.0,
      normal_exposure_sec: 4.0,
      lift_distance_mm: 5.0,
      lift_speed: 90.0,
      retract_speed: 150.0,
      light_off_delay: 0.5,
    },
    msla: {
      bottom_layer_count: 5,
      bottom_exposure_sec: 15.0,
      normal_exposure_sec: 3.0,
      lift_distance_mm: 4.0,
      lift_speed: 90.0,
      retract_speed: 150.0,
      light_off_delay: 0.5,
    },
    sls: {
      recoater_time: 8.0,
      fusion_time: 3.0,
      warmup_hours: 1.5,
      cooldown_multiplier: 1.0,
      refresh_ratio: 0.2,
      bed_x_cm: 38.0,
      bed_y_cm: 28.4,
    },
    mjf: {
      recoater_time: 8.0,
      fusion_time: 3.0,
      warmup_hours: 1.5,
      cooldown_multiplier: 1.0,
      refresh_ratio: 0.2,
      bed_x_cm: 38.0,
      bed_y_cm: 28.4,
    },
    dmls: {
      laser_count: 2,
      melt_rate_cm3_hr: 15.0,
      recoater_time: 7.0,
      purge_warmup_hours: 2.0,
      cooldown_hours: 4.0,
      thermal_support_ratio: 0.35,
    },
    binder_jetting: {
      laser_count: 1,
      melt_rate_cm3_hr: 30.0,
      recoater_time: 5.0,
      purge_warmup_hours: 1.0,
      cooldown_hours: 2.0,
      thermal_support_ratio: 0.05,
    },
    seramik: {
      shrinkage_factor: 0.18,
      resin_density_g_cm3: 1.7,
      furnace_cost_per_hour: 2.5,
    },
    karbon_fiber: {
      spool_length_m: 50.0,
      plastic_density_g_cm3: 1.2,
      fiber_volume_ratio: 0.3,
    },
  });
  const [profilesSaved, setProfilesSaved] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);

  useEffect(() => {
    fetch(
      "https://fimarkt-backend-production.up.railway.app/api/print-materials",
    )
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data[0]?.materials) {
          setTechnologies(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    Alert.alert("Kaydedildi", "Ayarlar kaydedildi");
  };

  const toggleTech = (techId: string, value: boolean) => {
    setTechnologies((prev) =>
      prev.map((t) => (t.id === techId ? { ...t, active: value } : t)),
    );
  };

  const toggleMaterial = (techId: string, matId: string, value: boolean) => {
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id === techId
          ? {
              ...t,
              materials: t.materials.map((m) =>
                m.id === matId ? { ...m, active: value } : m,
              ),
            }
          : t,
      ),
    );
  };
  const toggleColor = (techId: string, matId: string, colorName: string) => {
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id === techId
          ? {
              ...t,
              materials: t.materials.map((m) =>
                m.id === matId
                  ? {
                      ...m,
                      colors: m.colors.map((c) =>
                        c.name === colorName ? { ...c, active: !c.active } : c,
                      ),
                    }
                  : m,
              ),
            }
          : t,
      ),
    );
  };
  const handleMatFieldChange = (
    techId: string,
    matId: string,
    field: keyof Material,
    value: string,
  ) => {
    setTechnologies((prev) =>
      prev.map((t) =>
        t.id === techId
          ? {
              ...t,
              materials: t.materials.map((m) =>
                m.id === matId
                  ? {
                      ...m,
                      [field]:
                        field === "name" ||
                        field === "colors" ||
                        field === "id" ||
                        field === "active"
                          ? value
                          : parseFloat(value) || 0,
                    }
                  : m,
              ),
            }
          : t,
      ),
    );
  };

  const handleTechSave = async () => {
    setTechLoading(true);
    try {
      const res = await fetch(
        "https://fimarkt-backend-production.up.railway.app/api/print-materials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ materials: technologies }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setTechSaved(true);
        Alert.alert("Kaydedildi", "3D baskı ayarları kaydedildi");
        setTimeout(() => setTechSaved(false), 3000);
      }
    } catch (e) {
      Alert.alert("Hata", "Kaydedilemedi, tekrar dene");
    } finally {
      setTechLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uygulama Ayarları</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "general" && styles.tabActive]}
          onPress={() => setActiveTab("general")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "general" && styles.tabTextActive,
            ]}
          >
            ⚙️ Genel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "print3d" && styles.tabActive]}
          onPress={() => setActiveTab("print3d")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "print3d" && styles.tabTextActive,
            ]}
          >
            🖨️ 3D Fiyat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "techprofiles" && styles.tabActive]}
          onPress={() => setActiveTab("techprofiles")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "techprofiles" && styles.tabTextActive,
            ]}
          >
            🔧 Üretim
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "general" ? (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>💡</Text>
              <Text style={styles.infoText}>
                Bu ayarlar ilerleyen aşamada backend'e bağlanacak ve uygulamaya
                yansıyacak.
              </Text>
            </View>
            {SECTIONS.map((section) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDesc}>{section.desc}</Text>
                {section.fields.map((field) => (
                  <View key={field.key} style={styles.field}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={styles.input}
                      value={values[field.key] || ""}
                      onChangeText={(v) => handleChange(field.key, v)}
                      placeholder={field.placeholder}
                      placeholderTextColor={Colors.text3}
                    />
                  </View>
                ))}
              </View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>
                {saved ? "✅ Kaydedildi" : "Ayarları Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : activeTab === "print3d" ? (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>📐</Text>
              <Text style={styles.infoText}>
                Teknoloji ve malzemeleri aktif/pasif yap. Fiyatları düzenle.
                Pasif olanlar uygulamada görünmez.
              </Text>
            </View>

            {[
              {
                groupId: "fdm",
                label: "🏭 FDM Baskı",
                ids: ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"],
              },
              {
                groupId: "recine",
                label: "💎 Reçine Baskı",
                ids: ["sla", "dlp", "msla"],
              },
              { groupId: "toz", label: "⚡ Toz Baskı", ids: ["sls", "mjf"] },
              {
                groupId: "metal",
                label: "🔩 Metal Baskı",
                ids: ["dmls", "binder-jetting"],
              },
              {
                groupId: "ozel",
                label: "🎨 Özel",
                ids: ["polyjet", "seramik", "karbon-fiber"],
              },
            ].map((group) => {
              const groupTechs = technologies.filter((t) =>
                group.ids.includes(t.id),
              );
              if (groupTechs.length === 0) return null;
              return (
                <View key={group.groupId}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  {groupTechs.map((tech) => (
                    <View
                      key={tech.id}
                      style={[
                        styles.techSection,
                        !tech.active && styles.techSectionPassive,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.techHeader}
                        onPress={() =>
                          setExpandedTech(
                            expandedTech === tech.id ? null : tech.id,
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={styles.techIcon}>{tech.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.techName,
                              !tech.active && styles.passiveText,
                            ]}
                          >
                            {tech.name}
                          </Text>
                          <Text style={styles.techMeta}>
                            {tech.materials.filter((m) => m.active).length}/
                            {tech.materials.length} malzeme aktif
                          </Text>
                        </View>
                        <Switch
                          value={tech.active}
                          onValueChange={(v) => toggleTech(tech.id, v)}
                          trackColor={{
                            false: Colors.border,
                            true: Colors.accent + "88",
                          }}
                          thumbColor={
                            tech.active ? Colors.accent : Colors.text3
                          }
                        />
                        <Text style={styles.chevron}>
                          {expandedTech === tech.id ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>

                      {expandedTech === tech.id && (
                        <View style={styles.matList}>
                          {tech.materials.map((mat) => (
                            <View
                              key={mat.id}
                              style={[
                                styles.matItem,
                                !mat.active && styles.matItemPassive,
                              ]}
                            >
                              <TouchableOpacity
                                style={styles.matItemHeader}
                                onPress={() =>
                                  setExpandedMat(
                                    expandedMat === `${tech.id}-${mat.id}`
                                      ? null
                                      : `${tech.id}-${mat.id}`,
                                  )
                                }
                                activeOpacity={0.8}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.matName,
                                      !mat.active && styles.passiveText,
                                    ]}
                                  >
                                    {mat.name}
                                  </Text>
                                  <Text style={styles.matMeta}>
                                    ₺{mat.gramPrice}/g · ₺{mat.hourlyRate}/saat
                                    · %{mat.profitMargin} kar
                                  </Text>
                                </View>
                                <Switch
                                  value={mat.active}
                                  onValueChange={(v) =>
                                    toggleMaterial(tech.id, mat.id, v)
                                  }
                                  trackColor={{
                                    false: Colors.border,
                                    true: Colors.accent + "88",
                                  }}
                                  thumbColor={
                                    mat.active ? Colors.accent : Colors.text3
                                  }
                                />
                                <Text style={styles.chevronSm}>
                                  {expandedMat === `${tech.id}-${mat.id}`
                                    ? "▲"
                                    : "▼"}
                                </Text>
                              </TouchableOpacity>

                              {expandedMat === `${tech.id}-${mat.id}` && (
                                <View style={styles.matFields}>
                                  <Text style={styles.matColorsLabel}>
                                    {mat.colors.filter((c) => c.active).length}{" "}
                                    aktif / {mat.colors.length} toplam renk
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      flexWrap: "wrap",
                                      gap: 6,
                                      marginBottom: 12,
                                    }}
                                  >
                                    {mat.colors.map((colorObj) => (
                                      <TouchableOpacity
                                        key={colorObj.name}
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          backgroundColor: colorObj.active
                                            ? Colors.accent + "22"
                                            : Colors.surface2,
                                          borderRadius: 20,
                                          paddingHorizontal: 10,
                                          paddingVertical: 5,
                                          borderWidth: 1,
                                          borderColor: colorObj.active
                                            ? Colors.accent
                                            : Colors.border,
                                        }}
                                        onPress={() =>
                                          toggleColor(
                                            tech.id,
                                            mat.id,
                                            colorObj.name,
                                          )
                                        }
                                      >
                                        <Text
                                          style={{
                                            fontSize: 10,
                                            color: colorObj.active
                                              ? Colors.accent
                                              : Colors.text3,
                                            fontWeight: "600",
                                          }}
                                        >
                                          {colorObj.active ? "✓" : "○"}{" "}
                                          {colorObj.name}
                                        </Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                  <View style={styles.matFieldRow}>
                                    <View style={styles.matField}>
                                      <Text style={styles.label}>
                                        Gram Fiyatı (₺/g)
                                      </Text>
                                      <TextInput
                                        style={styles.input}
                                        value={String(mat.gramPrice)}
                                        onChangeText={(v) =>
                                          handleMatFieldChange(
                                            tech.id,
                                            mat.id,
                                            "gramPrice",
                                            v,
                                          )
                                        }
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={Colors.text3}
                                      />
                                    </View>
                                    <View style={styles.matField}>
                                      <Text style={styles.label}>
                                        Saat Fiyatı (₺/saat)
                                      </Text>
                                      <TextInput
                                        style={styles.input}
                                        value={String(mat.hourlyRate)}
                                        onChangeText={(v) =>
                                          handleMatFieldChange(
                                            tech.id,
                                            mat.id,
                                            "hourlyRate",
                                            v,
                                          )
                                        }
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={Colors.text3}
                                      />
                                    </View>
                                  </View>
                                  <View style={styles.matFieldRow}>
                                    <View style={styles.matField}>
                                      <Text style={styles.label}>
                                        Sabit Maliyet (₺)
                                      </Text>
                                      <TextInput
                                        style={styles.input}
                                        value={String(mat.fixedCost)}
                                        onChangeText={(v) =>
                                          handleMatFieldChange(
                                            tech.id,
                                            mat.id,
                                            "fixedCost",
                                            v,
                                          )
                                        }
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={Colors.text3}
                                      />
                                    </View>
                                    <View style={styles.matField}>
                                      <Text style={styles.label}>
                                        Kar Marjı (%)
                                      </Text>
                                      <TextInput
                                        style={styles.input}
                                        value={String(mat.profitMargin)}
                                        onChangeText={(v) =>
                                          handleMatFieldChange(
                                            tech.id,
                                            mat.id,
                                            "profitMargin",
                                            v,
                                          )
                                        }
                                        keyboardType="decimal-pad"
                                        placeholderTextColor={Colors.text3}
                                      />
                                    </View>
                                  </View>

                                  <View style={styles.matFieldRow}>
                                    <View style={styles.matField}>
                                      <Text style={styles.label}>
                                        Yoğunluk (g/cm³)
                                      </Text>
                                      <TextInput
                                        style={styles.input}
                                        value={String(mat.density ?? "")}
                                        onChangeText={(v) =>
                                          handleMatFieldChange(
                                            tech.id,
                                            mat.id,
                                            "density",
                                            v,
                                          )
                                        }
                                        keyboardType="decimal-pad"
                                        placeholder="örn: 1.24"
                                        placeholderTextColor={Colors.text3}
                                      />
                                    </View>
                                  </View>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
            <View style={{ height: 120 }} />
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleTechSave}
              disabled={techLoading}
            >
              <Text style={styles.saveBtnText}>
                {techLoading
                  ? "Kaydediliyor..."
                  : techSaved
                    ? "✅ Kaydedildi"
                    : "3D Ayarlarını Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {activeTab === "techprofiles" && (
        <>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🔧</Text>
              <Text style={styles.infoText}>
                Hesaplama motorunun kullandığı teknik parametreler.
                Değiştirmeden önce teknik bilgi edindiğinizden emin olun.
              </Text>
            </View>

            {/* FDM */}
            <Text style={styles.groupLabel}>🏭 FDM STANDART</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Shell Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.fdm.shell_flow_rate)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm: { ...p.fdm, shell_flow_rate: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Infill Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.fdm.infill_flow_rate)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm: { ...p.fdm, infill_flow_rate: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matField}>
                <Text style={styles.label}>Güç Tüketimi (W)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text3}
                  value={String(techProfiles.fdm.power_w)}
                  onChangeText={(v) =>
                    setTechProfiles((p) => ({
                      ...p,
                      fdm: { ...p.fdm, power_w: parseFloat(v) || 0 },
                    }))
                  }
                />
              </View>
            </View>

            <Text style={styles.groupLabel}>⚙️ FDM ENDÜSTRİYEL</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Shell Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.fdm_endustriyel.shell_flow_rate)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm_endustriyel: {
                          ...p.fdm_endustriyel,
                          shell_flow_rate: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Infill Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(
                      techProfiles.fdm_endustriyel.infill_flow_rate,
                    )}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm_endustriyel: {
                          ...p.fdm_endustriyel,
                          infill_flow_rate: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matField}>
                <Text style={styles.label}>Güç Tüketimi (W)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text3}
                  value={String(techProfiles.fdm_endustriyel.power_w)}
                  onChangeText={(v) =>
                    setTechProfiles((p) => ({
                      ...p,
                      fdm_endustriyel: {
                        ...p.fdm_endustriyel,
                        power_w: parseFloat(v) || 0,
                      },
                    }))
                  }
                />
              </View>
            </View>

            <Text style={styles.groupLabel}>🔥 FDM YÜKSEK PERFORMANS</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Shell Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.fdm_yuksek.shell_flow_rate)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm_yuksek: {
                          ...p.fdm_yuksek,
                          shell_flow_rate: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Infill Flow Rate (mm³/s)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.fdm_yuksek.infill_flow_rate)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        fdm_yuksek: {
                          ...p.fdm_yuksek,
                          infill_flow_rate: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
            </View>

            {/* REÇİNE */}
            <Text style={styles.groupLabel}>💎 SLA REÇİNE</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Alt Katman Sayısı</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.bottom_layer_count)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: {
                          ...p.sla,
                          bottom_layer_count: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Alt Kat Pozlama (sn)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.bottom_exposure_sec)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: {
                          ...p.sla,
                          bottom_exposure_sec: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Normal Pozlama (sn)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.normal_exposure_sec)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: {
                          ...p.sla,
                          normal_exposure_sec: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Lift Mesafe (mm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.lift_distance_mm)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: { ...p.sla, lift_distance_mm: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Lift Hız (mm/dak)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.lift_speed)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: { ...p.sla, lift_speed: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Retract Hız (mm/dak)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sla.retract_speed)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sla: { ...p.sla, retract_speed: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
            </View>

            {/* TOZ */}
            <Text style={styles.groupLabel}>⚡ SLS / MJF TOZ</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Recoater Süresi (sn)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sls.recoater_time)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sls: { ...p.sls, recoater_time: parseFloat(v) || 0 },
                        mjf: { ...p.mjf, recoater_time: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Fusion Süresi (sn)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sls.fusion_time)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sls: { ...p.sls, fusion_time: parseFloat(v) || 0 },
                        mjf: { ...p.mjf, fusion_time: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Isınma (saat)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sls.warmup_hours)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sls: { ...p.sls, warmup_hours: parseFloat(v) || 0 },
                        mjf: { ...p.mjf, warmup_hours: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Refresh Oranı (0-1)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.sls.refresh_ratio)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        sls: { ...p.sls, refresh_ratio: parseFloat(v) || 0 },
                        mjf: { ...p.mjf, refresh_ratio: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
            </View>

            {/* METAL */}
            <Text style={styles.groupLabel}>🔩 METAL (DMLS)</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Lazer Sayısı</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.dmls.laser_count)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        dmls: { ...p.dmls, laser_count: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Eritme Hızı (cm³/saat)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.dmls.melt_rate_cm3_hr)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        dmls: {
                          ...p.dmls,
                          melt_rate_cm3_hr: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Isınma + Purge (saat)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.dmls.purge_warmup_hours)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        dmls: {
                          ...p.dmls,
                          purge_warmup_hours: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Soğuma (saat)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.dmls.cooldown_hours)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        dmls: { ...p.dmls, cooldown_hours: parseFloat(v) || 0 },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matField}>
                <Text style={styles.label}>Termal Destek Oranı (0-1)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text3}
                  value={String(techProfiles.dmls.thermal_support_ratio)}
                  onChangeText={(v) =>
                    setTechProfiles((p) => ({
                      ...p,
                      dmls: {
                        ...p.dmls,
                        thermal_support_ratio: parseFloat(v) || 0,
                      },
                    }))
                  }
                />
              </View>
            </View>

            {/* ÖZEL */}
            <Text style={styles.groupLabel}>🏺 SERAMİK</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Büzülme Faktörü (0-1)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.seramik.shrinkage_factor)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        seramik: {
                          ...p.seramik,
                          shrinkage_factor: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Reçine Yoğunluğu (g/cm³)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.seramik.resin_density_g_cm3)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        seramik: {
                          ...p.seramik,
                          resin_density_g_cm3: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matField}>
                <Text style={styles.label}>Fırın Maliyeti (₺/saat)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text3}
                  value={String(techProfiles.seramik.furnace_cost_per_hour)}
                  onChangeText={(v) =>
                    setTechProfiles((p) => ({
                      ...p,
                      seramik: {
                        ...p.seramik,
                        furnace_cost_per_hour: parseFloat(v) || 0,
                      },
                    }))
                  }
                />
              </View>
            </View>

            <Text style={styles.groupLabel}>🏎️ KARBON FİBER</Text>
            <View style={styles.section}>
              <View style={styles.matFieldRow}>
                <View style={styles.matField}>
                  <Text style={styles.label}>Makara Uzunluğu (metre)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(techProfiles.karbon_fiber.spool_length_m)}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        karbon_fiber: {
                          ...p.karbon_fiber,
                          spool_length_m: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
                <View style={styles.matField}>
                  <Text style={styles.label}>Plastik Yoğunluğu (g/cm³)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholderTextColor={Colors.text3}
                    value={String(
                      techProfiles.karbon_fiber.plastic_density_g_cm3,
                    )}
                    onChangeText={(v) =>
                      setTechProfiles((p) => ({
                        ...p,
                        karbon_fiber: {
                          ...p.karbon_fiber,
                          plastic_density_g_cm3: parseFloat(v) || 0,
                        },
                      }))
                    }
                  />
                </View>
              </View>
              <View style={styles.matField}>
                <Text style={styles.label}>
                  Fiber Hacim Oranı (0-1, örn: 0.30)
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text3}
                  value={String(techProfiles.karbon_fiber.fiber_volume_ratio)}
                  onChangeText={(v) =>
                    setTechProfiles((p) => ({
                      ...p,
                      karbon_fiber: {
                        ...p.karbon_fiber,
                        fiber_volume_ratio: parseFloat(v) || 0,
                      },
                    }))
                  }
                />
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={async () => {
                setProfilesLoading(true);
                try {
                  const res = await fetch(
                    "https://fimarkt-backend-production.up.railway.app/api/print-tech-profiles",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(techProfiles),
                    },
                  );
                  const data = await res.json();
                  if (data.success) {
                    setProfilesSaved(true);
                    Alert.alert("Kaydedildi", "Üretim profilleri kaydedildi");
                    setTimeout(() => setProfilesSaved(false), 3000);
                  }
                } catch (e) {
                  Alert.alert("Hata", "Kaydedilemedi, tekrar dene");
                } finally {
                  setProfilesLoading(false);
                }
              }}
              disabled={profilesLoading}
            >
              <Text style={styles.saveBtnText}>
                {profilesLoading
                  ? "Kaydediliyor..."
                  : profilesSaved
                    ? "✅ Kaydedildi"
                    : "Profilleri Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.accent + "20",
    borderColor: Colors.accent,
  },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.text2 },
  tabTextActive: { color: Colors.accent },
  scroll: { flex: 1, padding: 16 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  sectionDesc: { fontSize: 12, color: Colors.text2, marginBottom: 14 },
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    color: Colors.text2,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  techSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
  },
  techSectionPassive: { opacity: 0.6 },
  techHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  techIcon: { fontSize: 22 },
  techName: { fontSize: 14, fontWeight: "700", color: Colors.text },
  techMeta: { fontSize: 11, color: Colors.text2, marginTop: 2 },
  passiveText: { color: Colors.text3 },
  chevron: { fontSize: 11, color: Colors.text3, marginLeft: 4 },
  chevronSm: { fontSize: 10, color: Colors.text3, marginLeft: 4 },
  matList: { borderTopWidth: 1, borderTopColor: Colors.border },
  matItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 14,
  },
  matItemPassive: { opacity: 0.5 },
  matItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  matName: { fontSize: 13, fontWeight: "600", color: Colors.text },
  matMeta: { fontSize: 11, color: Colors.text2, marginTop: 1 },
  matFields: { paddingBottom: 12, gap: 8 },
  matColorsLabel: {
    fontSize: 11,
    color: Colors.text3,
    marginBottom: 8,
    lineHeight: 16,
  },
  matFieldRow: { flexDirection: "row", gap: 10 },
  matField: { flex: 1 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text3,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
    paddingLeft: 4,
  },
});

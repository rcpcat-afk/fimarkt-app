import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants";
import { useAuth } from "../../store/AuthContext";

// Türkiye il/ilçe listesi
const ILLER: Record<string, string[]> = {
  Adana: [
    "Aladağ",
    "Ceyhan",
    "Çukurova",
    "Feke",
    "İmamoğlu",
    "Karaisalı",
    "Karataş",
    "Kozan",
    "Pozantı",
    "Saimbeyli",
    "Sarıçam",
    "Seyhan",
    "Tufanbeyli",
    "Yumurtalık",
    "Yüreğir",
  ],
  Ankara: [
    "Akyurt",
    "Altındağ",
    "Ayaş",
    "Bala",
    "Beypazarı",
    "Çamlıdere",
    "Çankaya",
    "Çubuk",
    "Elmadağ",
    "Etimesgut",
    "Evren",
    "Gölbaşı",
    "Güdül",
    "Haymana",
    "Kahramankazan",
    "Kalecik",
    "Keçiören",
    "Kızılcahamam",
    "Mamak",
    "Nallıhan",
    "Polatlı",
    "Pursaklar",
    "Sincan",
    "Şereflikoçhisar",
    "Yenimahalle",
  ],
  İstanbul: [
    "Adalar",
    "Arnavutköy",
    "Ataşehir",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Bakırköy",
    "Başakşehir",
    "Bayrampaşa",
    "Beşiktaş",
    "Beykoz",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Çekmeköy",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kadıköy",
    "Kağıthane",
    "Kartal",
    "Küçükçekmece",
    "Maltepe",
    "Pendik",
    "Sancaktepe",
    "Sarıyer",
    "Silivri",
    "Sultanbeyli",
    "Sultangazi",
    "Şile",
    "Şişli",
    "Tuzla",
    "Ümraniye",
    "Üsküdar",
    "Zeytinburnu",
  ],
  İzmir: [
    "Aliağa",
    "Balçova",
    "Bayındır",
    "Bayraklı",
    "Bergama",
    "Beydağ",
    "Bornova",
    "Buca",
    "Çeşme",
    "Çiğli",
    "Dikili",
    "Foça",
    "Gaziemir",
    "Güzelbahçe",
    "Karabağlar",
    "Karaburun",
    "Karşıyaka",
    "Kemalpaşa",
    "Kınık",
    "Kiraz",
    "Konak",
    "Menderes",
    "Menemen",
    "Narlıdere",
    "Ödemiş",
    "Seferihisar",
    "Selçuk",
    "Tire",
    "Torbalı",
    "Urla",
  ],
  Bursa: [
    "Büyükorhan",
    "Gemlik",
    "Gürsu",
    "Harmancık",
    "İnegöl",
    "İznik",
    "Karacabey",
    "Keles",
    "Kestel",
    "Mudanya",
    "Mustafakemalpaşa",
    "Nilüfer",
    "Orhaneli",
    "Orhangazi",
    "Osmangazi",
    "Yıldırım",
    "Yenişehir",
  ],
  Antalya: [
    "Akseki",
    "Aksu",
    "Alanya",
    "Demre",
    "Döşemealtı",
    "Elmalı",
    "Finike",
    "Gazipaşa",
    "Gündoğmuş",
    "İbradı",
    "Kaş",
    "Kemer",
    "Kepez",
    "Konyaaltı",
    "Korkuteli",
    "Kumluca",
    "Manavgat",
    "Muratpaşa",
    "Serik",
  ],
  Konya: [
    "Ahırlı",
    "Akören",
    "Akşehir",
    "Altınekin",
    "Beyşehir",
    "Bozkır",
    "Cihanbeyli",
    "Çeltik",
    "Çumra",
    "Derbent",
    "Derebucak",
    "Doğanhisar",
    "Emirgazi",
    "Ereğli",
    "Güneysınır",
    "Hadim",
    "Halkapınar",
    "Hüyük",
    "Ilgın",
    "Kadınhanı",
    "Karapınar",
    "Karatay",
    "Kulu",
    "Meram",
    "Sarayönü",
    "Selçuklu",
    "Seydişehir",
    "Taşkent",
    "Tuzlukçu",
    "Yalıhüyük",
    "Yunak",
  ],
  Kayseri: [
    "Akkışla",
    "Bünyan",
    "Develi",
    "Felahiye",
    "Hacılar",
    "İncesu",
    "Kocasinan",
    "Melikgazi",
    "Özvatan",
    "Pınarbaşı",
    "Sarıoğlan",
    "Sarız",
    "Talas",
    "Tomarza",
    "Yahyalı",
    "Yeşilhisar",
  ],
  Gaziantep: [
    "Araban",
    "İslahiye",
    "Karkamış",
    "Nizip",
    "Nurdağı",
    "Oğuzeli",
    "Şahinbey",
    "Şehitkamil",
    "Yavuzeli",
  ],
  Mersin: [
    "Akdeniz",
    "Anamur",
    "Aydıncık",
    "Bozyazı",
    "Çamlıyayla",
    "Erdemli",
    "Gülnar",
    "Mezitli",
    "Mut",
    "Silifke",
    "Tarsus",
    "Toroslar",
    "Yenişehir",
  ],
  Adıyaman: [
    "Besni",
    "Çelikhan",
    "Gerger",
    "Gölbaşı",
    "Kahta",
    "Merkez",
    "Samsat",
    "Sincik",
    "Tut",
  ],
  Afyonkarahisar: [
    "Başmakçı",
    "Bayat",
    "Bolvadin",
    "Çay",
    "Çobanlar",
    "Dazkırı",
    "Dinar",
    "Emirdağ",
    "Evciler",
    "Hocalar",
    "İhsaniye",
    "İscehisar",
    "Kızılören",
    "Merkez",
    "Sandıklı",
    "Sinanpaşa",
    "Sultandağı",
    "Şuhut",
  ],
  Ağrı: [
    "Diyadin",
    "Doğubayazıt",
    "Eleşkirt",
    "Hamur",
    "Merkez",
    "Patnos",
    "Taşlıçay",
    "Tutak",
  ],
  Aksaray: [
    "Ağaçören",
    "Eskil",
    "Gülağaç",
    "Güzelyurt",
    "Merkez",
    "Ortaköy",
    "Sarıyahşi",
    "Sultanhanı",
  ],
  Amasya: [
    "Göynücek",
    "Gümüşhacıköy",
    "Hamamözü",
    "Merkez",
    "Merzifon",
    "Suluova",
    "Taşova",
  ],
  Ardahan: ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"],
  Artvin: [
    "Ardanuç",
    "Arhavi",
    "Borçka",
    "Hopa",
    "Kemalpaşa",
    "Merkez",
    "Murgul",
    "Şavşat",
    "Yusufeli",
  ],
  Aydın: [
    "Bozdoğan",
    "Buharkent",
    "Çine",
    "Didim",
    "Efeler",
    "Germencik",
    "İncirliova",
    "Karacasu",
    "Karpuzlu",
    "Koçarlı",
    "Köşk",
    "Kuşadası",
    "Kuyucak",
    "Merkez",
    "Nazilli",
    "Söke",
    "Sultanhisar",
    "Yenipazar",
  ],
  Balıkesir: [
    "Altıeylül",
    "Ayvalık",
    "Balya",
    "Bandırma",
    "Bigadiç",
    "Burhaniye",
    "Dursunbey",
    "Edremit",
    "Erdek",
    "Gömeç",
    "Gönen",
    "Havran",
    "İvrindi",
    "Karesi",
    "Kepsut",
    "Manyas",
    "Marmara",
    "Savaştepe",
    "Sındırgı",
    "Susurluk",
  ],
  Bartın: ["Arit", "Kurucaşile", "Merkez", "Ulus"],
  Batman: ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"],
  Bayburt: ["Aydıntepe", "Demirözü", "Merkez"],
  Bilecik: [
    "Bozüyük",
    "Gölpazarı",
    "İnhisar",
    "Merkez",
    "Osmaneli",
    "Pazaryeri",
    "Söğüt",
    "Yenipazar",
  ],
  Bingöl: [
    "Adaklı",
    "Genç",
    "Karlıova",
    "Kiğı",
    "Merkez",
    "Solhan",
    "Yayladere",
    "Yedisu",
  ],
  Bitlis: [
    "Adilcevaz",
    "Ahlat",
    "Güroymak",
    "Hizan",
    "Merkez",
    "Mutki",
    "Tatvan",
  ],
  Bolu: [
    "Dörtdivan",
    "Gerede",
    "Göynük",
    "Kıbrıscık",
    "Mengen",
    "Merkez",
    "Mudurnu",
    "Seben",
    "Yeniçağa",
  ],
  Burdur: [
    "Altınyayla",
    "Bucak",
    "Çavdır",
    "Çeltikçi",
    "Gölhisar",
    "Karamanlı",
    "Kemer",
    "Merkez",
    "Tefenni",
    "Yeşilova",
  ],
  Çanakkale: [
    "Ayvacık",
    "Bayramiç",
    "Biga",
    "Bozcaada",
    "Çan",
    "Eceabat",
    "Ezine",
    "Gelibolu",
    "Gökçeada",
    "Lapseki",
    "Merkez",
    "Yenice",
  ],
  Çankırı: [
    "Atkaracalar",
    "Bayramören",
    "Çerkeş",
    "Eldivan",
    "Ilgaz",
    "Khanköy",
    "Korgun",
    "Kurşunlu",
    "Merkez",
    "Orta",
    "Şabanözü",
    "Yapraklı",
  ],
  Çorum: [
    "Alaca",
    "Bayat",
    "Boğazkale",
    "Dodurga",
    "İskilip",
    "Kargı",
    "Laçin",
    "Mecitözü",
    "Merkez",
    "Oğuzlar",
    "Ortaköy",
    "Osmancık",
    "Sungurlu",
    "Uğurludağ",
  ],
  Denizli: [
    "Acıpayam",
    "Babadağ",
    "Baklan",
    "Bekilli",
    "Beyağaç",
    "Bozkurt",
    "Buldan",
    "Çal",
    "Çameli",
    "Çardak",
    "Çivril",
    "Güney",
    "Honaz",
    "Kale",
    "Merkezefendi",
    "Pamukkale",
    "Sarayköy",
    "Serinhisar",
    "Tavas",
  ],
  Diyarbakır: [
    "Bağlar",
    "Bismil",
    "Çermik",
    "Çınar",
    "Çüngüş",
    "Dicle",
    "Eğil",
    "Ergani",
    "Hani",
    "Hazro",
    "Kayapınar",
    "Kocaköy",
    "Kulp",
    "Lice",
    "Merkez",
    "Silvan",
    "Sur",
    "Üçyol",
    "Yenişehir",
  ],
  Düzce: [
    "Akçakoca",
    "Cumayeri",
    "Çilimli",
    "Gölyaka",
    "Gümüşova",
    "Kaynaşlı",
    "Merkez",
    "Yığılca",
  ],
  Edirne: [
    "Enez",
    "Havsa",
    "İpsala",
    "Keşan",
    "Lalapaşa",
    "Meriç",
    "Merkez",
    "Süloğlu",
    "Uzunköprü",
  ],
  Elazığ: [
    "Ağın",
    "Alacakaya",
    "Arıcak",
    "Baskil",
    "Karakoçan",
    "Keban",
    "Kovancılar",
    "Maden",
    "Merkez",
    "Palu",
    "Sivrice",
  ],
  Erzincan: [
    "Çayırlı",
    "İliç",
    "Kemah",
    "Kemaliye",
    "Merkez",
    "Otlukbeli",
    "Refahiye",
    "Tercan",
    "Üzümlü",
  ],
  Erzurum: [
    "Aşkale",
    "Aziziye",
    "Çat",
    "Hınıs",
    "Horasan",
    "İspir",
    "Karaçoban",
    "Karayazı",
    "Köprüköy",
    "Merkez",
    "Narman",
    "Oltu",
    "Olur",
    "Palandöken",
    "Pasinler",
    "Pazaryolu",
    "Şenkaya",
    "Tekman",
    "Tortum",
    "Uzundere",
    "Yakutiye",
  ],
  Eskişehir: [
    "Alpu",
    "Beylikova",
    "Çifteler",
    "Günyüzü",
    "Han",
    "İnönü",
    "Mahmudiye",
    "Mihalgazi",
    "Mihalıççık",
    "Odunpazarı",
    "Sarıcakaya",
    "Seyitgazi",
    "Sivrihisar",
    "Tepebaşı",
  ],
  Giresun: [
    "Alucra",
    "Bulancak",
    "Çamoluk",
    "Çanakçı",
    "Dereli",
    "Doğankent",
    "Espiye",
    "Eynesil",
    "Görele",
    "Güce",
    "Keşap",
    "Merkez",
    "Piraziz",
    "Şebinkarahisar",
    "Tirebolu",
    "Yağlıdere",
  ],
  Gümüşhane: ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"],
  Hakkari: ["Çukurca", "Derecik", "Merkez", "Şemdinli", "Yüksekova"],
  Hatay: [
    "Altınözü",
    "Antakya",
    "Arsuz",
    "Belen",
    "Defne",
    "Dörtyol",
    "Erzin",
    "Hassa",
    "İskenderun",
    "Kırıkhan",
    "Kumlu",
    "Mandacı",
    "Merkez",
    "Payas",
    "Reyhanlı",
    "Samandağ",
    "Serinyol",
    "Yayladağı",
  ],
  Iğdır: ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"],
  Isparta: [
    "Aksu",
    "Atabey",
    "Eğirdir",
    "Gelendost",
    "Gönen",
    "Keçiborlu",
    "Merkez",
    "Senirkent",
    "Sütçüler",
    "Şarkikaraağaç",
    "Uluborlu",
    "Yalvaç",
    "Yenişarbademli",
  ],
  Kahramanmaraş: [
    "Afşin",
    "Andırın",
    "Çağlayancerit",
    "Dulkadiroğlu",
    "Ekinözü",
    "Elbistan",
    "Göksun",
    "Merkez",
    "Nurhak",
    "Onikişubat",
    "Pazarcık",
    "Türkoğlu",
  ],
  Karabük: ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"],
  Karaman: [
    "Ayrancı",
    "Başyayla",
    "Ermenek",
    "Kazımkarabekir",
    "Merkez",
    "Sarıveliler",
  ],
  Kars: [
    "Akyaka",
    "Arpaçay",
    "Digor",
    "Kağızman",
    "Merkez",
    "Sarıkamış",
    "Selim",
    "Susuz",
  ],
  Kastamonu: [
    "Abana",
    "Ağlı",
    "Araç",
    "Azdavay",
    "Bozkurt",
    "Cide",
    "Çatalzeytin",
    "Daday",
    "Devrekani",
    "Doğanyurt",
    "Hanönü",
    "İhsangazi",
    "İnebolu",
    "Küre",
    "Merkez",
    "Pınarbaşı",
    "Şenpazar",
    "Taşköprü",
    "Tosya",
  ],
  Kırıkkale: [
    "Bahşili",
    "Balışeyh",
    "Çelebi",
    "Delice",
    "Karakeçili",
    "Keskin",
    "Merkez",
    "Sulakyurt",
    "Yahşihan",
  ],
  Kırklareli: [
    "Babaeski",
    "Demirköy",
    "Kofçaz",
    "Lüleburgaz",
    "Merkez",
    "Pehlivanköy",
    "Pınarhisar",
    "Vize",
  ],
  Kırşehir: [
    "Akçakent",
    "Akpınar",
    "Boztepe",
    "Çiçekdağı",
    "Kaman",
    "Merkez",
    "Mucur",
  ],
  Kilis: ["Elbeyli", "Merkez", "Musabeyli", "Polateli"],
  Kocaeli: [
    "Başiskele",
    "Çayırova",
    "Darıca",
    "Derince",
    "Dilovası",
    "Gebze",
    "Gölcük",
    "İzmit",
    "Kandıra",
    "Karamürsel",
    "Kartepe",
    "Körfez",
  ],
  Kütahya: [
    "Altıntaş",
    "Aslanapa",
    "Çavdarhisar",
    "Domaniç",
    "Dumlupınar",
    "Emet",
    "Gediz",
    "Hisarcık",
    "Merkez",
    "Pazarlar",
    "Simav",
    "Şaphane",
    "Tavşanlı",
  ],
  Malatya: [
    "Akçadağ",
    "Arapgir",
    "Arguvan",
    "Battalgazi",
    "Darende",
    "Doğanşehir",
    "Doğanyol",
    "Hekimhan",
    "Kale",
    "Kuluncak",
    "Merkez",
    "Pütürge",
    "Yazıhan",
    "Yeşilyurt",
  ],
  Manisa: [
    "Ahmetli",
    "Akhisar",
    "Alaşehir",
    "Demirci",
    "Gölmarmara",
    "Gördes",
    "Kırkağaç",
    "Köprübaşı",
    "Kula",
    "Merkez",
    "Salihli",
    "Sarıgöl",
    "Saruhanlı",
    "Selendi",
    "Soma",
    "Şehzadeler",
    "Turgutlu",
    "Yunusemre",
  ],
  Mardin: [
    "Artuklu",
    "Dargeçit",
    "Derik",
    "Kızıltepe",
    "Mazıdağı",
    "Merkez",
    "Midyat",
    "Nusaybin",
    "Ömerli",
    "Savur",
    "Yeşilli",
  ],
  Muğla: [
    "Bodrum",
    "Dalaman",
    "Datça",
    "Fethiye",
    "Kavaklıdere",
    "Köyceğiz",
    "Marmaris",
    "Menteşe",
    "Milas",
    "Ortaca",
    "Seydikemer",
    "Ula",
    "Yatağan",
  ],
  Muş: ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"],
  Nevşehir: [
    "Acıgöl",
    "Avanos",
    "Derinkuyu",
    "Gülşehir",
    "Hacıbektaş",
    "Kozaklı",
    "Merkez",
    "Ürgüp",
  ],
  Niğde: ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"],
  Ordu: [
    "Akkuş",
    "Altınordu",
    "Aybastı",
    "Çamaş",
    "Çatalpınar",
    "Çaybaşı",
    "Fatsa",
    "Gölköy",
    "Gülyalı",
    "Gürgentepe",
    "İkizce",
    "Kabadüz",
    "Kabataş",
    "Korgan",
    "Kumru",
    "Mesudiye",
    "Perşembe",
    "Ulubey",
    "Ünye",
  ],
  Osmaniye: [
    "Bahçe",
    "Düziçi",
    "Hasanbeyli",
    "Kadirli",
    "Merkez",
    "Sumbas",
    "Toprakkale",
  ],
  Rize: [
    "Ardeşen",
    "Çamlıhemşin",
    "Çayeli",
    "Derepazarı",
    "Fındıklı",
    "Güneysu",
    "Hemşin",
    "İkizdere",
    "İyidere",
    "Kalkandere",
    "Merkez",
    "Pazar",
  ],
  Sakarya: [
    "Adapazarı",
    "Akyazı",
    "Arifiye",
    "Erenler",
    "Ferizli",
    "Geyve",
    "Hendek",
    "Karapürçek",
    "Karasu",
    "Kaynarca",
    "Kocaali",
    "Mithatpaşa",
    "Pamukova",
    "Sapanca",
    "Serdivan",
    "Söğütlü",
    "Taraklı",
  ],
  Samsun: [
    "Alaçam",
    "Asarcık",
    "Atakum",
    "Ayvacık",
    "Bafra",
    "Canik",
    "Çarşamba",
    "Havza",
    "İlkadım",
    "Kavak",
    "Ladik",
    "Merkez",
    "Ondokuzmayıs",
    "Salıpazarı",
    "Tekkeköy",
    "Terme",
    "Vezirköprü",
    "Yakakent",
  ],
  Siirt: ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan", "Tillo"],
  Sinop: [
    "Ayancık",
    "Boyabat",
    "Dikmen",
    "Durağan",
    "Erfelek",
    "Gerze",
    "Merkez",
    "Saraydüzü",
    "Türkeli",
  ],
  Sivas: [
    "Akıncılar",
    "Altınyayla",
    "Divriği",
    "Doğanşar",
    "Gemerek",
    "Gölova",
    "Hafik",
    "İmranlı",
    "Kangal",
    "Koyulhisar",
    "Merkez",
    "Suşehri",
    "Şarkışla",
    "Ulaş",
    "Yıldızeli",
    "Zara",
  ],
  Şanlıurfa: [
    "Akçakale",
    "Birecik",
    "Bozova",
    "Ceylanpınar",
    "Eyyübiye",
    "Halfeti",
    "Haliliye",
    "Harran",
    "Hilvan",
    "Karaköprü",
    "Merkez",
    "Siverek",
    "Suruç",
    "Viranşehir",
  ],
  Şırnak: [
    "Beytüşşebap",
    "Cizre",
    "Güçlükonak",
    "İdil",
    "Merkez",
    "Silopi",
    "Uludere",
  ],
  Tekirdağ: [
    "Çerkezköy",
    "Çorlu",
    "Ergene",
    "Hayrabolu",
    "Kapaklı",
    "Malkara",
    "Marmaraereğlisi",
    "Merkez",
    "Muratlı",
    "Saray",
    "Süleymanpaşa",
    "Şarköy",
  ],
  Tokat: [
    "Almus",
    "Artova",
    "Başçiftlik",
    "Erbaa",
    "Merkez",
    "Niksar",
    "Pazar",
    "Reşadiye",
    "Sulusaray",
    "Turhal",
    "Yeşilyurt",
    "Zile",
  ],
  Trabzon: [
    "Akçaabat",
    "Araklı",
    "Arsin",
    "Beşikdüzü",
    "Çarşıbaşı",
    "Çaykara",
    "Dernekpazarı",
    "Düzköy",
    "Hayrat",
    "Köprübaşı",
    "Maçka",
    "Merkez",
    "Of",
    "Ortahisar",
    "Pelitli",
    "Şalpazarı",
    "Tonya",
    "Vakfıkebir",
    "Yomra",
  ],
  Tunceli: [
    "Çemişgezek",
    "Hozat",
    "Mazgirt",
    "Merkez",
    "Nazımiye",
    "Ovacık",
    "Pertek",
    "Pülümür",
  ],
  Uşak: ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"],
  Van: [
    "Bahçesaray",
    "Başkale",
    "Çaldıran",
    "Çatak",
    "Edremit",
    "Erciş",
    "Gevaş",
    "Gürpınar",
    "İpekyolu",
    "Merkez",
    "Muradiye",
    "Özalp",
    "Saray",
    "Tuşba",
  ],
  Yalova: ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"],
  Yozgat: [
    "Akdağmadeni",
    "Aydıncık",
    "Boğazlıyan",
    "Çandır",
    "Çayıralan",
    "Çekerek",
    "Kadışehri",
    "Merkez",
    "Saraykent",
    "Sarıkaya",
    "Şefaatli",
    "Sorgun",
    "Yenifakılı",
    "Yerköy",
  ],
  Zonguldak: [
    "Alaplı",
    "Çaycuma",
    "Devrek",
    "Ereğli",
    "Gökçebey",
    "Kilimli",
    "Kozlu",
    "Merkez",
  ],
};

const IL_LISTESI = Object.keys(ILLER).sort();

// Şifre güç göstergesi
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getStrength();
  const labels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
  const colors = ["", Colors.red, Colors.yellow, "#84cc16", Colors.green];
  if (password.length === 0) return null;
  return (
    <View style={{ marginTop: 6, marginBottom: 4 }}>
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= strength ? colors[strength] : Colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors[strength] }}>
        {labels[strength]}
      </Text>
    </View>
  );
};

// Adım göstergesi
const StepBar = ({ step, total }: { step: number; total: number }) => (
  <View
    style={{
      flexDirection: "row",
      gap: 6,
      paddingHorizontal: 24,
      marginBottom: 8,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{
          flex: 1,
          height: 3,
          borderRadius: 2,
          backgroundColor: i < step ? Colors.accent : Colors.border,
        }}
      />
    ))}
  </View>
);
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  error,
  autoCapitalize,
  rightElement,
}: any) => (
  <View style={styles.inputWrap}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputRow, error && styles.inputError]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.text3}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
      />
      {rightElement}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [accountType, setAccountType] = useState<"bireysel" | "kurumsal">(
    "bireysel",
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    taxNumber: "",
    taxOffice: "",
    il: "",
    ilce: "",
    adres: "",
    password: "",
    passwordConfirm: "",
  });
  const [kvkk, setKvkk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [ilDropdown, setIlDropdown] = useState(false);
  const [ilceDropdown, setIlceDropdown] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const clearError = (key: string) =>
    setErrors((prev) => {
      const e = { ...prev };
      delete e[key];
      return e;
    });

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      // hesap tipi seçimi, her zaman geçerli
    }
    if (s === 2) {
      if (!form.firstName) e.firstName = "Ad zorunlu";
      if (!form.lastName) e.lastName = "Soyad zorunlu";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Geçerli e-posta girin";
      if (!form.phone) e.phone = "Telefon zorunlu";
      if (accountType === "kurumsal") {
        if (!form.companyName) e.companyName = "Firma adı zorunlu";
        if (!form.taxNumber) e.taxNumber = "Vergi numarası zorunlu";
        if (!form.taxOffice) e.taxOffice = "Vergi dairesi zorunlu";
      }
    }
    if (s === 3) {
      if (!form.il) e.il = "İl seçiniz";
      if (!form.ilce) e.ilce = "İlçe seçiniz";
      if (!form.adres) e.adres = "Adres zorunlu";
    }
    if (s === 4) {
      if (form.password.length < 8) e.password = "En az 8 karakter";
      if (form.password !== form.passwordConfirm)
        e.passwordConfirm = "Şifreler eşleşmiyor";
      if (!kvkk) e.kvkk = "Koşulları kabul etmeniz gerekiyor";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const prevStep = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleRegister = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        accountType,
        companyName: form.companyName,
        taxNumber: form.taxNumber,
        taxOffice: form.taxOffice,
        billing: {
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          address_1: form.adres,
          city: form.il,
          state: form.ilce,
          postcode: "",
          country: "TR",
        },
      });
      navigation.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Kayıt Başarısız", err?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const ilceler = form.il ? ILLER[form.il] || [] : [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={step === 1 ? () => navigation.goBack() : prevStep}
        >
          <Text style={styles.backText}>← Geri</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.stepLabel}>Adım {step} / 4</Text>
          <Text style={styles.title}>
            {step === 1 && "Hesap Tipi"}
            {step === 2 && "Bilgilerini Gir"}
            {step === 3 && "Teslimat Adresi"}
            {step === 4 && "Şifre Belirle"}
          </Text>
        </View>
      </View>

      <StepBar step={step} total={4} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ADIM 1: Hesap tipi */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>
              Nasıl bir hesap oluşturmak istiyorsun?
            </Text>
            <TouchableOpacity
              style={[
                styles.typeCard,
                accountType === "bireysel" && styles.typeCardActive,
              ]}
              onPress={() => setAccountType("bireysel")}
              activeOpacity={0.85}
            >
              <Text style={styles.typeIcon}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Bireysel</Text>
                <Text style={styles.typeSub}>
                  Kişisel kullanım ve hobi projeleri
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  accountType === "bireysel" && styles.radioActive,
                ]}
              >
                {accountType === "bireysel" && (
                  <Text style={styles.radioCheck}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeCard,
                accountType === "kurumsal" && styles.typeCardActive,
              ]}
              onPress={() => setAccountType("kurumsal")}
              activeOpacity={0.85}
            >
              <Text style={styles.typeIcon}>🏢</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.typeTitle}>Kurumsal</Text>
                <Text style={styles.typeSub}>
                  Şirket ve ticari projeler için
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  accountType === "kurumsal" && styles.radioActive,
                ]}
              >
                {accountType === "kurumsal" && (
                  <Text style={styles.radioCheck}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ADIM 2: Kişisel bilgiler */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>
              {accountType === "kurumsal"
                ? "Firma ve yetkili bilgileri"
                : "Kişisel bilgilerini gir"}
            </Text>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="AD"
                  placeholder="Adın"
                  value={form.firstName}
                  onChangeText={(v: string) => {
                    set("firstName", v);
                    clearError("firstName");
                  }}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <InputField
                  label="SOYAD"
                  placeholder="Soyadın"
                  value={form.lastName}
                  onChangeText={(v: string) => {
                    set("lastName", v);
                    clearError("lastName");
                  }}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>
            <InputField
              label="E-POSTA"
              placeholder="ornek@email.com"
              value={form.email}
              onChangeText={(v: string) => {
                set("email", v);
                clearError("email");
              }}
              keyboardType="email-address"
              error={errors.email}
            />
            <InputField
              label="TELEFON"
              placeholder="05XX XXX XX XX"
              value={form.phone}
              onChangeText={(v: string) => {
                set("phone", v);
                clearError("phone");
              }}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            {accountType === "kurumsal" && (
              <>
                <InputField
                  label="FİRMA ADI"
                  placeholder="Firma Adı A.Ş."
                  value={form.companyName}
                  onChangeText={(v: string) => {
                    set("companyName", v);
                    clearError("companyName");
                  }}
                  autoCapitalize="words"
                  error={errors.companyName}
                />
                <InputField
                  label="VERGİ NUMARASI"
                  placeholder="1234567890"
                  value={form.taxNumber}
                  onChangeText={(v: string) => {
                    set("taxNumber", v);
                    clearError("taxNumber");
                  }}
                  keyboardType="numeric"
                  error={errors.taxNumber}
                />
                <InputField
                  label="VERGİ DAİRESİ"
                  placeholder="Kadıköy Vergi Dairesi"
                  value={form.taxOffice}
                  onChangeText={(v: string) => {
                    set("taxOffice", v);
                    clearError("taxOffice");
                  }}
                  autoCapitalize="words"
                  error={errors.taxOffice}
                />
              </>
            )}
          </View>
        )}

        {/* ADIM 3: Adres */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>
              Teslimat adresin sipariş sırasında otomatik kullanılacak.
            </Text>

            {/* İl seçimi */}
            <View style={styles.inputWrap}>
              <Text style={styles.label}>İL</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.il && styles.inputError]}
                onPress={() => {
                  setIlDropdown(!ilDropdown);
                  setIlceDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.input,
                    { color: form.il ? Colors.text : Colors.text3 },
                  ]}
                >
                  {form.il || "İl seçiniz"}
                </Text>
                <Text style={{ color: Colors.text3, paddingRight: 14 }}>▾</Text>
              </TouchableOpacity>
              {errors.il && <Text style={styles.errorText}>{errors.il}</Text>}
              {ilDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {IL_LISTESI.map((il) => (
                      <TouchableOpacity
                        key={il}
                        style={[
                          styles.dropdownItem,
                          form.il === il && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          set("il", il);
                          set("ilce", "");
                          clearError("il");
                          setIlDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            form.il === il && { color: Colors.accent },
                          ]}
                        >
                          {il}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* İlçe seçimi */}
            {form.il !== "" && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>İLÇE</Text>
                <TouchableOpacity
                  style={[styles.inputRow, errors.ilce && styles.inputError]}
                  onPress={() => {
                    setIlceDropdown(!ilceDropdown);
                    setIlDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.input,
                      { color: form.ilce ? Colors.text : Colors.text3 },
                    ]}
                  >
                    {form.ilce || "İlçe seçiniz"}
                  </Text>
                  <Text style={{ color: Colors.text3, paddingRight: 14 }}>
                    ▾
                  </Text>
                </TouchableOpacity>
                {errors.ilce && (
                  <Text style={styles.errorText}>{errors.ilce}</Text>
                )}
                {ilceDropdown && (
                  <View style={styles.dropdown}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {ilceler.map((ilce) => (
                        <TouchableOpacity
                          key={ilce}
                          style={[
                            styles.dropdownItem,
                            form.ilce === ilce && styles.dropdownItemActive,
                          ]}
                          onPress={() => {
                            set("ilce", ilce);
                            clearError("ilce");
                            setIlceDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownText,
                              form.ilce === ilce && { color: Colors.accent },
                            ]}
                          >
                            {ilce}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Açık adres */}
            <View style={styles.inputWrap}>
              <Text style={styles.label}>AÇIK ADRES</Text>
              <View
                style={[
                  styles.inputRow,
                  { alignItems: "flex-start" },
                  errors.adres && styles.inputError,
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { minHeight: 80, textAlignVertical: "top", paddingTop: 14 },
                  ]}
                  placeholder="Mahalle, sokak, bina no, daire..."
                  placeholderTextColor={Colors.text3}
                  value={form.adres}
                  onChangeText={(v) => {
                    set("adres", v);
                    clearError("adres");
                  }}
                  multiline
                  numberOfLines={3}
                  autoCapitalize="sentences"
                />
              </View>
              {errors.adres && (
                <Text style={styles.errorText}>{errors.adres}</Text>
              )}
            </View>
          </View>
        )}

        {/* ADIM 4: Şifre */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDesc}>Güvenli bir şifre belirle.</Text>
            <InputField
              label="ŞİFRE"
              placeholder="En az 8 karakter"
              value={form.password}
              onChangeText={(v: string) => {
                set("password", v);
                clearError("password");
              }}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>
                    {showPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              }
            />
            <PasswordStrength password={form.password} />
            <InputField
              label="ŞİFRE TEKRAR"
              placeholder="Şifreni tekrar gir"
              value={form.passwordConfirm}
              onChangeText={(v: string) => {
                set("passwordConfirm", v);
                clearError("passwordConfirm");
              }}
              secureTextEntry={!showPasswordConfirm}
              error={errors.passwordConfirm}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>
                    {showPasswordConfirm ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              }
            />

            {/* KVKK */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => {
                setKvkk(!kvkk);
                clearError("kvkk");
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, kvkk && styles.checkboxOn]}>
                {kvkk && (
                  <Text
                    style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                )}
              </View>
              <Text style={styles.checkLabel}>
                <Text style={{ color: Colors.accent }}>Kullanım Koşulları</Text>{" "}
                ve{" "}
                <Text style={{ color: Colors.accent }}>
                  KVKK Aydınlatma Metni
                </Text>
                {"'ni okudum, kabul ediyorum."}
              </Text>
            </TouchableOpacity>
            {errors.kvkk && <Text style={styles.errorText}>{errors.kvkk}</Text>}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Alt buton */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, loading && { opacity: 0.7 }]}
          onPress={step === 4 ? handleRegister : nextStep}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {loading
              ? "Kayıt yapılıyor..."
              : step === 4
                ? "Kayıt Ol"
                : "Devam Et →"}
          </Text>
        </TouchableOpacity>

        {step === 1 && (
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { paddingRight: 4 },
  backText: { fontSize: 14, color: Colors.text2 },
  stepLabel: { fontSize: 11, color: Colors.text3, marginBottom: 2 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scroll: { paddingBottom: 20 },
  stepContent: { paddingHorizontal: 24, paddingTop: 16 },
  stepDesc: {
    fontSize: 13,
    color: Colors.text2,
    marginBottom: 20,
    lineHeight: 20,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  typeCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "12",
  },
  typeIcon: { fontSize: 28 },
  typeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  typeSub: { fontSize: 12, color: Colors.text2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  radioCheck: { color: "#fff", fontSize: 11, fontWeight: "700" },
  nameRow: { flexDirection: "row" },
  inputWrap: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text3,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
  },
  inputError: { borderColor: Colors.red },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
  },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 16 },
  errorText: { fontSize: 11, color: Colors.red, marginTop: 4, marginLeft: 2 },
  dropdown: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginTop: 4,
    zIndex: 100,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: Colors.accent + "15" },
  dropdownText: { fontSize: 14, color: Colors.text },
  checkRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkLabel: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  footerText: { fontSize: 13, color: Colors.text2 },
  footerLink: { fontSize: 13, color: Colors.accent, fontWeight: "600" },
});

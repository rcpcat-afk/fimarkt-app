// ─── Profil & Müşteri Komuta Merkezi ─────────────────────────────────────────
// Üst bölüm: Dashboard (BentoStats, LiveTracker, SmartReminders) — mock data
// Alt bölüm: Hesap ayarları ve navigasyon — gerçek API datası
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";
import { useTheme } from "../../hooks/useTheme";
import { MOCK_DASHBOARD } from "../../lib/mock-data/dashboard";
import {
  getMyCustomer,
  getMyOrders,
  WCOrder,
} from "../../src/services/api";
import { useAuth } from "../../src/store/AuthContext";

// ─── Rol kontrol yardımcıları ─────────────────────────────────────────────────
const SELLER_ROLES   = ["corporate_seller", "individual_seller", "sanatkat_digital", "sanatkat_physical"];
const ENGINEER_ROLES = ["fidrop_engineer", "rfq_designer"];
const isSellerRole   = (r: string) => SELLER_ROLES.includes(r);
const isEngineerRole = (r: string) => ENGINEER_ROLES.includes(r);

// ─── SettingRow ───────────────────────────────────────────────────────────────
interface SettingRowProps {
  icon:           string;
  label:          string;
  value?:         string;
  onPress?:       () => void;
  isSwitch?:      boolean;
  switchValue?:   boolean;
  onSwitchChange?:(val: boolean) => void;
  danger?:        boolean;
}

const SettingRow = ({
  icon, label, value, onPress,
  isSwitch, switchValue, onSwitchChange, danger,
}: SettingRowProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Switch varsa dokunmayı kesmemek için View kullan
  const Wrapper = isSwitch ? View : TouchableOpacity;
  return (
    <Wrapper style={styles.settingRow} {...(!isSwitch && { onPress })}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      <View style={styles.settingRight}>
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Text style={[styles.settingArrow, danger && { color: colors.error }]}>›</Text>
          </>
        )}
      </View>
    </Wrapper>
  );
};

// ─── LiveTracker (App) ────────────────────────────────────────────────────────
const LiveTracker = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { liveOrder } = MOCK_DASHBOARD;
  return (
    <View style={styles.trackerCard}>
      {/* Sol turuncu şerit */}
      <View style={styles.trackerStripe} />

      {/* Başlık */}
      <View style={styles.trackerHeader}>
        <View style={styles.trackerPulseWrap}>
          <View style={styles.trackerPulseDot} />
        </View>
        <Text style={styles.trackerTitle}>Canlı Üretim Takibi</Text>
        <Text style={styles.trackerOrderId}>#{liveOrder.id}</Text>
      </View>

      {/* Ürün adı */}
      <Text style={styles.trackerProduct} numberOfLines={1}>
        {liveOrder.productName}
      </Text>

      {/* Stepper */}
      <View style={styles.stepperRow}>
        {liveOrder.steps.map((step, i) => {
          const isDone   = i < liveOrder.currentStep;
          const isActive = i === liveOrder.currentStep;
          return (
            <React.Fragment key={i}>
              {/* Step node */}
              <View style={styles.stepNode}>
                <View
                  style={[
                    styles.stepCircle,
                    isDone   && styles.stepCircleDone,
                    isActive && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      (isDone || isActive) && { color: "#fff" },
                    ]}
                  >
                    {isDone ? "✓" : i + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isDone   && { color: colors.success },
                    isActive && { color: colors.accent },
                  ]}
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
                <Text style={styles.stepDate}>{step.date ?? "—"}</Text>
              </View>

              {/* Bağlantı çizgisi */}
              {i < liveOrder.steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isDone && { backgroundColor: colors.success },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Alt bilgi: teslimat */}
      <View style={styles.trackerFooter}>
        <View>
          <Text style={styles.trackerDeliveryLabel}>Tahmini Teslimat</Text>
          <Text style={styles.trackerDeliveryDate}>{liveOrder.estimatedDelivery}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── BentoStats (App) ─────────────────────────────────────────────────────────
const BENTO_ITEMS = [
  { key: "activeOrders",  label: "Aktif Sipariş",  icon: "📦", color: Colors.accent },
  { key: "pendingQuotes", label: "Bekleyen Teklif", icon: "📋", color: Colors.yellow },
  { key: "favorites",     label: "Favorilerim",     icon: "❤️", color: "#e879f9"     },
  { key: "walletBalance", label: "Cüzdanım",        icon: "💰", color: Colors.green  },
] as const;

const BentoStats = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { stats } = MOCK_DASHBOARD;
  return (
    <View style={styles.bentoGrid}>
      {BENTO_ITEMS.map((item) => {
        const value = stats[item.key as keyof typeof stats];
        const display =
          item.key === "walletBalance" ? `${value} ₺` : String(value);
        return (
          <View
            key={item.key}
            style={[styles.bentoCard, { borderColor: colors.border }]}
          >
            <View
              style={[
                styles.bentoIcon,
                { backgroundColor: item.color + "18" },
              ]}
            >
              <Text style={styles.bentoIconText}>{item.icon}</Text>
            </View>
            <Text style={[styles.bentoValue, { color: item.color }]}>
              {display}
            </Text>
            <Text style={styles.bentoLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── SmartReminders (App) ────────────────────────────────────────────────────
const SmartReminders = ({ onCartPress }: { onCartPress: () => void }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cartItemCount, cartTotal, recentlyViewed } = MOCK_DASHBOARD;
  return (
    <View style={styles.section}>
      {/* Sepet hatırlatıcısı */}
      {cartItemCount > 0 && (
        <TouchableOpacity style={styles.cartReminder} onPress={onCartPress} activeOpacity={0.8}>
          <View style={styles.cartReminderIcon}>
            <Text style={{ fontSize: 20 }}>🛒</Text>
          </View>
          <View style={styles.cartReminderInfo}>
            <Text style={styles.cartReminderTitle}>Sepetinde {cartItemCount} ürün var</Text>
            <Text style={styles.cartReminderSub}>{cartTotal} ₺ tutarında</Text>
          </View>
          <View style={styles.cartReminderBtn}>
            <Text style={styles.cartReminderBtnText}>Devam →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Son incelenenler */}
      <Text style={styles.sectionTitle}>Son İncelenenler</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {recentlyViewed.map((p) => (
          <View key={p.id} style={styles.recentCard}>
            <Text style={{ fontSize: 22, marginBottom: 6 }}>{p.emoji}</Text>
            <Text style={styles.recentName} numberOfLines={2}>{p.name}</Text>
            <Text style={styles.recentPrice}>{p.price}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router       = useRouter();
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [orders, setOrders]               = useState<WCOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [displayName, setDisplayName]     = useState(user?.name || "");
  const [isKurumsal, setIsKurumsal]       = useState(false);
  const [companyName, setCompanyName]     = useState("");
  const [partnerRole, setPartnerRole]     = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("fimarkt_token");
      if (!token) return;
      const role = await AsyncStorage.getItem("fimarkt_partner_role");
      if (role) setPartnerRole(role);
      const [data, customer] = await Promise.all([
        getMyOrders(token),
        getMyCustomer(token),
      ]);
      setOrders(data);
      if (customer) {
        const company = customer.billing?.company;
        if (company) {
          setIsKurumsal(true);
          setCompanyName(company);
          setDisplayName(`${customer.first_name} ${customer.last_name}`.trim());
        } else if (customer.first_name) {
          setDisplayName(`${customer.first_name} ${customer.last_name}`.trim());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const orderCounts = {
    processing: orders.filter((o) => o.status === "processing" || o.status === "on-hold").length,
    shipped:    orders.filter((o) => o.status === "shipped" || o.status === "hezarfen-shipped").length,
    completed:  orders.filter((o) => o.status === "completed").length,
    cancelled:  orders.filter((o) => o.status === "cancelled").length,
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap", style: "destructive",
        onPress: async () => { await logout(); router.replace("/onboarding"); },
      },
    ]);
  };

  const name       = displayName || user?.name || "Kullanıcı";
  const nameSource = isKurumsal && companyName ? companyName : name;
  const initials   = nameSource
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
      >

        {/* ── Sayfa başlığı ── */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Komuta Merkezim</Text>
        </View>

        {/* ══ 1. WELCOME BOARD ══════════════════════════════════════════════ */}
        <View style={styles.welcomeCard}>
          {/* Sol: Selamlama + Rozet */}
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeGreeting}>Hoş Geldin 👋</Text>
            <Text style={styles.welcomeName} numberOfLines={1}>
              {isKurumsal && companyName ? companyName : name}
            </Text>
            {isKurumsal && companyName && (
              <Text style={styles.welcomeSub}>{displayName}</Text>
            )}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>✦ Bireysel Üye</Text>
            </View>
          </View>

          {/* Sağ: Avatar + Düzenle */}
          <View style={styles.welcomeRight}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/personal-info")}
            >
              <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ 1b. PARTNER PANELİ GEÇİŞ (sadece partner rolleri) ══════════ */}
        {partnerRole && (isSellerRole(partnerRole) || isEngineerRole(partnerRole)) && (
          <View style={[styles.section, { marginTop: 0, marginBottom: 16 }]}>
            {isSellerRole(partnerRole) && (
              <TouchableOpacity
                style={styles.panelBtn}
                onPress={() => router.push("/(seller)/dashboard" as never)}
                activeOpacity={0.8}
              >
                <View style={[styles.panelBtnIcon, { backgroundColor: "#ff6b2b" }]}>
                  <Text style={{ fontSize: 16 }}>🏪</Text>
                </View>
                <View style={styles.panelBtnText}>
                  <Text style={styles.panelBtnTitle}>Satıcı Paneline Geç</Text>
                  <Text style={styles.panelBtnSub}>Ürün ve sipariş yönetimi</Text>
                </View>
                <Text style={styles.panelBtnArrow}>→</Text>
              </TouchableOpacity>
            )}
            {isEngineerRole(partnerRole) && (
              <TouchableOpacity
                style={[styles.panelBtn, styles.panelBtnEngineer]}
                onPress={() => router.push("/(engineer)/jobs" as never)}
                activeOpacity={0.8}
              >
                <View style={[styles.panelBtnIcon, { backgroundColor: "#6366f1" }]}>
                  <Text style={{ fontSize: 16 }}>🔧</Text>
                </View>
                <View style={styles.panelBtnText}>
                  <Text style={styles.panelBtnTitle}>İş Masasına Geç</Text>
                  <Text style={styles.panelBtnSub}>Teklifler ve iş havuzu</Text>
                </View>
                <Text style={styles.panelBtnArrow}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ══ 2. BENTO STATS ════════════════════════════════════════════════ */}
        <BentoStats />

        {/* ══ 3. LIVE TRACKER ═══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canlı Sipariş Takibi</Text>
          <LiveTracker />
        </View>

        {/* ══ 4. SMART REMINDERS ════════════════════════════════════════════ */}
        <SmartReminders onCartPress={() => router.push("/(account)/cart" as never)} />

        {/* ══ 5. HIZLI NAVİGASYON ═══════════════════════════════════════════ */}
        <View style={styles.quickRow}>
          {[
            { icon: "📦", label: "Siparişler",  onPress: () => router.push("/(tabs)/orders") },
            { icon: "❤️", label: "Favoriler",   onPress: () => router.push("/favorites")     },
            { icon: "📍", label: "Adresler",    onPress: () => router.push("/addresses")     },
            { icon: "💳", label: "Ödeme",       onPress: () => router.push("/payment-methods") },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickItem} onPress={item.onPress}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══ 6. SİPARİŞLERİM (gerçek API) ════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Siparişlerim</Text>
          <View style={styles.orderStatus}>
            {ordersLoading ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              [
                { icon: "⏳", label: "Hazırlanıyor", count: orderCounts.processing },
                { icon: "🚚", label: "Kargoda",       count: orderCounts.shipped   },
                { icon: "✅", label: "Teslim",        count: orderCounts.completed },
                { icon: "❌", label: "İptal",         count: orderCounts.cancelled },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.orderStatusItem}
                  onPress={() => router.push("/(tabs)/orders")}
                >
                  <Text style={styles.orderStatusIcon}>{item.icon}</Text>
                  <Text style={styles.orderStatusCount}>{item.count}</Text>
                  <Text style={styles.orderStatusLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* ══ 7. AR-GE & TASARIM TEKLİFLERİ ═══════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ar-Ge & Tasarım Teklifleri</Text>
            <TouchableOpacity onPress={() => router.push("/(account)/tekliflerim" as never)}>
              <Text style={styles.sectionLink}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.teklifCard}
            onPress={() => router.push("/(account)/teklif/rfq-2024-001" as never)}
            activeOpacity={0.8}
          >
            <View style={styles.teklifLeft}>
              <View style={styles.teklifIconWrap}>
                <Text style={{ fontSize: 18 }}>📋</Text>
              </View>
              <View style={styles.teklifInfo}>
                <Text style={styles.teklifTitle} numberOfLines={1}>
                  Kırık Dişli Mili — Yedek Parça
                </Text>
                <Text style={styles.teklifSub}>Ali Yılmaz · Teklif Bekleniyor</Text>
              </View>
            </View>
            <View style={styles.teklifBadge}>
              <Text style={styles.teklifBadgeText}>• Aktif</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ══ 7b. TEMA ══════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          <View style={styles.settingCard}>
            <SettingRow
              icon={isDark ? "🌙" : "☀️"}
              label="Karanlık Mod"
              isSwitch
              switchValue={isDark}
              onSwitchChange={toggleTheme}
            />
          </View>
        </View>

        {/* ══ 8. BİLDİRİMLER ════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingCard}>
            <SettingRow icon="🔔" label="Bildirim Tercihleri" onPress={() => router.push("/(account)/notifications" as never)} />
          </View>
        </View>

        {/* ══ 9. DİJİTAL İÇERİKLERİM ══════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dijital İçeriklerim</Text>
          <View style={styles.settingCard}>
            <SettingRow icon="📚" label="Dijital Kütüphanem" onPress={() => router.push("/(account)/library" as never)} />
            <SettingRow icon="❤️" label="Favorilerim"        onPress={() => router.push("/(account)/favorites" as never)} />
          </View>
        </View>

        {/* ══ 10. HESAP ═════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.settingCard}>
            <SettingRow icon="👤" label="Kişisel Bilgiler"    onPress={() => router.push("/personal-info")}    />
            <SettingRow icon="🔒" label="Şifre Değiştir"      onPress={() => router.push("/forgot-password")}  />
            <SettingRow icon="📍" label="Adreslerim"          onPress={() => router.push("/addresses")}        />
            <SettingRow icon="💳" label="Ödeme Yöntemlerim"   onPress={() => router.push("/payment-methods")}  />
            {!partnerRole && (
              <SettingRow
                icon="🚀"
                label="Çözüm Ortağı Ol"
                onPress={() => router.push("/(seller)/onboarding" as never)}
              />
            )}
          </View>
        </View>

        {/* ══ 10. YARDIM & HUKUKİ ══════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yardım & Hukuki</Text>
          <View style={styles.settingCard}>
            <SettingRow icon="🏭" label="Hakkımızda"         onPress={() => router.push("/(info)/hakkimizda" as any)}          />
            <SettingRow icon="❓" label="SSS"                onPress={() => router.push("/(info)/sss" as any)}                 />
            <SettingRow icon="📧" label="İletişim"           onPress={() => router.push("/(info)/iletisim" as any)}            />
            <SettingRow icon="📄" label="Gizlilik Politikası" onPress={() => router.push("/(info)/gizlilik" as any)}           />
            <SettingRow icon="📋" label="Kullanım Koşulları" onPress={() => router.push("/(info)/kullanim-kosullari" as any)}  />
            <SettingRow icon="🔐" label="KVKK"               onPress={() => router.push("/(info)/kvkk" as any)}               />
            <SettingRow icon="ℹ️" label="Versiyon"           value="1.0.0" />
          </View>
        </View>

        {/* ══ 11. ÇIKIŞ ════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <SettingRow icon="🚪" label="Çıkış Yap" onPress={handleLogout} danger />
          </View>
        </View>


        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

// ─── StyleSheet Factory ───────────────────────────────────────────────────────
// Tema tokenlarıyla çalışır; useMemo ile component içinde çağrılır.
function createStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container:    { flex: 1, backgroundColor: C.background },

    pageHeader:   { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
    pageTitle:    { fontSize: 22, fontWeight: "800", color: C.foreground, letterSpacing: -0.5 },

    welcomeCard: {
      flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
      marginHorizontal: 20, marginBottom: 16,
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, padding: 16, gap: 12,
    },
    welcomeLeft:    { flex: 1 },
    welcomeGreeting:{ fontSize: 11, color: C.mutedForeground, marginBottom: 2 },
    welcomeName:    { fontSize: 17, fontWeight: "800", color: C.foreground, letterSpacing: -0.3 },
    welcomeSub:     { fontSize: 12, color: C.mutedForeground, marginTop: 1 },
    roleBadge: {
      marginTop: 8, alignSelf: "flex-start",
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
      backgroundColor: C.accent + "15", borderWidth: 1, borderColor: C.accent + "30",
    },
    roleBadgeText:  { fontSize: 10, fontWeight: "800", color: C.accent },
    welcomeRight:   { alignItems: "center", gap: 8 },
    avatar: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: C.accent, alignItems: "center", justifyContent: "center",
    },
    avatarText:  { fontSize: 18, fontWeight: "800", color: "#fff" },
    editBtn: {
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
      borderWidth: 1, borderColor: C.border,
    },
    editBtnText: { fontSize: 11, color: C.mutedForeground },

    bentoGrid: {
      flexDirection: "row", flexWrap: "wrap",
      marginHorizontal: 20, marginBottom: 16, gap: 10,
    },
    bentoCard: {
      width: "47%", backgroundColor: C.surface2,
      borderWidth: 1, borderRadius: 18, padding: 14, gap: 6,
    },
    bentoIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    bentoIconText: { fontSize: 18 },
    bentoValue:    { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
    bentoLabel:    { fontSize: 10, color: C.mutedForeground, fontWeight: "500" },

    trackerCard: {
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, padding: 16, overflow: "hidden", position: "relative",
    },
    trackerStripe: {
      position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
      backgroundColor: C.accent, borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
    },
    trackerHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, paddingLeft: 8 },
    trackerPulseWrap: { width: 10, height: 10, alignItems: "center", justifyContent: "center" },
    trackerPulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },
    trackerTitle:   { fontSize: 10, fontWeight: "700", color: C.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, flex: 1 },
    trackerOrderId: { fontSize: 9, color: C.subtleForeground, fontFamily: "monospace" },
    trackerProduct: { fontSize: 13, fontWeight: "700", color: C.foreground, marginBottom: 16, paddingLeft: 8 },

    stepperRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 4 },
    stepNode:   { flex: 1, alignItems: "center" },
    stepCircle: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: C.surface, borderWidth: 2, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    stepCircleDone:   { backgroundColor: "#22c55e", borderColor: "#22c55e" },
    stepCircleActive: { backgroundColor: C.accent, borderColor: C.accent },
    stepCircleText:   { fontSize: 11, fontWeight: "800", color: C.subtleForeground },
    stepLabel: {
      fontSize: 9, fontWeight: "700", color: C.mutedForeground,
      textAlign: "center", marginTop: 5, paddingHorizontal: 2,
    },
    stepDate: { fontSize: 8, color: C.subtleForeground, textAlign: "center", marginTop: 1 },
    stepLine: { flex: 1, height: 2, backgroundColor: C.border, marginTop: 15 },

    trackerFooter: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, paddingLeft: 8,
    },
    trackerDeliveryLabel: { fontSize: 9, color: C.subtleForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    trackerDeliveryDate:  { fontSize: 13, fontWeight: "700", color: C.foreground, marginTop: 1 },

    cartReminder: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: C.accent + "0f", borderWidth: 1, borderColor: C.accent + "30",
      borderRadius: 16, padding: 14, marginBottom: 14,
    },
    cartReminderIcon: {
      width: 42, height: 42, borderRadius: 12, backgroundColor: C.accent + "20",
      alignItems: "center", justifyContent: "center",
    },
    cartReminderInfo:    { flex: 1 },
    cartReminderTitle:   { fontSize: 12, fontWeight: "700", color: C.foreground },
    cartReminderSub:     { fontSize: 10, color: C.mutedForeground, marginTop: 1 },
    cartReminderBtn:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: C.accent },
    cartReminderBtnText: { fontSize: 10, fontWeight: "800", color: "#fff" },

    recentCard: {
      width: 96, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 14, padding: 10,
    },
    recentName:  { fontSize: 10, fontWeight: "600", color: C.foreground, lineHeight: 14, marginBottom: 4 },
    recentPrice: { fontSize: 10, fontWeight: "800", color: C.accent },

    quickRow:  { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 16 },
    quickItem: {
      flex: 1, alignItems: "center", backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, marginHorizontal: 4,
    },
    quickIcon:  { fontSize: 22, marginBottom: 6 },
    quickLabel: { fontSize: 10, color: C.mutedForeground, fontWeight: "500" },

    section:       { marginHorizontal: 20, marginBottom: 14 },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    sectionLink:   { fontSize: 11, fontWeight: "700", color: C.accent },
    sectionTitle:  { fontSize: 11, fontWeight: "700", color: C.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },

    orderStatus: {
      flexDirection: "row", backgroundColor: C.surface2, borderWidth: 1,
      borderColor: C.border, borderRadius: 16, padding: 16,
      minHeight: 80, alignItems: "center", justifyContent: "center",
    },
    orderStatusItem:  { flex: 1, alignItems: "center", gap: 4 },
    orderStatusIcon:  { fontSize: 20 },
    orderStatusCount: { fontSize: 16, fontWeight: "800", color: C.foreground },
    orderStatusLabel: { fontSize: 9, color: C.mutedForeground, textAlign: "center" },

    teklifCard: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 16, padding: 14, gap: 10,
    },
    teklifLeft:     { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    teklifIconWrap: {
      width: 40, height: 40, borderRadius: 12,
      backgroundColor: C.accent + "18", borderWidth: 1, borderColor: C.accent + "30",
      alignItems: "center", justifyContent: "center",
    },
    teklifInfo:     { flex: 1 },
    teklifTitle:    { fontSize: 13, fontWeight: "700", color: C.foreground },
    teklifSub:      { fontSize: 11, color: C.mutedForeground, marginTop: 2 },
    teklifBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, backgroundColor: C.accent + "15", borderWidth: 1, borderColor: C.accent + "30" },
    teklifBadgeText:{ fontSize: 10, fontWeight: "800", color: C.accent },

    panelBtn: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: C.accent + "10", borderWidth: 1, borderColor: C.accent + "30",
      borderRadius: 16, padding: 14, marginBottom: 10,
    },
    panelBtnEngineer: { backgroundColor: "#6366f110", borderColor: "#6366f130" },
    panelBtnIcon:  { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    panelBtnText:  { flex: 1 },
    panelBtnTitle: { fontSize: 14, fontWeight: "800", color: C.foreground },
    panelBtnSub:   { fontSize: 11, color: C.mutedForeground, marginTop: 1 },
    panelBtnArrow: { fontSize: 18, color: C.subtleForeground },

    settingCard: {
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 16, overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row", alignItems: "center",
      padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    settingIcon:  { fontSize: 18, width: 28, textAlign: "center" },
    settingLabel: { flex: 1, fontSize: 14, color: C.foreground },
    settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    settingValue: { fontSize: 13, color: C.mutedForeground },
    settingArrow: { fontSize: 20, color: C.subtleForeground },
  });
}

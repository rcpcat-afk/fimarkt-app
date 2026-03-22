// ─── Mühendis İş Havuzu — App Lite ───────────────────────────────────────────
// selectedId === null  → Liste (Feed + Tekliflerim tabs)
// selectedId !== null  → İş Detayı + Teklif Formu (tam sayfa)
// useTheme() pattern — B6+ standart
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import {
  OPEN_JOBS,
  MY_BIDS,
  CATEGORY_LABELS,
  type RFQJob,
  type MyBid,
  type JobCategory,
} from "../../lib/mock-data/engineer-jobs";

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

const URGENCY_META = {
  high:   { label: "Acil",   color: "#ef4444" },
  medium: { label: "Normal", color: "#f59e0b" },
  low:    { label: "Esnek",  color: "#22c55e" },
};

type TabKey = "feed" | "quotes";

// ─── İş Kartı ────────────────────────────────────────────────────────────────
function JobCard({
  job,
  colors,
  onPress,
}: {
  job: RFQJob;
  colors: ReturnType<typeof useTheme>["colors"];
  onPress: () => void;
}) {
  const u = URGENCY_META[job.urgency];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        {/* Thumbnail */}
        <View style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          backgroundColor: job.thumbnailBg,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontSize: 22 }}>{job.thumbnailEmoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          {/* Başlık + Aciliyet */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "800", color: colors.text, lineHeight: 18 }}>
              {job.title}
            </Text>
            <View style={{
              paddingHorizontal: 7, paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: u.color + "18",
              borderWidth: 1,
              borderColor: u.color + "40",
            }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: u.color }}>{u.label}</Text>
            </View>
          </View>

          {/* Bütçe + Süre */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "900", color: "#ff6b2b", fontVariant: ["tabular-nums"] }}>
              {fmt(job.budgetMin)}–{fmt(job.budgetMax)}
            </Text>
            <Text style={{ fontSize: 11, color: colors.text2 }}>⏱ {job.deadlineDays} gün</Text>
          </View>

          {/* Müşteri + Teklif sayısı */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: colors.text2 }}>👤 {job.customer.name}</Text>
            <Text style={{ fontSize: 10, color: colors.text3 }}>{job.bidCount} teklif</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Teklif Kartı ─────────────────────────────────────────────────────────────
function BidCard({
  bid,
  colors,
  onGoToChat,
}: {
  bid: MyBid;
  colors: ReturnType<typeof useTheme>["colors"];
  onGoToChat?: () => void;
}) {
  const isWon = bid.bidStatus === "won";
  return (
    <View style={{
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: isWon ? "#22c55e40" : colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    }}>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: bid.thumbnailBg,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontSize: 18 }}>{bid.thumbnailEmoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: "800", color: colors.text, lineHeight: 17 }}>
              {bid.jobTitle}
            </Text>
            <View style={{
              paddingHorizontal: 7, paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: isWon ? "#22c55e18" : "#f59e0b18",
              borderWidth: 1,
              borderColor: isWon ? "#22c55e40" : "#f59e0b40",
            }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: isWon ? "#22c55e" : "#f59e0b" }}>
                {isWon ? "🤝 Kazanıldı" : "⏳ Bekliyor"}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 10, color: colors.text3, marginBottom: 4 }}>
            {CATEGORY_LABELS[bid.category]}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "900", color: colors.text, fontVariant: ["tabular-nums"] }}>
              {fmt(bid.myPrice)}
            </Text>
            <Text style={{ fontSize: 11, color: colors.text2 }}>· {bid.myDays} gün</Text>
          </View>

          {isWon && bid.clientName && (
            <View style={{
              flexDirection: "row", justifyContent: "space-between", alignItems: "center",
              marginTop: 10, paddingTop: 10,
              borderTopWidth: 1, borderTopColor: "#22c55e20",
            }}>
              <Text style={{ fontSize: 11, color: colors.text2 }}>
                Müşteri: <Text style={{ fontWeight: "700", color: colors.text }}>{bid.clientName}</Text>
              </Text>
              {onGoToChat && (
                <TouchableOpacity
                  onPress={onGoToChat}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingHorizontal: 10, paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: "#ff6b2b",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#fff" }}>💬 Sohbete Git</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── İş Detayı + Teklif Formu ─────────────────────────────────────────────────
function JobDetail({
  job,
  colors,
  styles,
  insets,
  onBack,
  onBidSubmit,
}: {
  job: RFQJob;
  colors: ReturnType<typeof useTheme>["colors"];
  styles: ReturnType<typeof buildStyles>;
  insets: { top: number; bottom: number };
  onBack: () => void;
  onBidSubmit: (price: string, days: string, letter: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [price,   setPrice]   = useState(String(job.budgetMin));
  const [days,    setDays]    = useState(String(job.deadlineDays));
  const [letter,  setLetter]  = useState("");
  const u = URGENCY_META[job.urgency];

  const handleSubmit = () => {
    if (!price || !days || letter.trim().length < 20) {
      Alert.alert("Eksik Bilgi", "Fiyat, süre ve en az 20 karakterli ön yazı zorunludur.");
      return;
    }
    onBidSubmit(price, days, letter);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.detailHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ fontSize: 22, color: colors.text2, lineHeight: 28 }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle} numberOfLines={1}>{job.title}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Hero Thumbnail */}
        <View style={[styles.heroThumb, { backgroundColor: job.thumbnailBg }]}>
          <Text style={{ fontSize: 56 }}>{job.thumbnailEmoji}</Text>
        </View>

        <View style={styles.detailPad}>
          {/* Başlık + Aciliyet */}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 16 }}>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: "900", color: colors.text, lineHeight: 24 }}>
              {job.title}
            </Text>
            <View style={{
              paddingHorizontal: 8, paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: u.color + "18",
              borderWidth: 1, borderColor: u.color + "40",
            }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: u.color }}>{u.label}</Text>
            </View>
          </View>

          {/* Bütçe + Süre */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <View style={[styles.metricBox, { flex: 1 }]}>
              <Text style={styles.metricLabel}>Bütçe Beklentisi</Text>
              <Text style={[styles.metricValue, { color: "#ff6b2b" }]}>{fmt(job.budgetMin)}</Text>
              <Text style={styles.metricSub}>– {fmt(job.budgetMax)}</Text>
            </View>
            <View style={[styles.metricBox, { flex: 1 }]}>
              <Text style={styles.metricLabel}>İstenen Süre</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{job.deadlineDays}</Text>
              <Text style={styles.metricSub}>gün</Text>
            </View>
          </View>

          {/* Müşteri */}
          <View style={styles.customerBox}>
            <View style={styles.customerAvatar}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#ff6b2b" }}>{job.customer.initials}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{job.customer.name}</Text>
              <Text style={{ fontSize: 11, color: "#f59e0b" }}>
                {"★".repeat(Math.round(job.customer.rating))} {job.customer.rating} · {job.customer.jobsDone} iş
              </Text>
            </View>
            <Text style={{ marginLeft: "auto", fontSize: 11, color: colors.text3 }}>
              {job.bidCount} teklif
            </Text>
          </View>

          {/* Açıklama */}
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 20 }}>
            {job.description}
          </Text>

          {/* Gereksinimler */}
          <Text style={styles.sectionTitle}>Gereksinimler</Text>
          <View style={{ marginBottom: 20, gap: 8 }}>
            {job.requirements.map((req, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ color: "#ff6b2b", fontSize: 13, marginTop: 1 }}>›</Text>
                <Text style={{ flex: 1, fontSize: 13, color: colors.text, lineHeight: 19 }}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Referans Dosyalar */}
          {job.attachments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Referans Dosyalar</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {job.attachments.map((att, i) => (
                  <View key={i} style={styles.attachChip}>
                    <Text style={{ fontSize: 13 }}>{att.emoji}</Text>
                    <Text style={{ fontSize: 11, color: colors.text2 }}>{att.name}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Teklif Formu ──────────────────────────────────────────────── */}
          {!showForm ? (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              activeOpacity={0.85}
              style={styles.bidBtn}
            >
              <Text style={styles.bidBtnText}>🚀 Teklif Ver</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formBox}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>🚀 Teklif Oluştur</Text>

              {/* Fiyat */}
              <Text style={styles.inputLabel}>Teklifiniz (TL)</Text>
              <View style={styles.inputRow}>
                <Text style={{ fontSize: 14, color: colors.text2, fontWeight: "700", marginRight: 4 }}>₺</Text>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor={colors.text3}
                />
              </View>

              {/* Teslimat Süresi */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Teslimat Süresi (Gün)</Text>
              <TextInput
                style={styles.textInput}
                value={days}
                onChangeText={setDays}
                keyboardType="numeric"
                placeholderTextColor={colors.text3}
              />

              {/* Ön Yazı */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Ön Yazı</Text>
              <TextInput
                style={[styles.textInput, { height: 110, textAlignVertical: "top", paddingTop: 12 }]}
                value={letter}
                onChangeText={setLetter}
                multiline
                placeholder="Deneyiminizi ve yaklaşımınızı anlatın..."
                placeholderTextColor={colors.text3}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={[styles.cancelBtn, { flex: 1 }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text2 }}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.bidBtn, { flex: 1, marginTop: 0 }]}
                >
                  <Text style={styles.bidBtnText}>🚀 Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function EngineerJobsScreen() {
  const { colors }  = useTheme();
  const insets      = useSafeAreaInsets();
  const styles      = useMemo(() => buildStyles(colors), [colors]);

  const [activeTab,   setActiveTab]   = useState<TabKey>("feed");
  const [catFilter,   setCatFilter]   = useState<JobCategory | "all">("all");
  const [selectedJob, setSelectedJob] = useState<RFQJob | null>(null);
  const [jobs,        setJobs]        = useState<RFQJob[]>(OPEN_JOBS);
  const [bids,        setBids]        = useState(MY_BIDS);

  const filteredJobs = catFilter === "all" ? jobs : jobs.filter(j => j.category === catFilter);
  const pendingBids  = bids.filter(b => b.bidStatus === "pending");
  const wonBids      = bids.filter(b => b.bidStatus === "won");

  const handleBidSubmit = (jobId: string, price: string, days: string, letter: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setBids(prev => [{
      jobId:          job.id,
      jobTitle:       job.title,
      category:       job.category,
      thumbnailEmoji: job.thumbnailEmoji,
      thumbnailBg:    job.thumbnailBg,
      bidStatus:      "pending",
      myPrice:        Number(price),
      myDays:         Number(days),
      myCoverLetter:  letter,
      submittedAt:    new Date().toISOString(),
    }, ...prev]);
    setSelectedJob(null);
    Alert.alert("🚀 Teklif Gönderildi", "Müşteri yanıtını bekliyorsunuz. Tekliflerim sekmesinden takip edebilirsiniz.", [
      { text: "Tekliflerime Git", onPress: () => setActiveTab("quotes") },
      { text: "Tamam" },
    ]);
  };

  // Detay görünümü aktifse tam sayfa olarak render et
  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        colors={colors}
        styles={styles}
        insets={insets}
        onBack={() => setSelectedJob(null)}
        onBidSubmit={(price, days, letter) => handleBidSubmit(selectedJob.id, price, days, letter)}
      />
    );
  }

  // ── Liste görünümü ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Başlık */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>İş Havuzu</Text>
        <Text style={styles.pageSub}>Açık taleplere teklif ver</Text>
      </View>

      {/* Tab Çubuğu */}
      <View style={styles.tabBar}>
        {([
          { key: "feed",   label: "Aktif İşler",  count: jobs.length },
          { key: "quotes", label: "Tekliflerim",  count: bids.length },
        ] as { key: TabKey; label: string; count: number }[]).map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View style={[
              styles.tabBadge,
              activeTab === tab.key ? { backgroundColor: "rgba(255,255,255,0.25)" } : {},
            ]}>
              <Text style={[
                styles.tabBadgeText,
                activeTab === tab.key && { color: "#fff" },
              ]}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── FEED ──────────────────────────────────────────────────────────── */}
      {activeTab === "feed" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {/* Kategori Filtreler */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, flexDirection: "row" }}
          >
            {(["all", ...Object.keys(CATEGORY_LABELS)] as (JobCategory | "all")[]).map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCatFilter(cat)}
                style={[
                  styles.catChip,
                  catFilter === cat && { backgroundColor: "#ff6b2b", borderColor: "#ff6b2b" },
                ]}
              >
                <Text style={[
                  styles.catChipText,
                  catFilter === cat && { color: "#fff" },
                ]}>
                  {cat === "all" ? "Tümü" : CATEGORY_LABELS[cat as JobCategory]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* İş listesi */}
          <View style={{ paddingHorizontal: 16 }}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  colors={colors}
                  onPress={() => setSelectedJob(job)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={styles.emptyTitle}>Bu kategoride iş yok</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── TEKLİFLERİM ───────────────────────────────────────────────────── */}
      {activeTab === "quotes" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 24 }}
        >
          {/* Bekleyenler */}
          <View style={styles.kanbanSection}>
            <View style={styles.kanbanHeader}>
              <Text style={{ fontSize: 14 }}>⏳</Text>
              <Text style={styles.kanbanTitle}>Cevap Bekleyenler</Text>
              <View style={[styles.kanbanBadge, { backgroundColor: "#f59e0b20", borderColor: "#f59e0b40" }]}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: "#f59e0b" }}>{pendingBids.length}</Text>
              </View>
            </View>
            {pendingBids.length > 0 ? (
              pendingBids.map(bid => <BidCard key={bid.jobId} bid={bid} colors={colors} />)
            ) : (
              <Text style={styles.emptyKanban}>Bekleyen teklif yok</Text>
            )}
          </View>

          {/* Kazanılanlar */}
          <View style={styles.kanbanSection}>
            <View style={styles.kanbanHeader}>
              <Text style={{ fontSize: 14 }}>🤝</Text>
              <Text style={styles.kanbanTitle}>Kazanılan İşler</Text>
              <View style={[styles.kanbanBadge, { backgroundColor: "#22c55e20", borderColor: "#22c55e40" }]}>
                <Text style={{ fontSize: 10, fontWeight: "800", color: "#22c55e" }}>{wonBids.length}</Text>
              </View>
            </View>
            {wonBids.length > 0 ? (
              wonBids.map(bid => (
                <BidCard
                  key={bid.jobId}
                  bid={bid}
                  colors={colors}
                  onGoToChat={() =>
                    Alert.alert(
                      "💬 Mesajlara Git",
                      `${bid.clientName} ile sohbet Başlık 37 Mesaj Merkezi'nde açılacak.`,
                      [{ text: "Tamam" }]
                    )
                  }
                />
              ))
            ) : (
              <Text style={styles.emptyKanban}>Henüz kazanılan iş yok</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function buildStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: colors.bg },
    pageHeader:  { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
    pageTitle:   { fontSize: 22, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
    pageSub:     { fontSize: 13, color: colors.text2, marginTop: 2 },

    tabBar: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.surface2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 4,
    },
    tabItem:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10 },
    tabItemActive: { backgroundColor: "#ff6b2b" },
    tabLabel:      { fontSize: 12, fontWeight: "700", color: colors.text2 },
    tabLabelActive:{ color: "#fff", fontWeight: "800" },
    tabBadge:      { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.border },
    tabBadgeText:  { fontSize: 10, fontWeight: "800", color: colors.text2 },

    catChip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    catChipText: { fontSize: 11, fontWeight: "700", color: colors.text2 },

    emptyState:  { alignItems: "center", paddingVertical: 48 },
    emptyTitle:  { fontSize: 14, fontWeight: "700", color: colors.text },

    kanbanSection: { marginBottom: 24 },
    kanbanHeader:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    kanbanTitle:   { fontSize: 14, fontWeight: "800", color: colors.text, flex: 1 },
    kanbanBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
    emptyKanban:   { textAlign: "center", color: colors.text3, fontSize: 13, paddingVertical: 20, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border },

    // Detay
    detailHeader: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 16, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    backBtn:      { width: 32, alignItems: "center" },
    detailTitle:  { flex: 1, fontSize: 15, fontWeight: "800", color: colors.text },
    heroThumb:    { width: "100%", height: 140, alignItems: "center", justifyContent: "center" },
    detailPad:    { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: { fontSize: 10, fontWeight: "800", color: colors.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
    metricBox:    { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, alignItems: "center" },
    metricLabel:  { fontSize: 9, fontWeight: "700", color: colors.text3, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
    metricValue:  { fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"] },
    metricSub:    { fontSize: 10, color: colors.text3, marginTop: 2 },
    customerBox:  { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 20 },
    customerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,107,43,0.15)", alignItems: "center", justifyContent: "center" },
    attachChip:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },

    formBox:      { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 8 },
    inputLabel:   { fontSize: 10, fontWeight: "800", color: colors.text2, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
    inputRow:     { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12 },
    textInput:    { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: colors.text, fontWeight: "600" },
    bidBtn:       { backgroundColor: "#ff6b2b", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
    bidBtnText:   { fontSize: 15, fontWeight: "900", color: "#fff" },
    cancelBtn:    { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  });
}

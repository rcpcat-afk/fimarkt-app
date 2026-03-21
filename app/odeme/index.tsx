// ─── Ödeme Wizard — Standalone Stack Screen ───────────────────────────────────
// Expo Router: app/odeme.tsx → tab bar gizlenir (Stack.Screen headerShown:false)
// 3 adım: Adres → Kargo → Ödeme  |  Tüm dijital sepet → doğrudan Ödeme adımı
// Mock Iyzico UI — gerçek API sonraya bırakıldı.

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import { Colors } from "../constants/theme";
import { useCart } from "../src/store/CartContext";

const C = {
  ...Colors.dark,
  // Kısaltma aliasları — diğer ekranlarla uyumluluk
  bg:    Colors.dark.background,
  text:  Colors.dark.foreground,
  text2: Colors.dark.mutedForeground,
  text3: Colors.dark.subtleForeground,
};

// ── Yardımcı ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ── Zod Şemaları ──────────────────────────────────────────────────────────────
const addressSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName:  z.string().min(2, "Soyad en az 2 karakter olmalı"),
  phone:     z.string().regex(/^[0-9]{10,11}$/, "Geçerli telefon giriniz"),
  address:   z.string().min(10, "Adres en az 10 karakter olmalı"),
  district:  z.string().min(2, "İlçe giriniz"),
  city:      z.string().min(2, "Şehir giriniz"),
});

const paymentSchema = z.object({
  email:       z.string().email("Geçerli e-posta giriniz"),
  tcNo:        z.string().regex(/^[0-9]{11}$/, "11 haneli TC giriniz"),
  cardNumber:  z.string().min(19, "Kart numarası eksik"),
  cardHolder:  z.string().min(3, "Kart üzerindeki ismi giriniz"),
  expiry:      z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "AA/YY formatında giriniz"),
  cvv:         z.string().regex(/^[0-9]{3,4}$/, "CVV hatalı"),
  installment: z.number().int().min(1),
  secure3d:    z.boolean(),
  terms:       z.literal(true, { error: "Sözleşmeyi onaylamanız gerekir" }),
  kvkk:        z.literal(true, { error: "KVKK metnini onaylamanız gerekir" }),
});

type AddressData = z.infer<typeof addressSchema>;
type PaymentData = z.infer<typeof paymentSchema>;

// ── Mock Veriler ──────────────────────────────────────────────────────────────
const MOCK_ADDRESSES = [
  {
    id: 1, label: "Ev",
    firstName: "Berat", lastName: "Yılmaz", phone: "05321234567",
    address: "Atatürk Cad. No:42 D:5", district: "Kadıköy", city: "İstanbul",
  },
  {
    id: 2, label: "İş",
    firstName: "Berat", lastName: "Yılmaz", phone: "05329876543",
    address: "Büyükdere Cad. No:201 Kat:8", district: "Beşiktaş", city: "İstanbul",
  },
];

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standart Kargo", desc: "3-5 iş günü",         price: 0,     badge: "Ücretsiz" },
  { id: "express",  label: "Hızlı Kargo",    desc: "1-2 iş günü",         price: 39.99, badge: null },
  { id: "same_day", label: "Aynı Gün",        desc: "Bugün (İstanbul)",    price: 79.99, badge: "Yeni" },
];

const BIN_TABLE: Record<string, { network: string; installments: number[] }> = {
  "4": { network: "Visa",       installments: [1, 2, 3, 6, 9, 12] },
  "5": { network: "Mastercard", installments: [1, 2, 3, 6, 9, 12] },
  "6": { network: "Troy",       installments: [1, 2, 3, 6, 9, 12] },
  "3": { network: "Amex",       installments: [1, 2, 3] },
};

// ── Geri butonu + başlık ──────────────────────────────────────────────────────
function WizardHeader({
  title, onBack,
}: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

// ── StepIndicator ─────────────────────────────────────────────────────────────
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <View style={styles.stepRow}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, i < current && styles.stepDone, i === current && styles.stepActive]}>
              <Text style={[styles.stepNum, (i <= current) && styles.stepNumActive]}>
                {i < current ? "✓" : String(i + 1)}
              </Text>
            </View>
            <Text style={[styles.stepLabel, i === current && styles.stepLabelActive]} numberOfLines={1}>
              {label}
            </Text>
          </View>
          {i < steps.length - 1 && (
            <View style={[styles.stepLine, i < current && styles.stepLineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// ── AddressStep ───────────────────────────────────────────────────────────────
function AddressStep({
  onNext,
  defaultValues,
}: {
  onNext: (data: AddressData) => void;
  defaultValues?: Partial<AddressData>;
}) {
  const [selected, setSelected] = useState<number | null>(MOCK_ADDRESSES[0]?.id ?? null);
  const [mode, setMode] = useState<"saved" | "new">("saved");

  const { register, control, handleSubmit, formState: { errors }, reset } =
    useForm<AddressData>({ resolver: zodResolver(addressSchema), defaultValues });

  function pickSaved(id: number) {
    const addr = MOCK_ADDRESSES.find((a) => a.id === id);
    if (!addr) return;
    setSelected(id);
    reset({
      firstName: addr.firstName, lastName: addr.lastName,
      phone: addr.phone, address: addr.address,
      district: addr.district, city: addr.city,
    });
  }

  void register; // suppress unused warning — we use Controller

  return (
    <View style={{ gap: 16 }}>
      {/* Kayıtlı adresler */}
      <Text style={styles.sectionLabel}>Kayıtlı Adreslerim</Text>
      {MOCK_ADDRESSES.map((addr) => (
        <TouchableOpacity
          key={addr.id}
          onPress={() => { pickSaved(addr.id); setMode("saved"); }}
          style={[styles.addressCard, selected === addr.id && mode === "saved" && styles.addressCardActive]}
        >
          <View style={styles.addressCardRow}>
            <View style={[styles.radioCircle, selected === addr.id && mode === "saved" && styles.radioActive]}>
              {selected === addr.id && mode === "saved" && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <View style={styles.addrLabelBadge}>
                  <Text style={styles.addrLabelText}>{addr.label}</Text>
                </View>
                {selected === addr.id && mode === "saved" && (
                  <Text style={{ fontSize: 11, color: C.accent, fontWeight: "700" }}>✓ Seçildi</Text>
                )}
              </View>
              <Text style={styles.addrName}>{addr.firstName} {addr.lastName}</Text>
              <Text style={styles.addrText}>{addr.address}, {addr.district}/{addr.city}</Text>
              <Text style={styles.addrText}>{addr.phone}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => setMode("new")}>
        <Text style={[styles.newAddrBtn, mode === "new" && { color: C.accent }]}>
          + Yeni adres ekle
        </Text>
      </TouchableOpacity>

      {/* Yeni adres formu */}
      {mode === "new" && (
        <View style={{ gap: 12 }}>
          {(["firstName", "lastName", "phone", "address", "district", "city"] as const).map((field) => {
            const PLACEHOLDERS = {
              firstName: "Adınız", lastName: "Soyadınız", phone: "05XXXXXXXXX",
              address: "Mahalle, cadde, no...", district: "İlçe", city: "Şehir",
            };
            const LABELS = {
              firstName: "Ad", lastName: "Soyad", phone: "Telefon",
              address: "Adres", district: "İlçe", city: "Şehir",
            };
            return (
              <View key={field}>
                <Text style={styles.fieldLabel}>{LABELS[field]} *</Text>
                <Controller
                  control={control}
                  name={field}
                  render={({ field: f }) => (
                    <TextInput
                      value={f.value}
                      onChangeText={f.onChange}
                      placeholder={PLACEHOLDERS[field]}
                      placeholderTextColor={C.text3}
                      multiline={field === "address"}
                      numberOfLines={field === "address" ? 2 : 1}
                      keyboardType={field === "phone" ? "phone-pad" : "default"}
                      style={[styles.input, errors[field] && styles.inputError, field === "address" && { height: 60, textAlignVertical: "top" }]}
                    />
                  )}
                />
                {errors[field] && <Text style={styles.errorText}>{errors[field]?.message}</Text>}
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => {
          if (mode === "saved") {
            const addr = MOCK_ADDRESSES.find((a) => a.id === selected);
            if (addr) {
              onNext({
                firstName: addr.firstName, lastName: addr.lastName,
                phone: addr.phone, address: addr.address,
                district: addr.district, city: addr.city,
              });
            }
          } else {
            handleSubmit(onNext)();
          }
        }}
      >
        <Text style={styles.primaryBtnText}>Kargo Seçimine Geç →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── ShippingStep ──────────────────────────────────────────────────────────────
function ShippingStep({
  onNext, onBack, shippingTotal,
}: {
  onNext: (id: string) => void;
  onBack: () => void;
  shippingTotal: number;
}) {
  const [selected, setSelected] = useState("standard");

  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.sectionLabel}>Kargo Seçenekleri</Text>

      {shippingTotal === 0 && (
        <View style={styles.freeShipBanner}>
          <Text style={styles.freeShipText}>🎉 Sepetinizdeki fiziksel ürünlerde kargo ücretsiz!</Text>
        </View>
      )}

      {SHIPPING_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => setSelected(opt.id)}
          style={[styles.shippingCard, selected === opt.id && styles.shippingCardActive]}
        >
          <View style={[styles.radioCircle, selected === opt.id && styles.radioActive]}>
            {selected === opt.id && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.shippingLabel}>{opt.label}</Text>
              {opt.badge && (
                <View style={[styles.badge, opt.badge === "Ücretsiz" ? styles.badgeGreen : styles.badgeOrange]}>
                  <Text style={[styles.badgeText, opt.badge === "Ücretsiz" ? styles.badgeTextGreen : styles.badgeTextOrange]}>
                    {opt.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.shippingDesc}>{opt.desc}</Text>
          </View>
          <Text style={[styles.shippingPrice, opt.price === 0 && { color: "#34d399" }]}>
            {opt.price === 0 ? "Ücretsiz" : `${fmt(opt.price)}₺`}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity style={[styles.primaryBtn, styles.secondaryBtn, { flex: 1 }]} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>← Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, { flex: 2 }]} onPress={() => onNext(selected)}>
          <Text style={styles.primaryBtnText}>Ödemeye Geç →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── PaymentStep ───────────────────────────────────────────────────────────────
function PaymentStep({
  onSubmit, onBack, grandTotal, loading, isAllDigital,
}: {
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
  grandTotal: number;
  loading: boolean;
  isAllDigital: boolean;
}) {
  const { control, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<PaymentData>({
      resolver: zodResolver(paymentSchema),
      defaultValues: { installment: 1, secure3d: true, terms: undefined as unknown as true, kvkk: undefined as unknown as true },
    });

  const cardRaw = watch("cardNumber") ?? "";
  const firstDigit = cardRaw.replace(/\s/g, "")[0] ?? "";
  const cardInfo = BIN_TABLE[firstDigit] ?? null;
  const selectedInstallment = watch("installment") ?? 1;
  const secure3d = watch("secure3d");

  const installments = cardInfo?.installments ?? [1];

  // Refs for focus chain
  const lastNameRef   = useRef<TextInput>(null);
  const phoneRef      = useRef<TextInput>(null);
  const tcRef         = useRef<TextInput>(null);
  const holderRef     = useRef<TextInput>(null);
  const expiryRef     = useRef<TextInput>(null);
  const cvvRef        = useRef<TextInput>(null);

  return (
    <View style={{ gap: 20 }}>

      {/* Kişisel bilgi */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionLabel}>Kişisel Bilgiler</Text>
        <View>
          <Text style={styles.fieldLabel}>E-posta *</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: f }) => (
              <TextInput
                value={f.value}
                onChangeText={f.onChange}
                placeholder="e-posta@örnek.com"
                placeholderTextColor={C.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => tcRef.current?.focus()}
                style={[styles.input, errors.email && styles.inputError]}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>
        <View>
          <Text style={styles.fieldLabel}>TC Kimlik No *</Text>
          <Controller
            control={control}
            name="tcNo"
            render={({ field: f }) => (
              <TextInput
                ref={tcRef}
                value={f.value}
                onChangeText={f.onChange}
                placeholder="XXXXXXXXXXX"
                placeholderTextColor={C.text3}
                keyboardType="numeric"
                maxLength={11}
                returnKeyType="next"
                onSubmitEditing={() => holderRef.current?.focus()}
                style={[styles.input, errors.tcNo && styles.inputError]}
              />
            )}
          />
          {errors.tcNo && <Text style={styles.errorText}>{errors.tcNo.message}</Text>}
        </View>
      </View>

      {/* Kart görsel alanı */}
      <View style={styles.cardVisual}>
        <View style={styles.cardChip} />
        <Text style={styles.cardNumberDisplay}>
          {cardRaw || "•••• •••• •••• ••••"}
        </Text>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardMiniLabel}>KART SAHİBİ</Text>
            <Text style={styles.cardDisplayText}>
              {(watch("cardHolder") || "AD SOYAD").toUpperCase()}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.cardMiniLabel}>SON KUL.</Text>
            <Text style={styles.cardDisplayText}>{watch("expiry") || "AA/YY"}</Text>
          </View>
          {cardInfo && (
            <View style={styles.cardNetworkBadge}>
              <Text style={styles.cardNetworkText}>{cardInfo.network}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Kart formu */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionLabel}>Kart Bilgileri</Text>

        {/* Kart no */}
        <View>
          <Text style={styles.fieldLabel}>Kart Numarası *</Text>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field: f }) => (
              <TextInput
                value={f.value}
                onChangeText={(v) => {
                  const formatted = formatCardNumber(v);
                  setValue("cardNumber", formatted, { shouldValidate: true });
                }}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={C.text3}
                keyboardType="numeric"
                maxLength={19}
                returnKeyType="next"
                onSubmitEditing={() => holderRef.current?.focus()}
                style={[styles.input, styles.monoInput, errors.cardNumber && styles.inputError]}
              />
            )}
          />
          {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber.message}</Text>}
        </View>

        {/* Kart sahibi */}
        <View>
          <Text style={styles.fieldLabel}>Kart Üzerindeki İsim *</Text>
          <Controller
            control={control}
            name="cardHolder"
            render={({ field: f }) => (
              <TextInput
                ref={holderRef}
                value={f.value}
                onChangeText={f.onChange}
                placeholder="AD SOYAD"
                placeholderTextColor={C.text3}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => expiryRef.current?.focus()}
                style={[styles.input, errors.cardHolder && styles.inputError]}
              />
            )}
          />
          {errors.cardHolder && <Text style={styles.errorText}>{errors.cardHolder.message}</Text>}
        </View>

        {/* Son kullanma + CVV */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Son Kul. *</Text>
            <Controller
              control={control}
              name="expiry"
              render={({ field: f }) => (
                <TextInput
                  ref={expiryRef}
                  value={f.value}
                  onChangeText={(v) => {
                    const formatted = formatExpiry(v);
                    setValue("expiry", formatted, { shouldValidate: true });
                  }}
                  placeholder="AA/YY"
                  placeholderTextColor={C.text3}
                  keyboardType="numeric"
                  maxLength={5}
                  returnKeyType="next"
                  onSubmitEditing={() => cvvRef.current?.focus()}
                  style={[styles.input, styles.monoInput, errors.expiry && styles.inputError]}
                />
              )}
            />
            {errors.expiry && <Text style={styles.errorText}>{errors.expiry.message}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>CVV *</Text>
            <Controller
              control={control}
              name="cvv"
              render={({ field: f }) => (
                <TextInput
                  ref={cvvRef}
                  value={f.value}
                  onChangeText={f.onChange}
                  placeholder="•••"
                  placeholderTextColor={C.text3}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  style={[styles.input, styles.monoInput, errors.cvv && styles.inputError]}
                />
              )}
            />
            {errors.cvv && <Text style={styles.errorText}>{errors.cvv.message}</Text>}
          </View>
        </View>
      </View>

      {/* Taksit tablosu */}
      {installments.length > 1 && (
        <View>
          <Text style={styles.sectionLabel}>Taksit Seçeneği</Text>
          <View style={styles.installmentGrid}>
            {installments.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setValue("installment", n, { shouldValidate: true })}
                style={[styles.installmentCell, selectedInstallment === n && styles.installmentCellActive]}
              >
                <Text style={[styles.installmentMain, selectedInstallment === n && { color: C.accent }]}>
                  {n === 1 ? "Tek" : `${n}x`}
                </Text>
                <Text style={styles.installmentSub}>
                  {n === 1 ? "Peşin" : `${fmt(grandTotal / n)}₺`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedInstallment > 1 && (
            <Text style={styles.installmentNote}>
              {selectedInstallment} × {fmt(grandTotal / selectedInstallment)}₺ = {fmt(grandTotal)}₺
            </Text>
          )}
        </View>
      )}

      {/* 3D Secure */}
      <View style={styles.secureRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.secureTitle}>3D Secure ile Öde</Text>
          <Text style={styles.secureDesc}>SMS onaylı güvenli ödeme</Text>
        </View>
        <Switch
          value={secure3d}
          onValueChange={(v) => setValue("secure3d", v)}
          trackColor={{ false: C.border, true: C.accent }}
          thumbColor="#fff"
        />
      </View>

      {/* Onay kutuları */}
      <View style={{ gap: 12 }}>
        <Controller
          control={control}
          name="terms"
          render={({ field: f }) => (
            <TouchableOpacity
              onPress={() => setValue("terms", f.value ? (undefined as unknown as true) : true, { shouldValidate: true })}
              style={styles.checkRow}
            >
              <View style={[styles.checkbox, f.value && styles.checkboxChecked]}>
                {f.value && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkText}>
                <Text style={styles.checkTextBold}>Mesafeli Satış Sözleşmesi</Text>
                {" "}ve{" "}
                <Text style={styles.checkTextBold}>İade Koşulları</Text>
                {"'nı okudum, onaylıyorum. *"}
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.terms && <Text style={styles.errorText}>{errors.terms.message}</Text>}

        <Controller
          control={control}
          name="kvkk"
          render={({ field: f }) => (
            <TouchableOpacity
              onPress={() => setValue("kvkk", f.value ? (undefined as unknown as true) : true, { shouldValidate: true })}
              style={styles.checkRow}
            >
              <View style={[styles.checkbox, f.value && styles.checkboxChecked]}>
                {f.value && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkText}>
                <Text style={styles.checkTextBold}>KVKK Aydınlatma Metni</Text>
                {"'ni okudum, onaylıyorum. *"}
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.kvkk && <Text style={styles.errorText}>{errors.kvkk.message}</Text>}
      </View>

      {/* CTA */}
      <View style={styles.ctaBox}>
        <View style={styles.ctaRow}>
          <Text style={styles.ctaLabel}>Ödenecek</Text>
          <Text style={styles.ctaAmount}>{fmt(grandTotal)}₺</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          {!isAllDigital && (
            <TouchableOpacity style={[styles.primaryBtn, styles.secondaryBtn, { flex: 1 }]} onPress={onBack}>
              <Text style={styles.secondaryBtnText}>← Geri</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.primaryBtn, { flex: isAllDigital ? 1 : 2 }, loading && { opacity: 0.6 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>🔒 Ödemeyi Tamamla</Text>
            }
          </TouchableOpacity>
        </View>
        <Text style={styles.sslNote}>256-bit SSL ile korunan güvenli ödeme</Text>
      </View>
    </View>
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function OdemeScreen() {
  const router = useRouter();
  const { items, totalPrice, shippingTotal, grandTotal, clearCart } = useCart();

  const isAllDigital = items.length > 0 && items.every((i) => i.isDigital);

  const STEPS = isAllDigital
    ? ["Ödeme"]
    : ["Teslimat Adresi", "Kargo Seçimi", "Ödeme"];

  const [step,        setStep]        = useState(0);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [shippingId,  setShippingId]  = useState("standard");
  const [loading,     setLoading]     = useState(false);

  const addressStep  = isAllDigital ? -1 : 0;
  const shippingStep = isAllDigital ? -1 : 1;
  const paymentStep  = isAllDigital ? 0  : 2;

  // Seçilen kargo ek ücreti
  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shippingId);
  const extraShipping    = selectedShipping?.price ?? 0;
  const displayGrand     = grandTotal + extraShipping;

  async function handlePayment(_data: PaymentData) {
    setLoading(true);
    try {
      // Mock — gerçek Iyzico API sonraya bırakıldı
      await new Promise((r) => setTimeout(r, 1800));
      const no = `FMRKT-${Math.floor(10000 + Math.random() * 90000)}`;
      clearCart();
      // router.replace → geri tuşu ödeme formuna DÖNEMESİN
      router.replace({
        pathname: "/odeme/basarili",
        params: { no, digital: String(isAllDigital), total: String(displayGrand) },
      });
    } catch {
      router.replace({ pathname: "/odeme/hata", params: { code: "1" } });
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (step === 0) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }

  // Boş sepet guard
  if (items.length === 0) {
    Alert.alert("Sepet Boş", "Ödeme yapmak için sepetinize ürün ekleyin.", [
      { text: "Tamam", onPress: () => router.back() },
    ]);
    return null;
  }

  const STEP_TITLES = ["Teslimat Adresi", "Kargo Seçimi", "Ödeme"];
  const currentTitle = isAllDigital ? "Ödeme" : STEP_TITLES[step];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" />
      <WizardHeader title={currentTitle} onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Adım göstergesi */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Adres */}
        {step === addressStep && step >= 0 && (
          <AddressStep
            onNext={(data) => { setAddressData(data); setStep((s) => s + 1); }}
            defaultValues={addressData ?? undefined}
          />
        )}

        {/* Kargo */}
        {step === shippingStep && step >= 0 && (
          <ShippingStep
            onNext={(id) => { setShippingId(id); setStep((s) => s + 1); }}
            onBack={() => setStep((s) => s - 1)}
            shippingTotal={shippingTotal}
          />
        )}

        {/* Ödeme */}
        {step === paymentStep && (
          <PaymentStep
            onSubmit={handlePayment}
            onBack={() => setStep((s) => s - 1)}
            grandTotal={displayGrand}
            loading={loading}
            isAllDigital={isAllDigital}
          />
        )}

        {/* Sipariş özeti mini (alt) */}
        <View style={styles.orderSummaryBox}>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryKey}>Ara Toplam</Text>
            <Text style={styles.orderSummaryVal}>{fmt(totalPrice)}₺</Text>
          </View>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSummaryKey}>Kargo</Text>
            <Text style={[styles.orderSummaryVal, shippingTotal + extraShipping === 0 && { color: "#34d399" }]}>
              {shippingTotal + extraShipping === 0 ? "Ücretsiz" : `${fmt(shippingTotal + extraShipping)}₺`}
            </Text>
          </View>
          <View style={[styles.orderSummaryRow, { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 4 }]}>
            <Text style={[styles.orderSummaryKey, { fontWeight: "700", color: C.text }]}>Toplam</Text>
            <Text style={[styles.orderSummaryVal, { color: C.accent, fontWeight: "800", fontSize: 16 }]}>
              {fmt(displayGrand)}₺
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent:  { padding: 16, paddingTop: 8 },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10 },
  backBtn:        { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  backIcon:       { fontSize: 20, color: C.text2 },
  headerTitle:    { fontSize: 18, fontWeight: "800", color: C.text },

  // Steps
  stepRow:        { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  stepItem:       { alignItems: "center" },
  stepCircle:     { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.border, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
  stepDone:       { backgroundColor: C.accent, borderColor: C.accent },
  stepActive:     { borderColor: C.accent, backgroundColor: "rgba(255,107,43,0.1)" },
  stepNum:        { fontSize: 11, fontWeight: "700", color: C.text3 },
  stepNumActive:  { color: C.accent },
  stepLabel:      { fontSize: 9, color: C.text3, marginTop: 3, textAlign: "center", maxWidth: 60 },
  stepLabelActive:{ color: C.accent, fontWeight: "700" },
  stepLine:       { width: 24, height: 2, backgroundColor: C.border, marginBottom: 18, marginHorizontal: 4 },
  stepLineDone:   { backgroundColor: C.accent },

  // Section
  sectionLabel:   { fontSize: 10, fontWeight: "800", color: C.text3, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },

  // Address card
  addressCard:    { borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, backgroundColor: C.surface },
  addressCardActive: { borderColor: C.accent, backgroundColor: "rgba(255,107,43,0.05)" },
  addressCardRow: { flexDirection: "row", gap: 12 },
  addrLabelBadge: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  addrLabelText:  { fontSize: 10, fontWeight: "600", color: C.text3 },
  addrName:       { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 2 },
  addrText:       { fontSize: 11, color: C.text2, lineHeight: 16 },
  newAddrBtn:     { fontSize: 13, fontWeight: "600", color: C.text2 },

  // Radio
  radioCircle:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: "center", justifyContent: "center", marginTop: 2 },
  radioActive:    { borderColor: C.accent },
  radioDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },

  // Shipping
  shippingCard:   { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: C.border, borderRadius: 14, padding: 14, backgroundColor: C.surface },
  shippingCardActive: { borderColor: C.accent, backgroundColor: "rgba(255,107,43,0.05)" },
  shippingLabel:  { fontSize: 13, fontWeight: "700", color: C.text },
  shippingDesc:   { fontSize: 11, color: C.text2, marginTop: 2 },
  shippingPrice:  { fontSize: 13, fontWeight: "800", color: C.text },
  freeShipBanner: { backgroundColor: "rgba(52,211,153,0.08)", borderWidth: 1, borderColor: "rgba(52,211,153,0.2)", borderRadius: 12, padding: 12 },
  freeShipText:   { fontSize: 12, fontWeight: "600", color: "#34d399" },

  // Badge
  badge:          { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
  badgeGreen:     { backgroundColor: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.2)" },
  badgeOrange:    { backgroundColor: "rgba(255,107,43,0.1)", borderColor: "rgba(255,107,43,0.2)" },
  badgeText:      { fontSize: 10, fontWeight: "700" },
  badgeTextGreen: { color: "#34d399" },
  badgeTextOrange:{ color: C.accent },

  // Card visual
  cardVisual:     { backgroundColor: "#0f0f1a", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  cardChip:       { width: 36, height: 26, borderRadius: 6, backgroundColor: "rgba(255,200,50,0.3)", borderWidth: 1, borderColor: "rgba(255,200,50,0.2)", marginBottom: 16 },
  cardNumberDisplay: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.85)", fontVariant: ["tabular-nums"], letterSpacing: 3, marginBottom: 16 },
  cardBottom:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardMiniLabel:  { fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: 2 },
  cardDisplayText:{ fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  cardNetworkBadge: { position: "absolute", right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  cardNetworkText:  { fontSize: 11, fontWeight: "800", color: "rgba(255,255,255,0.7)" },

  // Form
  fieldLabel:     { fontSize: 11, fontWeight: "600", color: C.text2, marginBottom: 6 },
  input:          { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: C.text },
  inputError:     { borderColor: "#ef4444" },
  monoInput:      { fontVariant: ["tabular-nums"], letterSpacing: 2 },
  errorText:      { fontSize: 11, color: "#ef4444", marginTop: 4 },

  // Taksit
  installmentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  installmentCell: { flex: 1, minWidth: 60, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 10, alignItems: "center", backgroundColor: C.surface },
  installmentCellActive: { borderColor: C.accent, backgroundColor: "rgba(255,107,43,0.08)" },
  installmentMain:  { fontSize: 14, fontWeight: "800", color: C.text },
  installmentSub:   { fontSize: 10, color: C.text2, marginTop: 2 },
  installmentNote:  { fontSize: 11, color: C.text2, marginTop: 6 },

  // 3D Secure
  secureRow:      { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, gap: 12 },
  secureTitle:    { fontSize: 13, fontWeight: "700", color: C.text },
  secureDesc:     { fontSize: 11, color: C.text2, marginTop: 2 },

  // Checkboxes
  checkRow:       { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  checkbox:       { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxChecked:{ backgroundColor: C.accent, borderColor: C.accent },
  checkmark:      { fontSize: 12, color: "#fff", fontWeight: "800" },
  checkText:      { flex: 1, fontSize: 12, color: C.text2, lineHeight: 18 },
  checkTextBold:  { fontWeight: "700", color: C.text },

  // CTA
  ctaBox:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  ctaRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ctaLabel:       { fontSize: 13, color: C.text2 },
  ctaAmount:      { fontSize: 24, fontWeight: "900", color: C.accent },
  sslNote:        { fontSize: 10, color: C.text3, textAlign: "center", marginTop: 8 },

  // Order summary
  orderSummaryBox: { marginTop: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, gap: 8 },
  orderSummaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderSummaryKey: { fontSize: 13, color: C.text2 },
  orderSummaryVal: { fontSize: 13, fontWeight: "600", color: C.text },

  // Buttons
  primaryBtn:     { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 15, fontWeight: "900", color: "#fff" },
  secondaryBtn:   { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
  secondaryBtnText: { fontSize: 14, fontWeight: "700", color: C.text },
});

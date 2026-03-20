import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../../constants";

// ── Tipler ───────────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
  role?: UserRole;
}

export type UserRole = "musteri" | "sanatci" | "magaza" | "cozum-ortagi";

interface DocFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  // Sanatçı
  tckn?: string;
  iban?: string;
  // Mağaza / Çözüm Ortağı
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  expertiseArea?: string;
  // Adres
  address_1?: string;
  city?: string;
  state?: string;
  // Yüklenecek belgeler
  files?: {
    kimlik?: DocFile;
    esnaf_muafiyet?: DocFile;
    vergi_levhasi?: DocFile;
    imza_sirkuleri?: DocFile;
    faaliyet_belgesi?: DocFile;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ needsApproval?: boolean }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredToken();
  }, []);

  const checkStoredToken = async () => {
    try {
      const token    = await AsyncStorage.getItem("fimarkt_token");
      const userData = await AsyncStorage.getItem("fimarkt_user");
      if (token && userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.log("Token kontrol hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("https://fimarkt.com.tr/wp-json/jwt-auth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });
    if (!response.ok) throw new Error("Giriş başarısız");
    const data = await response.json();

    let isAdmin = false;
    let role: UserRole = "musteri";
    try {
      const meRes  = await fetch("https://fimarkt.com.tr/wp-json/wp/v2/users/me", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const meData = await meRes.json();
      isAdmin = meData.is_super_admin === true ||
        (Array.isArray(meData.roles) && meData.roles.includes("administrator"));

      const wcRes = await fetch(
        `https://fimarkt.com.tr/wp-json/wc/v3/customers/${meData.id}`,
        { headers: { Authorization: `Bearer ${data.token}` } }
      );
      if (wcRes.ok) {
        const wcData = await wcRes.json();
        const roleMeta = (wcData.meta_data || []).find(
          (m: { key: string }) => m.key === "fimarkt_role"
        );
        if (roleMeta?.value) role = roleMeta.value as UserRole;
      }
    } catch { /* meta alınamazsa varsayılan değerler geçerli */ }

    const userData: User = {
      id: (() => {
        try { return parseInt(JSON.parse(atob(data.token.split(".")[1])).data?.user?.id || "0"); }
        catch { return 0; }
      })(),
      name:    data.user_display_name,
      email:   data.user_email,
      token:   data.token,
      isAdmin,
      role,
    };

    await AsyncStorage.setItem("fimarkt_token", data.token);
    await AsyncStorage.setItem("fimarkt_user",  JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: RegisterData) => {
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName",  data.lastName);
    formData.append("email",     data.email);
    formData.append("phone",     data.phone);
    formData.append("password",  data.password);
    formData.append("role",      data.role);

    if (data.tckn)          formData.append("tckn",          data.tckn);
    if (data.iban)          formData.append("iban",          data.iban);
    if (data.companyName)   formData.append("companyName",   data.companyName);
    if (data.taxNumber)     formData.append("taxNumber",     data.taxNumber);
    if (data.taxOffice)     formData.append("taxOffice",     data.taxOffice);
    if (data.expertiseArea) formData.append("expertiseArea", data.expertiseArea);
    if (data.address_1)     formData.append("address_1",     data.address_1);
    if (data.city)          formData.append("city",          data.city);
    if (data.state)         formData.append("state",         data.state);

    if (data.files) {
      (Object.entries(data.files) as [string, DocFile | undefined][]).forEach(([key, file]) => {
        if (file) {
          formData.append(key, { uri: file.uri, name: file.name, type: file.mimeType } as any);
        }
      });
    }

    const res    = await fetch(`${BACKEND_URL}/api/register`, { method: "POST", body: formData });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Kayıt başarısız");

    await login(data.email, data.password);
    return { needsApproval: result.needsApproval };
  };

  const loginWithGoogle = async () => {
    console.log("Google ile giriş — sonraki adımda eklenecek");
  };

  const loginWithApple = async () => {
    console.log("Apple ile giriş — sonraki adımda eklenecek");
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["fimarkt_token", "fimarkt_user"]);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, loginWithGoogle, loginWithApple }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

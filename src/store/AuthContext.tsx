import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  accountType?: "bireysel" | "kurumsal";
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  billing?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredToken();
  }, []);

  const checkStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem("fimarkt_token");
      const userData = await AsyncStorage.getItem("fimarkt_user");
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log("Token kontrol hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        "https://fimarkt.com.tr/wp-json/jwt-auth/v1/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        },
      );
      if (!response.ok) throw new Error("Giriş başarısız");
      const data = await response.json();

      const [sanatkatRes, fidropRes] = await Promise.allSettled([
        fetch("https://sanatkat.com/wp-json/jwt-auth/v1/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        }),
        fetch("https://fidrop.com.tr/wp-json/jwt-auth/v1/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email, password }),
        }),
      ]);

      if (sanatkatRes.status === "fulfilled" && sanatkatRes.value.ok) {
        const sanatkatData = await sanatkatRes.value.json();
        await AsyncStorage.setItem("sanatkat_token", sanatkatData.token);
      }
      if (fidropRes.status === "fulfilled" && fidropRes.value.ok) {
        const fidropData = await fidropRes.value.json();
        await AsyncStorage.setItem("fidrop_token", fidropData.token);
      }

      // Rol kontrolü için wp/v2/users/me çağrısı
      let isAdmin = false;
      try {
        const meRes = await fetch(
          "https://fimarkt.com.tr/wp-json/wp/v2/users/me",
          {
            headers: { Authorization: `Bearer ${data.token}` },
          },
        );

        const meData = await meRes.json();

        isAdmin =
          meData.is_super_admin === true ||
          (Array.isArray(meData.roles) &&
            meData.roles.includes("administrator"));
      } catch (e) {}

      const userData: User = {
        id: data.user_id,
        name: data.user_display_name,
        email: data.user_email,
        token: data.token,
        isAdmin,
      };
      await AsyncStorage.setItem("fimarkt_token", data.token);
      await AsyncStorage.setItem("fimarkt_user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const billing = data.billing || {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address_1: "",
        city: "",
        state: "",
        postcode: "",
        country: "TR",
      };

      const customerData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        username: data.email,
        password: data.password,
        billing: {
          ...billing,
          phone: data.phone,
          country: "TR",
          company:
            data.accountType === "kurumsal" ? data.companyName || "" : "",
        },
        shipping: {
          first_name: data.firstName,
          last_name: data.lastName,
          address_1: billing.address_1,
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          country: "TR",
          company:
            data.accountType === "kurumsal" ? data.companyName || "" : "",
        },
      };

      await Promise.allSettled([
        fetch("https://fimarkt.com.tr/wp-json/wc/v3/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa("ck_c896f9e8d17b48b61488508546dd67322b5064e0:cs_2d4c19af217a83676846dafb9ecb4a57e8821c0b")}`,
          },
          body: JSON.stringify(customerData),
        }),
        fetch("https://sanatkat.com/wp-json/wc/v3/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa("ck_d9135020ff96f07c045ee8160e4dfcd7d440e9f8:cs_6c6e2f75cf3514b5cc0b41197af4c2981f221684")}`,
          },
          body: JSON.stringify(customerData),
        }),
        fetch("https://fidrop.com.tr/wp-json/wc/v3/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa("ck_361eed22c0bd2b4b4d94c6788bd4b2c784c41a80:cs_eb985b341f03f5ca30a17f6cdf12d4fbd2977e24")}`,
          },
          body: JSON.stringify(customerData),
        }),
      ]);

      await login(data.email, data.password);
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    console.log("Google ile giriş - sonraki adımda eklenecek");
  };

  const loginWithApple = async () => {
    console.log("Apple ile giriş - sonraki adımda eklenecek");
  };

  const logout = async () => {
    await AsyncStorage.removeItem("fimarkt_token");
    await AsyncStorage.removeItem("fimarkt_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithApple,
      }}
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

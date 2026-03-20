import { BACKEND_URL } from "../../constants";

export interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: { id: number; src: string; alt: string }[];
  categories: { id: number; name: string }[];
  short_description: string;
  description: string;
  stock_status: string;
}

export interface Category {
  id: number;
  name: string;
  count: number;
  image: { src: string } | null;
}

export interface WCOrder {
  id: number;
  number: string;
  date_created: string;
  status: string;
  total: string;
  line_items: {
    id: number;
    name: string;
    quantity: number;
    total: string;
  }[];
  shipping: {
    first_name: string;
    last_name: string;
  };
}

export const getProducts = async (
  page = 1,
  perPage = 10,
  categoryId?: number,
  search?: string,
  store = "fimarkt",
): Promise<Product[]> => {
  try {
    let url = `${BACKEND_URL}/api/products?store=${store}&page=${page}&per_page=${perPage}`;
    if (categoryId) url += `&category=${categoryId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ürünler yüklenemedi");
    return await response.json();
  } catch (error) {
    console.error("getProducts hatası:", error);
    return [];
  }
};

export const getCategories = async (store = "fimarkt"): Promise<Category[]> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/products/categories?store=${store}`,
    );
    if (!response.ok) throw new Error("Kategoriler yüklenemedi");
    return await response.json();
  } catch (error) {
    console.error("getCategories hatası:", error);
    return [];
  }
};

export const getProduct = async (
  id: number,
  store = "fimarkt",
): Promise<Product | null> => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/products/${id}?store=${store}`,
    );
    if (!response.ok) throw new Error("Ürün yüklenemedi");
    return await response.json();
  } catch (error) {
    console.error("getProduct hatası:", error);
    return null;
  }
};

export const getMyOrders = async (
  token: string,
  store = "fimarkt",
): Promise<WCOrder[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders?store=${store}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Siparişler yüklenemedi");
    return await response.json();
  } catch (error) {
    console.error("getMyOrders hatası:", error);
    return [];
  }
};

export const createOrder = async (
  token: string,
  items: { product_id: number; quantity: number }[],
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  },
  store = "fimarkt",
): Promise<WCOrder | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/orders?store=${store}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_method: "bacs",
        payment_method_title: "Banka Havalesi / EFT",
        set_paid: false,
        billing: { ...billing, country: "TR" },
        shipping: { ...billing, country: "TR" },
        line_items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      }),
    });
    if (!response.ok) {
      const errBody = await response.json();
      console.error("createOrder hata detayı:", JSON.stringify(errBody));
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("createOrder hatası:", error);
    return null;
  }
};

export const getMyProfile = async (token: string, store = "fimarkt") => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/customers/me?store=${store}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) throw new Error("Profil yüklenemedi");
    return await response.json();
  } catch (error) {
    console.error("getMyProfile hatası:", error);
    return null;
  }
};

export const getMyCustomer = async (token: string, store = "fimarkt") => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/customers/me?store=${store}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("getMyCustomer hatası:", error);
    return null;
  }
};

export const updateMyCustomer = async (
  token: string,
  data: any,
  store = "fimarkt",
) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/customers/me?store=${store}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw new Error("Güncelleme başarısız");
    return await response.json();
  } catch (error) {
    console.error("updateMyCustomer hatası:", error);
    return null;
  }
};

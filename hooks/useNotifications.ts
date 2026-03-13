import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { BACKEND_URL } from "../constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications(userId: number | string | null) {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotifications(userId);

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Bildirim alındı:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Bildirime tıklandı:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}

async function registerForPushNotifications(userId: number | string) {
  console.log("registerForPushNotifications başladı, userId:", userId);

  if (!Device.isDevice) {
    console.log("Gerçek cihaz değil, çıkılıyor");
    return;
  }

  console.log("Cihaz gerçek, izin kontrol ediliyor...");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.log("Mevcut izin durumu:", existingStatus);
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.log("Yeni izin durumu:", finalStatus);
  }

  if (finalStatus !== "granted") {
    console.log("Bildirim izni verilmedi, çıkılıyor");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#6c63ff",
    });
  }

  try {
    console.log("FCM token alınıyor...");
    const token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log("FCM Token:", token);

    const res = await fetch(`${BACKEND_URL}/api/notifications/register-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });
    console.log("Token kayıt sonucu:", res.status);
  } catch (err) {
    console.error("Token kaydedilemedi:", err);
  }
}

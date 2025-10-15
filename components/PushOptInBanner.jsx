"use client";
import { useEffect, useState } from "react";
import { initMessaging } from "@/lib/push";
import { useI18n } from "@/components/I18nProvider";

export default function PushOptInBanner() {
  const { messages } = useI18n();
  const copy = messages.pushOptIn;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window && "serviceWorker" in navigator;
    const hasCreds = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const asked = localStorage.getItem("push_optin_dismissed") === "1";
    const hasToken = !!localStorage.getItem("fcm_token");
    if (supported && hasCreds && !asked && !hasToken && Notification.permission !== "granted") {
      setShow(true);
    }
  }, []);

  async function enablePush() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setShow(false);
        return;
      }
      const token = await initMessaging();
      if (token) {
        localStorage.setItem("fcm_token", token);
        window.dispatchEvent(new CustomEvent("toast", { detail: { text: copy.toastSuccess } }));
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent("toast", { detail: { text: copy.toastError } }));
    } finally {
      setShow(false);
      localStorage.setItem("push_optin_dismissed", "1");
    }
  }

  if (!show) return null;
  return (
    <div className="toast" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 64, zIndex: 60 }}>
      <div className="toast-msg">{copy.message}</div>
      <button className="button primary" onClick={enablePush}>{copy.enable}</button>
      <button className="button ghost" onClick={() => { setShow(false); localStorage.setItem("push_optin_dismissed", "1"); }}>{copy.later}</button>
    </div>
  );
}

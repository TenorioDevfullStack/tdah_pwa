"use client";
import { useEffect, useState } from "react";
import { initMessaging } from "@/lib/push";

const DEV_TOOLS =
  process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";

export default function FCMDebugPage() {
  if (!DEV_TOOLS) {
    return (
      <div className="card">
        <h3>Debug FCM</h3>
        <div className="small">
          Área disponível apenas na versão de desenvolvedor
          (defina <code>NEXT_PUBLIC_ENABLE_DEV_TOOLS=true</code>).
        </div>
      </div>
    );
  }
  const [permission, setPermission] = useState("unknown");
  const [token, setToken] = useState("");
  const [swReady, setSwReady] = useState(false);
  const [swScope, setSwScope] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPermission(Notification?.permission || "unsupported");
    setToken(localStorage.getItem("fcm_token") || "");
    (async () => {
      try {
        const reg = await navigator.serviceWorker?.ready;
        if (reg) {
          setSwReady(true);
          setSwScope(reg.scope || "");
        }
      } catch {}
    })();
  }, []);

  async function requestPerm() {
    try {
      const p = await Notification.requestPermission();
      setPermission(p);
    } catch {}
  }

  async function generateToken() {
    setLoading(true);
    try {
      if (Notification.permission !== "granted") {
        const p = await Notification.requestPermission();
        setPermission(p);
        if (p !== "granted") {
          setLoading(false);
          return;
        }
      }
      const t = await initMessaging();
      if (t) {
        localStorage.setItem("fcm_token", t);
        setToken(t);
        window.dispatchEvent(
          new CustomEvent("toast", { detail: { text: "Token gerado" } })
        );
      }
    } catch (e) {
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { text: "Falha ao gerar token" } })
      );
    } finally {
      setLoading(false);
    }
  }

  async function testLocalNotif() {
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (reg?.showNotification) {
        reg.showNotification("Teste local", {
          body: "Isto é um teste local (sem FCM).",
          icon: "/icons/icon-192.png",
        });
      } else if (Notification.permission === "granted") {
        new Notification("Teste local", {
          body: "Isto é um teste local (sem FCM).",
        });
      }
    } catch {}
  }

  function resetOptIn() {
    localStorage.removeItem("fcm_token");
    localStorage.removeItem("push_optin_dismissed");
    setToken("");
    window.dispatchEvent(
      new CustomEvent("toast", { detail: { text: "Opt-in resetado" } })
    );
  }

  return (
    <div className="card">
      <h3>Debug FCM</h3>
      <div className="row">
        <span className="badge">Permissão: {permission}</span>
        <span className="badge">SW pronto: {swReady ? "sim" : "não"}</span>
        {swScope && <span className="badge">Scope: {swScope}</span>}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <input
          className="input"
          readOnly
          value={token}
          placeholder="Token FCM"
          style={{ flex: 1, minWidth: 260 }}
        />
        <button
          className="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(token || "");
              window.dispatchEvent(
                new CustomEvent("toast", { detail: { text: "Token copiado" } })
              );
            } catch {}
          }}
        >
          Copiar token
        </button>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <button className="button" onClick={requestPerm}>
          Pedir permissão
        </button>
        <button className="button primary" onClick={generateToken} disabled={loading}>
          {loading ? "Gerando…" : "Gerar token"}
        </button>
        <button className="button" onClick={testLocalNotif}>
          Notificação local
        </button>
        <button className="button danger" onClick={resetOptIn}>
          Resetar opt-in
        </button>
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        Dica: com o token copiado, envie um push via script CLI
        (<code>npm run send:fcm</code>) ou API HTTP v1.
      </div>
    </div>
  );
}

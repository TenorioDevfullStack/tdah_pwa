"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rotina-admin-token");
    if (token === "ok") setAuthed(true);
  }, []);

  async function login(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = form.get("username")?.toString() ?? "";
    const password = form.get("password")?.toString() ?? "";
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Credenciais inválidas");
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("rotina-admin-token", "ok");
      }
      setAuthed(true);
    } catch (err) {
      setError(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rotina-admin-token");
    }
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h3>Acesso restrito</h3>
        <p className="small">
          Entre com as credenciais configuradas nas variáveis <code>ADMIN_USERNAME</code> e <code>ADMIN_PASSWORD</code>.
        </p>
        <form onSubmit={login} className="beta-login">
          <label className="small">
            Usuário
            <input className="input" name="username" autoComplete="username" required />
          </label>
          <label className="small">
            Senha
            <input className="input" name="password" type="password" autoComplete="current-password" required />
          </label>
          {error && <div className="notice small" style={{ marginTop: 8 }}>{error}</div>}
          <button className="button primary" style={{ marginTop: 12 }} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="card beta-admin">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h3>Painel do desenvolvedor</h3>
          <p className="small">
            Acesso rápido às ferramentas internas e status de variáveis.
          </p>
        </div>
        <button className="button" onClick={logout}>
          Sair
        </button>
      </div>

      <div className="list" style={{ marginTop: 16 }}>
        <div className="item">
          <div>
            <div style={{ fontWeight: 600 }}>Testar notificações FCM</div>
            <div className="small">Gera token, envia push manual e valida permissões.</div>
          </div>
          <Link href="/debug/fcm" className="button primary">
            Abrir debug FCM
          </Link>
        </div>

        <div className="item">
          <div>
            <div style={{ fontWeight: 600 }}>Gerar QR codes com UTMs</div>
            <div className="small">Criar QR/links para Instagram, WhatsApp ou impressos.</div>
          </div>
          <Link href="/qr" className="button">
            Abrir /qr
          </Link>
        </div>

        <div className="item">
          <div>
            <div style={{ fontWeight: 600 }}>Landing de testes</div>
            <div className="small">Página pública que os testers recebem antes de abrir o app.</div>
          </div>
          <Link href="/teste" className="button">
            Ver landing
          </Link>
        </div>

        <div className="item">
          <div>
            <div style={{ fontWeight: 600 }}>Script CLI de push</div>
            <div className="small">Rodar <code>npm run send:fcm</code> com token específico.</div>
          </div>
          <a className="button" href="https://github.com/TenorioDevfullStack/tdah_pwa/blob/main/scripts/send-fcm.mjs" target="_blank">
            Ver script
          </a>
        </div>
      </div>

      <div className="notice small" style={{ marginTop: 16 }}>
        Dica: configure <code>NEXT_PUBLIC_ENABLE_DEV_TOOLS</code> e <code>NEXT_PUBLIC_ENABLE_FCM</code> conforme o ambiente. Variáveis de servidor ficam em <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> ou <code>GOOGLE_APPLICATION_CREDENTIALS</code>.
      </div>
    </div>
  );
}

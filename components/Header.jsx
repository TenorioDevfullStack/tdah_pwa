"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function useTheme() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("theme");
    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    const initial = saved || (prefersLight ? "light" : "dark");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, toggle };
}

export default function Header() {
  const { theme, toggle } = useTheme();

  return (
    <header className="header">
      <div className="brand" style={{ gap: "14px" }}>
        <Image
          src="/icons/icon-192.png"
          alt="Logo Rotina TDAH"
          width={42}
          height={42}
          style={{ borderRadius: "10px" }}
          priority
        />
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Rotina TDAH</div>
          <div className="small brand-sub">PWA offline • Foco, Tarefas e Organização</div>
        </div>
      </div>

      <div className="row">
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-pressed={theme === 'light'}
          aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {theme === "dark" ? "🌙 Escuro" : "☀️ Claro"}
        </button>
      </div>
    </header>
  );
}

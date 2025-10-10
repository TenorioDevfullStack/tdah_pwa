"use client";

import { useEffect, useState } from "react";

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
      <div className="brand">
        <div className="logo">R</div>
        <div>
          <div style={{ fontWeight: 800 }}>Minha Rotina</div>
          <div className="small">PWA offline • Instale no celular</div>
        </div>
      </div>
      <div className="row">
        <button className="theme-toggle" onClick={toggle}>
          {theme === "dark" ? "🌙 Escuro" : "☀️ Claro"}
        </button>
        <div className="small">
          Atalhos: <span className="kbd">Ctrl</span>+
          <span className="kbd">1..7</span>, <span className="kbd">/</span>,{" "}
          <span className="kbd">Espaço</span>
        </div>
      </div>
    </header>
  );
}

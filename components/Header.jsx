"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

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
  const { lang, setLang, languages, messages } = useI18n();
  const copy = messages.header;
  const { theme, toggle } = useTheme();
  // Inicializa densidade do layout (normal/compact) ao montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("ui_density") || "normal";
    document.documentElement.setAttribute("data-density", saved);
    const colorTheme = localStorage.getItem("ui_color_theme") || "default";
    document.documentElement.setAttribute("data-color-theme", colorTheme);
  }, []);

  return (
    <header className="header">
      <div className="brand" style={{ gap: "14px" }}>
        <Image
          src="/icons/icon-192.png"
          alt={copy.logoAlt}
          width={54}
          height={54}
          style={{ borderRadius: "12px" }}
          priority
        />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{copy.title}</div>
            <span className="beta-pill">{copy.beta}</span>
          </div>
          <div className="small brand-sub">{copy.subtitle}</div>
        </div>
      </div>

      <div className="row">
        <select
          className="select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label={copy.languageLabel}
          style={{ minWidth: 120 }}
        >
          {languages.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Link
          href="/feedback"
          className="button primary"
          style={{ fontWeight: 600 }}
        >
          {copy.feedback}
        </Link>
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-pressed={theme === "light"}
          aria-label={theme === "dark" ? copy.toLight : copy.toDark}
          title={theme === "dark" ? copy.toLight : copy.toDark}
        >
          {theme === "dark" ? copy.darkLabel : copy.lightLabel}
        </button>
      </div>
    </header>
  );
}

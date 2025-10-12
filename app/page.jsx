"use client";
import { useEffect, useState } from "react";
import Tabs from "@/components/Tabs";
import TaskManager from "@/components/TaskManager";
import Pomodoro from "@/components/Pomodoro";
import StudyPlanner from "@/components/StudyPlanner";
import Finance from "@/components/Finance";
import QuickNotes from "@/components/QuickNotes";
import Settings from "@/components/Settings";
import Habits from "@/components/Habits";
import Insights from "@/components/Insights";
import CommandPalette from "@/components/CommandPalette";

export default function Page() {
  const [active, setActive] = useState("tarefas");

  // PWA install hint
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      const deferredPrompt = e;
      const btn = document.getElementById("install-btn");
      if (btn) {
        btn.style.display = "inline-block";
        btn.onclick = async () => {
          btn.style.display = "none";
          await deferredPrompt.prompt();
        };
      }
    });
  }, []);

  // ⌨️ Atalhos globais
  useEffect(() => {
    function onKey(e) {
      // Ctrl+1..8 -> troca de abas
      if (e.ctrlKey) {
        const map = {
          1: "tarefas",
          2: "foco",
          3: "estudos",
          4: "financas",
          5: "notas",
          6: "habitos",
          7: "config",
          8: "insights",
        };
        if (map[e.key]) {
          setActive(map[e.key]);
          e.preventDefault();
          return;
        }
      }
      // '/' -> focar busca em tarefas
      if (e.key === "/") {
        if (active !== "tarefas") setActive("tarefas");
        // dispara evento para o TaskManager focar a busca
        setTimeout(
          () => window.dispatchEvent(new Event("focus-task-search")),
          0
        );
        e.preventDefault();
        return;
      }
      // Espaço -> play/pause do Pomodoro quando na aba foco
      if (e.key === " " || e.code === "Space") {
        if (active === "foco") {
          window.dispatchEvent(new Event("pomodoro-toggle"));
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Navegação por evento (usado pela Command Palette)
  useEffect(() => {
    const onNav = (e) => {
      const key = e.detail;
      if (key) setActive(key);
    };
    window.addEventListener("navigate-tab", onNav);
    return () => window.removeEventListener("navigate-tab", onNav);
  }, []);

  // Shortcuts do PWA via querystring
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const shortcut = params.get("shortcut");
    if (tab) setActive(tab);
    if (shortcut === "new-task") {
      window.dispatchEvent(new Event("focus-task-input"));
    }
    if (shortcut === "foco") {
      window.dispatchEvent(new Event("pomodoro-toggle"));
    }
  }, []);

  return (
    <div>
      <Tabs
        tabs={{
          tarefas: { label: "Tarefas", icon: "✅" },
          foco: { label: "Foco", icon: "🎯" },
          estudos: { label: "Estudos", icon: "📚" },
          financas: { label: "Finanças", icon: "💰" },
          notas: { label: "Notas", icon: "📝" },
          habitos: { label: "Hábitos", icon: "📅" },
          insights: { label: "Insights", icon: "📊" },
          config: { label: "Configurações", icon: "⚙️" },
        }}
        onChange={setActive}
      />

      {active === "tarefas" && (
        <div className="grid">
          <TaskManager />
          <QuickNotes />
        </div>
      )}
      {active === "foco" && <Pomodoro />}
      {active === "estudos" && <StudyPlanner />}
      {active === "financas" && <Finance />}
      {active === "notas" && <QuickNotes />}
      {active === "habitos" && <Habits />}
      {active === "insights" && <Insights />}
      {active === "config" && <Settings />}

      <div style={{ marginTop: 16 }}>
        <button id="install-btn" className="button primary" style={{ display: "none" }}>
          Instalar no dispositivo
        </button>
        <div className="small">
          Atalhos: Ctrl+1..7 (abas), / (buscar tarefas), Espaço (Pomodoro)
        </div>
      </div>

      <div className="notice small" style={{ marginTop: 12 }}>
        ⚠️ Notificações agendadas funcionam com o app aberto. Para push em
        segundo plano, depois integramos Firebase Cloud Messaging.
      </div>

      <CommandPalette />
    </div>
  );
}

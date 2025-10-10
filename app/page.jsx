"use client";
import { useEffect, useState } from "react";
import Tabs from "@/components/Tabs";
import TaskManager from "@/components/TaskManager";
import Pomodoro from "@/components/Pomodoro";
import StudyPlanner from "@/components/StudyPlanner";
import Finance from "@/components/Finance";
import QuickNotes from "@/components/QuickNotes";
import Settings from "@/components/Settings"; // <— novo import

export default function Page() {
  const [active, setActive] = useState("tarefas");

  // Hint de instalação PWA
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

  return (
    <div>
      <Tabs
        tabs={{
          tarefas: "Tarefas",
          foco: "Foco",
          estudos: "Estudos",
          financas: "Finanças",
          notas: "Notas",
          config: "Configurações", // <— nova aba
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
      {active === "config" && <Settings />} {/* <— novo conteúdo */}
      <div style={{ marginTop: 16 }}>
        <button id="install-btn" className="button" style={{ display: "none" }}>
          Instalar no dispositivo
        </button>
        <div className="small">
          Para receber alertas: permita notificações no navegador.
        </div>
      </div>
      <div className="notice small" style={{ marginTop: 12 }}>
        ⚠️ Lembrete: notificações agendadas em PWA funcionam enquanto o app
        estiver aberto. Para lembretes robustos (push em segundo plano), podemos
        adicionar backend + push depois.
      </div>
    </div>
  );
}

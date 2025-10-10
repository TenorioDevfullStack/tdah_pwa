"use client";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/storage";

export default function Pomodoro() {
  const [settings, setSettings] = useState(
    load("pomodoro_settings", { work: 25, short: 5, long: 15, cycles: 4 })
  );
  const [mode, setMode] = useState("work");
  const [seconds, setSeconds] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    save("pomodoro_settings", settings);
  }, [settings]);

  useEffect(() => {
    let t;
    if (running) {
      t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (seconds === 0) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro", {
          body: mode === "work" ? "Hora do descanso!" : "Hora de focar!",
        });
      }
      if (mode === "work") {
        if (cycle % settings.cycles === 0) {
          setMode("long");
          setSeconds(settings.long * 60);
          setCycle(cycle + 1);
        } else {
          setMode("short");
          setSeconds(settings.short * 60);
          setCycle(cycle + 1);
        }
      } else {
        setMode("work");
        setSeconds(settings.work * 60);
      }
    }
  }, [seconds]);

  function resetTo(m) {
    setMode(m);
    setSeconds(settings[m] * 60);
    setRunning(false);
  }

  // 🔥 Ouve evento global para alternar play/pause (Space em app/page.jsx)
  useEffect(() => {
    const handler = () => setRunning((r) => !r);
    window.addEventListener("pomodoro-toggle", handler);
    return () => window.removeEventListener("pomodoro-toggle", handler);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="card">
      <h3>Foco (Pomodoro)</h3>
      <div className="timer">
        {mm}:{ss}
      </div>
      <div className="row">
        <button className="button" onClick={() => setRunning(!running)}>
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button className="button" onClick={() => resetTo(mode)}>
          Reiniciar
        </button>
        <span className="badge">Modo: {mode}</span>
        <span className="badge">Ciclo: {cycle}</span>
      </div>
      <hr />
      <div className="row">
        <label className="small">
          Foco (min){" "}
          <input
            className="input"
            type="number"
            value={settings.work}
            onChange={(e) =>
              setSettings({
                ...settings,
                work: parseInt(e.target.value || "25"),
              })
            }
          />
        </label>
        <label className="small">
          Pausa curta{" "}
          <input
            className="input"
            type="number"
            value={settings.short}
            onChange={(e) =>
              setSettings({
                ...settings,
                short: parseInt(e.target.value || "5"),
              })
            }
          />
        </label>
        <label className="small">
          Pausa longa{" "}
          <input
            className="input"
            type="number"
            value={settings.long}
            onChange={(e) =>
              setSettings({
                ...settings,
                long: parseInt(e.target.value || "15"),
              })
            }
          />
        </label>
        <label className="small">
          Ciclos p/longa{" "}
          <input
            className="input"
            type="number"
            value={settings.cycles}
            onChange={(e) =>
              setSettings({
                ...settings,
                cycles: parseInt(e.target.value || "4"),
              })
            }
          />
        </label>
      </div>
      <div className="small">
        Dica: ative as notificações do navegador para alertas.
      </div>
    </div>
  );
}

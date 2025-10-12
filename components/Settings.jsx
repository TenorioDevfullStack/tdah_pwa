"use client";
import { useEffect, useRef, useState } from "react";
import { load, save } from "@/lib/storage";

const KEYS = [
  "tasks",
  "study_topics",
  "study_history",
  "finance_items",
  "quick_notes",
  "pomodoro_settings",
];

export default function Settings() {
  const fileRef = useRef(null);
  const [density, setDensity] = useState(load("ui_density", "normal"));
  const [colorTheme, setColorTheme] = useState(load("ui_color_theme", "default"));

  function exportData() {
    const data = {};
    KEYS.forEach((k) => (data[k] = load(k, null)));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-minha-rotina-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        KEYS.forEach((k) => {
          if (k in data && data[k] !== undefined) {
            save(k, data[k]);
          }
        });
        alert("Importação concluída! Recarregue a página para ver os dados.");
      } catch (err) {
        alert("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  // Aplica densidade quando alterar
  useEffect(() => {
    save("ui_density", density);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", density);
    }
  }, [density]);

  useEffect(() => {
    save("ui_color_theme", colorTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-color-theme", colorTheme);
    }
  }, [colorTheme]);

  return (
    <div className="card">
      <h3>Configurações</h3>
      <div className="row">
        <button className="button" onClick={exportData}>
          Exportar dados (.json)
        </button>
        <button className="button" onClick={() => fileRef.current?.click()}>
          Importar dados (.json)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={importData}
          style={{ display: "none" }}
        />
      </div>
      <hr />
      <div className="row">
        <label className="small">
          Densidade de layout
          <select
            className="select"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="normal">Normal</option>
            <option value="compact">Compacto</option>
          </select>
        </label>
        <span className="small">Ajusta paddings e alturas para caber mais conteúdo.</span>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <label className="small">
          Tema de cor
          <select
            className="select"
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="default">Padrão</option>
            <option value="ocean">Ocean</option>
            <option value="sunset">Sunset</option>
            <option value="forest">Forest</option>
          </select>
        </label>
        <span className="small">Muda as cores de ícones, foco e destaques por seção.</span>
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        Inclui: tarefas, tópicos e histórico de estudos, finanças, notas e
        configurações do Pomodoro.
      </div>
    </div>
  );
}

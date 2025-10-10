"use client";
import { useRef } from "react";
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
      <div className="small" style={{ marginTop: 8 }}>
        Inclui: tarefas, tópicos e histórico de estudos, finanças, notas e
        configurações do Pomodoro.
      </div>
    </div>
  );
}

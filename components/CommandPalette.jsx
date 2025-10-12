"use client";
import { useEffect, useMemo, useState } from "react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQ("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions = useMemo(
    () => [
      { id: "go:tarefas", label: "Ir para Tarefas", hint: "Ctrl+1", run: () => goTab("tarefas") },
      { id: "go:foco", label: "Ir para Foco (Pomodoro)", hint: "Ctrl+2", run: () => goTab("foco") },
      { id: "go:estudos", label: "Ir para Estudos", hint: "Ctrl+3", run: () => goTab("estudos") },
      { id: "go:financas", label: "Ir para Finanças", hint: "Ctrl+4", run: () => goTab("financas") },
      { id: "go:notas", label: "Ir para Notas", hint: "Ctrl+5", run: () => goTab("notas") },
      { id: "go:habitos", label: "Ir para Hábitos", hint: "Ctrl+6", run: () => goTab("habitos") },
      { id: "go:config", label: "Ir para Configurações", hint: "Ctrl+7", run: () => goTab("config") },
      { id: "go:insights", label: "Ir para Insights", hint: "Ctrl+8", run: () => goTab("insights") },
      { id: "task:new", label: "Adicionar nova tarefa", hint: "N", run: () => quickNewTask() },
      { id: "task:search", label: "Buscar tarefas", hint: "/", run: () => focusTaskSearch() },
      { id: "pomodoro:toggle", label: "Iniciar/Pausar Pomodoro", hint: "Espaço", run: () => togglePomodoro() },
    ],
    []
  );

  function goTab(key) {
    window.dispatchEvent(new CustomEvent("navigate-tab", { detail: key }));
    setOpen(false);
  }
  function quickNewTask() {
    window.dispatchEvent(new Event("focus-task-input"));
    window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "tarefas" }));
    setOpen(false);
  }
  function focusTaskSearch() {
    window.dispatchEvent(new Event("focus-task-search"));
    window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "tarefas" }));
    setOpen(false);
  }
  function togglePomodoro() {
    window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "foco" }));
    window.dispatchEvent(new Event("pomodoro-toggle"));
    setOpen(false);
  }

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(q.toLowerCase())
  );

  if (!open) return null;
  return (
    <div className="cp-backdrop" onClick={() => setOpen(false)}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <input
          className="input"
          autoFocus
          placeholder="Digite um comando... (ex.: tarefas, foco, adicionar)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") filtered[0]?.run();
          }}
        />
        <div className="list" style={{ maxHeight: 240, overflow: "auto" }}>
          {filtered.map((a) => (
            <div key={a.id} className="item" onClick={a.run} style={{ cursor: "pointer" }}>
              <div>{a.label}</div>
              {a.hint && <span className="kbd">{a.hint}</span>}
            </div>
          ))}
          {!filtered.length && <div className="notice small">Sem resultados</div>}
        </div>
      </div>
    </div>
  );
}


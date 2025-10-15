"use client";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { messages } = useI18n();
  const copy = messages.commandPalette;

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
      {
        id: "go:tarefas",
        label: copy.actions.goTasks,
        hint: "Ctrl+1",
        run: () => goTab("tarefas"),
      },
      {
        id: "go:foco",
        label: copy.actions.goFocus,
        hint: "Ctrl+2",
        run: () => goTab("foco"),
      },
      {
        id: "go:estudos",
        label: copy.actions.goStudy,
        hint: "Ctrl+3",
        run: () => goTab("estudos"),
      },
      {
        id: "go:financas",
        label: copy.actions.goFinance,
        hint: "Ctrl+4",
        run: () => goTab("financas"),
      },
      {
        id: "go:notas",
        label: copy.actions.goNotes,
        hint: "Ctrl+5",
        run: () => goTab("notas"),
      },
      {
        id: "go:habitos",
        label: copy.actions.goHabits,
        hint: "Ctrl+6",
        run: () => goTab("habitos"),
      },
      {
        id: "go:config",
        label: copy.actions.goSettings,
        hint: "Ctrl+7",
        run: () => goTab("config"),
      },
      {
        id: "go:insights",
        label: copy.actions.goInsights,
        hint: "Ctrl+8",
        run: () => goTab("insights"),
      },
      {
        id: "task:new",
        label: copy.actions.newTask,
        hint: "N",
        run: () => quickNewTask(),
      },
      {
        id: "task:search",
        label: copy.actions.searchTasks,
        hint: "/",
        run: () => focusTaskSearch(),
      },
      {
        id: "pomodoro:toggle",
        label: copy.actions.togglePomodoro,
        hint: copy.hintSpace,
        run: () => togglePomodoro(),
      },
    ],
    [copy]
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
          placeholder={copy.placeholder}
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
          {!filtered.length && (
            <div className="notice small">{copy.noResults}</div>
          )}
        </div>
      </div>
    </div>
  );
}

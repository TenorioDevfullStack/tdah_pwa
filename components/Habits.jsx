"use client";
import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";

function uid() {
  return Math.random().toString(36).slice(2);
}

// 7 dias, semana iniciando na segunda
function getWeek(startFromToday = false) {
  const today = new Date();
  const day = today.getDay() || 7; // dom=0 -> 7
  const monday = new Date(today);
  monday.setDate(today.getDate() - (startFromToday ? 0 : day - 1));
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d
        .toLocaleDateString(undefined, { weekday: "short" })
        .replace(".", ""),
    });
  }
  return days;
}

export default function Habits() {
  const [habits, setHabits] = useState(
    load("habits_list", [
      { id: uid(), name: "Tomar medicação", active: true },
      { id: uid(), name: "Revisar agenda do dia", active: true },
      { id: uid(), name: "Sessão de estudo (25min)", active: true },
      { id: uid(), name: "Alongamento 5min", active: true },
      { id: uid(), name: "Revisar finanças rápidas", active: true },
    ])
  );
  const [checks, setChecks] = useState(load("habits_checks", {})); // { '2025-10-10': {habitId: true} }
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => save("habits_list", habits), [habits]);
  useEffect(() => save("habits_checks", checks), [checks]);

  const week = useMemo(() => getWeek(false), []);
  const checked = (date, hid) => !!checks?.[date]?.[hid];

  function toggle(date, hid) {
    setChecks((prev) => {
      const next = { ...prev };
      next[date] = next[date] ? { ...next[date] } : {};
      next[date][hid] = !next[date][hid];
      return next;
    });
  }

  function addHabit(e) {
    e.preventDefault();
    const name = newHabit.trim();
    if (!name) return;
    setHabits((prev) => [{ id: uid(), name, active: true }, ...prev]);
    setNewHabit("");
  }

  function removeHabit(id) {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    // opcional: limpar checks antigos desse hábito
  }

  function streak(hid) {
    // conta sequência de dias marcados (da direita p/ esquerda na semana)
    let s = 0;
    for (let i = week.length - 1; i >= 0; i--) {
      if (checked(week[i].date, hid)) s++;
      else break;
    }
    return s;
  }

  return (
    <div className="card">
      <h3>Hábitos (Checklist diário)</h3>

      <form onSubmit={addHabit} className="row">
        <input
          className="input"
          placeholder="Novo hábito..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          style={{ flex: 1, minWidth: 240 }}
        />
        <button className="button">Adicionar</button>
      </form>

      <div className="habits-grid" style={{ marginTop: 12 }}>
        <div></div>
        {week.map((d) => (
          <div key={d.date} className="habits-head">
            {d.label}
            <br />
            <span className="small">{d.date.slice(5)}</span>
          </div>
        ))}

        {habits.map((h) => (
          <div key={h.id} style={{ display: "contents" }}>
            <div className="habit-name">
              {h.name} <span className="streak">• streak: {streak(h.id)}d</span>
            </div>
            {week.map((d) => (
              <div
                key={d.date}
                className={
                  "habit-cell" + (checked(d.date, h.id) ? " checked" : "")
                }
                onClick={() => toggle(d.date, h.id)}
                title={d.date}
              >
                {checked(d.date, h.id) ? "✅" : ""}
              </div>
            ))}
            <div style={{ gridColumn: "1 / -1", display: "none" }} />
          </div>
        ))}
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        Dica: mantenha poucos hábitos essenciais. Consistência &gt; volume.
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        {habits.map((h) => (
          <button
            key={h.id}
            className="button"
            onClick={() => removeHabit(h.id)}
            style={{ borderColor: "var(--danger)" }}
          >
            Remover “{h.name}”
          </button>
        ))}
      </div>
    </div>
  );
}

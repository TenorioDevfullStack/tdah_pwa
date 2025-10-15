"use client";
import { useMemo } from "react";
import { load } from "@/lib/storage";
import { useI18n } from "@/components/I18nProvider";

function startOfWeek(d = new Date()) {
  const day = d.getDay() || 7; // dom->7
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - (day - 1));
  return monday;
}

export default function Insights() {
  const { messages } = useI18n();
  const copy = messages.insights;
  const tasks = load("tasks", []);
  const history = load("study_history", []);
  const finance = load("finance_items", []);
  const checks = load("habits_checks", {});

  const isIncome = (value) => {
    const key = (value || "").toString().toLowerCase();
    return key === "income" || key === "receita" || key === "ingreso";
  };

  const data = useMemo(() => {
    // Tarefas
    const today = new Date().toISOString().slice(0, 10);
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.done).length;
    const overdueTasks = tasks.filter((t) => t.due && !t.done && t.due < today).length;
    const todayTasks = tasks.filter((t) => t.due === today && !t.done).length;
    const completion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Estudos (semana atual)
    const start = startOfWeek();
    const weekHistory = history.filter((h) => new Date(h.date) >= start);
    const minutesByTopic = {};
    for (const h of weekHistory) minutesByTopic[h.topic] = (minutesByTopic[h.topic] || 0) + (h.minutes || 0);
    const topStudy = Object.entries(minutesByTopic).sort((a,b)=>b[1]-a[1])[0] || ["—", 0];
    const totalStudy = weekHistory.reduce((a, b) => a + (b.minutes || 0), 0);

    // Finanças (mês atual)
    const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthItems = finance.filter((i) => (i.date || "").startsWith(ym));
    const inSum = monthItems
      .filter((i) => isIncome(i.type))
      .reduce((a, b) => a + (b.amount || 0), 0);
    const outSum = monthItems
      .filter((i) => !isIncome(i.type))
      .reduce((a, b) => a + (b.amount || 0), 0);
    const balance = inSum - outSum;

    // Hábitos (semana atual)
    const weekDays = [...Array(7)].map((_,i)=>{
      const d = new Date(start);
      d.setDate(start.getDate()+i);
      return d.toISOString().slice(0,10);
    });
    let habitChecks = 0, habitTotal = 0;
    for (const date of weekDays) {
      const m = checks[date] || {};
      const values = Object.values(m);
      habitChecks += values.filter(Boolean).length;
      habitTotal += values.length;
    }
    const habitRate = habitTotal ? Math.round((habitChecks/ habitTotal)*100) : 0;

    return {
      tasks: { totalTasks, doneTasks, overdueTasks, todayTasks, completion },
      study: { totalStudy, topStudy },
      money: { inSum, outSum, balance },
      habits: { habitChecks, habitTotal, habitRate },
      weekDays,
      minutesByTopic,
    };
  }, [tasks, history, finance, checks, isIncome]);

  const bar = (value, max = 100) => {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    return (
      <div style={{ background: "#0e1427", border: "1px solid var(--border)", borderRadius: 8, height: 10, width: "100%" }}>
        <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 8 }} />
      </div>
    );
  };

  const sparkline = (points = [], max = 1) => {
    if (!points.length) return null;
    const w = 160, h = 40;
    const path = points.map((v,i)=>{
      const x = (i/(points.length-1))*w;
      const y = h - (v/(max||1))*h;
      return `${i?'L':'M'}${x},${y}`;
    }).join(' ');
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2"/>
      </svg>
    );
  };

  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="card">
          <h4>{copy.tasks.title}</h4>
          <div className="row">
            <span className="badge">
              {copy.tasks.total}: {data.tasks.totalTasks}
            </span>
            <span className="badge">
              {copy.tasks.done}: {data.tasks.doneTasks}
            </span>
            <span
              className="badge"
              style={{ borderColor: "var(--warn)" }}
            >
              {copy.tasks.today}: {data.tasks.todayTasks}
            </span>
            <span
              className="badge"
              style={{ borderColor: "var(--danger)" }}
            >
              {copy.tasks.overdue}: {data.tasks.overdueTasks}
            </span>
          </div>
          <div className="small" style={{ marginTop: 8 }}>
            {copy.tasks.completion}
          </div>
          {bar(data.tasks.completion, 100)}
        </div>

        <div className="card">
          <h4>{copy.study.title}</h4>
          <div className="row">
            <span className="badge">
              {copy.study.total}:{" "}
              {copy.study.minutes.replace(
                "{value}",
                data.study.totalStudy
              )}
            </span>
            <span className="badge">
              {copy.study.top}: {data.study.topStudy[0]} •{" "}
              {copy.study.minutes.replace(
                "{value}",
                data.study.topStudy[1]
              )}
            </span>
          </div>
          <div className="list">
            {Object.entries(data.minutesByTopic).map(([t, m]) => (
              <div className="item" key={t}>
                <div style={{ flex: 1 }}>{t}</div>
                <div style={{ width: 160 }}>{bar(m, Math.max(60, data.study.topStudy[1] || 60))}</div>
                <div
                  className="small"
                  style={{ width: 60, textAlign: "right" }}
                >
                  {copy.study.minutes.replace("{value}", m)}
                </div>
              </div>
            ))}
            {!Object.keys(data.minutesByTopic).length && (
              <div className="notice small">{copy.study.empty}</div>
            )}
          </div>
        </div>

        <div className="card">
          <h4>{copy.finance.title}</h4>
          <div className="row">
            <span className="badge">
              {copy.finance.income}: R${" "}
              {data.money.inSum.toFixed(2)}
            </span>
            <span className="badge">
              {copy.finance.expense}: R${" "}
              {data.money.outSum.toFixed(2)}
            </span>
            <span
              className="badge"
              style={{
                borderColor:
                  data.money.balance >= 0
                    ? "var(--ok)"
                    : "var(--danger)",
              }}
            >
              {copy.finance.balance}: R${" "}
              {data.money.balance.toFixed(2)}
            </span>
          </div>
          <div style={{marginTop:8}}>
            {sparkline([data.money.inSum, data.money.outSum, Math.max(0,data.money.balance)], Math.max(data.money.inSum, data.money.outSum, Math.abs(data.money.balance)||1))}
          </div>
        </div>

        <div className="card">
          <h4>{copy.habits.title}</h4>
          <div className="row">
            <span className="badge">
              {copy.habits.checks}: {data.habits.habitChecks}/
              {data.habits.habitTotal}
            </span>
            <span className="badge">
              {copy.habits.adherence}: {data.habits.habitRate}%
            </span>
          </div>
          <div style={{marginTop:8}}>
            {sparkline(
              data.weekDays.map(d => Object.values(load("habits_checks", {})[d]||{}).filter(Boolean).length),
              Math.max(1, ...data.weekDays.map(d => Object.values(load("habits_checks", {})[d]||{}).length))
            )}
          </div>
        </div>
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        {copy.tip}
      </div>
    </div>
  );
}

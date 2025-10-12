"use client";
import { useMemo } from "react";
import { load } from "@/lib/storage";

function startOfWeek(d = new Date()) {
  const day = d.getDay() || 7; // dom->7
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() - (day - 1));
  return monday;
}

export default function Insights() {
  const tasks = load("tasks", []);
  const history = load("study_history", []);
  const finance = load("finance_items", []);
  const checks = load("habits_checks", {});

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
    const inSum = monthItems.filter(i=>i.type==='Receita').reduce((a,b)=>a+b.amount,0);
    const outSum = monthItems.filter(i=>i.type!=='Receita').reduce((a,b)=>a+b.amount,0);
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
  }, [tasks, history, finance, checks]);

  const bar = (value, max = 100) => {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    return (
      <div style={{ background: "#0e1427", border: "1px solid var(--border)", borderRadius: 8, height: 10, width: "100%" }}>
        <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", borderRadius: 8 }} />
      </div>
    );
  };

  return (
    <div className="card">
      <h3>Insights</h3>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        <div className="card">
          <h4>Tarefas</h4>
          <div className="row">
            <span className="badge">Total: {data.tasks.totalTasks}</span>
            <span className="badge">Concluídas: {data.tasks.doneTasks}</span>
            <span className="badge" style={{ borderColor: "var(--warn)" }}>Hoje: {data.tasks.todayTasks}</span>
            <span className="badge" style={{ borderColor: "var(--danger)" }}>Atrasadas: {data.tasks.overdueTasks}</span>
          </div>
          <div className="small" style={{ marginTop: 8 }}>Taxa de conclusão</div>
          {bar(data.tasks.completion, 100)}
        </div>

        <div className="card">
          <h4>Estudos (semana)</h4>
          <div className="row">
            <span className="badge">Total: {data.study.totalStudy} min</span>
            <span className="badge">Top: {data.study.topStudy[0]} • {data.study.topStudy[1]} min</span>
          </div>
          <div className="list">
            {Object.entries(data.minutesByTopic).map(([t, m]) => (
              <div className="item" key={t}>
                <div style={{ flex: 1 }}>{t}</div>
                <div style={{ width: 160 }}>{bar(m, Math.max(60, data.study.topStudy[1] || 60))}</div>
                <div className="small" style={{ width: 60, textAlign: "right" }}>{m} min</div>
              </div>
            ))}
            {!Object.keys(data.minutesByTopic).length && (
              <div className="notice small">Sem sessões esta semana.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h4>Finanças (mês)</h4>
          <div className="row">
            <span className="badge">Receitas: R$ {data.money.inSum.toFixed(2)}</span>
            <span className="badge">Despesas: R$ {data.money.outSum.toFixed(2)}</span>
            <span className="badge" style={{ borderColor: data.money.balance>=0? 'var(--ok)':'var(--danger)' }}>Saldo: R$ {data.money.balance.toFixed(2)}</span>
          </div>
        </div>

        <div className="card">
          <h4>Hábitos (semana)</h4>
          <div className="row">
            <span className="badge">Checks: {data.habits.habitChecks}/{data.habits.habitTotal}</span>
            <span className="badge">Adesão: {data.habits.habitRate}%</span>
          </div>
        </div>
      </div>
      <div className="small" style={{ marginTop: 8 }}>
        Dica: mantenha rotinas consistentes e revise metas semanalmente.
      </div>
    </div>
  );
}


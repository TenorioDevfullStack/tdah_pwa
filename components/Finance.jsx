"use client";

import { useEffect, useMemo, useState } from "react";
import { load, save } from "@/lib/storage";
import { useI18n } from "@/components/I18nProvider";

function uid() {
  return Math.random().toString(36).slice(2);
}

function normalizeKey(value) {
  if (!value) return "";
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const CATEGORY_MAP = {
  transporte: "transporte",
  transport: "transporte",
  alimentacao: "alimentacao",
  alimentacion: "alimentacao",
  food: "alimentacao",
  moradia: "moradia",
  vivienda: "moradia",
  housing: "moradia",
  saude: "saude",
  salud: "saude",
  health: "saude",
  lazer: "lazer",
  ocio: "lazer",
  leisure: "lazer",
  educacao: "educacao",
  educacion: "educacao",
  education: "educacao",
  trabalho: "trabalho",
  trabajo: "trabalho",
  work: "trabalho",
  outros: "outros",
  otros: "outros",
  other: "outros",
};

const TYPE_MAP = {
  despesa: "expense",
  gasto: "expense",
  expense: "expense",
  receita: "income",
  ingreso: "income",
  income: "income",
};

function normalizeFinanceItem(item) {
  if (!item || typeof item !== "object") return null;
  const type =
    TYPE_MAP[normalizeKey(item.type)] ??
    (item.type === "income" || item.type === "expense"
      ? item.type
      : "expense");
  const cat =
    CATEGORY_MAP[normalizeKey(item.cat)] ??
    (item.cat ? normalizeKey(item.cat) : "outros");
  const rawAmount =
    typeof item.amount === "number"
      ? item.amount
      : parseFloat(
          (item.amount ?? "0").toString().replace(",", ".")
        );
  return {
    id: item.id || uid(),
    type,
    desc: (item.desc ?? "").toString(),
    cat: cat || "outros",
    date: (item.date ?? "").toString(),
    amount: Number.isFinite(rawAmount) ? rawAmount : 0,
  };
}

export default function Finance() {
  const { messages } = useI18n();
  const copy = messages.finance;
  const undoLabel = messages.common.toast.undo;
  const categoryLabelMap = useMemo(() => {
    const map = {};
    copy.categories.forEach((c) => {
      map[c.value] = c.label;
    });
    return map;
  }, [copy.categories]);

  const [items, setItems] = useState(() => {
    const stored = load("finance_items", []);
    if (!Array.isArray(stored)) return [];
    return stored
      .map(normalizeFinanceItem)
      .filter(Boolean);
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => save("finance_items", items), [items]);

  function add(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const desc = (form.get("desc") || "").toString().trim();
    if (!desc) return;
    const amountValue = (form.get("amount") || "0")
      .toString()
      .replace(",", ".");
    const entry = normalizeFinanceItem({
      id: uid(),
      type: (form.get("type") || "expense").toString(),
      desc,
      cat: (form.get("cat") || "outros").toString(),
      date: (form.get("date") || "").toString(),
      amount: amountValue,
    });
    setItems((prev) => [entry, ...prev]);
    e.currentTarget.reset();
  }

  function del(id) {
    setItems((prev) => {
      const removed = prev.find((i) => i.id === id);
      const next = prev.filter((i) => i.id !== id);
      if (removed) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              text: `${copy.removedToast} ${removed.desc || ""}`,
              actionLabel: undoLabel,
              onAction: () =>
                setItems((curr) => [removed, ...curr]),
            },
          })
        );
      }
      return next;
    });
  }

  const summary = useMemo(() => {
    const incomeSum = items
      .filter((i) => i.type === "income")
      .reduce((acc, item) => acc + item.amount, 0);
    const expenseSum = items
      .filter((i) => i.type !== "income")
      .reduce((acc, item) => acc + item.amount, 0);
    return {
      inSum: incomeSum,
      outSum: expenseSum,
      balance: incomeSum - expenseSum,
    };
  }, [items]);

  const view = useMemo(() => {
    const list =
      filter === "all"
        ? items
        : items.filter((i) => i.cat === filter);
    return list
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [items, filter]);

  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <div className="row">
        <div className="badge">
          {copy.income}: R$ {summary.inSum.toFixed(2)}
        </div>
        <div className="badge">
          {copy.expense}: R$ {summary.outSum.toFixed(2)}
        </div>
        <div
          className="badge"
          style={{
            borderColor:
              summary.balance >= 0
                ? "var(--ok)"
                : "var(--danger)",
          }}
        >
          {copy.balance}: R$ {summary.balance.toFixed(2)}
        </div>
      </div>
      <form
        onSubmit={add}
        className="row"
        style={{ marginTop: 8 }}
      >
        <select className="select" name="type" defaultValue="expense">
          <option value="expense">{copy.types.expense}</option>
          <option value="income">{copy.types.income}</option>
        </select>
        <input
          className="input"
          name="desc"
          placeholder={copy.description}
        />
        <select className="select" name="cat" defaultValue="outros">
          {copy.categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input className="input" name="date" type="date" />
        <input
          className="input"
          name="amount"
          placeholder={copy.amount}
        />
        <button className="button primary">
          {copy.addButton}
        </button>
      </form>

      <div className="row" style={{ marginTop: 8 }}>
        <select
          className="select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">{copy.filterAll}</option>
          {copy.categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="list">
        {view.map((i) => (
          <div key={i.id} className="item">
            <div>
              <div style={{ fontWeight: 600 }}>
                {i.desc} •{" "}
                <span className="badge">
                  {categoryLabelMap[i.cat] || i.cat}
                </span>
              </div>
              <div className="small">
                {i.date || "—"} •{" "}
                {copy.types[i.type] || i.type}
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>
              {i.type === "income" ? "+" : "-"} R${" "}
              {i.amount.toFixed(2)}
            </div>
            <button
              className="button danger"
              onClick={() => del(i.id)}
            >
              {copy.deleteButton}
            </button>
          </div>
        ))}
        {!view.length && (
          <div className="notice small">{copy.empty}</div>
        )}
      </div>
    </div>
  );
}


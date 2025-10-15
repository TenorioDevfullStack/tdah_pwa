"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { load, save } from "@/lib/storage";
import { useI18n } from "@/components/I18nProvider";

const TODAY = () => new Date().toISOString().slice(0, 10);

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function normalizeTask(
  task,
  priorityValues,
  repeatValues
) {
  if (!task || typeof task !== "object") {
    return {
      id: randomId(),
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: "",
      notes: "",
      due: "",
      priority: "medium",
      area: "",
      repeat: "none",
    };
  }
  return {
    id: task.id || randomId(),
    title: typeof task.title === "string" ? task.title : "",
    notes: typeof task.notes === "string" ? task.notes : "",
    done: Boolean(task.done),
    priority: priorityValues.has(task.priority) ? task.priority : "medium",
    area: typeof task.area === "string" ? task.area : "",
    due: typeof task.due === "string" ? task.due : "",
    repeat: repeatValues.has(task.repeat) ? task.repeat : "none",
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || null,
  };
}

function nextDueDate(currentDue, repeat) {
  if (!currentDue) return "";
  const base = new Date(currentDue + "T00:00:00");
  if (Number.isNaN(base.getTime())) return "";
  switch (repeat) {
    case "daily":
      base.setDate(base.getDate() + 1);
      break;
    case "weekly":
      base.setDate(base.getDate() + 7);
      break;
    case "monthly":
      base.setMonth(base.getMonth() + 1);
      break;
    default:
      return "";
  }
  return base.toISOString().slice(0, 10);
}

function formatDateLabel(isoDate, labels) {
  if (!isoDate) return labels.none;
  const today = TODAY();
  if (isoDate === today) return labels.today;
  const tomorrow = new Date(today + "T00:00:00");
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isoDate === tomorrow.toISOString().slice(0, 10)) return labels.tomorrow;
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default function TaskManager() {
  const { messages } = useI18n();
  const copy = messages.taskManager;
  const dateLabels = messages.common.date;
  const priorityValues = useMemo(
    () => new Set(copy.priorities.map((p) => p.value)),
    [copy.priorities]
  );
  const repeatValues = useMemo(
    () => new Set(copy.repeats.map((r) => r.value)),
    [copy.repeats]
  );
  const areaLabelMap = useMemo(() => {
    const map = {};
    copy.areas.forEach((a) => {
      map[a.value] = a.label;
    });
    return map;
  }, [copy.areas]);
  const priorityBadgeMap = useMemo(() => {
    const map = {};
    copy.priorities.forEach((p) => {
      map[p.value] = p.badge;
    });
    return map;
  }, [copy.priorities]);
  const repeatLabelMap = useMemo(() => {
    const map = {};
    copy.repeats.forEach((r) => {
      map[r.value] = r.label;
    });
    return map;
  }, [copy.repeats]);

  const [tasks, setTasks] = useState(() => {
    const stored = load("tasks", []);
    if (!Array.isArray(stored)) return [];
    return stored.map((task) =>
      normalizeTask(task, priorityValues, repeatValues)
    );
  });
  const [newTask, setNewTask] = useState({
    title: "",
    due: "",
    priority: "medium",
    area: "",
    repeat: "none",
    notes: "",
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("pending");
  const [showDetails, setShowDetails] = useState(false);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    save("tasks", tasks);
  }, [tasks]);

  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select?.();
      }
    };
    const focusSearch = () => {
      if (searchRef.current) {
        searchRef.current.focus();
        searchRef.current.select?.();
      }
    };
    window.addEventListener("focus-task-input", focusInput);
    window.addEventListener("focus-task-search", focusSearch);
    return () => {
      window.removeEventListener("focus-task-input", focusInput);
      window.removeEventListener("focus-task-search", focusSearch);
    };
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const today = tasks.filter((t) => !t.done && t.due === TODAY()).length;
    const overdue = tasks.filter(
      (t) => !t.done && t.due && t.due < TODAY()
    ).length;
    return { total, done, today, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = TODAY();
    return tasks
      .filter((task) => {
        if (q) {
          const haystack = `${task.title} ${task.notes || ""} ${
            task.area || ""
          }`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (filter === "pending") return !task.done;
        if (filter === "today") return !task.done && task.due === today;
        if (filter === "overdue")
          return !task.done && task.due && task.due < today;
        if (filter === "done") return task.done;
        return true;
      })
      .slice()
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.due && b.due) {
          if (a.due === b.due) return a.title.localeCompare(b.title);
          return a.due < b.due ? -1 : 1;
        }
        if (a.due) return -1;
        if (b.due) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [tasks, filter, query]);

  function handleSubmit(e) {
    e.preventDefault();
    const title = newTask.title.trim();
    if (!title) return;
    const base = normalizeTask({
      title,
      due: newTask.due,
      priority: newTask.priority,
      area: newTask.area,
      repeat: newTask.repeat,
      notes: showDetails ? newTask.notes : "",
    }, priorityValues, repeatValues);
    const now = new Date().toISOString();
    base.createdAt = now;
    base.updatedAt = now;
    setTasks((current) => [base, ...current]);
    setNewTask({
      title: "",
      due: "",
      priority: "medium",
      area: "",
      repeat: "none",
      notes: "",
    });
    setShowDetails(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        const done = !task.done;
        const updatedAt = new Date().toISOString();
        const completedAt = done ? updatedAt : null;
        let next = { ...task, done, updatedAt, completedAt };
        if (done && task.repeat !== "none") {
          const nextDue = nextDueDate(task.due, task.repeat);
          if (nextDue) {
            next = {
              ...next,
              done: false,
              due: nextDue,
              updatedAt,
              completedAt: null,
            };
          }
        }
        return next;
      })
    );
  }

  function removeTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function updateTaskField(id, patch) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, ...patch, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }

  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <form
        onSubmit={handleSubmit}
        className="row"
        style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}
      >
        <input
          ref={inputRef}
          className="input"
          style={{ flex: "2 1 220px" }}
          value={newTask.title}
          onChange={(e) =>
            setNewTask((t) => ({ ...t, title: e.target.value }))
          }
          placeholder={copy.taskPlaceholder}
        />
        <input
          type="date"
          className="input"
          style={{ flex: "1 1 160px" }}
          value={newTask.due}
          onChange={(e) =>
            setNewTask((t) => ({ ...t, due: e.target.value }))
          }
          aria-label="Data"
        />
        <select
          className="select"
          style={{ flex: "1 1 160px" }}
          value={newTask.priority}
          onChange={(e) =>
            setNewTask((t) => ({ ...t, priority: e.target.value }))
          }
        >
          {copy.priorities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ flex: "1 1 160px" }}
          value={newTask.area}
          onChange={(e) =>
            setNewTask((t) => ({ ...t, area: e.target.value }))
          }
        >
          {copy.areas.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="select"
          style={{ flex: "1 1 160px" }}
          value={newTask.repeat}
          onChange={(e) =>
            setNewTask((t) => ({ ...t, repeat: e.target.value }))
          }
        >
          {copy.repeats.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="button primary" type="submit" style={{ flex: "1 1 140px" }}>
          {copy.addButton}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setShowDetails((v) => !v)}
          style={{ flex: "0 0 auto" }}
        >
          {showDetails ? copy.hideDetails : copy.showDetails}
        </button>
        {showDetails && (
          <textarea
            className="input"
            style={{ width: "100%" }}
            value={newTask.notes || ""}
            onChange={(e) =>
              setNewTask((t) => ({ ...t, notes: e.target.value }))
            }
            placeholder={copy.notesPlaceholder}
          />
        )}
      </form>

      <div
        className="row"
        style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}
      >
        <input
          ref={searchRef}
          className="input"
          style={{ flex: "2 1 240px" }}
          placeholder={copy.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="select"
          style={{ flex: "1 1 180px" }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["pending", "today", "overdue", "done", "all"].map((key) => (
            <option key={key} value={key}>
              {copy.filters[key]}
            </option>
          ))}
        </select>
        <div className="small" style={{ flex: "1 1 180px" }}>
          {copy.summary.total}: {stats.total} • {copy.summary.pending}:{" "}
          {stats.total - stats.done} • {copy.summary.today}: {stats.today} •{" "}
          {copy.summary.overdue}: {stats.overdue}
        </div>
      </div>

      <div className="list" style={{ display: "grid", gap: 12 }}>
        {!filteredTasks.length && (
          <div className="notice small">{copy.empty}</div>
        )}
        {filteredTasks.map((task) => (
          <div key={task.id} className="item task-item">
            <label style={{ display: "flex", gap: 12, flex: "2 1 60%" }}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <div
                className="task-item__info"
                style={{ display: "grid", gap: 4 }}
              >
                <strong
                  style={{
                    textDecoration: task.done ? "line-through" : "none",
                    color: task.done ? "var(--subtle)" : "inherit",
                  }}
                >
                  {task.title || copy.untitled}
                </strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span className="badge">
                    {priorityBadgeMap[task.priority] ||
                      priorityBadgeMap.medium}
                  </span>
                  <span
                    className="badge"
                    style={{
                      borderColor:
                        task.due && !task.done && task.due < TODAY()
                          ? "rgba(var(--danger),0.6)"
                          : undefined,
                    }}
                  >
                    {formatDateLabel(task.due, dateLabels)}
                  </span>
                  {task.area && (
                    <span className="badge">
                      {copy.areaLabel}: {areaLabelMap[task.area] || task.area}
                    </span>
                  )}
                  {task.repeat !== "none" && (
                    <span className="badge">
                      {copy.repeatLabel}: {repeatLabelMap[task.repeat]}
                    </span>
                  )}
                  {task.notes && (
                    <span className="badge" title={task.notes}>
                      {copy.notesBadge}
                    </span>
                  )}
                </div>
                {task.notes && (
                  <div className="small" style={{ whiteSpace: "pre-wrap" }}>
                    {task.notes}
                  </div>
                )}
              </div>
            </label>
            <div
              className="task-item__actions"
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flex: "1 1 40%",
                justifyContent: "flex-end",
              }}
            >
              <select
                className="select"
                value={task.priority}
                onChange={(e) =>
                  updateTaskField(task.id, { priority: e.target.value })
                }
                style={{ maxWidth: 140 }}
              >
                {copy.priorities.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="input"
                value={task.due}
                onChange={(e) =>
                  updateTaskField(task.id, { due: e.target.value })
                }
                style={{ maxWidth: 150 }}
              />
              <button
                className="button"
                type="button"
                onClick={() => removeTask(task.id)}
              >
                {copy.removeButton}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

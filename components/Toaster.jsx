"use client";
import { useEffect, useState } from "react";

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function onToast(e) {
      const t = e.detail || {};
      const id = Math.random().toString(36).slice(2);
      const toast = { id, ...t };
      setToasts((prev) => [...prev, toast]);
      if (t.duration !== 0) {
        setTimeout(() => dismiss(id), t.duration || 5000);
      }
    }
    window.addEventListener("toast", onToast);
    return () => window.removeEventListener("toast", onToast);
  }, []);

  function dismiss(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="toaster" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <div className="toast-msg">{t.text}</div>
          {t.actionLabel && (
            <button
              className="button ghost"
              onClick={() => {
                try { t.onAction && t.onAction(); } catch {}
                dismiss(t.id);
              }}
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}


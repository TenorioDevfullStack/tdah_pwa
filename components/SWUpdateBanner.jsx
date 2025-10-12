"use client";
import { useEffect, useState } from "react";

export default function SWUpdateBanner() {
  const [waitingReg, setWaitingReg] = useState(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let regRef;
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        regRef = reg;
        if (!reg) return;
        if (reg.waiting) setWaitingReg(reg);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && reg.waiting) {
              setWaitingReg(reg);
            }
          });
        });
      })
      .catch(() => {});

    const onControllerChange = () => {
      // SW ativado; recarrega a página para nova versão
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waitingReg) return null;

  function updateNow() {
    try {
      waitingReg.waiting?.postMessage({ type: "SKIP_WAITING" });
      // Quando o controlador mudar, recarregamos
    } catch {}
  }

  return (
    <div className="toast sw-update">
      <div className="toast-msg">Nova versão disponível</div>
      <button className="button primary" onClick={updateNow}>Atualizar</button>
    </div>
  );
}


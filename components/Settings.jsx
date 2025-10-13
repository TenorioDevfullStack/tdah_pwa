"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const [density, setDensity] = useState(load("ui_density", "normal"));
  const [colorTheme, setColorTheme] = useState(load("ui_color_theme", "default"));
  const [fcmToken, setFcmToken] = useState("");
  const [sendTitle, setSendTitle] = useState("Teste");
  const [sendBody, setSendBody] = useState("Olá do FCM!");
  const ENABLE_FCM = process.env.NEXT_PUBLIC_ENABLE_FCM !== 'false';

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

  // Aplica densidade quando alterar
  useEffect(() => {
    save("ui_density", density);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-density", density);
    }
  }, [density]);

  useEffect(() => {
    save("ui_color_theme", colorTheme);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-color-theme", colorTheme);
    }
  }, [colorTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("fcm_token") || "";
    setFcmToken(t);
  }, []);

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
      <hr />
      <div className="row">
        <label className="small">
          Densidade de layout
          <select
            className="select"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="normal">Normal</option>
            <option value="compact">Compacto</option>
          </select>
        </label>
        <span className="small">Ajusta paddings e alturas para caber mais conteúdo.</span>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <label className="small">
          Tema de cor
          <select
            className="select"
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="default">Padrão</option>
            <option value="ocean">Ocean</option>
            <option value="sunset">Sunset</option>
            <option value="forest">Forest</option>
          </select>
        </label>
        <span className="small">Muda as cores de ícones, foco e destaques por seção.</span>
      </div>

      {ENABLE_FCM && (<>
      <hr />
      <h4>Notificações (FCM)</h4>
      <div className="row">
        <input className="input" readOnly value={fcmToken} style={{flex:1,minWidth:260}} placeholder="Token FCM"/>
        <button
          className="button"
          type="button"
          onClick={async ()=>{
            try{
              await navigator.clipboard.writeText(fcmToken||'');
              window.dispatchEvent(new CustomEvent('toast',{detail:{text:'Token copiado'}}));
            }catch{}
          }}
        >Copiar token</button>
        <button
          className="button primary"
          type="button"
          onClick={async ()=>{
            try{
              if (Notification.permission !== 'granted') await Notification.requestPermission();
              const reg = await navigator.serviceWorker?.ready;
              if (reg?.showNotification){
                reg.showNotification('Teste local', { body:'Isto é um teste local (sem FCM).', icon:'/icons/icon-192.png' });
              }else{
                new Notification('Teste local',{ body:'Isto é um teste local (sem FCM).' });
              }
            }catch(e){}
          }}
        >Notificação local (teste)</button>
        <button
          className="button"
          type="button"
          onClick={()=>{
            const perm = Notification?.permission;
            window.dispatchEvent(new CustomEvent('toast',{detail:{text:`Permissão: ${perm||'indisponível'}`}}));
          }}
        >Ver permissão</button>
      </div>
      <div className="small" style={{marginTop:8}}>
        Para testar via API v1, use o script <code>npm run send:fcm</code> e informe o token acima.
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <input className="input" value={sendTitle} onChange={e=>setSendTitle(e.target.value)} placeholder="Título"/>
        <input className="input" value={sendBody} onChange={e=>setSendBody(e.target.value)} placeholder="Corpo" style={{flex:1,minWidth:220}}/>
        <button
          className="button primary"
          type="button"
          onClick={async ()=>{
            try{
              const res = await fetch('/api/fcm/send', {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ token: fcmToken, title: sendTitle, body: sendBody, link: window.location.origin })
              })
              const txt = await res.text()
              if(res.ok){
                window.dispatchEvent(new CustomEvent('toast',{detail:{text:'Enviado pelo servidor'}}))
              }else{
                window.dispatchEvent(new CustomEvent('toast',{detail:{text:'Falha no envio: '+txt}}))
              }
            }catch(e){
              window.dispatchEvent(new CustomEvent('toast',{detail:{text:'Erro: '+(e?.message||e)}}))
            }
          }}
        >Enviar teste (servidor)</button>
      </div>
      </>)}

      {process.env.NODE_ENV !== 'production' && (
        <div className="row" style={{ marginTop: 8 }}>
          <Link href="/debug/fcm" className="button">Abrir Debug FCM</Link>
        </div>
      )}
      <div className="small" style={{ marginTop: 8 }}>
        Inclui: tarefas, tópicos e histórico de estudos, finanças, notas e
        configurações do Pomodoro.
      </div>
    </div>
  );
}

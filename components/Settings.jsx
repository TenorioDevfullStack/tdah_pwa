"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { load, save } from "@/lib/storage";
import { useI18n } from "@/components/I18nProvider";

const KEYS = [
  "tasks",
  "study_topics",
  "study_history",
  "finance_items",
  "quick_notes",
  "pomodoro_settings",
];

export default function Settings() {
  const { messages } = useI18n();
  const copy = messages.settings;
  const fcmCopy = copy.fcm;
  const fileRef = useRef(null);
  const [density, setDensity] = useState(load("ui_density", "normal"));
  const [colorTheme, setColorTheme] = useState(load("ui_color_theme", "default"));
  const [fcmToken, setFcmToken] = useState("");
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const ENABLE_DEV_TOOLS =
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";
  const ENABLE_FCM =
    ENABLE_DEV_TOOLS && process.env.NEXT_PUBLIC_ENABLE_FCM !== "false";

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
        alert(copy.importSuccess);
      } catch (err) {
        alert(copy.importError);
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
    if (!ENABLE_FCM) return;
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("fcm_token") || "";
    setFcmToken(t);
  }, [ENABLE_FCM]);

  return (
    <div className="card">
      <h3>{copy.title}</h3>
      <div className="row">
        <button className="button" onClick={exportData}>
          {copy.export}
        </button>
        <button className="button" onClick={() => fileRef.current?.click()}>
          {copy.import}
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
          {copy.densityLabel}
          <select
            className="select"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="normal">{copy.densityNormal}</option>
            <option value="compact">{copy.densityCompact}</option>
          </select>
        </label>
        <span className="small">{copy.densityHint}</span>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <label className="small">
          {copy.colorThemeLabel}
          <select
            className="select"
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="default">{copy.colorThemeDefault}</option>
            <option value="ocean">{copy.colorThemeOcean}</option>
            <option value="sunset">{copy.colorThemeSunset}</option>
            <option value="forest">{copy.colorThemeForest}</option>
          </select>
        </label>
        <span className="small">{copy.colorThemeHint}</span>
      </div>

      {ENABLE_FCM && (<>
      <hr />
      <h4>{fcmCopy.title}</h4>
      <div className="row">
        <input className="input" readOnly value={fcmToken} style={{flex:1,minWidth:260}} placeholder={fcmCopy.placeholder}/>
        <button
          className="button"
          type="button"
          onClick={async ()=>{
            try{
              await navigator.clipboard.writeText(fcmToken||'');
              window.dispatchEvent(new CustomEvent('toast',{detail:{text:fcmCopy.copyToast}}));
            }catch{}
          }}
        >{fcmCopy.copyToken}</button>
        <button
          className="button primary"
          type="button"
          onClick={async ()=>{
            try{
              if (Notification.permission !== 'granted') await Notification.requestPermission();
              const reg = await navigator.serviceWorker?.ready;
              if (reg?.showNotification){
                reg.showNotification(fcmCopy.localTitle, { body:fcmCopy.localBody, icon:'/icons/icon-192.png' });
              }else{
                new Notification(fcmCopy.localTitle,{ body:fcmCopy.localBody });
              }
            }catch(e){}
          }}
        >{fcmCopy.localButton}</button>
        <button
          className="button"
          type="button"
          onClick={()=>{
            const perm = Notification?.permission;
            window.dispatchEvent(new CustomEvent('toast',{detail:{text:`${fcmCopy.permToast} ${perm||'—'}`}}));
          }}
        >{fcmCopy.permButton}</button>
      </div>
      <div className="small" style={{marginTop:8}}>
        {fcmCopy.hint}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <input className="input" value={sendTitle} onChange={e=>setSendTitle(e.target.value)} placeholder={fcmCopy.titlePlaceholder}/>
        <input className="input" value={sendBody} onChange={e=>setSendBody(e.target.value)} placeholder={fcmCopy.bodyPlaceholder} style={{flex:1,minWidth:220}}/>
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
                window.dispatchEvent(new CustomEvent('toast',{detail:{text:fcmCopy.toastSuccess}}))
              }else{
                window.dispatchEvent(new CustomEvent('toast',{detail:{text:`${fcmCopy.toastFail} ${txt}`}}))
              }
            }catch(e){
              window.dispatchEvent(new CustomEvent('toast',{detail:{text:`${fcmCopy.toastError} ${(e?.message||e)}`}}))
            }
          }}
        >{fcmCopy.serverTest}</button>
      </div>
      </>)}

      {(process.env.NODE_ENV !== 'production' ||
        process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true') && (
        <div className="row" style={{ marginTop: 8 }}>
          <Link href="/debug/fcm" className="button">{copy.debugLink}</Link>
        </div>
      )}
      <div className="small" style={{ marginTop: 8 }}>
        {copy.backupHint}
      </div>
    </div>
  );
}

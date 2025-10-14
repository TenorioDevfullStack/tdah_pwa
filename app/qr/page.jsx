"use client";
import { useMemo, useState } from "react";

const DEV_TOOLS =
  process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true";

export default function QRPage() {
  if (!DEV_TOOLS) {
    return (
      <div className="card">
        <h3>QR Code</h3>
        <div className="small">
          Disponível apenas na versão de desenvolvedor
          (defina <code>NEXT_PUBLIC_ENABLE_DEV_TOOLS=true</code>).
        </div>
      </div>
    );
  }
  const [source, setSource] = useState("qr");
  const [medium, setMedium] = useState("offline");
  const [campaign, setCampaign] = useState("teste-v1");
  const [size, setSize] = useState(512);

  const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareUrl = useMemo(() => {
    const u = new URL(base || "");
    u.searchParams.set("utm_source", source || "qr");
    u.searchParams.set("utm_medium", medium || "offline");
    u.searchParams.set("utm_campaign", campaign || "teste-v1");
    return u.toString();
  }, [base, source, medium, campaign]);

  const qrUrl = useMemo(() => {
    const data = encodeURIComponent(shareUrl);
    const s = `${size}x${size}`;
    // Simple external QR API (works fine for tests/share)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${s}&data=${data}`;
  }, [shareUrl, size]);

  async function copyLink(){
    try{ await navigator.clipboard.writeText(shareUrl); alert("Link copiado"); }catch{}
  }

  async function shareNative(){
    try{
      if (navigator.share) await navigator.share({ title: "Rotina TDAH", text: "Teste o app:", url: shareUrl });
    }catch{}
  }

  return (
    <div className="card">
      <h3>QR Code para divulgação</h3>
      <div className="row" style={{marginBottom:8}}>
        <label className="small">utm_source
          <input className="input" value={source} onChange={e=>setSource(e.target.value)} style={{marginLeft:8}}/>
        </label>
        <label className="small">utm_medium
          <input className="input" value={medium} onChange={e=>setMedium(e.target.value)} style={{marginLeft:8}}/>
        </label>
        <label className="small">utm_campaign
          <input className="input" value={campaign} onChange={e=>setCampaign(e.target.value)} style={{marginLeft:8}}/>
        </label>
        <label className="small">Tamanho
          <select className="select" value={size} onChange={e=>setSize(parseInt(e.target.value||"512"))} style={{marginLeft:8}}>
            {[256, 384, 512, 768].map(s=> <option key={s} value={s}>{s}px</option>)}
          </select>
        </label>
      </div>

      <div className="row" style={{marginBottom:8}}>
        <input className="input" readOnly value={shareUrl} style={{flex:1,minWidth:280}}/>
        <button className="button" onClick={copyLink}>Copiar link</button>
        <a className="button primary" href={qrUrl} download={`tdah-qr-${size}.png`}>Baixar PNG</a>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button className="button" onClick={shareNative}>Compartilhar</button>
        )}
      </div>

      <div style={{display:'grid',placeItems:'center',padding:12}}>
        <img src={qrUrl} alt="QR Code" width={size} height={size} style={{borderRadius:12,border:'1px solid var(--border)'}}/>
      </div>

      <div className="small" style={{marginTop:8}}>
        Dica: gere um QR com utm_source diferente para Instagram, WhatsApp e impressos.
      </div>
    </div>
  );
}

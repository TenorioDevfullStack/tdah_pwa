// Server-side endpoint to send FCM messages via HTTP v1
// Prefers credentials from env GOOGLE_SERVICE_ACCOUNT_JSON.
// Falls back to GOOGLE_APPLICATION_CREDENTIALS path, then ./service-account.json.

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export const runtime = 'nodejs'

function loadServiceAccount() {
  // 1) JSON inline in env
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (inline) {
    try { return JSON.parse(inline) } catch {}
  }
  // 2) path via env
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (p && fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch {}
  }
  // 3) local default file
  const local = path.join(process.cwd(), 'service-account.json')
  if (fs.existsSync(local)) {
    try { return JSON.parse(fs.readFileSync(local, 'utf8')) } catch {}
  }
  return null
}

function b64urlJSON(obj){
  return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
}

async function getAccessToken(sa){
  const iat = Math.floor(Date.now()/1000)
  const exp = iat + 3600
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat, exp,
  }
  const input = `${b64urlJSON(header)}.${b64urlJSON(payload)}`
  const sign = crypto.createSign('RSA-SHA256').update(input).sign(sa.private_key,'base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const assertion = `${input}.${sign}`
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Token error ${resp.status}: ${text}`)
  }
  const json = await resp.json()
  return json.access_token
}

export async function POST(req){
  try{
    const body = await req.json()
    const { token, topic, condition, title = 'Teste', body: msgBody = '', link = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' } = body || {}
    if (!token && !topic && !condition) {
      return new Response(JSON.stringify({ error: 'Informe token | topic | condition' }), { status: 400 })
    }
    const sa = loadServiceAccount()
    if (!sa) return new Response(JSON.stringify({ error: 'Credenciais ausentes. Defina GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS.' }), { status: 500 })
    const access = await getAccessToken(sa)
    const projectId = sa.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) return new Response(JSON.stringify({ error: 'projectId ausente.' }), { status: 500 })
    const message = {
      message: {
        notification: { title, body: msgBody },
        webpush: { fcmOptions: { link }, headers: { TTL: '60' } },
      }
    }
    if (token) message.message.token = token
    if (topic) message.message.topic = topic
    if (condition) message.message.condition = condition

    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json; charset=UTF-8'
      },
      body: JSON.stringify(message)
    })
    const text = await resp.text()
    if (!resp.ok) return new Response(JSON.stringify({ error: text || 'Erro ao enviar' }), { status: 500 })
    return new Response(text, { status: 200 })
  }catch(e){
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 })
  }
}


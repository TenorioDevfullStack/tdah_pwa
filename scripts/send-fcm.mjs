#!/usr/bin/env node
// Usage:
//   node scripts/send-fcm.mjs --project PROJECT_ID --token FCM_TOKEN \
//     --title "Teste" --body "Olá do FCM!" --link "https://seu-site.com"
// Env:
//   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

import fs from 'node:fs'
import crypto from 'node:crypto'

const args = Object.fromEntries(process.argv.slice(2).reduce((acc,cur)=>{
  const m = cur.match(/^--([^=]+)=(.*)$/)
  if(m) acc.push([m[1], m[2]]); else if(cur.startsWith('--')) acc.push([cur.slice(2),'true']);
  return acc
}, []))

function required(k){ if(!args[k]){ console.error(`Missing --${k}`); process.exit(1)} }
required('project'); required('token')

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if(!saPath){ console.error('Set GOOGLE_APPLICATION_CREDENTIALS=./service-account.json'); process.exit(1)}
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'))

// Create JWT for OAuth 2.0 Service Account flow
const iat = Math.floor(Date.now()/1000)
const exp = iat + 3600
const header = { alg: 'RS256', typ: 'JWT' }
const payload = {
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/firebase.messaging',
  aud: 'https://oauth2.googleapis.com/token',
  iat, exp,
}
function b64url(obj){ return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_') }
const input = `${b64url(header)}.${b64url(payload)}`
const sign = crypto.createSign('RSA-SHA256').update(input).sign(sa.private_key,'base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
const assertion = `${input}.${sign}`

// Exchange for access token
const tokRes = await fetch('https://oauth2.googleapis.com/token', {
  method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
  body: new URLSearchParams({ grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
})
if(!tokRes.ok){ console.error('Token error', tokRes.status, await tokRes.text()); process.exit(1) }
const { access_token } = await tokRes.json()

// Send message
const title = args.title || 'Teste'
const body = args.body || 'Olá do FCM!'
const link = args.link || 'https://localhost'
const message = {
  message: {
    token: args.token,
    notification: { title, body },
    webpush: { fcmOptions: { link }, headers: { TTL: '60' } }
  }
}
const url = `https://fcm.googleapis.com/v1/projects/${args.project}/messages:send`
const res = await fetch(url, { method:'POST', headers:{
  'Authorization': `Bearer ${access_token}`,
  'Content-Type':'application/json; charset=UTF-8'
}, body: JSON.stringify(message) })
const txt = await res.text()
if(!res.ok){ console.error('Send error', res.status, txt); process.exit(1) }
console.log('FCM ok:', txt)


export const metadata = {
  title: 'Minha Rotina (PWA)',
  description: 'PWA para rotinas com TDAH: tarefas, estudos, tempo, finanças.',
}

import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <header className="header">
          <div className="brand">
            <div className="logo">R</div>
            <div>
              <div style={{fontWeight:800}}>Minha Rotina</div>
              <div className="small">PWA offline • Instale no celular</div>
            </div>
          </div>
          <div className="small">Pressione <span className="kbd">Ctrl</span> + <span className="kbd">S</span> para salvar (onde disponível)</div>
        </header>
        <div className="container">{children}</div>
        <footer>
          Feito para você — organize tarefas, estudos, tempo e finanças. <br/>Funciona offline e sincroniza localmente (sem nuvem).
        </footer>
      </body>
    </html>
  )
}

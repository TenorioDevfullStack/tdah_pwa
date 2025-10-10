export const metadata = {
  title: "Minha Rotina (PWA)",
  description: "PWA para rotinas com TDAH: tarefas, estudos, tempo, finanças.",
};

import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="icon" href="/icons/favicon.ico" />
        <meta name="theme-color" content="#4f46e5" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        <Header />
        <div className="container">{children}</div>
        <footer>
          Feito para você — organize tarefas, estudos, tempo e finanças. <br />
          Funciona offline e sincroniza localmente (sem nuvem).
        </footer>
      </body>
    </html>
  );
}

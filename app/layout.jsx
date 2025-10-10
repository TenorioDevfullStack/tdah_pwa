export const metadata = {
  title: "Rotina TDAH",
  description: "App de rotina para TDAH — tarefas, foco, estudos e finanças.",
  applicationName: "Rotina TDAH",
  themeColor: "#90BFFF",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Rotina TDAH",
    description:
      "Organize foco, tarefas e estudos com um PWA rápido e offline.",
    images: ["/icons/icon-512.png"],
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rotina TDAH",
  },
};

import "./globals.css";
import Header from "@/components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#90BFFF" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/favicon.ico" />

        {/* SEO básicas extras */}
        <meta name="application-name" content="Rotina TDAH" />
      </head>
      <body>
        <Header />
        <div className="container">{children}</div>
        <footer>
          Rotina TDAH — organize tarefas, estudos, tempo e finanças. <br />
          Funciona offline e sincroniza localmente (sem nuvem).
        </footer>
      </body>
    </html>
  );
}

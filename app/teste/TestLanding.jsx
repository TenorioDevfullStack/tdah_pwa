"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const modules = [
  {
    title: "Tarefas",
    description:
      "Crie tarefas com prioridade, datas, áreas e recorrência. Use filtros “Hoje” e “Atrasadas”.",
  },
  {
    title: "Foco (Pomodoro)",
    description:
      "Ajuste tempos, acompanhe ciclos e receba alertas ao fim de cada período.",
  },
  {
    title: "Estudos",
    description:
      "Cadastre tópicos e registre sessões com minutos e observações.",
  },
  {
    title: "Finanças",
    description:
      "Registre receitas e despesas, veja saldo e totais por categoria.",
  },
  {
    title: "Hábitos",
    description:
      "Checklist semanal para manter consistência nos hábitos principais.",
  },
  {
    title: "Insights",
    description:
      "Gráficos automáticos com taxa de conclusão de tarefas, tempo de estudo, finanças e hábitos.",
  },
];

const steps = [
  {
    title: "Instale como app (opcional)",
    tips: [
      "Android / Chrome: Menu → Adicionar à tela inicial.",
      "iOS / Safari: Compartilhar → Adicionar à Tela de Início.",
      "Desktop: Chrome/Edge permitem “Instalar app” na barra de endereço.",
    ],
  },
  {
    title: "Teste os módulos",
    tips: [
      "Tarefas: crie, filtre, marque recorrentes.",
      "Pomodoro: valide alertas e ajustes de tempo.",
      "Estudos/Finanças/Hábitos: registre alguns dados.",
      "Insights: veja se interpreta facilmente os gráficos.",
    ],
  },
  {
    title: "Compartilhe feedback",
    tips: [
      "Use o botão de feedback (leva ~3 minutos).",
      "Relate dificuldades, bugs e sugestões.",
      "Diga se usaria o app no dia a dia.",
    ],
  },
];

export default function TestLanding() {
  const [activeStep, setActiveStep] = useState(0);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const appLink = useMemo(() => {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("utm_source", "teste-landing");
      url.searchParams.set("utm_medium", "internal");
      url.searchParams.set("utm_campaign", "teste-v1");
      return url.toString();
    } catch {
      return baseUrl;
    }
  }, [baseUrl]);

  return (
    <div className="beta-hero">
      <section className="beta-hero__card">
        <span className="beta-pill">Versão Beta · Testers</span>
        <h1>Rotina TDAH</h1>
        <p>
          Obrigado por experimentar o app! Esta página resume como participar,
          o que testar e como enviar suas impressões.
        </p>
        <div className="beta-hero__actions">
          <Link href={appLink} className="button primary">
            Acessar o app e testar
          </Link>
          <Link href="/feedback" className="button">
            Enviar feedback
          </Link>
        </div>
      </section>

      <section className="beta-section">
        <h2>Como participar</h2>
        <div className="beta-steps">
          <div className="beta-steps__tabs">
            {steps.map((step, index) => (
              <button
                key={step.title}
                className={
                  "beta-steps__tab" +
                  (activeStep === index ? " beta-steps__tab--active" : "")
                }
                onClick={() => setActiveStep(index)}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>
          <div className="beta-steps__content">
            <ul>
              {steps[activeStep].tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="beta-section">
        <h2>O que focar nos testes</h2>
        <div className="beta-modules">
          {modules.map((item) => (
            <div className="beta-modules__card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="beta-section">
        <h2>Checklist final</h2>
        <ul className="beta-checklist">
          <li>🔁 Testou mais de um módulo?</li>
          <li>📱 Instalou como app ou usou offline?</li>
          <li>📝 Notou algum bug ou texto confuso?</li>
          <li>🚀 Preencheu o formulário de feedback?</li>
        </ul>
        <div className="beta-hero__actions" style={{ marginTop: 16 }}>
          <Link href="/feedback" className="button primary">
            Quero deixar feedback agora
          </Link>
          <Link href={appLink} className="button">
            Voltar ao app
          </Link>
        </div>
      </section>
    </div>
  );
}

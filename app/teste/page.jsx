import Link from "next/link";

export const metadata = {
  title: "Guia de Testes",
  description:
    "Passo a passo para quem está experimentando o Rotina TDAH e quer enviar feedbacks.",
};

function buildShareUrl(
  base,
  source,
  medium = "social",
  campaign = "teste-v1"
) {
  try {
    const url = new URL(base || "http://localhost:3000");
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", campaign);
    return url.toString();
  } catch {
    return base || "http://localhost:3000";
  }
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const shareLinks = [
  { label: "Instagram", source: "instagram", medium: "social" },
  { label: "WhatsApp", source: "whatsapp", medium: "social" },
  { label: "QR Code (impressos)", source: "qr", medium: "offline" },
];

export default function TestLanding() {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Link href="/" className="button">
          Voltar ao app
        </Link>
      </div>
      <h3>Guia rápido para testers</h3>
      <p className="small">
        Obrigado por testar o Rotina TDAH! Siga os passos abaixo e conte pra
        gente o que achou.
      </p>

      <h4>1. Instale como aplicativo (opcional, mas recomendado)</h4>
      <ul className="small">
        <li>
          <strong>Android / Chrome</strong>: Menu • Adicionar à tela inicial.
        </li>
        <li>
          <strong>iOS / Safari</strong>: Compartilhar • Adicionar à Tela de Início.
        </li>
        <li>Desktop: Chrome/Edge permitem “Instalar app” na barra de endereço.</li>
      </ul>

      <h4>2. O que testar</h4>
      <ol className="small">
        <li>
          <strong>Tarefas</strong>: criar, filtrar (“Hoje”, “Atrasadas”), concluir
          recorrentes.
        </li>
        <li>
          <strong>Foco (Pomodoro)</strong>: iniciar/pausar, ajustar tempos, testar
          aviso ao terminar.
        </li>
        <li>
          <strong>Estudos</strong>: registrar sessão, conferir histórico.
        </li>
        <li>
          <strong>Finanças</strong>: lançar receita/despesa, ver saldo e categorias.
        </li>
        <li>
          <strong>Hábitos</strong>: marcar a semana, entender adesão.
        </li>
        <li>
          <strong>Insights</strong>: interpretar gráficos e indicadores.
        </li>
      </ol>

      <h4>3. Enviar feedback</h4>
      <p className="small">
        Depois dos testes, preencha o formulário (leva ~3 minutos):
      </p>
      <p>
        <Link href="/feedback" className="button primary">
          Abrir formulário de feedback
        </Link>
      </p>

      <h4>4. Encontrou bugs?</h4>
      <p className="small">
        Use o campo “Bugs” no formulário ou mande um print para o WhatsApp do
        time (se preferir).
      </p>

      <h4>Links de divulgação</h4>
      <div className="list">
        {shareLinks.map((item) => (
          <div className="item" key={item.label}>
            <div>
              <div style={{ fontWeight: 600 }}>{item.label}</div>
              <div className="small">
                {buildShareUrl(
                  baseUrl,
                  item.source,
                  item.medium,
                  "teste-v1"
                )}
              </div>
            </div>
            <a
              className="button"
              href={buildShareUrl(
                baseUrl,
                item.source,
                item.medium,
                "teste-v1"
              )}
              target="_blank"
            >
              Abrir
            </a>
          </div>
        ))}
      </div>
      <p className="small" style={{ marginTop: 8 }}>
        Use a página <Link href="/qr">/qr</Link> para gerar e baixar QR codes
        com os links acima.
      </p>

      <h4>Checklist para quem participa</h4>
      <ul className="small">
        <li>Testar em pelo menos um módulo de cada área.</li>
        <li>Anotar qualquer demora, travamento ou texto confuso.</li>
        <li>Verificar se os dados continuam lá ao reabrir o app offline.</li>
        <li>
          Responder ao formulário com sugestões (mais ideias = futuro melhor!).
        </li>
      </ul>

      <div className="notice small" style={{ marginTop: 12 }}>
        Dica: compartilhe o link no Instagram, WhatsApp e use o QR em materiais
        impressos. As UTMs já estão configuradas para analisarmos os acessos.
      </div>
    </div>
  );
}

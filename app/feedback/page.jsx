import { headers } from "next/headers";

export const metadata = { title: "Feedback" };

export default function FeedbackPage() {
  // Resolve env no servidor para evitar "use client"
  const url = process.env.NEXT_PUBLIC_FEEDBACK_URL || "";

  return (
    <div className="card">
      <h3>Feedback</h3>
      {!url && (
        <div className="notice small" style={{ marginBottom: 12 }}>
          Configure a variável <code>NEXT_PUBLIC_FEEDBACK_URL</code> na Vercel ou
          no seu <code>.env.local</code> com a URL de um formulário (Google Forms,
          Formspree, etc.).
        </div>
      )}

      {url ? (
        <iframe
          src={url}
          title="Formulário de feedback"
          style={{ width: "100%", minHeight: 560, border: "1px solid var(--border)", borderRadius: 10 }}
        />
      ) : (
        <div className="small">
          Sugestão rápida:
          <ul>
            <li>Crie um Google Forms com 5–6 perguntas objetivas.</li>
            <li>Copie a URL e defina em <code>NEXT_PUBLIC_FEEDBACK_URL</code>.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

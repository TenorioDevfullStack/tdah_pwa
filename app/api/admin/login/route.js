export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = body?.username ?? "";
  const password = body?.password ?? "";

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    return new Response(
      JSON.stringify({ error: "Credenciais do admin não configuradas" }),
      { status: 500 }
    );
  }

  if (username === adminUser && password === adminPass) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Credenciais inválidas" }), {
    status: 401,
  });
}

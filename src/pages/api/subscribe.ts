import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

type CloudflareLocals = {
  runtime?: {
    env?: Record<string, string | undefined>;
  };
};

type NodeLike = { process?: { env?: Record<string, string | undefined> } };

function readEnv(locals: unknown): {
  apiKey: string | undefined;
  notifyEmail: string | undefined;
  fromEmail: string | undefined;
} {
  const processEnv = (globalThis as unknown as NodeLike).process?.env;
  const runtimeEnv =
    (locals as CloudflareLocals)?.runtime?.env ?? processEnv ?? {};
  return {
    apiKey: runtimeEnv.RESEND_API_KEY,
    notifyEmail: runtimeEnv.NOTIFY_EMAIL,
    fromEmail: runtimeEnv.FROM_EMAIL,
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  let payload: { email?: unknown; hp?: unknown };
  try {
    payload = (await request.json()) as { email?: unknown; hp?: unknown };
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (typeof payload.hp === "string" && payload.hp.length > 0) {
    return json({ ok: true });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const { apiKey, notifyEmail, fromEmail } = readEnv(locals);
  if (!apiKey || !notifyEmail || !fromEmail) {
    return json({ ok: false, error: "server_misconfigured" }, 500);
  }

  const resend = new Resend(apiKey);
  const ua = request.headers.get("user-agent") ?? "unknown";
  const at = new Date().toISOString();

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: "ridebonk: someone wants in",
    text: `Email: ${email}\nUser-Agent: ${ua}\nAt: ${at}`,
  });

  if (error) {
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
};

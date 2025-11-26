import { renderHtml } from "./renderHtml";

function parseCookies(h: Headers) {
  const s = h.get("Cookie") || "";
  const out: Record<string, string> = {};
  s.split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toHex(sig);
}

async function pbkdf2(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256" },
    key,
    256
  );
  return toHex(bits);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookies = parseCookies(request.headers);
    const session = cookies["alpha_session"] || "";
    let authed = false;
    if (session) {
      const parts = session.split(".");
      if (parts.length === 3) {
        const [payload, expStr, sig] = parts;
        const exp = Number(expStr);
        if (Number.isFinite(exp) && Date.now() < exp) {
          const secret = env.SESSION_SECRET || "dev-session-secret";
          const expect = await hmac(secret, payload + "." + expStr);
          authed = expect === sig && payload === "ok";
        }
      }
    }

    if (url.pathname === "/auth" && request.method === "POST") {
      const ct = request.headers.get("content-type") || "";
      let password = "";
      if (ct.includes("application/json")) {
        const data = (await request.json()) as { password?: unknown };
        password = typeof data.password === "string" ? data.password : String(data.password ?? "");
      } else {
        const body = await request.text();
        const m = /password=([^&]+)/.exec(body);
        password = m ? decodeURIComponent(m[1]) : "";
      }
      const salt = env.PASSWORD_SALT || "alpha-salt-v1";
      const input = await pbkdf2(password, salt);
      const base = env.PASSWORD_PLAIN || "";
      if (!base) {
        return new Response("", { status: 403 });
      }
      const expect = await pbkdf2(base, salt);
      if (input === expect) {
        const ttl = 24 * 60 * 60 * 1000;
        const exp = Date.now() + ttl;
        const payload = "ok";
        const secret = env.SESSION_SECRET || "dev-session-secret";
        const sig = await hmac(secret, payload + "." + String(exp));
        const cookie = `alpha_session=${payload}.${exp}.${sig}; HttpOnly; SameSite=Lax; Path=/` + (url.protocol === "https:" ? `; Secure` : "");
        return new Response("", { status: 302, headers: { Location: "/", "Set-Cookie": cookie } });
      }
      return new Response("", { status: 401 });
    }

    if (!authed) {
      return new Response(renderHtml(false, "[]"), { headers: { "content-type": "text/html" } });
    }
    let results: unknown = [];
    try {
      const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
      const r = await stmt.all();
      results = r.results;
    } catch {}
    return new Response(renderHtml(true, JSON.stringify(results, null, 2)), {
      headers: { "content-type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;

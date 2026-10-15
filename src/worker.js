// Worker de Arolabs: sirve la web (assets estáticos) y recibe el formulario en /api/contact.
// El email lo envía un Google Apps Script propio (gratis) al que este Worker reenvía los datos.
// Secretos necesarios (wrangler secret put): APPS_SCRIPT_URL, FORM_KEY

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);

    // Solo desde nuestra propia web
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host) return json({ ok: false, error: "origin" }, 403);

    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: "json" }, 400); }

    // Anti-spam: honeypot relleno o envío demasiado rápido => fingimos éxito
    if (body.website || Number(body.elapsed) < 2500) return json({ ok: true });

    const data = {
      name: clean(body.name, 100),
      company: clean(body.company, 120),
      email: clean(body.email, 160),
      message: clean(body.message, 3000),
    };
    if (!data.name || !data.message || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email))
      return json({ ok: false, error: "invalid" }, 422);

    if (!env.APPS_SCRIPT_URL || !env.FORM_KEY) return json({ ok: false, error: "not_configured" }, 503);

    try {
      // Apps Script ejecuta el POST y responde 302 a una URL con el resultado (que se lee con GET)
      const first = await fetch(env.APPS_SCRIPT_URL.replace(/[^\x21-\x7E]/g, ""), {
        method: "POST",
        headers: { "content-type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...data, key: env.FORM_KEY.replace(/[^\x21-\x7E]/g, "") }),
        redirect: "manual",
      });
      const loc = first.headers.get("location");
      const r = loc ? await fetch(loc) : first;
      const txt = await r.text();
      let out = {};
      try { out = JSON.parse(txt); } catch { /* respuesta no JSON */ }
      if (!out.ok) throw new Error("upstream");
      return json({ ok: true });
    } catch {
      return json({ ok: false, error: "upstream" }, 502);
    }
  },
};

// ---- Formulario (backend propio: /api/contact en el Worker) ----
const MAIL = "arolabs.adm@gmail.com";
const form = document.getElementById("contact");
const msg = document.getElementById("msg");
const openedAt = Date.now();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button");
  const d = Object.fromEntries(new FormData(form));
  d.elapsed = Date.now() - openedAt;
  btn.disabled = true;
  msg.className = "";
  msg.textContent = "Enviando…";
  try {
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(d),
    });
    const out = await r.json().catch(() => ({}));
    if (r.status === 422) {
      msg.className = "err";
      msg.textContent = "Revisa los datos: nombre, email válido y mensaje son obligatorios.";
    } else if (!r.ok || !out.ok) {
      throw new Error("send failed");
    } else {
      form.reset();
      msg.textContent = "¡Gracias! Hemos recibido tu consulta y te respondemos en menos de 24 h.";
    }
  } catch {
    // Alternativa: abrir el correo del visitante
    const body = encodeURIComponent(
      `Nombre: ${d.name}\nNegocio: ${d.company}\nEmail: ${d.email}\n\n${d.message}`
    );
    msg.className = "err";
    msg.innerHTML = `No hemos podido enviarlo. <a href="mailto:${MAIL}?subject=${encodeURIComponent("Consulta web - " + d.name)}&body=${body}">Envíanoslo por email</a>.`;
  } finally {
    btn.disabled = false;
  }
});

// ---- Animaciones ----
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal al hacer scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Contadores
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    countIO.unobserve(en.target);
    const el = en.target, end = +el.dataset.count, pre = el.dataset.pre || "", suf = el.dataset.suf || "";
    const t0 = performance.now(), dur = reduce ? 0 : 1400;
    const tick = (t) => {
      const p = dur ? Math.min((t - t0) / dur, 1) : 1;
      el.innerHTML = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

// Web construyéndose en el mockup
const mock = document.getElementById("mock");
const stLabel = document.getElementById("stLabel");
const stBar = document.getElementById("stBar");
const stages = [["Estructura", 15], ["Diseño", 45], ["Contenido", 80], ["Publicada", 100]];
let s = reduce ? 3 : 0;
function setStage(i) {
  mock.dataset.stage = i;
  stLabel.textContent = stages[i][0];
  stBar.style.width = stages[i][1] + "%";
}
setStage(s);
if (!reduce) setInterval(() => { s = (s + 1) % stages.length; setStage(s); }, s === 0 ? 2300 : 2300);

// Header sólido, barra de progreso y línea del timeline
const header = document.querySelector("header");
const progress = document.getElementById("progress");
const tl = document.getElementById("timeline");
const tlFill = document.getElementById("tlFill");
const steps = [...document.querySelectorAll(".tl-step")];
function onScroll() {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  header.classList.toggle("solid", y > 30);
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  const r = tl.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight * 0.65 - r.top) / r.height, 0), 1);
  tlFill.style.height = p * 100 + "%";
  steps.forEach((st) => st.classList.toggle("in", st.getBoundingClientRect().top < innerHeight * 0.65));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Foco de luz que sigue al ratón en las tarjetas
document.querySelectorAll(".spot").forEach((c) => {
  c.addEventListener("pointermove", (e) => {
    const b = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - b.left + "px");
    c.style.setProperty("--my", e.clientY - b.top + "px");
  });
});

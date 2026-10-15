// ---- Formulario ----
// Pega aquí tu endpoint de Formspree (https://formspree.io/f/XXXXXXXX).
// Si está vacío, el formulario abre el correo del visitante como alternativa.
const FORM_ENDPOINT = "";
const MAIL = "arolabs.adm@gmail.com";
const form = document.getElementById("contact");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = new FormData(form);
  if (d.get("website")) return; // honeypot anti-spam
  if (!FORM_ENDPOINT) {
    const body = encodeURIComponent(
      `Nombre: ${d.get("name")}\nNegocio: ${d.get("company")}\nEmail: ${d.get("email")}\n\n${d.get("message")}`
    );
    location.href = `mailto:${MAIL}?subject=${encodeURIComponent("Consulta web - " + d.get("name"))}&body=${body}`;
    return;
  }
  msg.textContent = "Enviando…";
  try {
    const r = await fetch(FORM_ENDPOINT, { method: "POST", body: d, headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("send failed");
    form.reset();
    msg.textContent = "¡Gracias! Te respondemos en menos de 24 h.";
  } catch {
    msg.textContent = `No se pudo enviar. Escríbenos a ${MAIL}`;
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

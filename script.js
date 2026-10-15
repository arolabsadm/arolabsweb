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
      `Nombre: ${d.get("name")}\nEmpresa: ${d.get("company")}\nEmail: ${d.get("email")}\n\n${d.get("message")}`
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

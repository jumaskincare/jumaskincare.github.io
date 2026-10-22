/* Juma Skincare — lógica compartida por todas las páginas.
   Cada bloque se activa solo si su sección existe en la página actual. */
(function () {
  document.documentElement.classList.add("js");
  const WA = "5491139037489";
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function toast(msg) { const t = $("#toast"); if (!t) return; t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200); }

  /* ---------------- datos del centro ---------------- */
  const ICON = {
    leaf: '<path d="M5 19c2-7 7-12 14-14-1 8-6 13-14 14Z"/><path d="M5 19 13 11"/>',
    drop: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11Z"/>',
    layers: '<path d="m12 4 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/>',
    dots: '<circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
    wave: '<path d="M3 9c3-3 6 3 9 0s6 3 9 0"/><path d="M3 15c3-3 6 3 9 0s6 3 9 0"/>',
    snow: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
    body: '<path d="M9 4c-1 4 0 7-2 10s0 6 0 6M15 4c1 4 0 7 2 10s0 6 0 6"/><path d="M8 12h8"/>',
    spiral: '<path d="M12 12a2 2 0 1 1 2-2 4 4 0 1 1-4-4 6 6 0 1 1-6 6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
  };
  const TREATS = [
    { id: "limpieza_primera", name: "Limpieza facial · primera vez", dur: 60, price: 30000, cat: "facial", icon: "leaf",
      desc: "Diagnóstico de tu piel y limpieza profunda. Es el punto de partida para armar tu plan." },
    { id: "limpieza_mantenimiento", name: "Limpieza facial · mantenimiento", dur: 60, price: 30000, cat: "facial", icon: "drop",
      desc: "Limpieza profunda para sostener los resultados entre tratamientos." },
    { id: "peeling", name: "Peeling", dur: 45, price: 40000, cat: "facial", icon: "layers",
      desc: "Renueva la capa superficial de la piel para mejorar textura y luminosidad.", note: "No depilarse 2 días antes." },
    { id: "dermapen", name: "Dermapen", dur: 45, price: 40000, cat: "facial", icon: "dots",
      desc: "Microagujas que estimulan el colágeno natural. Ayuda con textura, poros y marcas." },
    { id: "radiofrecuencia", name: "Radiofrecuencia", dur: 45, price: 40000, cat: "facial", icon: "wave",
      desc: "Calor controlado que estimula el colágeno y mejora la firmeza de la piel." },
    { id: "crioradiofrecuencia", name: "Crioradiofrecuencia", dur: 45, price: 40000, cat: "facial", icon: "snow",
      desc: "Combina frío y radiofrecuencia para tonificar y reafirmar." },
    { id: "trio_bell", name: "Trio Bell corporal", dur: 40, price: 30000, cat: "corporal", icon: "body",
      desc: "Tratamiento corporal en 2 zonas a elección.", note: "Pack de 6 sesiones: la sexta es gratis." },
    { id: "pdrn_salmon", name: "PDRN salmón", dur: 45, price: 50000, cat: "facial", icon: "spiral",
      desc: "Bioestimulación para regenerar e hidratar la piel en profundidad." },
    { id: "plasma", name: "Plasma", dur: 45, price: null, cat: "facial", icon: "spark", consult: true,
      desc: "Lo indicamos según tu piel. Consultanos y Carla te asesora." }
  ];
  const HOURS = { 1: [["09:00", "16:30"], ["18:00", "20:00"]], 2: [["09:00", "16:30"], ["18:00", "20:00"]], 3: [["09:00", "16:30"], ["18:00", "20:00"]],
                  4: [["09:00", "16:30"], ["18:00", "20:00"]], 5: [["09:00", "16:30"], ["18:00", "20:00"]], 6: [["08:00", "15:00"]], 0: [] };
  const HOLIDAYS = ["2026-11-23", "2026-12-07", "2026-12-08", "2026-12-25", "2027-01-01"];
  const STEP_MIN = 60, MAX_DAYS = 30, MIN_AHEAD_H = 1;
  const GIFT_AMOUNTS = [30000, 50000, 80000];

  /* ---------------- fechas y disponibilidad (simulada) ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fmtDay = (d) => DOW[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today); lastDay.setDate(lastDay.getDate() + MAX_DAYS - 1);
  const booked = new Set(store.get("juma_demo_booked", []));
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function slotsFor(day, dur) {
    if (day < today || day > lastDay || HOLIDAYS.includes(iso(day))) return [];
    const out = [], min = new Date(Date.now() + MIN_AHEAD_H * 3600e3);
    for (const [a, b] of HOURS[day.getDay()] || []) {
      const [ah, am] = a.split(":").map(Number), [bh, bm] = b.split(":").map(Number);
      const end = new Date(day); end.setHours(bh, bm, 0, 0);
      for (let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), ah, am); +t + dur * 60e3 <= +end; t = new Date(+t + STEP_MIN * 60e3)) {
        const key = iso(day) + " " + pad(t.getHours()) + ":" + pad(t.getMinutes());
        const taken = (hash(key) % 100) < 32 || booked.has(key);   // demo: ~1 de cada 3 horarios ocupado
        out.push({ time: new Date(t), key, free: t >= min && !taken, past: t < min });
      }
    }
    return out.filter((s) => !s.past);
  }
  const freeCount = (day, dur) => slotsFor(day, dur).filter((s) => s.free).length;
  const bookable = TREATS.filter((t) => !t.consult);

  /* próximo turno libre (portada) */
  function updateNextSlot() {
    const el = $("#nextSlotText"); if (!el) return;
    const t = bookable[0];
    for (let i = 0; i < MAX_DAYS; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const s = slotsFor(d, t.dur).find((x) => x.free);
      if (s) { el.textContent = (i === 0 ? "Hoy" : i === 1 ? "Mañana" : fmtDay(d).replace(/^./, (c) => c.toUpperCase())) + " · " + pad(s.time.getHours()) + ":" + pad(s.time.getMinutes()) + " h"; return; }
    }
    el.textContent = "Consultanos por WhatsApp";
  }

  /* ---------------- página Tratamientos ---------------- */
  const treatGrid = $("#treatGrid");
  if (treatGrid) {
    const renderTreats = (filter) => {
      treatGrid.innerHTML = TREATS.filter((t) => filter === "todos" || t.cat === filter).map((t) => `
        <article class="treat">
          <div style="display:flex;justify-content:space-between;align-items:start;gap:12px">
            <div class="treat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${ICON[t.icon]}</svg></div>
            <span class="tag">${t.cat === "corporal" ? "Corporal" : "Facial"}</span>
          </div>
          <h3>${t.name}</h3>
          <div class="treat-meta"><span>${t.dur} min</span><span>·</span><span>por sesión</span></div>
          <p>${t.desc}</p>
          ${t.note ? `<div class="treat-note">${t.note}</div>` : ""}
          <div class="treat-foot">
            <span class="price">${t.consult ? "Consultar" : money(t.price)}</span>
            ${t.consult
              ? `<a class="btn btn-line btn-sm" href="https://wa.me/${WA}?text=${encodeURIComponent("Hola Carla, quería consultar por el tratamiento de " + t.name + ".")}" target="_blank" rel="noopener">Consultar</a>`
              : `<a class="btn btn-solid btn-sm" href="reservar.html?t=${t.id}">Reservar</a>`}
          </div>
        </article>`).join("");
    };
    document.querySelectorAll("[data-f]").forEach((c) => c.addEventListener("click", () => {
      document.querySelectorAll("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      renderTreats(c.dataset.f);
    }));
    renderTreats("todos");
  }

  /* ---------------- página Reservar ---------------- */
  if ($("#bkMain")) {
    const pre = new URLSearchParams(location.search).get("t");
    const bk = { treat: bookable.find((t) => t.id === pre) || bookable[0], month: new Date(today.getFullYear(), today.getMonth(), 1), day: null, slot: null, done: false };
    $("#bkTreat").innerHTML = bookable.map((t) => `<option value="${t.id}">${t.name} · ${t.dur} min · ${money(t.price)}</option>`).join("");
    $("#bkTreat").value = bk.treat.id;
    $("#bkTreat").addEventListener("change", (e) => { bk.treat = TREATS.find((t) => t.id === e.target.value); bk.slot = null; if (bk.day && !freeCount(bk.day, bk.treat.dur)) bk.day = null; renderBooking(); });
    $("#calPrev").addEventListener("click", () => { bk.month = new Date(bk.month.getFullYear(), bk.month.getMonth() - 1, 1); renderCal(); });
    $("#calNext").addEventListener("click", () => { bk.month = new Date(bk.month.getFullYear(), bk.month.getMonth() + 1, 1); renderCal(); });
    function renderCal() {
      const m = bk.month, first = new Date(m.getFullYear(), m.getMonth(), 1);
      $("#calTitle").textContent = m.toLocaleDateString("es-AR", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase());
      $("#calPrev").disabled = m <= new Date(today.getFullYear(), today.getMonth(), 1);
      $("#calNext").disabled = new Date(m.getFullYear(), m.getMonth() + 1, 1) > lastDay;
      let html = ["L", "M", "M", "J", "V", "S", "D"].map((d) => `<div class="dow">${d}</div>`).join("");
      const offset = (first.getDay() + 6) % 7;
      for (let i = 0; i < offset; i++) html += "<div></div>";
      const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const day = new Date(m.getFullYear(), m.getMonth(), d);
        const n = freeCount(day, bk.treat.dur);
        const sel = bk.day && iso(bk.day) === iso(day);
        const label = fmtDay(day) + (n ? `, ${n} horarios libres` : ", sin horarios");
        html += `<button class="day${n ? " avail" : ""}${sel ? " sel" : ""}${iso(day) === iso(today) ? " today" : ""}" data-day="${iso(day)}" ${n ? "" : "disabled"} aria-label="${label}">${d}</button>`;
      }
      $("#cal").innerHTML = html;
    }
    $("#cal").addEventListener("click", (e) => {
      const b = e.target.closest("[data-day]"); if (!b || b.disabled) return;
      const [y, mo, d] = b.dataset.day.split("-").map(Number); bk.day = new Date(y, mo - 1, d); bk.slot = null; renderBooking();
    });
    function renderSlots() {
      const box = $("#slots"), hint = $("#slotsHint");
      if (!bk.day) { box.innerHTML = ""; hint.textContent = "Elegí un día para ver los horarios libres."; return; }
      const list = slotsFor(bk.day, bk.treat.dur);
      box.innerHTML = list.map((s) => `<button class="slot" data-key="${s.key}" ${s.free ? "" : "disabled"} aria-pressed="${!!(bk.slot && bk.slot.key === s.key)}" aria-label="${pad(s.time.getHours())}:${pad(s.time.getMinutes())}${s.free ? "" : " ocupado"}">${pad(s.time.getHours())}:${pad(s.time.getMinutes())}</button>`).join("");
      hint.textContent = "Los horarios tachados ya están ocupados.";
    }
    $("#slots").addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]"); if (!b || b.disabled) return;
      bk.slot = slotsFor(bk.day, bk.treat.dur).find((s) => s.key === b.dataset.key); renderBooking();
    });
    function renderSummary() {
      if (bk.done) return;
      $("#sumTitle").textContent = bk.treat.name;
      $("#sumDay").textContent = bk.day ? fmtDay(bk.day) : "—";
      $("#sumHour").textContent = bk.slot ? pad(bk.slot.time.getHours()) + ":" + pad(bk.slot.time.getMinutes()) + " h" : "—";
      $("#sumDur").textContent = bk.treat.dur + " min";
      $("#sumPrice").textContent = money(bk.treat.price);
      $("#sumNote").textContent = bk.treat.note || "";
      $("#bkConfirm").disabled = !(bk.day && bk.slot);
    }
    function renderBooking() { renderCal(); renderSlots(); renderSummary(); }
    $("#bkConfirm").addEventListener("click", () => {
      const name = $("#bkName").value.trim(), phone = $("#bkPhone").value.replace(/\D/g, "");
      const err = $("#bkErr");
      if (name.length < 3) { err.textContent = "Escribí tu nombre y apellido para reservar."; $("#bkName").focus(); return; }
      if (phone.length < 8) { err.textContent = "Escribí tu número de WhatsApp para enviarte la confirmación."; $("#bkPhone").focus(); return; }
      err.textContent = "";
      booked.add(bk.slot.key); store.set("juma_demo_booked", [...booked]);
      bk.done = true;
      const when = fmtDay(bk.day) + " a las " + pad(bk.slot.time.getHours()) + ":" + pad(bk.slot.time.getMinutes());
      const msg = `Hola Carla! Reservé desde la web:\n• ${bk.treat.name}\n• ${when}\n• A nombre de ${name}` + ($("#bkNote").value.trim() ? `\n• Comentario: ${$("#bkNote").value.trim()}` : "");
      $("#bkSide").innerHTML = `
        <div class="done">
          <div class="done-icon"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 12 4.5 4.5L19 7"/></svg></div>
          <div class="eyebrow">Turno reservado</div>
          <h3>${name.split(" ")[0]}, te esperamos</h3>
          <div class="summary" style="width:100%">
            <div class="sum-row"><span>Tratamiento</span><span>${bk.treat.name}</span></div>
            <div class="sum-row"><span>Cuándo</span><span>${when}</span></div>
            <div class="sum-row"><span>Dónde</span><span>Fragata Argentina 2063, of. 3</span></div>
          </div>
          ${bk.treat.note ? `<p class="policy">${bk.treat.note}</p>` : ""}
          <p class="policy">En la versión final, el turno se agenda solo y te llega la confirmación por WhatsApp. En esta demo podés avisarle a Carla con el botón.</p>
          <a class="btn btn-solid" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Avisar por WhatsApp</a>
          <button class="btn btn-line" id="bkAgain" type="button">Reservar otro turno</button>
        </div>`;
      $("#bkAgain").addEventListener("click", () => location.reload());
      renderCal(); renderSlots();
      toast("Turno reservado (demo)");
    });
    renderBooking();
  }

  /* ---------------- página Gift card: pedido por WhatsApp ---------------- */
  if ($("#gcForm")) {
    let gcAmount = GIFT_AMOUNTS[0];
    const updateLink = () => {
      const to = $("#gcName").value.trim(), note = $("#gcMsg").value.trim(), from = $("#gcFrom").value.trim();
      const msg = `Hola Carla! Quiero regalar una gift card de ${money(gcAmount)}` + (to ? ` para ${to}` : "") + "." +
        (note ? `\nMensaje para la tarjeta: "${note}"` : "") + (from ? `\nSoy ${from}.` : "");
      $("#gcSend").href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    };
    $("#gcAmounts").innerHTML = GIFT_AMOUNTS.map((a, i) => `<button type="button" class="chip" data-gc="${a}" aria-pressed="${i === 0}">${money(a)}</button>`).join("");
    $("#gcAmounts").addEventListener("click", (e) => {
      const b = e.target.closest("[data-gc]"); if (!b) return;
      gcAmount = Number(b.dataset.gc);
      document.querySelectorAll("[data-gc]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      $("#gcAmount").textContent = money(gcAmount); updateLink();
    });
    $("#gcName").addEventListener("input", (e) => { $("#gcTo").textContent = e.target.value.trim() ? "Para " + e.target.value.trim() : "Gift card"; });
    $("#gcForm").addEventListener("input", updateLink);
    $("#gcForm").addEventListener("submit", (e) => e.preventDefault());
    updateLink();
  }

  /* ---------------- varios ---------------- */
  const panel = $("#menuPanel"), menuBtn = $("#menuBtn");
  function openMenu() {
    panel.hidden = false; document.body.classList.add("menu-open"); menuBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add("open")));
    $("#menuClose").focus();
  }
  function closeMenu() {
    panel.classList.remove("open"); document.body.classList.remove("menu-open"); menuBtn.setAttribute("aria-expanded", "false");
    setTimeout(() => { if (!panel.classList.contains("open")) panel.hidden = true; }, 450);
    menuBtn.focus();
  }
  menuBtn.addEventListener("click", openMenu);
  $("#menuClose").addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (panel.hidden) return;
    if (e.key === "Escape") closeMenu();
    if (e.key === "Tab") {   // el foco queda dentro del menú
      const f = [...panel.querySelectorAll("a, button")], first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  /* encabezado: línea inferior al bajar */
  const topBar = $("#top");
  const onScroll = () => topBar.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const copyBtn = $("#copyWa");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    const sel = () => { const r = document.createRange(); r.selectNodeContents($("#waNum")); getSelection().removeAllRanges(); getSelection().addRange(r); };
    try { navigator.clipboard.writeText("1139037489").then(() => toast("Número copiado"), sel); } catch (e) { sel(); }
  });

  /* revelado al hacer scroll */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  updateNextSlot();
})();

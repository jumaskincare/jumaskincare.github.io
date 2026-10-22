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
    /* ---- faciales ---- */
    { id: "limpieza_primera", name: "Higiene facial profunda · primera vez", dur: 60, price: 30000, cat: "facial", icon: "leaf",
      desc: "El punto de partida indispensable. Incluye el diagnóstico de tu piel, limpieza detallada, extracción e hidratación para descongestionarla y prepararla." },
    { id: "limpieza_mantenimiento", name: "Higiene facial profunda · mantenimiento", dur: 60, price: 30000, cat: "facial", icon: "drop",
      desc: "Limpieza detallada, extracción e hidratación para sostener la piel en orden entre tratamientos." },
    { id: "dermapen", name: "Microneedling (Dermapen)", dur: 45, price: 40000, cat: "facial", icon: "dots",
      desc: "Estimulación de colágeno e inducción de activos para mejorar textura, firmeza, marcas y luminosidad.", note: "Requiere una higiene facial previa." },
    { id: "radiofrecuencia", name: "Radiofrecuencia facial", dur: 45, price: 40000, cat: "facial", icon: "wave",
      desc: "Reafirmación tensora, estimulación de colágeno y definición del óvalo facial mediante calor controlado." },
    { id: "crioradiofrecuencia", name: "Crioradiofrecuencia facial", dur: 45, price: 40000, cat: "facial", icon: "snow",
      desc: "Combina frío y radiofrecuencia para tensar, reafirmar y definir el óvalo facial." },
    { id: "electroporacion", name: "Electroporación (mesoterapia virtual)", dur: 45, price: null, cat: "facial", icon: "spiral", consult: true,
      desc: "Permeación profunda de principios activos (ácido hialurónico, vitaminas y boosters) sin agujas." },
    { id: "peeling", name: "Peelings progresivos", dur: 45, price: 40000, cat: "facial", icon: "layers",
      desc: "Renovación celular guiada para atenuar manchas, líneas finas y unificar el tono de la piel.", note: "Requiere una higiene facial previa. No depilarse 2 días antes." },
    { id: "pdrn_salmon", name: "PDRN salmón", dur: 45, price: 50000, cat: "facial", icon: "spiral",
      desc: "Bioestimulación con PDRN de salmón para regenerar, reparar e hidratar la piel en profundidad." },
    { id: "plasma", name: "Plasma", dur: 45, price: null, cat: "facial", icon: "spark", consult: true,
      desc: "Tratamiento regenerador que se indica según el estado de tu piel. Consultanos y Carla te asesora." },
    /* ---- modelado y corporales ---- */
    { id: "modelado", name: "Modelado y tonificación integral", dur: 60, price: null, cat: "corporal", icon: "body", consult: true,
      desc: "Protocolos diseñados para mejorar la firmeza, la elasticidad y la textura de la piel." },
    { id: "trio_bell", name: "Trío Bell y radiofrecuencia corporal", dur: 40, price: 30000, cat: "corporal", icon: "wave",
      desc: "Aparatología combinada enfocada en la reducción localizada, la flacidez y el drenaje. 2 zonas a elección.", note: "Pack de 6 sesiones: la sexta es gratis." },
    { id: "electroporacion_corporal", name: "Electroporación corporal", dur: 45, price: null, cat: "corporal", icon: "spiral", consult: true,
      desc: "Asimilación intensiva de activos reafirmantes y anticelulíticos en capas profundas." },
    /* ---- asesoramiento ---- */
    { id: "rutina", name: "Diagnóstico y orden de rutina", dur: 45, price: null, cat: "rutina", icon: "spark", consult: true,
      desc: "Revisamos lo que usás en casa, simplificamos tu paso a paso y armamos un plan efectivo adaptado a tu estilo de vida." }
  ];
  const HOURS = { 1: [["09:00", "16:30"], ["18:00", "20:00"]], 2: [["09:00", "16:30"], ["18:00", "20:00"]], 3: [["09:00", "16:30"], ["18:00", "20:00"]],
                  4: [["09:00", "16:30"], ["18:00", "20:00"]], 5: [["09:00", "16:30"], ["18:00", "20:00"]], 6: [["08:00", "15:00"]], 0: [] };
  const HOLIDAYS = ["2026-11-23", "2026-12-07", "2026-12-08", "2026-12-25", "2027-01-01"];
  const STEP_MIN = 60, MAX_DAYS = 30, MIN_AHEAD_H = 1;
  const GIFT_AMOUNTS = [30000, 50000, 80000];

  /* ---------------- disponibilidad ----------------
     Con API vacía, la página funciona en modo demostración (horarios simulados).
     Con la dirección del Apps Script, muestra los horarios libres reales del Google Calendar. */
  const API = window.JUMA_API || "";
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fmtDay = (d) => DOW[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today); lastDay.setDate(lastDay.getDate() + MAX_DAYS - 1);
  const booked = new Set(store.get("juma_demo_booked", []));
  const real = {};   // servicio → { "2026-10-22": ["09:00", ...] }
  let senaInfo = null; // { activa, monto, minutos, politica } — lo informa el script
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function demoSlots(day, dur) {
    if (day < today || day > lastDay || HOLIDAYS.includes(iso(day))) return [];
    const out = [], min = new Date(Date.now() + MIN_AHEAD_H * 3600e3);
    for (const [a, b] of HOURS[day.getDay()] || []) {
      const [ah, am] = a.split(":").map(Number), [bh, bm] = b.split(":").map(Number);
      const end = new Date(day); end.setHours(bh, bm, 0, 0);
      for (let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), ah, am); +t + dur * 60e3 <= +end; t = new Date(+t + STEP_MIN * 60e3)) {
        if (t < min) continue;
        const label = pad(t.getHours()) + ":" + pad(t.getMinutes()), key = iso(day) + " " + label;
        out.push({ key, label, free: !((hash(key) % 100) < 32 || booked.has(key)) });   // demo: ~1 de cada 3 ocupado
      }
    }
    return out;
  }
  function slotsFor(day, treat) {
    if (!API) return demoSlots(day, treat.dur);
    return ((real[treat.id] || {})[iso(day)] || []).map((h) => ({ key: iso(day) + " " + h, label: h, free: true }));
  }
  const freeCount = (day, treat) => slotsFor(day, treat).filter((s) => s.free).length;
  async function loadAvail(treat, force) {
    if (!API || (real[treat.id] && !force)) return;
    const r = await fetch(API + "?accion=disponibilidad&servicio=" + encodeURIComponent(treat.id));
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Error");
    real[treat.id] = j.dias;
    if (j.sena) senaInfo = j.sena;
  }
  const bookable = TREATS.filter((t) => !t.consult);

  /* próximo turno libre (portada) */
  async function updateNextSlot() {
    const el = $("#nextSlotText"); if (!el) return;
    const t = bookable[0];
    try { await loadAvail(t); } catch (e) { el.textContent = "Ver horarios"; return; }
    for (let i = 0; i < MAX_DAYS; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const s = slotsFor(d, t).find((x) => x.free);
      if (s) { el.textContent = (i === 0 ? "Hoy" : i === 1 ? "Mañana" : fmtDay(d).replace(/^./, (c) => c.toUpperCase())) + " · " + s.label + " h"; return; }
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
            <span class="tag">${{ facial: "Facial", corporal: "Corporal", rutina: "Asesoramiento" }[t.cat]}</span>
          </div>
          <h3>${t.name}</h3>
          <div class="treat-meta">${t.consult ? "<span>Se define en el diagnóstico</span>" : `<span>${t.dur} min</span><span>·</span><span>por sesión</span>`}</div>
          <p>${t.desc}</p>
          ${t.note ? `<div class="treat-note">${t.note}</div>` : ""}
          <div class="treat-foot">
            <span class="price">${t.consult ? "<small class=\"price-tbd\">Valor según diagnóstico</small>" : money(t.price)}</span>
            ${t.consult
              ? `<a class="btn btn-line btn-sm" href="https://wa.me/${WA}?text=${encodeURIComponent("Hola Carla! Quería consultar por " + t.name + ".")}" target="_blank" rel="noopener">Consultar</a>`
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
  const CHECK = '<div class="done-icon"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 12 4.5 4.5L19 7"/></svg></div>';
  const fmtIso = (f) => { const [y, m, d] = f.split("-").map(Number); return fmtDay(new Date(y, m - 1, d)); };
  /* "Agregar a mi calendario": Google Calendar o archivo .ics (iPhone, Outlook y otros) */
  function calLinks(t) {
    const ini = new Date(t.fecha + "T" + t.hora + ":00-03:00"), fin = new Date(+ini + (t.dur || 60) * 60000);
    const z = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const titulo = "Juma Skincare · " + t.tratamiento, lugar = "Juma Skincare, Fragata Argentina 2063, Oficina 3, Pilar";
    const det = "Turno de " + t.tratamiento + (t.codigo ? " · Código " + t.codigo : "") + ". Cambios: WhatsApp 11 3903-7489.";
    const g = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(titulo) + "&dates=" + z(ini) + "/" + z(fin) +
              "&details=" + encodeURIComponent(det) + "&location=" + encodeURIComponent(lugar);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Juma Skincare//Turnos//ES", "BEGIN:VEVENT", "UID:" + (t.codigo || z(ini)) + "@jumaskincare",
                 "DTSTAMP:" + z(new Date()), "DTSTART:" + z(ini), "DTEND:" + z(fin), "SUMMARY:" + titulo, "LOCATION:" + lugar.replace(/,/g, "\\,"),
                 "DESCRIPTION:" + det.replace(/,/g, "\\,"), "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Turno en Juma mañana", "END:VALARM",
                 "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Turno en Juma en 2 horas", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return `<div class="cal-add"><span class="policy">Agregar a mi calendario (opcional):</span>
      <div class="cal-add-btns"><a class="btn btn-line btn-sm" href="${g}" target="_blank" rel="noopener">Google Calendar</a>
      <a class="btn btn-line btn-sm" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" download="turno-juma.ics">iPhone / otro</a></div></div>`;
  }
  function doneHTML(t) {   // t = { nombre, tratamiento, fecha, hora, dur, codigo, pagada, nota }
    return `
      <div class="done">
        ${CHECK}
        <div class="eyebrow">Turno confirmado</div>
        <h3>${t.nombre.split(" ")[0]}, te esperamos</h3>
        <div class="summary" style="width:100%">
          <div class="sum-row"><span>Tratamiento</span><span>${t.tratamiento}</span></div>
          <div class="sum-row"><span>Cuándo</span><span>${fmtIso(t.fecha)} a las ${t.hora} h</span></div>
          <div class="sum-row"><span>Dónde</span><span>Fragata Argentina 2063, of. 3</span></div>
          ${t.pagada ? `<div class="sum-row"><span>Seña</span><span>Pagada ✓</span></div>` : ""}
          ${t.codigo ? `<div class="sum-row"><span>Código</span><span><strong>${t.codigo}</strong></span></div>` : ""}
        </div>
        ${t.nota ? `<p class="policy">${t.nota}</p>` : ""}
        <p class="policy">${API ? "Tu turno ya quedó agendado. El día anterior te escribimos por WhatsApp para recordártelo. Si necesitás cambiarlo, escribinos al 11 3903-7489." : "Esta es una demostración: el turno no se agenda."}</p>
        ${calLinks(t)}
        <a class="btn btn-solid" href="index.html">Volver al inicio</a>
      </div>`;
  }

  /* regreso desde Mercado Pago: reservar.html?c=CODIGO */
  const back = new URLSearchParams(location.search);
  if ($("#bkMain") && API && back.get("c")) {
    const codigo = back.get("c").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const box = $("#payStatus"); $("#booking").hidden = true; box.hidden = false;
    const wait = (txt) => { box.innerHTML = `<div class="done"><div class="spinner" aria-hidden="true"></div><h3>${txt}</h3><p class="policy">No cierres esta página.</p></div>`; };
    wait("Estamos confirmando tu pago…");
    let tries = 0;
    const check = async () => {
      tries++;
      let j;
      try { j = await (await fetch(API + "?accion=estado&codigo=" + codigo)).json(); } catch (e) { j = { ok: false }; }
      if (j.ok && j.estado === "confirmado") {
        const tr = TREATS.find((x) => x.id === j.turno.servicio) || {};
        box.innerHTML = doneHTML({ nombre: j.turno.nombre, tratamiento: tr.name || j.turno.tratamiento, fecha: j.turno.fecha, hora: j.turno.hora, dur: tr.dur, codigo, pagada: true, nota: tr.note });
        try { sessionStorage.removeItem("juma_pago_" + codigo); } catch (e) {}
        toast("¡Turno confirmado!"); return;
      }
      if (j.ok && j.estado === "vencido") {
        box.innerHTML = `<div class="done"><div class="eyebrow">Turno no confirmado</div><h3>Se venció el tiempo para pagar</h3>
          <p class="policy">Como no recibimos la seña a tiempo, liberamos el horario. Si pagaste y ves este mensaje, escribinos por WhatsApp con el código <strong>${codigo}</strong>.</p>
          <a class="btn btn-solid" href="reservar.html">Elegir otro horario</a>
          <a class="btn btn-line" href="https://wa.me/${WA}?text=${encodeURIComponent("Hola Carla! Tuve un problema con la seña del turno " + codigo + ".")}" target="_blank" rel="noopener">Escribir por WhatsApp</a></div>`;
        return;
      }
      if (tries < (back.get("fallo") ? 2 : 8)) { setTimeout(check, 3000); return; }
      let link = ""; try { link = sessionStorage.getItem("juma_pago_" + codigo) || ""; } catch (e) {}
      box.innerHTML = `<div class="done"><div class="eyebrow">Pago sin confirmar</div><h3>${back.get("fallo") ? "El pago no se completó" : "Todavía no vemos tu pago"}</h3>
        <p class="policy">Tu horario sigue reservado unos minutos más. ${link ? "Podés volver a intentar el pago." : "Si ya pagaste, la confirmación puede demorar unos minutos."}</p>
        ${link ? `<a class="btn btn-solid mp-btn" href="${link}">Volver a intentar el pago</a>` : ""}
        <button class="btn btn-line" type="button" id="reCheck">Ya pagué, revisar de nuevo</button></div>`;
      $("#reCheck").addEventListener("click", () => { tries = 0; wait("Revisando tu pago…"); check(); });
    };
    check();
  }

  else if ($("#bkMain")) {
    const pre = new URLSearchParams(location.search).get("t");
    const bk = { treat: bookable.find((t) => t.id === pre) || bookable[0], month: new Date(today.getFullYear(), today.getMonth(), 1), day: null, slot: null, done: false, loading: false, error: "" };
    $("#bkTreat").innerHTML = bookable.map((t) => `<option value="${t.id}">${t.name} · ${t.dur} min · ${money(t.price)}</option>`).join("");
    $("#bkTreat").value = bk.treat.id;
    async function refresh(force) {
      bk.loading = true; bk.error = ""; renderBooking();
      try { await loadAvail(bk.treat, force); }
      catch (e) { bk.error = "No pudimos cargar los horarios. Probá de nuevo en un momento o escribinos por WhatsApp."; }
      bk.loading = false;
      if (bk.day && !freeCount(bk.day, bk.treat)) bk.day = null;
      if (bk.slot && !(bk.day && slotsFor(bk.day, bk.treat).some((s) => s.key === bk.slot.key && s.free))) bk.slot = null;
      renderBooking();
    }
    $("#bkTreat").addEventListener("change", (e) => { bk.treat = TREATS.find((t) => t.id === e.target.value); bk.slot = null; refresh(); });
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
        const n = bk.loading ? 0 : freeCount(day, bk.treat);
        const sel = bk.day && iso(bk.day) === iso(day);
        const label = fmtDay(day) + (n ? `, ${n} horarios libres` : ", sin horarios");
        html += `<button class="day${n ? " avail" : ""}${sel ? " sel" : ""}${iso(day) === iso(today) ? " today" : ""}" data-day="${iso(day)}" ${n ? "" : "disabled"} aria-label="${label}">${d}</button>`;
      }
      $("#cal").innerHTML = html;
      $("#cal").classList.toggle("is-loading", bk.loading);
    }
    $("#cal").addEventListener("click", (e) => {
      const b = e.target.closest("[data-day]"); if (!b || b.disabled) return;
      const [y, mo, d] = b.dataset.day.split("-").map(Number); bk.day = new Date(y, mo - 1, d); bk.slot = null; renderBooking();
    });
    function renderSlots() {
      const box = $("#slots"), hint = $("#slotsHint");
      if (bk.error) { box.innerHTML = ""; hint.textContent = bk.error; return; }
      if (bk.loading) { box.innerHTML = ""; hint.textContent = "Buscando horarios libres…"; return; }
      if (!bk.day) { box.innerHTML = ""; hint.textContent = "Elegí un día para ver los horarios libres."; return; }
      const list = slotsFor(bk.day, bk.treat);
      box.innerHTML = list.map((s) => `<button class="slot" data-key="${s.key}" ${s.free ? "" : "disabled"} aria-pressed="${!!(bk.slot && bk.slot.key === s.key)}" aria-label="${s.label}${s.free ? "" : " ocupado"}">${s.label}</button>`).join("");
      hint.textContent = API ? "Solo te mostramos los horarios libres." : "Los horarios tachados ya están ocupados.";
    }
    $("#slots").addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]"); if (!b || b.disabled) return;
      bk.slot = slotsFor(bk.day, bk.treat).find((s) => s.key === b.dataset.key); renderBooking();
    });
    function renderSummary() {
      if (bk.done) return;
      $("#sumTitle").textContent = bk.treat.name;
      $("#sumDay").textContent = bk.day ? fmtDay(bk.day) : "—";
      $("#sumHour").textContent = bk.slot ? bk.slot.label + " h" : "—";
      $("#sumDur").textContent = bk.treat.dur + " min";
      $("#sumPrice").textContent = money(bk.treat.price);
      $("#sumNote").textContent = bk.treat.note || "";
      const sena = senaInfo && senaInfo.activa;
      $("#sumSenaRow").hidden = !sena;
      if (sena) { $("#sumSena").textContent = money(senaInfo.monto); $("#sumPolicy").textContent = senaInfo.politica; }
      const btn = $("#bkConfirm");
      if (!bk.sending) btn.textContent = sena ? "Continuar al pago de la seña" : "Confirmar turno";
      btn.disabled = !(bk.day && bk.slot) || bk.sending;
    }
    function renderBooking() { renderCal(); renderSlots(); renderSummary(); }

    function lockForm() {
      $("#bkMain").classList.add("locked");
      $("#bkSide").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    function showPay(j, name) {
      bk.done = true;
      try { sessionStorage.setItem("juma_pago_" + j.codigo, j.pago); } catch (e) {}
      const fin = Date.now() + j.minutos * 60000;
      $("#bkSide").innerHTML = `
        <div class="done">
          <div class="eyebrow">Último paso</div>
          <h3>Pagá la seña para confirmar</h3>
          <div class="summary" style="width:100%">
            <div class="sum-row"><span>Tratamiento</span><span>${bk.treat.name}</span></div>
            <div class="sum-row"><span>Cuándo</span><span>${fmtDay(bk.day)} a las ${bk.slot.label} h</span></div>
            <div class="sum-row"><span>A nombre de</span><span>${name}</span></div>
          </div>
          <div class="pay-amount">${money(j.sena.monto)}</div>
          <p class="policy">Te guardamos el horario durante <span class="pay-timer" id="payTimer">${j.minutos}:00</span> min. ${j.sena.politica}</p>
          <a class="btn btn-solid mp-btn" href="${j.pago}">Pagar con Mercado Pago</a>
          <p class="policy">Al terminar el pago volvés a esta página y tu turno queda confirmado.</p>
        </div>`;
      const tick = () => {
        const left = Math.max(0, fin - Date.now()), el = $("#payTimer"); if (!el) return;
        el.textContent = Math.floor(left / 60000) + ":" + pad(Math.floor(left / 1000) % 60);
        if (left > 0) setTimeout(tick, 1000);
      };
      tick(); lockForm();
    }

    $("#bkConfirm").addEventListener("click", async () => {
      const name = $("#bkName").value.trim(), phone = $("#bkPhone").value.replace(/\D/g, "");
      const err = $("#bkErr");
      if (name.length < 3) { err.textContent = "Escribí tu nombre y apellido para reservar."; $("#bkName").focus(); return; }
      if (phone.length < 8) { err.textContent = "Escribí tu número de WhatsApp para poder contactarte."; $("#bkPhone").focus(); return; }
      err.textContent = "";
      if (!API) {
        booked.add(bk.slot.key); store.set("juma_demo_booked", [...booked]);
        bk.done = true;
        $("#bkSide").innerHTML = doneHTML({ nombre: name, tratamiento: bk.treat.name, fecha: iso(bk.day), hora: bk.slot.label, dur: bk.treat.dur, nota: bk.treat.note });
        renderCal(); renderSlots(); lockForm(); toast("Turno reservado (demo)"); return;
      }
      const btn = $("#bkConfirm");
      bk.sending = true; btn.disabled = true; btn.textContent = "Un momento…";
      try {
        const r = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },   // texto plano: evita el pedido previo de permisos (CORS)
          body: JSON.stringify({ servicio: bk.treat.id, fecha: iso(bk.day), hora: bk.slot.label, nombre: name, telefono: phone,
                                 comentario: $("#bkNote").value.trim(), web: $("#bkWeb") ? $("#bkWeb").value : "" })
        });
        const j = await r.json();
        if (j.ok && j.estado === "pendiente" && j.pago) { showPay(j, name); return; }
        if (j.ok) {
          bk.done = true;
          $("#bkSide").innerHTML = doneHTML({ nombre: name, tratamiento: bk.treat.name, fecha: iso(bk.day), hora: bk.slot.label, dur: bk.treat.dur, codigo: j.codigo, nota: bk.treat.note });
          lockForm(); toast("¡Turno reservado!"); return;
        }
        err.textContent = j.error || "No pudimos reservar. Probá de nuevo.";
        if (j.ocupado) { bk.slot = null; await refresh(true); }
      } catch (e) {
        err.textContent = "No pudimos reservar por un problema de conexión. Probá de nuevo o escribinos por WhatsApp.";
      } finally {
        bk.sending = false; renderSummary();
      }
    });
    refresh();
  }

  /* ---------------- asistencia.html: link "✓ Confirmó" del resumen diario de Carla ---------------- */
  if ($("#asistencia")) {
    const q = new URLSearchParams(location.search), box = $("#asistencia");
    const show = (ok, t) => { box.innerHTML = `<div class="done">${ok ? CHECK : ""}<div class="eyebrow">${ok ? "Asistencia confirmada" : "No se pudo marcar"}</div><h3>${t}</h3>
      <p class="policy">${ok ? "El turno quedó en verde en el calendario." : "Probá de nuevo desde el mail del resumen."}</p></div>`; };
    if (!API || !q.get("id") || !q.get("k")) show(false, "Link incompleto");
    else fetch(API + "?accion=asistencia&json=1&id=" + encodeURIComponent(q.get("id")) + "&k=" + encodeURIComponent(q.get("k")))
      .then((r) => r.json()).then((j) => show(!!j.ok, j.mensaje || "Error")).catch(() => show(false, "Sin conexión. Probá de nuevo."));
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

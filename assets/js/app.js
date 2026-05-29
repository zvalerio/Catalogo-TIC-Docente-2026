/**
 * app.js
 * Catálogo TIC · Competencia 28 · Educación Primaria
 *
 * Funciones:
 *  - Renderizado por grado con tarjetas e imágenes banner
 *  - Filtro por grado (nav), ciclo, area curricular
 *  - Búsqueda en tiempo real
 *  - CRUD completo: agregar, editar, eliminar actividades
 *  - Persistencia con localStorage
 *  - Notificaciones tipo toast
 */

/* ====================================================
   CONFIGURACION POR GRADO
==================================================== */
const GRADE_CONFIG = {
  "1": { color: "#FF4757", label: "Grado de Primaria" },
  "2": { color: "#FF6B2B", label: "Grado de Primaria" },
  "3": { color: "#FFC107", label: "Grado de Primaria" },
  "4": { color: "#00C853", label: "Grado de Primaria" },
  "5": { color: "#2979FF", label: "Grado de Primaria" },
  "6": { color: "#9C27B0", label: "Grado de Primaria" }
};

const CICLO_LABELS = {
  III: "Ciclo III",
  IV:  "Ciclo IV",
  V:   "Ciclo V"
};

/* ====================================================
   ESTADO
==================================================== */
let actividades  = cargarDatos();
let gradoActivo  = "todos";
let editandoId   = null;
let toastTimer   = null;
let isAdminMode  = false;

/* ====================================================
   PERSISTENCIA
==================================================== */
function cargarDatos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Primera vez: cargar datos por defecto
  return JSON.parse(JSON.stringify(ACTIVIDADES_DEFAULT));
}

function guardarDatos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actividades));
  } catch (_) {
    mostrarToast("No se pudo guardar en el navegador.", "error");
  }
}

/* ====================================================
   FILTROS Y BUSQUEDA
==================================================== */
function filtrarActividades() {
  const q    = document.getElementById("searchInput").value.toLowerCase().trim();
  const ciclo = document.getElementById("filterCiclo").value;
  const area = document.getElementById("filterArea").value;

  return actividades.filter(a => {
    const matchGrado = gradoActivo === "todos" || a.grado === gradoActivo;
    const matchCiclo = ciclo === "todos" || (
      (ciclo === "III" && ["1","2"].includes(a.grado)) ||
      (ciclo === "IV"  && ["3","4"].includes(a.grado)) ||
      (ciclo === "V"   && ["5","6"].includes(a.grado))
    );
    const matchArea  = area === "todos" || a.area === area;
    const matchQ     = !q || [a.titulo, a.desc, a.tic, a.area, a.capacidad, a.evidencia]
                         .some(f => f && f.toLowerCase().includes(q));
    return matchGrado && matchCiclo && matchArea && matchQ;
  });
}

/* ====================================================
   POBLAR FILTRO DE AREAS
==================================================== */
function poblarFiltroAreas() {
  const sel    = document.getElementById("filterArea");
  const areas  = [...new Set(actividades.map(a => a.area).filter(Boolean))].sort();
  const actual = sel.value;

  // Limpiar salvo opcion "todos"
  while (sel.options.length > 1) sel.remove(1);

  areas.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  });

  // Restaurar seleccion si sigue existiendo
  if ([...sel.options].some(o => o.value === actual)) sel.value = actual;
}

/* ====================================================
   RENDER PRINCIPAL
==================================================== */
function renderCatálogo() {
  const contenedor = document.getElementById("catalogContainer");
  const filtradas  = filtrarActividades();
  contenedor.innerHTML = "";

  // Stats
  document.getElementById("statsRow").textContent =
    `Mostrando ${filtradas.length} actividad${filtradas.length !== 1 ? "es" : ""}` +
    (filtradas.length !== actividades.length
      ? ` de ${actividades.length} en total`
      : "");

  if (!filtradas.length) {
    const q          = document.getElementById("searchInput").value.trim();
    const ciclo      = document.getElementById("filterCiclo").value;
    const area       = document.getElementById("filterArea").value;
    const hayFiltros = q || ciclo !== "todos" || area !== "todos";
    const gradoLabel = gradoActivo !== "todos" ? `${gradoActivo}.° Grado` : "";

    let titulo, mensaje, pista;

    if (hayFiltros) {
      const contexto = gradoLabel ? ` en ${gradoLabel}` : "";
      titulo  = "Sin resultados para esta busqueda";
      mensaje = `Ninguna actividad${contexto} coincide con los filtros aplicados. Prueba con otras palabras clave, cambia el ciclo o el area.`;
      pista   = "Limpiar filtros";
    } else if (gradoActivo !== "todos") {
      titulo  = `No hay actividades para ${gradoLabel}`;
      mensaje = `Aun no se han agregado actividades para este grado. Usa el boton de abajo para registrar la primera.`;
      pista   = "Agregar actividad para este grado";
    } else {
      titulo  = "El catalogo esta vacio";
      mensaje = "No hay ningúna actividad registrada todavía. Comienza agregando la primera actividad TIC para tus estudiantes.";
      pista   = "Agregar la primera actividad";
    }

    contenedor.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
            <path d="M9 10h.01M12 10h.01M15 10h.01"/>
          </svg>
        </div>
        <h3>${titulo}</h3>
        <p>${mensaje}</p>
        <span class="empty-hint" id="emptyAction">${pista}</span>
      </div>`;

    document.getElementById("emptyAction").addEventListener("click", () => {
      if (hayFiltros) {
        document.getElementById("searchInput").value = "";
        document.getElementById("filterCiclo").value  = "todos";
        document.getElementById("filterArea").value  = "todos";
        renderCatálogo();
      } else {
        document.getElementById("btnAdd").click();
      }
    });
    return;
  }

  const grados = gradoActivo === "todos"
    ? ["1","2","3","4","5","6"]
    : [gradoActivo];

  let esFirstSeccion = true;

  grados.forEach(g => {
    const grupo = filtradas.filter(a => a.grado === g);
    if (!grupo.length) return;

    // Clonar el header antes de cada sección excepto la primera
    // (En pantalla estará oculto, en impresión se verá)
    if (!esFirstSeccion) {
      const headerOriginal = document.querySelector('.print-header');
      if (headerOriginal) {
        const headerClone = headerOriginal.cloneNode(true);
        headerClone.classList.add('print-header-repeat');
        contenedor.appendChild(headerClone);
      }
    }
    esFirstSeccion = false;

    const cfg   = GRADE_CONFIG[g];
    const sec   = document.createElement("div");
    sec.className = "grade-section";

    sec.innerHTML = `
      <div class="grade-section-header">
        <span class="grade-pill" style="background:${cfg.color}">${g}.°</span>
        <h2 class="grade-section-title" style="color:${cfg.color}">${cfg.label}</h2>
        <span class="grade-section-count">${grupo.length} actividad${grupo.length !== 1 ? "es" : ""}</span>
      </div>
      <div class="cards-grid"></div>`;

    const grid = sec.querySelector(".cards-grid");
    grupo.forEach(a => grid.appendChild(crearTarjeta(a)));
    contenedor.appendChild(sec);
  });
}

/* ====================================================
   CREAR TARJETA
==================================================== */
function crearTarjeta(a) {
  const cfg   = GRADE_CONFIG[a.grado] || { color: "#2979FF" };
  const card  = document.createElement("div");
  card.className = "card";
  card.dataset.id = a.id;

  const imagePath = a.imagen
    ? `assets/images/actividades/${a.imagen}`
    : null;

  card.innerHTML = `
    <div class="card-top-bar" style="background:${cfg.color}"></div>

    <div class="card-image-wrap" style="background:${cfg.color}18">
      ${imagePath
        ? `<img
             class="card-image"
             src="${escHtml(imagePath)}"
             alt="Captura de pantalla de ${escHtml(a.tic)}"
             loading="lazy"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
           />
           <div class="card-image-placeholder" style="display:none;">
             ${iconoSoftware()}
             <span>${escHtml(a.tic)}</span>
           </div>`
        : `<div class="card-image-placeholder">
             ${iconoSoftware()}
             <span>${escHtml(a.tic)}</span>
           </div>`
      }
    </div>

    <div class="card-body">
      <h3 class="card-title">${escHtml(a.titulo)}</h3>

      <div class="card-tags">
        ${a.area ? `<span class="tag tag-area">${escHtml(a.area)}</span>` : ""}
        <span class="tag tag-tic">${escHtml(a.tic)}</span>
        ${(() => {
          const cicloVal = a.ciclo || ((["1","2"].includes(a.grado)) ? "III" : ((["3","4"].includes(a.grado)) ? "IV" : "V"));
          return `<span class="tag tag-ciclo">${CICLO_LABELS[cicloVal] || cicloVal}</span>`;
        })()}
      </div>

      <p class="card-desc">${escHtml(a.desc)}</p>

      ${a.capacidad
        ? `<div class="card-capacity">${escHtml(a.capacidad)}</div>`
        : ""}

      ${a.evidencia
        ? `<div>
             <p class="card-evidence-label">Evidencia esperada</p>
             <p class="card-evidence-text">${escHtml(a.evidencia)}</p>
           </div>`
        : ""}
    </div>

    <div class="card-actions">
      <button class="btn-edit" data-id="${a.id}" aria-label="Editar actividad ${escHtml(a.titulo)}">
        ${iconoEdit()} Editar
      </button>
      <button class="btn-del" data-id="${a.id}" aria-label="Eliminar actividad ${escHtml(a.titulo)}">
        ${iconoTrash()} Eliminar
      </button>
    </div>`;

  card.querySelector(".btn-edit").addEventListener("click", () => abrirEditar(a.id));
  card.querySelector(".btn-del").addEventListener("click",  () => eliminar(a.id, a.titulo));
  return card;
}

/* ====================================================
   ICONOS SVG INLINE (sin emojis)
==================================================== */
function iconoSoftware() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>`;
}
function iconoEdit() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:14px;height:14px">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`;
}
function iconoTrash() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:14px;height:14px">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>`;
}

/* ====================================================
   MODAL: ABRIR / CERRAR
==================================================== */
function abrirModal(titulo) {
  document.getElementById("modalTitle").textContent = titulo;
  document.getElementById("overlay").classList.add("active");
  document.getElementById("fTítulo").focus();
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "";
  limpiarForm();
  editandoId = null;
}

function limpiarForm() {
  ["fTítulo","fGrade","fCiclo","fArea","fDesc","fTic","fImagen","fCapacidad","fEvidencia"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
}

/* ====================================================
   CRUD: AGREGAR
==================================================== */
document.getElementById("btnAdd").addEventListener("click", () => {
  if (!isAdminMode) return;
  editandoId = null;
  limpiarForm();
  abrirModal("Nueva actividad");
});

/* ====================================================
   CRUD: EDITAR
==================================================== */
function abrirEditar(id) {
  if (!isAdminMode) return;
  const a = actividades.find(x => x.id === id);
  if (!a) return;
  editandoId = id;

  document.getElementById("fTítulo").value    = a.titulo     || "";
  document.getElementById("fGrade").value     = a.grado      || "";
  const cicloVal = a.ciclo || ( ["1","2"].includes(a.grado) ? "III" : ( ["3","4"].includes(a.grado) ? "IV" : "V") );
  document.getElementById("fCiclo").value     = cicloVal || "";
  document.getElementById("fArea").value      = a.area       || "";
  document.getElementById("fDesc").value      = a.desc       || "";
  document.getElementById("fTic").value       = a.tic        || "";
  document.getElementById("fImagen").value    = a.imagen     || "";
  document.getElementById("fCapacidad").value = a.capacidad  || "";
  document.getElementById("fEvidencia").value = a.evidencia  || "";

  abrirModal("Editar actividad");
}

/* ====================================================
   CRUD: GUARDAR (crear o actualizar)
==================================================== */
document.getElementById("btnSave").addEventListener("click", () => {
  const titulo     = document.getElementById("fTítulo").value.trim();
  const grado      = document.getElementById("fGrade").value;
  const ciclo      = document.getElementById("fCiclo").value;
  const desc       = document.getElementById("fDesc").value.trim();
  const tic        = document.getElementById("fTic").value.trim();

  if (!titulo || !grado || !ciclo || !desc || !tic) {
    mostrarToast("Completa los campos obligatorios marcados con *", "error");
    return;
  }

  const datos = {
    titulo,
    grado,
    ciclo,
    area:      document.getElementById("fArea").value.trim(),
    desc,
    tic,
    imagen:    document.getElementById("fImagen").value.trim(),
    capacidad: document.getElementById("fCapacidad").value.trim(),
    evidencia: document.getElementById("fEvidencia").value.trim()
  };

  if (editandoId !== null) {
    const idx = actividades.findIndex(a => a.id === editandoId);
    if (idx !== -1) {
      actividades[idx] = { id: editandoId, ...datos };
      mostrarToast("Actividad actualizada correctamente.", "success");
    }
  } else {
    datos.id = Date.now();
    actividades.push(datos);
    mostrarToast("Actividad agregada al catalogo.", "success");
  }

  guardarDatos();
  poblarFiltroAreas();
  cerrarModal();
  renderCatálogo();
});

/* ====================================================
   CRUD: ELIMINAR
==================================================== */
function eliminar(id, titulo) {
  if (!isAdminMode) return;
  if (!confirm(`Deseas eliminar la actividad:\n"${titulo}"\n\nEsta acción no se puede deshacer.`)) return;

  actividades = actividades.filter(a => a.id !== id);
  guardarDatos();
  poblarFiltroAreas();
  renderCatálogo();
  mostrarToast("Actividad eliminada del catalogo.", "error");
}

/* ====================================================
   CERRAR MODAL
==================================================== */
document.getElementById("btnClose").addEventListener("click", cerrarModal);
document.getElementById("btnCancel").addEventListener("click", cerrarModal);
document.getElementById("overlay").addEventListener("click", e => {
  if (e.target === document.getElementById("overlay")) cerrarModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarModal();
});

/* ====================================================
   NAV DE GRADOS
==================================================== */
document.getElementById("navGrados").addEventListener("click", e => {
  const btn = e.target.closest(".btn-grade");
  if (!btn) return;
  document.querySelectorAll(".btn-grade").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  gradoActivo = btn.dataset.grade;
  renderCatálogo();
});

/* ====================================================
   BUSQUEDA Y FILTROS
==================================================== */
document.getElementById("searchInput").addEventListener("input", renderCatálogo);
document.getElementById("filterCiclo").addEventListener("change", renderCatálogo);
document.getElementById("filterArea").addEventListener("change", renderCatálogo);

/* ====================================================
   TOAST
==================================================== */
function mostrarToast(msg, tipo = "info") {
  const t = document.getElementById("toast");
  t.textContent  = msg;
  t.className    = `toast show ${tipo}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = "toast"; }, 3500);
}

/* ====================================================
   UTILIDAD: escapar HTML
==================================================== */
function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ====================================================
   INICIO
==================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Configurar fecha de impresion al imprimir
  window.addEventListener("beforeprint", () => {
    const elDate = document.getElementById("printDate");
    if (elDate) {
      const now = new Date();
      elDate.textContent = now.toLocaleDateString('es-PE') + " - " + now.toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'});
    }
  });
  
  // Establecer modo inicial (Docente)
  document.body.classList.add('mode-docente');
});

// Toggle Admin Mode (CTRL + M)
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === 'm') {
    e.preventDefault();
    isAdminMode = !isAdminMode;
    
    if (isAdminMode) {
      document.body.classList.remove('mode-docente');
      document.body.classList.add('mode-admin');
      mostrarToast("Modo Administrador activado", "info");
    } else {
      document.body.classList.remove('mode-admin');
      document.body.classList.add('mode-docente');
      mostrarToast("Modo Docente activado", "info");
    }
  }
});

poblarFiltroAreas();
renderCatálogo();

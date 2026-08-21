/* i18n.js — detección de idioma es/en compartida por cacelass.github.io (WEB-014).
 *
 * Mecanismo:
 *   1. localStorage['climasafe_lang'] (es|en) tiene prioridad sobre el navegador.
 *   2. Sin preferencia guardada → navigator.language: los navegadores 'en*' cargan
 *      en inglés; cualquier otro idioma cae a español.
 *   3. El selector #lang-select cambia el idioma al instante y lo guarda.
 *
 * Uso:
 *   <script src="i18n.js" defer></script> en <head>, y en el nav:
 *   <select id="lang-select" class="lang-select" aria-label="Idioma / Language">…</select>
 *   Textos estáticos: <span data-i18n="clave">texto por defecto</span>.
 *   Si la traducción contiene HTML (strong/code/a): <span data-i18n="clave" data-i18n-html>.
 *   Textos dinámicos (JS): ClimaSafeI18n.t('clave').
 *
 * Decisión de alcance (WEB-014, documentada en progress/implementer-WEB-014.md):
 *   Se traduce la UI (nav, títulos, botones, etiquetas, secciones). El contenido
 *   largo (párrafos de proyecto, descripciones de tarjetas, listas técnicas)
 *   permanece en el idioma por defecto de cada página y no se duplica aquí.
 */
(function () {
  "use strict";

  var KEY = "climasafe_lang";

  var DICT = {
    es: {
      nav_about: "sobre mí",
      nav_projects: "proyectos",
      nav_stack: "stack",
      nav_reading: "lectura",
      nav_contact: "contacto",
      back_index: "← inicio",
      // Home
      hero_h1_1: "Sistemas de ML que",
      hero_h1_2: "sobreviven a producción.",
      about_title: "Identidad de ingeniería",
      about_lbl_approach: "Enfoque",
      about_lbl_systems: "Formación en sistemas",
      about_lbl_production: "Conciencia de producción",
      about_lbl_passion: "Pasión",
      projects_title: "Sistemas seleccionados",
      feat_meta_view: "ver proyecto →",
      tag_harness: "scaffold · arnés",
      tag_earlywarning: "alerta temprana · ML",
      tag_fraud: "detección de fraude",
      tag_banking: "banca · propensión",
      tag_timeseries: "series temporales · finanzas",
      tag_harness2: "arnés de agentes",
      climasafe_try: "probar ya",
      climasafe_docs: "documentación",
      more_title: "Más proyectos",
      stack_title: "Modelo de capacidades",
      stack_core: "Ingeniería core",
      stack_ml: "Pipeline ML / datos",
      stack_cloud: "Cloud / infraestructura",
      stack_domain: "Conocimiento de dominio",
      stack_ai: "Ingeniería de IA",
      stack_build: "Lo que sé construir",
      cap_pipelines: "Pipelines supervisados de extremo a extremo (clasificación + regresión)",
      cap_fraud: "Detección de fraude y AML con evaluación imbalance-first",
      cap_credit: "Credit scoring con probabilidades calibradas y umbrales desacoplados",
      cap_uv: "Entornos de proyecto reproducibles con dependencias versionadas vía uv",
      cap_eval: "Frameworks de evaluación con controles explícitos de fuga de datos",
      cap_ts: "Modelos de series temporales con validación temporal y backtest fuera de muestra",
      cap_docker: "Servicios ML contenerizados (Docker + FastAPI) para cloud u on-premise",
      cap_drift: "Monitorización de drift para modelos en producción",
      cap_rag: "Sistemas RAG con fuentes verificables y guardarraíles",
      cap_harness: "Arneses de IA que aplican puertas de calidad en código",
      cap_multiagent: "Sistemas multiagente con agentes Python deterministas",
      cap_lora: "Fine-tuning de LLM y adaptación LoRA",
      reading_title: "Libros que marcaron mi forma de trabajar",
      // projects/climasafe.html
      eyebrow_climasafe: "ClimaSafe · alerta temprana · ML",
      climasafe_h1_1: "Alerta de riesgo por calor y frío",
      climasafe_h1_2: "antes de que llegue el día.",
      cta_try: "Probar ya",
      cta_docs: "Documentación",
      cta_back_projects: "← volver a proyectos",
      tag_problem: "problema",
      title_solves: "Qué resuelve",
      stat_models: "Modelos",
      stat_data: "Datos",
      stat_scope: "Alcance",
      tag_approach: "enfoque",
      title_modelling: "Modelado",
      tag_results: "resultados",
      title_results: "Números reales",
      metric_lbl: "Rec_riesgo (umbrales calibrados)",
      // climasafe/mcp.html
      eyebrow_mcp: "ClimaSafe · servidor MCP",
      mcp_h1_1: "ClimaSafe como",
      mcp_h1_2: "servidor del Model Context Protocol.",
      mcp_sub: "El motor de riesgo de ClimaSafe — predicción, perfiles personales, rutinas y gráficas de riesgo — expuesto como servidor MCP para que cualquier asistente de IA pueda preguntar sobre el riesgo por calor y frío directamente desde su propia interfaz.",
      cta_telegram_bot: "Bot de Telegram",
      cta_back_project: "← volver al proyecto",
      tag_what: "qué es",
      title_mcp_what: "Un MCP para el riesgo por calor y frío",
      stat_tools: "Herramientas",
      stat_access: "Acceso",
      stat_transport: "Transporte",
      tools_val: "predicción de riesgo · gráfica de riesgo · perfiles · rutinas",
      access_val: "solo lectura por defecto · escrituras con token",
      transport_val: "stdio (local) · SSE (remoto)",
      tag_connect: "conectar",
      title_connect: "Añádelo a Claude Desktop, opencode o Cline",
      tag_permissions: "permisos",
      title_permissions: "Solo lectura por defecto, escrituras tras un token",
      // climasafe/telegram.html
      eyebrow_tg: "ClimaSafe · bot de Telegram",
      tg_h1_1: "Riesgo por calor y frío,",
      tg_h1_2: "en tu chat.",
      tg_sub: "El bot de Telegram de ClimaSafe responde con tu nivel de riesgo personal, gestiona tu perfil y tus rutinas, y envía avisos diarios antes de que lleguen los días peligrosos. Las respuestas las redacta un LLM local que se ejecuta en tu máquina.",
      cta_mcp_server: "Servidor MCP",
      tag_create: "crear",
      title_create: "Crea el bot con @BotFather",
      dec_create_1: "Abre <strong>@BotFather</strong> en Telegram y envía <code>/newbot</code>.",
      dec_create_2: "Elige un <strong>nombre</strong> (el que ven los usuarios) y un <strong>username</strong> que termine en <code>bot</code>.",
      dec_create_3: "Copia el <strong>token de API</strong> que devuelve BotFather. Tiene esta pinta: <code>123456:ABC-DEF...</code>.",
      tag_token: "token",
      title_token: "Dónde va el token",
      tg_token_p1: "El token va en un fichero <code>.env</code> en la <strong>raíz del repositorio de ClimaSafe</strong>:",
      tg_token_p2: "Parte de <code>.env.example</code> como referencia: cópialo a <code>.env</code> y rellena tu token. El token es un secreto: nunca va en el código, nunca en el repositorio, nunca en un commit.",
      tag_run: "ejecutar",
      title_run: "Ejecútalo localmente",
      tg_run_p1: "El bot se arranca desde la raíz del repositorio con los targets del Makefile: <code>make spacebot</code> (primer arranque) y <code>make spacebot-start</code> (ejecutar el bot). La alerta diaria y el pipeline de predicción corren con un programador.",
      tg_run_p2: "Fuente y detalles de instalación:",
      // Notas mixtas (mcp.html, telegram.html)
      mcp_note_token: "<strong>Sin token, solo lectura.</strong> El servidor arranca en modo solo lectura cuando no hay token de escritura. Las operaciones de escritura — crear o borrar perfiles, gestionar rutinas, configurar alertas diarias — requieren <code>CLIMASAFE_MCP_WRITE_TOKEN</code> en el entorno. Las predicciones y gráficas de riesgo funcionan sin él.",
      tg_note_llm: "<strong>El LLM del bot es local (Ollama).</strong> El bot redacta sus respuestas con un LLM local — <strong>Ollama</strong> sirviendo <strong>qwen3:climasafe</strong>, un modelo fine-tuneado — no con una API en la nube. Para que el bot funcione, ejecuta el repositorio mientras Ollama sirve el modelo. Lo demás — el formulario, la predicción de riesgo y las alertas diarias — es determinista y funciona sin el LLM."
    },
    en: {
      nav_about: "about",
      nav_projects: "projects",
      nav_stack: "stack",
      nav_reading: "reading",
      nav_contact: "contact",
      back_index: "← index",
      // Home
      hero_h1_1: "ML systems that",
      hero_h1_2: "survive production.",
      about_title: "Engineering identity",
      about_lbl_approach: "Approach",
      about_lbl_systems: "Systems background",
      about_lbl_production: "Production awareness",
      about_lbl_passion: "Passion",
      projects_title: "Selected systems",
      feat_meta_view: "view project →",
      tag_harness: "scaffold · harness",
      tag_earlywarning: "early warning · ML",
      tag_fraud: "fraud detection",
      tag_banking: "banking · propensity",
      tag_timeseries: "time series · finance",
      tag_harness2: "agent harness",
      climasafe_try: "try now",
      climasafe_docs: "docs",
      more_title: "Further work",
      stack_title: "Capability model",
      stack_core: "Core engineering",
      stack_ml: "ML / Data pipeline",
      stack_cloud: "Cloud / Infrastructure",
      stack_domain: "Domain knowledge",
      stack_ai: "AI engineering",
      stack_build: "What I can build",
      cap_pipelines: "End-to-end supervised pipelines (classification + regression)",
      cap_fraud: "Fraud and AML detection with imbalance-first evaluation",
      cap_credit: "Credit scoring with calibrated probabilities and decoupled thresholds",
      cap_uv: "Reproducible project environments with versioned dependencies via uv",
      cap_eval: "Evaluation frameworks with explicit data leakage controls",
      cap_ts: "Time-series models with temporal validation and out-of-sample backtest",
      cap_docker: "Containerised ML services (Docker + FastAPI) for cloud or on-premise",
      cap_drift: "Drift monitoring for models in production",
      cap_rag: "RAG systems with verifiable sources and guardrails",
      cap_harness: "AI harnesses that enforce quality gates in code",
      cap_multiagent: "Multi-agent systems with deterministic Python agents",
      cap_lora: "LLM fine-tuning and LoRA adaptation",
      reading_title: "Books that shaped how I work",
      // projects/climasafe.html
      eyebrow_climasafe: "ClimaSafe · early warning · ML",
      climasafe_h1_1: "Heat and cold risk warning",
      climasafe_h1_2: "before the day arrives.",
      cta_try: "Try now",
      cta_docs: "Docs",
      cta_back_projects: "← back to projects",
      tag_problem: "problem",
      title_solves: "What it solves",
      stat_models: "Models",
      stat_data: "Data",
      stat_scope: "Scope",
      tag_approach: "approach",
      title_modelling: "Modelling",
      tag_results: "results",
      title_results: "Real numbers",
      metric_lbl: "Rec_riesgo (calibrated thresholds)",
      // climasafe/mcp.html
      eyebrow_mcp: "ClimaSafe · MCP server",
      mcp_h1_1: "ClimaSafe as a",
      mcp_h1_2: "Model Context Protocol server.",
      mcp_sub: "The ClimaSafe risk engine — prediction, personal profiles, routines and risk charts — exposed as an MCP server so any AI assistant can ask about heat and cold risk directly from its own interface.",
      cta_telegram_bot: "Telegram bot",
      cta_back_project: "← back to project",
      tag_what: "what it is",
      title_mcp_what: "An MCP for heat and cold risk",
      stat_tools: "Tools",
      stat_access: "Access",
      stat_transport: "Transport",
      tools_val: "risk prediction · risk chart · profiles · routines",
      access_val: "read-only by default · writes need a token",
      transport_val: "stdio (local) · SSE (remote)",
      tag_connect: "connect",
      title_connect: "Add it to Claude Desktop, opencode or Cline",
      tag_permissions: "permissions",
      title_permissions: "Read-only by default, writes behind a token",
      // climasafe/telegram.html
      eyebrow_tg: "ClimaSafe · Telegram bot",
      tg_h1_1: "Heat and cold risk,",
      tg_h1_2: "right in your chat.",
      tg_sub: "The ClimaSafe Telegram bot answers with your personal risk level, manages your profile and routines, and sends daily alerts before dangerous days arrive. Responses are drafted by a local LLM running on your machine.",
      cta_mcp_server: "MCP server",
      tag_create: "create",
      title_create: "Create the bot with @BotFather",
      dec_create_1: "Open <strong>@BotFather</strong> in Telegram and send <code>/newbot</code>.",
      dec_create_2: "Choose a <strong>name</strong> (what users see) and a <strong>username</strong> ending in <code>bot</code>.",
      dec_create_3: "Copy the <strong>API token</strong> that BotFather returns. It looks like <code>123456:ABC-DEF...</code>.",
      tag_token: "token",
      title_token: "Where the token goes",
      tg_token_p1: "The token goes in a <code>.env</code> file at the <strong>root of the ClimaSafe repository</strong>:",
      tg_token_p2: "Start with <code>.env.example</code> as a reference: copy it to <code>.env</code> and fill in your token. The token is a secret: it never goes in the code, never in the repository, never in a commit.",
      tag_run: "run",
      title_run: "Run it locally",
      tg_run_p1: "The bot is started from the repository root with the Makefile targets: <code>make spacebot</code> (first-time setup) and <code>make spacebot-start</code> (run the bot). The daily alert and prediction pipeline runs on a schedule.",
      tg_run_p2: "Source and setup details:",
      // Notas mixtas (mcp.html, telegram.html)
      mcp_note_token: "<strong>No token, read-only.</strong> The server starts in read-only mode when no write token is set. Write operations — creating or deleting profiles, managing routines, setting daily alerts — require <code>CLIMASAFE_MCP_WRITE_TOKEN</code> to be present in the environment. Predictions and risk charts work without it.",
      tg_note_llm: "<strong>The bot's LLM is local (Ollama).</strong> The bot drafts its replies with a local LLM — <strong>Ollama</strong> serving <strong>qwen3:climasafe</strong>, a fine-tuned model — not with a cloud API. For the bot to work, run the repository while Ollama serves the model. Everything else — the form, the risk prediction and the daily alerts — is deterministic and works regardless of the LLM."
    }
  };

  var current = "es";

  function getSaved() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "es" || v === "en") return v;
    } catch (e) { /* sin almacenamiento: se usa el navegador */ }
    return null;
  }

  function detect() {
    var saved = getSaved();
    if (saved) return saved;
    var nav = (navigator.language || navigator.userLanguage || "es").toLowerCase();
    return nav.indexOf("en") === 0 ? "en" : "es";
  }

  function translate(lang) {
    var dict = DICT[lang] || DICT.es;
    document.documentElement.lang = lang;
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      if (!(key in dict)) continue;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = dict[key];
      } else if (el.getAttribute("data-i18n-html") !== null) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
    var sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
  }

  function setLang(lang) {
    lang = lang === "en" ? "en" : "es";
    try { localStorage.setItem(KEY, lang); } catch (e) { /* sin almacenamiento */ }
    translate(lang);
  }

  function t(key) {
    var v = (DICT[current] || DICT.es)[key];
    return v != null ? String(v) : key;
  }

  function ready() {
    current = detect();
    var sel = document.getElementById("lang-select");
    if (sel) {
      sel.addEventListener("change", function () { setLang(sel.value); });
    }
    translate(current);
  }

  window.ClimaSafeI18n = {
    t: t,
    get: function () { return current; },
    set: setLang
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();

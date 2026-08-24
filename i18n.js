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
      hero_eyebrow: "ML Engineer · Sistemas de Datos · GenAI",
      hero_sub: "ML de extremo a extremo, de los datos al despliegue: <strong>crédito, fraude y AML</strong>, series temporales y sistemas basados en agentes con arneses, RAG y fine-tuning. Calibración, evaluación reproducible y control de fuga de datos como restricciones, no como añadidos. Seis sistemas públicos, números reales.",
      about_title: "Identidad de ingeniería",
      tag_about: "sobre mí",
      tag_projects: "proyectos",
      tag_more: "más",
      tag_stack: "stack",
      tag_reading: "lectura",
      footer_role: "— ML Engineer · Galicia, ES",
      about_lbl_approach: "Enfoque",
      about_lbl_systems: "Formación en sistemas",
      about_lbl_production: "Conciencia de producción",
      about_lbl_passion: "Pasión",
      about_p_approach: "Trato los problemas de ML como <strong>problemas de sistemas primero</strong>. Un modelo que no se puede reproducir o re-desplegar es un pasivo. Mi flujo de trabajo impone una separación limpia entre ingesta, cómputo de features, entrenamiento y evaluación, por estructura más que por convención. En finanzas, esa disciplina es lo que hace que un sistema sea auditable.",
      about_p_systems: "Formado y trabajado como <strong>Técnico de Sistemas (ASIR)</strong>. Lo que más me atrajo del campo fueron las <strong>bases de datos</strong>: diseño de esquemas, escritura de queries, ajuste de índices y análisis de planes de ejecución. Esa formación moldea cómo pienso cada sistema ML: infraestructura, aislamiento de entornos y modos de fallo antes que la arquitectura del modelo.",
      about_p_production: "Diseño pipelines que no se rompen cuando cambian los esquemas, modelos que devuelven <strong>probabilidades calibradas</strong> en vez de puntuaciones crudas, y configuraciones de evaluación que detectan la fuga de datos antes de que llegue a producción. Sé distinguir entre una métrica que se ve bien y una decisión que se sostiene fuera de la muestra.",
      about_p_passion: "Apasionado por los datos <strong>dentro y fuera del trabajo</strong>. Me encanta aprender, asumir retos y mejorar en lo que hago. Mi aspiración profesional es construir sistemas de decisión en los que las instituciones reales confíen, en crédito, fraude e inversión, manteniendo cada proyecto mejor que el anterior.",
      projects_title: "Sistemas seleccionados",
      feat_meta_view: "ver proyecto →",
      tag_harness: "scaffold · arnés",
      tag_earlywarning: "alerta temprana · ML",
      tag_fraud: "detección de fraude",
      tag_banking: "banca · propensión",
      tag_timeseries: "series temporales · finanzas",
      tag_harness2: "arnés de agentes",
      feat_desc_dskit: "Plantilla de proyecto de Data Science de nivel productivo con arnés de IA: entornos reproducibles, backlog verificado y puerta de calidad enforced en código.",
      feat_desc_climasafe: "Sistema de alerta temprana para riesgo de mortalidad por calor y frío en provincias españolas: ensemble XGBoost + LSTM, predicción conformal, MLflow, bot de Telegram.",
      feat_desc_fraud: "Detección de fraude en transacciones financieras (PaySim): evaluación imbalance-first, precision-recall como métrica principal, ajuste de umbrales, MLflow tracked.",
      feat_desc_credit: "Modelo de propensión bancaria minorista (UCI Bank Marketing) con preprocesamiento sin fuga de datos y métricas reales persistidas: ROC-AUC 0.948, PR-AUC 0.651.",
      feat_desc_stock: "Clasificación de series temporales con validación temporal estricta, backtest fuera de muestra con costes y monitorización de drift. Honesto sobre dónde falla el modelo.",
      feat_desc_mesh: "Arnés de agentes: 24 agentes Python, puerta de permisos y backlog verificado. Las reglas del trabajo asistido por IA escritas en código, no en prompts.",
      climasafe_try: "probar ya",
      climasafe_docs: "documentación",
      more_title: "Más proyectos",
      more_desc_cyberforest: "Detección de intrusión de dos niveles (LightGBM + KMeans) en CIC-IDS2017 con SMOTE y MLflow tracking.",
      more_tag_cyberforest: "seguridad",
      more_desc_retainml: "Probabilidad de churn para datos de clientes con una pipeline modular de RF y feature engineering.",
      more_tag_retainml: "churn · ML",
      more_desc_global: "Clustering no supervisado de 167 países por indicadores socioeconómicos.",
      more_tag_global: "clustering",
      more_desc_rps: "Agente predictivo online basado en frecuencia para Piedra-Papel-Tijeras.",
      more_tag_rps: "agentes",
      scope_note: "<strong>En desarrollo:</strong> un sistema de gestión de cartera para decidir cuándo reinvertir y cuándo retirarse, basado en la rigurosidad de evaluación de <a href=\"projects/stock-market-prediction.html\">Stock-Market-Prediction</a>.",
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
      reading_desc_wmd: "Cathy O'Neil. Por qué los modelos opacos y no regulados amplifican la desigualdad — y por qué el riesgo de modelo es una preocupación de primer nivel en finanzas.",
      reading_tag_wmd: "ética · riesgo de modelo",
      reading_desc_pm: "Agrawal, Gans & Goldfarb. La economía de la predicción: qué hace la IA barata y cómo cambia las decisiones de negocio.",
      reading_tag_pm: "economía · IA",
      reading_desc_dmls: "Chip Huyen. La referencia sobre cómo convertir modelos en sistemas fiables: despliegue, monitorización, drift e iteración.",
      reading_tag_dmls: "ingeniería ML",
      reading_desc_dade: "Philip K. Dick. La obra clásica sobre qué significa ser inteligente y por qué las interfaces deberían sentirse como personas.",
      reading_tag_dade: "ficción · IA",
      reading_desc_neandertal: "Ludovic Slimak. Reconstruir comportamiento a partir de evidencia parcial — la misma disciplina que trabajar con datos incompletos.",
      reading_tag_neandertal: "curiosidad",
      // projects/climasafe.html
      eyebrow_climasafe: "ClimaSafe · alerta temprana · ML",
      climasafe_h1_1: "Alerta de riesgo por calor y frío",
      climasafe_h1_2: "antes de que llegue el día.",
      climasafe_sub: "Sistema de alerta temprana personalizado para el riesgo por calor y frío. Estima tu nivel de riesgo cardiovascular (seguro / precaución / peligro) para cualquier punto de España, el día y la hora que elijas, a partir de índices de sensación térmica y un <strong>ensemble conformal</strong> de XGBoost (calor), RandomForest (frío) y una LSTM con embedding de provincia, y luego personaliza el riesgo poblacional con <strong>factores individuales de la literatura</strong> — edad, sexo, grasa corporal, comorbilidades, medicación, aclimatación, actividad. Predicción en tiempo real de Open-Meteo; objetivo construido a partir de mortalidad MoMo atribuible a calor (X30) y frío (X31).",
      cta_try: "Probar ya",
      cta_docs: "Documentación",
      cta_user_guide: "Guía de usuario",
      cta_dev_docs: "Docs técnicas",
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
      // projects/dskit.html
      dskit_eyebrow: "dskit · plantilla · arnés",
      dskit_h1: "Un scaffold ML de nivel productivo<br /><span class=\"hl\">con las reglas en código.</span>",
      dskit_sub: "Una plantilla <a href=\"https://copier.readthedocs.io\" target=\"_blank\">copier</a> que genera proyectos ML completos, desde el entorno y la estructura hasta la API, monitorización, RAG y un arnés de IA. No solo arranca un proyecto: incluye la pipeline de calidad y la gobernanza ya conectadas.",
      dskit_tag_problem: "problema",
      dskit_title_solves: "Qué resuelve",
      dskit_tag_generation: "generación",
      dskit_title_generation: "Un comando, un proyecto completo",
      dskit_tag_modules: "módulos",
      dskit_title_modules: "Módulos opcionales, a elección",
      dskit_tag_quality: "calidad",
      dskit_title_quality: "Pipeline de calidad",
      dskit_tag_harness: "arnés",
      dskit_title_harness: "El arnés de IA",
      dskit_tag_layout: "estructura",
      dskit_title_layout: "Estructura generada",
      // projects/credit-risk-classifier.html
      credit_eyebrow: "credit-risk-classifier · banca · propensión",
      credit_h1: "Prioriza a los clientes adecuados<br /><span class=\"hl\">antes de la llamada.</span>",
      credit_sub: "Un modelo de propensión bancaria minorista sobre el dataset UCI Bank Marketing: predice la probabilidad de que un cliente suscriba un depósito a plazo durante una campaña de marketing, para que el equipo pueda priorizar a quién llamar. Construido con preprocesamiento sin fuga de datos y métricas reproducibles.",
      credit_tag_problem: "problema",
      credit_title_solves: "Qué resuelve",
      credit_tag_decisions: "decisiones",
      credit_title_decisions: "Decisiones de ingeniería",
      credit_tag_results: "resultados",
      credit_title_results: "Números reales",
      // projects/stock-market-prediction.html
      stock_eyebrow: "Stock-Market-Prediction · series temporales · finanzas",
      stock_h1: "Series temporales financieras<br /><span class=\"hl\">evaluadas con honestidad.</span>",
      stock_sub: "Predicción de movimiento direccional de precios en un dominio no estacionario y con bajo ratio señal/ruido, donde el objetivo declarado no es la rentabilidad sino <strong>enfrentar el overfitting y la fuga de datos con rigor</strong>. Validación temporal, backtest fuera de muestra con costes, predicción conformal y monitorización de drift.",
      stock_tag_problem: "problema",
      stock_title_solves: "Qué resuelve",
      stock_tag_decisions: "decisiones",
      stock_title_decisions: "Decisiones de ingeniería",
      stock_tag_results: "resultados",
      stock_title_results: "El resultado honesto",
      // projects/meshharmes.html
      mesh_eyebrow: "MeshHarmes · arnés de agentes",
      mesh_h1: "Las reglas del trabajo con agentes<br /><span class=\"hl\">escritas en código.</span>",
      mesh_sub: "Un arnés de agentes e infraestructura de proyecto para trabajo general en Python, donde las reglas del juego están escritas <strong>en código, no en un prompt</strong>: una puerta de entrada que decide si se puede trabajar, un backlog con criterios de aceptación, memoria fuera de la ventana de contexto y una puerta de permisos para acciones irreversibles.",
      mesh_tag_problem: "problema",
      mesh_title_solves: "Qué resuelve",
      mesh_tag_decisions: "decisiones",
      mesh_title_decisions: "Decisiones de ingeniería",
      // projects/fraud-shield.html
      fraud_eyebrow: "fraud-shield · detección de fraude",
      fraud_h1: "Detección de fraude con las<br /><span class=\"hl\">restricciones reales de fintech.</span>",
      fraud_sub: "Una pipeline de detección de fraude de extremo a extremo para transacciones financieras, construida para las restricciones de un entorno bancario o fintech real: desbalance severo de clases, costo de falsos negativos, interpretabilidad para auditoría y una estructura que se extiende a producción por lotes o streaming.",
      fraud_tag_problem: "problema",
      fraud_title_solves: "Qué resuelve",
      fraud_tag_features: "características",
      fraud_title_decisions: "Decisiones de ingeniería",
      fraud_tag_results: "resultados",
      fraud_title_results: "Números reales",
      sponsors_tag: "patrocinadores",
      sponsors_title: "Proyectos patrocinados por",
      similar_tag: "proyectos similares",
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
      hero_eyebrow: "ML Engineer · Data Systems · GenAI",
      hero_sub: "End-to-end ML from data to deployment: <strong>credit, fraud and AML</strong>, time series, and agent-based systems with harnesses, RAG and fine-tuning. Calibration, reproducible evaluation and leakage control as constraints, not afterthoughts. Six public systems, real numbers.",
      about_title: "Engineering identity",
      tag_about: "about",
      tag_projects: "projects",
      tag_more: "more",
      tag_stack: "stack",
      tag_reading: "reading",
      footer_role: "— ML Engineer · Galicia, ES",
      about_lbl_approach: "Approach",
      about_lbl_systems: "Systems background",
      about_lbl_production: "Production awareness",
      about_lbl_passion: "Passion",
      about_p_approach: "I treat ML problems as <strong>systems problems first</strong>. A model that can't be reproduced or re-deployed is a liability. My workflow enforces clean separation between ingestion, feature computation, training, and evaluation, by structure rather than convention. In finance that discipline is what makes a system auditable.",
      about_p_systems: "Trained and worked as a <strong>Systems Technician (ASIR)</strong>. What drew me most to the field was <strong>databases</strong>: schema design, query writing, index tuning and execution plan analysis. That background shapes how I think about every ML system: infrastructure, environment isolation, and failure modes before model architecture.",
      about_p_production: "I design pipelines that don't break when schemas change, models that return <strong>calibrated probabilities</strong> rather than raw scores, and evaluation setups that catch leakage before it reaches production. I know the difference between a metric that looks good and a decision that holds up out-of-sample.",
      about_p_passion: "I'm passionate about data <strong>inside and outside work</strong>. I love learning, taking on challenges and getting better at what I do. My professional aspiration is to build decision systems that real institutions trust, in credit, fraud and investment, while keeping every project better than the last.",
      projects_title: "Selected systems",
      feat_meta_view: "view project →",
      tag_harness: "scaffold · harness",
      tag_earlywarning: "early warning · ML",
      tag_fraud: "fraud detection",
      tag_banking: "banking · propensity",
      tag_timeseries: "time series · finance",
      tag_harness2: "agent harness",
      feat_desc_dskit: "Production-grade Data Science project scaffold with an AI harness: reproducible environments, verified backlog, and a quality gate enforced in code.",
      feat_desc_climasafe: "Early-warning system for heat and cold mortality risk across Spanish provinces: XGBoost + LSTM ensemble, conformal prediction, MLflow, Telegram bot.",
      feat_desc_fraud: "Fraud detection on financial transactions (PaySim): imbalance-first evaluation, precision-recall as the primary metric, threshold tuning, MLflow tracked.",
      feat_desc_credit: "Retail banking propensity model (UCI Bank Marketing) with leakage-free preprocessing and real persisted metrics: ROC-AUC 0.948, PR-AUC 0.651.",
      feat_desc_stock: "Time-series classification with strict temporal validation, out-of-sample backtest with costs, and drift monitoring. Honest about where the model fails.",
      feat_desc_mesh: "Agent harness: 24 Python agents, a permission gate, and a verified backlog. The rules of AI-assisted work written in code, not in prompts.",
      climasafe_try: "try now",
      climasafe_docs: "docs",
      more_title: "Further work",
      more_desc_cyberforest: "Two-level intrusion detection (LightGBM + KMeans) on CIC-IDS2017 with SMOTE and MLflow tracking.",
      more_tag_cyberforest: "security",
      more_desc_retainml: "Churn probability for customer data with a modular RF pipeline and feature engineering.",
      more_tag_retainml: "churn · ML",
      more_desc_global: "Unsupervised clustering of 167 countries by socioeconomic indicators.",
      more_tag_global: "clustering",
      more_desc_rps: "Online frequency-based predictive agent for Rock-Paper-Scissors.",
      more_tag_rps: "agents",
      scope_note: "<strong>In development:</strong> a portfolio manager system to decide when to reinvest and when to withdraw, built on the evaluation rigour of <a href=\"projects/stock-market-prediction.html\">Stock-Market-Prediction</a>.",
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
      reading_desc_wmd: "Cathy O'Neil. Why opaque, unregulated models amplify inequality — and why model risk is a first-class concern in finance.",
      reading_tag_wmd: "ethics · model risk",
      reading_desc_pm: "Agrawal, Gans & Goldfarb. The economics of prediction: what AI makes cheap and how it changes business decisions.",
      reading_tag_pm: "economics · AI",
      reading_desc_dmls: "Chip Huyen. The reference on turning models into reliable systems: deployment, monitoring, drift and iteration.",
      reading_tag_dmls: "ml engineering",
      reading_desc_dade: "Philip K. Dick. The classic on what it means to be intelligent, and why interfaces should feel like people.",
      reading_tag_dade: "fiction · AI",
      reading_desc_neandertal: "Ludovic Slimak. Reconstructing behaviour from partial evidence — the same discipline as working with incomplete data.",
      reading_tag_neandertal: "curiosity",
      // projects/climasafe.html
      eyebrow_climasafe: "ClimaSafe · early warning · ML",
      climasafe_h1_1: "Heat and cold risk warning",
      climasafe_h1_2: "before the day arrives.",
      climasafe_sub: "A personalized early-warning system for heat and cold stress. It estimates your cardiovascular risk level (safe / caution / danger) for any Spanish location, day and hour, from thermal comfort indices and a <strong>conformal-weighted ensemble</strong> of XGBoost (heat), RandomForest (cold) and an LSTM with province embedding, and then personalises the population risk with <strong>literature-based individual factors</strong> — age, sex, body fat, comorbidities, medication, acclimatisation, activity. Live forecast from Open-Meteo; target built from MoMo mortality attributable to heat (X30) and cold (X31).",
      cta_try: "Try now",
      cta_docs: "Docs",
      cta_user_guide: "User guide",
      cta_dev_docs: "Dev docs",
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
      // projects/dskit.html
      dskit_eyebrow: "dskit · scaffold · harness",
      dskit_h1: "A production-grade ML scaffold<br /><span class=\"hl\">with the rules in code.</span>",
      dskit_sub: "A <a href=\"https://copier.readthedocs.io\" target=\"_blank\">copier</a> template that generates complete ML projects, from environment and layout to API, monitoring, RAG and an AI harness. It doesn't just start a project: it ships with the quality pipeline and the governance already wired in.",
      dskit_tag_problem: "problem",
      dskit_title_solves: "What it solves",
      dskit_tag_generation: "generation",
      dskit_title_generation: "One command, a full project",
      dskit_tag_modules: "modules",
      dskit_title_modules: "Optional modules, opt-in",
      dskit_tag_quality: "quality",
      dskit_title_quality: "Quality pipeline",
      dskit_tag_harness: "harness",
      dskit_title_harness: "The AI harness",
      dskit_tag_layout: "layout",
      dskit_title_layout: "Generated structure",
      // projects/credit-risk-classifier.html
      credit_eyebrow: "credit-risk-classifier · banking · propensity",
      credit_h1: "Prioritise the right customers<br /><span class=\"hl\">before the call.</span>",
      credit_sub: "A retail banking propensity model on the UCI Bank Marketing dataset: predict the probability that a customer subscribes a term deposit during a marketing campaign, so the campaign team can prioritise who to call. Built with leakage-free preprocessing and persisted, reproducible metrics.",
      credit_tag_problem: "problem",
      credit_title_solves: "What it solves",
      credit_tag_decisions: "decisions",
      credit_title_decisions: "Engineering decisions",
      credit_tag_results: "results",
      credit_title_results: "Real numbers",
      // projects/stock-market-prediction.html
      stock_eyebrow: "Stock-Market-Prediction · time series · finance",
      stock_h1: "Financial time series<br /><span class=\"hl\">evaluated honestly.</span>",
      stock_sub: "Directional price movement prediction in a non-stationary, low signal-to-noise domain, where the stated goal is not profitability but <strong>facing overfitting and data leakage rigorously</strong>. Temporal validation, out-of-sample backtest with costs, conformal prediction and drift monitoring.",
      stock_tag_problem: "problem",
      stock_title_solves: "What it solves",
      stock_tag_decisions: "decisions",
      stock_title_decisions: "Engineering decisions",
      stock_tag_results: "results",
      stock_title_results: "The honest outcome",
      // projects/meshharmes.html
      mesh_eyebrow: "MeshHarmes · agent harness",
      mesh_h1: "The rules of agent work<br /><span class=\"hl\">written in code.</span>",
      mesh_sub: "An agent harness and project infrastructure for general Python work, where the game rules are written <strong>in code, not in a prompt</strong>: an entry gate that decides whether work can proceed, a backlog with acceptance criteria, memory outside the context window, and a permission gate for irreversible actions.",
      mesh_tag_problem: "problem",
      mesh_title_solves: "What it solves",
      mesh_tag_decisions: "decisions",
      mesh_title_decisions: "Engineering decisions",
      // projects/fraud-shield.html
      fraud_eyebrow: "fraud-shield · fraud detection",
      fraud_h1: "Fraud detection for the<br /><span class=\"hl\">real fintech constraints.</span>",
      fraud_sub: "An end-to-end fraud detection pipeline for financial transactions, built for the constraints of a real banking or fintech environment: severe class imbalance, the cost of false negatives, interpretability for audit, and a structure that extends to batch or streaming production.",
      fraud_tag_problem: "problem",
      fraud_title_solves: "What it solves",
      fraud_tag_features: "features",
      fraud_title_decisions: "Engineering decisions",
      fraud_tag_results: "results",
      fraud_title_results: "Real numbers",
      sponsors_tag: "sponsors",
      sponsors_title: "Sponsored by",
      similar_tag: "similar projects",
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

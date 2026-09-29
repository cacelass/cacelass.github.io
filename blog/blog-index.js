/* ── Lista de entradas del blog ──
   Para añadir una entrada:
   1. Crea el archivo en posts/<slug>.html (copia post-template.html).
   2. Añade un objeto aquí, el más reciente primero.            */
const POSTS = [
  {
    slug: "2026-09-09-series-temporales-dificiles",
    title: "Las series temporales son difíciles de verdad",
    tag: "series temporales",
    excerpt: "La fuga temporal es un error silencioso: las métricas se ven geniales y el modelo falla en el mundo real. Esto es quebrar el tiempo, no hacer ML."
  },
  {
    slug: "2026-09-09-drift-produccion",
    title: "Drift en producción: cuando el modelo envejece y nadie se da cuenta",
    tag: "mlops",
    excerpt: "El modelo no falla un día de golpe; se degrada en silencio. La mayoría de alertas de drift que he visto eran falsas alarmas — o llegaban demasiado tarde."
  },
  {
    slug: "2026-09-09-aml-positivo-raro",
    title: "AML cuando el positivo es 1 de cada 100.000",
    tag: "aml",
    excerpt: "Cuando el positivo es tan raro, las métricas habituales y las curvas dejan de servir. Hay que repensar qué significa 'encontrar'."
  },
  {
    slug: "2026-09-09-conformal-prediction",
    title: "Conformal prediction: la alternativa honesta a los intervalos que nunca se cumplen",
    tag: "ml",
    excerpt: "'Tenemos un 90% de confianza' es la frase más mentirosa del ML. La predicción conformal cambia el contrato: cobertura real, verificable, sin asumir normalidad."
  },
  {
    slug: "2026-08-27-bolsa-lucrativo",
    title: "ML y la bolsa: no vendo la promesa de hacerte rico",
    tag: "finanzas",
    excerpt: "La ansia humana de tener más se cruza con el ML. Si fuera tan fácil, todos seríamos ricos. Y eso ya te dice dónde está el problema."
  },
  {
    slug: "2026-08-27-homelab",
    title: "Mi homelab: la infraestructura donde aprendo",
    tag: "infra",
    excerpt: "Antes de entrenar un modelo está el servidor, la red y los backups. Mi homelab es donde la parte de sistemas deja de ser teoría."
  },
  {
    slug: "2026-08-27-tickets-memoria",
    title: "Tickets que optimizan la memoria",
    tag: "agentes",
    excerpt: "La ventana de contexto se degrada mucho antes de llenarse. Mis tickets son la memoria que no se olvida entre sesiones."
  },
  {
    slug: "2026-08-27-arneses-ia",
    title: "Por qué los arneses de IA importan",
    tag: "agentes",
    excerpt: "Una IA genera código más rápido de lo que un humano lo revisa. El arnés son las riendas — y están en código, no en un prompt."
  },
  {
    slug: "2026-08-27-bienvenida",
    title: "Bienvenida al blog",
    tag: "meta",
    excerpt: "Por qué abro este espacio y qué tipo de cosas voy a ir soltando por aquí."
  }
];

(function () {
  var list = document.getElementById("post-list");
  if (!list) return;

  var html = POSTS.map(function (p) {
    return (
      '<a class="feat-card" href="posts/' + p.slug + '.html">' +
        '<div class="feat-top">' +
          '<div class="feat-name">' + p.title + '</div>' +
          '<span class="proj-tag">' + p.tag + '</span>' +
        '</div>' +
        '<p class="feat-desc">' + p.excerpt + '</p>' +
        '<div class="feat-meta"><span>leer →</span></div>' +
      '</a>'
    );
  }).join("");

  list.innerHTML = html;
})();

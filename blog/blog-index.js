/* ── Lista de entradas del blog ──
   Para añadir una entrada:
   1. Crea el archivo en posts/<slug>.html (copia post-template.html).
   2. Añade un objeto aquí, el más reciente primero.            */
const POSTS = [
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

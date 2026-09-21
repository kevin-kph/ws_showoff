'use strict';

/* =====================================================================
   Configuration : à personnaliser
   Astuce : un titre court (moins de 12 caractères) rend mieux dans le hero.
   ===================================================================== */
const CONFIG = {
  title: 'KPH Workshop',
  tagline: 'A portfolio to show my work. I designed this website and its content.',
  lang: 'fr-FR',
};

/* =====================================================================
   Utilitaires
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $('#app');
const state = { images: [], posts: [], heroCleanup: null };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canVT = () => !!document.startViewTransition && !reduced;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmtDate = (d) => {
  const x = new Date(d);
  return isNaN(x) ? '' : x.toLocaleDateString(CONFIG.lang, { day: 'numeric', month: 'long', year: 'numeric' });
};

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} : ${res.status}`);
  return res.json();
}

/* =====================================================================
   Mini-parseur Markdown (titres, listes, citations, code, images, liens)
   Suffisant pour un blog. Pour plus de fonctions, remplacez-le par la
   bibliothèque « marked » (https://marked.js.org).
   ===================================================================== */
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s;
}

function markdown(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  const out = [];
  const isBlockStart = (l) => /^(#{1,3}\s|```|>|---+\s*$|\s*[-*]\s+|\s*\d+\.\s+|!\[)/.test(l);
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];
    let m;

    if (!l.trim()) { i++; continue; }

    if (/^```/.test(l)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
      continue;
    }

    if ((m = l.match(/^(#{1,3})\s+(.*)/))) {
      const n = m[1].length + 1; // le # du Markdown devient un h2 (le h1 est le titre de l'article)
      out.push(`<h${n}>${inline(m[2])}</h${n}>`);
      i++; continue;
    }

    if (/^---+\s*$/.test(l)) { out.push('<hr>'); i++; continue; }

    if (/^>/.test(l)) {
      const q = [];
      while (i < lines.length && /^>/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      out.push('<ul>' + items.map((x) => `<li>${inline(x)}</li>`).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+\.\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      out.push('<ol>' + items.map((x) => `<li>${inline(x)}</li>`).join('') + '</ol>');
      continue;
    }

    if ((m = l.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      out.push(`<figure><img src="${m[2]}" alt="${m[1]}" loading="lazy">${m[1] ? `<figcaption>${m[1]}</figcaption>` : ''}</figure>`);
      i++; continue;
    }

    const p = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('\n');
}

/* =====================================================================
   Composants HTML
   ===================================================================== */
function tileHTML(img, idx) {
  const ar = img.width && img.height ? `${img.width} / ${img.height}` : '4 / 3';
  const bg = img.color ? `;--tile-bg:${esc(img.color)}` : '';
  return `
    <figure class="tile">
      <button class="tile-inner" type="button" data-idx="${idx}" aria-label="Agrandir : ${esc(img.title)}" style="--ar:${ar}${bg}">
        <img src="${esc(img.src)}" alt="${esc(img.alt || img.title)}" loading="lazy" decoding="async">
        <span class="tile-cap"><strong>${esc(img.title)}</strong>${img.date ? `<span>${fmtDate(img.date)}</span>` : ''}</span>
      </button>
    </figure>`;
}

const galleryHTML = (items) => `<div class="gallery">${items.map(tileHTML).join('')}</div>`;

function postRowHTML(p) {
  return `
    <a class="post-row" href="#/blog/${esc(p.slug)}">
      <time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
      <div>
        <h3>${esc(p.title)}</h3>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
      </div>
      ${p.cover ? `<img class="post-thumb" src="${esc(p.cover)}" alt="" loading="lazy">` : ''}
    </a>`;
}

const postListHTML = (posts) =>
  posts.length
    ? `<div class="post-list">${posts.map(postRowHTML).join('')}</div>`
    : `<p class="notice">Aucun article pour l'instant. Ajoutez-en un dans <code>data/posts.json</code>.</p>`;

/* =====================================================================
   Effets
   ===================================================================== */

/* Fait apparaître les images une fois chargées (flou vers net) */
function watchImages(root) {
  $$('img', root).forEach((img) => {
    const done = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });
}

/* Légère inclinaison 3D + reflet qui suit la souris */
function bindTilt(root) {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.tile-inner', root).forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      ['--rx', '--ry', '--mx', '--my'].forEach((v) => el.style.removeProperty(v));
    });
  });
}

/* Le titre du hero : chaque lettre s'épaissit à l'approche du curseur */
function initHeroTitle(el) {
  el.setAttribute('aria-label', CONFIG.title);
  el.innerHTML = [...CONFIG.title]
    .map((c, i) => (c === ' ' ? ' ' : `<span class="hl" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`))
    .join('');

  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const letters = $$('.hl', el);
  let px = 0, py = 0, raf = 0;
  const paint = () => {
    raf = 0;
    for (const s of letters) {
      const r = s.getBoundingClientRect();
      const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      const k = Math.exp(-(d * d) / (2 * 150 * 150));
      s.style.fontVariationSettings = `"wght" ${Math.round(300 + 500 * k)}`;
    }
  };
  const move = (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
  window.addEventListener('pointermove', move, { passive: true });
  state.heroCleanup = () => window.removeEventListener('pointermove', move);
}

/* =====================================================================
   Visionneuse (lightbox) avec transition partagée entre miniature et grande image
   ===================================================================== */
const lb = {
  el: $('#lightbox'), img: $('#lb-img'), cap: $('#lb-cap'), fig: $('.lb-fig'),
  prev: $('.lb-prev'), next: $('.lb-next'), close: $('.lb-close'),
  items: [], i: 0, lastFocus: null,
};

function lbShow() {
  const it = lb.items[lb.i];
  lb.img.src = it.src;
  lb.img.alt = it.alt || it.title || '';
  lb.cap.innerHTML = it.title
    ? `<strong>${esc(it.title)}</strong>${it.description ? `<span>${esc(it.description)}</span>` : ''}`
    : '';
  const solo = lb.items.length < 2;
  lb.prev.hidden = solo;
  lb.next.hidden = solo;
}

function lbGo(d) {
  lb.i = (lb.i + d + lb.items.length) % lb.items.length;
  lb.img.classList.remove('swap');
  void lb.img.offsetWidth;
  lb.img.classList.add('swap');
  lbShow();
}

function openLightbox(items, index, origin) {
  lb.items = items;
  lb.i = index;
  lb.lastFocus = document.activeElement;
  const useVT = canVT() && origin;

  const apply = () => {
    if (origin) origin.style.viewTransitionName = '';
    lb.el.hidden = false;
    document.body.classList.add('lb-open');
    lbShow();
    if (useVT) lb.img.style.viewTransitionName = 'lb-hero';
    lb.close.focus({ preventScroll: true });
  };

  if (useVT) {
    origin.style.viewTransitionName = 'lb-hero';
    document.startViewTransition(apply);
  } else {
    apply();
  }
}

function closeLightbox(instant = false) {
  if (lb.el.hidden) return;
  const src = lb.items[lb.i].src;
  const target = instant ? null
    : $$('.tile-inner img, .article-cover img, .prose img').find((im) => im.getAttribute('src') === src);
  const useVT = canVT() && target;

  const apply = () => {
    lb.img.style.viewTransitionName = '';
    lb.el.hidden = true;
    document.body.classList.remove('lb-open');
    if (useVT) target.style.viewTransitionName = 'lb-hero';
    if (lb.lastFocus && lb.lastFocus.focus) lb.lastFocus.focus({ preventScroll: true });
  };

  if (useVT) {
    const t = document.startViewTransition(apply);
    t.finished.finally(() => { target.style.viewTransitionName = ''; });
  } else {
    apply();
  }
}

lb.close.addEventListener('click', () => closeLightbox());
lb.prev.addEventListener('click', () => lbGo(-1));
lb.next.addEventListener('click', () => lbGo(1));
lb.el.addEventListener('click', (e) => {
  if (!e.target.closest('img, .lb-btn, figcaption')) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (lb.el.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft' && lb.items.length > 1) lbGo(-1);
  else if (e.key === 'ArrowRight' && lb.items.length > 1) lbGo(1);
  else if (e.key === 'Tab') {
    const focusables = $$('.lb-btn', lb.el).filter((b) => !b.hidden);
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* Balayage tactile pour changer d'image */
let swipeX = null;
lb.fig.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
lb.fig.addEventListener('pointerup', (e) => {
  if (swipeX === null || lb.items.length < 2) return;
  const dx = e.clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) > 60) lbGo(dx < 0 ? 1 : -1);
});

/* Branche une galerie : clic → visionneuse, inclinaison, apparition */
function bindGallery(container, items) {
  watchImages(container);
  bindTilt(container);
  $$('.tile-inner', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(items, Number(btn.dataset.idx), $('img', btn));
    });
  });
}

/* =====================================================================
   Pages
   ===================================================================== */
function pageHome() {
  const imgs = state.images.slice(0, 6);
  app.innerHTML = `
    <section class="wrap hero">
      <h1 class="hero-title" id="hero-title"></h1>
      <p class="tagline">${esc(CONFIG.tagline)}</p>
      <div class="actions">
        <a class="btn" href="#/galerie">See pictures</a>
        <a class="btn ghost" href="#/blog">Read blog</a>
      </div>
    </section>

    <section class="wrap section">
      <div class="section-head">
        <h2>Dernières images</h2>
        <a href="#/galerie">All the pictures</a>
      </div>
      ${galleryHTML(imgs)}
    </section>

    <section class="wrap section">
      <div class="section-head">
        <h2>Last articles</h2>
        <a href="#/blog">All the articles</a>
      </div>
      ${postListHTML(state.posts.slice(0, 3))}
    </section>`;

  initHeroTitle($('#hero-title'));
  bindGallery($('.gallery'), imgs);
  document.title = CONFIG.title;
}

function pageGallery() {
  app.innerHTML = `
    <section class="wrap page-head">
      <h1>Pictures</h1>
      <p>${state.images.length} images. Click on a picture to zoom-in, navigate with arrows.</p>
    </section>
    <section class="wrap">${galleryHTML(state.images)}</section>`;
  bindGallery($('.gallery'), state.images);
  document.title = `Pictures | ${CONFIG.title}`;
}

function pageBlog() {
  app.innerHTML = `
    <section class="wrap page-head">
      <h1>Blog</h1>
      <p>Notes, experiment and more.</p>
    </section>
    <section class="wrap">${postListHTML(state.posts)}</section>`;
  watchImages(app);
  document.title = `Blog | ${CONFIG.title}`;
}

async function pageArticle(slug) {
  const idx = state.posts.findIndex((p) => p.slug === slug);
  if (idx === -1 || !/^[\w-]+$/.test(slug)) return pageNotFound();
  const post = state.posts[idx];

  let src;
  try {
    const res = await fetch(`posts/${slug}.md`);
    if (!res.ok) throw new Error(res.status);
    src = await res.text();
  } catch {
    return pageNotFound();
  }

  const minutes = Math.max(1, Math.round(src.split(/\s+/).length / 220));
  const newer = state.posts[idx - 1];
  const older = state.posts[idx + 1];

  app.innerHTML = `
    <article>
      <header class="article-head">
        <div class="meta"><time datetime="${esc(post.date)}">${fmtDate(post.date)}</time>, ${minutes} min of reading</div>
        <h1>${esc(post.title)}</h1>
        ${post.summary ? `<p class="lead">${esc(post.summary)}</p>` : ''}
      </header>
      ${post.cover ? `<figure class="article-cover"><img src="${esc(post.cover)}" alt=""></figure>` : ''}
      <div class="prose">${markdown(src)}</div>
    </article>
    <nav class="article-nav" aria-label="Autres articles">
      ${older ? `<a class="prev" href="#/blog/${esc(older.slug)}"><small>Previous article</small><strong>${esc(older.title)}</strong></a>` : ''}
      ${newer ? `<a class="next" href="#/blog/${esc(newer.slug)}"><small>Next article</small><strong>${esc(newer.title)}</strong></a>` : ''}
    </nav>`;

  // Les images de l'article s'ouvrent dans la visionneuse
  const imgs = $$('.article-cover img, .prose img');
  const items = imgs.map((im) => ({ src: im.getAttribute('src'), title: im.alt, alt: im.alt }));
  imgs.forEach((im, i) => {
    im.tabIndex = 0;
    im.setAttribute('role', 'button');
    im.addEventListener('click', () => openLightbox(items, i, im));
    im.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(items, i, im); });
  });

  document.title = `${post.title} | ${CONFIG.title}`;
}

function pageNotFound() {
  app.innerHTML = `
    <section class="wrap page-head">
      <h1>Page introuvable</h1>
      <p>Cette adresse ne mène à rien. Retournez à <a href="#/">l'accueil</a> ou parcourez le <a href="#/blog">blog</a>.</p>
    </section>`;
  document.title = `Page introuvable | ${CONFIG.title}`;
}

/* =====================================================================
   Routage (hash : #/, #/galerie, #/blog, #/blog/mon-article)
   Le routage par « # » fonctionne sur GitHub Pages sans configuration.
   ===================================================================== */
function updateNav(page) {
  $$('.nav a').forEach((a) => {
    if (a.dataset.page === page) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

async function render() {
  const [page = '', slug] = location.hash.replace(/^#\/?/, '').split('/');

  if (state.heroCleanup) { state.heroCleanup(); state.heroCleanup = null; }
  closeLightbox(true);
  document.body.classList.toggle('is-reading', page === 'blog' && !!slug);

  if (page === '') pageHome();
  else if (page === 'galerie') pageGallery();
  else if (page === 'blog' && slug) await pageArticle(slug);
  else if (page === 'blog') pageBlog();
  else pageNotFound();

  updateNav(page);
  window.scrollTo(0, 0);
  updateProgress();
  app.focus({ preventScroll: true });
}

function route(first = false) {
  if (!first && canVT()) document.startViewTransition(render);
  else render();
}

/* Barre de progression de lecture */
const progress = $('#progress');
function updateProgress() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.setProperty('--p', max > 0 ? Math.min(1, h.scrollTop / max) : 0);
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* Thème clair / sombre */
$('#theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
});

/* =====================================================================
   Démarrage
   ===================================================================== */
async function init() {
  $('#brand').textContent = CONFIG.title;
  $('#footer-text').textContent = `© ${new Date().getFullYear()} ${CONFIG.title}`;

  try {
    const [images, posts] = await Promise.all([loadJSON('data/images.json'), loadJSON('data/posts.json')]);
    const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));
    state.images = images.sort(byDateDesc);
    state.posts = posts.sort(byDateDesc);
  } catch (err) {
    app.innerHTML = `
      <section class="wrap page-head">
        <h1>Données introuvables</h1>
        <p>Le site n'a pas pu charger ses fichiers (${esc(err.message)}). En local, ne double-cliquez pas sur <code>index.html</code> : lancez un serveur avec <code>python3 -m http.server</code>, puis ouvrez <code>http://localhost:8000</code>.</p>
      </section>`;
    return;
  }

  window.addEventListener('hashchange', () => route());
  route(true);
}

init();

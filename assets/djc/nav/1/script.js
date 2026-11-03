/* Nav de DJC
 *
 * Inyecta la barra de navegacion y los drawers en la pagina.
 * Sin este script la pagina se ve normal: lo unico que falta es el nav.
 *
 *   <script src="https://story.djc.pe/assets/djc/nav/1/script.js" defer></script>
 *
 * o, con una copia local de assets/djc/:
 *
 *   <script src="/assets/djc/nav/1/script.js" defer></script>
 *
 * El contenido (urls, iconos, textos, links) vive en data.json, al lado de
 * este archivo. Aqui solo esta el comportamiento. Para cambiar un link no se
 * toca este js. Los iconos de data.json, si son relativos, lo son a esta
 * carpeta: la carpeta de la version se puede copiar entera sin tocar rutas.
 *
 * Version: cada cambio en esta carpeta sube VERSION (abajo) y se anota en
 * changelog/story/nav.md (repo de origen). VERSION va como ?v= en todo lo que pide este script, asi
 * un script nuevo nunca se mezcla con un data.json o un nav.css viejos de la
 * cache. Un cambio incompatible no va aqui: va en una carpeta nueva (2/).
 *
 * Las clases que genera arrancan todas con djc-, igual que las de nav.css.
 *
 * Es idempotente: si la pagina ya trae el nav a mano (data-nav o
 * #drawerOverlay), no inyecta nada ni pide el json.
 */
(function () {
  // si el script aparece dos veces en la pagina, la segunda no hace nada
  if (window.__djcNav) return;
  window.__djcNav = true;

  var VERSION = '1.0.0';

  // data.json y nav.css se resuelven relativos a este archivo, asi el
  // componente se puede mover a otra carpeta sin cambiar nada.
  var SELF = document.currentScript && document.currentScript.src;
  var BASE = (SELF || '/assets/djc/nav/1/script.js').replace(/[?#].*$/, '').replace(/\/[^\/]*$/, '/');
  var DATA_URL = asset('data.json');
  var STYLE_URL = asset('nav.css');

  // Un archivo de este componente: relativo a esta carpeta y con ?v=VERSION.
  // Las urls absolutas (https://..., //..., /...) se dejan tal cual.
  function asset(url) {
    if (!url || /^([a-z][a-z0-9+.-]*:|\/)/i.test(url)) return url;
    return BASE + url + '?v=' + VERSION;
  }

  // STYLE_URL puede quedar relativo (si no hay currentScript, o si el script se
  // inyecto inline). Lo resolvemos a absoluta para poder compararlo contra
  // link.href, que el navegador siempre devuelve absoluta.
  function absolutize(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // {{root}} -> https://www.djc.pe/
  function token(str, data) {
    return String(str == null ? '' : str).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      return key in data ? data[key] : '';
    });
  }

  function img(src, alt, cls) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" class="' + esc(cls) + '">';
  }

  function buildNavbar(d) {
    var icons = {};
    var raw = d.icons || {};
    for (var key in raw) icons[key] = asset(raw[key]);
    var labels = d.labels || {};
    var logo = token(d.root, d);

    return [
      '<nav class="djc-nav">',
      '  <div class="djc-nav__a">',
      '    <a href="#" class="djc-nav__link">',
      '      ' + img(icons.menu, labels.menu, 'djc-nav__icon djc-nav__icon--desktop'),
      '      ' + img(icons.menu, labels.menu, 'djc-nav__icon djc-nav__icon--mobile'),
      '    </a>',
      '',
      '    <a href="' + esc(logo) + '" class="djc-nav__link">',
      '      ' + img(icons.logo, labels.logo, 'djc-nav__logo djc-nav__icon--desktop'),
      '      ' + img(icons.logoMobile, labels.logo, 'djc-nav__icon djc-nav__icon--mobile'),
      '    </a>',
      '  </div>',
      '  <div class="djc-nav__b">',
      '    <div class="djc-nav__b--search">',
      '      <input type="text" placeholder="" aria-label="' + esc(labels.search) + '">',
      '      <button>',
      '        ' + img(icons.search, labels.searchIcon, 'djc-nav__icon2'),
      '      </button>',
      '    </div>',
      '  </div>',
      '  <div class="djc-nav__c">',
      '    <a href="#" class="djc-nav__link">',
      '      ' + img(icons.user, labels.user, 'djc-nav__icon djc-nav__icon--desktop'),
      '      ' + img(icons.user, labels.user, 'djc-nav__icon djc-nav__icon--mobile'),
      '    </a>',
      '  </div>',
      '</nav>'
    ].join('\n');
  }

  function buildDrawer(cfg, d) {
    cfg = cfg || {};
    var labels = d.labels || {};

    var links = (cfg.links || []).map(function (item) {
      // { "hr": true } dibuja un separador, para agrupar los links
      if (item && item.hr) return '      <hr>';
      return '      <a href="' + esc(token(item.url, d)) + '">' + esc(item.text) + '</a>';
    });

    var out = [
      '  <aside class="djc-drawer" data-side="' + esc(cfg.side) + '" id="' + esc(cfg.id) + '">',
      '    <div class="djc-drawer-header">',
      '      <span>' + esc(cfg.title) + '</span>',
      '      <button class="djc-drawer-close" aria-label="' + esc(labels.close) + '">&#10005;</button>',
      '    </div>',
      '    <nav class="djc-drawer-menu">'
    ];

    out = out.concat(links);
    out.push('    </nav>');
    out.push('  </aside>');

    return out.join('\n');
  }

  function buildMarkup(d) {
    var drawers = d.drawers || {};
    return [
      buildNavbar(d),
      '<div class="djc-drawer-overlay" id="drawerOverlay">',
      buildDrawer(drawers.main, d),
      '',
      buildDrawer(drawers.user, d),
      '</div>'
    ].join('\n');
  }

  // El <link> del css es async: si montamos el markup antes de que aplique, el
  // nav se pinta sin estilo un instante, que es justo el flash que queremos
  // evitar. Y medir su alto antes de que aplique daria un numero falso. Asi que
  // montamos cuando ya tenemos las dos cosas: css aplicado y datos cargados.
  // El css se pide igual desde el arranque, para que vaya en paralelo al json.
  var cssReady = false;
  var dataReady = false;
  var mount = null;

  function join() {
    if (!cssReady || !dataReady || !mount) return;
    var fn = mount;
    mount = null;
    fn();
  }

  function injectStyle() {
    // comparar con link.href (que el navegador ya resuelve a absoluta) y no con
    // el atributo: si la pagina trae <link href="/assets/djc/nav/1/nav.css"> en el head,
    // el atributo queda relativo y no matchea contra STYLE_URL, y terminaba
    // pidiendo el css dos veces.
    // sin el ?v=: si la pagina ya trae nav.css (con otro ?v= o sin el), vale
    var plain = function (url) { return url.replace(/[?#].*$/, ''); };
    var want = plain(absolutize(STYLE_URL));
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      if (plain(links[i].href) === want) { cssReady = true; return; }
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = STYLE_URL;
    // onerror tambien: si el css no se puede cargar, mejor nav sin estilo que
    // pagina en blanco para siempre.
    link.onload = link.onerror = function () {
      cssReady = true;
      join();
    };
    document.head.appendChild(link);
  }

  // ===== gate de pintado =====
  // El nav no se puede pintar hasta que llegan los datos, y hasta entonces la
  // pagina se veria sin nav y luego el nav apareceria encima. Como el componente
  // tiene que funcionar solo con <script src=".../script.js" defer></script>,
  // el gate va aqui adentro: se mete una clase en <html> mas una regla que
  // esconde el body, y se quita en cuanto el nav esta en el DOM.
  // El timeout es la red de seguridad: si el json no llega, la pagina aparece
  // igual (pero sin nav) en vez de quedarse en blanco.
  var GATE_CLASS = 'djc-nav-pending';
  var GATE_TIMEOUT = 3000;
  var gated = false;
  var gateTimer = null;

  function gatePage() {
    if (gated) return;
    var el = document.documentElement;
    if (!el) return;
    gated = true;

    // si la pagina ya trae el gate puesta a mano, no la duplicamos
    if (el.classList.contains(GATE_CLASS)) return;
    var s = document.createElement('style');
    s.setAttribute('data-djc-nav', '');
    s.textContent = '.' + GATE_CLASS + ' body{visibility:hidden}';
    el.appendChild(s);
    el.classList.add(GATE_CLASS);

    gateTimer = setTimeout(revealPage, GATE_TIMEOUT);
  }

  // Destapa la pagina (quita djc-nav-pending, la ponga gatePage o la pagina a
  // mano). Se llama apenas el nav esta en el DOM, en el mismo task, asi la
  // primera pintura ya sale con nav.
  function revealPage() {
    if (gateTimer) { clearTimeout(gateTimer); gateTimer = null; }
    var el = document.documentElement;
    if (el) el.classList.remove(GATE_CLASS);
  }

  // El nav es position:fixed, asi que alguien tiene que reservar su alto o el
  // contenido se queda debajo. Como la pagina no tiene que saber nada, lo
  // medimos y lo aplicamos nosotros, sin numero mágico: si el nav cambia de
  // alto, el padding se ajusta solo. Solo sube, nunca baja lo que la pagina ya
  // tenga puesto.
  function reserveHeight(nav) {
    if (!nav) return;
    function apply() {
      var h = nav.getBoundingClientRect().height;
      if (!h || !document.body) return;
      var current = parseFloat(window.getComputedStyle(document.body).paddingTop) || 0;
      if (h > current) document.body.style.paddingTop = h + 'px';
    }
    apply();
    window.addEventListener('resize', apply);
  }

  function injectMarkup(d) {
    if (document.getElementById('drawerOverlay')) return null;

    var header = document.createElement('header');
    header.setAttribute('data-nav', '');
    header.innerHTML = buildMarkup(d);
    document.body.insertBefore(header, document.body.firstChild);
    return header;
  }

  function wireDrawer(header) {
    var overlay = header.querySelector('.djc-drawer-overlay');
    if (!overlay) return;

    var drawers = overlay.querySelectorAll('.djc-drawer');

    function side(drawer) {
      return drawer.dataset.side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
    }

    function openDrawer(id) {
      overlay.classList.add('djc-drawer-overlay--active');
      Array.prototype.forEach.call(drawers, function (drawer) {
        drawer.style.transform = drawer.id === id ? 'translateX(0)' : side(drawer);
      });
    }

    function closeDrawers() {
      overlay.classList.remove('djc-drawer-overlay--active');
      Array.prototype.forEach.call(drawers, function (drawer) {
        drawer.style.transform = side(drawer);
      });
    }

    var menuBtn = header.querySelector('.djc-nav__a a');
    if (menuBtn) {
      menuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer('mainMenu');
      });
    }

    var userBtn = header.querySelector('.djc-nav__c a:last-child');
    if (userBtn) {
      userBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer('userMenu');
      });
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDrawers();
    });

    Array.prototype.forEach.call(header.querySelectorAll('.djc-drawer-close'), function (btn) {
      btn.addEventListener('click', closeDrawers);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawers();
    });

    window.openDrawer = openDrawer;
    window.closeDrawers = closeDrawers;
  }

  function wireSearch(header, d) {
    var box = header.querySelector('.djc-nav__b--search');
    if (!box) return;

    var input = box.querySelector('input');
    var button = box.querySelector('button');
    if (!input || !button) return;

    var template = (d.search && d.search.urlTemplate) || 'https://search.djc.pe/?q={query}';

    function go() {
      var query = input.value.trim();
      if (!query) return;

      // {hash} es opcional: sin el, no hace falta calcularlo
      if (template.indexOf('{hash}') === -1) {
        window.location.href = template.replace('{query}', encodeURIComponent(query));
        return;
      }

      // crypto.subtle solo existe en contexto seguro (https o localhost)
      if (!window.crypto || !crypto.subtle) return;

      crypto.subtle.digest('SHA-256', new TextEncoder().encode(query))
        .then(function (buf) {
          var hash = Array.from(new Uint8Array(buf))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
          window.location.href = template
            .replace('{hash}', hash.match(/.{2}/g).join('/'))
            .replace('{query}', encodeURIComponent(query));
        })
        .catch(function () { /* sin hash no hay busqueda */ });
    }

    button.addEventListener('click', go);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') go();
    });
  }

  function render(d) {
    var header = injectMarkup(d);
    // el alto se reserva antes de destapar, para que la primera pintura con la
    // pagina visible ya salga con el nav y sin contenido debajo
    if (header) reserveHeight(header.querySelector('.djc-nav'));
    // revelamos igual aunque injectMarkup devuelva null: si el nav ya venia
    // escrito a mano, la pagina tampoco tiene por que quedarse escondida.
    revealPage();
    // si el componente ya se renderizo, no cableamos dos veces
    if (!header || header.getAttribute('data-nav-ready')) return;
    header.setAttribute('data-nav-ready', '');
    wireDrawer(header);
    wireSearch(header, d);
  }

  var started = false;

  function init() {
    // una sola vez, aunque el script corra al parsear y otra vez en DOMContentLoaded
    if (started) return;
    started = true;

    gatePage();
    // pedimos el css ya, para que vaya en paralelo al json
    injectStyle();

    // la pagina ya trae el nav escrito a mano: no hay datos que esperar, pero
    // igual esperamos al css antes de destapar
    if (document.getElementById('drawerOverlay')) {
      mount = function () { revealPage(); };
      dataReady = true;
      join();
      return;
    }

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error(DATA_URL + ' respondio ' + res.status);
        return res.json();
      })
      .then(function (d) {
        mount = function () { render(d); };
        dataReady = true;
        join();
      })
      .catch(function (err) {
        // sin datos no hay nav, pero la pagina se sigue viendo normal
        revealPage();
        if (window.console && console.warn) console.warn('[djc-nav]', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
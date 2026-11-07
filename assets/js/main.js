/* Hurdiss Lab — small, dependency-free site script */
(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile nav ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- reveal on scroll ---- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- hero canvas: drifting "particles" like a cryo-EM micrograph ---- */
  var canvas = document.getElementById('hero-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], W = 0, H = 0;
    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, (W * H) / 14000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.6 + .4 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 12000) {
            ctx.strokeStyle = 'rgba(94,225,230,' + (0.12 * (1 - d / 12000)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(200,235,240,.55)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener('resize', resize);
  }

  /* ---- generic chip filter helper ---- */
  function chips(bar, onPick) {
    if (!bar) return;
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      bar.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      b.classList.add('is-active');
      onPick(b);
    });
  }

  /* ---- structures: filter ---- */
  var sGrid = document.querySelector('.struct-grid');
  if (sGrid) {
    chips(document.querySelector('.page-structures .filter-bar'), function (b) {
      var f = b.dataset.filter;
      sGrid.querySelectorAll('.struct-card').forEach(function (c) {
        c.hidden = !(f === 'all' || c.dataset.family === f);
      });
    });
  }

  /* ---- structures: 3D viewer (PDBe Mol*, loaded only when first needed) ---- */
  var dlg = document.getElementById('viewer');
  if (dlg) {
    var MOLSTAR = 'https://cdn.jsdelivr.net/npm/pdbe-molstar@3.3.0/build/';
    var loading = null, viewer = null;
    function loadMolstar() {
      if (loading) return loading;
      loading = new Promise(function (resolve, reject) {
        var css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = MOLSTAR + 'pdbe-molstar.css';
        document.head.appendChild(css);
        var s = document.createElement('script');
        s.src = MOLSTAR + 'pdbe-molstar-plugin.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
      return loading;
    }
    function open(id, title) {
      document.getElementById('viewer-id').textContent = 'PDB ' + id.toUpperCase();
      document.getElementById('viewer-title').textContent = title;
      document.getElementById('viewer-rcsb').href = 'https://www.rcsb.org/structure/' + id.toUpperCase();
      dlg.showModal();
      loadMolstar().then(function () {
        var opts = {
          moleculeId: id, bgColor: { r: 7, g: 9, b: 13 }, hideControls: true, sequencePanel: false,
          landscape: true, visualStyle: 'cartoon',
          hideCanvasControls: ['selection', 'animation', 'controlToggle', 'controlInfo']
        };
        if (!viewer) {
          viewer = new window.PDBeMolstarPlugin();
          viewer.render(document.getElementById('molstar'), opts);
        } else {
          viewer.visual.update(opts, true);
        }
      }).catch(function () {
        document.getElementById('molstar').innerHTML = '<p style="padding:24px">The 3D viewer could not be loaded. <a href="https://www.rcsb.org/3d-view/' + id.toUpperCase() + '" target="_blank" rel="noopener">Open it at RCSB instead</a>.</p>';
      });
    }
    sGrid.addEventListener('click', function (e) {
      var b = e.target.closest('.struct-img');
      if (!b) return;
      var card = b.closest('.struct-card');
      open(b.dataset.pdb, card.querySelector('h3').textContent);
    });
    dlg.querySelector('.viewer-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    // home-page links like structures.html#9r34 scroll to and highlight the card
    if (location.hash) {
      var t = document.querySelector('.struct-img[data-pdb="' + location.hash.slice(1) + '"]');
      if (t) { var c = t.closest('.struct-card'); c.id = location.hash.slice(1); c.scrollIntoView(); c.classList.add('in'); }
    }
  }

  /* ---- publications: search + year filter ---- */
  var search = document.getElementById('pub-search');
  if (search) {
    var year = 'all';
    var groups = document.querySelectorAll('.pub-year');
    var count = document.getElementById('pub-count');
    function apply() {
      var q = search.value.trim().toLowerCase(), shown = 0;
      groups.forEach(function (g) {
        var any = false;
        var yearOk = year === 'all' || g.dataset.year === year;
        g.querySelectorAll('.pub').forEach(function (p) {
          var ok = yearOk && (!q || p.textContent.toLowerCase().indexOf(q) !== -1);
          p.hidden = !ok; if (ok) { any = true; shown++; }
        });
        g.hidden = !any;
      });
      count.textContent = shown + (shown === 1 ? ' publication' : ' publications');
    }
    search.addEventListener('input', apply);
    chips(document.querySelector('.pub-tools .filter-bar'), function (b) { year = b.dataset.year; apply(); });
    apply();
  }
})();

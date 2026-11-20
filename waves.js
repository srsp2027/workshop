/* ==========================================================
   Generative wave band, in the spirit of the poster:
   angular (Lipschitz) horizontal lines that funnel into thick
   flat lines and fan out again, with a few red "glitch tubes".

   You don't need to edit this file. To change the drawing, edit
   the data-* attributes on the <svg class="waves"> in index.html:
     data-seed    any integer — a different seed gives a different drawing
     data-lines   number of lines
     data-height  height in pixels
     data-tubes   number of red glitches (default 3). They are placed at
                  random on every page load; add data-glitch-seed="5"
                  to freeze them in one arrangement.
   ========================================================== */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#16120F", RED = "#E44235";

  function rng(seed) {               // small seeded random generator
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // A jagged profile: plateaus interrupted by sharp spikes.
  function profile(R, K) {
    const p = []; let level = 0;
    for (let k = 0; k < K; k++) {
      if (R() < 0.18) level = (R() * 2 - 1) * 0.5;
      p.push(R() < 0.28 ? level + (R() < 0.5 ? -1 : 1) * (0.6 + R() * 0.6) : level);
    }
    return p;
  }

  function el(name, attrs, parent) {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e); return e;
  }

  const path = pts => pts.map(([x, y]) => `${x},${y.toFixed(1)}`).join(" ");

  function draw(svg) {
    const W = Math.max(320, Math.round(svg.getBoundingClientRect().width));
    const H = +svg.dataset.height || 240;
    const n = +svg.dataset.lines || 28;
    const R = rng(+svg.dataset.seed || 7);
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);

    const step = W < 600 ? 16 : 22;              // horizontal knot spacing (px)
    const K = Math.ceil(W / step) + 1;
    const p1 = profile(R, K), p2 = profile(R, K);
    const margin = 34, gap = (H - 2 * margin) / (n - 1);
    const amp = gap * 4.6;

    // Funnel: waves -> thick flat lines -> waves
    const fIn = Math.round(K * (W < 600 ? 0.5 : 0.56));
    const fOut = Math.round(K * (W < 600 ? 0.82 : 0.8));
    const groups = 4;
    const THICK = 3.5, THIN = 1.1;               // stroke widths of thick and thin lines

    const lines = [], targets = [];
    for (let i = 0; i < n; i++) {
      const m = 0.5 + 0.5 * Math.sin(i / n * Math.PI * 1.3 + 0.4);   // mix of two profiles
      const g = Math.floor(i * groups / n);
      const lo = Math.ceil(g * n / groups), hi = Math.ceil((g + 1) * n / groups) - 1;
      const target = margin + gap * (lo + hi) / 2 + gap * 0.5 * (g - (groups - 1) / 2);
      targets[g] = target;
      // where this line meets the thick line: the bundle spans exactly its thickness
      const half = (THICK - THIN) / 2;
      const end = target + (hi > lo ? -half + 2 * half * (i - lo) / (hi - lo) : 0);
      const pts = [];
      for (let k = 0; k < K; k++) {
        const x = k * step;
        let y = margin + i * gap + amp * ((1 - m) * p1[k] + m * p2[k]);
        if (k >= fIn && k <= fOut) y = end;
        else if (k > fIn - 3 && k < fIn) y += (end - y) * (k - fIn + 3) / 3;    // funnel in
        else if (k > fOut && k < fOut + 3) y += (end - y) * (fOut + 3 - k) / 3;  // fan out
        pts.push([x, y]);
      }
      lines.push(pts);
    }

    // Fit the drawing: grow the band so no line is ever cropped at the top or bottom
    let minY = Infinity, maxY = -Infinity;
    lines.forEach(pts => pts.forEach(([, y]) => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }));
    const pad = 8, top = Math.min(0, minY - pad), bottom = Math.max(H, maxY + pad);
    svg.setAttribute("viewBox", `0 ${top} ${W} ${bottom - top}`);
    svg.setAttribute("height", bottom - top);

    // ---- Red glitches: tubular neighbourhoods of the lines ----
    // Each glitch is a thick red band drawn on exactly the same points as one
    // line (sharp corners, square ends), underneath the ink. Positions are
    // random on every page load, but stay put when the window is resized.
    const RG = rng(+svg.dataset.glitchSeed ||
                   svg._gs || (svg._gs = 1 + Math.floor(Math.random() * 1e9)));
    const tubes = el("g", { fill: "none", stroke: RED, "stroke-linejoin": "miter",
                            "stroke-miterlimit": 10, "stroke-linecap": "butt" }, svg);
    const nTubes = svg.dataset.tubes !== undefined ? +svg.dataset.tubes : 3;
    const leftEnd = fIn - 4, rightStart = fOut + 4;           // wavy stretches only
    for (let t = 0; t < nTubes; t++) {
      // a glitch along a wavy stretch of one thin line
      const i = 1 + Math.floor(RG() * (n - 2));
      const len = 4 + Math.floor(RG() * 6);
      const right = K - 1 - rightStart > len + 1 && RG() < 0.3;
      const lo = right ? rightStart : 0, hi = right ? K - 1 : leftEnd;
      const a = lo + Math.floor(RG() * Math.max(1, hi - lo - len));
      const b = Math.min(hi, a + len);
      el("polyline", { points: path(lines[i].slice(a, b + 1)), "stroke-width": 7 }, tubes);
    }

    // Ink lines
    const ink = el("g", { fill: "none", stroke: INK, "stroke-width": THIN, "stroke-linejoin": "miter" }, svg);
    lines.forEach(pts => el("polyline", { points: path(pts) }, ink));
    const thick = el("g", { stroke: INK, "stroke-width": THICK }, svg);
    targets.forEach(y => el("line", { x1: fIn * step, y1: y, x2: fOut * step, y2: y }, thick));
  }

  // ---- Optional jagged section dividers ----
  // Turned on by <body class="jagged">: the straight lines above each section
  // title (and above the footer) become thin Lipschitz lines like the header.
  function drawDividers() {
    if (!document.body.classList.contains("jagged")) return;
    document.querySelectorAll(".label, footer").forEach(function (host, idx) {
      let svg = host.querySelector(":scope > svg.divider");
      if (!svg) {
        svg = document.createElementNS(NS, "svg");
        svg.setAttribute("class", "divider"); svg.setAttribute("aria-hidden", "true");
        host.prepend(svg);
      }
      const W = Math.max(200, Math.round(host.getBoundingClientRect().width)), H = 28, mid = H / 2;
      const R = rng(1000 + 17 * idx + (+document.body.dataset.dividerSeed || 0));
      const step = W < 600 ? 10 : 14, K = Math.ceil(W / step) + 1, A = 7;
      const pts = []; let level = 0;
      for (let k = 0; k < K; k++) {
        if (k > 1 && k < K - 2 && R() < 0.12) level = Math.round((R() * 2 - 1) * 2) / 4;   // small steps
        let v = level;
        if (k > 0 && k < K - 1 && R() < 0.16) v += (R() < 0.5 ? -1 : 1) * (0.6 + R() * 0.6);  // spikes
        if (k === 0 || k === K - 1) v = 0;
        pts.push([k * step, mid + A * v]);
      }
      svg.innerHTML = "";
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      el("polyline", { points: path(pts), fill: "none", stroke: INK, "stroke-width": 2,
                       "stroke-linejoin": "miter", "stroke-miterlimit": 10 }, svg);
    });
  }

  function drawAll() { document.querySelectorAll("svg.waves").forEach(draw); drawDividers(); }
  let timer; window.addEventListener("resize", () => { clearTimeout(timer); timer = setTimeout(drawAll, 150); });
  document.addEventListener("DOMContentLoaded", drawAll);
})();

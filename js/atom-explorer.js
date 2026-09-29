/* ─────────────────────────────────────────────────────────────────────
   AMO Toolkit — atom-explorer.js: the Periodic Table Explorer on
   atom-library.html.

   • A full periodic table (symbols/names: TeX Live `nucleardata`
     elementlist.csv). The nine elements whose isotopes the library
     covers are buttons; the rest are context.
   • "Colour by" lenses re-tint the nine tiles by a property and print the
     value, to show the periodic trends behind species choice.
   • The selected element's summary sits in the table's own gap (periods
     1–3, groups 3–12); the inspector below shows its level diagram,
     notes, data sheets and research groups (content that used to live in
     the per-family tabs and the separate group list).
   • Every number is read from the page's own #atom-table (single source);
     only the ground-state magnetic moment is added here (see LIB).
   Compare mode reuses the page's selectForCompare()/updateComparePanel().
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var ELEMENTS = [["H","Hydrogen"],["He","Helium"],["Li","Lithium"],["Be","Beryllium"],["B","Boron"],["C","Carbon"],["N","Nitrogen"],["O","Oxygen"],["F","Fluorine"],["Ne","Neon"],["Na","Sodium"],["Mg","Magnesium"],["Al","Aluminum"],["Si","Silicon"],["P","Phosphorus"],["S","Sulfur"],["Cl","Chlorine"],["Ar","Argon"],["K","Potassium"],["Ca","Calcium"],["Sc","Scandium"],["Ti","Titanium"],["V","Vanadium"],["Cr","Chromium"],["Mn","Manganese"],["Fe","Iron"],["Co","Cobalt"],["Ni","Nickel"],["Cu","Copper"],["Zn","Zinc"],["Ga","Gallium"],["Ge","Germanium"],["As","Arsenic"],["Se","Selenium"],["Br","Bromine"],["Kr","Krypton"],["Rb","Rubidium"],["Sr","Strontium"],["Y","Yttrium"],["Zr","Zirconium"],["Nb","Niobium"],["Mo","Molybdenum"],["Tc","Technetium"],["Ru","Ruthenium"],["Rh","Rhodium"],["Pd","Palladium"],["Ag","Silver"],["Cd","Cadmium"],["In","Indium"],["Sn","Tin"],["Sb","Antimony"],["Te","Tellurium"],["I","Iodine"],["Xe","Xenon"],["Cs","Cesium"],["Ba","Barium"],["La","Lanthanum"],["Ce","Cerium"],["Pr","Praseodymium"],["Nd","Neodymium"],["Pm","Promethium"],["Sm","Samarium"],["Eu","Europium"],["Gd","Gadolinium"],["Tb","Terbium"],["Dy","Dysprosium"],["Ho","Holmium"],["Er","Erbium"],["Tm","Thulium"],["Yb","Ytterbium"],["Lu","Lutetium"],["Hf","Hafnium"],["Ta","Tantalum"],["W","Tungsten"],["Re","Rhenium"],["Os","Osmium"],["Ir","Iridium"],["Pt","Platinum"],["Au","Gold"],["Hg","Mercury"],["Tl","Thallium"],["Pb","Lead"],["Bi","Bismuth"],["Po","Polonium"],["At","Astatine"],["Rn","Radon"],["Fr","Francium"],["Ra","Radium"],["Ac","Actinium"],["Th","Thorium"],["Pa","Protactinium"],["U","Uranium"],["Np","Neptunium"],["Pu","Plutonium"],["Am","Americium"],["Cm","Curium"],["Bk","Berkelium"],["Cf","Californium"],["Es","Einsteinium"],["Fm","Fermium"],["Md","Mendelevium"],["No","Nobelium"],["Lr","Lawrencium"],["Rf","Rutherfordium"],["Db","Dubnium"],["Sg","Seaborgium"],["Bh","Bohrium"],["Hs","Hassium"],["Mt","Meitnerium"],["Ds","Darmstadtium"],["Rg","Roentgenium"],["Cn","Copernicium"],["Nh","Nihonium"],["Fl","Flerovium"],["Mc","Moscovium"],["Lv","Livermorium"],["Ts","Tennessine"],["Og","Oganesson"]];   // [symbol, name] for Z = 1…118

  // The library's nine elements. mu = ground-state electronic magnetic moment
  // (μ_B): ≈1 for the alkali ²S₁/₂ state, 0 for ¹S₀ (J = 0), ≈7 (Er) and ≈10 (Dy).
  var LIB = {
    Li: { name: 'Lithium',    fam: 'Alkali',         iso: ['⁶Li', '⁷Li'],          def: '⁶Li',   mu: 1 },
    Na: { name: 'Sodium',     fam: 'Alkali',         iso: ['²³Na'],                def: '²³Na',  mu: 1 },
    K:  { name: 'Potassium',  fam: 'Alkali',         iso: ['³⁹K', '⁴⁰K', '⁴¹K'],   def: '³⁹K',   mu: 1 },
    Rb: { name: 'Rubidium',   fam: 'Alkali',         iso: ['⁸⁵Rb', '⁸⁷Rb'],        def: '⁸⁷Rb',  mu: 1 },
    Cs: { name: 'Caesium',    fam: 'Alkali',         iso: ['¹³³Cs'],               def: '¹³³Cs', mu: 1 },
    Sr: { name: 'Strontium',  fam: 'Alkaline Earth', iso: ['⁸⁸Sr', '⁸⁷Sr'],        def: '⁸⁸Sr',  mu: 0 },
    Yb: { name: 'Ytterbium',  fam: 'Alkaline Earth', iso: ['¹⁷⁴Yb', '¹⁷¹Yb'],      def: '¹⁷¹Yb', mu: 0 },
    Dy: { name: 'Dysprosium', fam: 'Magnetic',       iso: ['¹⁶⁴Dy'],               def: '¹⁶⁴Dy', mu: 10 },
    Er: { name: 'Erbium',     fam: 'Magnetic',       iso: ['¹⁶⁸Er'],               def: '¹⁶⁸Er', mu: 7 }
  };
  var ORDER = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Sr', 'Yb', 'Dy', 'Er'];
  var FAM = {
    'Alkali':         { key: 'alk', label: 'Alkali metals', short: 'Alkali' },
    'Alkaline Earth': { key: 'ae',  label: 'Two-electron (alkaline-earth-like)', short: 'Alkaline-earth-like' },
    'Magnetic':       { key: 'mag', label: 'Magnetic lanthanides', short: 'Magnetic' }
  };
  var SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  function elOf(iso) { return iso.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ''); }
  function massOf(iso) { return iso.replace(/[^⁰¹²³⁴⁵⁶⁷⁸⁹]/g, '').split('').map(function (c) { return SUP[c]; }).join(''); }
  function num(s) { var v = parseFloat(String(s).replace(/[^\d.\-]/g, '')); return isFinite(v) && !/^\s*[—–-]\s*$/.test(s) ? v : null; }

  // grid position [row, column] of element Z (rows 9–10 are the f-block rows)
  function pos(z) {
    if (z === 1) return [1, 1];
    if (z === 2) return [1, 18];
    if (z <= 10) return [2, z <= 4 ? z - 2 : z + 8];
    if (z <= 18) return [3, z <= 12 ? z - 10 : z];
    if (z <= 36) return [4, z - 18];
    if (z <= 54) return [5, z - 36];
    if (z <= 56) return [6, z - 54];
    if (z <= 71) return [9, z - 54];
    if (z <= 86) return [6, z - 68];
    if (z <= 88) return [7, z - 86];
    if (z <= 103) return [10, z - 86];
    return [7, z - 100];
  }

  // ── rows of the page's own data table ──────────────────────────────
  var ROWS = {};
  function readTable() {
    document.querySelectorAll('#atom-table tbody tr').forEach(function (tr) {
      var c = tr.querySelectorAll('td');
      if (c.length < 12) return;
      var iso = c[0].textContent.trim();
      ROWS[iso] = {
        tr: tr, iso: iso, Z: num(c[1].textContent), A: num(c[2].textContent),
        stat: c[3].textContent.trim(), fam: c[4].textContent.trim(),
        cool: num(c[5].textContent), gamma: num(c[6].textContent), TD: num(c[7].textContent),
        recoil: num(c[8].textContent), I: c[9].textContent.trim(), HF: num(c[10].textContent),
        HFtxt: c[10].textContent.trim(), note: c[11].textContent.trim()
      };
    });
  }

  // ── colour helpers ─────────────────────────────────────────────────
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb2hex(c) { return '#' + c.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'); }).join(''); }
  function lum(c) {
    var l = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function inkFor(hex) { return lum(hex2rgb(hex)) > 0.28 ? '#0b0b0b' : '#ffffff'; }
  // single-hue sequential ramp (blue): light steps for small values on the cream paper,
  // and on the dark card small values recede toward the surface (dark) and large ones get lighter
  var RAMP = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
  function ramp(t) {
    var steps = isDark() ? RAMP.slice(1).reverse() : RAMP.slice(0, 6);
    t = Math.max(0, Math.min(1, t)) * (steps.length - 1);
    var i = Math.min(steps.length - 2, Math.floor(t)), f = t - i, a = hex2rgb(steps[i]), b = hex2rgb(steps[i + 1]);
    return rgb2hex([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]);
  }
  // approximate sRGB of a visible wavelength (Bruton's piecewise fit); near-IR is drawn dark red
  function waveColor(nm) {
    if (nm > 700) return '#4a0d14';
    var r = 0, g = 0, b = 0;
    if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
    else { r = 1; }
    var f = nm < 420 ? 0.45 + 0.55 * (nm - 380) / 40 : 1;
    return rgb2hex([r, g, b].map(function (v) { return 255 * Math.pow(v * f, 0.8); }));
  }

  // ── lenses ─────────────────────────────────────────────────────────
  function isoVals(el, key) { return LIB[el].iso.map(function (i) { return ROWS[i] ? ROWS[i][key] : null; }); }
  function f2(v) { return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2); }
  var LENS = {
    family: { kind: 'cat',
      cap: 'Alkalis (one valence electron) give microwave hyperfine qubits and diode-laser D lines. The two-electron atoms Sr and Yb add narrow intercombination and mHz clock lines; Yb is a lanthanide, but its filled 4f shell leaves an alkaline-earth-like 6s² outer shell. Dy and Er carry large magnetic moments from their open 4f shells.' },
    light: { kind: 'light', key: 'cool', unit: 'nm',
      cap: 'Each tile is tinted with the colour of its broad cooling line (approximate sRGB for that wavelength). K, Rb and Cs cool in the near-infrared (767–852 nm), drawn dark red. From Na down to Cs the D2 line moves steadily to the red (Li, at 671 nm, is the exception); the two-electron and lanthanide atoms cool on blue and violet lines between 399 and 461 nm.' },
    td: { kind: 'seq', key: 'TD', unit: 'μK', log: true,
      cap: 'Doppler limit of the broad cooling line, T_D = ħΓ/(2k_B). It depends only on the linewidth, not the mass: the alkalis sit at 125–235 μK and the blue lines of Sr and Yb at 670–770 μK. Their narrow intercombination lines go far lower (0.18 μK for Sr, 4.4 μK for Yb; see the note under the charts). No broad-line value is listed for Dy and Er.' },
    gamma: { kind: 'seq', key: 'gamma', unit: 'MHz', log: true,
      cap: 'Natural linewidth Γ/2π of the broad cooling line: 5–10 MHz for the alkali D2 lines and 28–32 MHz for the ¹S₀→¹P₁ lines of Sr and Yb. Broad lines mean strong forces and fast imaging; narrow lines mean colder atoms.' },
    recoil: { kind: 'seq', key: 'recoil', unit: 'μK', log: true, perIso: true,
      cap: 'Recoil scale 2E_r/k_B = h²/(mλ²k_B), per isotope. It falls as 1/(mλ²): light ⁶Li has the largest recoil and heavy Cs the smallest, which is why Li needs special sub-Doppler care in tweezers. For Sr and Yb the value is for the narrow line used for final cooling, as in the table.' },
    hf: { kind: 'seq', key: 'HF', unit: 'GHz', log: true, perIso: true,
      cap: 'Ground-state hyperfine splitting, per isotope: the microwave qubit frequency of the alkalis, from 0.23 GHz (⁶Li) to 9.19 GHz (¹³³Cs, which defines the SI second). ¹S₀ Sr and Yb have no electronic hyperfine structure (J = 0); ⁸⁷Sr and ¹⁷¹Yb keep qubits in nuclear spin instead.' },
    stat: { kind: 'stat',
      cap: 'Quantum statistics per isotope: B = boson, F = fermion. Fermions with non-zero nuclear spin (⁶Li, ⁴⁰K, ⁸⁷Sr, ¹⁷¹Yb) are the Fermi-Hubbard and SU(N) workhorses; ⁸⁷Sr\'s I = 9/2 gives ten nuclear-spin states.' },
    mu: { kind: 'seq', unit: 'μ_B', log: false, elVal: function (el) { return LIB[el].mu; },
      cap: 'Ground-state electronic magnetic moment: about 1 μ_B for the alkalis (one unpaired s electron), 0 for ¹S₀ Sr and Yb (J = 0), about 7 μ_B for Er and 10 μ_B for Dy. The magnetic dipole-dipole interaction scales as μ², so Dy\'s is about 100 times an alkali\'s.' }
  };
  function lensVal(L, el, iso) {
    if (L.elVal) return L.elVal(el);
    var r = ROWS[iso || state.isoOf[el]];
    return r ? r[L.key] : null;
  }
  function lensRange(L) {
    var vs = [];
    ORDER.forEach(function (el) {
      if (L.elVal) vs.push(L.elVal(el));
      else isoVals(el, L.key).forEach(function (v) { if (v != null && v > 0) vs.push(v); });
    });
    vs = vs.filter(function (v) { return v != null && (!L.log || v > 0); });
    return [Math.min.apply(null, vs), Math.max.apply(null, vs)];
  }
  function lensT(L, v, rg) {
    if (L.log) return (Math.log(v) - Math.log(rg[0])) / (Math.log(rg[1]) - Math.log(rg[0]) || 1);
    return (v - rg[0]) / (rg[1] - rg[0] || 1);
  }

  // ── state + DOM ────────────────────────────────────────────────────
  var state = { el: 'Rb', iso: '⁸⁷Rb', lens: 'family', isoOf: {}, cmp: false };
  ORDER.forEach(function (el) { state.isoOf[el] = LIB[el].def; });
  var grid, hole, chips, legend, tiles = {};

  function build() {
    grid = document.getElementById('ptable');
    chips = document.getElementById('ptx-chips');
    legend = document.getElementById('ptx-legend');
    if (!grid) return false;
    var frag = document.createDocumentFragment();
    ELEMENTS.forEach(function (e, i) {
      var z = i + 1, p = pos(z), sym = e[0], lib = LIB[sym];
      var t = document.createElement(lib ? 'button' : 'div');
      t.className = 'pt-el' + (lib ? ' is-lib fam-' + FAM[lib.fam].key : '');
      t.style.gridRow = p[0]; t.style.gridColumn = p[1];
      t.dataset.z = z;
      if (lib) {
        t.type = 'button';
        t.dataset.el = sym;
        t.innerHTML = '<span class="pt-z">' + z + '</span><span class="pt-s">' + sym + '</span><span class="pt-v"></span>';
        t.addEventListener('click', function () { pick(sym); });
        t.addEventListener('keydown', function (ev) {
          if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
          ev.preventDefault();
          var k = ORDER.indexOf(sym) + (ev.key === 'ArrowRight' ? 1 : -1);
          tiles[ORDER[(k + ORDER.length) % ORDER.length]].focus();
        });
        tiles[sym] = t;
      } else {
        t.setAttribute('aria-hidden', 'true');
        t.title = z + ' · ' + e[1];
        t.innerHTML = '<span class="pt-z">' + z + '</span><span class="pt-s">' + sym + '</span>';
      }
      frag.appendChild(t);
    });
    [[6, 'La–Lu', '57–71'], [7, 'Ac–Lr', '89–103']].forEach(function (f) {
      var ph = document.createElement('div');
      ph.className = 'pt-el pt-fref';
      ph.setAttribute('aria-hidden', 'true');
      ph.style.gridRow = f[0]; ph.style.gridColumn = 3;
      ph.innerHTML = '<span class="pt-z">' + f[2] + '</span><span class="pt-s">' + f[1] + '</span>';
      frag.appendChild(ph);
    });
    hole = document.createElement('div');
    hole.className = 'pt-hole';
    hole.setAttribute('aria-live', 'polite');
    frag.appendChild(hole);
    grid.appendChild(frag);

    ORDER.forEach(function (el) {
      var c = document.createElement('button');
      c.type = 'button'; c.className = 'ptx-chip fam-' + FAM[LIB[el].fam].key; c.dataset.el = el;
      c.innerHTML = '<i aria-hidden="true"></i>' + el + ' <span>' + LIB[el].name + '</span>';
      c.addEventListener('click', function () { pick(el); });
      chips.appendChild(c);
    });

    document.querySelectorAll('.ptx-lens [data-lens]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.lens = b.dataset.lens;
        document.querySelectorAll('.ptx-lens [data-lens]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        paint();
      });
    });

    // the data table's isotope cells open that isotope here
    Object.keys(ROWS).forEach(function (iso) {
      var cell = ROWS[iso].tr.querySelector('.atom-sym');
      if (!cell) return;
      cell.setAttribute('role', 'button'); cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', 'Open ' + iso + ' in the periodic table explorer');
      cell.classList.add('atom-sym-link');
      var go = function () { select(iso, { scroll: true, user: true }); };
      cell.addEventListener('click', go);
      cell.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    return true;
  }

  // a tile or chip was clicked: in compare mode it feeds the comparison, otherwise it opens the element
  function pick(el) {
    if (state.cmp && typeof selectForCompare === 'function') { selectForCompare(null, state.isoOf[el]); return; }
    select(state.isoOf[el], { user: true });
  }

  // ── lens painting ──────────────────────────────────────────────────
  function paint() {
    var L = LENS[state.lens], rg = L.kind === 'seq' ? lensRange(L) : null;
    grid.dataset.lens = state.lens;
    ORDER.forEach(function (el) {
      var t = tiles[el], v = t.querySelector('.pt-v'), lib = LIB[el];
      t.style.background = ''; t.style.color = ''; t.classList.remove('has-fill');
      var label = el + ', ' + lib.name + ' (Z ' + t.dataset.z + '): ' + lib.iso.join(', ');
      if (L.kind === 'cat') {
        v.textContent = lib.iso.map(massOf).join(' · ');
      } else if (L.kind === 'stat') {
        v.innerHTML = lib.iso.map(function (i) {
          var f = ROWS[i] && ROWS[i].stat === 'Fermion';
          return '<b class="' + (f ? 'is-f' : 'is-b') + '">' + massOf(i) + (f ? 'F' : 'B') + '</b>';
        }).join('');
        label += '. ' + lib.iso.map(function (i) { return i + ' ' + (ROWS[i] ? ROWS[i].stat.toLowerCase() : ''); }).join(', ');
      } else {
        var vals = L.elVal ? [L.elVal(el)] : (L.perIso ? isoVals(el, L.key) : [lensVal(L, el)]);
        var shown = vals.filter(function (x) { return x != null; });
        var cv = lensVal(L, el);
        if (L.kind === 'light' && cv != null) {
          var col = waveColor(cv);
          t.style.background = col; t.style.color = inkFor(col); t.classList.add('has-fill');
          v.textContent = cv.toFixed(0) + (cv > 700 ? ' IR' : '');
        } else if (cv != null && (!L.log || cv > 0)) {
          var c2 = ramp(lensT(L, cv, rg));
          t.style.background = c2; t.style.color = inkFor(c2); t.classList.add('has-fill');
          v.textContent = shown.map(f2).join(' · ');
        } else {
          v.textContent = '—';
        }
        label += '. ' + (shown.length ? shown.map(f2).join(', ') + ' ' + L.unit : 'no value listed');
      }
      t.setAttribute('aria-label', label);
    });
    drawLegend(L, rg);
  }
  function drawLegend(L, rg) {
    var html = '';
    if (L.kind === 'cat') {
      html = '<div class="ptx-keys">' + Object.keys(FAM).map(function (f) {
        return '<span class="ptx-key fam-' + FAM[f].key + '"><i></i>' + FAM[f].label + '</span>';
      }).join('') + '</div>';
    } else if (L.kind === 'stat') {
      html = '<div class="ptx-keys"><span class="ptx-key"><b class="is-b">B</b>boson</span><span class="ptx-key"><b class="is-f">F</b>fermion</span></div>';
    } else if (L.kind === 'light') {
      html = '<div class="ptx-keys"><span class="ptx-bar ptx-bar-spectrum" aria-hidden="true"></span><span class="ptx-key">400 nm … 700 nm · near-IR drawn dark red</span></div>';
    } else {
      var stops = [0, 0.25, 0.5, 0.75, 1].map(function (x) { return ramp(x) + ' ' + (x * 100) + '%'; }).join(',');
      html = '<div class="ptx-keys"><span class="ptx-num">' + f2(rg[0]) + '</span><span class="ptx-bar" style="background:linear-gradient(90deg,' + stops + ')" aria-hidden="true"></span><span class="ptx-num">' + f2(rg[1]) + ' ' + L.unit + '</span>' + (L.log ? '<span class="ptx-key">log scale</span>' : '') + '</div>';
    }
    // the same numbers as text (they are too small to read inside the tiles on phones)
    var list = '';
    if (L.kind === 'seq' || L.kind === 'light') {
      list = '<p class="ptx-vals">' + ORDER.map(function (el) {
        var vals = L.elVal ? [L.elVal(el)] : (L.perIso ? isoVals(el, L.key) : [lensVal(L, el)]);
        vals = vals.filter(function (x) { return x != null; });
        return '<span><b>' + el + '</b> ' + (vals.length ? vals.map(L.kind === 'light' ? function (x) { return x.toFixed(0); } : f2).join(' · ') : '—') + '</span>';
      }).join('') + ' <em>' + L.unit + (L.perIso ? ', per isotope in table order' : '') + '</em></p>';
    }
    legend.innerHTML = html + list + '<p>' + L.cap + '</p>';
  }

  // ── selection ──────────────────────────────────────────────────────
  function row(label, value) { return value == null || value === '' ? '' : '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>'; }
  function renderHole() {
    var el = state.el, lib = LIB[el], r = ROWS[state.iso] || {}, fam = FAM[lib.fam];
    var pills = lib.iso.map(function (i) {
      return '<button type="button" class="pt-iso" data-iso="' + i + '" aria-pressed="' + (i === state.iso) + '">' + i + '</button>';
    }).join('');
    var hf = r.HF != null ? r.HF.toFixed(3) + ' GHz' : (lib.fam === 'Alkali' ? r.HFtxt : 'none (J = 0)');
    if (lib.fam === 'Magnetic') hf = '—';
    hole.innerHTML =
      (state.cmp ? '<p class="pt-cmpnote">Compare mode: pick two elements. The panel below the table fills in.</p>' : '') +
      '<div class="pt-sum fam-' + fam.key + '">' +
        '<div class="pt-big"><span class="pt-z">' + (r.Z || '') + '</span><b>' + el + '</b><span>' + lib.name + '</span></div>' +
        '<div class="pt-sum-main">' +
          '<div class="pt-sum-top"><span class="pt-fam">' + fam.short + '</span>' + pills + '</div>' +
          '<dl class="pt-kv">' +
            row('Cooling λ', r.cool != null ? r.cool + ' nm' : null) +
            row('Γ/2π', r.gamma != null ? r.gamma + ' MHz' : '—') +
            row('T_D', r.TD != null ? r.TD + ' μK' : '—') +
            row('2E_r/k_B', r.recoil != null ? r.recoil + ' μK' : '—') +
            row('Nuclear spin I', r.I) +
            row('Hyperfine', hf) +
            row('Statistics', r.stat) +
            row('Moment', (lib.mu === 1 ? '≈1' : lib.mu) + ' μ_B') +
          '</dl>' +
          '<div class="pt-sum-links"><a href="#spec-panel">Levels, notes &amp; groups ↓</a><a href="#all-isotopes" data-row="1">Row in the table ↓</a></div>' +
        '</div>' +
      '</div>';
    hole.querySelectorAll('.pt-iso').forEach(function (b) {
      b.addEventListener('click', function () {
        if (state.cmp && typeof selectForCompare === 'function') { state.isoOf[el] = b.dataset.iso; selectForCompare(null, b.dataset.iso); return; }
        select(b.dataset.iso, { user: true });
      });
    });
    var rl = hole.querySelector('[data-row]');
    if (rl) rl.addEventListener('click', function (e) {
      e.preventDefault();
      var tr = ROWS[state.iso] && ROWS[state.iso].tr;
      if (!tr) return;
      tr.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'center' });
      flash(tr);
    });
  }
  function motionOK() { return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function flash(tr) { tr.classList.remove('is-flash'); void tr.offsetWidth; tr.classList.add('is-flash'); }

  function specInfo(sp) {
    var info = '';
    if (sp.D2lam) info += '<strong>' + (sp.D1lam ? 'D2 line' : 'Broad cooling line') + ':</strong> ' + sp.D2lam + ' nm' + (sp.D2G != null ? ' · Γ/2π = ' + sp.D2G + ' MHz' : '') + '<br>';
    if (sp.D1lam) info += '<strong>D1 line:</strong> ' + sp.D1lam + ' nm · Γ/2π = ' + sp.D1G + ' MHz<br>';
    if (sp.narrow) info += '<strong>' + sp.narrow.label + ':</strong> Γ/2π = ' + sp.narrow.G + ' MHz<br>';
    if (sp.clock) info += '<strong>Clock:</strong> ' + sp.clock.label + '<br>';
    if (sp.groundHF) info += '<strong>Ground HF splitting:</strong> ' + sp.groundHF.toFixed(3) + ' GHz<br>';
    if (sp.qubit) info += '<span class="ptx-qubit">⚛️ ' + sp.qubit + '</span><br>';
    if (sp.notes) info += '<em>' + sp.notes + '</em>';
    return info;
  }
  function drawLevels() {
    var sp = (typeof SPEC_DATA !== 'undefined') && SPEC_DATA[state.iso];
    if (!sp || typeof drawLevelDiagram !== 'function') return;
    document.getElementById('spec-title').textContent = sp.sym + ' · energy levels';
    drawLevelDiagram(sp);
    document.getElementById('spec-info').innerHTML = specInfo(sp);
  }

  function select(iso, opts) {
    opts = opts || {};
    var el = elOf(iso);
    if (!LIB[el] || !ROWS[iso]) return;
    state.el = el; state.iso = iso; state.isoOf[el] = iso;
    ORDER.forEach(function (e) {
      tiles[e].classList.toggle('is-sel', e === el);
      tiles[e].setAttribute('aria-pressed', String(e === el));
    });
    chips.querySelectorAll('.ptx-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.el === el)); });
    Object.keys(ROWS).forEach(function (i) { ROWS[i].tr.classList.toggle('is-selected', i === iso); });
    renderHole();
    if (LENS[state.lens].perIso) paint();

    var lib = LIB[el];
    document.getElementById('ptx-insp-title').innerHTML = iso + ' <span>· ' + lib.name + ' · ' + FAM[lib.fam].label + '</span>';
    document.querySelectorAll('.fam-note').forEach(function (n) { n.hidden = n.dataset.fam !== lib.fam; });
    document.querySelectorAll('.el-detail').forEach(function (a) { a.hidden = a.dataset.el !== el; });
    document.querySelectorAll('.el-groups').forEach(function (g) { g.hidden = g.dataset.els.split(' ').indexOf(el) < 0; });
    drawLevels();

    if (opts.user && history.replaceState) history.replaceState(null, '', '#' + el + '-' + massOf(iso));
    if (opts.scroll) {
      var target = document.getElementById('explorer');
      var top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: top, behavior: motionOK() ? 'smooth' : 'auto' });
    }
  }

  // ── compare mode (the page's selectForCompare/updateComparePanel do the work) ──
  function markCompare(list) {
    ORDER.forEach(function (e) { tiles[e].classList.remove('cmp-a', 'cmp-b'); });
    chips.querySelectorAll('.ptx-chip').forEach(function (c) { c.classList.remove('cmp-a', 'cmp-b'); });
    (list || []).forEach(function (iso, i) {
      var el = elOf(iso), cls = i === 0 ? 'cmp-a' : 'cmp-b';
      if (tiles[el]) tiles[el].classList.add(cls);
      var c = chips.querySelector('[data-el="' + el + '"]'); if (c) c.classList.add(cls);
    });
    syncCompareSelects();
  }
  function setCompareMode(on) {
    state.cmp = !!on;
    grid.classList.toggle('is-cmp', state.cmp);
    renderHole();
    // start the comparison from the element already open
    if (state.cmp && typeof selectForCompare === 'function' && typeof cmpAtoms !== 'undefined' && !cmpAtoms.length) selectForCompare(null, state.iso);
  }
  // isotope boxes in the two comparison heads, so ⁸⁵Rb vs ⁸⁷Rb (or any pair) is reachable
  function syncCompareSelects() {
    if (typeof cmpAtoms === 'undefined') return;
    ['a', 'b'].forEach(function (side, k) {
      var head = document.getElementById('cmp-head-' + side);
      if (!head) return;
      var sel = head.querySelector('select');
      if (!sel) {
        sel = document.createElement('select');
        sel.className = 'cmp-iso';
        sel.setAttribute('aria-label', 'Isotope ' + (k ? 'B' : 'A'));
        Object.keys(ROWS).forEach(function (i) { var o = document.createElement('option'); o.value = i; o.textContent = i; sel.appendChild(o); });
        sel.addEventListener('change', function () {
          if (cmpAtoms.length < 2) return;
          cmpAtoms[k] = sel.value;
          markCompare(cmpAtoms);
          updateComparePanel();
        });
        head.appendChild(sel);
      }
      sel.hidden = cmpAtoms.length < 2;
      if (cmpAtoms[k]) sel.value = cmpAtoms[k];
    });
  }

  function fromHash() {
    var m = decodeURIComponent(location.hash.slice(1)).match(/^([A-Z][a-z]?)-(\d+)$/);
    if (!m || !LIB[m[1]]) return false;
    var iso = LIB[m[1]].iso.filter(function (i) { return massOf(i) === m[2]; })[0];
    if (!iso) return false;
    select(iso, {});
    setTimeout(function () {
      var t = document.getElementById('explorer');
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 76, behavior: 'auto' });
    }, 60);
    return true;
  }

  function init() {
    readTable();
    if (!Object.keys(ROWS).length || !build()) return;
    paint();
    if (!fromHash()) select(state.iso, {});
    window.addEventListener('hashchange', fromHash);
    new MutationObserver(function () { paint(); drawLevels(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  window.AMOExplorer = { select: select, markCompare: markCompare, setCompareMode: setCompareMode };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ==========================================================================
   TRESTLE REGRESSION RUNNER
   --------------------------------------------------------------------------
   This file drives the REAL calculator. For every test it:
     1. loads a brand-new copy of index.html in an iframe (so every test
        starts from a clean power-on state — nothing carries over),
     2. opens the Trestle view,
     3. "clicks" the real keypad buttons in the order given by the benchmark,
     4. reads the main display (#cmMain) and compares it to the expected text.

   It does NOT contain any calculator math. If Trestle's math or key routing
   changes, these tests see it exactly the way you would on screen.

   You should not normally need to edit this file. Add or change tests in
   tests/benchmarks.js instead.
   ========================================================================== */
(function () {
  "use strict";

  // ---- Key names used in benchmarks.js → the real button on the keypad ----
  // Names match the labels printed on the keys. A few typing-friendly
  // aliases are accepted too (ft, in, yd, sqrt, -, *, /).
  const KEY_SELECTORS = {
    ".": '[data-cm="decimal"]',
    "+": '[data-cm-op="add"]',
    "−": '[data-cm-op="subtract"]',
    "×": '[data-cm-op="multiply"]',
    "÷": '[data-cm-op="divide"]',
    "=": '[data-cm="equals"]',
    "Feet": '[data-cm="feet"]',
    "Inch": '[data-cm="inch"]',
    "Yds": '[data-cm-dimensional-unit="yd"]',
    "m": '[data-cm-dimensional-unit="m"]',
    "mm": '[data-cm-dimensional-unit="mm"]',
    "Sq": '[data-cm="sq"]',
    "Cu": '[data-cm="cu"]',
    "/": '[data-cm="fraction"]',
    "d:m:s": '[data-cm="dms"]',
    "Conv": '[data-cm="conv"]',
    "Stor": '[data-cm="stor"]',
    "Rcl": '[data-cm="rcl"]',
    "%": '[data-cm="percent"]',
    "Pitch": '[data-cm-roof="pitch"]',
    "Rise": '[data-cm-roof="rise"]',
    "Run": '[data-cm-roof="run"]',
    "Diag": '[data-cm-roof="diag"]',
    "Hip/V": '[data-cm-roof="hipv"]',
    "Sine": '[data-cm-trig="sin"]',
    "Cos": '[data-cm-trig="cos"]',
    "Tan": '[data-cm-trig="tan"]',
    "Circ": '[data-cm-primary="circ"]',
    "√": '[data-cm-primary="sqrt"]',
    "Jack": '[data-cm="jack"]',
    "C": '[data-cm="clear"]',
    "⌫": '[data-cm="back"]'
  };
  for (let d = 0; d <= 9; d++) KEY_SELECTORS[String(d)] = `[data-cm-digit="${d}"]`;
  const KEY_ALIASES = { "ft": "Feet", "in": "Inch", "yd": "Yds", "sqrt": "√", "-": "−", "*": "×", "x": "×" };

  // Split "120 Cu Feet ÷ 10 Feet =" into individual key presses.
  // Multi-digit numbers such as 120 or 80.333 are pressed one character at a time.
  function tokenize(keys) {
    const out = [];
    for (const raw of String(keys).trim().split(/\s+/)) {
      if (!raw) continue;
      if (/^(\d+\.?\d*|\.\d+)$/.test(raw)) { for (const ch of raw) out.push(ch); continue; }
      out.push(KEY_ALIASES[raw] || raw);
    }
    return out;
  }

  // ---- Comparison rules (kept deliberately small and visible) ----
  // PERMANENT RULE: the physical Trig Plus II NEVER shows thousands separators.
  // Trestle's commas (1,000,000) are an intentional UI improvement, so the
  // physical benchmarks are written WITHOUT commas and the comparison ignores
  // digit-grouping commas. The commas themselves are guarded separately by
  // tests that use match: "trestle-exact" (see the "Trestle UI Formatting" category).
  //
  // "exact" (default) ignores ONLY:
  //   • extra spaces
  //   • the display minus sign (−) versus a typed hyphen (-)
  //   • hyphen vs space between whole inches and a fraction (8-19/64 = 8 19/64),
  //     because our historical notes wrote both styles for the same display
  //   • thousands-separator commas (Trestle UI formatting, never on the physical)
  // "units-loose" additionally ignores periods in unit abbreviations
  //   (sq. ft. = sq ft). Used ONLY where the physical punctuation was never recorded.
  // "trestle-exact" checks Trestle's own intended UI formatting, INCLUDING the
  //   thousands-separator commas. Used only for TRESTLE BASELINE UI tests.
  function normBase(s) {
    return String(s ?? "")
      .replace(/\u2212/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(\d)-(\d+\/\d+)/g, "$1 $2");
  }
  function stripGrouping(s) {
    return s.replace(/(\d),(?=\d{3}(?:\D|$))/g, "$1");
  }
  function normExact(s) { return stripGrouping(normBase(s)); }
  function normLoose(s) {
    return normExact(s)
      .replace(/\b(sq|cu|ft|in|yd)\./g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }
  function matches(actual, expected, mode) {
    const f = mode === "units-loose" ? normLoose : mode === "trestle-exact" ? normBase : normExact;
    return f(actual) === f(expected);
  }

  // Read the main display the way a person reads it. Tagged displays such as
  // "DEG | 30°" or "M-1 | 3 ft" are two separate spans; join them with a space.
  function readDisplay(el) {
    if (!el) return "(display not found)";
    const tag = el.querySelector(".cm-jack-tag");
    const val = el.querySelector(".cm-jack-value");
    if (tag || val) return `${tag ? tag.textContent.trim() : ""} ${val ? val.textContent.trim() : ""}`.trim();
    return el.textContent.replace(/\s+/g, " ").trim();
  }

  // ---- Fresh calculator for each test ----
  let frame = null;
  function freshFrame(host) {
    return new Promise((resolve, reject) => {
      if (frame) frame.remove();
      frame = document.createElement("iframe");
      frame.title = "Trestle under test";
      frame.className = "trestle-frame";
      const timer = setTimeout(() => reject(new Error("Calculator page did not load within 15 seconds.")), 15000);
      frame.addEventListener("load", () => {
        clearTimeout(timer);
        try {
          const doc = frame.contentDocument;
          if (!doc) throw new Error("Cannot read the calculator page (see the note about opening tests.html from the same web address as the app).");
          const errors = [];
          frame.contentWindow.addEventListener("error", e => errors.push(e.message || String(e)));
          frame.contentWindow.addEventListener("unhandledrejection", e => errors.push(String(e.reason)));
          // Show Trestle, exactly as tapping its tile on the home screen would.
          const tile = doc.querySelector('[data-open="construction"]');
          if (tile) tile.click();
          if (!doc.querySelector("#cmMain")) throw new Error("Trestle display (#cmMain) not found in index.html.");
          resolve({ doc, win: frame.contentWindow, errors });
        } catch (err) { reject(err); }
      }, { once: true });
      frame.src = "index.html";
      host.appendChild(frame);
    });
  }

  function normaliseTest(t) {
    const steps = t.steps ? t.steps : [{ keys: t.keys, expect: t.expect }];
    return { ...t, steps, match: t.match || "exact" };
  }

  async function runOne(t, host) {
    const test = normaliseTest(t);
    const result = {
      id: test.id, name: test.name, category: test.category, status: test.status,
      knownFail: test.knownFail || null, notes: test.notes || "", match: test.match,
      steps: [], outcome: "", error: null, history: ""
    };
    try {
      const { doc, errors } = await freshFrame(host);
      let allPass = true;
      for (const step of test.steps) {
        const tokens = tokenize(step.keys);
        for (const k of tokens) {
          const sel = KEY_SELECTORS[k];
          if (!sel) throw new Error(`Unknown key name "${k}" in benchmark ${test.id}.`);
          const btn = doc.querySelector(sel);
          if (!btn) throw new Error(`Key "${k}" not found on the keypad (${sel}).`);
          btn.click();
        }
        const actual = readDisplay(doc.querySelector("#cmMain"));
        const hasExpect = step.expect !== undefined && step.expect !== null && step.expect !== "";
        const pass = hasExpect ? matches(actual, step.expect, test.match) : null;
        if (hasExpect && !pass) allPass = false;
        result.steps.push({ keys: step.keys, expect: hasExpect ? step.expect : "", actual, pass });
      }
      const hist = doc.querySelector("#cmHistory");
      result.history = hist ? hist.textContent.trim() : "";
      if (errors.length) { result.error = "JavaScript error in calculator: " + errors.join(" | "); allPass = false; }

      if (test.status === "NEEDS PHYSICAL TEST") result.outcome = "PENDING";
      else if (allPass && test.knownFail) result.outcome = "NOW PASSING";
      else if (allPass) result.outcome = "PASS";
      else if (test.knownFail) result.outcome = "KNOWN FAIL";
      else result.outcome = "UNEXPECTED FAIL";
    } catch (err) {
      result.error = err.message || String(err);
      result.outcome = test.status === "NEEDS PHYSICAL TEST" ? "PENDING" : "UNEXPECTED FAIL";
    }
    return result;
  }

  // ---- Stale-cache check -------------------------------------------------
  // The app's service worker serves files from its offline cache. If that
  // cache holds an older build, the tests would silently test old code.
  // Compare what is cached with what the web server has right now.
  async function checkFreshness() {
    const files = ["index.html", "js/app.js", "js/calculators/construction-master.js", "css/app.css"];
    if (location.protocol === "file:") return { ok: false, fileProtocol: true, stale: [] };
    if (!("caches" in window)) return { ok: true, note: "Offline cache not available on this address; files come straight from the server.", stale: [] };
    const stale = [];
    for (const f of files) {
      try {
        const cached = await caches.match(new URL(f, location.href).href);
        if (!cached) continue;
        const [a, b] = await Promise.all([
          cached.clone().text(),
          fetch(`${f}?fresh=${Date.now()}`, { cache: "no-store" }).then(r => r.ok ? r.text() : null)
        ]);
        if (b !== null && a !== b) stale.push(f);
      } catch (e) { /* ignore a single file problem */ }
    }
    return { ok: stale.length === 0, stale };
  }
  async function clearAppCache() {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith("tims-calculators")).map(k => caches.delete(k)));
    }
  }

  window.TrestleRunner = { runOne, tokenize, matches, normExact, normLoose, checkFreshness, clearAppCache, freshFrame, readDisplay };
})();

/* ==========================================================================
   TRESTLE PHYSICAL-CALCULATOR BENCHMARKS
   --------------------------------------------------------------------------
   This is the ONLY file you need to edit to add a new test.

   HOW TO ADD A TEST
   Copy one of the blocks below, paste it at the end of its category, and
   change the values. Keep the commas between blocks.

     T({
       id: "DIM-99",                          // any short unique label
       name: "Volume ÷ Length → Area",         // plain-English description
       category: "Dimensional Arithmetic",     // groups tests on the page
       keys: "120 Cu Feet ÷ 10 Feet =",        // keys exactly as printed
       expect: "12 sq. ft.",                   // what the MAIN display shows
       status: VALIDATED,                      // VALIDATED, BASELINE or PENDING
       notes: "Optional explanation."
     });

   KEY NAMES (separate every key with a space)
     Numbers: type them normally (120, 80.333, 0.5) — each digit is pressed.
     + − × ÷ = . / %   Feet Inch Yds m mm Sq Cu Conv Stor Rcl d:m:s
     Pitch Rise Run Diag Hip/V Sine Cos Tan Circ √ Jack C ⌫
     Gold functions are entered the physical way: Conv then the key
     (AC = "Conv ×", π = "Conv +", +/− = "Conv −", 1/x = "Conv ÷",
      x² = "Conv √", EXP = "Conv /", Arc = "Conv Circ", R/Wall = "Conv Diag",
      Ir/Pitch = "Conv Hip/V", Ir/Jack = "Conv Jack").
     Typing shortcuts also work: ft, in, yd, sqrt, -, *

   MULTI-STEP TESTS
     Use steps instead of keys/expect to check the display part-way through:
       steps: [
         { keys: "25.5 Inch Conv Feet", expect: "2.125 ft" },
         { keys: "Conv Feet",           expect: "2 ft 1 1/2 in" }
       ]
     Every test starts from a freshly loaded calculator.

   STATUS
     VALIDATED  = PHYSICAL VALIDATED. The expected text came from your real
                  Trig Plus II. Counts toward PASS / FAIL.
     BASELINE   = TRESTLE BASELINE. The feature was physically validated when it
                  was built, but our notes never recorded the exact display text
                  for this specific sequence. The expected text is what V9.23.5
                  shows. Counts toward PASS / FAIL so it still guards against
                  regressions. Promote to VALIDATED once you re-check it.
     PENDING    = NEEDS PHYSICAL TEST. The test still runs and shows what
                  Trestle does today, but it is never counted as a failure.
                  Put your physical result in "expect" and change to VALIDATED.

   KNOWN BASELINE FAILURES
     knownFail: "reason"  marks a physically confirmed behavior that V9.23.5
     does not implement yet. It shows as KNOWN FAIL (amber), not as a
     regression. When a later version fixes it, the page shows NOW PASSING —
     then delete the knownFail line.

   COMPARISON RULES (see tests/runner.js)
     PERMANENT RULE: the physical Trig Plus II never uses thousands separators.
     Write physical expectations WITHOUT commas (2000, 61023.74).
     Trestle's commas are an intentional UI improvement, so digit-grouping
     commas are ignored when comparing — they are never treated as a defect.
     Extra spaces, − versus -, and 8-19/64 versus 8 19/64 are also treated as
     equal. Nothing else is ignored.
     Add  match: "units-loose"  to also treat "sq. ft." and "sq ft" as equal —
     used only where the physical punctuation was never recorded.
     Add  match: "trestle-exact"  to check Trestle's own UI formatting exactly,
     commas included (used by the "Trestle UI Formatting" tests).
   ========================================================================== */

const VALIDATED = "PHYSICAL VALIDATED";
const BASELINE = "TRESTLE BASELINE";
const PENDING = "NEEDS PHYSICAL TEST";
window.TRESTLE_BENCHMARKS = [];
function T(test) { window.TRESTLE_BENCHMARKS.push(test); }

/* Reusable known-failure reasons for V9.23.5 (so the wording stays consistent). */
const KF = {
  chaining: "V9.23.5: a completed '=' or Sq/Cu result can only start a new calculation with ÷ (and only for area/volume). Other operator keys are silently ignored. (setOp gate, lines 553–555)",
  volLen: "V9.23.5: applyTyped() has no volume ÷ length rule, so it returns 'Invalid dimensional operation' / 0 ft 0 in.",
  areaArea: "V9.23.5: applyTyped() has no area ÷ area rule.",
  volVol: "V9.23.5: applyTyped() has no volume ÷ volume rule, and Cu entry as operand #2 wipes the pending ÷ (setCubicUnit line 270).",
  cuOperand2: "V9.23.5: Cu entry as operand #2 wipes the pending calculation (setCubicUnit line 270) instead of producing Error 3.",
  dimPlusScalar: "V9.23.5: applyTyped() rejects any mixed-kind + or − (line 521). Physical: dimensional first operand ± plain number keeps the first operand's units.",
  error3: "V9.23.5: invalid dimensional operations show '0 ft 0 in' (history 'Invalid dimensional operation') instead of the physical 'Error 3'.",
  divZero: "V9.23.5: division by zero goes through the same invalid path and shows '0 ft 0 in' instead of 'Error 1'.",
  sqrtOperand2: "V9.23.5: √ clears the pending operator (sqrtSquareKey line 1115) instead of supplying operand #2.",
  trigOperand2: "V9.23.5: Sine/Cos/Tan clear the pending operator (trigKey line 1013) instead of supplying operand #2.",
  circleAreaMemory: "V9.23.5: at the AREA stage circleDisplay() leaves result = diameter (line 1033), so Stor saves the diameter while showing the area text.",
  sqSticky: "V9.23.5: the Sq 'armed' flag survives the + key, so '3 Feet' becomes 3 sq. ft.; the resulting mixed operation shows '0 ft 0 in' instead of 'Error 3'.",
  // Found while building this suite — physically recorded displays that V9.23.5 formats differently:
  areaLabel: "FOUND WHILE BUILDING SUITE: computed area/volume results display 'sq ft' / 'cu ft' (render() line 165–167); the physical calculator shows 'sq. ft.' / 'cu. ft.'.",
  precision7: "FOUND WHILE BUILDING SUITE: Trestle shows 6 decimal places (78.539816); the physical display shows 78.53982 (the physical display appears to round to about 7 significant digits).",
  acDisplay: "FOUND WHILE BUILDING SUITE: after AC Trestle shows '0 ft 0 in'; the V9.12 physical benchmark shows '0'.",
  acDiag: "FOUND WHILE BUILDING SUITE: after AC, Diag shows '0 ft 0 in' with the message 'Enter two roof dimensions first.'; the V9.12 physical benchmark shows 'DIAG 0'.",
  sqPrompt: "FOUND WHILE BUILDING SUITE: the Sq prompt shows '30 SQ' (squareKey line 313); the physical calculator showed '30 sq.'."
};

/* ============================ CORE ARITHMETIC ============================ */
T({ id:"CORE-01", category:"Core Arithmetic", name:"Result chaining: 5 × 5 = × 2 =",
    keys:"5 × 5 = × 2 =", expect:"50", status:VALIDATED, knownFail:KF.chaining,
    notes:"Physically confirmed after the V9.23.5 audit." });
T({ id:"CORE-02", category:"Core Arithmetic", name:"Negative operand: 10 + 3 +/− =",
    keys:"10 + 3 Conv − =", expect:"7", status:VALIDATED, notes:"V9.14 physical benchmark." });
T({ id:"CORE-03", category:"Core Arithmetic", name:"+/− toggles sign and back",
    steps:[ {keys:"25 Conv −", expect:"-25"}, {keys:"Conv −", expect:"25"} ],
    status:VALIDATED, notes:"V9.14 physical benchmark." });
T({ id:"CORE-04", category:"Core Arithmetic", name:"π standalone",
    keys:"Conv +", expect:"PI 3.141593", status:VALIDATED, notes:"V9.13.1: display shows PI tag and 3.141593." });
T({ id:"CORE-05", category:"Core Arithmetic", name:"2 × π keeps full precision",
    keys:"2 × Conv + =", expect:"6.283185", status:VALIDATED });
T({ id:"CORE-06", category:"Core Arithmetic", name:"Square root: 144 √",
    keys:"144 √", expect:"12", status:VALIDATED });
T({ id:"CORE-07", category:"Core Arithmetic", name:"Square root: 2 √",
    keys:"2 √", expect:"1.414214", status:VALIDATED, notes:"V9.10 physical benchmark." });
T({ id:"CORE-08", category:"Core Arithmetic", name:"x²: 12 Conv √",
    keys:"12 Conv √", expect:"144", status:VALIDATED });
T({ id:"CORE-09", category:"Core Arithmetic", name:"x²: 1.234 Conv √",
    keys:"1.234 Conv √", expect:"1.522756", status:VALIDATED, notes:"V9.10 physical benchmark." });
T({ id:"CORE-10", category:"Core Arithmetic", name:"1/x: 4 Conv ÷",
    keys:"4 Conv ÷", expect:"0.25", status:VALIDATED });
T({ id:"CORE-11", category:"Core Arithmetic", name:"1/x: 3 Conv ÷",
    keys:"3 Conv ÷", expect:"0.333333", status:VALIDATED, notes:"V9.11 physical benchmark." });
T({ id:"CORE-12", category:"Core Arithmetic", name:"1/x of zero is Error 1",
    keys:"0 Conv ÷", expect:"Error 1", status:VALIDATED, notes:"V9.11 physical benchmark." });
T({ id:"CORE-13", category:"Core Arithmetic", name:"√ as operand #2: 10 × 144 √ =",
    keys:"10 × 144 √ =", expect:"120", status:VALIDATED, knownFail:KF.sqrtOperand2,
    notes:"Physically confirmed after the audit." });
T({ id:"CORE-14", category:"Core Arithmetic", name:"Plain scalar division 10 ÷ 0 =",
    keys:"10 ÷ 0 =", expect:"Error 1", status:VALIDATED,
    notes:"Physically confirmed before V9.23.11." });
T({ id:"CORE-15", category:"Core Arithmetic", name:"Operator with no second number: 5 × =",
    keys:"5 × =", expect:"", status:PENDING, notes:"V9.23.5 treats the missing operand as 0. Physical may repeat 5 × 5." });
T({ id:"CORE-16", category:"Core Arithmetic", name:"Repeated equals: 5 × 5 = =",
    keys:"5 × 5 = =", expect:"", status:PENDING, notes:"Does the physical calculator repeat the last operation (125)?" });

/* ========================= DIMENSIONAL ARITHMETIC ======================== */
T({ id:"DIM-01", category:"Dimensional Arithmetic", name:"Length × Length → Area",
    keys:"10 Feet × 8 Feet =", expect:"80 sq ft", match:"units-loose", status:VALIDATED,
    notes:"Area result validated; the exact punctuation of this specific display was never recorded, so sq. ft. and sq ft are both accepted here." });
T({ id:"DIM-02", category:"Dimensional Arithmetic", name:"Length × Length × Length → Volume",
    keys:"10 Feet × 8 Feet × 3 Feet =", expect:"240 cu ft", match:"units-loose", status:VALIDATED,
    notes:"Punctuation not recorded — loose unit match." });
T({ id:"DIM-03", category:"Dimensional Arithmetic", name:"Length ÷ Length → scalar",
    keys:"10 Feet ÷ 2 Feet =", expect:"5", status:VALIDATED,
    notes:"Rule physically validated; this example's value is arithmetic." });
T({ id:"DIM-04", category:"Dimensional Arithmetic", name:"Area ÷ Length → Length (24 sq. ft. ÷ 6 ft)",
    keys:"24 Sq Feet ÷ 6 Feet =", expect:"4 ft 0 in", status:VALIDATED });
T({ id:"DIM-05", category:"Dimensional Arithmetic", name:"Area ÷ Length → Length (100 sq. ft. ÷ 20 ft)",
    keys:"100 Sq Feet ÷ 20 Feet =", expect:"5 ft 0 in", status:VALIDATED });
T({ id:"DIM-06", category:"Dimensional Arithmetic", name:"Computed area ÷ length (V8.9 reference)",
    keys:"10 Feet × 8 Feet ÷ 4 Feet =", expect:"20 ft 0 in", status:VALIDATED });
T({ id:"DIM-07", category:"Dimensional Arithmetic", name:"Volume ÷ Area → Length (120 cu. ft. ÷ 30 sq. ft.)",
    steps:[ {keys:"120 Cu Feet ÷ 30 Sq Feet", expect:"30 sq. ft."}, {keys:"=", expect:"4 ft 0 in"} ],
    status:VALIDATED });
T({ id:"DIM-08", category:"Dimensional Arithmetic", name:"Sq prompt as operand #2 shows '30 sq.'",
    keys:"120 Cu Feet ÷ 30 Sq", expect:"30 sq.", status:VALIDATED, knownFail:KF.sqPrompt,
    notes:"Physical display observed during the V9.23.5 investigation." });
T({ id:"DIM-09", category:"Dimensional Arithmetic", name:"Volume ÷ Length → Area (120 cu. ft. ÷ 10 ft)",
    keys:"120 Cu Feet ÷ 10 Feet =", expect:"12 sq. ft.", match:"units-loose", status:VALIDATED,
    notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-10", category:"Dimensional Arithmetic", name:"Area × Length → Volume from Sq entry",
    keys:"24 Sq Feet × 6 Feet =", expect:"144 cu. ft.", match:"units-loose", status:VALIDATED, knownFail:KF.chaining,
    notes:"Physically confirmed after the audit. Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-11", category:"Dimensional Arithmetic", name:"Length × Volume is an error",
    keys:"10 Feet × 3 Cu Feet =", expect:"Error 3", status:VALIDATED, knownFail:KF.cuOperand2,
    notes:"Physically confirmed. Do NOT assume a higher-dimensional result." });
T({ id:"DIM-12", category:"Dimensional Arithmetic", name:"Area ÷ Area → scalar",
    keys:"24 Sq Feet ÷ 6 Sq Feet =", expect:"4", status:VALIDATED });
T({ id:"DIM-13", category:"Dimensional Arithmetic", name:"Volume ÷ Volume → scalar",
    keys:"120 Cu Feet ÷ 10 Cu Feet =", expect:"12", status:VALIDATED });
T({ id:"DIM-14", category:"Dimensional Arithmetic", name:"Length + plain number keeps length",
    keys:"5 Feet + 3 =", expect:"8 ft 0 in", status:VALIDATED, knownFail:KF.dimPlusScalar });
T({ id:"DIM-15", category:"Dimensional Arithmetic", name:"Plain number + length is an error (asymmetric)",
    keys:"3 + 5 Feet =", expect:"Error 3", status:VALIDATED, knownFail:KF.error3,
    notes:"This asymmetry is physically validated. Do not normalize it." });
T({ id:"DIM-16", category:"Dimensional Arithmetic", name:"Length − plain number keeps length",
    keys:"5 Feet − 3 =", expect:"2 ft 0 in", status:VALIDATED, knownFail:KF.dimPlusScalar });
T({ id:"DIM-17", category:"Dimensional Arithmetic", name:"Area + plain number keeps area",
    keys:"20 Sq Feet + 5 =", expect:"25 sq. ft.", match:"units-loose", status:VALIDATED, notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem.", knownFail:KF.chaining + " Also: " + KF.dimPlusScalar });
T({ id:"DIM-18", category:"Dimensional Arithmetic", name:"Volume + plain number keeps volume",
    keys:"20 Cu Feet + 5 =", expect:"25 cu. ft.", match:"units-loose", status:VALIDATED, notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem.", knownFail:KF.chaining + " Also: " + KF.dimPlusScalar });
T({ id:"DIM-19", category:"Dimensional Arithmetic", name:"Length chaining: 10 ft + 2 ft = + 1 ft =",
    keys:"10 Feet + 2 Feet = + 1 Feet =", expect:"13 ft 0 in", status:VALIDATED, knownFail:KF.chaining });
T({ id:"DIM-20", category:"Dimensional Arithmetic", name:"Sq armed then + : 5 Sq + 3 Feet =",
    keys:"5 Sq + 3 Feet =", expect:"Error 3", status:VALIDATED, knownFail:KF.sqSticky,
    notes:"Physically observed result only. Do not infer more behavior from this sequence." });
T({ id:"DIM-21", category:"Dimensional Arithmetic", name:"Length ÷ 0 is Error 1",
    keys:"10 Feet ÷ 0 =", expect:"Error 1", status:VALIDATED, knownFail:KF.divZero });
T({ id:"DIM-22", category:"Dimensional Arithmetic", name:"Computed volume ÷ length (10×8×3 = ÷ 10 ft)",
    keys:"10 Feet × 8 Feet × 3 Feet = ÷ 10 Feet =", expect:"24 sq. ft.", match:"units-loose", status:VALIDATED,
    notes:"Same physically validated volume ÷ length rule reached through a computed volume. Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-23", category:"Dimensional Arithmetic", name:"Area × Area", keys:"4 Sq Feet × 2 Sq Feet =",
    expect:"Error 3", status:VALIDATED, knownFail:KF.chaining,
    notes:"Physically confirmed before V9.23.11. The Error 3 rule exists in V9.23.11, but the × after a Sq-entered area is still ignored by the R1 gate, so the calculation never reaches it." });
T({ id:"DIM-24", category:"Dimensional Arithmetic", name:"Plain number ÷ length", keys:"10 ÷ 2 Feet =",
    expect:"Error 3", status:VALIDATED, notes:"Physically confirmed before V9.23.11." });
T({ id:"DIM-25", category:"Dimensional Arithmetic", name:"Length ÷ area", keys:"10 Feet ÷ 2 Sq Feet =",
    expect:"Error 3", status:VALIDATED, notes:"Physically confirmed before V9.23.11." });
T({ id:"DIM-26", category:"Dimensional Arithmetic", name:"Invalid operation detected at the next operator: 3 + 5 ft +",
    keys:"3 + 5 Feet +", expect:"Error 3", status:VALIDATED,
    notes:"Physically confirmed: Error 3 appears when the second + is pressed. Before V9.23.11 the invalid operand was silently discarded (3 + 5 ft + 2 = gave 5)." });

/* ============================ UNIT CONVERSIONS =========================== */
T({ id:"CONV-01", category:"Unit Conversions", name:"25.5 in → Conv Feet toggles decimal ↔ ft-in",
    steps:[ {keys:"25.5 Inch Conv Feet", expect:"2.125 ft"},
            {keys:"Conv Feet", expect:"2 ft 1 1/2 in"},
            {keys:"Conv Feet", expect:"2.125 ft"} ], status:VALIDATED });
T({ id:"CONV-02", category:"Unit Conversions", name:"80.333 in → Conv Inch toggles and keeps original decimal",
    steps:[ {keys:"80.333 Inch Conv Inch", expect:"80 21/64 in"},
            {keys:"Conv Inch", expect:"80.333 in"} ], status:VALIDATED });
T({ id:"CONV-03", category:"Unit Conversions", name:"Whole inches → Conv Feet: 25 in",
    keys:"25 Inch Conv Feet", expect:"2 ft 1 in", status:VALIDATED, notes:"V9.21.7 physical example." });
T({ id:"CONV-04", category:"Unit Conversions", name:"Whole inches → Conv Feet: 50 in",
    keys:"50 Inch Conv Feet", expect:"4 ft 2 in", status:VALIDATED, notes:"V9.21.2 physical example." });
T({ id:"CONV-05", category:"Unit Conversions", name:"Decimal feet → Conv Inch: 3.5 ft",
    keys:"3.5 Feet Conv Inch", expect:"42 in", status:VALIDATED });
T({ id:"CONV-06", category:"Unit Conversions", name:"Direct decimal feet toggle: 2.125 ft",
    steps:[ {keys:"2.125 Feet Conv Feet", expect:"2 ft 1 1/2 in"}, {keys:"Conv Feet", expect:"2.125 ft"} ],
    status:VALIDATED, notes:"V9.21.6 / V9.21.7." });
T({ id:"CONV-07", category:"Unit Conversions", name:"147 in → Conv Feet",
    keys:"147 Inch Conv Feet", expect:"12 ft 3 in", status:VALIDATED, notes:"V8.6 example." });
T({ id:"CONV-08", category:"Unit Conversions", name:"9 ft → Conv Inch",
    keys:"9 Feet Conv Inch", expect:"108 in", status:VALIDATED, notes:"V8.5 example." });
T({ id:"CONV-09", category:"Unit Conversions", name:"1 m → Conv Feet",
    keys:"1 m Conv Feet", expect:"3 ft 3-3/8 in", status:VALIDATED, notes:"V9.20.1 physical example." });
T({ id:"CONV-10", category:"Unit Conversions", name:"Linear m entry display",
    keys:"1 m", expect:"1 m", status:BASELINE });
T({ id:"CONV-11", category:"Unit Conversions", name:"1000 mm → Conv m",
    keys:"1000 mm Conv m", expect:"1 m", status:BASELINE });
T({ id:"CONV-12", category:"Unit Conversions", name:"1 Yds → Conv Feet",
    keys:"1 Yds Conv Feet", expect:"3 ft 0 in", status:BASELINE, notes:"V9.21 yard conversions validated; exact display not recorded." });
T({ id:"CONV-13", category:"Unit Conversions", name:"36 in → Conv Yds",
    keys:"36 Inch Conv Yds", expect:"1 yd", status:BASELINE });
T({ id:"CONV-14", category:"Unit Conversions", name:"Cubic chain: 1 cu. m → cu. ft. → cu. in.",
    steps:[ {keys:"1 Cu m", expect:"1 cu. m"},
            {keys:"Conv Feet", expect:"35.31467 cu. ft."},
            {keys:"Conv Inch", expect:"61023.74 cu. in."} ], status:VALIDATED, notes:"V9.20.2 / V9.20.3 physical chain." });
T({ id:"CONV-15", category:"Unit Conversions", name:"1 cu. yd. → Conv Feet",
    keys:"1 Cu Yds Conv Feet", expect:"27 cu. ft.", status:VALIDATED, notes:"V9.21.1 example." });
T({ id:"CONV-16", category:"Unit Conversions", name:"Cu mm entry with thousands separators",
    keys:"1000000 Cu mm", expect:"1000000 cu. mm", status:VALIDATED,
    notes:"Physical display has no comma. Trestle's 1,000,000 grouping is checked separately by UI-02." });
T({ id:"CONV-17", category:"Unit Conversions", name:"144 sq. in. → Conv Feet",
    keys:"144 Sq Inch Conv Feet", expect:"1 sq. ft.", status:BASELINE });
T({ id:"CONV-18", category:"Unit Conversions", name:"1 sq. yd. → Conv Feet",
    keys:"1 Sq Yds Conv Feet", expect:"9 sq. ft.", status:BASELINE });
T({ id:"CONV-19", category:"Unit Conversions", name:"1 sq. m → Conv Feet",
    keys:"1 Sq m Conv Feet", expect:"10.76391 sq. ft.", status:BASELINE });
T({ id:"CONV-20", category:"Unit Conversions", name:"V9.17 chain 28 ft 2-19/32 in → 28.21615 ft → 338.5938 in → 338 19/32 in",
    keys:"28 Feet 2 Inch 19 / 32 Conv Feet", expect:"", status:PENDING,
    notes:"Physical values recorded (28.21615 ft, 338.5938 in, 338 19/32 in) but not the exact key sequence. V9.23.5 shows 6 decimals (28.216146), which may differ from the physical 7-digit display." });
T({ id:"CONV-21", category:"Unit Conversions", name:"Conv during an active calculation: 10 ft × 2 Conv Feet =",
    keys:"10 Feet × 2 Conv Feet =", expect:"", status:PENDING, notes:"V9.23.5 drops the pending × here." });

/* ================================ FRACTIONS ============================== */
T({ id:"FRAC-01", category:"Fractions", name:"Numerator stays visible after /",
    keys:"2 Inch 19 /", expect:"2-19/ in", status:BASELINE, notes:"V9.17: numerator remains visible (2-19/)." });
T({ id:"FRAC-02", category:"Fractions", name:"8 in 3/32 + 27.5 in =",
    keys:"8 Inch 3 / 32 + 27.5 Inch =", expect:"2 ft 11 19/32 in", status:BASELINE });
T({ id:"FRAC-03", category:"Fractions", name:"25 ft 3 in + 8-3/32 in + 27.5 in = (V8.3 history example)",
    keys:"25 Feet 3 Inch + 8 Inch 3 / 32 + 27.5 Inch =", expect:"28 ft 2 19/32 in", status:BASELINE,
    notes:"Same value as the V9.17 physical benchmark 28 ft 2-19/32 in." });
T({ id:"FRAC-04", category:"Fractions", name:"Fraction finished with Inch: 3 / 32 Inch display",
    keys:"3 / 32 Inch", expect:"", status:PENDING,
    notes:"V9.23.5 shows '0 in' (audit bug #8: display only, math is correct). What does the physical show?" });

/* ================================== ROOF ================================= */
T({ id:"ROOF-01", category:"Roof", name:"12 ft Run, 5 ft Rise → Diag",
    keys:"12 Feet Run 5 Feet Rise Diag", expect:"13 ft 0 in", status:VALIDATED });
T({ id:"ROOF-02", category:"Roof", name:"12 ft Run, 5 ft Rise → Pitch",
    keys:"12 Feet Run 5 Feet Rise Pitch", expect:"22.61986°", status:VALIDATED });
T({ id:"ROOF-03", category:"Roof", name:"12 ft Run, 5 ft Rise → Hip/V",
    keys:"12 Feet Run 5 Feet Rise Hip/V", expect:"17 ft 8-19/64 in", status:VALIDATED });
T({ id:"ROOF-04", category:"Roof", name:"Recall Rise and Run",
    steps:[ {keys:"12 Feet Run 5 Feet Rise Rise", expect:"5 ft 0 in"}, {keys:"Run", expect:"12 ft 0 in"} ],
    status:VALIDATED, notes:"V9.0 expected recalls." });
T({ id:"ROOF-05", category:"Roof", name:"14 ft 7 in Run, 6 ft 3 in Rise → Hip/V",
    keys:"14 Feet 7 Inch Run 6 Feet 3 Inch Rise Hip/V", expect:"21 ft 6-39/64 in", status:VALIDATED, notes:"V9.3 physical target." });
T({ id:"ROOF-06", category:"Roof", name:"Unitless value then Run: 12 Run",
    keys:"12 Run", expect:"", status:PENDING, notes:"V9.23.5 ignores unitless roof entries and keeps the digits." });
T({ id:"ROOF-07", category:"Roof", name:"Roof recall during arithmetic: 5 ft × Diag",
    keys:"12 Feet Run 5 Feet Rise 5 Feet × Diag", expect:"", status:PENDING });

/* ========================== JACK / IRREGULAR JACK ======================== */
T({ id:"JACK-01", category:"Jack / Irregular Jack", name:"Stor → Jack shows O.C. spacing",
    keys:"16 Inch Stor Jack", expect:"OC 16 in", status:BASELINE });
T({ id:"JACK-02", category:"Jack / Irregular Jack", name:"Regular Jack sequence 12/5 roof, 16 in O.C.",
    steps:[ {keys:"12 Feet Run 5 Feet Rise Jack", expect:"Jk 1 11 ft 6 43/64 in"},
            {keys:"Jack", expect:"Jk 2 10 ft 1 21/64 in"},
            {keys:"Jack", expect:"Jk 3 8 ft 8 in"} ], status:BASELINE,
    notes:"Jack was physically validated in V9.4; these exact strings are the V9.23.5 display." });
T({ id:"JACK-03", category:"Jack / Irregular Jack", name:"Regular Jack reaches zero then switches to IJ",
    keys:"12 Feet Run 5 Feet Rise Jack Jack Jack Jack Jack Jack Jack Jack Jack Jack", expect:"IJ 1 11 ft 6 43/64 in", status:BASELINE,
    notes:"JK counts down to 0, then IJ starts (V9.4 cycle)." });
T({ id:"JACK-04", category:"Jack / Irregular Jack", name:"Ir/Jack jumps to IJ 1",
    keys:"12 Feet Run 5 Feet Rise Conv Jack", expect:"IJ 1 11 ft 6 43/64 in", status:BASELINE });
T({ id:"JACK-05", category:"Jack / Irregular Jack", name:"Ir/Pitch stores irregular pitch",
    keys:"12 Feet Run 5 Feet Rise 8 Inch Conv Hip/V", expect:"IPCH 8 in", status:BASELINE });
T({ id:"JACK-06", category:"Jack / Irregular Jack", name:"Irregular Jack with 8/12 adjoining pitch",
    keys:"12 Feet Run 5 Feet Rise 8 Inch Conv Hip/V Conv Jack", expect:"IJ 1 8 ft 0 9/64 in", status:BASELINE });
T({ id:"JACK-07", category:"Jack / Irregular Jack", name:"Does AC restore the 16 in Jack O.C.?",
    keys:"24 Inch Stor Jack Conv × 12 Feet Run 5 Feet Rise Jack", expect:"", status:PENDING,
    notes:"V9.23.5 keeps the last stored O.C. (24 in) after AC." });

/* ================================= R/WALL ================================ */
T({ id:"RW-01", category:"R/Wall", name:"R/Wall first step (12/5 roof)",
    keys:"12 Feet Run 5 Feet Rise Conv Diag", expect:"RW 1 4 ft 5 21/64 in", status:BASELINE,
    notes:"R/Wall physically validated in V9.6.1; exact strings from V9.23.5." });
T({ id:"RW-02", category:"R/Wall", name:"Plain Diag advances the active R/Wall",
    keys:"12 Feet Run 5 Feet Rise Conv Diag Diag", expect:"RW 2 3 ft 10 43/64 in", status:BASELINE });
T({ id:"RW-03", category:"R/Wall", name:"Final RW holds at 0 ft 0 in (no wrap)",
    keys:"12 Feet Run 5 Feet Rise Conv Diag Diag Diag Diag Diag Diag Diag Diag Diag Diag Diag", expect:"RW 9 0 ft 0 in", status:VALIDATED,
    notes:"Holding at the final zero result is physically validated (V9.6.1). The step number RW 9 follows from 60 in ÷ 6-2/3 in." });

/* ================================== TRIG ================================= */
T({ id:"TRIG-01", category:"Trig", name:"30 Sine", keys:"30 Sine", expect:"0.5", status:VALIDATED });
T({ id:"TRIG-02", category:"Trig", name:"60 Cos", keys:"60 Cos", expect:"0.5", status:VALIDATED });
T({ id:"TRIG-03", category:"Trig", name:"45 Tan", keys:"45 Tan", expect:"1", status:VALIDATED });
T({ id:"TRIG-04", category:"Trig", name:"37 Sine", keys:"37 Sine", expect:"0.601815", status:VALIDATED });
T({ id:"TRIG-05", category:"Trig", name:"37 Cos", keys:"37 Cos", expect:"0.798636", status:VALIDATED });
T({ id:"TRIG-06", category:"Trig", name:"37 Tan", keys:"37 Tan", expect:"0.753554", status:VALIDATED });
T({ id:"TRIG-07", category:"Trig", name:"Inverse sine: 0.5 Conv Sine", keys:"0.5 Conv Sine", expect:"DEG 30°", status:VALIDATED,
    notes:"V9.7: inverse trig shows DEG at left and the angle at right." });
T({ id:"TRIG-08", category:"Trig", name:"Inverse cos: 0.5 Conv Cos", keys:"0.5 Conv Cos", expect:"DEG 60°", status:VALIDATED });
T({ id:"TRIG-09", category:"Trig", name:"Inverse tan: 1 Conv Tan", keys:"1 Conv Tan", expect:"DEG 45°", status:VALIDATED });
T({ id:"TRIG-10", category:"Trig", name:"Trig as operand #2: 10 ft × 30 Sine =",
    keys:"10 Feet × 30 Sine =", expect:"5 ft 0 in", status:VALIDATED, knownFail:KF.trigOperand2,
    notes:"Physically confirmed after the audit." });

/* ============================== CIRCLE / ARC ============================= */
T({ id:"CIRC-01", category:"Circle / Arc", name:"10 in Circ → DIA", keys:"10 Inch Circ", expect:"DIA 10 in", status:VALIDATED });
T({ id:"CIRC-02", category:"Circle / Arc", name:"Circ → AREA", keys:"10 Inch Circ Circ", expect:"AREA 78.53982 sq. in.",
    status:VALIDATED, knownFail:KF.precision7 });
T({ id:"CIRC-03", category:"Circle / Arc", name:"Circ → CIRC", keys:"10 Inch Circ Circ Circ", expect:"CIRC 31 27/64 in", status:VALIDATED });
T({ id:"CIRC-04", category:"Circle / Arc", name:"Circ cycles back to DIA", keys:"10 Inch Circ Circ Circ Circ", expect:"DIA 10 in", status:VALIDATED });
T({ id:"CIRC-05", category:"Circle / Arc", name:"Arc 90°", keys:"10 Inch Circ 90 Conv Circ", expect:"ARC 7 55/64 in", status:VALIDATED });
T({ id:"CIRC-06", category:"Circle / Arc", name:"Arc 180°", keys:"10 Inch Circ 180 Conv Circ", expect:"ARC 15 45/64 in", status:VALIDATED });
T({ id:"CIRC-07", category:"Circle / Arc", name:"Arc 360°", keys:"10 Inch Circ 360 Conv Circ", expect:"ARC 31 27/64 in", status:VALIDATED });
T({ id:"CIRC-08", category:"Circle / Arc", name:"One C keeps the circle diameter for Arc",
    keys:"10 Inch Circ C 90 Conv Circ", expect:"ARC 7 55/64 in", status:VALIDATED, notes:"V9.9: one C preserves the stored diameter." });
T({ id:"CIRC-09", category:"Circle / Arc", name:"Metric diameter area units: 1 m Circ Circ",
    keys:"1 m Circ Circ", expect:"", status:PENDING, notes:"V9.23.5 reports sq. in. because there is no feet entry." });

/* ================================= MEMORY ================================ */
T({ id:"MEM-01", category:"Memory", name:"M1 = 3 ft; 4 ft × Rcl 1 =",
    keys:"3 Feet Stor 1 4 Feet × Rcl 1 =", expect:"12 sq. ft.", match:"units-loose", status:VALIDATED,
    notes:"Memory with dimensional state. Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"MEM-02", category:"Memory", name:"M1 = 25; 100 + Rcl 1 =",
    keys:"25 Stor 1 100 + Rcl 1 =", expect:"125", status:VALIDATED });
T({ id:"MEM-03", category:"Memory", name:"M-2 register: 3 ft Stor 2; 4 ft × Rcl 2 =",
    keys:"3 Feet Stor 2 4 Feet × Rcl 2 =", expect:"12 sq ft", match:"units-loose", status:VALIDATED,
    notes:"M-2 behaves like M-1 (validated). Loose unit match so this test isolates the M-2 register." });
T({ id:"MEM-04", category:"Memory", name:"C C keeps M-1",
    keys:"25 Stor 1 C C 100 + Rcl 1 =", expect:"125", status:VALIDATED });
T({ id:"MEM-05", category:"Memory", name:"AC zeros M-1",
    keys:"25 Stor 1 Conv × 100 + Rcl 1 =", expect:"100", status:VALIDATED });
T({ id:"MEM-06", category:"Memory", name:"Circle AREA stored to M-1",
    keys:"10 Inch Circ Circ Stor 1", expect:"M-1 78.53982 sq. in.", status:VALIDATED, knownFail:KF.circleAreaMemory + " Display also: " + KF.precision7 + " Also, the stored display text runs the tag into the value ('M-1 AREA78.539816 sq. in.') because snapshotCurrentValue() copies #cmMain text without a space." });
T({ id:"MEM-07", category:"Memory", name:"2 × stored circle area",
    keys:"10 Inch Circ Circ Stor 1 C C 2 × Rcl 1 =", expect:"157.0796 sq. in.", status:VALIDATED, knownFail:KF.circleAreaMemory });
T({ id:"MEM-08", category:"Memory", name:"Stor during an active calculation: 10 × 5 Stor 1",
    keys:"10 × 5 Stor 1", expect:"", status:PENDING });

/* ============================ DISPLAY FORMAT ============================= */
T({ id:"FMT-01", category:"Display Format", name:"Computed area label: 3 ft (M-1) × 4 ft = shows 'sq. ft.'",
    keys:"3 Feet Stor 1 4 Feet × Rcl 1 =", expect:"12 sq. ft.", status:VALIDATED, knownFail:KF.areaLabel,
    notes:"Exact physical display recorded in the audit prompt. The math is already correct in V9.23.5 (12); only the label punctuation differs. Computed volumes ('cu ft' vs 'cu. ft.') follow the same code path." });

/* ========================= TRESTLE UI FORMATTING ========================= */
/* Intentional Trestle improvements that the physical calculator does NOT have.
   These guard Trestle's own design, not physical behavior. */
T({ id:"UI-01", category:"Trestle UI Formatting", name:"Thousands separator on a plain result (200 ÷ 10 %)",
    keys:"200 ÷ 10 %", expect:"2,000", match:"trestle-exact", status:BASELINE,
    notes:"Intentional Trestle UI formatting. The physical shows 2000 (see PCT-05)." });
T({ id:"UI-02", category:"Trestle UI Formatting", name:"Thousands separators on a cubic entry",
    keys:"1000000 Cu mm", expect:"1,000,000 cu. mm", match:"trestle-exact", status:BASELINE,
    notes:"Intentional Trestle UI formatting (V9.18.1). The physical shows 1000000 (see CONV-16)." });
T({ id:"UI-03", category:"Trestle UI Formatting", name:"Thousands separator on a converted value",
    keys:"1 Cu m Conv Feet Conv Inch", expect:"61,023.74 cu. in.", match:"trestle-exact", status:BASELINE,
    notes:"Intentional Trestle UI formatting. The physical shows 61023.74 (see CONV-14)." });
T({ id:"UI-04", category:"Trestle UI Formatting", name:"Thousands separator on an EXP result",
    keys:"1.5 Conv / 4 =", expect:"15,000", match:"trestle-exact", status:BASELINE,
    notes:"Intentional Trestle UI formatting. The physical shows 15000 (see EXP-03)." });

/* ================================ PERCENT ================================ */
T({ id:"PCT-01", category:"Percent", name:"Standalone 10 %", keys:"10 %", expect:"0.1", status:VALIDATED });
T({ id:"PCT-02", category:"Percent", name:"200 × 10 %", keys:"200 × 10 %", expect:"20", status:VALIDATED });
T({ id:"PCT-03", category:"Percent", name:"200 + 10 %", keys:"200 + 10 %", expect:"220", status:VALIDATED });
T({ id:"PCT-04", category:"Percent", name:"200 − 10 %", keys:"200 − 10 %", expect:"180", status:VALIDATED });
T({ id:"PCT-05", category:"Percent", name:"200 ÷ 10 %", keys:"200 ÷ 10 %", expect:"2000", status:VALIDATED,
    notes:"Physically confirmed display: 2000 (no comma). Trestle shows 2,000 by design — see UI-01." });
T({ id:"PCT-06", category:"Percent", name:"10 ft × 50 %", keys:"10 Feet × 50 %", expect:"5 ft 0 in", status:VALIDATED });
T({ id:"PCT-07", category:"Percent", name:"Repeated standalone %", keys:"10 % %", expect:"", status:PENDING,
    notes:"Physical shows an all-segments/error-like display; exact text not recorded. V9.23.5 shows 'Error'." });
T({ id:"PCT-08", category:"Percent", name:"Dimensional percent operand: 10 ft + 5 ft %", keys:"10 Feet + 5 Feet %", expect:"", status:PENDING });

/* ================================== EXP ================================== */
T({ id:"EXP-01", category:"EXP", name:"2 EXP 3 =", keys:"2 Conv / 3 =", expect:"2000", status:VALIDATED,
    notes:"Physically confirmed display: 2000 (no comma). Trestle shows 2,000 by design." });
T({ id:"EXP-02", category:"EXP", name:"2 EXP −3 =", keys:"2 Conv / 3 Conv − =", expect:"0.002", status:VALIDATED,
    notes:"Physically confirmed: 2 → Conv → / → 3 → Conv → − → = displays 0.002." });
T({ id:"EXP-03", category:"EXP", name:"1.5 EXP 4 =", keys:"1.5 Conv / 4 =", expect:"15000", status:VALIDATED, notes:"Physical display has no comma (permanent rule)." });
T({ id:"EXP-04", category:"EXP", name:"AC during EXP entry", keys:"2 Conv / 3 Conv × 5 =", expect:"", status:PENDING,
    notes:"Audit bug #7: V9.23.5 stays in EXP mode after AC." });

/* ================================== DMS ================================== */
T({ id:"DMS-01", category:"DMS", name:"30.5 d:m:s cycles DEG → DMS → DEG",
    steps:[ {keys:"30.5 d:m:s", expect:"DEG 30.5°"}, {keys:"d:m:s", expect:"DMS 30.30.00°"}, {keys:"d:m:s", expect:"DEG 30.5°"} ],
    status:VALIDATED });
T({ id:"DMS-02", category:"DMS", name:"30.5125° → DMS", keys:"30.5125 d:m:s d:m:s", expect:"DMS 30.30.45°", status:VALIDATED });
T({ id:"DMS-03", category:"DMS", name:"Seconds round: 30.5126°", keys:"30.5126 d:m:s d:m:s", expect:"DMS 30.30.45°", status:VALIDATED });
T({ id:"DMS-04", category:"DMS", name:"Seconds round: 30.5127°", keys:"30.5127 d:m:s d:m:s", expect:"DMS 30.30.46°", status:VALIDATED });
T({ id:"DMS-05", category:"DMS", name:"d:m:s on a new result after AC", keys:"30.5 d:m:s Conv × 45 Sine d:m:s", expect:"", status:PENDING,
    notes:"Audit bug #6: V9.23.5 shows the old 30.5° angle." });

/* ========================= SPECIAL / CLEAR BEHAVIOR ====================== */
T({ id:"SPEC-01", category:"Special / Clear Behavior", name:"AC display", keys:"12 Feet Run 5 Feet Rise Conv ×", expect:"0",
    status:VALIDATED, knownFail:KF.acDisplay, notes:"V9.12 physical benchmark." });
T({ id:"SPEC-02", category:"Special / Clear Behavior", name:"AC clears roof: Diag afterwards", keys:"12 Feet Run 5 Feet Rise Conv × Diag", expect:"DIAG 0",
    status:VALIDATED, knownFail:KF.acDiag, notes:"V9.12 physical benchmark." });
T({ id:"SPEC-03", category:"Special / Clear Behavior", name:"One C keeps roof geometry",
    keys:"12 Feet Run 5 Feet Rise C Diag", expect:"13 ft 0 in", status:BASELINE,
    notes:"V9.x: one C keeps stored roof geometry (code comment in clearKey)." });
T({ id:"SPEC-05", category:"Special / Clear Behavior", name:"Error 3 is not latched: new entry starts fresh without C",
    steps:[ {keys:"3 + 5 Feet +", expect:"Error 3"}, {keys:"2 + 2 =", expect:"4"} ], status:VALIDATED,
    notes:"Physically confirmed: while Error 3 is displayed, 2 + 2 = gives 4 without pressing C." });
T({ id:"SPEC-04", category:"Special / Clear Behavior", name:"C C then Diag (roof cleared)",
    keys:"12 Feet Run 5 Feet Rise C C Diag", expect:"", status:PENDING });

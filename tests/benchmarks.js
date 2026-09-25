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
  clearDisplay: "R10: a cleared calculator displays '0 ft 0 in'; the physical calculator shows '0' (same cause as SPEC-01).",
  // V9.23.16 physical results for the former PENDING tests:
  convChain: "R7 precision (physical shows 7 digits: 28.21615 ft, 338.5938 in) AND Conv → Inch order after Conv → Feet (physical: decimal inches first, then fractional; Trestle shows fractional first).",
  convOperand2: "Conv → Feet on operand #2 wipes the pending calculation (showConverted() clears acc/op). Physical keeps the pending ×.",
  fracOnlyInch: "A fraction finished with Inch (no whole inches) shows '0 in' in the live display. Physical shows 0 3/32 in.",
  roofLabel: "Roof results do not show their function label (physical: RUN 12, DIAG 13 ft 0 in). Unitless Run is also ignored.",
  acJackOC: "AC does not restore the 16 in default Jack O.C.",
  circMetric: "Circle area from a metre diameter is shown in sq. in. Physical shows sq. m.",
  storPending: "Stor during arithmetic wipes the pending calculation (setSpecialDisplay()). Physical completes 10 × 5 before storing.",
  pctDim: "Percent with a dimensional operand is not rejected. Physical shows Error 5.",
  acExp: "AC does not leave EXP entry mode.",
  staleDms: "DMS state is never cleared, so an old angle resurfaces on the next d:m:s.",
  roofNoData: "After clearing, Diag with no roof data shows a message instead of a zero recall, the roof label is missing, and the cleared zero shows as 0 ft 0 in (R10).",
  roofUnitless: "V9.23.18 displays unitless Run/Rise but does not store them in the roof geometry.",
  roofOperand2: "Roof recall clears the pending calculation instead of supplying operand #2.",
  memLabel: "R6: Stor copies the whole display text, so a labeled roof result is stored as 'DIAG13 ft 0 in'.",
  memAreaPrecision: "R7 precision only: Trestle shows 78.539816 sq. in.; the physical shows 78.53982 sq. in.",
  areaDisplayUnit: "R8: computed areas always display in square feet (1.090831 sq ft) instead of the operand's square inches; also R7 precision.",
  memAreaPrecision2: "R7 precision only: Trestle shows 157.079633 sq. in.; the physical shows 157.0796 sq. in.",
  convPrecision: "R7 precision only: Trestle shows 28.216146 ft and 338.59375 in; the physical shows 28.21615 ft and 338.5938 in. (The Conv → Inch order was fixed in V9.23.22.)",
  lcdPrecision: "R7: Trestle showed up to 6 decimals regardless of size; the physical LCD has 7 digit positions.",
  missingOperand: "V9.23.12: an operator with no second number treats the missing operand as 0 (5 × = shows 0). Physical shows 5.",
  repeatEquals: "V9.23.12: pressing = again after a completed calculation does nothing. Physical replays the last operator and operand #2.",
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
    keys:"5 × 5 = × 2 =", expect:"50", status:VALIDATED,
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
    keys:"10 × 144 √ =", expect:"120", status:VALIDATED,
    notes:"Physically confirmed after the audit." });
T({ id:"CORE-17", category:"Core Arithmetic", name:"1/x as operand #2: 10 × 4 Conv ÷ =",
    keys:"10 × 4 Conv ÷ =", expect:"2.5", status:VALIDATED, notes:"Physically confirmed before V9.23.12." });
T({ id:"CORE-18", category:"Core Arithmetic", name:"x² as operand #2: 10 × 2 Conv √ =",
    keys:"10 × 2 Conv √ =", expect:"40", status:VALIDATED, notes:"Physically confirmed before V9.23.12." });
T({ id:"CORE-14", category:"Core Arithmetic", name:"Plain scalar division 10 ÷ 0 =",
    keys:"10 ÷ 0 =", expect:"Error 1", status:VALIDATED,
    notes:"Physically confirmed before V9.23.11." });
T({ id:"CORE-15", category:"Core Arithmetic", name:"Operator with no second number: 5 × =",
    keys:"5 × =", expect:"5", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13: 5 × = shows 5 (NOT 25). The missing operand is not duplicated." });
T({ id:"CORE-16", category:"Core Arithmetic", name:"Repeated equals: 5 × 5 = =",
    keys:"5 × 5 = =", expect:"125", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13: first = 25, second = 125." });
T({ id:"CORE-23", category:"Core Arithmetic", name:"Single C then = restores the completed result",
    keys:"5 × 5 = C =", expect:"25", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13 release: C shows 0, the next = restores 25 (it does NOT replay × 5)." });
T({ id:"CORE-24", category:"Core Arithmetic", name:"Single C, = restores, next = replays",
    keys:"5 × 5 = C = =", expect:"125", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13 release: 25 → C → 25 → 125." });
T({ id:"CORE-25", category:"Core Arithmetic", name:"Double C destroys the completed result and replay",
    keys:"5 × 5 = C C =", expect:"0", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13 release: final = shows 0. Trestle correctly keeps the result cleared; only the cleared-display text differs (R10, same cause as SPEC-01)." });
T({ id:"CORE-26", category:"Core Arithmetic", name:"AC destroys the completed result and replay",
    keys:"5 × 5 = Conv × =", expect:"0", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13 release: final = shows 0. Trestle correctly keeps the result cleared; only the cleared-display text differs (R10, same cause as SPEC-01)." });
T({ id:"CORE-19", category:"Core Arithmetic", name:"New digit after a completed result starts fresh",
    steps:[ {keys:"5 × 5 =", expect:"25"}, {keys:"3", expect:"3"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.13." });
T({ id:"CORE-20", category:"Core Arithmetic", name:"Operator replacement before operand #2: 5 × + 2 =",
    keys:"5 × + 2 =", expect:"7", status:VALIDATED,
    notes:"Physically confirmed before V9.23.13: + replaces the pending × because operand #2 was not entered." });
T({ id:"CORE-21", category:"Core Arithmetic", name:"Repeated equals with addition: 5 + 2 = =",
    steps:[ {keys:"5 + 2 =", expect:"7"}, {keys:"=", expect:"9"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.13." });
T({ id:"CORE-22", category:"Core Arithmetic", name:"Replay state updates to the newest completed operation",
    steps:[ {keys:"5 × 5 =", expect:"25"}, {keys:"+ 2 =", expect:"27"}, {keys:"=", expect:"29"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.13: the replay becomes + 2, replacing × 5." });

/* ========================== DISPLAY PRECISION (R7) ======================== */
/* Physical LCD: seven digit positions; a displayed leading 0 counts; the minus sign
   does not; trailing zeros dropped; half rounds up. Internal precision is kept. */
T({ id:"PREC-01", category:"Display Precision", name:"Halfway rounding: 777 ÷ 64 = (exact 12.140625)",
    keys:"777 ÷ 64 =", expect:"12.14063", status:VALIDATED, notes:"Physically confirmed before V9.23.24 (7-position LCD rule)." });
T({ id:"PREC-02", category:"Display Precision", name:"Leading zeros use positions: 1 ÷ 3000 =",
    keys:"1 ÷ 3000 =", expect:"0.000333", status:VALIDATED, notes:"Physically confirmed before V9.23.24 (7-position LCD rule)." });
T({ id:"PREC-03", category:"Display Precision", name:"Minus sign does not use a position: 2 − 7 = ÷ 3 =",
    keys:"2 − 7 = ÷ 3 =", expect:"-1.666667", status:VALIDATED, notes:"Physically confirmed before V9.23.24 (7-position LCD rule)." });
T({ id:"PREC-04", category:"Display Precision", name:"Full internal precision kept: 100 ÷ 3 = − 33 =",
    keys:"100 ÷ 3 = − 33 =", expect:"0.333333", status:VALIDATED, notes:"Physically confirmed before V9.23.24 (7-position LCD rule). The rounded display (33.33333) is not reused (that would give 0.33333)." });
T({ id:"PREC-05", category:"Display Precision", name:"Leading 0 uses a position: 1 ÷ 3 =",
    keys:"1 ÷ 3 =", expect:"0.333333", status:VALIDATED, notes:"Physically confirmed before V9.23.24 (7-position LCD rule)." });

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
    keys:"120 Cu Feet ÷ 30 Sq", expect:"30 sq.", status:VALIDATED,
    notes:"Physical display observed during the V9.23.5 investigation." });
T({ id:"DIM-09", category:"Dimensional Arithmetic", name:"Volume ÷ Length → Area (120 cu. ft. ÷ 10 ft)",
    keys:"120 Cu Feet ÷ 10 Feet =", expect:"12 sq. ft.", match:"units-loose", status:VALIDATED,
    notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-10", category:"Dimensional Arithmetic", name:"Area × Length → Volume from Sq entry",
    keys:"24 Sq Feet × 6 Feet =", expect:"144 cu. ft.", match:"units-loose", status:VALIDATED,
    notes:"Physically confirmed after the audit. Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-11", category:"Dimensional Arithmetic", name:"Length × Volume is an error",
    keys:"10 Feet × 3 Cu Feet =", expect:"Error 3", status:VALIDATED,
    notes:"Physically confirmed. Do NOT assume a higher-dimensional result." });
T({ id:"DIM-12", category:"Dimensional Arithmetic", name:"Area ÷ Area → scalar",
    keys:"24 Sq Feet ÷ 6 Sq Feet =", expect:"4", status:VALIDATED });
T({ id:"DIM-13", category:"Dimensional Arithmetic", name:"Volume ÷ Volume → scalar",
    keys:"120 Cu Feet ÷ 10 Cu Feet =", expect:"12", status:VALIDATED });
T({ id:"DIM-14", category:"Dimensional Arithmetic", name:"Length + plain number keeps length",
    keys:"5 Feet + 3 =", expect:"8 ft 0 in", status:VALIDATED });
T({ id:"DIM-15", category:"Dimensional Arithmetic", name:"Plain number + length is an error (asymmetric)",
    keys:"3 + 5 Feet =", expect:"Error 3", status:VALIDATED,
    notes:"This asymmetry is physically validated. Do not normalize it." });
T({ id:"DIM-16", category:"Dimensional Arithmetic", name:"Length − plain number keeps length",
    keys:"5 Feet − 3 =", expect:"2 ft 0 in", status:VALIDATED });
T({ id:"DIM-17", category:"Dimensional Arithmetic", name:"Area + plain number keeps area",
    keys:"20 Sq Feet + 5 =", expect:"25 sq. ft.", match:"units-loose", status:VALIDATED, notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-18", category:"Dimensional Arithmetic", name:"Volume + plain number keeps volume",
    keys:"20 Cu Feet + 5 =", expect:"25 cu. ft.", match:"units-loose", status:VALIDATED, notes:"Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-19", category:"Dimensional Arithmetic", name:"Length chaining: 10 ft + 2 ft = + 1 ft =",
    keys:"10 Feet + 2 Feet = + 1 Feet =", expect:"13 ft 0 in", status:VALIDATED });
T({ id:"DIM-20", category:"Dimensional Arithmetic", name:"Sq armed then + : 5 Sq + 3 Feet =",
    keys:"5 Sq + 3 Feet =", expect:"Error 3", status:VALIDATED,
    notes:"Physically observed result only. Do not infer more behavior from this sequence." });
T({ id:"DIM-21", category:"Dimensional Arithmetic", name:"Length ÷ 0 is Error 1",
    keys:"10 Feet ÷ 0 =", expect:"Error 1", status:VALIDATED });
T({ id:"DIM-22", category:"Dimensional Arithmetic", name:"Computed volume ÷ length (10×8×3 = ÷ 10 ft)",
    keys:"10 Feet × 8 Feet × 3 Feet = ÷ 10 Feet =", expect:"24 sq. ft.", match:"units-loose", status:VALIDATED,
    notes:"Same physically validated volume ÷ length rule reached through a computed volume. Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01, so this test only fails for the math/state problem." });
T({ id:"DIM-23", category:"Dimensional Arithmetic", name:"Area × Area", keys:"4 Sq Feet × 2 Sq Feet =",
    expect:"Error 3", status:VALIDATED,
    notes:"Physically confirmed before V9.23.11. The Error 3 rule exists in V9.23.11, but the × after a Sq-entered area is still ignored by the R1 gate, so the calculation never reaches it." });
T({ id:"DIM-24", category:"Dimensional Arithmetic", name:"Plain number ÷ length", keys:"10 ÷ 2 Feet =",
    expect:"Error 3", status:VALIDATED, notes:"Physically confirmed before V9.23.11." });
T({ id:"DIM-25", category:"Dimensional Arithmetic", name:"Length ÷ area", keys:"10 Feet ÷ 2 Sq Feet =",
    expect:"Error 3", status:VALIDATED, notes:"Physically confirmed before V9.23.11." });
T({ id:"DIM-27", category:"Dimensional Arithmetic", name:"Dimensional repeated equals: 10 ft + 2 ft = =",
    steps:[ {keys:"10 Feet + 2 Feet =", expect:"12 ft 0 in"}, {keys:"=", expect:"14 ft 0 in"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.13: the replayed operand keeps its dimensional state." });
T({ id:"DIM-28", category:"Dimensional Arithmetic", name:"R2: negative length result 3 ft − 5 =",
    keys:"3 Feet − 5 =", expect:"-2 ft 0 in", status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-29", category:"Dimensional Arithmetic", name:"R2: decimal scalar inherits feet 5 ft + 2.5 =",
    keys:"5 Feet + 2.5 =", expect:"7 ft 6 in", status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-30", category:"Dimensional Arithmetic", name:"R2: area − scalar 20 sq. ft. − 5 =",
    keys:"20 Sq Feet − 5 =", expect:"15 sq. ft.", match:"units-loose", status:VALIDATED, notes:"Physically confirmed before V9.23.14. Unit punctuation (sq. ft. / cu. ft. vs sq ft / cu ft) is checked separately by FMT-01, so this test isolates the R2 arithmetic." });
T({ id:"DIM-31", category:"Dimensional Arithmetic", name:"R2: volume − scalar 20 cu. ft. − 5 =",
    keys:"20 Cu Feet − 5 =", expect:"15 cu. ft.", match:"units-loose", status:VALIDATED, notes:"Physically confirmed before V9.23.14. Unit punctuation (sq. ft. / cu. ft. vs sq ft / cu ft) is checked separately by FMT-01, so this test isolates the R2 arithmetic." });
T({ id:"DIM-32", category:"Dimensional Arithmetic", name:"R2: scalar inherits inches 10 in + 2 =",
    keys:"10 Inch + 2 =", expect:"12 in", status:VALIDATED, notes:"Physically confirmed before V9.23.14. The plain 2 means 2 inches." });
T({ id:"DIM-33", category:"Dimensional Arithmetic", name:"R2: scalar inherits metres 2 m + 3 =",
    keys:"2 m + 3 =", expect:"5 m", status:VALIDATED, notes:"Physically confirmed before V9.23.14. The plain 3 means 3 metres." });
T({ id:"DIM-34", category:"Dimensional Arithmetic", name:"Inch-only result stays in inches: 10 in + 2 in =",
    keys:"10 Inch + 2 Inch =", expect:"12 in", status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-35", category:"Dimensional Arithmetic", name:"Metre result stays in metres: 2 m + 3 m =",
    keys:"2 m + 3 m =", expect:"5 m", status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-36", category:"Dimensional Arithmetic", name:"R2: mixed ft-in first operand → scalar inherits FEET",
    keys:"5 Feet 6 Inch + 3 =", expect:"8 ft 6 in", status:VALIDATED, notes:"Physically confirmed before V9.23.14. The 3 means 3 ft, not 3 in." });
T({ id:"DIM-37", category:"Dimensional Arithmetic", name:"R2: computed result keeps unit context for chaining",
    steps:[ {keys:"10 Feet + 2 Feet =", expect:"12 ft 0 in"}, {keys:"+ 3 =", expect:"15 ft 0 in"} ], status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-38", category:"Dimensional Arithmetic", name:"R2: repeated equals replays the inherited +3 ft",
    steps:[ {keys:"5 Feet + 3 =", expect:"8 ft 0 in"}, {keys:"=", expect:"11 ft 0 in"} ], status:VALIDATED, notes:"Physically confirmed before V9.23.14." });
T({ id:"DIM-39", category:"Dimensional Arithmetic", name:"Inch result keeps inch context when chained: 10 in + 2 in = + 3 =",
    steps:[ {keys:"10 Inch + 2 Inch =", expect:"12 in"}, {keys:"+ 3 =", expect:"15 in"} ], status:VALIDATED, notes:"Physically confirmed before V9.23.15." });
T({ id:"DIM-40", category:"Dimensional Arithmetic", name:"Metre repeated equals replays the inherited +3 m: 2 m + 3 = =",
    steps:[ {keys:"2 m + 3 =", expect:"5 m"}, {keys:"=", expect:"8 m"} ], status:VALIDATED, notes:"Physically confirmed before V9.23.15." });
T({ id:"DIM-41", category:"Dimensional Arithmetic", name:"Fractional-inch entry: scalar inherits inches 8 3/32 in + 2 =",
    keys:"8 Inch 3 / 32 + 2 =", expect:"10 3/32 in", status:VALIDATED, notes:"Physically confirmed before V9.23.15. The plain 2 means 2 inches." });
T({ id:"DIM-42", category:"Dimensional Arithmetic", name:"Decimal-inch entry: scalar inherits inches 8.5 in + 2 =",
    keys:"8.5 Inch + 2 =", expect:"10.5 in", status:VALIDATED, notes:"Physically confirmed before V9.23.15." });
T({ id:"DIM-43", category:"Dimensional Arithmetic", name:"Fractional-inch operand #1 keeps fractional display: 8 3/32 in + 2.5 =",
    keys:"8 Inch 3 / 32 + 2.5 =", expect:"10 19/32 in", status:VALIDATED, notes:"Physically confirmed before V9.23.15. The decimal 2.5 inherits inches but does not force decimal display." });
T({ id:"DIM-44", category:"Dimensional Arithmetic", name:"Decimal-inch operand #1 keeps decimal display: 8.5 in + 2 in =",
    keys:"8.5 Inch + 2 Inch =", expect:"10.5 in", status:VALIDATED, notes:"Physically confirmed before V9.23.15." });
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
T({ id:"CONV-20", category:"Unit Conversions", name:"Conversion chain 28 ft 2-19/32 in → ft → in → fractional in",
    steps:[ {keys:"28 Feet 2 Inch 19 / 32 Conv Feet", expect:"28.21615 ft"}, {keys:"Conv Inch", expect:"338.5938 in"}, {keys:"Conv Inch", expect:"338 19/32 in"} ],
    status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"CONV-21", category:"Unit Conversions", name:"Conv Feet on operand #2 keeps the pending ×: 10 ft × 2 Conv Feet =",
    keys:"10 Feet × 2 Conv Feet =", expect:"20 ft", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ================================ FRACTIONS ============================== */
T({ id:"FRAC-01", category:"Fractions", name:"Numerator stays visible after /",
    keys:"2 Inch 19 /", expect:"2-19/ in", status:BASELINE, notes:"V9.17: numerator remains visible (2-19/)." });
T({ id:"FRAC-02", category:"Fractions", name:"8 in 3/32 + 27.5 in = (inch-only sum stays in inches)",
    keys:"8 Inch 3 / 32 + 27.5 Inch =", expect:"35 19/32 in", status:VALIDATED,
    notes:"Physically confirmed before V9.23.15. Previously a TRESTLE BASELINE expecting 2 ft 11 19/32 in (the V9.23.5 display), which the physical calculator does not show." });
T({ id:"FRAC-03", category:"Fractions", name:"25 ft 3 in + 8-3/32 in + 27.5 in = (V8.3 history example)",
    keys:"25 Feet 3 Inch + 8 Inch 3 / 32 + 27.5 Inch =", expect:"28 ft 2 19/32 in", status:BASELINE,
    notes:"Same value as the V9.17 physical benchmark 28 ft 2-19/32 in." });
T({ id:"CONV-22", category:"Unit Conversions", name:"Conv Feet completes the pending calculation immediately: 10 ft × 2 Conv Feet",
    steps:[ {keys:"10 Feet × 2 Conv Feet", expect:"20 ft"}, {keys:"=", expect:"20 ft"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.22. 20 ft appears BEFORE =, and = does not repeat the ×2. The 2 stays a plain number (not 2 ft)." });
T({ id:"CONV-23", category:"Unit Conversions", name:"Conv Feet completes a plain-number calculation: 5 × 2 Conv Feet",
    steps:[ {keys:"5 × 2 Conv Feet", expect:"10 ft"}, {keys:"=", expect:"10 ft"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.22." });
T({ id:"FRAC-05", category:"Fractions", name:"Live feet + inch fraction keeps its text through +",
    steps:[ {keys:"6 Feet 8 Inch 9 / 16", expect:"6 ft 8-9/16 in"}, {keys:"+", expect:"6 ft 8 9/16 in"} ], status:BASELINE,
    notes:"V9.23.26: protects the canonical live and finalized text while the display shows the structured feet/inch layout." });
T({ id:"FRAC-06", category:"Fractions", name:"Live inch-only fraction text",
    keys:"8 Inch 9 / 16", expect:"8-9/16 in", status:BASELINE,
    notes:"V9.23.26: canonical live text for the structured inch/fraction display." });
T({ id:"FRAC-04", category:"Fractions", name:"Fraction finished with Inch: 3 / 32 Inch",
    keys:"3 / 32 Inch", expect:"0 3/32 in", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ================================== ROOF ================================= */
T({ id:"ROOF-01", category:"Roof", name:"12 ft Run, 5 ft Rise → Diag",
    keys:"12 Feet Run 5 Feet Rise Diag", expect:"DIAG 13 ft 0 in", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers). Previously recorded without the DIAG identifier." });
T({ id:"ROOF-02", category:"Roof", name:"12 ft Run, 5 ft Rise → Pitch",
    keys:"12 Feet Run 5 Feet Rise Pitch", expect:"PTCH 22.61986°", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers). Identifier is PTCH." });
T({ id:"ROOF-03", category:"Roof", name:"12 ft Run, 5 ft Rise → Hip/V",
    keys:"12 Feet Run 5 Feet Rise Hip/V", expect:"H/V 17 ft 8-19/64 in", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers). Identifier is H/V." });
T({ id:"ROOF-04", category:"Roof", name:"Recall Rise and Run",
    steps:[ {keys:"12 Feet Run 5 Feet Rise Rise", expect:"RISE 5 ft 0 in"}, {keys:"Run", expect:"RUN 12 ft 0 in"} ],
    status:VALIDATED, notes:"V9.0 expected recalls. Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers)." });
T({ id:"ROOF-05", category:"Roof", name:"14 ft 7 in Run, 6 ft 3 in Rise → Hip/V",
    keys:"14 Feet 7 Inch Run 6 Feet 3 Inch Rise Hip/V", expect:"H/V 21 ft 6-39/64 in", status:VALIDATED, notes:"V9.3 physical target; H/V identifier per Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers)." });
T({ id:"ROOF-06", category:"Roof", name:"Unitless value then Run: 12 Run",
    keys:"12 Run", expect:"RUN 12", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"ROOF-08", category:"Roof", name:"Unitless value then Rise: 5 Rise",
    keys:"5 Rise", expect:"RISE 5", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers). Unitless stays unitless." });
T({ id:"ROOF-09", category:"Roof", name:"Diag with no roof data",
    keys:"Diag", expect:"DIAG 0", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers)." });
T({ id:"ROOF-10", category:"Roof", name:"Unitless Run and Rise are stored: 12 Run 5 Rise Diag",
    steps:[ {keys:"12 Run", expect:"RUN 12"}, {keys:"5 Rise", expect:"RISE 5"}, {keys:"Diag", expect:"DIAG 13"} ],
    status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.19). Unitless roof geometry stays unitless." });
T({ id:"ROOF-11", category:"Roof", name:"Diag as operand #2: 5 ft × Diag =",
    steps:[ {keys:"12 Feet Run 5 Feet Rise 5 Feet × Diag", expect:"DIAG 13 ft 0 in"}, {keys:"=", expect:"65 sq. ft."} ],
    match:"units-loose", status:VALIDATED,
    notes:"Physically confirmed Sept. 23, 2026 (V9.23.19). Unit punctuation (sq. ft. vs sq ft) is checked separately by FMT-01." });
T({ id:"ROOF-07", category:"Roof", name:"Roof recall during arithmetic: 5 ft × Diag",
    keys:"12 Feet Run 5 Feet Rise 5 Feet × Diag", expect:"DIAG 13 ft 0 in", status:VALIDATED,
    notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification). Display immediately after Diag." });

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
T({ id:"JACK-07", category:"Jack / Irregular Jack", name:"AC restores the 16 in Jack O.C.",
    keys:"24 Inch Stor Jack Conv × 12 Feet Run 5 Feet Rise Jack", expect:"Jk 1 11 ft 6 43/64 in", status:VALIDATED,
    notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification). Double C, by contrast, keeps a custom O.C. (physical: Jk 1 10 ft 10 in)." });

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
    keys:"10 Feet × 30 Sine =", expect:"5 ft 0 in", status:VALIDATED,
    notes:"Physically confirmed after the audit." });
T({ id:"TRIG-11", category:"Trig", name:"Cos as operand #2: 10 ft × 60 Cos =",
    keys:"10 Feet × 60 Cos =", expect:"5 ft 0 in", status:VALIDATED, notes:"Physically confirmed before V9.23.13." });
T({ id:"TRIG-12", category:"Trig", name:"Tan as operand #2: 10 ft × 45 Tan =",
    keys:"10 Feet × 45 Tan =", expect:"10 ft 0 in", status:VALIDATED, notes:"Physically confirmed before V9.23.13." });

/* ============================== CIRCLE / ARC ============================= */
T({ id:"CIRC-01", category:"Circle / Arc", name:"10 in Circ → DIA", keys:"10 Inch Circ", expect:"DIA 10 in", status:VALIDATED });
T({ id:"CIRC-02", category:"Circle / Arc", name:"Circ → AREA", keys:"10 Inch Circ Circ", expect:"AREA 78.53982 sq. in.",
    status:VALIDATED });
T({ id:"CIRC-03", category:"Circle / Arc", name:"Circ → CIRC", keys:"10 Inch Circ Circ Circ", expect:"CIRC 31 27/64 in", status:VALIDATED });
T({ id:"CIRC-04", category:"Circle / Arc", name:"Circ cycles back to DIA", keys:"10 Inch Circ Circ Circ Circ", expect:"DIA 10 in", status:VALIDATED });
T({ id:"CIRC-05", category:"Circle / Arc", name:"Arc 90°", keys:"10 Inch Circ 90 Conv Circ", expect:"ARC 7 55/64 in", status:VALIDATED });
T({ id:"CIRC-06", category:"Circle / Arc", name:"Arc 180°", keys:"10 Inch Circ 180 Conv Circ", expect:"ARC 15 45/64 in", status:VALIDATED });
T({ id:"CIRC-07", category:"Circle / Arc", name:"Arc 360°", keys:"10 Inch Circ 360 Conv Circ", expect:"ARC 31 27/64 in", status:VALIDATED });
T({ id:"CIRC-08", category:"Circle / Arc", name:"One C keeps the circle diameter for Arc",
    keys:"10 Inch Circ C 90 Conv Circ", expect:"ARC 7 55/64 in", status:VALIDATED, notes:"V9.9: one C preserves the stored diameter." });
T({ id:"CIRC-09", category:"Circle / Arc", name:"Metric diameter area: 1 m Circ Circ",
    keys:"1 m Circ Circ", expect:"AREA 0.785398 sq. m", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

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
    keys:"10 Inch Circ Circ Stor 1", expect:"M-1 78.53982 sq. in.", status:VALIDATED,
    notes:"Physically confirmed. Since V9.23.20 the AREA label is no longer stored; only R7 precision differs (78.539816 vs 78.53982)." });
T({ id:"MEM-07", category:"Memory", name:"2 × stored circle area",
    keys:"10 Inch Circ Circ Stor 1 C C 2 × Rcl 1 =", expect:"157.0796 sq. in.", status:VALIDATED,
    notes:"Physically confirmed. Since V9.23.21 the square-inch unit is kept through Stor/Rcl and ×; only R7 precision differs (157.079633 vs 157.0796)." });
T({ id:"MEM-09", category:"Memory", name:"Stored roof result keeps its value, not its label",
    keys:"12 Feet Run 5 Feet Rise Diag Stor 1 Rcl 1", expect:"M-1 13 ft 0 in", status:VALIDATED,
    notes:"Physically confirmed Sept. 23, 2026 (V9.23.19). The DIAG identifier is display only; the memory display should not include it." });
T({ id:"MEM-10", category:"Memory", name:"Stor completes pending +: 10 + 5 Stor 1 Rcl 1",
    keys:"10 + 5 Stor 1 Rcl 1", expect:"M-1 15", status:VALIDATED, notes:"Physically confirmed before V9.23.20." });
T({ id:"MEM-11", category:"Memory", name:"Stored Jack result keeps its value, not its label",
    keys:"12 Feet Run 5 Feet Rise Jack Stor 1 Rcl 1", expect:"M-1 11 ft 6 43/64 in", status:VALIDATED, notes:"Physically confirmed before V9.23.20. The Jk identifier is not retained." });
T({ id:"MEM-12", category:"Memory", name:"Stor after a division-by-zero calculation shows Error 1",
    keys:"10 ÷ 0 Stor 1", expect:"Error 1", status:VALIDATED, notes:"Physically confirmed before V9.23.20. The error is displayed and nothing is stored." });
T({ id:"MEM-08", category:"Memory", name:"Stor completes pending arithmetic: 10 × 5 Stor 1",
    keys:"10 × 5 Stor 1", expect:"M-1 50", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ============================ DISPLAY FORMAT ============================= */
T({ id:"FMT-01", category:"Display Format", name:"Computed area label: 3 ft (M-1) × 4 ft = shows 'sq. ft.'",
    keys:"3 Feet Stor 1 4 Feet × Rcl 1 =", expect:"12 sq. ft.", status:VALIDATED,
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
T({ id:"PCT-07", category:"Percent", name:"Repeated standalone %",
    keys:"10 % %", expect:"Error", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"PCT-08", category:"Percent", name:"Dimensional percent operand: 10 ft + 5 ft %",
    keys:"10 Feet + 5 Feet %", expect:"Error 5", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"PCT-09", category:"Percent", name:"Standalone dimensional value as a percentage: 5 ft %",
    keys:"5 Feet %", expect:"Error 5", status:VALIDATED, notes:"Physically confirmed before V9.23.23. Error 5 appears immediately on %." });
T({ id:"PCT-10", category:"Percent", name:"Dimensional percentage with ×: 10 ft × 5 ft %",
    keys:"10 Feet × 5 Feet %", expect:"Error 5", status:VALIDATED, notes:"Physically confirmed before V9.23.23. Error 5 appears immediately on %." });
T({ id:"PCT-11", category:"Percent", name:"Dimensional percentage after a plain number: 10 + 5 ft %",
    keys:"10 + 5 Feet %", expect:"Error 5", status:VALIDATED, notes:"Physically confirmed before V9.23.23. Error 5 appears immediately on %." });
T({ id:"PCT-12", category:"Percent", name:"Plain percentage after a length stays valid: 10 ft + 5 %",
    keys:"10 Feet + 5 %", expect:"10 ft 6 in", status:VALIDATED, notes:"Physically confirmed before V9.23.23." });
T({ id:"PCT-13", category:"Percent", name:"Error 5 is not latched: 5 ft %, then 2 + 2 =",
    steps:[ {keys:"5 Feet %", expect:"Error 5"}, {keys:"2 + 2 =", expect:"4"} ], status:VALIDATED,
    notes:"Physically confirmed before V9.23.23: no C needed after Error 5." });

/* ================================== EXP ================================== */
T({ id:"EXP-01", category:"EXP", name:"2 EXP 3 =", keys:"2 Conv / 3 =", expect:"2000", status:VALIDATED,
    notes:"Physically confirmed display: 2000 (no comma). Trestle shows 2,000 by design." });
T({ id:"EXP-02", category:"EXP", name:"2 EXP −3 =", keys:"2 Conv / 3 Conv − =", expect:"0.002", status:VALIDATED,
    notes:"Physically confirmed: 2 → Conv → / → 3 → Conv → − → = displays 0.002." });
T({ id:"EXP-03", category:"EXP", name:"1.5 EXP 4 =", keys:"1.5 Conv / 4 =", expect:"15000", status:VALIDATED, notes:"Physical display has no comma (permanent rule)." });
T({ id:"EXP-04", category:"EXP", name:"AC during EXP entry",
    keys:"2 Conv / 3 Conv × 5 =", expect:"5", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ================================== DMS ================================== */
T({ id:"DMS-01", category:"DMS", name:"30.5 d:m:s cycles DEG → DMS → DEG",
    steps:[ {keys:"30.5 d:m:s", expect:"DEG 30.5°"}, {keys:"d:m:s", expect:"DMS 30.30.00°"}, {keys:"d:m:s", expect:"DEG 30.5°"} ],
    status:VALIDATED });
T({ id:"DMS-02", category:"DMS", name:"30.5125° → DMS", keys:"30.5125 d:m:s d:m:s", expect:"DMS 30.30.45°", status:VALIDATED });
T({ id:"DMS-03", category:"DMS", name:"Seconds round: 30.5126°", keys:"30.5126 d:m:s d:m:s", expect:"DMS 30.30.45°", status:VALIDATED });
T({ id:"DMS-04", category:"DMS", name:"Seconds round: 30.5127°", keys:"30.5127 d:m:s d:m:s", expect:"DMS 30.30.46°", status:VALIDATED });
T({ id:"DMS-06", category:"DMS", name:"A new function result supersedes old DMS state (no clear)",
    keys:"30.5 d:m:s 45 Sine d:m:s", expect:"DEG 0.707107°", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"DMS-07", category:"DMS", name:"Double C clears DMS state",
    keys:"30.5 d:m:s C C 45 Sine d:m:s", expect:"DEG 0.707107°", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });
T({ id:"DMS-05", category:"DMS", name:"AC clears DMS state",
    keys:"30.5 d:m:s Conv × 45 Sine d:m:s", expect:"DEG 0.707107°", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ========================= SPECIAL / CLEAR BEHAVIOR ====================== */
T({ id:"SPEC-01", category:"Special / Clear Behavior", name:"AC display", keys:"12 Feet Run 5 Feet Rise Conv ×", expect:"0",
    status:VALIDATED, notes:"V9.12 physical benchmark." });
T({ id:"SPEC-02", category:"Special / Clear Behavior", name:"AC clears roof: Diag afterwards", keys:"12 Feet Run 5 Feet Rise Conv × Diag", expect:"DIAG 0",
    status:VALIDATED, notes:"V9.12 physical benchmark." });
T({ id:"SPEC-03", category:"Special / Clear Behavior", name:"One C keeps roof geometry",
    keys:"12 Feet Run 5 Feet Rise C Diag", expect:"DIAG 13 ft 0 in", status:BASELINE,
    notes:"V9.x: one C keeps stored roof geometry (code comment in clearKey). DIAG identifier added per Physically confirmed Sept. 23, 2026 (V9.23.18 roof identifiers)." });
T({ id:"SPEC-05", category:"Special / Clear Behavior", name:"Error 3 is not latched: new entry starts fresh without C",
    steps:[ {keys:"3 + 5 Feet +", expect:"Error 3"}, {keys:"2 + 2 =", expect:"4"} ], status:VALIDATED,
    notes:"Physically confirmed: while Error 3 is displayed, 2 + 2 = gives 4 without pressing C." });
T({ id:"SPEC-06", category:"Special / Clear Behavior", name:"Power-on display (no keys pressed)",
    keys:"", expect:"0", status:VALIDATED,
    notes:"Physically confirmed: turning the calculator on shows a plain 0." });
T({ id:"SPEC-07", category:"Special / Clear Behavior", name:"Backspace lifecycle (digits and a pending fraction)",
    steps:[ {keys:"1234 ⌫", expect:"123"}, {keys:"⌫ ⌫", expect:"1"},
            {keys:"C C 6 Feet 8 Inch 9 / 16 ⌫", expect:"6 ft 8-9/1 in"}, {keys:"⌫", expect:"6 ft 8-9/ in"}, {keys:"⌫", expect:"6 ft 8 in"} ],
    status:BASELINE, notes:"V9.23.27: protects ⌫ behavior after the button moved above the display. Values are the V9.23.26 behavior (unchanged)." });
T({ id:"SPEC-04", category:"Special / Clear Behavior", name:"C C then Diag (roof cleared)",
    keys:"12 Feet Run 5 Feet Rise C C Diag", expect:"DIAG 0", status:VALIDATED, notes:"Physically confirmed Sept. 23, 2026 (V9.23.16 reclassification)." });

/* ======================= OTHER CALCULATORS — UI BASELINE ==================== */
/* V9.23.28: these open a non-Trestle calculator (view:) and use its real form
   controls. Each step: actions to perform, then the element to read and the
   text expected. The runner contains no calculator formulas. */
T({ id:"PCTUI-01", category:"Percentages (UI)", view:"percentages", name:"Shopping fields start honest: price and discount empty, tax a real 8.25",
    steps:[
      { keys:"Original Price field", read:"field:#price", expect:"value=[] placeholder=[]" },
      { keys:"Discount field", read:"field:#discount", expect:"value=[] placeholder=[]" },
      { keys:"Sales Tax field", read:"field:#tax", expect:"value=[8.25] placeholder=[]" },
      { keys:"Sale Price before entry", read:"#salePrice", expect:"—" } ],
    status:BASELINE, notes:"V9.23.28: no numeric placeholders; 8.25 is a real value the calculator uses." });
T({ id:"PCTUI-02", category:"Percentages (UI)", view:"percentages", name:"79.99 with 20% off, then add 8.25% sales tax",
    steps:[
      { keys:"Price 79.99 · Discount 20", actions:[["fill","#price","79.99"],["fill","#discount","20"]], read:"#salePrice", expect:"$63.99" },
      { keys:"Add sales tax (8.25 default)", actions:[["click","#taxToggle"]], read:"#withTax", expect:"$69.27" } ],
    status:BASELINE, notes:"V9.23.28: the default 8.25% tax is used as soon as tax is enabled." });

/* ======================= V9.24.0 — Tip Calculator ======================= */
/* view:"tip" tests use the real Tip Calculator controls; the runner contains no tip math. */
T({ id:"TIP-01", category:"Tip (UI)", view:"tip", name:"Starts empty with a real 18% selected",
    steps:[ {keys:"Subtotal field", read:"field:#tipSubtotal", expect:"value=[] placeholder=[]"},
            {keys:"Tax field", read:"field:#tipTax", expect:"value=[] placeholder=[]"},
            {keys:"Tip label", read:"#tipLabel", expect:"18% TIP"},
            {keys:"Total before entry", read:"#tipTotal", expect:"—"} ], status:BASELINE });
T({ id:"TIP-02", category:"Tip (UI)", view:"tip", name:"Shortcut benchmark: 43.67 + 3.61 tax at 18% (exact tip 7.8606)",
    steps:[ {keys:"43.67 · 3.61 · 18%", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","3.61"]], read:"#tipAmount", expect:"$7.86"},
            {keys:"Total", read:"#tipTotal", expect:"$55.14"} ], status:BASELINE, notes:"Matches Tim's iPhone Tip Shortcut. Tim's Calculators rule: tip = pre-tax subtotal × %, truncated down to a whole cent; total uses that same tip." });
T({ id:"TIP-03", category:"Tip (UI)", view:"tip", name:"Switching percentage updates immediately (20%, exact 8.734)",
    steps:[ {keys:"43.67 · 3.61 · tap 20%", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","3.61"],["click",'[data-tip-pct="20"]']], read:"#tipLabel", expect:"20% TIP"},
            {keys:"Tip", read:"#tipAmount", expect:"$8.73"}, {keys:"Total", read:"#tipTotal", expect:"$56.01"} ], status:BASELINE });
T({ id:"TIP-04", category:"Tip (UI)", view:"tip", name:"Zero tax and blank tax",
    steps:[ {keys:"43.67 · tax 0", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","0"]], read:"#tipTotal", expect:"$51.53"},
            {keys:"tax cleared", actions:[["fill","#tipTax",""]], read:"#tipTotal", expect:"$51.53"} ], status:BASELINE });
T({ id:"TIP-05", category:"Tip (UI)", view:"tip", name:"Custom 17.5% (exact 7.64225)",
    steps:[ {keys:"43.67 · 3.61 · Custom 17.5", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","3.61"],["click",'[data-tip-pct="custom"]'],["fill","#tipCustom","17.5"]], read:"#tipAmount", expect:"$7.64"},
            {keys:"Total", read:"#tipTotal", expect:"$54.92"} ], status:BASELINE });
T({ id:"TIP-06", category:"Tip (UI)", view:"tip", name:"Tip truncates down: 10.25 at 18% (exact 1.845)",
    steps:[ {keys:"10.25 · tax 0.00 · 18%", actions:[["fill","#tipSubtotal","10.25"],["fill","#tipTax","0.00"]], read:"#tipAmount", expect:"$1.84"},
            {keys:"Total uses the same $1.84", read:"#tipTotal", expect:"$12.09"} ], status:BASELINE, notes:"Tim's required benchmark. Tim's Calculators rule: tip = pre-tax subtotal × %, truncated down to a whole cent; total uses that same tip." });
T({ id:"TIP-07", category:"Tip (UI)", view:"tip", name:"Replacing a value and $/comma entry",
    steps:[ {keys:"100 then $1,250.50", actions:[["fill","#tipSubtotal","100"],["fill","#tipSubtotal","$1,250.50"]], read:"#tipAmount", expect:"$225.09"},
            {keys:"Total", read:"#tipTotal", expect:"$1,475.59"} ], status:BASELINE });
T({ id:"TIP-08", category:"Tip (UI)", view:"tip", name:"Tip truncates down: 10.75 at 18% (exact 1.935)",
    steps:[ {keys:"10.75 · tax 0.00 · 18%", actions:[["fill","#tipSubtotal","10.75"],["fill","#tipTax","0.00"]], read:"#tipAmount", expect:"$1.93"},
            {keys:"Total uses the same $1.93", read:"#tipTotal", expect:"$12.68"} ], status:BASELINE, notes:"Tim's required benchmark. Tim's Calculators rule: tip = pre-tax subtotal × %, truncated down to a whole cent; total uses that same tip." });
T({ id:"TIP-09", category:"Tip (UI)", view:"tip", name:"Never rounds up, even at 0.82 of a cent: 0.99 at 18% (exact 0.1782)",
    steps:[ {keys:"0.99 · 18%", actions:[["fill","#tipSubtotal","0.99"]], read:"#tipAmount", expect:"$0.17"},
            {keys:"Total", read:"#tipTotal", expect:"$1.16"} ], status:BASELINE, notes:"Tim's Calculators rule: tip = pre-tax subtotal × %, truncated down to a whole cent; total uses that same tip." });
T({ id:"TIP-10", category:"Tip (UI)", view:"tip", name:"Exact whole-cent tip is not lost to floating point: 20.00 at 18% (exact 3.60)",
    steps:[ {keys:"20.00 · 18%", actions:[["fill","#tipSubtotal","20.00"]], read:"#tipAmount", expect:"$3.60"},
            {keys:"Total", read:"#tipTotal", expect:"$23.60"} ], status:BASELINE,
    notes:"A binary floating-point floor would give $3.59 here; the calculator uses exact integer arithmetic." });

/* V9.24.0 currency-precision rule: Subtotal and Tax accept at most two decimal places.
   More than two is rejected ("Check the amounts entered.") — never silently rounded. */
T({ id:"TIP-11", category:"Tip (UI)", view:"tip", name:"Currency entry forms accepted: 10 · 10.2 · $10.25 · 1,250.50 · $1,250.50",
    steps:[ {keys:"Subtotal 10", actions:[["fill","#tipSubtotal","10"]], read:"#tipAmount", expect:"$1.80"},
            {keys:"Total", read:"#tipTotal", expect:"$11.80"},
            {keys:"Subtotal 10.2", actions:[["fill","#tipSubtotal","10.2"]], read:"#tipAmount", expect:"$1.83"},
            {keys:"Total", read:"#tipTotal", expect:"$12.03"},
            {keys:"Subtotal $10.25", actions:[["fill","#tipSubtotal","$10.25"]], read:"#tipAmount", expect:"$1.84"},
            {keys:"Total", read:"#tipTotal", expect:"$12.09"},
            {keys:"Subtotal 1,250.50", actions:[["fill","#tipSubtotal","1,250.50"]], read:"#tipAmount", expect:"$225.09"},
            {keys:"Tax $1,250.50", actions:[["fill","#tipTax","$1,250.50"]], read:"#tipTotal", expect:"$2,726.09"} ], status:BASELINE });
T({ id:"TIP-12", category:"Tip (UI)", view:"tip", name:"Subtotal with 3 decimals (10.255) is rejected, not rounded",
    steps:[ {keys:"Subtotal 10.255", actions:[["fill","#tipSubtotal","10.255"]], read:"#tipAmount", expect:"—"},
            {keys:"Total", read:"#tipTotal", expect:"—"},
            {keys:"Message", read:"#tipNote", expect:"Check the amounts entered."},
            {keys:"What Tim typed is left as typed", read:"field:#tipSubtotal", expect:"value=[10.255] placeholder=[]"},
            {keys:"Corrected to 10.25", actions:[["fill","#tipSubtotal","10.25"]], read:"#tipAmount", expect:"$1.84"},
            {keys:"Total", read:"#tipTotal", expect:"$12.09"} ], status:BASELINE,
    notes:"Rounding 10.255 to 10.26 would give tip $1.84 / total $12.10; truncating to 10.25 would silently give $12.09. Neither is allowed." });
T({ id:"TIP-13", category:"Tip (UI)", view:"tip", name:"Subtotal 43.678 and Tax 3.618 are each rejected, not rounded",
    steps:[ {keys:"Subtotal 43.678 · Tax 3.61", actions:[["fill","#tipSubtotal","43.678"],["fill","#tipTax","3.61"]], read:"#tipTotal", expect:"—"},
            {keys:"Message", read:"#tipNote", expect:"Check the amounts entered."},
            {keys:"Subtotal 43.67 · Tax 3.618", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","3.618"]], read:"#tipTotal", expect:"—"},
            {keys:"Message", read:"#tipNote", expect:"Check the amounts entered."},
            {keys:"Tax corrected to 3.61", actions:[["fill","#tipTax","3.61"]], read:"#tipAmount", expect:"$7.86"},
            {keys:"Total", read:"#tipTotal", expect:"$55.14"} ], status:BASELINE });
T({ id:"TIP-14", category:"Tip (UI)", view:"tip", name:"Result note and Custom accepts a decimal percentage",
    steps:[ {keys:"43.67 · 3.61 · 18%", actions:[["fill","#tipSubtotal","43.67"],["fill","#tipTax","3.61"]], read:"#tipNote", expect:"Tip is calculated on the pre-tax subtotal."},
            {keys:"Custom 17.5 (percent may have decimals)", actions:[["click",'[data-tip-pct="custom"]'],["fill","#tipCustom","17.5"]], read:"#tipLabel", expect:"17.5% TIP"},
            {keys:"Note unchanged", read:"#tipNote", expect:"Tip is calculated on the pre-tax subtotal."} ], status:BASELINE });

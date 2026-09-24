## V6
- Added Social Security retirement claiming calculator
- Calculates FRA from birth date, including SSA January 1 treatment
- Shows age 62, FRA, age 70, yearly claiming comparisons, and gross-benefit break-even ages
- Uses SSA early-retirement reduction and delayed-retirement credit formulas

# Tim's Calculators

## V5.1
- Auto Loan defaults to Texas motor-vehicle tax mode: 6.25% of vehicle selling price less eligible motor-vehicle trade-in value
- Trade payoff/negative equity affects financing but does not reduce the Texas trade-in tax allowance
- Custom tax-rate mode remains available
- Renamed Total Out-of-Pocket to Cash Paid + Loan Payments
- Numeric/default fields select their existing value on focus for faster PC and phone entry

## V5
- Auto Loan calculator
- Trade-in equity including negative equity
- Sales tax, dealer fees, APR, and loan term
- Amount financed and monthly payment breakdown
- Total interest, total loan payments, cash out-of-pocket, payoff month
- Year-by-year amortization and Reset

## V4.1
- Mortgage money inputs now display dollar signs and thousands separators
- Monthly payment and breakdown show cents
- Start Date renamed First Payment Month
- Payoff month now treats that field as payment #1
- Added Mortgage Reset button
- Core mortgage and amortization formulas unchanged after validation

## V4
- Mortgage calculator with live payment calculation
- Linked down-payment dollars and percentage
- Taxes, insurance, HOA, and PMI
- Loan amount, total interest, total P&I payments, payoff month
- Year-by-year amortization table

Mobile-first personal calculator suite.

## V3.1
- Days Until now previews/calculates immediately when the date or event name changes; Save Event only saves the countdown.

## V3
- Percentage calculator V2 retained
- Days Until calculator added
- Save unlimited named countdowns locally on the device
- Upcoming events automatically sort nearest-first
- Tap an event to feature it
- Edit and delete saved events
- Shows days, weeks + days, calendar months + days, and weekdays

## Planned
Construction Master, Mortgage, Auto Loan, Social Security, and Volume.

## V7
- Added Volume calculator with Box, Cylinder, Concrete, Tank/Pool, and Convert modes
- Mixed linear units can be used in the same calculation
- Concrete mode reports cubic yards prominently and supports 0/5/10/15% waste
- Tank/Pool mode supports rectangular and round shapes and reports US gallons
- Added visual dimension diagrams for shape-based calculations
- Added common volume conversions for cubic inches, cubic feet, cubic yards, gallons, liters, and cubic meters

## V8
- Added Construction Master Phase 1 core engine
- Feet/inches/fraction dimensional entry
- Dimensional addition, subtraction, multiplication and division foundation
- Fraction entry using numerator / denominator followed by inch
- Conversion cycling among feet-inch-fraction, decimal feet, decimal inches, and fractional inches
- Added exact-inch and decimal-foot verification readouts
- Intentionally defers rafter/trig/square/cube/memory functions until the dimensional core is validated

## V8.1
- Construction Master ft / in / fraction keys grouped together for faster dimensional entry
- Fixed compound inch-fraction entry state (example: 8 in + 3/32 in)
- Live display now preserves the dimension being constructed instead of showing a misleading 0 ft prefix
- Exact Inches and Decimal Feet now follow the current operand instead of stale prior-operation state

## V8.2
- Construction Master live display now preserves the units the user actually entered
- `25 → ft` displays `25 ft` while the internal engine still stores 300 inches for arithmetic
- Feet and inches entry representation is now separated from normalized calculation storage
- Verification boxes continue to show normalized exact inches and decimal feet

## V8.3
- Added a separate human-facing expression-history layer to Construction Master
- Running tally now preserves each operand as entered instead of showing normalized arithmetic operands
- Example history now remains `25 ft 3 in + 8-3/32 in + 27.5 in =`
- Live history updates while the current operand is being keyed
- Internal arithmetic remains normalized to inches and is independent of display/history formatting

## V8.4
- Removed the duplicate blue result immediately after `=`
- The blue secondary line now appears only after pressing `Conv`
- `Conv` cycles through decimal feet, decimal inches, and fractional inches
- Reduced the main Construction Master answer font weight for easier reading of feet-inch fractions

## V8.5
- Changed `Conv` from a post-answer cycle button to a Construction Master-style modifier key
- `9 → ft → Conv → in` now converts the current 9 ft value to 108 in without requiring `=`
- `108 → in → Conv → ft` converts back to 9 ft
- Conv now prompts for the destination unit instead of cycling blindly

## V8.6
- Construction Master `Conv → ft` now shows construction-style feet/inches/fractions in the main display
- Example: `147 in → Conv → ft` displays `12 ft 3 in`
- Decimal feet remains available in the verification box below, avoiding duplicate decimal-foot output
- Fractional-inch conversions remain construction-friendly, e.g. `147-5/8 in` becomes `12 ft 3-5/8 in`

## V8.7
- Added dimensional type tracking to Construction Master arithmetic
- Plain numbers are treated as scalars; ft/in entries are lengths
- length × scalar remains a length
- length ÷ scalar remains a length
- length × length now produces area
- `10 ft × 8 ft =` displays `80 sq ft`
- Area verification shows square inches and square feet

## V8.8
- Added area × length → volume dimensional arithmetic
- `10 ft × 8 ft × 3 ft =` now displays `240 cu ft`
- Added scalar multiplication/division support for area and volume
- Verification labels now change with dimensional type:
  - EXACT INCHES / DECIMAL FEET
  - SQUARE INCHES / SQUARE FEET
  - CUBIC INCHES / CUBIC FEET

## V8.9
- Added practical reverse dimensional arithmetic: area ÷ length → length
- Reference workflow: `10 ft × 8 ft ÷ 4 ft = 20 ft 0 in`
- Keeps the dimensional engine focused on realistic construction-calculator workflows

## V9.0
- Added first Construction Master roof-triangle engine
- Added Pitch, Rise, Run and Diag keys
- Validated reference triangle target: 12 ft Run + 5 ft Rise
- Expected recalls: Diag 13 ft 0 in, Pitch 22.61986°, Rise 5 ft 0 in, Run 12 ft 0 in
- Hip/Valley, Jack rafters and direct Pitch-entry behavior remain deferred until separately mapped against the physical Trig Plus II

## V9.1 Fixed
- Rebuilt from known-good V9.0
- TRESTLE Field Trig Calculator layout
- Familiar Trig Plus II-inspired key geography
- R/Wall above Diag; Ir/Pitch above Hip/V
- Larger, lighter number keys
- Full roof-history line
- Unvalidated future functions remain disabled

## V9.2
- Locked the approved Trestle calculator width and keypad geography
- Moved Clear and Backspace into compact display-area utility controls
- Removed the oversized bottom utility row
- Kept Backspace as a useful web-app convenience
- Updated stale global footer version to V9.2

## V9.3
- Activated Hip/V in the locked Trestle keypad position
- Hip/Valley uses the validated 45-degree plan-angle formula
- Hip/V = sqrt(Rise² + Run² + Run²)
- Preserves full roof history in the display
- Physical reference targets:
  - 12 ft Run + 5 ft Rise = 17 ft 8-19/64 in Hip/V
  - 14 ft 7 in Run + 6 ft 3 in Rise = 21 ft 6-39/64 in Hip/V


## V9.4
- Added validated Jack and Irregular Jack workflows.
- `Stor → Jack` stores jack on-center spacing (default 16 in).
- Regular `Jack` cycles descending JK values through zero, then IJ values through zero, then repeats.
- Gold `Ir/Jack` jumps directly to the irregular-jack sequence.
- Gold `Ir/Pitch` stores the adjoining irregular roof pitch.
- Irregular jack geometry maintains the stored O.C. spacing on both sides, matching the physical Trig Plus II test data.


## V9.6.1 — R/Wall
- Added validated gold `R/Wall` (`Conv → Diag`) workflow.
- Uses fixed 16 in rake-wall spacing, matching Tim's field workflow and physical Trig Plus II default.
- Repeated R/Wall presses step through `RW 1`, `RW 2`, etc. to the final `0 ft 0 in`.
- The final RW result holds on additional presses rather than wrapping.
- Validated physical benchmarks prepared for 12 ft run / 5 ft rise and 12 ft run / 8 ft rise.


## V9.7 — Trig
- Enabled validated degree-mode `Sine`, `Cos`, and `Tan`.
- Enabled gold inverse trig with `Conv → Sine/Cos/Tan`.
- Normal trig results display up to six decimals, matching the physical Trig Plus II.
- Inverse trig displays `DEG` at left and the angle at right.
- Physical benchmarks: sin 37° = 0.601815; cos 37° = 0.798636; tan 37° = 0.753554; asin 0.5 = 30°; acos 0.5 = 60°; atan 1 = 45°.


## V9.8
- Added physically validated Circ cycle: DIA → AREA → CIRC → DIA.
- Preserves inch-only vs feet/inches area display behavior from the Trig Plus II benchmarks.
- Gold Arc was deliberately left unimplemented in V9.8 until physically mapped.


## V9.9 — Arc
- Added physically validated gold `Arc` workflow: establish a diameter with `Circ`, then enter an angle and use `Conv → Circ`.
- Arc length = circumference × angle / 360°.
- One `C` preserves the stored circle diameter; two consecutive `C` presses still clear all stored state.
- Physical 10 in diameter benchmarks: 90° = 7 55/64 in; 180° = 15 45/64 in; 360° = 31 27/64 in.


## V9.10 — Square Root / x²
- Built from the validated V9.9 baseline.
- Added physically validated square-root behavior: `144 → √ = 12`, `2 → √ = 1.414214`.
- Added gold square behavior: `12 → Conv → √ = 144`, `1.234 → Conv → √ = 1.522756`.
- Uses the established six-decimal result formatting with unnecessary trailing zeros removed.
- Activated and visually corrected the √ key while preserving the locked five-column keypad geometry.
- Service-worker cache bumped to V9.10.


## V9.10.1 — Square-root key visual polish

- Visual-only follow-up to V9.10; calculator math is unchanged.
- Replaced the oversized font-rendered radical with a smaller SVG radical modeled after the physical Trig Plus II key.
- Keeps the gold `x²` label and locked keypad geometry unchanged.
- Service-worker cache bumped to V9.10.1.


## V9.11 — Reciprocal (1/x)

- Built from the validated V9.10.1 baseline.
- Added physically validated gold `1/x` behavior on `Conv → ÷`.
- Physical benchmarks: `4 → Conv → ÷ = 0.25`, `3 → Conv → ÷ = 0.333333`, and `0 → Conv → ÷ = Error 1`.
- Uses the established six-decimal result formatting with unnecessary trailing zeros removed.
- Updated stale in-app/footer version labels to V9.11.
- Service-worker cache bumped to V9.11.


## V9.12 — AC
- Added validated gold AC behavior: `Conv → ×`.
- AC immediately clears the current entry/result and all stored Trestle geometry/settings.
- Physical benchmark: after storing 12 ft Run and 5 ft Rise, `Conv → ×` displays `0`; pressing `Diag` afterward displays `DIAG 0`.
- Updated in-app/footer version labels to V9.12.
- Service-worker cache bumped to V9.12.


## V9.13.1 — π
- Added validated gold `Conv → +` π constant.
- Standalone π displays `PI   3.141593`.
- π retains full internal precision for arithmetic; physical benchmark `2 × π = 6.283185`.
- Updated in-app/footer version labels and service-worker cache to V9.13.1.


## V9.14 — +/− sign toggle
- Added validated gold `Conv → −` sign-toggle behavior.
- `25 → Conv → −` returns `-25`; repeating `Conv → −` returns `25`.
- Negative values remain valid arithmetic operands (`10 + 3 → Conv → − → =` returns `7`).
- Updated in-app/footer version labels and service-worker cache to V9.14.


## V9.17 — Fraction entry and conversion chain
- Fixed live fractional-inch entry so the numerator remains visible after `/` (for example `2-19/`).
- Matched validated Trig Plus II conversion behavior: dimensional length → decimal feet, decimal feet input via Conv → Feet, decimal inches, then repeated Conv → Inch → fractional inches.
- Physical benchmark target: 28 ft 2-19/32 in → 28.21615 ft → 338.5938 in → 338 19/32 in.


## V9.18 — Cu cubic units
- Adds validated `Cu` entry with Feet, Inch, Yds, m, and mm.
- Adds validated cubic conversions including in³→ft³, ft³→yd³, yd³→ft³, m³→ft³, and mm³→m³.
- Preserves V9.17 d:m:s and all prior validated Trestle behavior.


## V9.18.1 — Trestle thousands separators
- Added comma grouping to ordinary numeric display values (for example, 1,000,000 cu. mm).
- Specialized feet/inches and DMS formatting remains unchanged.
- No calculator math or keypad layout changes.


## V9.19
- Added physically validated Sq square-unit entry and area conversions for in, ft, yd, m, and mm.
- Preserved V9.18.1 thousands-separator display behavior.


## V9.20
- Added validated linear meter (`m`) and millimeter (`mm`) entry.
- Added validated linear conversions between metric lengths and the existing feet/inches engine.
- Preserved V9.19 square/cubic metric behavior and V9.18.1 thousands separators.


## V9.20.1
- Corrected linear metric `Conv → Feet` to match the physical Trig Plus II: display feet + fractional inches instead of decimal feet.
- Example: `1 m → Conv → Feet` displays `3 ft 3-3/8 in`.
- Preserves validated decimal-feet conversion behavior for non-metric workflows.


## V9.20.2
- Fixed Conv modifier so pressing Conv alone preserves the currently displayed value/unit and waits for the destination/function key.
- Matched validated cubic-meter to cubic-feet display precision: 1 cu. m → Conv → Feet = 35.31467 cu. ft.


## V9.20.3
- Fixed chained cubic conversions after a prior cubic conversion.
- Added cubic-inch destination handling to the conversion map.
- Physically validated chain: 1 cu. m → 35.31467 cu. ft. → 61,023.74 cu. in.
- Preserved V9.20.2 Conv modifier behavior: Conv alone waits for the destination key.


## V9.21
- Added validated linear yard entry with `Yds`.
- Added linear yard conversions through `Conv`, including yards to feet/inches and feet/inches to yards.
- Preserved existing square/cubic yard behavior and V9.20.3 chained conversion fixes.


## V9.21.1
- Conversion history now shows the value immediately before the conversion and the resulting value using an arrow (for example, `1 cu. yd. → 27 cu. ft.`).
- Applies to linear, square, cubic, metric, yard, feet, and inch conversions.
- Chained conversions use the immediately preceding displayed value as the source.
- Calculation behavior is unchanged from V9.21.


## V9.21.2
- Fixed validated inch-only linear conversion to Feet: `50 in → Conv → Feet` now displays `4 ft 2 in` instead of decimal feet.
- Preserves validated `3.5 ft → Conv → Inch = 42 in` behavior.
- Preserves the V9.15 mixed ft/in → decimal-feet behavior and all V9.21.1 conversion-history display behavior.


## V9.21.7

- Fixed direct decimal-feet `Conv → Feet` toggle: `2.125 ft → 2 ft 1 1/2 in → 2.125 ft`.
- Matched the physical calculator's initial Inch → Conv → Feet display rule: whole-inch entries first show feet/inches; decimal-inch entries first show decimal feet.
- Repeated `Conv → Feet` now toggles between decimal feet and feet/inches.
- Examples: `25 in → 2 ft 1 in`; `25.5 in → 2.125 ft`; repeat → `2 ft 1-1/2 in`.


## V9.21.6
- Direct decimal-foot entry now toggles to feet + fractional inches on the first Conv → Feet press, matching the physical Trig Plus II.


## V9.22
- Matched physical Trig Plus II `Conv → Inch` cycling: decimal inches convert to nearest 1/64-inch display, and the next `Conv → Inch` restores the original decimal-inch value.
- Preserves the unrounded internal value (for example, 80.333 → 80 21/64 → 80.333).


## V9.23
- Added physically validated `%` key behavior.
- Standalone percentage: `10 % = 0.1`.
- Arithmetic percentage: `200 × 10 % = 20`, `200 ÷ 10 % = 2000`, `200 + 10 % = 220`, `200 − 10 % = 180`.
- Percentage arithmetic preserves dimensional type, e.g. `10 ft × 50 % = 5 ft 0 in`.
- Repeated standalone `%` enters an invalid/error state rather than inventing another percentage operation.


## V9.23.2
- Fixed Rcl during an active calculation so the recalled M-1/M-2 value becomes the pending operand without clearing the existing operator/accumulator.
- Preserves previously validated V9.23 percentage and V9.22 memory behavior.


## V9.23.2
- Fixed Rcl as the second operand so the RCL prompt no longer clears the pending accumulator/operator.
- Example: 3 ft → Stor → 1; 4 ft × Rcl → 1 → = now produces 12 sq. ft.


## V9.23.3
- Fixed validated area ÷ length dimensional arithmetic.
- 24 sq. ft. ÷ 6 ft = 4 ft 0 in.
- 100 sq. ft. ÷ 20 ft = 5 ft 0 in.
- Preserves prior V9.23.2 behavior.


## V9.23.4
- Allows a completed cubic-volume result to become the first operand when division is pressed.
- Adds validated dimensional reduction: volume ÷ area = length.
- Preserves the V9.23.3 area ÷ length fix and prior validated behavior.

## V9.23.5
- Fixed Sq → unit when used as the second operand of an active calculation.
- Preserves the pending operator and first dimensional operand through square-unit entry.
- Physical benchmark target: 120 cu. ft. ÷ 30 sq. ft. = 4 ft 0 in.

## V9.23.6
- Added physically validated dimensional reduction: volume ÷ length = area.
- Physical benchmark: 120 cu. ft. ÷ 10 ft = 12 sq. ft.
- One-line addition to applyTyped(); no other calculator behavior changed.
- Regression suite (tests.html): DIM-09 and DIM-22 move from KNOWN FAIL to NOW PASSING; 0 unexpected failures.

## V9.23.7
- Added physically validated dimensional reduction: area ÷ area = scalar.
- Physical benchmark: 24 sq. ft. ÷ 6 sq. ft. = 4.
- One-line addition to applyTyped(); no other calculator behavior changed.
- Regression suite: DIM-09 and DIM-22 (volume ÷ length, fixed in V9.23.6) graduated to ordinary passing tests; DIM-12 moves from KNOWN FAIL to NOW PASSING; 0 unexpected failures.

## V9.23.8
- State-management prerequisite: Cu → unit used as the second operand no longer discards the pending arithmetic operation (same pattern as the V9.23.5 Sq fix).
- The cubic operand keeps its entered label in the history (for example `120 cu. ft. ÷ 10 cu. ft.`), not a cubic-yard fallback.
- Volume ÷ volume is NOT implemented yet (planned for V9.23.9). Error 3 is NOT implemented yet.
- Regression suite: DIM-12 (area ÷ area, fixed in V9.23.7) graduated to an ordinary passing test; 0 unexpected failures.

## V9.23.9
- Added physically validated dimensional reduction: volume ÷ volume = scalar.
- Physical benchmark: 120 cu. ft. ÷ 10 cu. ft. = 12.
- One-line addition to applyTyped(); relies on the V9.23.8 Cu second-operand state fix. No other calculator behavior changed.
- Regression suite: DIM-13 moves from KNOWN FAIL to NOW PASSING (to be graduated after live verification); 0 unexpected failures.

## V9.23.10
- Fixed Circle AREA internal state (audit root cause R5): after Circ → Circ, the active result is the area (square inches, kind "area") instead of the hidden diameter.
- Physical benchmarks: 10 in Circ Circ Conv Feet = AREA 0.545415 sq. ft.; 10 in Circ Circ × 2 = 157.0796 sq. in.
- Adds a TEMPORARY circle-only exception (circleAreaResult) so the AREA result can become operand #1. This is not general result chaining; remove it when R1 is implemented.
- Known display differences left for later root causes: AREA label lost after Conv, sq ft vs sq. in. for computed results (R8), precision (R7), memory tag text (R6).
- Regression suite: DIM-13 graduated to an ordinary passing test; MEM-07 remains KNOWN FAIL with a corrected internal value; 0 unexpected failures.

## V9.23.11
- Implemented physical error handling (audit root cause R4).
- Divide by zero shows `Error 1`; invalid/incompatible dimensional operations show `Error 3`.
- applyTyped() now returns the error classification instead of a generic invalid result.
- Errors are detected both at `=` and when the next operator is pressed (physical: 3 + 5 ft + = Error 3); the invalid operand is no longer silently discarded.
- Errors are not latched: entering a new number starts a fresh calculation without C (physical: Error 3 → 2 + 2 = 4).
- Regression suite: DIM-11, DIM-15, DIM-20, DIM-21 now pass (NOW PASSING, graduate after live verification); CORE-14, DIM-23, DIM-24, DIM-25 promoted to PHYSICAL VALIDATED (DIM-23 is a KNOWN FAIL until R1, because × after a Sq-entered area is still ignored); added DIM-26 (mid-chain Error 3) and SPEC-05 (error recovery). DIM-14 and DIM-16 now show Error 3 but remain KNOWN FAIL pending R2.

## V9.23.12
- Implemented function-as-operand-#2 behavior (audit root cause R3) for the physically validated function family: √, x², normal Sine/Cos/Tan, and 1/x.
- When a calculation is pending, the function transforms the second number and keeps the first number and the pending operator.
- Physical benchmarks: 10 × 144 √ = 120; 10 ft × 30 Sine = 5 ft 0 in; 10 × 4 1/x = 2.5; 10 × 2 x² = 40.
- Standalone function behavior is unchanged. Inverse trig (Conv Sine/Cos/Tan) as operand #2 is not yet physically tested and is unchanged.
- Regression suite: DIM-11, DIM-15, DIM-20, DIM-21 graduated; CORE-13 and TRIG-10 NOW PASSING; added CORE-17 (1/x) and CORE-18 (x²); 0 unexpected failures.

## V9.23.13
- Implemented completed-result chaining and repeated equals (audit root cause R1), per physical Trig Plus II tests:
  - an operator after a completed `=` result (or a standalone Sq/Cu entry) uses that result as the first number (5 × 5 = × 2 = 50);
  - a new number after a completed result starts fresh (5 × 5 = 3 → 3);
  - pressing `=` again replays the most recent completed operator and second number, keeping its dimensional kind (5 × 5 = = 125; 5 + 2 = = 9; 10 ft + 2 ft = = 14 ft; 5 × 5 = + 2 = = 29);
  - a second operator before the second number replaces the first (5 × + 2 = 7);
  - an operator with no second number returns the first number (5 × = 5).
- Results of roof, Jack, R/Wall, trig, √, 1/x, DMS, %, EXP, conversions, memory and errors are NOT made chainable (not physically tested).
- Clear behavior (physically tested): a single C after a completed operation shows 0 but keeps the result recoverable; the next = restores it without replaying, and the = after that replays (5 × 5 = C = = → 25, 125). Double C and AC destroy the completed result and replay state.
- The temporary Circle AREA exception from V9.23.10 is unchanged.
- Regression page: shows READY TO TEST with the loaded Trestle version and test count before running, and a VERSION MISMATCH / FILES OUT OF DATE warning (with Run disabled) when the loaded calculator differs from the server. "Load the latest files" now also refreshes the browser's HTTP cache.
- Regression suite: CORE-13, TRIG-10 graduated; added TRIG-11, TRIG-12, CORE-19 to CORE-26, DIM-27; CORE-15 and CORE-16 promoted to physical validated.

## V9.23.14
- Implemented dimensional-first ± plain-number inheritance (audit root cause R2), per physical Trig Plus II tests. For + and − only, when the first number is dimensional and the second is plain, the plain number takes the first number's dimension and unit: 5 ft + 3 = 8 ft 0 in; 5 ft + 2.5 = 7 ft 6 in; 3 ft − 5 = −2 ft 0 in; 5 ft 6 in + 3 = 8 ft 6 in (mixed feet/inches → feet); 10 in + 2 = 12 in; 2 m + 3 = 5 m; 20 sq. ft. ± 5; 20 cu. ft. ± 5.
- Asymmetric: a plain first number with a dimensional second number is still Error 3 (3 + 5 ft = Error 3). × and ÷ are unchanged.
- Minimal unit context added for the validated cases only (feet, mixed feet/inches, whole/decimal inches, metres, Sq Feet, Cu Feet). Inch-only and metre +/− results now display in inches (12 in) and metres (5 m). Units not physically tested (mm, yd, fractional inches, other Sq/Cu units, memory values, ×/÷ results) keep their previous behavior.
- Unit context survives completed-result chaining (10 ft + 2 ft = + 3 = 15 ft 0 in), and repeated equals replays the converted dimensional operand (5 ft + 3 = = 11 ft 0 in).
- Regression suite: CORE-01, CORE-15, CORE-16, DIM-10, DIM-19, DIM-23 graduated; DIM-14, DIM-16, DIM-17, DIM-18 NOW PASSING; added DIM-28 to DIM-38.

## V9.23.15
- Fractional-inch entries (for example 8 Inch 3/32) now carry inch unit context, so a plain second number inherits inches: 8 3/32 in + 2 = 10 3/32 in. Unitless fractions (no Inch key) remain unitless.
- Inch +/− results keep the presentation of the first number: fractional/whole-inch first number → fractional inches (8 3/32 in + 2.5 = 10 19/32 in; 8 3/32 in + 27.5 in = 35 19/32 in); decimal-inch first number → decimal inches (8.5 in + 2 = 10.5 in; 8.5 in + 2 in = 10.5 in). The second number never changes the presentation.
- Regression suite: DIM-14, DIM-16, DIM-17, DIM-18 graduated; FRAC-02 promoted from TRESTLE BASELINE to PHYSICAL VALIDATED with the physical result 35 19/32 in (was 2 ft 11 19/32 in); added DIM-39 to DIM-44.

## V9.23.16
- DMS lifecycle: d:m:s state now belongs only to the DEG/DMS display it produced. Any new entry, result or clear supersedes it, so an old angle no longer resurfaces (physical: 30.5 d:m:s 45 Sine d:m:s → DEG 0.707107°, also after C C and after AC). Repeated d:m:s cycling is unchanged; single C keeps its previous DMS behavior (not physically tested).
- AC (Conv ×) now also aborts EXP entry (2 EXP 3, AC, 5 = → 5) and restores the 16 in default Jack O.C. Double C keeps a custom Jack O.C. (physically validated).
- Regression suite: all 13 former PENDING tests reclassified with physical results (PCT-07 PASS; the rest PHYSICAL VALIDATED known failures until their repair versions); added DMS-06 and DMS-07. JACK-07, EXP-04, DMS-05, DMS-06, DMS-07 NOW PASSING. 0 pending.
- Recorded for future releases: power-on display is physically plain 0 (R10); a normal Diag physically displays DIAG 13 ft 0 in (roof labels).

## V9.23.17
- R10: the calculator's zero state is now a plain scalar 0 at power-on, after C, after C C and after AC (physical display: 0), instead of 0 ft 0 in.
- Fixed at the source: the initial state and the clear routines (clearKey/clearAll) now set a scalar zero; render() is unchanged. The static starting text in index.html now also reads 0.
- Unchanged: single C still keeps the hidden completed result (5 × 5 = C = = → 25, 125); C C keeps M-1/M-2; AC clears memory, EXP, DMS and restores the 16 in Jack O.C.
- SPEC-02 and SPEC-04 now show 0 instead of 0 ft 0 in but remain known failures (they need a DIAG 0 roof recall with its label — later roof repair).
- Regression suite: JACK-07, EXP-04, DMS-05, DMS-06, DMS-07 graduated; CORE-25, CORE-26, SPEC-01 NOW PASSING; added SPEC-06 (power-on display, no keys pressed).

## V9.23.18
- Roof results now show the physical Trig Plus II function identifiers, label left and value right, using the existing tagged display: PTCH 22.61986°, RISE 5 ft 0 in, RUN 12 ft 0 in, DIAG 13 ft 0 in, H/V 17 ft 8 19/64 in.
- Unitless Run/Rise entries display as unitless labeled values (12 Run → RUN 12; 5 Rise → RISE 5). Whether a unitless value is stored in the roof geometry is not yet physically tested, so the stored roof values are unchanged for unitless entries.
- Diag with no roof geometry now shows DIAG 0 (scalar zero), fixing the no-data behavior after AC and C C. Power-on, C, C C and AC still show a plain 0.
- Roof calculations, R/Wall, Jack and pending-arithmetic behavior are unchanged.
- Regression suite: CORE-25, CORE-26, SPEC-01, SPEC-06 graduated; ROOF-01 to ROOF-05 and SPEC-03 expected values now include the physical identifiers; added ROOF-08 (unitless Rise) and ROOF-09 (no-data Diag).

## V9.23.19
- Unitless Run and Rise are now stored as roof geometry and stay unitless (physical: 12 Run → RUN 12; 5 Rise → RISE 5; Diag → DIAG 13). Dimensional roof behavior is unchanged. Unitless Diag/Pitch/Hip/V entries are still ignored (not physically tested).
- A recalled Diag now supplies the second number of a pending calculation instead of clearing it (physical: 12 ft Run 5 ft Rise 5 ft × Diag → DIAG 13 ft 0 in, then = → 65 sq. ft.). The DIAG label is display only; the final result is an ordinary area. Other roof keys during arithmetic are unchanged (not physically tested).
- Added MEM-09 (stored roof result should recall as M-1 13 ft 0 in); it remains a known failure for the later memory-label repair.
- Regression suite: 12 V9.23.18 tests graduated; added ROOF-10, ROOF-11 (NOW PASSING) and MEM-09 (known fail).

## V9.23.20
- Memory stores a result's value, not its temporary function label (physical: AREA, DIAG and Jk are not retained after M-1). The stored numeric value and kind are unchanged.
- Stor first completes a valid pending calculation, reusing the = logic (physical: 10 × 5 Stor 1 → M-1 50; 10 + 5 Stor 1 → M-1 15). If that produces an error, the error is shown and nothing is stored (10 ÷ 0 Stor 1 → Error 1). With no second number (10 × Stor 1) behavior is unchanged. Stor does not leave a repeat-equals state behind.
- MEM-06 now differs only in R7 precision; MEM-07 is reclassified as the R8 computed-area display unit (not a memory defect). Neither is fixed here.
- Known gap, not addressed: memory does not yet carry R2 unit/presentation context (resultUnit, resultInchDecimal).
- Regression suite: ROOF-10, ROOF-11 graduated; MEM-08, MEM-09 NOW PASSING; added MEM-10 (Stor completes +), MEM-11 (Jack value stored without label), MEM-12 (Stor after ÷ 0 shows Error 1).

## V9.23.21
- R8 computed-area display (numbers were already correct; only the displayed unit changes):
  - Generic computed areas and volumes now read sq. ft. / cu. ft. (physical punctuation) instead of sq ft / cu ft.
  - Circle AREA from a metre diameter displays in square metres (1 m Circ Circ → AREA 0.785398 sq. m). DIA and CIRC stages are unchanged.
  - A separate area-only presentation unit (resultAreaUnit / accAreaUnit: "in", "m", or default square feet) carries a circle area's unit through area × number, area ÷ number and number × area, repeated =, the single-C restore, and M-1/M-2 (new memory field areaUnit, area results only). 10 in Circ Circ × 2 = → 157.079633 sq. in.
  - Kept separate from the R2 resultUnit, so no new +/− inheritance for areas. Other combinations (e.g. inch × inch) keep square feet (not physically tested).
- MEM-07 now differs only in R7 precision. CIRC-02 and MEM-06 precision unchanged.
- Regression suite: MEM-08 to MEM-12 graduated; FMT-01 and CIRC-09 NOW PASSING.

## V9.23.22
- Conv → Inch order: after Conv → Feet (decimal feet), the first Conv → Inch shows decimal inches and the next shows fractional inches (physical: 28.21615 ft → 338.5938 in → 338 19/32 in). CONV-20 now differs only in R7 precision.
- Conv → Feet with a pending calculation and a second number completes the calculation first (the second number stays as entered), then shows the result in feet (physical: 10 ft × 2 Conv Feet → 20 ft immediately; 5 × 2 Conv Feet → 10 ft). A following = does not repeat the operation. Conv → Inch / m / mm / Yds during a pending calculation are unchanged (not physically tested).
- A fraction finished with the Inch key keeps its fraction in the display and history (physical: 3 / 32 Inch → 0 3/32 in; 8 Inch 3 / 32 Inch → 8 3/32 in). The zero-whole history format is fixed (0 3/32 in, not 03/32 in). Numeric values were already correct.
- Recorded for later: inchesOnly() can still show 03/32 in for tiny inch-only calculated results (not physically tested).
- Regression suite: FMT-01, CIRC-09 graduated; CONV-21, FRAC-04 NOW PASSING; added CONV-22, CONV-23 (Conv Feet timing and = behavior).

## V9.23.23
- Sq prompt now reads "sq." (physical: 120 cu. ft. ÷ 30 Sq → 30 sq.). Display only; the Sq state itself is unchanged. The Cu prompt is unchanged (not physically established).
- A value with dimensional units cannot be a percentage: pressing % on it shows Error 5 immediately (physical: 5 ft %; 10 ft × 5 ft %; 10 + 5 ft %; 10 ft + 5 ft %). Error 5 is not latched (then 2 + 2 = → 4). A plain percentage after a dimensional first number stays valid (10 ft + 5 % → 10 ft 6 in; 10 ft × 50 % → 5 ft 0 in).
- Only typed values reach %, and a typed value is either plain or a length, so length is the dimensional kind rejected. % after Sq/Cu entries, memory recall or function results is unchanged (it does nothing, as before).
- Regression suite: CONV-21, CONV-22, CONV-23, FRAC-04 graduated; DIM-08, PCT-08 NOW PASSING; added PCT-09 to PCT-13. The only remaining known failures are the four R7 precision cases.

## V9.23.24
- R7 physical LCD precision: a new display formatter, lcdDec(), reproduces the Trig Plus II decimal display. The number field has seven digit positions; whole-number digits use positions first (a displayed leading 0 counts as one) and the rest are decimals. The minus sign does not use a position. Halfway values round up (777 ÷ 64 → 12.14063), trailing zeros are dropped, Trestle's thousands separators are kept. Physical: 1 ÷ 3 → 0.333333; 1 ÷ 3000 → 0.000333; −5 ÷ 3 → -1.666667; 28.21615 ft; 338.5938 in; 78.53982 sq. in.; 157.0796 sq. in.
- Presentation only: internal values keep full precision (100 ÷ 3 = − 33 = → 0.333333).
- lcdDec() is used for the main display, history text built from displayed results, and memory display text. The verification (exact) boxes and typed-entry echoes keep the existing dec() precision. The hand-coded 5- and 2-decimal cases (cu. ft., cu. in., pitch) now use the general rule. Values with more than seven whole-number digits fall back to the previous formatter unchanged.
- Recorded for later (no functional change): the physical calculator only accepts entry up to 1,000,000.
- Regression suite: DIM-08, PCT-08 to PCT-11, PCT-13 graduated; CONV-20, CIRC-02, MEM-06, MEM-07 NOW PASSING; added PREC-01 to PREC-05. No known failures remain.

## V9.23.25
- Display polish (presentation only): feet/inch measurements on the main display now show large feet and inch numbers with small gold FEET / INCH labels underneath, a thin vertical divider, a real stacked fraction, and one sign for the whole measurement (− 2 FEET │ 0 INCH). The feet value shows a thousands separator (1,000 FEET).
- Applies to typed and arithmetic feet/inch results (including decimal inches such as 10.5 in), fractional Conv results, roof results (DIAG, RISE, RUN, H/V), Jack, R/Wall, Jack O.C. / Ir/Pitch prompts, Circle DIA / CIRC / ARC, and M-1 / M-2 recalls. Decimal conversion results, history, verification boxes and all other result types are unchanged.
- Implemented as an explicit display helper (measurementHTML / structureMainMeasurement) called by the display writers; no DOM watcher. The element text stays the calculator's canonical text (e.g. "8 ft 9 15/64 in"), so history, memory and the regression suite are unchanged. Screen readers hear e.g. "8 feet 9 and 15/64 inches".
- A long measurement shrinks to fit one line when needed (never below 60%); it never wraps.
- No calculation changes.

## V9.23.26
- Display polish (presentation only): a fraction being entered now uses the structured feet/inch display as soon as it has a numerator and at least one denominator digit (6 Feet 8 Inch 9 / 16 → 6 FEET │ 8 INCH 9/16), so pressing + − × ÷ = no longer changes the look. An incomplete fraction (9 /) stays ordinary text.
- Only the renderer's pattern changed: it now also accepts the live "8-9/16" form and keeps that hyphen in the underlying text. liveOperandText(), finalizedOperandText(), the fraction parser, history and all calculator state are unchanged. No CSS change.
- Regression suite: PREC-01, CONV-20, CIRC-02, MEM-06, MEM-07 graduated; added FRAC-05 and FRAC-06 (canonical live-fraction text).

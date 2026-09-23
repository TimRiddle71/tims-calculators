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

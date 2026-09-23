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

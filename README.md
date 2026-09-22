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

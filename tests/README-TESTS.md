# Trestle Regression Tests

A safety net that presses the **real** Trestle keys and checks the display against
your physical Trig Plus II results. Nothing in the calculator app was changed to
make this work.

## Files

| File | What it is | Do you edit it? |
|---|---|---|
| `tests.html` | The test page you open. Shows the totals and every test with PASS/FAIL. | No |
| `tests/benchmarks.js` | All benchmark data: key sequence, expected display, status, notes. | **Yes — this is where new tests go** |
| `tests/runner.js` | Loads a fresh copy of the app for each test, clicks the real buttons, and reads the display. | No |
| `tests/README-TESTS.md` | This guide. | Optional |

None of these files are listed in `sw.js`, so they are never stored in the app's
offline cache and never ship as part of the installed app.

## Running the tests

1. Open the calculator the way you normally do in a desktop browser (Chrome or Edge work best).
2. In the address bar, replace the end of the address (`index.html`, or nothing) with `tests.html` and press Enter.
3. If a yellow banner says the offline cache holds older files, click **Load the latest files**. This ensures you are testing the newest build.
4. Click **Run all tests**. It takes about 20–60 seconds, and you can watch the calculator being pressed on the right.
5. Read the green or red bar at the top:
   - **Green** means there are no unexpected failures.
   - **Red** means something that used to match no longer does. Look for the red cards.
6. Optionally, tick **Show only failures & now-passing** to shorten the list, or click **Copy text report** to paste the results into a chat.

The page does not work if you double-click `tests.html` from a folder, because
browsers block the app from loading that way. Always open it from the same web
address as the calculator.

## Result colors

- **PASS** (green): matches the benchmark.
- **UNEXPECTED FAIL** (red): a regression. It used to match, and now it doesn't.
- **KNOWN FAIL** (amber): a physically confirmed behavior this version doesn't implement yet.
- **NOW PASSING** (blue): a known failure that now matches. Delete its `knownFail` line in `benchmarks.js`.
- **PENDING** (gray): needs a physical test. The page shows what Trestle does today, and these are never counted as failures.

## Adding a new physical benchmark

1. Run the sequence on the Trig Plus II and write down exactly what the display shows.
2. Open `tests/benchmarks.js`, copy a similar `T({ ... });` block, and change:
   - `id`
   - `name`
   - `category`
   - `keys`
   - `expect`
   - `status: VALIDATED`
3. If the current Trestle version doesn't do it yet, add `knownFail: "short reason"`.
4. Save, refresh `tests.html`, and click **Run all tests**.

To turn a PENDING test into a real test, fill in `expect` with your physical
result and change `status: PENDING` to `status: VALIDATED`.

## Comparison rules

**Permanent rule:** the physical Trig Plus II never uses thousands separators.
Always write physical results without commas (for example `2000`, `61023.74`).
Trestle's commas are an intentional UI improvement, so they are ignored when
comparing and are never counted as a defect. The commas themselves are guarded by
the separate **Trestle UI Formatting** tests (`match: "trestle-exact"`).

These differences are treated as equal:

- extra spaces
- `−` versus `-`
- `8-19/64` versus `8 19/64`
- digit-grouping commas (`2,000` versus `2000`)

Nothing else is ignored. Tests marked `match: "units-loose"` also treat `sq. ft.`
and `sq ft` as equal. That is used only where the physical punctuation was never
recorded, or where the punctuation is checked by its own separate test (FMT-01).

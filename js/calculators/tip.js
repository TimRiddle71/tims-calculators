// Tip Calculator — manual version of Tim's iPhone Tip Shortcut (added V9.24.0).
//
// TIM'S CALCULATORS TIP RULE (intentional; supersedes the Shortcut wherever it differs):
//   tip   = pre-tax subtotal × tip %, TRUNCATED DOWN to a whole cent (never rounded up)
//   total = subtotal + tax + that SAME whole-cent tip
// The displayed tip and the tip used in the total are the same integer number of
// cents, so there is never a hidden fractional cent in the total.
//
// All arithmetic is exact integer math. Money is held as whole cents (integers)
// read directly from the typed digits; the tip percent is held as an exact decimal
// fraction (numerator / power-of-ten denominator) read from its text. The tip is
// computed with BigInt integer division, which truncates. No binary floating point
// is used anywhere in the calculation, so e.g. 20.00 × 18% = exactly $3.60 cannot
// become $3.59 through float error.
//
// Examples: 43.67 + 3.61 tax, 18% → exact 7.8606 → tip $7.86, total $55.14
//           10.25, 18% → exact 1.845 → tip $1.84, total $12.09
//           10.75, 18% → exact 1.935 → tip $1.93, total $12.68

// Currency text → whole cents (integer). Blank → null. Invalid → NaN.
// Accepts: 10  10.2  10.25  $10.25  1,250.50  $1,250.50  (and .5 / 10.)
// Rejects (NaN): more than two decimal places (10.255) — a typed currency amount
// is never silently rounded — and misplaced commas (1,2,5).
export function parseCents(text){
  const s=String(text??"").trim().replace(/^\$\s*/,"");
  if(s==="") return null;
  if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d*)?$/.test(s) || !/\d/.test(s)) return NaN;
  const [whole,frac=""]=s.replace(/,/g,"").split(".");
  if(frac.length>2) return NaN;
  return Number(whole||"0")*100+Number((frac+"00").slice(0,2));
}

// Percent text ("18", "17.5", ".5") → exact fraction {num, den, text}. Blank → null. Invalid → NaN.
// Percentages may carry more decimal places than currency (e.g. 17.5%).
export function parsePercent(text){
  const s=String(text??"").trim();
  if(s==="") return null;
  if(!/^\d*\.?\d*$/.test(s) || s===".") return NaN;
  const [whole,frac=""]=s.split(".");
  const tidyWhole=(whole||"0").replace(/^0+(?=\d)/,"");
  const tidyFrac=frac.replace(/0+$/,"");
  return {
    num: BigInt((whole||"0")+frac),           // e.g. "17.5" → 175
    den: 10n**BigInt(frac.length),            //          → 10
    text: tidyFrac ? `${tidyWhole}.${tidyFrac}` : tidyWhole
  };
}

// Tip in whole cents = floor(subtotalCents × num ÷ (100 × den)).
// BigInt division truncates toward zero; every input here is ≥ 0, so that is floor.
export function tipCents(subtotalCents,pct){
  return Number(BigInt(subtotalCents)*pct.num/(100n*pct.den));
}

// Whole cents → "$1,475.59" without converting through a binary fraction.
export function formatCents(cents){
  const dollars=Math.trunc(cents/100), rest=cents%100;
  return `$${dollars.toLocaleString("en-US")}.${String(rest).padStart(2,"0")}`;
}

export function initTip(){
  const $=s=>document.querySelector(s);
  const sub=$("#tipSubtotal"), tax=$("#tipTax"), custom=$("#tipCustom"), customWrap=$("#tipCustomWrap");
  const buttons=[...document.querySelectorAll("[data-tip-pct]")];
  const DEFAULT_PCT="18";                          // approved real default
  let pct=parsePercent(DEFAULT_PCT);
  let usingCustom=false;

  function selectButton(btn){
    buttons.forEach(b=>{const on=b===btn;b.classList.toggle("active",on);b.setAttribute("aria-pressed",on?"true":"false")});
  }
  function currentPercent(){ return usingCustom ? parsePercent(custom.value) : pct; }
  function noResult(note){ $("#tipAmount").textContent="—"; $("#tipTotal").textContent="—"; $("#tipNote").textContent=note; }

  function calc(){
    const s=parseCents(sub.value), t=parseCents(tax.value), p=currentPercent();
    const validPct = p!==null && !Number.isNaN(p);
    $("#tipLabel").textContent = validPct ? `${p.text}% TIP` : "TIP";
    if(Number.isNaN(s) || Number.isNaN(t) || Number.isNaN(p)) return noResult("Check the amounts entered.");
    if(s===null) return noResult("Enter the subtotal from the receipt.");
    if(p===null) return noResult("Enter a tip percentage.");
    const tc=tipCents(s,p);          // the ONE whole-cent tip: shown and used in the total
    const taxC=t??0;                 // blank tax = $0
    $("#tipAmount").textContent=formatCents(tc);
    $("#tipTotal").textContent=formatCents(s+taxC+tc);
    $("#tipNote").textContent="Tip is calculated on the pre-tax subtotal.";
  }

  buttons.forEach(b=>b.addEventListener("click",()=>{
    selectButton(b);
    if(b.dataset.tipPct==="custom"){ usingCustom=true; customWrap.classList.remove("hidden"); custom.focus(); }
    else { usingCustom=false; pct=parsePercent(b.dataset.tipPct); customWrap.classList.add("hidden"); }
    calc();
  }));
  [sub,tax,custom].forEach(el=>{
    el.addEventListener("input",calc);
    el.addEventListener("focus",()=>setTimeout(()=>el.select(),0));   // tap selects the whole value
  });
  $("#resetTip").addEventListener("click",()=>{
    sub.value=""; tax.value=""; custom.value=""; usingCustom=false; pct=parsePercent(DEFAULT_PCT);
    customWrap.classList.add("hidden");
    selectButton(buttons.find(b=>b.dataset.tipPct===DEFAULT_PCT)); calc();
  });
  calc();
}

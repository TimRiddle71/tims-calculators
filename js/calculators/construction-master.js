
const $=s=>document.querySelector(s);

let entry="";
let wholeInches=0;
let enteredFeet=0;
let enteredInches=0;
let hasFeet=false;
let hasInches=false;
let hasUnits=false;
let fractionNumerator=null;
let fractionDenominatorText="";

let acc=null, accKind=null, op=null, result=0, resultKind="length", justEquals=false, convArmed=false;
let conversionMode=null; // null, ftDecimal, inDecimal, or inFraction.

// V9.16 EXP entry: mantissa × 10^exponent.
let expMode=false, expBase=null, expDigits="", expNegative=false;

// V9.17 d:m:s toggle: decimal degrees ↔ degrees/minutes/seconds.
let dmsValue=null;
let dmsStage=null; // "deg" or "dms"

// V9.18 cubic-unit entry. Internal volume unit is cubic inches.
let cubicArmed=false;

// V9.19 square-unit entry. Internal area unit is square inches.
let squareArmed=false;

// V9.21 linear metric/yard entry and conversion. Internal length unit remains inches.
let metricEntryUnit=null;
let metricEntryValue=null;
// V9.21.3: remember whether an inch-only entry was typed with a decimal.
let inchEntryWasDecimal=false;

// V9.0 roof-triangle memory. Lengths are stored internally in inches.
let roofRun=null, roofRise=null, roofDiag=null, roofPitch=null, roofHipV=null;
let roofEnteredRun=null, roofEnteredRise=null, roofEnteredDiag=null;

// V9.4.1 Jack memory. O.C. defaults to the physical calculator's 16 in setting.
let jackOC=16;
let irregularPitchSlope=null; // rise/run, e.g. 8/12
let storArmed=false;
let storedCandidate=null;
// V9.22 general memories. The physical Trig Plus II exposes M-1 and M-2.
let memoryRegisters={1:{value:0,kind:"scalar"},2:{value:0,kind:"scalar"}};
let recallArmed=false;
let recalledValue=null;
let jackMode="jk";
let jackIndex=0;
let clearPending=false; // First C clears the current entry/result; second consecutive C clears all.
let percentJustApplied=false; // V9.23: repeated standalone % is an invalid physical-calculator state.

// V9.6 R/Wall memory. Tim uses the Trig Plus II default 16 in rake-wall spacing.
const rwallOC=16;
let rwallIndex=0;
let rwallActive=false; // After Conv → Diag starts R/Wall, plain Diag advances the active RW sequence.

// V9.9 Circle memory. Circ cycles DIA → AREA → CIRC → DIA; gold Arc uses the stored diameter.
let circleDiameter=null; // inches
let circleAreaUnit="in"; // "in" for inch-only entry, otherwise "ft"
let circleStage=0;
// V9.23.10 TEMPORARY: true only while the Circle AREA result is the active result.
// Lets that physically validated result become operand #1 (10 in Circ Circ × 2 =
// 157.0796 sq. in.). Remove this flag and its setOp() exception when R1 /
// general completed-result chaining is implemented.
let circleAreaResult=false;
// V9.23.13 (R1) completed-result chaining and repeated equals.
// resultChainable: the displayed result came from a completed "=" operation or a
//   standalone Sq/Cu entry, so an operator key may use it as operand #1
//   (physical: 5 × 5 = × 2 = 50; 24 sq. ft. × 6 ft = 144 cu. ft.).
// replayArmed / lastReplay: the most recent completed "=" operation, replayed by
//   pressing = again (physical: 5 × 5 = = 125; 5 + 2 = = 9; 10 ft + 2 ft = = 14 ft).
//   lastReplay keeps the numeric value AND dimensional kind of operand #2.
// Both flags are cleared by resetOperand(), so any other new entry or function
// result ends them. Results of roof, Jack, R/Wall, trig, √, 1/x, DMS, %, EXP,
// conversions, memory and errors are NOT made chainable (not physically tested).
let resultChainable=false;
let replayArmed=false;
let lastReplay=null; // {op, value, kind, text}
// Single C after a completed "=" operation hides the result but keeps it
// recoverable (physical: 5 × 5 = C = → 25, then = → 125). Holds
// {value, kind, parts, replay}. Double C and AC destroy it (via clearAll /
// resetOperand); any other new entry or result also ends it (resetOperand).
let clearedCompleted=null;
// V9.23.14 (R2) unit context, limited to physically validated cases.
//   "ft" = feet or mixed feet/inches length entry, or Sq Feet / Cu Feet entry
//   "in" = whole/decimal inch-only length entry (no feet, no fraction)
//   "m"  = metre length entry
//   null = any other or unknown context (mm, yd, fractional inches, memory,
//          other Sq/Cu units, ×/÷ results, mixed-unit sums) → behavior unchanged
// accUnit belongs to the pending accumulator; resultUnit to a completed result
// (so it survives chaining and repeated equals, e.g. 10 ft + 2 ft = + 3 = 15 ft).
let accUnit=null;
let resultUnit=null;
// V9.23.15: inch PRESENTATION of operand #1 (physical: 8.5 in + 2 = 10.5 in;
// 8 3/32 in + 2.5 = 10 19/32 in). true = decimal inches, false = whole/fractional.
// Only meaningful while accUnit/resultUnit is "in"; operand #2 never changes it.
let accInchDecimal=false;
let resultInchDecimal=false;
// Internal units per 1 inherited unit. Same values as feet() (×12), inches() (×1),
// setLinearMetricUnit() m (×39.37007874015748), setSquareUnit() ft (144) and
// setCubicUnit() ft (1728); only the validated contexts are listed.
const R2_INHERIT={length:{ft:12,in:1,m:39.37007874015748},area:{ft:144},volume:{ft:1728}};
const R2_LABEL={length:{ft:"ft",in:"in",m:"m"},area:{ft:"sq. ft."},volume:{ft:"cu. ft."}};
// Unit context of the operand currently being typed (read before resetOperand()).
function typedUnitContext(){
  if(!hasUnits) return null;
  if(metricEntryUnit) return metricEntryUnit==="m" ? "m" : null;
  if(hasFeet) return "ft";                                // feet or mixed feet/inches → FEET
  if(hasInches) return "in";                               // inch-only entry: whole, decimal or fractional (V9.23.15)
  return null;
}
// V9.23.15: presentation of an inch entry — decimal only when typed with a
// decimal point and no fraction (reuses the existing inchEntryWasDecimal flag).
function typedInchDecimal(){
  const fractionUsed=fractionNumerator!==null || Math.abs(wholeInches-enteredInches-enteredFeet*12)>1e-9;
  return inchEntryWasDecimal && !fractionUsed;
}
// R2: dimensional operand #1 ± plain scalar operand #2 → the scalar becomes a
// real dimensional operand in operand #1's unit. Asymmetric: scalar ± dimension
// is untouched (still Error 3). + and − only.
function inheritScalar(o,v,kind,text){
  if((o==="add" || o==="subtract") && kind==="scalar" && accKind && accKind!=="scalar" &&
     accUnit && R2_INHERIT[accKind] && R2_INHERIT[accKind][accUnit]){
    return {v:v*R2_INHERIT[accKind][accUnit], kind:accKind, text:`${text} ${R2_LABEL[accKind][accUnit]}`, unit:accUnit};
  }
  return null;
}
// Unit context of the accumulator after combining with operand #2.
function combinedUnit(o,unit2){
  if(o!=="add" && o!=="subtract") return null;       // ×, ÷: unchanged behavior, no unit context
  return (accUnit && unit2===accUnit) ? accUnit : null;
}

// Separate human-facing expression history from normalized calculation values.
let expressionParts=[];
let committedOperandText="";

const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const clean=n=>Math.abs(n)<1e-12?0:n;
const dec=(n,d=6)=>clean(n).toLocaleString(undefined,{maximumFractionDigits:d,useGrouping:true});

function roundedFraction(value,den=64){
  const sign=value<0?"−":"", a=Math.abs(value);
  let whole=Math.floor(a+1e-10), n=Math.round((a-whole)*den), d=den;
  if(n===den){whole++;n=0}
  if(n){const g=gcd(n,d);n/=g;d/=g}
  return {sign,whole,n,d};
}
function inchesOnly(value){
  const f=roundedFraction(value,64);
  let body=String(f.whole);
  if(f.n) body+=`${f.whole?" ":""}${f.n}/${f.d}`;
  return `${f.sign}${body} in`;
}
function feetInches(value){
  const neg=value<0, a=Math.abs(value);
  let ft=Math.floor(a/12+1e-10);
  const rem=a-ft*12, f=roundedFraction(rem,64);
  let iw=f.whole;
  if(iw>=12){ft++;iw-=12}
  let ins=String(iw);
  if(f.n) ins+=` ${f.n}/${f.d}`;
  return `${neg?"−":""}${ft} ft ${ins} in`;
}

function fractionValue(){
  const den=Number(fractionDenominatorText);
  return fractionNumerator!==null && den>0 ? fractionNumerator/den : 0;
}
function pendingNumeric(){
  if(fractionNumerator!==null) return fractionValue();
  return entry===""?0:Number(entry)||0;
}
function operandValue(){ return wholeInches+pendingNumeric(); }
function hasOperand(){ return hasUnits || entry!=="" || fractionNumerator!==null; }
function operandKind(){ return hasUnits ? "length" : "scalar"; }

function liveOperandText(){
  if(metricEntryUnit && metricEntryValue!==null) return `${dec(metricEntryValue,6)} ${metricEntryUnit}`;
  const parts=[];
  if(hasFeet) parts.push(`${dec(enteredFeet,6)} ft`);

  if(hasInches){
    let inchText=dec(enteredInches,6);
    if(fractionNumerator!==null){
      inchText += `-${fractionNumerator}/${fractionDenominatorText}`;
      parts.push(`${inchText} in`);
      return parts.join(" ");
    }
    parts.push(`${inchText} in`);
  }

  if(fractionNumerator!==null){
    const f=`${fractionNumerator}/${fractionDenominatorText}`;
    if(!hasInches) parts.push(f);
  } else if(entry!==""){
    parts.push(entry);
  }
  return parts.join(" ") || "0";
}

function finalizedOperandText(){
  if(metricEntryUnit && metricEntryValue!==null) return `${dec(metricEntryValue,6)} ${metricEntryUnit}`;
  // Preserve entered units and decimal style, but normalize inch + fraction visually.
  const parts=[];
  if(hasFeet) parts.push(`${dec(enteredFeet,6)} ft`);
  let inchVal=enteredInches;
  if(fractionNumerator!==null && Number(fractionDenominatorText)>0)
    inchVal += fractionNumerator/Number(fractionDenominatorText);

  if(hasInches || (fractionNumerator!==null && Number(fractionDenominatorText)>0)){
    const f=roundedFraction(inchVal,64);
    let body=String(f.whole);
    if(f.n) body+=`${f.whole?" ":""}${f.n}/${f.d}`;
    parts.push(`${body} in`);
  } else if(entry!==""){
    parts.push(entry);
  }
  return parts.join(" ") || "0";
}

function operatorSymbol(o){return {add:"+",subtract:"−",multiply:"×",divide:"÷"}[o]}

function liveExpression(){
  const bits=[...expressionParts];
  if(hasOperand()) bits.push(liveOperandText());
  return bits.join(" ");
}

function render(){
  const live=hasOperand();
  if(live){
    $("#cmMain").textContent=liveOperandText();
  }else if(resultKind==="area"){
    $("#cmMain").textContent=`${dec(result/144,6)} sq ft`;
  }else if(resultKind==="volume"){
    $("#cmMain").textContent=`${dec(result/1728,6)} cu ft`;
  }else if(resultKind==="scalar"){
    $("#cmMain").textContent=dec(result,6);
  }else if(resultUnit==="in"){
    // V9.23.14 (R2): 10 in + 2 in = 12 in. V9.23.15: decimal-inch operand #1 keeps
    // decimal presentation (same format as Conv → Inch decimal), otherwise fractional.
    $("#cmMain").textContent=resultInchDecimal ? `${dec(result,6)} in` : inchesOnly(result);
  }else if(resultUnit==="m"){
    $("#cmMain").textContent=`${dec(result*0.0254,6)} m`;   // V9.23.14 (R2): 2 m + 3 m = 5 m
  }else{
    $("#cmMain").textContent=feetInches(result);
  }

  const expr=liveExpression();
  $("#cmHistory").textContent=expr || (justEquals ? expressionParts.join(" ") : "Ready");

  const exactLabel=$("#cmExact").previousElementSibling;
  const feetLabel=$("#cmFeet").previousElementSibling;

  if(live){
    const v=operandValue();
    exactLabel.textContent=hasUnits ? "EXACT INCHES" : "VALUE";
    feetLabel.textContent=hasUnits ? "DECIMAL FEET" : "VALUE";
    $("#cmExact").textContent=hasUnits ? `${dec(v,6)} in` : "—";
    $("#cmFeet").textContent=hasUnits ? `${dec(v/12,6)} ft` : "—";
  }else if(resultKind==="length"){
    exactLabel.textContent="EXACT INCHES";
    feetLabel.textContent="DECIMAL FEET";
    $("#cmExact").textContent=`${dec(result,6)} in`;
    $("#cmFeet").textContent=`${dec(result/12,6)} ft`;
  }else if(resultKind==="area"){
    exactLabel.textContent="SQUARE INCHES";
    feetLabel.textContent="SQUARE FEET";
    $("#cmExact").textContent=`${dec(result,6)} sq in`;
    $("#cmFeet").textContent=`${dec(result/144,6)} sq ft`;
  }else if(resultKind==="volume"){
    exactLabel.textContent="CUBIC INCHES";
    feetLabel.textContent="CUBIC FEET";
    $("#cmExact").textContent=`${dec(result,6)} cu in`;
    $("#cmFeet").textContent=`${dec(result/1728,6)} cu ft`;
  }else{
    exactLabel.textContent="VALUE";
    feetLabel.textContent="VALUE";
    $("#cmExact").textContent="—";
    $("#cmFeet").textContent="—";
  }

  if(convArmed){
    $("#cmAlt").textContent="CONV — choose ft or in";
  }else if(justEquals){
    $("#cmAlt").textContent="";
  }else{
    $("#cmAlt").textContent="Enter dimensions with ft / in keys.";
  }
}

function resetOperand(){
  entry=""; wholeInches=0; enteredFeet=0; enteredInches=0;
  hasFeet=false; hasInches=false; hasUnits=false;
  fractionNumerator=null; fractionDenominatorText="";
  metricEntryUnit=null; metricEntryValue=null; inchEntryWasDecimal=false;
  circleAreaResult=false; // V9.23.10 temporary: any new entry/result ends the Circle AREA exception.
  resultChainable=false; replayArmed=false; // V9.23.13 (R1): any new entry/result ends chaining/replay.
  clearedCompleted=null; // V9.23.13 (R1): only the key right after a single C can restore it
  resultUnit=null; // V9.23.14 (R2): set again only where a validated result is produced
  resultInchDecimal=false; // V9.23.15
}
function startFreshIfNeeded(){
  if(justEquals && op===null){
    result=0;resultKind="length";acc=null;accKind=null;expressionParts=[];justEquals=false;cubicArmed=false;resetOperand();
  }
}
function digit(d){
  percentJustApplied=false;
  conversionMode=null;
  if(storArmed && (d==="1" || d==="2")){ storeRegister(Number(d)); return; }
  if(recallArmed && (d==="1" || d==="2")){ recallRegister(Number(d)); return; }
  if(expMode){
    expDigits=(expDigits==="0")?d:expDigits+d;
    renderExp();
    return;
  }
  rwallActive=false;
  recalledValue=null; recallArmed=false;
  startFreshIfNeeded();
  if(fractionNumerator!==null) fractionDenominatorText+=d;
  else entry=(entry==="0")?d:entry+d;
  render();
}
function decimal(){
  percentJustApplied=false;
  conversionMode=null;
  if(expMode) return;
  startFreshIfNeeded();
  if(fractionNumerator!==null) return;
  if(!entry.includes(".")) entry=entry===""?"0.":entry+".";
  render();
}
function cubicKey(){
  startFreshIfNeeded();
  if(entry==="" || hasUnits || fractionNumerator!==null){ return; }
  cubicArmed=true;
  convArmed=false;
  $("#cmMain").textContent=`${entry} CU`;
  $("#cmHistory").textContent="Cubic unit entry";
  $("#cmAlt").textContent="Choose ft, in, yd, m, or mm";
}
function setCubicUnit(unit){
  if(!cubicArmed || entry==="") return false;
  const n=Number(entry)||0;
  const factors={in:1,ft:1728,yd:46656,m:61023.7440947323,mm:0.0000610237440947323};
  const labels={in:"cu. in.",ft:"cu. ft.",yd:"cu. yd.",m:"cu. m",mm:"cu. mm"};
  const volumeDisplay=`${dec(n,6)} ${labels[unit]}`;
  // V9.23.8: when Cu -> unit is used as operand #2, preserve the active
  // arithmetic operation (same pattern as V9.23.5 Sq entry). The display
  // label keeps the history in the entered cubic unit rather than the
  // memoryValueText() cubic-yard fallback.
  const inActiveCalculation=(op!==null && acc!==null);
  result=n*factors[unit]; resultKind="volume"; convArmed=false; cubicArmed=false;
  resetOperand();
  if(inActiveCalculation){
    recalledValue={value:result,kind:"volume",display:volumeDisplay};
    justEquals=false;
  }else{
    recalledValue=null;
    justEquals=true;
    acc=null;accKind=null;op=null;expressionParts=[];
    resultChainable=true; // V9.23.13 (R1): completed cubic entry can start a calculation
    resultUnit=unit==="ft"?"ft":null; // V9.23.14 (R2): 20 cu. ft. + 5 = 25 cu. ft.
  }
  $("#cmMain").textContent=volumeDisplay;
  $("#cmHistory").textContent=inActiveCalculation ? `${expressionParts.join(" ")} ${volumeDisplay}` : "Cubic unit entry";
  $("#cmExact").previousElementSibling.textContent="CUBIC INCHES";
  $("#cmFeet").previousElementSibling.textContent="CUBIC FEET";
  $("#cmExact").textContent=`${dec(result,6)} cu in`;
  $("#cmFeet").textContent=`${dec(result/1728,6)} cu ft`;
  $("#cmAlt").textContent="";
  return true;
}
function showCubicConverted(unit){
  // V9.20.3: keep the internal result in cubic inches so conversions can be
  // chained (for example m³ → ft³ → in³). Inch was missing from this map.
  const factors={in:1,ft:1728,yd:46656,m:61023.7440947323,mm:0.0000610237440947323};
  const labels={in:"cu. in.",ft:"cu. ft.",yd:"cu. yd.",m:"cu. m",mm:"cu. mm"};
  const v=result/factors[unit];
  const sourceDisplay=$("#cmMain").textContent;
  convArmed=false; conversionMode=null; justEquals=true;
  // Match physically validated Trig Plus II display precision.
  // 1 m³ → ft³ = 35.31467; then → in³ = 61023.74.
  const shown = unit==="in" ? dec(v,2)
    : (unit==="ft" && Math.abs(v-Math.round(v))>1e-12 ? dec(v,5) : dec(v,6));
  const convertedDisplay=`${shown} ${labels[unit]}`;
  $("#cmMain").textContent=convertedDisplay;
  $("#cmHistory").textContent=`${sourceDisplay} → ${convertedDisplay}`;
  $("#cmExact").previousElementSibling.textContent="CUBIC INCHES";
  $("#cmFeet").previousElementSibling.textContent="CUBIC FEET";
  $("#cmExact").textContent=`${dec(result,6)} cu in`;
  $("#cmFeet").textContent=`${dec(result/1728,6)} cu ft`;
  $("#cmAlt").textContent="";
}
function cubicUnitKey(unit){
  if(convArmed && resultKind==="volume" && !hasOperand()){ showCubicConverted(unit); return; }
  if(setCubicUnit(unit)) return;
  convArmed=false;
  $("#cmAlt").textContent=`${unit} cubic behavior requires Cu first.`;
}

function squareKey(){
  startFreshIfNeeded();
  if(entry==="" || hasUnits || fractionNumerator!==null){ return; }
  squareArmed=true;
  cubicArmed=false;
  convArmed=false;
  $("#cmMain").textContent=`${entry} SQ`;
  $("#cmHistory").textContent="Square unit entry";
  $("#cmAlt").textContent="Choose ft, in, yd, m, or mm";
}
function setSquareUnit(unit){
  if(!squareArmed || entry==="") return false;
  const n=Number(entry)||0;
  const factors={in:1,ft:144,yd:1296,m:1550.0031000062,mm:0.0015500031000062};
  const labels={in:"sq. in.",ft:"sq. ft.",yd:"sq. yd.",m:"sq. m",mm:"sq. mm"};
  const areaValue=n*factors[unit];
  const areaDisplay=`${dec(n,6)} ${labels[unit]}`;
  // V9.23.5: when Sq -> unit is used as operand #2, preserve the active
  // arithmetic operation. The physical calculator keeps, for example,
  // 120 cu. ft. ÷ pending while 30 -> Sq -> Feet becomes 30 sq. ft.
  const inActiveCalculation=(op!==null && acc!==null);
  result=areaValue; resultKind="area"; convArmed=false; squareArmed=false; cubicArmed=false;
  resetOperand();
  if(inActiveCalculation){
    recalledValue={value:areaValue,kind:"area"};
    justEquals=false;
  }else{
    recalledValue=null;
    justEquals=true;
    acc=null;accKind=null;op=null;expressionParts=[];
    resultChainable=true; // V9.23.13 (R1): physical 24 sq. ft. × 6 ft = 144 cu. ft.
    resultUnit=unit==="ft"?"ft":null; // V9.23.14 (R2): 20 sq. ft. + 5 = 25 sq. ft.
  }
  $("#cmMain").textContent=areaDisplay;
  $("#cmHistory").textContent=inActiveCalculation ? `${expressionParts.join(" ")} ${areaDisplay}` : "Square unit entry";
  $("#cmExact").previousElementSibling.textContent="SQUARE INCHES";
  $("#cmFeet").previousElementSibling.textContent="SQUARE FEET";
  $("#cmExact").textContent=`${dec(result,6)} sq in`;
  $("#cmFeet").textContent=`${dec(result/144,6)} sq ft`;
  $("#cmAlt").textContent="";
  return true;
}
function showSquareConverted(unit){
  const factors={in:1,ft:144,yd:1296,m:1550.0031000062,mm:0.0015500031000062};
  const labels={in:"sq. in.",ft:"sq. ft.",yd:"sq. yd.",m:"sq. m",mm:"sq. mm"};
  const v=result/factors[unit];
  const sourceDisplay=$("#cmMain").textContent;
  convArmed=false; conversionMode=null; justEquals=true;
  const convertedDisplay=`${dec(v,6)} ${labels[unit]}`;
  $("#cmMain").textContent=convertedDisplay;
  $("#cmHistory").textContent=`${sourceDisplay} → ${convertedDisplay}`;
  $("#cmExact").previousElementSibling.textContent="SQUARE INCHES";
  $("#cmFeet").previousElementSibling.textContent="SQUARE FEET";
  $("#cmExact").textContent=`${dec(result,6)} sq in`;
  $("#cmFeet").textContent=`${dec(result/144,6)} sq ft`;
  $("#cmAlt").textContent="";
}
function setLinearMetricUnit(unit){
  if(!["m","mm","yd"].includes(unit) || entry==="" || hasUnits || fractionNumerator!==null) return false;
  const n=Number(entry)||0;
  const inches = unit==="m" ? n*39.37007874015748 : unit==="mm" ? n/25.4 : n*36;
  entry=""; wholeInches=inches; hasUnits=true;
  metricEntryUnit=unit; metricEntryValue=n;
  convArmed=false; conversionMode=null; justEquals=false;
  render();
  return true;
}
function showLinearMetricConverted(unit){
  const sourceDisplay=$("#cmMain").textContent;
  const raw=valueForConversion();
  const inches=(hasOperand() && operandKind()==="scalar") ? raw : raw;
  const v=unit==="m" ? inches*0.0254 : unit==="mm" ? inches*25.4 : inches/36;
  result=inches; resultKind="length"; justEquals=true; convArmed=false; conversionMode=null;
  resetOperand(); expressionParts=[]; acc=null; accKind=null; op=null;
  const convertedDisplay=`${dec(v,6)} ${unit}`;
  $("#cmMain").textContent=convertedDisplay;
  $("#cmHistory").textContent=`${sourceDisplay} → ${convertedDisplay}`;
  $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
  $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
  $("#cmExact").textContent=`${dec(inches,6)} in`;
  $("#cmFeet").textContent=`${dec(inches/12,6)} ft`;
  $("#cmAlt").textContent="";
}
function dimensionalUnitKey(unit){
  if(convArmed && resultKind==="area" && !hasOperand()){ showSquareConverted(unit); return; }
  if(convArmed && resultKind==="volume" && !hasOperand()){ showCubicConverted(unit); return; }
  if(setSquareUnit(unit)) return;
  if(setCubicUnit(unit)) return;
  if(["m","mm","yd"].includes(unit) && convArmed){ showLinearMetricConverted(unit); return; }
  if(["m","mm","yd"].includes(unit)){
    startFreshIfNeeded();
    if(setLinearMetricUnit(unit)) return;
  }
  convArmed=false;
  $("#cmAlt").textContent=`${unit} requires Sq or Cu first.`;
}
function valueForConversion(){
  if(hasOperand()) return operandValue();
  return result;
}
function showConverted(unit){
  const sourceDisplay=$("#cmMain").textContent;
  const live=hasOperand();
  const liveKind=operandKind();
  const raw=live ? operandValue() : result;

  // Trig Plus II conversion semantics validated in V9.15:
  // - A unitless number followed by Conv → Feet is interpreted as decimal feet.
  // - A dimensional length followed by Conv → Feet is shown as decimal feet.
  // - Conv → Inch shows decimal inches; repeating Conv → Inch toggles to fractional inches.
  let vInches;
  if(unit==="ft" && live && liveKind==="scalar") vInches=raw*12;
  else if(unit==="in" && live && liveKind==="scalar") vInches=raw;
  else vInches=raw;

  const repeatInch = unit==="in" && conversionMode==="inDecimal" && !live;
  const repeatFeetFraction = unit==="ft" && conversionMode==="ftDecimal" && !live;
  // V9.20.1: the physical Trig Plus II displays linear metric -> Feet
  // as feet + fractional inches (e.g. 1 m -> 3 ft 3-3/8 in), not decimal feet.
  const metricToFeet = unit==="ft" && live && liveKind==="length" && metricEntryUnit!==null;
  // V9.21.2: the physical Trig Plus II also displays an inch-only
  // dimensional value converted to Feet as feet + fractional inches
  // (e.g. 50 in -> 4 ft 2 in). Mixed ft/in values keep the separately
  // validated decimal-feet behavior from V9.15.
  const inchesOnlyToFeet = unit==="ft" && live && liveKind==="length" && hasInches && !hasFeet && metricEntryUnit===null && !inchEntryWasDecimal;
  const decimalInchesToFeet = unit==="ft" && live && liveKind==="length" && hasInches && !hasFeet && metricEntryUnit===null && inchEntryWasDecimal;
  // V9.21.6: A directly entered decimal feet value toggles to feet + fractional inches
  // on the first Conv → Feet press, matching the physical Trig Plus II.
  const directFeetToFraction = unit==="ft" && live && liveKind==="length" && hasFeet && !hasInches && metricEntryUnit===null && Number.isFinite(enteredFeet) && !Number.isInteger(enteredFeet);

  result=vInches;
  resetOperand();
  expressionParts=[];
  acc=null; accKind=null; op=null; resultKind="length"; justEquals=true; convArmed=false;

  const exactLabel=$("#cmExact").previousElementSibling;
  const feetLabel=$("#cmFeet").previousElementSibling;
  exactLabel.textContent="EXACT INCHES";
  feetLabel.textContent="DECIMAL FEET";
  $("#cmExact").textContent=`${dec(vInches,6)} in`;
  $("#cmFeet").textContent=`${dec(vInches/12,6)} ft`;
  $("#cmAlt").textContent="";

  if(metricToFeet || inchesOnlyToFeet || directFeetToFraction || repeatFeetFraction){
    conversionMode="ftInFraction";
    $("#cmMain").textContent=feetInches(vInches);
    $("#cmHistory").textContent=`${sourceDisplay} → ${$("#cmMain").textContent}`;
  }else if(unit==="ft" || decimalInchesToFeet){
    conversionMode="ftDecimal";
    $("#cmMain").textContent=`${dec(vInches/12,6)} ft`;
    $("#cmHistory").textContent=`${sourceDisplay} → ${$("#cmMain").textContent}`;
  }else if(unit==="in"){
    // V9.21.8: Conv → Inch toggles between fractional inches and decimal
    // inches, matching the physical Trig Plus II. Keep the unrounded internal
    // inch value so 80.333 -> 80 21/64 -> 80.333 rather than converting the
    // rounded fraction back to a different decimal value.
    if(conversionMode==="inFraction" && !live){
      conversionMode="inDecimal";
      $("#cmMain").textContent=`${dec(vInches,6)} in`;
    }else{
      conversionMode="inFraction";
      $("#cmMain").textContent=inchesOnly(vInches);
    }
    $("#cmHistory").textContent=`${sourceDisplay} → ${$("#cmMain").textContent}`;
  }else{
    conversionMode="inDecimal";
    $("#cmMain").textContent=`${dec(vInches,6)} in`;
    $("#cmHistory").textContent=`${sourceDisplay} → ${$("#cmMain").textContent}`;
  }
}

function feet(){
  if(squareArmed){ setSquareUnit("ft"); return; }
  if(cubicArmed){ setCubicUnit("ft"); return; }
  if(convArmed && resultKind==="area" && !hasOperand()){ showSquareConverted("ft"); return; }
  if(convArmed && resultKind==="volume" && !hasOperand()){ showCubicConverted("ft"); return; }
  if(convArmed){ showConverted("ft"); return; }
  startFreshIfNeeded();
  if(fractionNumerator!==null || entry==="") return;
  const n=Number(entry)||0;
  enteredFeet+=n; hasFeet=true; wholeInches+=n*12; hasUnits=true; entry="";
  render();
}
function inches(){
  if(squareArmed){ setSquareUnit("in"); return; }
  if(cubicArmed){ setCubicUnit("in"); return; }
  if(convArmed && resultKind==="area" && !hasOperand()){ showSquareConverted("in"); return; }
  if(convArmed && resultKind==="volume" && !hasOperand()){ showCubicConverted("in"); return; }
  if(convArmed){ showConverted("in"); return; }
  startFreshIfNeeded();

  if(fractionNumerator!==null){
    const den=Number(fractionDenominatorText);
    if(den>0){
      wholeInches+=fractionNumerator/den;
      hasInches=true; hasUnits=true;
    }
    fractionNumerator=null; fractionDenominatorText=""; entry="";
    render(); return;
  }

  if(entry==="") return;
  const inchText=entry;
  const n=Number(entry)||0;
  inchEntryWasDecimal=inchText.includes(".");
  enteredInches+=n; hasInches=true; wholeInches+=n; hasUnits=true; entry="";
  render();
}
function fraction(){
  startFreshIfNeeded();
  if(fractionNumerator!==null || entry==="" || entry.includes(".")) return;
  fractionNumerator=Number(entry); fractionDenominatorText=""; entry="";
  render();
}
function applyTyped(a,aKind,b,bKind,o){
  if(o==="add" || o==="subtract"){
    if(aKind!==bKind) return {value:NaN,kind:aKind,error:3};
    return {value:o==="add"?a+b:a-b,kind:aKind};
  }
  if(o==="multiply"){
    if(aKind==="length" && bKind==="length") return {value:a*b,kind:"area"};
    if(aKind==="area" && bKind==="length") return {value:a*b,kind:"volume"};
    if(aKind==="length" && bKind==="area") return {value:a*b,kind:"volume"};
    if(aKind==="length" && bKind==="scalar") return {value:a*b,kind:"length"};
    if(aKind==="area" && bKind==="scalar") return {value:a*b,kind:"area"};
    if(aKind==="volume" && bKind==="scalar") return {value:a*b,kind:"volume"};
    if(aKind==="scalar" && bKind==="length") return {value:a*b,kind:"length"};
    if(aKind==="scalar" && bKind==="area") return {value:a*b,kind:"area"};
    if(aKind==="scalar" && bKind==="volume") return {value:a*b,kind:"volume"};
    if(aKind==="scalar" && bKind==="scalar") return {value:a*b,kind:"scalar"};
  }
  if(o==="divide"){
    if(b===0) return {value:NaN,kind:aKind,error:1};
    if(aKind==="length" && bKind==="scalar") return {value:a/b,kind:"length"};
    if(aKind==="area" && bKind==="scalar") return {value:a/b,kind:"area"};
    if(aKind==="volume" && bKind==="scalar") return {value:a/b,kind:"volume"};
    if(aKind==="area" && bKind==="length") return {value:a/b,kind:"length"};
    if(aKind==="volume" && bKind==="area") return {value:a/b,kind:"length"};
    // V9.23.6: physically validated volume ÷ length = area (120 cu. ft. ÷ 10 ft = 12 sq. ft.).
    if(aKind==="volume" && bKind==="length") return {value:a/b,kind:"area"};
    if(aKind==="length" && bKind==="length") return {value:a/b,kind:"scalar"};
    // V9.23.7: physically validated area ÷ area = scalar (24 sq. ft. ÷ 6 sq. ft. = 4).
    if(aKind==="area" && bKind==="area") return {value:a/b,kind:"scalar"};
    // V9.23.9: physically validated volume ÷ volume = scalar (120 cu. ft. ÷ 10 cu. ft. = 12).
    if(aKind==="volume" && bKind==="volume") return {value:a/b,kind:"scalar"};
    if(aKind==="scalar" && bKind==="scalar") return {value:a/b,kind:"scalar"};
  }
  // V9.23.11 (R4): any unsupported dimensional combination is physical Error 3.
  return {value:NaN,kind:aKind,error:3};
}
// V9.23.11 (R4): physical Trig Plus II error display. Error 1 = divide by zero,
// Error 3 = invalid dimensional operation. Not latched: the pending calculation
// is cleared and justEquals is set, so the next number starts a fresh
// calculation without C (physical: Error 3 → 2 + 2 = 4).
function showError(code){
  resetOperand(); acc=null; accKind=null; op=null; convArmed=false; justEquals=true;
  result=0; resultKind="length";
  expressionParts=[code===1?"Division by zero":"Invalid dimensional operation"];
  $("#cmHistory").textContent=expressionParts[0];
  $("#cmMain").textContent=`Error ${code}`;
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent="—";
  $("#cmFeet").textContent="—";
}
function setOp(next){
  percentJustApplied=false;
  // V9.23.13 (R1): operator replacement. If operand #2 has not been entered yet,
  // a new operator replaces the pending one (physical: 5 × + 2 = 7).
  if(op!==null && acc!==null && !hasOperand() && !recalledValue && !recallArmed){
    op=next;
    if(expressionParts.length) expressionParts[expressionParts.length-1]=operatorSymbol(next);
    justEquals=false;
    render();
    return;
  }
  // V9.23.4: Sq/Cu unit entry stores a completed dimensional value in
  // result/resultKind rather than the live operand fields. Allow a completed
  // area or volume to become the dividend when ÷ is pressed.
  const fromDimensionalResult=!hasOperand() && !recalledValue && justEquals &&
    ((resultKind==="area" || resultKind==="volume") && next==="divide" ||
     // V9.23.10 TEMPORARY, deliberately narrow exception: the Circle AREA result
     // may become operand #1 for any operator, reproducing physically validated
     // Circle AREA chaining. This is NOT general result chaining. Remove when
     // R1 / general completed-result chaining is implemented.
     (circleAreaResult && resultKind==="area") ||
     // V9.23.13 (R1): a completed "=" result or standalone Sq/Cu entry may
     // become operand #1 for any operator (physical: 5 × 5 = × 2 = 50).
     resultChainable);
  if(!hasOperand() && !recalledValue && !fromDimensionalResult) return;
  if(fractionNumerator!==null && !fractionDenominatorText) return;

  const fromMemory=!hasOperand() && recalledValue;
  const v=fromMemory?recalledValue.value:(fromDimensionalResult?result:operandValue());
  const kind=fromMemory?recalledValue.kind:(fromDimensionalResult?resultKind:operandKind());
  const text=fromMemory?memoryValueText(recalledValue):(fromDimensionalResult?$("#cmMain").textContent:finalizedOperandText());
  // V9.23.14 (R2): unit context of this operand (chained results carry resultUnit).
  const unitHere=fromMemory?null:(fromDimensionalResult?(resultChainable?resultUnit:null):typedUnitContext());
  recalledValue=null;

  if(acc===null){
    acc=v; accKind=kind; accUnit=unitHere;
    // V9.23.15: presentation comes from operand #1 only.
    accInchDecimal=fromMemory?false:(fromDimensionalResult?(resultChainable&&resultInchDecimal):typedInchDecimal());
  }
  else if(op){
    const inh=inheritScalar(op,v,kind,text);
    const x=inh ? applyTyped(acc,accKind,inh.v,inh.kind,op) : applyTyped(acc,accKind,v,kind,op);
    // V9.23.11 (R4): an invalid pending operation is reported when the next
    // operator is pressed (physical: 3 + 5 ft + = Error 3) instead of being
    // silently discarded.
    if(!Number.isFinite(x.value)){ showError(x.error||3); return; }
    acc=x.value; accKind=x.kind;
    accUnit=inh ? accUnit : combinedUnit(op,unitHere);
  }
  result=acc; resultKind=accKind || "length";

  expressionParts.push(text,operatorSymbol(next));
  op=next;
  resetOperand();justEquals=false;
  render();
}
function equals(){
  if(expMode){
    if(expDigits==="") return;
    const exponent=(expNegative?-1:1)*Number(expDigits);
    const value=expBase*Math.pow(10,exponent);
    expressionParts=[`${dec(expBase,6)} EXP ${expNegative?"−":""}${expDigits}`,"="];
    expMode=false; expBase=null; expDigits=""; expNegative=false;
    resetOperand(); acc=null; accKind=null; op=null;
    result=value; resultKind="scalar"; justEquals=true; convArmed=false;
    render();
    return;
  }
  // V9.23.13 (R1): first = after a single C restores the hidden completed
  // result and its replay state, without replaying yet.
  if(clearedCompleted && op===null && acc===null && !hasOperand() && !recalledValue){
    const c=clearedCompleted;
    resetOperand(); // also clears clearedCompleted
    result=c.value; resultKind=c.kind; expressionParts=c.parts; lastReplay=c.replay;
    resultUnit=c.unit||null; resultInchDecimal=!!c.inchDecimal; // V9.23.14 (R2) / V9.23.15
    justEquals=true; convArmed=false; render();
    replayArmed=true; resultChainable=true;
    return;
  }
  // V9.23.13 (R1): operator with no operand #2 returns operand #1 unchanged
  // (physical: 5 × = 5, not 25). No chaining/replay state is created here
  // because that follow-on behavior has not been physically tested.
  if(op && acc!==null && !hasOperand() && !recalledValue && !recallArmed){
    expressionParts.push("=");
    result=acc; resultKind=accKind || "length";
    acc=null;accKind=null;op=null;resetOperand();justEquals=true;convArmed=false;lastReplay=null;render();
    return;
  }
  // V9.23.13 (R1): repeated equals replays the most recently completed
  // operator and operand #2, including its dimensional kind.
  if(op===null && !hasOperand() && !recalledValue && justEquals && replayArmed && lastReplay){
    const firstText=$("#cmMain").textContent;
    const keepUnit=resultUnit, keepInchDecimal=resultInchDecimal; // V9.23.14 (R2) / V9.23.15: replay keeps unit + presentation
    const x=applyTyped(result,resultKind,lastReplay.value,lastReplay.kind,lastReplay.op);
    if(!Number.isFinite(x.value)){ lastReplay=null; showError(x.error||3); return; }
    expressionParts=[firstText,operatorSymbol(lastReplay.op),lastReplay.text,"="];
    result=x.value; resultKind=x.kind;
    resetOperand(); resultUnit=keepUnit; resultInchDecimal=keepInchDecimal; justEquals=true;convArmed=false;render();
    replayArmed=true; resultChainable=true;
    return;
  }
  if(!hasOperand() && !recalledValue && !(op && acc!==null)) return;
  if(fractionNumerator!==null && !fractionDenominatorText) return;

  // V9.23.1: Rcl inside an active calculation supplies the recalled value
  // as the current operand without destroying the pending operator.
  const fromMemory=!hasOperand() && recalledValue;
  const v=fromMemory?recalledValue.value:operandValue();
  const kind=fromMemory?recalledValue.kind:operandKind();
  const text=fromMemory?memoryValueText(recalledValue):finalizedOperandText();
  const unit2=fromMemory?null:typedUnitContext(); // V9.23.14 (R2)
  recalledValue=null;

  let completedOperation=false, finalUnit=null;
  const accInchDecimalAtEquals=accInchDecimal; // V9.23.15
  if(op && acc!==null){
    // V9.23.14 (R2): a plain scalar after a dimensional operand #1 (+/− only)
    // becomes a real dimensional operand; the replay stores the converted value.
    const inh=inheritScalar(op,v,kind,text);
    const v2=inh?inh.v:v, kind2=inh?inh.kind:kind, text2=inh?inh.text:text;
    const x=applyTyped(acc,accKind,v2,kind2,op);
    if(Number.isFinite(x.value)){
      expressionParts.push(text2,"=");
      result=x.value; resultKind=x.kind;
      finalUnit=inh ? accUnit : combinedUnit(op,unit2);
      lastReplay={op,value:v2,kind:kind2,text:text2}; completedOperation=true; // V9.23.13 (R1)
    }else{
      lastReplay=null;
      showError(x.error||3); // V9.23.11 (R4): Error 1 or Error 3
      return;
    }
  }else{
    expressionParts=[text,"="];
    result=v; resultKind=kind;
    lastReplay=null;
  }
  acc=null;accKind=null;op=null;resetOperand();
  resultUnit=completedOperation?finalUnit:null; // V9.23.14 (R2): set before render() so 12 in / 5 m display
  resultInchDecimal=(resultUnit==="in") && accInchDecimalAtEquals; // V9.23.15: operand #1 presentation
  justEquals=true;convArmed=false;render();
  replayArmed=completedOperation; resultChainable=completedOperation; // V9.23.13 (R1)
}

function percentKey(){
  convArmed=false;
  if(percentJustApplied && !hasOperand() && op===null){
    // The physical Trig Plus II enters an all-segments/error-like display on a repeated %.
    // Represent that invalid state clearly without inventing another calculation.
    $("#cmHistory").textContent="Percent";
    $("#cmMain").textContent="Error";
    $("#cmAlt").textContent="Repeated % is not a valid operation on the physical calculator.";
    return;
  }
  if(fractionNumerator!==null && !fractionDenominatorText) return;

  if(op && acc!==null && hasOperand()){
    const pct=operandValue()/100;
    const pctText=finalizedOperandText();
    let value, kind=accKind;
    if(op==="add") value=acc + acc*pct;
    else if(op==="subtract") value=acc - acc*pct;
    else if(op==="multiply") value=acc*pct;
    else if(op==="divide"){ if(pct===0) return; value=acc/pct; }
    else return;
    const leftText=expressionParts.length?expressionParts[0]:dec(acc,6);
    const opText=operatorSymbol(op);
    resetOperand(); acc=null; accKind=null; op=null;
    result=value; resultKind=kind; justEquals=true; percentJustApplied=true;
    expressionParts=[leftText,opText,`${pctText} %`];
    render();
    return;
  }

  if(hasOperand()){
    const v=operandValue()/100;
    const text=finalizedOperandText();
    const kind=operandKind();
    resetOperand(); acc=null; accKind=null; op=null;
    result=v; resultKind=kind; justEquals=true; percentJustApplied=true;
    expressionParts=[`${text} %`];
    render();
  }
}

function roofHistory(requested){
  const bits=[];
  if(roofEnteredRun!==null) bits.push(`${feetInches(roofEnteredRun).replace(" 0 in","")} Run`);
  if(roofEnteredRise!==null) bits.push(`${feetInches(roofEnteredRise).replace(" 0 in","")} Rise`);
  if(roofEnteredDiag!==null) bits.push(`${feetInches(roofEnteredDiag).replace(" 0 in","")} Diag`);
  bits.push(requested);
  return bits.join(" → ");
}
function setRoofDisplay(label,value,kind="length"){
  resetOperand();
  acc=null; accKind=null; op=null; convArmed=false; justEquals=true;
  expressionParts=[roofHistory(label)];
  if(kind==="angle"){
    resultKind="scalar";
    result=value;
    $("#cmHistory").textContent=roofHistory(label);
    $("#cmMain").textContent=`${dec(value,5)}°`;
    $("#cmExact").previousElementSibling.textContent="ROOF ANGLE";
    $("#cmFeet").previousElementSibling.textContent="PITCH";
    $("#cmExact").textContent=`${dec(value,5)}°`;
    $("#cmFeet").textContent=`${dec(value,5)}°`;
    $("#cmAlt").textContent="";
  }else{
    resultKind="length"; result=value;
    render();
  }
}
function solveRoof(){
  if(roofRun!==null && roofRise!==null){
    roofDiag=Math.hypot(roofRun,roofRise);
    roofHipV=Math.sqrt(roofRise*roofRise + roofRun*roofRun + roofRun*roofRun);
    roofPitch=Math.atan2(roofRise,roofRun)*180/Math.PI;
    return;
  }
  if(roofRun!==null && roofDiag!==null && roofDiag>=roofRun){
    roofRise=Math.sqrt(Math.max(0,roofDiag*roofDiag-roofRun*roofRun));
    roofHipV=Math.sqrt(roofRise*roofRise + roofRun*roofRun + roofRun*roofRun);
    roofPitch=Math.atan2(roofRise,roofRun)*180/Math.PI;
    return;
  }
  if(roofRise!==null && roofDiag!==null && roofDiag>=roofRise){
    roofRun=Math.sqrt(Math.max(0,roofDiag*roofDiag-roofRise*roofRise));
    roofHipV=Math.sqrt(roofRise*roofRise + roofRun*roofRun + roofRun*roofRun);
    roofPitch=Math.atan2(roofRise,roofRun)*180/Math.PI;
  }
}
function roofKey(which){
  // Match the Trig Plus II: after Conv → Diag starts an R/Wall sequence,
  // subsequent plain Diag presses advance RW 2, RW 3, etc. without Conv.
  if(which==="diag" && rwallActive && !convArmed && !hasOperand()){ rwallKey(); return; }
  if(which!=="diag") rwallActive=false;
  if(convArmed){
    const secondary={diag:"rwall",hipv:"irpitch"}[which];
    if(secondary){ secondaryKey(secondary); return; }
    convArmed=false; // no gold function on Pitch/Rise/Run
  }
  // If a dimension is currently entered, store it under the selected roof key.
  if(hasOperand()){
    if(!hasUnits) return; // roof dimensions must be dimensional entries
    const v=operandValue();
    if(which==="run"){ roofRun=v; roofEnteredRun=v; }
    else if(which==="rise"){ roofRise=v; roofEnteredRise=v; }
    else if(which==="diag"){ roofDiag=v; roofEnteredDiag=v; }
    else if(which==="pitch"){
      // Trig Plus II dimensional pitch entry: 5 in Pitch means a 5-in-12 roof.
      roofPitch=Math.atan(v/12)*180/Math.PI;
      // A newly entered pitch is an independent roof definition. Keep an existing
      // Run available for later Jack work, but do not let stale Rise/Diag overwrite it.
      roofRise=null; roofDiag=null; roofHipV=null; roofEnteredRise=null; roofEnteredDiag=null;
      resetOperand(); justEquals=true; expressionParts=[];
      setLabeledDisplay("Pitch","PCH",inchesOnly(v),"Roof pitch stored.");
      return;
    } else return;
    resetOperand(); justEquals=false; expressionParts=[];
    solveRoof();
  }

  // Recall / calculate the requested roof value from stored triangle data.
  solveRoof();
  if(which==="run" && roofRun!==null){ setRoofDisplay("Run",roofRun); return; }
  if(which==="rise" && roofRise!==null){ setRoofDisplay("Rise",roofRise); return; }
  if(which==="diag" && roofDiag!==null){ setRoofDisplay("Diag",roofDiag); return; }
  if(which==="hipv" && roofHipV!==null){ setRoofDisplay("Hip/V",roofHipV); return; }
  if(which==="pitch" && roofPitch!==null){ setRoofDisplay("Pitch",roofPitch,"angle"); return; }

  $("#cmAlt").textContent="Enter two roof dimensions first.";
}
function setSpecialDisplay(history,main,alt=""){
  resetOperand(); acc=null; accKind=null; op=null; convArmed=false; justEquals=true;
  expressionParts=[history];
  result=0; resultKind="length";
  $("#cmHistory").textContent=history;
  $("#cmMain").textContent=main;
  $("#cmAlt").textContent=alt;
  $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
  $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
  $("#cmExact").textContent="—";
  $("#cmFeet").textContent="—";
}
function setLabeledDisplay(history,label,value,alt="") {
  setSpecialDisplay(history,"",alt);
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">${label}</span><span class="cm-jack-value">${value}</span></span>`;
}
function regularPitchSlope(){
  if(roofRun!==null && roofRise!==null && roofRun>0) return roofRise/roofRun;
  if(roofPitch!==null) return Math.tan(roofPitch*Math.PI/180);
  return null;
}
function snapshotCurrentValue(){
  const display=$("#cmMain")?.textContent?.trim()||"";
  if(hasOperand()) return {value:operandValue(),kind:operandKind(),display};
  if(justEquals || resultKind) return {value:result,kind:resultKind||"scalar",display};
  return null;
}
function memoryValueText(m){
  if(!m) return "0";
  if(m.display) return m.display;
  if(m.kind==="length") return feetInches(m.value);
  if(m.kind==="area") return `${dec(m.value/144,6)} sq. ft.`;
  if(m.kind==="volume") return `${dec(m.value/46656,6)} cu. yd.`;
  return dec(m.value,6);
}
function showMemory(label,m){
  resetOperand(); acc=null; accKind=null; op=null; convArmed=false; justEquals=false;
  result=m.value; resultKind=m.kind; expressionParts=[];
  $("#cmHistory").textContent=label;
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">${label}</span><span class="cm-jack-value">${memoryValueText(m)}</span></span>`;
  $("#cmAlt").textContent="";
  if(m.kind==="length"){
    $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
    $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
    $("#cmExact").textContent=`${dec(m.value,6)} in`;
    $("#cmFeet").textContent=`${dec(m.value/12,6)} ft`;
  }else if(m.kind==="area"){
    $("#cmExact").previousElementSibling.textContent="SQUARE INCHES";
    $("#cmFeet").previousElementSibling.textContent="SQUARE FEET";
    $("#cmExact").textContent=`${dec(m.value,6)} sq in`;
    $("#cmFeet").textContent=`${dec(m.value/144,6)} sq ft`;
  }else if(m.kind==="volume"){
    $("#cmExact").previousElementSibling.textContent="CUBIC INCHES";
    $("#cmFeet").previousElementSibling.textContent="CUBIC FEET";
    $("#cmExact").textContent=`${dec(m.value,6)} cu in`;
    $("#cmFeet").textContent=`${dec(m.value/1728,6)} cu ft`;
  }else{
    $("#cmExact").previousElementSibling.textContent="VALUE";
    $("#cmFeet").previousElementSibling.textContent="VALUE";
    $("#cmExact").textContent=dec(m.value,6); $("#cmFeet").textContent="—";
  }
}
function storeKey(){
  const snap=snapshotCurrentValue();
  if(!snap) return;
  storedCandidate={...snap};
  storArmed=true; recallArmed=false; recalledValue=null;
  resetOperand(); justEquals=false; expressionParts=[];
  setSpecialDisplay("Stor","STOR","Press 1 or 2 for memory, or Jack for O.C. spacing.");
}
function storeRegister(n){
  if(!storedCandidate) return;
  memoryRegisters[n]={...storedCandidate};
  const m=memoryRegisters[n];
  storArmed=false; storedCandidate=null; recalledValue={...m};
  showMemory(`M-${n}`,m);
}
function recallKey(){
  storArmed=false; storedCandidate=null; recallArmed=true; recalledValue=null; convArmed=false;
  // V9.23.2: Rcl used as the second operand must not call setSpecialDisplay(),
  // because that helper intentionally clears acc/op. Preserve the active arithmetic
  // state while prompting for memory register 1 or 2.
  const inActiveCalculation=(op!==null && acc!==null);
  resetOperand(); justEquals=false;
  if(inActiveCalculation){
    $("#cmMain").textContent="RCL";
    $("#cmAlt").textContent="Press 1 or 2 to recall memory.";
    $("#cmExact").textContent="—";
    $("#cmFeet").textContent="—";
  }else{
    expressionParts=[];
    setSpecialDisplay("Rcl","RCL","Press 1 or 2 to recall memory.");
    // setSpecialDisplay marks the display as a completed result; Rcl is awaiting a register.
    justEquals=false; recallArmed=true;
  }
}
function recallRegister(n){
  const m=memoryRegisters[n]||{value:0,kind:"scalar"};
  recallArmed=false; recalledValue={...m};
  if(op!==null && acc!==null){
    // Display the physical M-n recall while retaining the active calculation state.
    result=m.value; resultKind=m.kind;
    $("#cmHistory").textContent=`M-${n}`;
    $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">M-${n}</span><span class="cm-jack-value">${memoryValueText(m)}</span></span>`;
    $("#cmAlt").textContent="";
  }else{
    showMemory(`M-${n}`,m);
  }
}
function storeIrregularPitch(){
  if(!hasOperand()) return;
  let slope=null, label="";
  if(hasUnits){
    const v=operandValue();
    slope=v/12; // dimensional pitch entry: 8 in means 8/12
    label=inchesOnly(v);
  }else{
    const deg=operandValue();
    slope=Math.tan(deg*Math.PI/180);
    label=`${dec(deg,5)}°`;
  }
  if(!(slope>0)) return;
  irregularPitchSlope=slope;
  resetOperand(); justEquals=true; expressionParts=[];
  setLabeledDisplay("Ir/Pitch","IPCH",label,"Irregular roof pitch stored.");
}
function jackSeries(kind){
  const p=regularPitchSlope();
  const q=irregularPitchSlope ?? p;
  if(!(p>0) || !(q>0) || !(roofRun>0) || !(jackOC>0)) return null;
  if(kind==="jk"){
    const commonRun=roofRun;
    const runStep=jackOC*(q/p);
    const factor=Math.sqrt(1+p*p);
    return {common:commonRun*factor, step:runStep*factor};
  }
  const commonRun=roofRun*(p/q);
  const runStep=jackOC*(p/q);
  const factor=Math.sqrt(1+q*q);
  return {common:commonRun*factor, step:runStep*factor};
}
function jackValue(kind,index){
  const s=jackSeries(kind); if(!s) return null;
  return Math.max(0,s.common-index*s.step);
}
function jackZeroIndex(kind){
  const s=jackSeries(kind); if(!s) return 0;
  return Math.ceil((s.common-1e-9)/s.step);
}
function showJack(kind,index){
  const value=jackValue(kind,index); if(value===null) return false;
  const tag=kind==="jk"?"Jk":"IJ";
  const hist=`${roofHistory(tag+" "+index)} • OC ${inchesOnly(jackOC)}`;
  resetOperand(); acc=null; accKind=null; op=null; convArmed=false; justEquals=true;
  expressionParts=[hist]; resultKind="length"; result=value;
  render();
  $("#cmHistory").textContent=hist;
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">${tag} ${index}</span><span class="cm-jack-value">${feetInches(value)}</span></span>`;
  return true;
}
function jackKey(forceIrregular=false){
  if(storArmed){
    if(storedCandidate && storedCandidate.kind==="length" && storedCandidate.value>0) jackOC=storedCandidate.value;
    storArmed=false; storedCandidate=null; jackMode="jk"; jackIndex=0;
    setLabeledDisplay("Stor → Jack","OC",inchesOnly(jackOC),"Jack on-center spacing stored.");
    return;
  }
  if(!jackSeries("jk")){
    $("#cmAlt").textContent="Enter Run + Rise (or roof Pitch) first.";
    return;
  }
  if(forceIrregular){ jackMode="ij"; jackIndex=1; showJack("ij",1); return; }
  if(jackIndex===0){ jackMode="jk"; jackIndex=1; showJack("jk",1); return; }
  const zero=jackZeroIndex(jackMode);
  if(jackIndex<zero){ jackIndex++; showJack(jackMode,jackIndex); return; }
  if(jackMode==="jk"){ jackMode="ij"; jackIndex=1; showJack("ij",1); return; }
  jackMode="jk"; jackIndex=1; showJack("jk",1);
}
function rwallSeries(){
  const p=regularPitchSlope();
  if(!(p>0)) return null;
  // Prefer the explicitly stored Rise. If only Run + Pitch are stored, derive Rise.
  let rise=roofRise;
  if(!(rise>=0) && roofRun!==null && roofRun>=0) rise=roofRun*p;
  if(!(rise>=0)) return null;
  return {rise, step:rwallOC*p};
}
function rwallZeroIndex(){
  const s=rwallSeries(); if(!s || !(s.step>0)) return 0;
  return Math.ceil((s.rise-1e-9)/s.step);
}
function rwallValue(index){
  const s=rwallSeries(); if(!s) return null;
  return Math.max(0,s.rise-index*s.step);
}
function showRwall(index){
  const value=rwallValue(index); if(value===null) return false;
  const hist=`${roofHistory("RW "+index)} • RWOC ${inchesOnly(rwallOC)}`;
  resetOperand(); acc=null; accKind=null; op=null; convArmed=false; justEquals=true;
  expressionParts=[hist]; resultKind="length"; result=value;
  render();
  $("#cmHistory").textContent=hist;
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">RW ${index}</span><span class="cm-jack-value">${feetInches(value)}</span></span>`;
  return true;
}
function rwallKey(){
  const zero=rwallZeroIndex();
  if(!zero){ $("#cmAlt").textContent="Enter roof Rise + Run (or Run + Pitch) first."; return; }
  if(rwallIndex===0) rwallIndex=1;
  else if(rwallIndex<zero) rwallIndex++;
  rwallActive=true;
  // Physical Trig Plus II stops at the final zero-length RW result; it does not wrap.
  showRwall(rwallIndex);
}
function clearAll(){
  lastReplay=null; clearedCompleted=null; // V9.23.13 (R1): C C / AC destroy the completed result and replay state
  percentJustApplied=false;
  resetOperand();acc=null;accKind=null;op=null;result=0;resultKind="length";justEquals=false;convArmed=false;cubicArmed=false;squareArmed=false;expressionParts=[];
  roofRun=null;roofRise=null;roofDiag=null;roofPitch=null;roofHipV=null; roofEnteredRun=null;roofEnteredRise=null;roofEnteredDiag=null;
  irregularPitchSlope=null; storArmed=false; storedCandidate=null; recallArmed=false; recalledValue=null; jackMode="jk"; jackIndex=0; rwallIndex=0; rwallActive=false; circleDiameter=null; circleAreaUnit="in"; circleStage=0;
  clearPending=false;
  render();
}
function clearKey(){
  // V9.23.13 (R1): a SINGLE C directly after a completed "=" operation keeps
  // that result and its replay recoverable. The next = restores the result
  // WITHOUT replaying; the = after that replays (physical: 5 × 5 = C = = → 25, 125).
  const keepCompleted=(!clearPending && !expMode && justEquals && op===null && replayArmed && lastReplay && !hasOperand() && !recalledValue)
    ? {value:result, kind:resultKind, parts:[...expressionParts], replay:lastReplay, unit:resultUnit, inchDecimal:resultInchDecimal} : null;
  lastReplay=null; // V9.23.13 (R1): C clears the active replay (single C keeps a copy in clearedCompleted)
  percentJustApplied=false;
  if(expMode){ expMode=false; expBase=null; expDigits=""; expNegative=false; }
  if(clearPending){ clearAll(); return; }
  // Match the Trig Plus II: one C clears only the current entry/result state.
  // Stored roof geometry, pitches and Jack O.C. remain available.
  resetOperand(); acc=null; accKind=null; op=null; result=0; resultKind="length";
  justEquals=false; convArmed=false; cubicArmed=false; squareArmed=false; expressionParts=[]; storArmed=false; storedCandidate=null; recallArmed=false; recalledValue=null;
  expMode=false; expBase=null; expDigits=""; expNegative=false;
  jackMode="jk"; jackIndex=0; rwallIndex=0; rwallActive=false; circleStage=0;
  // Physical Trig Plus II: one C preserves the stored circle diameter; double C clears it via clearAll().
  clearPending=true;
  clearedCompleted=keepCompleted; // V9.23.13 (R1): set after resetOperand() above
  render();
}
function back(){
  if(fractionNumerator!==null){
    if(fractionDenominatorText) fractionDenominatorText=fractionDenominatorText.slice(0,-1);
    else fractionNumerator=null;
  }else if(entry) entry=entry.slice(0,-1);
  render();
}
// V9.23.12 (R3): physically validated function-as-operand-#2 behavior.
// When a calculation is pending, √, x², normal Sine/Cos/Tan and 1/x transform
// operand #2 and KEEP operand #1 and the pending operator
// (physical: 10 × 144 √ = 120; 10 ft × 30 Sine = 5 ft 0 in; 10 × 4 1/x = 2.5;
// 10 × 2 x² = 40). The transformed value is supplied through recalledValue with
// a display label (the same operand-#2 pattern used by Sq/Cu entry), so full
// precision is kept for the arithmetic while history shows the displayed value.
function functionPendingCalculation(){ return op!==null && acc!==null; }
function supplyFunctionOperand(value){
  const shown=dec(value,6);
  resetOperand();
  result=value; resultKind="scalar"; justEquals=false; convArmed=false;
  recalledValue={value,kind:"scalar",display:shown};
  $("#cmMain").textContent=shown;
  $("#cmHistory").textContent=`${expressionParts.join(" ")} ${shown}`;
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent=shown;
  $("#cmFeet").textContent="—";
}
function trigKey(which){
  // V9.7: physical Trig Plus II validation established degree-mode trig and
  // Conv + trig as the inverse function. Only typed scalar input is mapped.
  if(!hasOperand() || hasUnits){
    convArmed=false;
    $("#cmAlt").textContent="Enter a unitless value first.";
    return;
  }
  const input=operandValue();
  const inverse=convArmed;
  convArmed=false;
  let value;
  if(inverse){
    if((which==="sin" || which==="cos") && (input < -1 || input > 1)){
      $("#cmAlt").textContent="Inverse Sine/Cosine input must be from −1 to 1.";
      return;
    }
    if(which==="sin") value=Math.asin(input)*180/Math.PI;
    else if(which==="cos") value=Math.acos(input)*180/Math.PI;
    else value=Math.atan(input)*180/Math.PI;
  }else{
    const rad=input*Math.PI/180;
    if(which==="sin") value=Math.sin(rad);
    else if(which==="cos") value=Math.cos(rad);
    else value=Math.tan(rad);
  }
  if(!Number.isFinite(value)) return;
  // V9.23.12 (R3): normal trig as operand #2. Inverse trig (Conv) is not yet
  // physically tested as operand #2, so it keeps its existing behavior.
  if(!inverse && functionPendingCalculation()){ supplyFunctionOperand(value); return; }
  resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  resultKind="scalar"; result=value;
  const name={sin:"Sine",cos:"Cos",tan:"Tan"}[which];
  $("#cmHistory").textContent=inverse?`Inverse ${name}`:`${name} ${dec(input,6)}°`;
  if(inverse){
    $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">DEG</span><span class="cm-jack-value">${dec(value,6)}°</span></span>`;
  }else{
    $("#cmMain").textContent=dec(value,6);
  }
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent=inverse?"DEGREES":"VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent=inverse?`${dec(value,6)}°`:dec(value,6);
  $("#cmFeet").textContent="—";
}

function circleDisplay(stage){
  if(!(circleDiameter>=0)) return false;
  const d=circleDiameter;
  resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  resultKind="length"; result=d;
  if(stage===1){
    $("#cmHistory").textContent="Circle diameter";
    $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">DIA</span><span class="cm-jack-value">${circleAreaUnit==="in"?inchesOnly(d):feetInches(d)}</span></span>`;
    $("#cmExact").previousElementSibling.textContent="DIAMETER";
    $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
    $("#cmExact").textContent=`${dec(d,6)} in`;
    $("#cmFeet").textContent=`${dec(d/12,6)} ft`;
  }else if(stage===2){
    const areaIn2=Math.PI*Math.pow(d/2,2);
    const area=circleAreaUnit==="in"?areaIn2:areaIn2/144;
    const unit=circleAreaUnit==="in"?"sq. in.":"sq. feet";
    // V9.23.10: physical Trig Plus II treats AREA as the active result
    // (10 in Circ Circ Conv Feet = AREA 0.545415 sq. ft.; × 2 = 157.0796 sq. in.).
    result=areaIn2; resultKind="area"; circleAreaResult=true;
    $("#cmHistory").textContent="Circle area";
    $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">AREA</span><span class="cm-jack-value">${dec(area,6)} ${unit}</span></span>`;
    $("#cmExact").previousElementSibling.textContent="SQUARE INCHES";
    $("#cmFeet").previousElementSibling.textContent="SQUARE FEET";
    $("#cmExact").textContent=`${dec(areaIn2,6)} sq in`;
    $("#cmFeet").textContent=`${dec(areaIn2/144,6)} sq ft`;
  }else{
    const circumference=Math.PI*d;
    result=circumference;
    $("#cmHistory").textContent="Circle circumference";
    $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">CIRC</span><span class="cm-jack-value">${circleAreaUnit==="in"?inchesOnly(circumference):feetInches(circumference)}</span></span>`;
    $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
    $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
    $("#cmExact").textContent=`${dec(circumference,6)} in`;
    $("#cmFeet").textContent=`${dec(circumference/12,6)} ft`;
  }
  $("#cmAlt").textContent="";
  return true;
}
function arcKey(){
  // V9.9 physical workflow: establish a circle diameter, then angle → Conv → Circ (gold Arc).
  convArmed=false;
  if(circleDiameter===null){ $("#cmAlt").textContent="Enter a circle diameter with Circ first."; return; }
  if(!hasOperand() || hasUnits){ $("#cmAlt").textContent="Enter a unitless angle first."; return; }
  const angle=operandValue();
  const arcLength=Math.PI*circleDiameter*(angle/360);
  if(!Number.isFinite(arcLength)) return;
  resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  resultKind="length"; result=arcLength; circleStage=0;
  $("#cmHistory").textContent=`Circle arc • ${dec(angle,6)}°`;
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">ARC</span><span class="cm-jack-value">${circleAreaUnit==="in"?inchesOnly(arcLength):feetInches(arcLength)}</span></span>`;
  $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
  $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
  $("#cmExact").textContent=`${dec(arcLength,6)} in`;
  $("#cmFeet").textContent=`${dec(arcLength/12,6)} ft`;
  $("#cmAlt").textContent="";
}

function circKey(){
  convArmed=false;
  if(hasOperand()){
    if(!hasUnits){ $("#cmAlt").textContent="Enter a diameter with ft / in units first."; return; }
    circleDiameter=operandValue();
    // Physical benchmark: inch-only diameter reports sq. in.; any feet entry reports sq. feet.
    circleAreaUnit=hasFeet?"ft":"in";
    circleStage=1;
    circleDisplay(circleStage);
    return;
  }
  if(circleDiameter===null){ $("#cmAlt").textContent="Enter a diameter first."; return; }
  circleStage=circleStage>=3?1:circleStage+1;
  circleDisplay(circleStage);
}


function sqrtSquareKey(square=false){
  // V9.10 physical benchmarks: 144 → √ = 12; 2 → √ = 1.414214;
  // 12 → Conv → √ = 144; 1.234 → Conv → √ = 1.522756.
  convArmed=false;
  if(!hasOperand() || hasUnits){
    $("#cmAlt").textContent="Enter a unitless value first.";
    return;
  }
  const input=operandValue();
  if(!square && input<0){
    $("#cmAlt").textContent="Square root requires a non-negative value.";
    return;
  }
  const value=square ? input*input : Math.sqrt(input);
  if(!Number.isFinite(value)) return;
  if(functionPendingCalculation()){ supplyFunctionOperand(value); return; } // V9.23.12 (R3): √ / x² as operand #2
  resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  resultKind="scalar"; result=value;
  $("#cmHistory").textContent=square?`Square ${dec(input,6)}`:`Square root ${dec(input,6)}`;
  $("#cmMain").textContent=dec(value,6);
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent=dec(value,6);
  $("#cmFeet").textContent="—";
}

function renderExp(){
  const exponentText=(expNegative?"−":"")+(expDigits||"");
  // The Trig Plus II shifts the mantissa and shows a decimal point while the exponent is entered.
  $("#cmMain").textContent=`${dec(expBase,6)}.  ${exponentText}`;
  $("#cmHistory").textContent=`${dec(expBase,6)} EXP ${exponentText}`.trim();
  $("#cmAlt").textContent="EXP";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent="—";
  $("#cmFeet").textContent="—";
}

function expKey(){
  // V9.16 physical benchmarks:
  // 2 EXP 3 = 2000; 2 EXP -3 = 0.002; 1.5 EXP 4 = 15000.
  convArmed=false;
  if(!hasOperand() || hasUnits || fractionNumerator!==null){
    $("#cmAlt").textContent="Enter a unitless mantissa first.";
    return;
  }
  expBase=operandValue();
  resetOperand();
  expMode=true; expDigits=""; expNegative=false; justEquals=false;
  renderExp();
}

function reciprocalKey(){
  // V9.11 physical benchmarks: 4 → Conv → ÷ = 0.25;
  // 3 → Conv → ÷ = 0.333333; 0 → Conv → ÷ = Error 1.
  convArmed=false;
  if(!hasOperand() || hasUnits){
    $("#cmAlt").textContent="Enter a unitless value first.";
    return;
  }
  const input=operandValue();
  if(input===0){
    resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
    resultKind="scalar"; result=0;
    $("#cmHistory").textContent="Reciprocal";
    $("#cmMain").textContent="Error 1";
    $("#cmAlt").textContent="";
    $("#cmExact").previousElementSibling.textContent="VALUE";
    $("#cmFeet").previousElementSibling.textContent="VALUE";
    $("#cmExact").textContent="—";
    $("#cmFeet").textContent="—";
    return;
  }
  const value=1/input;
  if(functionPendingCalculation()){ supplyFunctionOperand(value); return; } // V9.23.12 (R3): 1/x as operand #2
  resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  resultKind="scalar"; result=value;
  $("#cmHistory").textContent=`Reciprocal ${dec(input,6)}`;
  $("#cmMain").textContent=dec(value,6);
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent=dec(value,6);
  $("#cmFeet").textContent="—";
}

function piKey(){
  // V9.13.1: π must behave like a typed scalar operand. Do not use
  // setLabeledDisplay(), because that helper intentionally clears acc/op.
  // Physical benchmark: 2 → × → Conv → + → = = 6.283185.
  convArmed=false;
  resetOperand();
  entry=String(Math.PI); // keep full precision internally
  resultKind="scalar";
  justEquals=false;
  $("#cmHistory").textContent="Pi";
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">PI</span><span class="cm-jack-value">${dec(Math.PI,6)}</span></span>`;
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="EXACT INCHES";
  $("#cmFeet").previousElementSibling.textContent="DECIMAL FEET";
  $("#cmExact").textContent="—";
  $("#cmFeet").textContent="—";
}

function signToggleKey(){
  // V9.14 physical benchmarks: 25 → Conv → − = -25; repeat = 25;
  // 10 + 3 → Conv → − → = = 7. Treat the toggled value as the current operand.
  convArmed=false;
  if(expMode){
    expNegative=!expNegative;
    renderExp();
    return;
  }
  if(!hasOperand()) return;

  if(fractionNumerator!==null && !fractionDenominatorText) return;

  if(hasUnits){
    // Keep dimensional entry structure intact while toggling its total sign.
    // Sign-toggle validation so far is for unitless arithmetic only; do not guess
    // at mixed-unit entry editing behavior.
    $("#cmAlt").textContent="+/− for dimensional entries not yet validated.";
    return;
  }

  const input=operandValue();
  resetOperand();
  entry=String(-input);
  resultKind="scalar";
  justEquals=false;
  render();
}

function dmsKey(){
  resultChainable=false; replayArmed=false; // V9.23.13 (R1): DMS display is not a chainable "=" result
  // V9.17 physical benchmarks:
  // 30.5 → d:m:s = DEG 30.5°; next press = DMS 30.30.00°; next = DEG 30.5°.
  // 30.5125° = DMS 30.30.45°. Seconds round to nearest whole second:
  // 30.5126 → 30.30.45° and 30.5127 → 30.30.46°.
  convArmed=false;

  if(hasOperand()){
    if(hasUnits || fractionNumerator!==null){
      $("#cmAlt").textContent="Enter a unitless degree value first.";
      return;
    }
    dmsValue=operandValue();
    dmsStage="deg";
    resetOperand(); acc=null; accKind=null; op=null; justEquals=true; expressionParts=[];
  }else if(dmsValue===null){
    // Permit toggling a scalar result if one is already on screen.
    if(resultKind!=="scalar") { $("#cmAlt").textContent="Enter a degree value first."; return; }
    dmsValue=result;
    dmsStage="deg";
  }else{
    dmsStage=dmsStage==="deg"?"dms":"deg";
  }

  resultKind="scalar"; result=dmsValue;
  $("#cmHistory").textContent="Degrees / DMS";
  $("#cmAlt").textContent="";
  $("#cmExact").previousElementSibling.textContent="VALUE";
  $("#cmFeet").previousElementSibling.textContent="VALUE";
  $("#cmExact").textContent="—";
  $("#cmFeet").textContent="—";

  let tag="DEG", value=`${dec(dmsValue,6)}°`;
  if(dmsStage==="dms"){
    tag="DMS";
    const neg=dmsValue<0;
    let totalSeconds=Math.round(Math.abs(dmsValue)*3600);
    const deg=Math.floor(totalSeconds/3600);
    totalSeconds-=deg*3600;
    const min=Math.floor(totalSeconds/60);
    const sec=totalSeconds-min*60;
    value=`${neg?"−":""}${deg}.${String(min).padStart(2,"0")}.${String(sec).padStart(2,"0")}°`;
  }
  $("#cmMain").innerHTML=`<span class="cm-jack-result"><span class="cm-jack-tag">${tag}</span><span class="cm-jack-value">${value}</span></span>`;
}

function secondaryNotValidated(name){
  convArmed=false;
  $("#cmAlt").textContent=`${name} recognized — function not yet validated.`;
}
function secondaryKey(name){
  // Conv is the physical calculator's gold-function modifier.
  // Execute only behavior already mapped against Tim's Trig Plus II.
  if(name==="irpitch"){ convArmed=false; storeIrregularPitch(); return true; }
  if(name==="irjack"){ convArmed=false; jackKey(true); return true; }
  if(name==="rwall"){ convArmed=false; rwallKey(); return true; }
  if(name==="arc"){ arcKey(); return true; }
  if(name==="square"){ sqrtSquareKey(true); return true; }
  if(name==="reciprocal"){ reciprocalKey(); return true; }
  if(name==="exp"){ expKey(); return true; }
  if(name==="ac"){
    // V9.22 physical validation: AC also zeros M-1 and M-2; double-C does not.
    memoryRegisters={1:{value:0,kind:"scalar"},2:{value:0,kind:"scalar"}};
    clearAll();
    return true;
  }
  if(name==="pi"){ piKey(); return true; }
  if(name==="sign"){ signToggleKey(); return true; }
  const labels={rwall:"R/Wall",arc:"Arc",square:"x²",ftin:"Ft-In",exp:"EXP",reciprocal:"1/x",ac:"AC",pi:"π",sign:"+/−"};
  secondaryNotValidated(labels[name]||name); return true;
}
function conv(){
  resultChainable=false; replayArmed=false; // V9.23.13 (R1): conversions/gold functions end "=" chaining (untested)
  // Conv is a modifier only. Arm the gold secondary layer without re-rendering
  // the main value; re-rendering would expose the internal base-unit value and
  // look like a conversion happened before the destination key was pressed.
  convArmed=true;
  $("#cmAlt").textContent="CONV — choose next key";
}

export function initConstruction(){
  // Any key other than C breaks the consecutive-C sequence.
  document.querySelectorAll('#constructionView button:not([data-cm="clear"])').forEach(b=>b.addEventListener("click",()=>{ clearPending=false; },{capture:true}));
  document.querySelectorAll("[data-cm-digit]").forEach(b=>b.addEventListener("click",()=>digit(b.dataset.cmDigit)));
  document.querySelectorAll("[data-cm-op]").forEach(b=>b.addEventListener("click",()=>{ if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else setOp(b.dataset.cmOp); }));
  document.querySelector('[data-cm="decimal"]').addEventListener("click",decimal);
  document.querySelector('[data-cm="feet"]').addEventListener("click",feet);
  document.querySelector('[data-cm="inch"]').addEventListener("click",inches);
  document.querySelector('[data-cm="fraction"]').addEventListener("click",e=>{ const b=e.currentTarget; if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else fraction(); });
  document.querySelector('[data-cm="equals"]').addEventListener("click",equals);
  document.querySelector('[data-cm="clear"]').addEventListener("click",clearKey);
  document.querySelector('[data-cm="back"]').addEventListener("click",back);
  document.querySelector('[data-cm="conv"]').addEventListener("click",conv);
  document.querySelectorAll("[data-cm-roof]").forEach(b=>b.addEventListener("click",()=>roofKey(b.dataset.cmRoof)));
  document.querySelector('[data-cm="stor"]').addEventListener("click",storeKey);
  document.querySelector('[data-cm="rcl"]').addEventListener("click",recallKey);
  document.querySelectorAll("[data-cm-trig]").forEach(b=>b.addEventListener("click",()=>trigKey(b.dataset.cmTrig)));
  document.querySelector('[data-cm="cu"]').addEventListener("click",cubicKey);
  document.querySelector('[data-cm="sq"]').addEventListener("click",squareKey);
  document.querySelectorAll("[data-cm-dimensional-unit]").forEach(b=>b.addEventListener("click",()=>dimensionalUnitKey(b.dataset.cmDimensionalUnit)));
  document.querySelectorAll("[data-cm-primary]").forEach(b=>b.addEventListener("click",()=>{ if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else if(b.dataset.cmPrimary==="circ") circKey(); else if(b.dataset.cmPrimary==="sqrt") sqrtSquareKey(false); else $("#cmAlt").textContent=`${b.textContent.trim()} not yet validated.`; }));
  document.querySelector('[data-cm="jack"]').addEventListener("click",e=>{ const b=e.currentTarget; if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else jackKey(false); });
  document.querySelector('[data-cm="dms"]').addEventListener("click",dmsKey);
  document.querySelector('[data-cm="percent"]').addEventListener("click",percentKey);
  render();
}

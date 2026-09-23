
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

// V9.20 linear metric entry/conversion. Internal length unit remains inches.
let metricEntryUnit=null;
let metricEntryValue=null;

// V9.0 roof-triangle memory. Lengths are stored internally in inches.
let roofRun=null, roofRise=null, roofDiag=null, roofPitch=null, roofHipV=null;
let roofEnteredRun=null, roofEnteredRise=null, roofEnteredDiag=null;

// V9.4.1 Jack memory. O.C. defaults to the physical calculator's 16 in setting.
let jackOC=16;
let irregularPitchSlope=null; // rise/run, e.g. 8/12
let storArmed=false;
let storedCandidate=null;
let jackMode="jk";
let jackIndex=0;
let clearPending=false; // First C clears the current entry/result; second consecutive C clears all.

// V9.6 R/Wall memory. Tim uses the Trig Plus II default 16 in rake-wall spacing.
const rwallOC=16;
let rwallIndex=0;
let rwallActive=false; // After Conv → Diag starts R/Wall, plain Diag advances the active RW sequence.

// V9.9 Circle memory. Circ cycles DIA → AREA → CIRC → DIA; gold Arc uses the stored diameter.
let circleDiameter=null; // inches
let circleAreaUnit="in"; // "in" for inch-only entry, otherwise "ft"
let circleStage=0;

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
  if(f.n) body+=`${f.whole?"-":""}${f.n}/${f.d}`;
  return `${f.sign}${body} in`;
}
function feetInches(value){
  const neg=value<0, a=Math.abs(value);
  let ft=Math.floor(a/12+1e-10);
  const rem=a-ft*12, f=roundedFraction(rem,64);
  let iw=f.whole;
  if(iw>=12){ft++;iw-=12}
  let ins=String(iw);
  if(f.n) ins+=`-${f.n}/${f.d}`;
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
    if(f.n) body+=`${f.whole?"-":""}${f.n}/${f.d}`;
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
  metricEntryUnit=null; metricEntryValue=null;
}
function startFreshIfNeeded(){
  if(justEquals && op===null){
    result=0;resultKind="length";acc=null;accKind=null;expressionParts=[];justEquals=false;cubicArmed=false;resetOperand();
  }
}
function digit(d){
  conversionMode=null;
  if(expMode){
    expDigits=(expDigits==="0")?d:expDigits+d;
    renderExp();
    return;
  }
  rwallActive=false;
  startFreshIfNeeded();
  if(fractionNumerator!==null) fractionDenominatorText+=d;
  else entry=(entry==="0")?d:entry+d;
  render();
}
function decimal(){
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
  result=n*factors[unit]; resultKind="volume"; justEquals=true; convArmed=false; cubicArmed=false;
  resetOperand(); acc=null;accKind=null;op=null;expressionParts=[];
  $("#cmMain").textContent=`${dec(n,6)} ${labels[unit]}`;
  $("#cmHistory").textContent="Cubic unit entry";
  $("#cmExact").previousElementSibling.textContent="CUBIC INCHES";
  $("#cmFeet").previousElementSibling.textContent="CUBIC FEET";
  $("#cmExact").textContent=`${dec(result,6)} cu in`;
  $("#cmFeet").textContent=`${dec(result/1728,6)} cu ft`;
  $("#cmAlt").textContent="";
  return true;
}
function showCubicConverted(unit){
  const factors={ft:1728,yd:46656,m:61023.7440947323,mm:0.0000610237440947323};
  const labels={ft:"cu. ft.",yd:"cu. yd.",m:"cu. m",mm:"cu. mm"};
  const v=result/factors[unit];
  convArmed=false; conversionMode=null; justEquals=true;
  $("#cmMain").textContent=`${dec(v,6)} ${labels[unit]}`;
  $("#cmHistory").textContent=`Converted to ${labels[unit]}`;
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
  result=n*factors[unit]; resultKind="area"; justEquals=true; convArmed=false; squareArmed=false; cubicArmed=false;
  resetOperand(); acc=null;accKind=null;op=null;expressionParts=[];
  $("#cmMain").textContent=`${dec(n,6)} ${labels[unit]}`;
  $("#cmHistory").textContent="Square unit entry";
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
  convArmed=false; conversionMode=null; justEquals=true;
  $("#cmMain").textContent=`${dec(v,6)} ${labels[unit]}`;
  $("#cmHistory").textContent=`Converted to ${labels[unit]}`;
  $("#cmExact").previousElementSibling.textContent="SQUARE INCHES";
  $("#cmFeet").previousElementSibling.textContent="SQUARE FEET";
  $("#cmExact").textContent=`${dec(result,6)} sq in`;
  $("#cmFeet").textContent=`${dec(result/144,6)} sq ft`;
  $("#cmAlt").textContent="";
}
function setLinearMetricUnit(unit){
  if((unit!=="m" && unit!=="mm") || entry==="" || hasUnits || fractionNumerator!==null) return false;
  const n=Number(entry)||0;
  const inches = unit==="m" ? n*39.37007874015748 : n/25.4;
  entry=""; wholeInches=inches; hasUnits=true;
  metricEntryUnit=unit; metricEntryValue=n;
  convArmed=false; conversionMode=null; justEquals=false;
  render();
  return true;
}
function showLinearMetricConverted(unit){
  const raw=valueForConversion();
  const inches=(hasOperand() && operandKind()==="scalar") ? raw : raw;
  const v=unit==="m" ? inches*0.0254 : inches*25.4;
  result=inches; resultKind="length"; justEquals=true; convArmed=false; conversionMode=null;
  resetOperand(); expressionParts=[]; acc=null; accKind=null; op=null;
  $("#cmMain").textContent=`${dec(v,6)} ${unit}`;
  $("#cmHistory").textContent=`Converted to ${unit}`;
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
  if((unit==="m" || unit==="mm") && convArmed){ showLinearMetricConverted(unit); return; }
  if(unit==="m" || unit==="mm"){
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
  // V9.20.1: the physical Trig Plus II displays linear metric -> Feet
  // as feet + fractional inches (e.g. 1 m -> 3 ft 3-3/8 in), not decimal feet.
  const metricToFeet = unit==="ft" && live && liveKind==="length" && metricEntryUnit!==null;

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

  if(metricToFeet){
    conversionMode="ftInFraction";
    $("#cmMain").textContent=feetInches(vInches);
    $("#cmHistory").textContent="Converted to ft / in";
  }else if(unit==="ft"){
    conversionMode="ftDecimal";
    $("#cmMain").textContent=`${dec(vInches/12,6)} ft`;
    $("#cmHistory").textContent="Converted to decimal feet";
  }else if(repeatInch){
    conversionMode="inFraction";
    $("#cmMain").textContent=inchesOnly(vInches);
    $("#cmHistory").textContent="Converted to fractional inches";
  }else{
    conversionMode="inDecimal";
    $("#cmMain").textContent=`${dec(vInches,6)} in`;
    $("#cmHistory").textContent="Converted to decimal inches";
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
  const n=Number(entry)||0;
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
    if(aKind!==bKind) return {value:NaN,kind:aKind};
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
    if(b===0) return {value:NaN,kind:aKind};
    if(aKind==="length" && bKind==="scalar") return {value:a/b,kind:"length"};
    if(aKind==="area" && bKind==="scalar") return {value:a/b,kind:"area"};
    if(aKind==="volume" && bKind==="scalar") return {value:a/b,kind:"volume"};
    if(aKind==="area" && bKind==="length") return {value:a/b,kind:"length"};
    if(aKind==="length" && bKind==="length") return {value:a/b,kind:"scalar"};
    if(aKind==="scalar" && bKind==="scalar") return {value:a/b,kind:"scalar"};
  }
  return {value:NaN,kind:aKind};
}
function setOp(next){
  if(!hasOperand()) return;
  if(fractionNumerator!==null && !fractionDenominatorText) return;

  const v=operandValue(), kind=operandKind();
  const text=finalizedOperandText();

  if(acc===null){ acc=v; accKind=kind; }
  else if(op){
    const x=applyTyped(acc,accKind,v,kind,op);
    if(Number.isFinite(x.value)){ acc=x.value; accKind=x.kind; }
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
  if(!hasOperand() && !(op && acc!==null)) return;
  if(fractionNumerator!==null && !fractionDenominatorText) return;

  const v=operandValue(), kind=operandKind();
  const text=finalizedOperandText();

  if(op && acc!==null){
    const x=applyTyped(acc,accKind,v,kind,op);
    if(Number.isFinite(x.value)){
      expressionParts.push(text,"=");
      result=x.value; resultKind=x.kind;
    }else{
      expressionParts=["Invalid dimensional operation"];
      result=0; resultKind="length";
    }
  }else{
    expressionParts=[text,"="];
    result=v; resultKind=kind;
  }
  acc=null;accKind=null;op=null;resetOperand();justEquals=true;convArmed=false;render();
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
function storeKey(){
  if(!hasOperand()) return;
  storedCandidate=operandValue();
  storArmed=true;
  resetOperand(); justEquals=false; expressionParts=[];
  setSpecialDisplay("Stor","STOR","Press Jack to store O.C. spacing.");
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
    if(storedCandidate>0) jackOC=storedCandidate;
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
  resetOperand();acc=null;accKind=null;op=null;result=0;resultKind="length";justEquals=false;convArmed=false;cubicArmed=false;squareArmed=false;expressionParts=[];
  roofRun=null;roofRise=null;roofDiag=null;roofPitch=null;roofHipV=null; roofEnteredRun=null;roofEnteredRise=null;roofEnteredDiag=null;
  irregularPitchSlope=null; storArmed=false; storedCandidate=null; jackMode="jk"; jackIndex=0; rwallIndex=0; rwallActive=false; circleDiameter=null; circleAreaUnit="in"; circleStage=0;
  clearPending=false;
  render();
}
function clearKey(){
  if(expMode){ expMode=false; expBase=null; expDigits=""; expNegative=false; }
  if(clearPending){ clearAll(); return; }
  // Match the Trig Plus II: one C clears only the current entry/result state.
  // Stored roof geometry, pitches and Jack O.C. remain available.
  resetOperand(); acc=null; accKind=null; op=null; result=0; resultKind="length";
  justEquals=false; convArmed=false; cubicArmed=false; squareArmed=false; expressionParts=[]; storArmed=false; storedCandidate=null;
  expMode=false; expBase=null; expDigits=""; expNegative=false;
  jackMode="jk"; jackIndex=0; rwallIndex=0; rwallActive=false; circleStage=0;
  // Physical Trig Plus II: one C preserves the stored circle diameter; double C clears it via clearAll().
  clearPending=true;
  render();
}
function back(){
  if(fractionNumerator!==null){
    if(fractionDenominatorText) fractionDenominatorText=fractionDenominatorText.slice(0,-1);
    else fractionNumerator=null;
  }else if(entry) entry=entry.slice(0,-1);
  render();
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
    // V9.12 physical validation: Conv → × (gold AC) immediately clears
    // current input/results and all stored geometry/settings, displaying 0.
    clearAll();
    return true;
  }
  if(name==="pi"){ piKey(); return true; }
  if(name==="sign"){ signToggleKey(); return true; }
  const labels={rwall:"R/Wall",arc:"Arc",square:"x²",ftin:"Ft-In",exp:"EXP",reciprocal:"1/x",ac:"AC",pi:"π",sign:"+/−"};
  secondaryNotValidated(labels[name]||name); return true;
}
function conv(){
  // Conv arms the gold secondary layer. Feet/Inch still perform the validated
  // conversion behavior when selected next.
  convArmed=true;
  render();
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
  document.querySelectorAll("[data-cm-trig]").forEach(b=>b.addEventListener("click",()=>trigKey(b.dataset.cmTrig)));
  document.querySelector('[data-cm="cu"]').addEventListener("click",cubicKey);
  document.querySelector('[data-cm="sq"]').addEventListener("click",squareKey);
  document.querySelectorAll("[data-cm-dimensional-unit]").forEach(b=>b.addEventListener("click",()=>dimensionalUnitKey(b.dataset.cmDimensionalUnit)));
  document.querySelectorAll("[data-cm-primary]").forEach(b=>b.addEventListener("click",()=>{ if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else if(b.dataset.cmPrimary==="circ") circKey(); else if(b.dataset.cmPrimary==="sqrt") sqrtSquareKey(false); else $("#cmAlt").textContent=`${b.textContent.trim()} not yet validated.`; }));
  document.querySelector('[data-cm="jack"]').addEventListener("click",e=>{ const b=e.currentTarget; if(convArmed && b.dataset.cmSecondary) secondaryKey(b.dataset.cmSecondary); else jackKey(false); });
  document.querySelector('[data-cm="dms"]').addEventListener("click",dmsKey);
  render();
}

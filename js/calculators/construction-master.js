
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

// V9.0 roof-triangle memory. Lengths are stored internally in inches.
let roofRun=null, roofRise=null, roofDiag=null, roofPitch=null, roofHipV=null;
let roofEnteredRun=null, roofEnteredRise=null, roofEnteredDiag=null;

// Separate human-facing expression history from normalized calculation values.
let expressionParts=[];
let committedOperandText="";

const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
const clean=n=>Math.abs(n)<1e-12?0:n;
const dec=(n,d=6)=>clean(n).toLocaleString(undefined,{maximumFractionDigits:d,useGrouping:false});

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
  let ins=iw?String(iw):"";
  if(f.n) ins+=(ins?"-":"")+`${f.n}/${f.d}`;
  if(!ins) ins="0";
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
  const parts=[];
  if(hasFeet) parts.push(`${dec(enteredFeet,6)} ft`);

  if(hasInches){
    let inchText=dec(enteredInches,6);
    if(fractionNumerator!==null && fractionDenominatorText){
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
}
function startFreshIfNeeded(){
  if(justEquals && op===null){
    result=0;resultKind="length";acc=null;accKind=null;expressionParts=[];justEquals=false;resetOperand();
  }
}
function digit(d){
  startFreshIfNeeded();
  if(fractionNumerator!==null) fractionDenominatorText+=d;
  else entry=(entry==="0")?d:entry+d;
  render();
}
function decimal(){
  startFreshIfNeeded();
  if(fractionNumerator!==null) return;
  if(!entry.includes(".")) entry=entry===""?"0.":entry+".";
  render();
}
function valueForConversion(){
  if(hasOperand()) return operandValue();
  return result;
}
function showConverted(unit){
  const v=valueForConversion();
  result=v;
  resetOperand();
  expressionParts=[];
  acc=null; accKind=null; op=null; resultKind="length"; justEquals=true; convArmed=false;

  if(unit==="ft"){
    // Construction-style result belongs in the primary display.
    // Decimal feet is already available in the verification box below.
    $("#cmMain").textContent=feetInches(v);
    $("#cmHistory").textContent="Converted to feet / inches";
    $("#cmExact").textContent=`${dec(v,6)} in`;
    $("#cmFeet").textContent=`${dec(v/12,6)} ft`;
    $("#cmAlt").textContent="";
  }else{
    $("#cmMain").textContent=inchesOnly(v);
    $("#cmHistory").textContent="Converted to inches";
    $("#cmExact").textContent=`${dec(v,6)} in`;
    $("#cmFeet").textContent=`${dec(v/12,6)} ft`;
    $("#cmAlt").textContent="";
  }
}
function feet(){
  if(convArmed){ showConverted("ft"); return; }
  startFreshIfNeeded();
  if(fractionNumerator!==null || entry==="") return;
  const n=Number(entry)||0;
  enteredFeet+=n; hasFeet=true; wholeInches+=n*12; hasUnits=true; entry="";
  render();
}
function inches(){
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
  // If a dimension is currently entered, store it under the selected roof key.
  if(hasOperand()){
    if(!hasUnits) return; // roof dimensions must be dimensional entries
    const v=operandValue();
    if(which==="run"){ roofRun=v; roofEnteredRun=v; }
    else if(which==="rise"){ roofRise=v; roofEnteredRise=v; }
    else if(which==="diag"){ roofDiag=v; roofEnteredDiag=v; }
    else return; // Pitch input behavior will be mapped separately against the physical calculator.
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
function clearAll(){
  resetOperand();acc=null;accKind=null;op=null;result=0;resultKind="length";justEquals=false;convArmed=false;expressionParts=[];
  roofRun=null;roofRise=null;roofDiag=null;roofPitch=null;roofHipV=null; roofEnteredRun=null;roofEnteredRise=null;roofEnteredDiag=null;
  render();
}
function back(){
  if(fractionNumerator!==null){
    if(fractionDenominatorText) fractionDenominatorText=fractionDenominatorText.slice(0,-1);
    else fractionNumerator=null;
  }else if(entry) entry=entry.slice(0,-1);
  render();
}
function conv(){
  // Construction Master behavior: Conv modifies the NEXT unit key.
  if(!hasOperand() && !justEquals) return;
  convArmed=true;
  render();
}

export function initConstruction(){
  document.querySelectorAll("[data-cm-digit]").forEach(b=>b.addEventListener("click",()=>digit(b.dataset.cmDigit)));
  document.querySelectorAll("[data-cm-op]").forEach(b=>b.addEventListener("click",()=>setOp(b.dataset.cmOp)));
  document.querySelector('[data-cm="decimal"]').addEventListener("click",decimal);
  document.querySelector('[data-cm="feet"]').addEventListener("click",feet);
  document.querySelector('[data-cm="inch"]').addEventListener("click",inches);
  document.querySelector('[data-cm="fraction"]').addEventListener("click",fraction);
  document.querySelector('[data-cm="equals"]').addEventListener("click",equals);
  document.querySelector('[data-cm="clear"]').addEventListener("click",clearAll);
  document.querySelector('[data-cm="back"]').addEventListener("click",back);
  document.querySelector('[data-cm="conv"]').addEventListener("click",conv);
  document.querySelectorAll("[data-cm-roof]").forEach(b=>b.addEventListener("click",()=>roofKey(b.dataset.cmRoof)));
  render();
}

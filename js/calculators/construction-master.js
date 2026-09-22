
const $=s=>document.querySelector(s);

let entry="";
let wholeInches=0;
let hasUnits=false;
let fractionNumerator=null;
let fractionDenominatorText="";
let acc=null;
let op=null;
let result=0;
let justEquals=false;
let convIndex=0;
let history=[];

const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);

function roundedFraction(value,den=64){
  const sign=value<0?"−":"";
  const a=Math.abs(value);
  let whole=Math.floor(a+1e-10);
  let n=Math.round((a-whole)*den), d=den;
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
  const neg=value<0;
  const a=Math.abs(value);
  let ft=Math.floor(a/12+1e-10);
  const rem=a-ft*12;
  const f=roundedFraction(rem,64);
  let iw=f.whole;
  if(iw>=12){ft++;iw-=12}
  let ins=iw?String(iw):"";
  if(f.n) ins+=(ins?"-":"")+`${f.n}/${f.d}`;
  if(!ins) ins="0";
  return `${neg?"−":""}${ft} ft ${ins} in`;
}
const clean=n=>Math.abs(n)<1e-12?0:n;
const dec=(n,d=6)=>clean(n).toLocaleString(undefined,{maximumFractionDigits:d,useGrouping:false});

function fractionValue(){
  const den=Number(fractionDenominatorText);
  return fractionNumerator!==null && den>0 ? fractionNumerator/den : 0;
}
function pendingNumeric(){
  if(fractionNumerator!==null) return fractionValue();
  return entry===""?0:Number(entry)||0;
}
function operandValue(){
  return wholeInches + pendingNumeric();
}
function hasOperand(){
  return hasUnits || entry!=="" || fractionNumerator!==null;
}
function operandDisplay(){
  // Build exactly what the user is constructing, without inventing "0 ft".
  const parts=[];
  if(hasUnits && wholeInches!==0) parts.push(inchesOnly(wholeInches));
  else if(hasUnits) parts.push("0 in");

  if(fractionNumerator!==null){
    const den=fractionDenominatorText;
    parts.push(`${fractionNumerator}/${den}`);
  } else if(entry!==""){
    parts.push(entry);
  }
  return parts.join("  ") || "0";
}
function render(){
  const live=hasOperand();
  $("#cmMain").textContent=live?operandDisplay():feetInches(result);
  $("#cmHistory").textContent=history.length?history.join(" "):"Ready";

  const v=live?operandValue():result;
  $("#cmExact").textContent=`${dec(v,6)} in`;
  $("#cmFeet").textContent=`${dec(v/12,6)} ft`;

  const formats=[
    feetInches(result),
    `${dec(result/12,5)} ft`,
    `${dec(result,4)} in`,
    inchesOnly(result)
  ];
  $("#cmAlt").textContent=justEquals?formats[convIndex]:"Enter dimensions with ft / in keys.";
}
function resetOperand(){
  entry="";
  wholeInches=0;
  hasUnits=false;
  fractionNumerator=null;
  fractionDenominatorText="";
}
function startFreshIfNeeded(){
  if(justEquals && op===null){
    result=0;acc=null;history=[];justEquals=false;resetOperand();
  }
}
function digit(d){
  startFreshIfNeeded();
  if(fractionNumerator!==null){
    fractionDenominatorText+=d;
  } else {
    entry=(entry==="0")?d:entry+d;
  }
  render();
}
function decimal(){
  startFreshIfNeeded();
  if(fractionNumerator!==null) return;
  if(!entry.includes(".")) entry=entry===""?"0.":entry+".";
  render();
}
function feet(){
  startFreshIfNeeded();
  if(fractionNumerator!==null) return;
  if(entry==="") return;
  wholeInches+=(Number(entry)||0)*12;
  hasUnits=true;
  entry="";
  render();
}
function inches(){
  startFreshIfNeeded();

  // Complete a fraction: e.g. 8 in 3 / 32 in.
  if(fractionNumerator!==null){
    const den=Number(fractionDenominatorText);
    if(den>0){
      wholeInches+=fractionNumerator/den;
      hasUnits=true;
    }
    fractionNumerator=null;
    fractionDenominatorText="";
    entry="";
    render();
    return;
  }

  if(entry==="") return;
  wholeInches+=Number(entry)||0;
  hasUnits=true;
  entry="";
  render();
}
function fraction(){
  startFreshIfNeeded();
  if(fractionNumerator!==null || entry==="" || entry.includes(".")) return;
  fractionNumerator=Number(entry);
  fractionDenominatorText="";
  entry="";
  render();
}
function apply(a,b,o){
  if(o==="add") return a+b;
  if(o==="subtract") return a-b;
  if(o==="multiply") return a*b;
  if(o==="divide") return b===0?NaN:a/b;
  return b;
}
function symbol(o){return {add:"+",subtract:"−",multiply:"×",divide:"÷"}[o]}
function setOp(next){
  if(fractionNumerator!==null && !fractionDenominatorText) return;
  const v=operandValue();
  if(acc===null) acc=v;
  else if(op){
    const x=apply(acc,v,op);
    if(Number.isFinite(x)) acc=x;
  }
  result=acc;
  history=[feetInches(acc),symbol(next)];
  op=next;
  resetOperand();
  justEquals=false;
  render();
}
function equals(){
  if(fractionNumerator!==null && !fractionDenominatorText) return;
  const v=operandValue();
  if(op && acc!==null){
    const x=apply(acc,v,op);
    if(Number.isFinite(x)){
      history=[feetInches(acc),symbol(op),feetInches(v),"="];
      result=x;
    }else{
      history=["Cannot divide by zero"];
      result=0;
    }
  }else{
    result=v;
    history=[feetInches(v),"="];
  }
  acc=null;op=null;resetOperand();justEquals=true;convIndex=0;render();
}
function clearAll(){
  resetOperand();acc=null;op=null;result=0;justEquals=false;convIndex=0;history=[];render();
}
function back(){
  if(fractionNumerator!==null){
    if(fractionDenominatorText) fractionDenominatorText=fractionDenominatorText.slice(0,-1);
    else fractionNumerator=null;
  }else if(entry){
    entry=entry.slice(0,-1);
  }
  render();
}
function conv(){
  if(!justEquals) return;
  convIndex=(convIndex+1)%4;
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
  render();
}

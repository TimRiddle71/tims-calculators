
const $=s=>document.querySelector(s);
let entry="", measure=0, hasMeasure=false, fractionNumerator=null;
let acc=null, op=null, result=0, justEquals=false, convIndex=0, history=[];

const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function fracString(x,den=64){
  let whole=Math.floor(Math.abs(x)+1e-10), rem=Math.abs(x)-whole;
  let n=Math.round(rem*den), d=den;
  if(n===den){whole++;n=0}
  if(n){const g=gcd(n,d);n/=g;d/=g}
  return {whole,n,d,sign:x<0?"−":""};
}
function feetInches(inches){
  const neg=inches<0, a=Math.abs(inches), ft=Math.floor(a/12+1e-10), inch=a-ft*12;
  const f=fracString(inch,64);
  let inchWhole=f.whole, ft2=ft;
  if(inchWhole>=12){ft2++;inchWhole-=12}
  let ins=inchWhole?String(inchWhole):"";
  if(f.n) ins+=(ins?"-":"")+`${f.n}/${f.d}`;
  if(!ins) ins="0";
  return `${neg?"−":""}${ft2} ft ${ins} in`;
}
function inchFraction(inches){
  const f=fracString(inches,64);
  let out=f.whole?String(f.whole):"0";
  if(f.n) out+=(f.whole?"-":"")+`${f.n}/${f.d}`;
  return `${f.sign}${out} in`;
}
const clean=n=>Math.abs(n)<1e-12?0:n;
const dec=(n,d=5)=>clean(n).toLocaleString(undefined,{maximumFractionDigits:d,useGrouping:false});
function currentValue(){
  let v=measure;
  if(entry!=="") v+=Number(entry)||0;
  return v;
}
function committedValue(){
  if(hasMeasure) return measure;
  return entry===""?0:Number(entry)||0;
}
function render(){
  let display;
  if(entry!=="" || hasMeasure || fractionNumerator!==null){
    let pieces=[];
    if(hasMeasure) pieces.push(feetInches(measure));
    if(fractionNumerator!==null) pieces.push(`${fractionNumerator}/`);
    else if(entry!=="") pieces.push(entry);
    display=pieces.join("  ");
  } else display=feetInches(result);
  $("#cmMain").textContent=display||"0";
  $("#cmHistory").textContent=history.length?history.join(" "):"Ready";
  const v=(entry!==""||hasMeasure)?currentValue():result;
  $("#cmExact").textContent=`${dec(v,6)} in`;
  $("#cmFeet").textContent=`${dec(v/12,6)} ft`;
  const formats=[feetInches(result),`${dec(result/12,5)} ft`,`${dec(result,4)} in`,inchFraction(result)];
  $("#cmAlt").textContent=justEquals?formats[convIndex]:"Enter dimensions with ft / in keys.";
}
function resetEntry(){entry="";measure=0;hasMeasure=false;fractionNumerator=null}
function digit(d){
  if(justEquals && op===null){result=0;acc=null;history=[];justEquals=false}
  if(fractionNumerator!==null){entry+=d;render();return}
  if(entry==="0") entry=d; else entry+=d; render()
}
function decimal(){
  if(fractionNumerator!==null) return;
  if(!entry.includes(".")) entry=entry===""?"0.":entry+".";
  render()
}
function addUnit(mult){
  if(fractionNumerator!==null){
    const den=Number(entry);
    if(den>0){measure+=(fractionNumerator/den)*mult;hasMeasure=true}
    fractionNumerator=null;entry="";render();return;
  }
  if(entry==="") return;
  measure+=(Number(entry)||0)*mult;hasMeasure=true;entry="";render()
}
function fraction(){
  if(entry==="" || entry.includes(".")) return;
  fractionNumerator=Number(entry);entry="";render()
}
function labelValue(v){return feetInches(v)}
function apply(a,b,o){
  if(o==="add")return a+b;if(o==="subtract")return a-b;
  if(o==="multiply")return a*b;if(o==="divide")return b===0?NaN:a/b;return b;
}
function setOp(next){
  const v=committedValue();
  if(acc===null) acc=v;
  else if(op){const x=apply(acc,v,op);if(Number.isFinite(x))acc=x}
  result=acc; history=[labelValue(acc),{add:"+",subtract:"−",multiply:"×",divide:"÷"}[next]];
  op=next;resetEntry();justEquals=false;render()
}
function equals(){
  const v=committedValue();
  if(op && acc!==null){
    const x=apply(acc,v,op);
    if(Number.isFinite(x)){history=[labelValue(acc),{add:"+",subtract:"−",multiply:"×",divide:"÷"}[op],labelValue(v),"="];result=x}
    else {history=["Cannot divide by zero"];result=0}
  } else result=v;
  acc=null;op=null;resetEntry();justEquals=true;convIndex=0;render()
}
function clearAll(){entry="";measure=0;hasMeasure=false;fractionNumerator=null;acc=null;op=null;result=0;justEquals=false;convIndex=0;history=[];render()}
function back(){
  if(entry){entry=entry.slice(0,-1)}
  else if(fractionNumerator!==null) fractionNumerator=null;
  render()
}
function conv(){
  if(!justEquals) return;
  convIndex=(convIndex+1)%4;render()
}
export function initConstruction(){
  document.querySelectorAll("[data-cm-digit]").forEach(b=>b.addEventListener("click",()=>digit(b.dataset.cmDigit)));
  document.querySelectorAll("[data-cm-op]").forEach(b=>b.addEventListener("click",()=>setOp(b.dataset.cmOp)));
  document.querySelector('[data-cm="decimal"]').addEventListener("click",decimal);
  document.querySelector('[data-cm="feet"]').addEventListener("click",()=>addUnit(12));
  document.querySelector('[data-cm="inch"]').addEventListener("click",()=>addUnit(1));
  document.querySelector('[data-cm="fraction"]').addEventListener("click",fraction);
  document.querySelector('[data-cm="equals"]').addEventListener("click",equals);
  document.querySelector('[data-cm="clear"]').addEventListener("click",clearAll);
  document.querySelector('[data-cm="back"]').addEventListener("click",back);
  document.querySelector('[data-cm="conv"]').addEventListener("click",conv);
  render();
}

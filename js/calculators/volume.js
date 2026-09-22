
const $=s=>document.querySelector(s);
const unitToFt={in:1/12,ft:1,yd:3,m:3.280839895013123,cm:0.03280839895013123,mm:0.003280839895013123};
const cuFtPer={cuin:1/1728,cuft:1,cuyd:27,gal:1/7.48051948051948,liter:1/28.316846592,cum:35.31466672148859};
const fmt=(n,d=2)=>Number.isFinite(n)?n.toLocaleString(undefined,{maximumFractionDigits:d}):"—";
const val=id=>Math.max(0,parseFloat($(id).value)||0);
const feet=(id,uid)=>val(id)*unitToFt[$(uid).value];

function common(cuft){
  return `${fmt(cuft,3)} ft³  •  ${fmt(cuft/27,3)} yd³  •  ${fmt(cuft*7.48051948051948,1)} gal  •  ${fmt(cuft*28.316846592,1)} L`;
}
function calcBox(){
  const v=feet("#boxL","#boxLU")*feet("#boxW","#boxWU")*feet("#boxH","#boxHU");
  $("#boxPrimary").textContent=`${fmt(v,3)} ft³`;
  $("#boxSecondary").textContent=common(v);
}
function calcCylinder(){
  const d=feet("#cylD","#cylDU"),h=feet("#cylH","#cylHU"),v=Math.PI*(d/2)**2*h;
  $("#cylPrimary").textContent=`${fmt(v,3)} ft³`;
  $("#cylSecondary").textContent=common(v);
}
function calcConcrete(){
  const v=feet("#conL","#conLU")*feet("#conW","#conWU")*feet("#conT","#conTU");
  const yd=v/27,w=val("#conWaste"),order=yd*(1+w/100);
  $("#conOrder").textContent=`${fmt(order,2)} yd³`;
  $("#conBase").textContent=`Base volume: ${fmt(yd,2)} yd³  •  ${fmt(w,0)}% waste adds ${fmt(order-yd,2)} yd³  •  ${fmt(v,1)} ft³`;
}
let poolShape="rect";
function calcPool(){
  let v;
  if(poolShape==="rect") v=feet("#poolL","#poolLU")*feet("#poolW","#poolWU")*feet("#poolH","#poolHU");
  else {const d=feet("#poolD","#poolDU");v=Math.PI*(d/2)**2*feet("#poolDepth","#poolDepthU")}
  $("#poolGallons").textContent=`${fmt(v*7.48051948051948,0)} gal`;
  $("#poolSecondary").textContent=`${fmt(v,1)} ft³  •  ${fmt(v*28.316846592,0)} liters`;
}
function calcConvert(){
  const amount=val("#convAmount"),cuft=amount*cuFtPer[$("#convUnit").value];
  const rows=[
    ["Cubic inches",cuft*1728,"in³",2],
    ["Cubic feet",cuft,"ft³",4],
    ["Cubic yards",cuft/27,"yd³",4],
    ["US gallons",cuft*7.48051948051948,"gal",3],
    ["Liters",cuft*28.316846592,"L",3],
    ["Cubic meters",cuft/35.31466672148859,"m³",5]
  ];
  $("#conversionList").innerHTML=rows.map(([name,n,u,d])=>`<div class="conversion-row"><span>${name}</span><b>${fmt(n,d)} ${u}</b></div>`).join("");
}
function all(){calcBox();calcCylinder();calcConcrete();calcPool();calcConvert()}
export function initVolume(){
  document.querySelectorAll("[data-volume-mode]").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll("[data-volume-mode]").forEach(x=>x.classList.toggle("active",x===b));
    const map={box:"#volBox",cylinder:"#volCylinder",concrete:"#volConcrete",pool:"#volPool",convert:"#volConvert"};
    Object.values(map).forEach(id=>$(id).classList.add("hidden"));
    $(map[b.dataset.volumeMode]).classList.remove("hidden");
  }));
  document.querySelectorAll("[data-pool-shape]").forEach(b=>b.addEventListener("click",()=>{
    poolShape=b.dataset.poolShape;
    document.querySelectorAll("[data-pool-shape]").forEach(x=>x.classList.toggle("active",x===b));
    $("#poolRect").classList.toggle("hidden",poolShape!=="rect");
    $("#poolRound").classList.toggle("hidden",poolShape!=="round");
    calcPool();
  }));
  document.querySelectorAll("#volumeView input,#volumeView select").forEach(el=>{
    el.addEventListener("input",all); el.addEventListener("change",all);
  });
  all();
}

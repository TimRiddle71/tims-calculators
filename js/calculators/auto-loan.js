const m0=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const m2=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const pm=v=>Math.max(0,parseFloat(String(v).replace(/[^0-9.-]/g,""))||0);
export function initAutoLoan(){
 const ids=["#vehiclePrice","#autoDown","#tradeValue","#tradeOwed","#autoFees"], els=ids.map(x=>document.querySelector(x));
 const start=document.querySelector("#autoStart"); if(!start.value){const d=new Date();start.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
 const defaultStart=start.value;
 const defaults={vehiclePrice:45000,autoDown:5000,tradeValue:10000,tradeOwed:0,autoFees:500,autoTaxRate:6.25,autoApr:6.5,autoMonths:60};
 const v=id=>id==="#autoTaxRate"||id==="#autoApr"||id==="#autoMonths"?Math.max(0,parseFloat(document.querySelector(id).value)||0):pm(document.querySelector(id).value);
 function fmt(el){el.value=m0(pm(el.value))}
 els.forEach(el=>{el.addEventListener("focus",()=>{el.value=String(pm(el.value));setTimeout(()=>el.select(),0)});el.addEventListener("blur",()=>{fmt(el);calc()});el.addEventListener("input",calc)});
 function calc(){
  const price=v("#vehiclePrice"),down=Math.min(v("#autoDown"),price),tv=v("#tradeValue"),owed=v("#tradeOwed"),equity=tv-owed,fees=v("#autoFees");
  const mode=document.querySelector("#autoTaxMode").value;
  const taxRate=(mode==="texas"?6.25:v("#autoTaxRate"))/100;
  // Texas dealer-sale estimate: 6.25% of selling price less the motor-vehicle trade-in allowance.
  // Texas uses trade-in VALUE for the tax deduction, not trade equity/payoff.
  const taxable=Math.max(0,price-tv),tax=taxable*taxRate;
  const financed=Math.max(0,price-down-equity+tax+fees),months=Math.round(v("#autoMonths")),r=v("#autoApr")/1200;
  const pay=months?(r===0?financed/months:financed*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1)):0,total=pay*months,interest=total-financed;
  document.querySelector("#tradeEquity").textContent=(equity<0?"−":"")+m0(Math.abs(equity));
  document.querySelector("#tradeNote").textContent=equity<0?`${m0(Math.abs(equity))} of negative equity is being rolled into the new loan.`:equity>0?`${m0(equity)} reduces the amount financed.`:"No trade equity.";
  document.querySelector("#autoPriceOut").textContent=m0(price);document.querySelector("#autoDownOut").textContent="−"+m0(down);document.querySelector("#autoTradeOut").textContent=(equity>=0?"−":"+")+m0(Math.abs(equity));document.querySelector("#autoTaxOut").textContent="+"+m0(tax);document.querySelector("#autoFeesOut").textContent="+"+m0(fees);document.querySelector("#autoFinanced").textContent=m0(financed);
  document.querySelector("#autoMonthly").textContent=m2(pay);document.querySelector("#autoInterest").textContent=m0(interest);document.querySelector("#autoPayments").textContent=m0(total);document.querySelector("#autoTotalCost").textContent=m0(down+total);
  if(start.value){const [y,m]=start.value.split("-").map(Number),d=new Date(y,m-1+(months-1),1);document.querySelector("#autoPayoff").textContent=d.toLocaleDateString("en-US",{month:"long",year:"numeric"})}
  let bal=financed,yp=0,yi=0,yr=1,body="";
  for(let i=1;i<=months;i++){const intr=r?bal*r:0,prin=Math.min(bal,pay-intr);bal=Math.max(0,bal-prin);yp+=prin;yi+=intr;if(i%12===0||i===months){body+=`<tr><td>${yr++}</td><td>${m0(yp)}</td><td>${m0(yi)}</td><td>${m0(bal)}</td></tr>`;yp=0;yi=0}}
  document.querySelector("#autoAmortBody").innerHTML=body;
 }
 ["#autoTaxRate","#autoApr","#autoMonths","#autoStart"].forEach(id=>document.querySelector(id).addEventListener("input",calc));
 document.querySelector("#autoTaxMode").addEventListener("change",()=>{document.querySelector("#autoTaxRateWrap").classList.toggle("hidden",document.querySelector("#autoTaxMode").value!=="custom");calc()});
 ["#autoTaxRate","#autoApr"].forEach(id=>document.querySelector(id).addEventListener("focus",e=>setTimeout(()=>e.target.select(),0)));
 document.querySelector("#resetAuto").addEventListener("click",()=>{for(const [k,val] of Object.entries(defaults)){const el=document.querySelector("#"+k);el.value=["vehiclePrice","autoDown","tradeValue","tradeOwed","autoFees"].includes(k)?m0(val):val}start.value=defaultStart;calc()});
 els.forEach(fmt);calc();
}
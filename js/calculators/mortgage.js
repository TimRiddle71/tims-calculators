const money0=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const money2=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(Number.isFinite(n)?n:0);
const parseMoney=v=>Math.max(0,parseFloat(String(v).replace(/[^0-9.-]/g,""))||0);
const val=id=>{const el=document.querySelector(id);return el.dataset.money==="1"?parseMoney(el.value):Math.max(0,parseFloat(el.value)||0)};
export function initMortgage(){
 const moneyIds=["#homePrice","#downDollars","#propertyTax","#insurance","#hoa","#pmi"];
 moneyIds.forEach(id=>document.querySelector(id).dataset.money="1");
 const price=document.querySelector("#homePrice"),dd=document.querySelector("#downDollars"),dp=document.querySelector("#downPercent"),start=document.querySelector("#loanStart");
 const defaults={homePrice:350000,downDollars:70000,downPercent:20,interestRate:6.25,loanYears:30,propertyTax:6500,insurance:2400,hoa:0,pmi:0};
 if(!start.value){const d=new Date();start.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
 const defaultStart=start.value;
 let syncing=false;
 function formatField(el){el.value=money0(parseMoney(el.value))}
 moneyIds.forEach(id=>{const el=document.querySelector(id);el.addEventListener("focus",()=>{el.value=String(parseMoney(el.value))});el.addEventListener("blur",()=>{formatField(el);calc()})});
 function calc(){
  const P0=val("#homePrice"),down=Math.min(val("#downDollars"),P0),P=Math.max(0,P0-down),annual=val("#interestRate"),years=val("#loanYears"),n=Math.round(years*12),r=annual/1200;
  const pi=n?(r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)):0;
  const tax=val("#propertyTax")/12,ins=val("#insurance")/12,hoa=val("#hoa"),pmi=val("#pmi"),total=pi+tax+ins+hoa+pmi;
  document.querySelector("#monthlyTotal").textContent=money2(total)+"/month";
  document.querySelector("#piOut").textContent=money2(pi);document.querySelector("#taxOut").textContent=money2(tax);document.querySelector("#insOut").textContent=money2(ins);document.querySelector("#hoaOut").textContent=money2(hoa);document.querySelector("#pmiOut").textContent=money2(pmi);
  document.querySelector("#loanAmount").textContent=money0(P);document.querySelector("#totalPayments").textContent=money0(pi*n);document.querySelector("#totalInterest").textContent=money0(pi*n-P);
  if(start.value){const [y,m]=start.value.split("-").map(Number);const d=new Date(y,m-1+(n-1),1);document.querySelector("#payoffDate").textContent=d.toLocaleDateString("en-US",{month:"long",year:"numeric"})}
  let bal=P,body="",yearPrin=0,yearInt=0,yr=1;
  for(let i=1;i<=n;i++){const interest=r?bal*r:0,principal=Math.min(bal,pi-interest);bal=Math.max(0,bal-principal);yearPrin+=principal;yearInt+=interest;if(i%12===0||i===n){body+=`<tr><td>${yr++}</td><td>${money0(yearPrin)}</td><td>${money0(yearInt)}</td><td>${money0(bal)}</td></tr>`;yearPrin=0;yearInt=0}}
  document.querySelector("#amortBody").innerHTML=body;
 }
 price.addEventListener("input",()=>{if(syncing)return;syncing=true;dd.value=String(val("#homePrice")*val("#downPercent")/100);syncing=false;calc()});
 dd.addEventListener("input",()=>{if(syncing)return;syncing=true;dp.value=val("#homePrice")?((val("#downDollars")/val("#homePrice"))*100).toFixed(2):0;syncing=false;calc()});
 dp.addEventListener("input",()=>{if(syncing)return;syncing=true;dd.value=String(val("#homePrice")*val("#downPercent")/100);syncing=false;calc()});
 ["#interestRate","#loanYears","#loanStart","#propertyTax","#insurance","#hoa","#pmi"].forEach(id=>document.querySelector(id).addEventListener("input",calc));
 document.querySelector("#resetMortgage").addEventListener("click",()=>{
  price.value=money0(defaults.homePrice);dd.value=money0(defaults.downDollars);dp.value=defaults.downPercent;document.querySelector("#interestRate").value=defaults.interestRate;document.querySelector("#loanYears").value=defaults.loanYears;start.value=defaultStart;document.querySelector("#propertyTax").value=money0(defaults.propertyTax);document.querySelector("#insurance").value=money0(defaults.insurance);document.querySelector("#hoa").value=money0(defaults.hoa);document.querySelector("#pmi").value=money0(defaults.pmi);calc();
 });
 moneyIds.forEach(id=>formatField(document.querySelector(id)));calc();
}
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
const val=id=>Math.max(0,parseFloat(document.querySelector(id).value)||0);
export function initMortgage(){
 const price=document.querySelector("#homePrice"),dd=document.querySelector("#downDollars"),dp=document.querySelector("#downPercent"),start=document.querySelector("#loanStart");
 if(!start.value){const d=new Date();start.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
 let syncing=false;
 function calc(){
  const P0=val("#homePrice"),down=Math.min(val("#downDollars"),P0),P=Math.max(0,P0-down),annual=val("#interestRate"),years=val("#loanYears"),n=Math.round(years*12),r=annual/1200;
  const pi=n? (r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)):0;
  const tax=val("#propertyTax")/12,ins=val("#insurance")/12,hoa=val("#hoa"),pmi=val("#pmi"),total=pi+tax+ins+hoa+pmi;
  document.querySelector("#monthlyTotal").textContent=money(total);document.querySelector("#piOut").textContent=money(pi);document.querySelector("#taxOut").textContent=money(tax);document.querySelector("#insOut").textContent=money(ins);document.querySelector("#hoaOut").textContent=money(hoa);document.querySelector("#pmiOut").textContent=money(pmi);
  document.querySelector("#loanAmount").textContent=money(P);document.querySelector("#totalPayments").textContent=money(pi*n);document.querySelector("#totalInterest").textContent=money(pi*n-P);
  if(start.value){const [y,m]=start.value.split("-").map(Number),d=new Date(y,m-1+n,1);document.querySelector("#payoffDate").textContent=d.toLocaleDateString("en-US",{month:"long",year:"numeric"})}
  let bal=P,body="",yearPrin=0,yearInt=0,yr=1;
  for(let i=1;i<=n;i++){const interest=r?bal*r:0,principal=Math.min(bal,pi-interest);bal=Math.max(0,bal-principal);yearPrin+=principal;yearInt+=interest;if(i%12===0||i===n){body+=`<tr><td>${yr++}</td><td>${money(yearPrin)}</td><td>${money(yearInt)}</td><td>${money(bal)}</td></tr>`;yearPrin=0;yearInt=0}}
  document.querySelector("#amortBody").innerHTML=body;
 }
 price.addEventListener("input",()=>{if(syncing)return;syncing=true;dd.value=(val("#homePrice")*val("#downPercent")/100).toFixed(2);syncing=false;calc()});
 dd.addEventListener("input",()=>{if(syncing)return;syncing=true;dp.value=val("#homePrice")?((val("#downDollars")/val("#homePrice"))*100).toFixed(2):0;syncing=false;calc()});
 dp.addEventListener("input",()=>{if(syncing)return;syncing=true;dd.value=(val("#homePrice")*val("#downPercent")/100).toFixed(2);syncing=false;calc()});
 ["#interestRate","#loanYears","#loanStart","#propertyTax","#insurance","#hoa","#pmi"].forEach(id=>document.querySelector(id).addEventListener("input",calc));calc();
}
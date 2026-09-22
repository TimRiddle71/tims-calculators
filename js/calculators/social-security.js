const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Math.max(0,n||0));
const parseMoney=v=>Math.max(0,Number(String(v??"").replace(/[^0-9.-]/g,""))||0);

function fraMonthsForYear(year,month,day){
  // SSA treats Jan. 1 birthdays as if born in the previous year for FRA purposes.
  const y=(month===1&&day===1)?year-1:year;
  if(y<=1937)return 65*12;
  const map={1938:65*12+2,1939:65*12+4,1940:65*12+6,1941:65*12+8,1942:65*12+10};
  if(map[y])return map[y];
  if(y<=1954)return 66*12;
  const later={1955:66*12+2,1956:66*12+4,1957:66*12+6,1958:66*12+8,1959:66*12+10};
  return later[y]??67*12;
}
function delayedAnnualRate(year,month,day){
  const y=(month===1&&day===1)?year-1:year;
  if(y>=1943)return .08;
  if(y>=1941)return .075;if(y>=1939)return .07;if(y>=1937)return .065;if(y>=1935)return .06;
  if(y>=1933)return .055;if(y>=1931)return .05;if(y>=1929)return .045;if(y>=1927)return .04;
  if(y>=1925)return .035;return .03;
}
function factorAtMonths(claimMonths,fraMonths,annualDelay){
  if(claimMonths<fraMonths){
    const early=fraMonths-claimMonths, first=Math.min(36,early), extra=Math.max(0,early-36);
    return 1-first*(5/9)/100-extra*(5/12)/100;
  }
  const delayed=Math.min(70*12,claimMonths)-fraMonths;
  return 1+Math.max(0,delayed)*(annualDelay/12);
}
function ageText(totalMonths){const y=Math.floor(totalMonths/12),m=totalMonths%12;return m?`${y} years, ${m} months`:`${y} years`;}
function addMonthsUTC(y,m,d,months){
  const dt=new Date(Date.UTC(y,m-1,d));dt.setUTCMonth(dt.getUTCMonth()+months);return dt;
}
function dateLabel(dt){return dt.toLocaleDateString("en-US",{month:"long",year:"numeric",timeZone:"UTC"});}
function breakEven(earlyAge,earlyBenefit,lateAge,lateBenefit){
  const gap=lateAge-earlyAge, head=earlyBenefit*gap;
  if(lateBenefit<=earlyBenefit)return {age:null,head};
  const after=head/(lateBenefit-earlyBenefit);
  return {age:lateAge+after,head};
}
function ageFromMonthsDecimal(m){
  let total=Math.round(m), y=Math.floor(total/12), mo=total%12;
  return mo?`${y} years, ${mo} months`:`${y} years`;
}

export function initSocialSecurity(){
 const dob=$("#ssDob"),benefit=$("#ssFraBenefit");
 const formatBenefit=()=>benefit.value=money(parseMoney(benefit.value));
 benefit.addEventListener("focus",()=>{benefit.value=String(parseMoney(benefit.value));setTimeout(()=>benefit.select(),0)});
 benefit.addEventListener("blur",formatBenefit);
 benefit.addEventListener("input",calc);dob.addEventListener("input",calc);
 $("#resetSocial").addEventListener("click",()=>{dob.value="";benefit.value="$3,000";calc()});
 function clear(){
   $("#ssFraAge").textContent="—";$("#ssFraDate").textContent="Enter your date of birth.";
   ["#ss62","#ssFra","#ss70"].forEach(x=>$(x).textContent="$—");
   $("#ss62Pct").textContent="—";$("#ss70Pct").textContent="—";$("#ssAgeBody").innerHTML="";
   ["#ssBreak62Fra","#ssBreak6270","#ssBreakFra70"].forEach(x=>$(x).textContent="—");
   ["#ssHead62Fra","#ssHead6270","#ssHeadFra70"].forEach(x=>$(x).textContent="");
 }
 function calc(){
   const b=parseMoney(benefit.value);if(!dob.value||!b){clear();return;}
   const [y,m,d]=dob.value.split("-").map(Number);const fra=fraMonthsForYear(y,m,d),delay=delayedAnnualRate(y,m,d);
   const fraDate=addMonthsUTC(y,m,d,fra), f62=factorAtMonths(62*12,fra,delay), f70=factorAtMonths(70*12,fra,delay);
   const b62=b*f62,b70=b*f70;
   $("#ssFraAge").textContent=ageText(fra);$("#ssFraDate").textContent=`You reach FRA around ${dateLabel(fraDate)}.`;
   $("#ssFraLabel").textContent=`FULL RETIREMENT AGE · ${ageText(fra)}`;
   $("#ss62").textContent=money(b62);$("#ssFra").textContent=money(b);$("#ss70").textContent=money(b70);
   $("#ss62Pct").textContent=`${(f62*100).toFixed(1)}% of FRA benefit`;$("#ss70Pct").textContent=`${(f70*100).toFixed(1)}% of FRA benefit`;
   const rows=[];
   for(let age=62;age<=70;age++){
     const factor=factorAtMonths(age*12,fra,delay), monthly=b*factor;
     rows.push(`<tr${age*12===fra?' class="fra-row"':''}><td>${age}${age*12===fra?' · FRA':''}</td><td>${money(monthly)}</td><td>${money(monthly*12)}</td><td>${factor<1?'−':''}${Math.abs((factor-1)*100).toFixed(1)}%</td></tr>`);
   }
   if(fra%12){
     const monthly=b; rows.push(`<tr class="fra-row"><td>${ageText(fra)} · FRA</td><td>${money(monthly)}</td><td>${money(monthly*12)}</td><td>0.0%</td></tr>`);
     rows.sort((a,b)=>{const get=s=>{const t=s.match(/<td>(\d+)(?: years, (\d+) months)?/);return t?+t[1]*12+(+t[2]||0):0};return get(a)-get(b)});
   }
   $("#ssAgeBody").innerHTML=rows.join("");
   const pairs=[
     [62*12,b62,fra,b,"#ssBreak62Fra","#ssHead62Fra"],
     [62*12,b62,70*12,b70,"#ssBreak6270","#ssHead6270"],
     [fra,b,70*12,b70,"#ssBreakFra70","#ssHeadFra70"]
   ];
   for(const [ea,eb,la,lb,out,headOut] of pairs){const r=breakEven(ea,eb,la,lb);$(out).textContent=r.age===null?"No catch-up":`About age ${ageFromMonthsDecimal(r.age)}`;$(headOut).textContent=`Earlier claim collects about ${money(r.head)} before the later claim begins.`;}
 }
 calc();
}

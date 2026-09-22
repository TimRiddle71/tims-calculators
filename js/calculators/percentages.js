const fmt = new Intl.NumberFormat("en-US",{maximumFractionDigits:8});

export function initPercentages(){
  const mode=document.querySelector("#percentMode"),a=document.querySelector("#valueA"),b=document.querySelector("#valueB");
  const la=document.querySelector("#labelA"),lb=document.querySelector("#labelB"),answer=document.querySelector("#percentAnswer"),ex=document.querySelector("#percentExplanation");

  const labels={
    of:["Percent","Number"],
    whatPercent:["First number","Second number"],
    change:["Starting value","Ending value"],
    add:["Percent to add","Starting number"],
    subtract:["Percent to subtract","Starting number"]
  };

  function relabel(){[la.textContent,lb.textContent]=labels[mode.value];}
  function showError(msg){answer.textContent="—";ex.textContent=msg;}
  function calc(){
    const x=Number(a.value),y=Number(b.value);
    if(a.value===""||b.value===""||!Number.isFinite(x)||!Number.isFinite(y)){showError("Enter two valid numbers.");return;}
    let r,desc;
    switch(mode.value){
      case "of": r=x/100*y; desc=`${fmt.format(x)}% of ${fmt.format(y)}`; break;
      case "whatPercent":
        if(y===0){showError("The second number cannot be zero.");return;}
        r=x/y*100; answer.textContent=fmt.format(r)+"%"; ex.textContent=`${fmt.format(x)} is ${fmt.format(r)}% of ${fmt.format(y)}.`; return;
      case "change":
        if(x===0){showError("Starting value cannot be zero for percentage change.");return;}
        r=(y-x)/Math.abs(x)*100; answer.textContent=(r>=0?"+":"")+fmt.format(r)+"%"; ex.textContent=`Change from ${fmt.format(x)} to ${fmt.format(y)}.`; return;
      case "add": r=y*(1+x/100); desc=`${fmt.format(y)} plus ${fmt.format(x)}%`; break;
      case "subtract": r=y*(1-x/100); desc=`${fmt.format(y)} minus ${fmt.format(x)}%`; break;
    }
    answer.textContent=fmt.format(r); ex.textContent=`${desc} = ${fmt.format(r)}.`;
  }
  mode.addEventListener("change",relabel);
  document.querySelector("#calculatePercent").addEventListener("click",calc);
  document.querySelector("#clearPercent").addEventListener("click",()=>{a.value="";b.value="";answer.textContent="—";ex.textContent="Enter two numbers above.";a.focus();});
  [a,b].forEach(el=>el.addEventListener("keydown",e=>{if(e.key==="Enter")calc();}));
  relabel();
}

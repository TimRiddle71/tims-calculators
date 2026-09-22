import { initPercentages } from "./calculators/percentages.js";
import { initDaysUntil } from "./calculators/days-until.js";
const home=document.querySelector("#homeView"),percentages=document.querySelector("#percentagesView");
document.querySelector('[data-open="percentages"]').addEventListener("click",()=>{home.classList.add("hidden");percentages.classList.remove("hidden");window.scrollTo(0,0)});
document.querySelector("[data-home]").addEventListener("click",()=>{percentages.classList.add("hidden");home.classList.remove("hidden");window.scrollTo(0,0)});
document.querySelector('[data-open="days"]').addEventListener("click",()=>{home.classList.add("hidden");document.querySelector("#daysView").classList.remove("hidden");window.scrollTo(0,0)});
document.querySelector("[data-days-home]").addEventListener("click",()=>{document.querySelector("#daysView").classList.add("hidden");home.classList.remove("hidden");window.scrollTo(0,0)});
initPercentages(); initDaysUntil();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
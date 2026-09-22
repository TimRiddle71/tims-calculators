import { initPercentages } from "./calculators/percentages.js";
const home=document.querySelector("#homeView"),percentages=document.querySelector("#percentagesView");
document.querySelector('[data-open="percentages"]').addEventListener("click",()=>{home.classList.add("hidden");percentages.classList.remove("hidden");window.scrollTo(0,0)});
document.querySelector("[data-home]").addEventListener("click",()=>{percentages.classList.add("hidden");home.classList.remove("hidden");window.scrollTo(0,0)});
initPercentages();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
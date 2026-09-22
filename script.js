const form=document.getElementById("searchForm");
const input=document.getElementById("query");
const historyButton=document.getElementById("historyButton");
const historyBox=document.getElementById("history");
const status=document.getElementById("status");

function getHistory(){try{return JSON.parse(sessionStorage.getItem("hexSearchHistory")||"[]")}catch{return[]}}
function saveHistory(q){const h=getHistory().filter(x=>x!==q);h.unshift(q);sessionStorage.setItem("hexSearchHistory",JSON.stringify(h.slice(0,20)))}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const q=input.value.trim();
  if(!q)return;
  saveHistory(q);
  // Every search gets a fresh, single-use URL path.
  const token=crypto.randomUUID().replaceAll("-","").slice(0,12);
  const url=new URL(location.href);
  url.search="";
  url.hash="";
  url.pathname=url.pathname.replace(/\/$/,"")+"/"+token;
  location.replace("https://www.google.com/search?q="+encodeURIComponent(q));
});

historyButton.addEventListener("click",()=>{
  const h=getHistory();
  if(!h.length){status.textContent="No unused history.";historyButton.disabled=true;return}
  historyBox.innerHTML=h.map(q=>"<a href=\"https://www.google.com/search?q="+encodeURIComponent(q)+"\">"+escapeHtml(q)+"</a>").join("");
  historyBox.hidden=false;
  // One-time use: viewing History consumes it.
  sessionStorage.removeItem("hexSearchHistory");
  historyButton.disabled=true;
  status.textContent="History used. It will not be available again in this session.";
});

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

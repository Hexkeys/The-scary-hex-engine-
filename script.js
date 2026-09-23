const form=document.getElementById("searchForm");
const input=document.getElementById("query");
const historyButton=document.getElementById("historyButton");
const historyBox=document.getElementById("history");
const status=document.getElementById("status");

function getHistory(){try{return JSON.parse(sessionStorage.getItem("hexSearchHistory")||"[]")}catch{return[]}}
function saveHistory(q){const h=getHistory().filter(x=>x!==q);h.unshift(q);sessionStorage.setItem("hexSearchHistory",JSON.stringify(h.slice(0,20)))}
function token(){return crypto.randomUUID().replaceAll("-","").slice(0,12)}

async function showResults(q){
  const page=document.querySelector(".page");
  page.innerHTML=`<h1>Hex Search</h1><form id="searchForm" autocomplete="off"><input id="query" type="search" value="${escapeHtml(q)}" required><button type="submit">Search</button></form><section class="results"><h2>Search results for “${escapeHtml(q)}”</h2><p>Searching...</p></section>`;
  document.getElementById("searchForm").addEventListener("submit",search);
  try{
    const r=await fetch("/api/search?q="+encodeURIComponent(q));
    const data=await r.json();
    const box=document.querySelector(".results");
    if(!r.ok) throw new Error(data.error||"Search failed");
    box.innerHTML=`<h2>Search results for “${escapeHtml(q)}”</h2>`+(data.results.length?data.results.map(x=>`<article class="result"><a href="${escapeAttr(x.url)}" target="_blank" rel="noopener"><h3>${escapeHtml(x.title)}</h3></a><p>${escapeHtml(x.url)}</p></article>`).join(""):"<p>No results found.</p>");
  }catch(e){document.querySelector(".results").innerHTML=`<h2>Search results for “${escapeHtml(q)}”</h2><p>Search is temporarily unavailable. Please try again.</p>`;}
}

function search(e){
  e.preventDefault();
  const q=document.getElementById("query").value.trim();
  if(!q)return;
  saveHistory(q);
  const path=location.pathname.replace(/\/$/,"")+"/"+token();
  history.pushState({query:q,oneTime:true},"",path);
  showResults(q);
}

form.addEventListener("submit",search);
const state=history.state;
if(state && state.oneTime && state.query) showResults(state.query);

historyButton.addEventListener("click",()=>{
  const h=getHistory();
  if(!h.length){status.textContent="No unused history.";historyButton.disabled=true;return}
  historyBox.innerHTML=h.map(q=>"<a href=\""+location.pathname.replace(/\/$/,"")+"/"+token()+"\">"+escapeHtml(q)+"</a>").join("");
  historyBox.hidden=false; sessionStorage.removeItem("hexSearchHistory"); historyButton.disabled=true;
  status.textContent="History used. It will not be available again in this session.";
});

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/`/g,"&#96;")}

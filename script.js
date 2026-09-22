const form=document.getElementById("searchForm");
const input=document.getElementById("query");
const historyButton=document.getElementById("historyButton");
const historyBox=document.getElementById("history");
const status=document.getElementById("status");

function getHistory(){try{return JSON.parse(sessionStorage.getItem("hexSearchHistory")||"[]")}catch{return[]}}
function saveHistory(q){const h=getHistory().filter(x=>x!==q);h.unshift(q);sessionStorage.setItem("hexSearchHistory",JSON.stringify(h.slice(0,20)))}
function token(){return crypto.randomUUID().replaceAll("-","").slice(0,12)}

function showResults(q){
  document.querySelector(".page").innerHTML=`
    <h1>Hex Search</h1>
    <form id="searchForm" autocomplete="off">
      <input id="query" type="search" value="${escapeHtml(q)}" required>
      <button type="submit">Search</button>
    </form>
    <section class="results">
      <h2>Search results for “${escapeHtml(q)}”</h2>
      <p>Hex Search received your search.</p>
      <p class="hint">This page uses your private search text only to create this Hex Search result URL.</p>
    </section>
  `;
  document.getElementById("searchForm").addEventListener("submit",search);
}

function search(e){
  e.preventDefault();
  const q=document.getElementById("query").value.trim();
  if(!q)return;
  saveHistory(q);
  const path=location.pathname.replace(/\/$/,"")+"/"+token();
  history.pushState({query:q,oneTime:true}, "", path);
  showResults(q);
}

form.addEventListener("submit",search);

// A random result path is only valid in the current page session.
// Reloading or opening the random URL again will not restore the result.
const state=history.state;
if(state && state.oneTime && state.query){
  showResults(state.query);
}

historyButton.addEventListener("click",()=>{
  const h=getHistory();
  if(!h.length){status.textContent="No unused history.";historyButton.disabled=true;return}
  historyBox.innerHTML=h.map(q=>"<a href=\""+location.pathname.replace(/\/$/,"")+"/"+token()+"\">"+escapeHtml(q)+"</a>").join("");
  historyBox.hidden=false;
  sessionStorage.removeItem("hexSearchHistory");
  historyButton.disabled=true;
  status.textContent="History used. It will not be available again in this session.";
});

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

let token=localStorage.getItem("adminToken");
const login=document.getElementById("login"),panel=document.getElementById("admin");
async function adminLogin(){
 const password=document.getElementById("pw").value;
 const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
 const d=await r.json();if(!r.ok)return alert(d.error);token=d.token;localStorage.setItem("adminToken",token);login.style.display="none";panel.style.display="block";load();
}
async function load(){const r=await fetch("/api/admin/players",{headers:{Authorization:"Bearer "+token}});if(r.ok)render(await r.json());else {localStorage.removeItem("adminToken");}}
async function action(body){const r=await fetch("/api/admin/action",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(body)});if(!r.ok)alert((await r.json()).error);else load()}
function render(list){document.getElementById("adminPlayers").innerHTML=list.sort((a,b)=>b.score-a.score).map(p=>`<div class="ap"><b>${safe(p.name)}</b><small>${p.id.slice(0,8)} • ${p.score} pts • ${p.length} trail</small><div><button onclick="doAct('${p.id}','kick')">Kick</button><button onclick="doAct('${p.id}','ban')">Ban</button><button onclick="setScore('${p.id}')">Score</button><button onclick="setSpeed('${p.id}')">Speed</button><button onclick="setColor('${p.id}')">Color</button></div></div>`).join("")}
function safe(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
window.doAct=(id,a)=>action({action:a,playerId:id});
window.setScore=id=>{let v=prompt("New score");if(v!==null)action({action:"score",playerId:id,value:v})};
window.setSpeed=id=>{let v=prompt("Speed (80-500)");if(v!==null)action({action:"speed",playerId:id,value:v})};
window.setColor=id=>{let v=prompt("CSS color / hex","#25c9ff");if(v)action({action:"color",playerId:id,value:v})};
document.getElementById("loginBtn").onclick=adminLogin;
document.getElementById("announce").onclick=()=>{let v=prompt("Announcement");if(v)action({action:"announce",value:v})};
document.getElementById("reset").onclick=()=>{if(confirm("Reset every player's score?"))action({action:"reset"})};
document.getElementById("adminBtn").onclick=()=>{login.style.display="flex"};
document.getElementById("close").onclick=()=>{login.style.display="none"};
if(token){panel.style.display="block";setInterval(load,2500)}

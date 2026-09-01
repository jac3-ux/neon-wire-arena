const socket=io();
const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
let W,H,dpr,me=null,world=new Map(),leader=[],running=false,last=0;
const keys={}; let player={x:0,y:0,a:0,score:0,trail:[],boost:0,color:"#25c9ff",name:"Player",speed:170};
const WORLD=5000, GRID=100;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)} addEventListener("resize",resize);resize();
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(e.key===" ")e.preventDefault();});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

document.getElementById("play").onclick=()=>{
 player.name=(document.getElementById("name").value||"Player").slice(0,18);
 document.getElementById("start").style.display="none"; running=true; socket.emit("join",player.name); last=performance.now(); requestAnimationFrame(loop);
};
socket.on("me",d=>me=d.id);
socket.on("world",list=>{world=new Map(list.map(p=>[p.id,p]));});
socket.on("players",list=>{leader=list.sort((a,b)=>b.score-a.score).slice(0,8);renderBoard();});
socket.on("announce",m=>{if(m)showToast(m)});
socket.on("server:reset",()=>{player.score=0;player.trail=[]});
socket.on("kick",()=>{alert("You were kicked by the admin.");location.reload()});
socket.on("ban",()=>{alert("You were banned.");location.reload()});

function showToast(t){const e=document.getElementById("toast");e.textContent=t;e.style.display="block";clearTimeout(window.tt);window.tt=setTimeout(()=>e.style.display="none",3500)}
function renderBoard(){const e=document.getElementById("board");e.innerHTML="<b>LEADERBOARD</b>"+leader.map((p,i)=>`<div><span>${i+1}. ${esc(p.name)}</span><strong>${p.score}</strong></div>`).join("")}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function angleInput(){
 let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 let dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 return dx||dy?Math.atan2(dy,dx):null;
}
function update(dt){
 const target=angleInput();
 if(target!==null){let diff=Math.atan2(Math.sin(target-player.a),Math.cos(target-player.a));player.a+=Math.max(-5*dt,Math.min(5*dt,diff))}
 player.boost=keys[" "]?1:0;
 const speed=player.speed*(player.boost?1.75:1);
 player.x+=Math.cos(player.a)*speed*dt;player.y+=Math.sin(player.a)*speed*dt;
 const half=WORLD/2-35;
 if(player.x<-half)player.x=half;if(player.x>half)player.x=-half;if(player.y<-half)player.y=half;if(player.y>half)player.y=-half;
 const last=player.trail[player.trail.length-1];
 if(!last||Math.hypot(player.x-last[0],player.y-last[1])>5)player.trail.push([player.x,player.y]);
 while(player.trail.length>230)player.trail.shift();
 if(me)socket.emit("state",{x:player.x,y:player.y,angle:player.a,score:player.score,trail:player.trail});
}

function drawGrid(){
 ctx.fillStyle="#05080d";ctx.fillRect(0,0,W,H);
 const ox=((W/2-player.x)%GRID+GRID)%GRID,oy=((H/2-player.y)%GRID+GRID)%GRID;
 ctx.strokeStyle="rgba(40,100,145,.13)";ctx.lineWidth=1;
 for(let x=ox;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 for(let y=oy;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
}
function trail(points,color,width,glow){
 if(!points||points.length<2)return;
 ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.shadowColor=color;ctx.shadowBlur=glow;
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
 points.forEach((p,i)=>{const sx=W/2+(p[0]-player.x),sy=H/2+(p[1]-player.y);i?ctx.lineTo(sx,sy):ctx.moveTo(sx,sy)});ctx.stroke();
 ctx.shadowBlur=0;ctx.strokeStyle="rgba(255,255,255,.42)";ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function drawHead(x,y,color,r){
 const sx=W/2+(x-player.x),sy=H/2+(y-player.y);
 ctx.save();ctx.shadowColor=color;ctx.shadowBlur=25;ctx.fillStyle=color;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(sx,sy,r*.48,0,7);ctx.fill();ctx.restore();
}
function draw(){
 drawGrid();
 for(const p of world.values()){if(p.id===me)continue;trail(p.trail,p.color,17,17);drawHead(p.x,p.y,p.color,9)}
 trail(player.trail,player.color,22,25);drawHead(player.x,player.y,player.color,11);
 document.getElementById("score").textContent=player.score;
 document.getElementById("length").textContent=player.trail.length;
}
function loop(t){if(!running)return;const dt=Math.min(.035,(t-last)/1000||.016);last=t;update(dt);draw();requestAnimationFrame(loop)}

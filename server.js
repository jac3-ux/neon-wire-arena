const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");
const crypto=require("crypto");
const app=express(),server=http.createServer(app),io=new Server(server);
const PORT=process.env.PORT||3000;
const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||"jacobu483@gmail.com").toLowerCase();
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||"CHANGE-ME";
const players=new Map(),bans=new Set(),tokens=new Set();
app.use(express.json());app.use(express.static(path.join(__dirname,"public")));
function pub(p){return {id:p.id,name:p.name,score:p.score,color:p.color,length:p.trail.length,alive:p.alive}}
function state(){return [...players.values()].map(pub)}
app.post("/api/admin/login",(q,s)=>{const email=String(q.body.email||"").toLowerCase();if(email!==ADMIN_EMAIL||q.body.password!==ADMIN_PASSWORD)return s.status(401).json({error:"Invalid admin credentials"});const t=crypto.randomBytes(32).toString("hex");tokens.add(t);s.json({token:t})});
function admin(q,s,n){const t=(q.headers.authorization||"").replace("Bearer ","");if(!tokens.has(t))return s.status(401).json({error:"Unauthorized"});n()}
app.get("/api/admin/players",admin,(q,s)=>s.json(state()));
app.post("/api/admin/action",admin,(q,s)=>{const {action,playerId,value}=q.body,p=players.get(playerId);if(action==="announce"){io.emit("announce",String(value||""));return s.json({ok:true})}if(action==="reset"){for(const x of players.values()){x.score=0;x.alive=true;x.trail=[]}io.emit("server:reset");return s.json({ok:true})}if(!p)return s.status(404).json({error:"Player not found"});if(action==="kick")io.to(playerId).emit("kick");if(action==="ban"){bans.add(playerId);io.to(playerId).emit("ban")}if(action==="score")p.score=Math.max(0,Number(value)||0);if(action==="speed")p.speed=Math.max(80,Math.min(500,Number(value)||170));if(action==="color")p.color=String(value||"#27c9ff");io.emit("players",state());s.json({ok:true})});
io.on("connection",socket=>{if(bans.has(socket.id))return socket.disconnect(true);const colors=["#25c9ff","#ff3d7f","#ffd43b","#9b6cff","#38e56b","#ff7b2f","#55e6ff","#ff4b4b"];const p={id:socket.id,name:"Player",score:0,color:colors[Math.floor(Math.random()*colors.length)],x:(Math.random()-.5)*1800,y:(Math.random()-.5)*1800,angle:Math.random()*Math.PI*2,speed:170,trail:[],alive:true};players.set(socket.id,p);socket.emit("me",{id:p.id});io.emit("players",state());socket.on("join",name=>{p.name=String(name||"Player").slice(0,18);io.emit("players",state())});socket.on("state",d=>{if(!p.alive)return;if(Number.isFinite(d.x))p.x=d.x;if(Number.isFinite(d.y))p.y=d.y;if(Number.isFinite(d.angle))p.angle=d.angle;if(Number.isFinite(d.score))p.score=Math.max(0,Math.min(999999,d.score));p.trail=Array.isArray(d.trail)?d.trail.slice(-220):p.trail;io.emit("world",state().map(x=>({id:x.id,x:players.get(x.id).x,y:players.get(x.id).y,angle:players.get(x.id).angle,trail:players.get(x.id).trail,color:x.color,name:x.name,score:x.score,alive:x.alive})))});socket.on("disconnect",()=>{players.delete(socket.id);io.emit("players",state())})});
server.listen(PORT,()=>console.log("Neon Wire server listening on "+PORT));

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true }, maxHttpBufferSize: 1e5, pingInterval: 25000, pingTimeout: 20000 });
const root = __dirname;
app.use('/vendor', express.static(path.join(root, 'node_modules/three/build')));
app.use(express.static(path.join(root, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, matches: matches.size, players: players.size }));
const players = new Map();
const matches = new Map();
const MATCH_SIZE = 8;
const limit = (v, lo, hi) => Math.max(lo, Math.min(hi, Number(v) || 0));
let nextMatch = 1;
function makeRoom() { const id = `arena-${nextMatch++}`; matches.set(id, new Set()); return id; }
function chooseRoom() { for (const [id, ids] of matches) if (ids.size < MATCH_SIZE) return id; return makeRoom(); }
function snapshot(roomId) { return [...(matches.get(roomId) || [])].map(id => players.get(id)).filter(Boolean).map(({ id, name, x, z, yaw, pitch, hp, weapon, color }) => ({ id, name, x, z, yaw, pitch, hp, weapon, color })); }
function spawn(p) { p.x=(Math.random()-.5)*14; p.z=(Math.random()-.5)*14; p.hp=100; }
io.on('connection', socket => {
  const roomId=chooseRoom(), hue=Math.floor(Math.random()*360);
  const p={ id:socket.id, roomId, name:'Joueur '+socket.id.slice(0,4), x:0,z:0,yaw:0,pitch:0,hp:100,weapon:1,color:`hsl(${hue} 82% 61%)`,lastFire:0,lastSpecial:0 };
  spawn(p);players.set(socket.id,p);matches.get(roomId).add(socket.id);socket.join(roomId);
  socket.emit('welcome',{id:socket.id,room:roomId,players:snapshot(roomId)});
  socket.to(roomId).emit('joined', {id:p.id,name:p.name});
  socket.on('identify', name=>{if(typeof name==='string')p.name=name.trim().slice(0,18)||p.name;});
  socket.on('move',d=>{if(!d||p.hp<=0)return;p.x=limit(d.x,-46,46);p.z=limit(d.z,-46,46);p.yaw=limit(d.yaw,-1000,1000);p.pitch=limit(d.pitch,-1.5,1.5);p.weapon=[1,2,3].includes(d.weapon)?d.weapon:1;});
  socket.on('fire',data=>{
    const special=!!(data&&data.special),now=Date.now(),cooldown=special?7000:p.weapon===2?680:p.weapon===3?105:230;
    if(p.hp<=0||now-p.lastFire<cooldown||special&&now-p.lastSpecial<7000)return;
    p.lastFire=now;if(special)p.lastSpecial=now;
    for(const targetId of matches.get(roomId)||[]){const target=players.get(targetId);if(!target||target.id===p.id||target.hp<=0)continue;
      const dx=target.x-p.x,dz=target.z-p.z,dist=Math.hypot(dx,dz),bearing=Math.atan2(-dx,-dz);let delta=((bearing-p.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
      if(dist<(special?30:p.weapon===2?30:23)&&Math.abs(delta)<(special?.12:p.weapon===3?.15:.075)){
        target.hp=Math.max(0,target.hp-(special?100:p.weapon===2?70:p.weapon===3?9:24));io.to(target.id).emit('hurt',{hp:target.hp,from:p.name});
        if(target.hp===0){io.to(roomId).emit('elimination',{killer:p.name,victim:target.name});setTimeout(()=>{if(players.has(target.id)){spawn(target);io.to(target.id).emit('respawn');}},2400);}
      }
    }
    io.to(roomId).emit('shot',{id:p.id,weapon:special?4:p.weapon,x:p.x,z:p.z,yaw:p.yaw});
  });
  socket.on('disconnect',()=>{players.delete(socket.id);const ids=matches.get(roomId);if(ids){ids.delete(socket.id);socket.to(roomId).emit('left',socket.id);if(ids.size===0)matches.delete(roomId);}});
});
setInterval(()=>{for(const roomId of matches.keys())io.to(roomId).emit('state',snapshot(roomId));},100);
const port=process.env.PORT||3000;
server.listen(port,'0.0.0.0',()=>console.log(`XPLIT server listening on port ${port}`));

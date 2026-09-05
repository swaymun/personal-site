import {clamp,distance,rect,text,circle,hero,hud,Edge} from './core';
import type {Game,Status} from './core';import type {InputState} from '../lib/input';
type Enemy={x:number;y:number;hp:number;boss:boolean;hit:number};
export class Arena implements Game {
 width=480;height=320;status:Status='playing';message='';score=0;x=240;y=190;hp=6;wave=1;enemies:Enemy[]=[];attack=0;dodge=0;invincible=0;cooldown=0;facing=1;drops:{x:number;y:number}[]=[];private swing=new Edge();private roll=new Edge();
 constructor(){this.spawn();}
 spawn(){this.enemies=Array.from({length:this.wave===4?1:this.wave+1},(_,i)=>({x:i%2?425:55,y:70+i*48,hp:this.wave===4?14:3,boss:this.wave===4,hit:0}));}
 update(dt:number,input:InputState){
  if(this.status!=='playing')return;this.attack=Math.max(0,this.attack-dt);this.dodge=Math.max(0,this.dodge-dt);this.cooldown=Math.max(0,this.cooldown-dt);this.invincible=Math.max(0,this.invincible-dt);
  const attack=this.swing.pressed(input.has('action')),dodge=this.roll.pressed(input.has('back'));
  if(dodge&&this.cooldown===0){this.dodge=.24;this.invincible=.4;this.cooldown=.75;}
  const speed=this.dodge>0?320:135;const len=Math.hypot(input.x,input.y)||1;this.x=clamp(this.x+input.x/len*speed*dt,28,452);this.y=clamp(this.y+input.y/len*speed*dt,65,289);if(input.x)this.facing=input.x;
  if(attack&&this.attack===0){this.attack=.2;for(const e of this.enemies)if(distance(this,e)<(e.boss?68:57)){e.hp--;e.hit=.18;const dx=e.x-this.x,dy=e.y-this.y,n=Math.hypot(dx,dy)||1;e.x=clamp(e.x+dx/n*18,25,455);e.y=clamp(e.y+dy/n*18,65,285);}}
  for(const e of this.enemies){e.hit=Math.max(0,e.hit-dt);if(e.hp<=0)continue;const dist=distance(this,e)||1;const speed=e.boss?48:35+this.wave*5;if(e.hit===0){e.x+=(this.x-e.x)/dist*speed*dt;e.y+=(this.y-e.y)/dist*speed*dt;}if(dist<(e.boss?30:20)&&this.invincible===0){this.hp--;this.invincible=1;}}
  for(const e of this.enemies.filter(e=>e.hp<=0)){this.score+=e.boss?500:50;if(this.drops.length===0)this.drops.push({x:e.x,y:e.y});}this.enemies=this.enemies.filter(e=>e.hp>0);
  this.drops=this.drops.filter(drop=>{if(distance(this,drop)<22){this.hp=Math.min(6,this.hp+1);return false;}return true;});
  if(this.hp<=0){this.status='lost';this.message='The arena is quiet. Rise and try again.';return;}
  if(!this.enemies.length){if(this.wave===4){this.status='won';this.message='The bronze guardian falls. The gates are open.';}else{this.wave++;this.hp=Math.min(6,this.hp+1);this.spawn();}}
 }
 draw(c:CanvasRenderingContext2D){rect(c,0,0,480,320,'#312a2c');rect(c,17,45,446,258,'#705949');for(let y=52;y<300;y+=32)for(let x=20;x<465;x+=48){rect(c,x,y,45,29,(x+y)%3?'#78614f':'#806953');}c.strokeStyle='#9b7d5d';c.lineWidth=3;c.beginPath();c.ellipse(240,179,154,97,0,0,Math.PI*2);c.stroke();c.beginPath();c.ellipse(240,179,117,73,0,0,Math.PI*2);c.stroke();
  for(const x of [28,452])for(const y of [58,287]){rect(c,x-8,y-12,16,27,'#332f32');circle(c,x,y-14,6,'#ffc65c');circle(c,x,y-17,3,'#fff0a7');}
  for(const d of this.drops){circle(c,d.x,d.y,5,'#8fce72');text(c,'+',d.x,d.y+4,12,'#26442c','center');}
  for(const e of this.enemies){circle(c,e.x,e.y+2,e.boss?20:10,'#493d35');if(e.boss){rect(c,e.x-15,e.y-30,30,30,e.hit?'#f9edcd':'#ad885b');rect(c,e.x-10,e.y-43,20,17,'#d3b16c');rect(c,e.x-7,e.y-36,14,4,'#392e2a');rect(c,e.x-18,e.y-50,36,3,'#372c2b');rect(c,e.x-18,e.y-50,36*e.hp/14,3,'#e1b15e');}else hero(c,e.x,e.y,e.hit?'#fff2bf':'#aa6555');}
  if(this.attack>0){c.strokeStyle='#f3d894';c.lineWidth=6;c.beginPath();c.arc(this.x,this.y-12,44,-.5,Math.PI*1.5);c.stroke();}if(this.invincible===0||Math.floor(this.invincible*12)%2)hero(c,this.x,this.y,this.dodge?'#9be3d8':'#e2d2b5',this.facing);hud(c,`${this.wave===4?'GUARDIAN':'WAVE '+this.wave+'/3'}  HEALTH ${this.hp}`,`${this.score}`);text(c,'Z ATTACK  X DODGE',240,315,9,'#d7c3a6','center');}
}
export const createGame=()=>new Arena();

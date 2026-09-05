import type {InputState} from '../lib/input';
export type Status='playing'|'won'|'lost';
export interface Game {width:number;height:number;score:number;status:Status;message:string;update(dt:number,input:InputState):void;draw(ctx:CanvasRenderingContext2D):void;}
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
export function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
export function text(c:CanvasRenderingContext2D,t:string,x:number,y:number,size=12,color='#fff',align:CanvasTextAlign='left'){c.font=`${size}px monospace`;c.fillStyle=color;c.textAlign=align;c.fillText(t,Math.round(x),Math.round(y));c.textAlign='left';}
export function circle(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
export function hero(c:CanvasRenderingContext2D,x:number,y:number,color='#f1ae4b',facing=1){rect(c,x-7,y-18,14,13,color);rect(c,x-5,y-25,10,9,'#f8d5a4');rect(c,x-7,y-29,14,5,color);rect(c,x-6,y-5,5,5,'#273d50');rect(c,x+2,y-5,5,5,'#273d50');rect(c,x+facing*3-1,y-23,2,2,'#283544');}
export function hud(c:CanvasRenderingContext2D,left:string,right:string,width=480){rect(c,0,0,width,28,'#172a32');text(c,left,12,19,11,'#eef0d4');text(c,right,width-45,19,11,'#eef0d4','right');}
export class Edge {
 private held=false;
 pressed(now:boolean){const result=now&&!this.held;this.held=now;return result;}
}
export function random(seed:number){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}

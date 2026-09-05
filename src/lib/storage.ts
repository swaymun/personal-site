export interface StorageLike { getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void; }
export function readValue(key:string,fallback='',storage?:StorageLike):string {try{return (storage??localStorage).getItem(`handheld:${key}`)??fallback;}catch{return fallback;}}
export function writeValue(key:string,value:string,storage?:StorageLike):boolean {try{(storage??localStorage).setItem(`handheld:${key}`,value);return true;}catch{return false;}}
export function readScore(id:string):number {const n=Number(readValue(`score:${id}`));return Number.isFinite(n)&&n>=0?n:0;}
export function saveScore(id:string,score:number):boolean{return writeValue(`score:${id}`,String(Math.max(readScore(id),score)));}

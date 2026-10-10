// Pure JSON authority-data helpers. Runtime controls remain required before gameplay.
import {TextDecoder} from 'node:util';
const need=(v,m)=>{if(!v)throw Error('STOP_'+m)};
export const equal=(a,b)=>{
 if(typeof a!==typeof b)return false;if(a===null||b===null)return a===b;
 if(typeof a!=='object')return a===b;if(Array.isArray(a)!==Array.isArray(b))return false;
 const ka=Object.keys(a).sort(),kb=Object.keys(b).sort();return ka.length===kb.length&&ka.every((k,i)=>k===kb[i]&&equal(a[k],b[k]));
};
// Preserve exact nanosecond integer tokens. Native JSON.parse would round them.
export function parseExact(raw,clockGuard=()=>{}){
 const t=new TextDecoder('utf-8',{fatal:true}).decode(raw);let at=0;const ws=()=>{while(at<t.length&&/[ \t\r\n]/.test(t[at]))at++};
 function str(){need(t[at]==='"','JSON_STRING');const start=at++;let closed=false;while(at<t.length){const ch=t[at++];if(ch==='\\'){need(at<t.length,'JSON_ESCAPE');at++}else if(ch==='"'){closed=true;break}}need(closed,'JSON_STRING_END');return JSON.parse(t.slice(start,at))}
 function value(depth){clockGuard();need(depth<=100,'JSON_DEPTH');ws();const ch=t[at];
  if(ch==='"')return str();
  if(ch==='{'){at++;ws();const out=Object.create(null);if(t[at]==='}'){at++;return out}for(;;){ws();const key=str();need(!Object.hasOwn(out,key),'DUPLICATE_JSON_KEY');ws();need(t[at++]===':','JSON_COLON');out[key]=value(depth+1);ws();const sep=t[at++];if(sep==='}')return out;need(sep===',','JSON_OBJECT_SEPARATOR')}}
  if(ch==='['){at++;ws();const out=[];if(t[at]===']'){at++;return out}for(;;){out.push(value(depth+1));ws();const sep=t[at++];if(sep===']')return out;need(sep===',','JSON_ARRAY_SEPARATOR')}}
  for(const [word,v] of [['true',true],['false',false],['null',null]])if(t.startsWith(word,at)){at+=word.length;return v}
  const m=/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(t.slice(at));need(m,'JSON_VALUE');at+=m[0].length;
  if(!/[.eE]/.test(m[0])){const n=BigInt(m[0]);return n>=BigInt(Number.MIN_SAFE_INTEGER)&&n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):n}
  const n=Number(m[0]);need(Number.isFinite(n),'JSON_NONFINITE');return n;
 }
 const v=value(0);ws();need(at===t.length,'JSON_TRAILING_DATA');return v;
}

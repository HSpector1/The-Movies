// Bounded lazy traversal; no decoded-row collection or cache.
export class TraceSequence{
 constructor(factory){this.factory=factory;return new Proxy(this,{get(target,key,receiver){
  if(typeof key==='string'&&/^(0|[1-9][0-9]*)$/.test(key))return target.at(Number(key))
  return Reflect.get(target,key,receiver)
 }})}
 [Symbol.iterator](){return this.factory()}
 get length(){let n=0;for(const _ of this)n++;return n}
 map(fn){const self=this;return new TraceSequence(function*(){let i=0;for(const value of self)yield fn(value,i++)})}
 filter(fn){const self=this;return new TraceSequence(function*(){let i=0;for(const value of self)if(fn(value,i++))yield value})}
 flatMap(fn){const self=this;return new TraceSequence(function*(){let i=0;for(const value of self)yield* fn(value,i++)})}
 some(fn){let i=0;for(const value of this)if(fn(value,i++))return true;return false}
 at(index){if(index<0)index=this.length+index;let i=0;for(const value of this)if(i++===index)return value;return undefined}
 slice(start=0,end=Infinity){const self=this;return new TraceSequence(function*(){let i=0;for(const value of self){if(i>=end)return;if(i++>=start)yield value}})}
 *entries(){let i=0;for(const value of this)yield [i++,value]}
}
export const traceSequence=factory=>new TraceSequence(factory)

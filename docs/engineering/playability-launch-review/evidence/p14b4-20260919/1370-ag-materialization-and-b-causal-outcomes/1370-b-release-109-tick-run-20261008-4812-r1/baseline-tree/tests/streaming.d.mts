export const MAX:number,TOTAL:number,RESERVE:number
export function sha(raw:string|Buffer):string
export function boundedJson(value:any,limit?:number):Buffer
export function boundedFile(path:string):Buffer
export function openRegular(path:string):number
export function readMember(fd:number,locator:any):Buffer
export function parseRow(raw:Buffer,week:number,role:string,seed:string):any
export function validateIndex(index:any,path:string,role:string,seed:string):void
export function fileSha(path:string):string
export function fullDifferences(left:any,right:any):any[]
export function joinRows(left:any[],right:any[],key:(row:any)=>any[]):any
export function optional(row:any,key:string):any
export function classifyCount(found:number,total?:number):string
export function emitJson(path:string,value:any,root:string):string
export function budget(root:string,additional?:number):void
export class CaptureWriter {constructor(path:string,root:string,role:string,seed:string);append(row:any):Buffer;close(path:string):any;abort():void}

export function checkRegular(fd:number):void
export function closeRegular(fd:number):void

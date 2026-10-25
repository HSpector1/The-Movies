// One actual current49 publication rollback control. Original private48 fault controls stay historical.
import { expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as saves from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
it('actual49 closure publication refusal rolls back the fully admitted pre-C caller',()=>{
 const path=process.env.P16_JOIN_PREC48_PATH,sha=process.env.P16_JOIN_PREC48_SHA256
 expect(path,'bind exact original public48 pre162 capture').toBeTruthy()
 expect(sha).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
 const bytes=readFileSync(path!);expect(createHash('sha256').update(bytes).digest('hex')).toBe(sha)
 const raw=JSON.parse(bytes.toString()),original=saves.stableStringify(raw),old=saves.validateSaveP15B(raw)
 expect(old.state.market.tick).toBe(162)
 const current=saves.convertV48ToV49(old),input=current.state,before=saves.stableStringify(input)
 expect(saves.validateSaveV49(current)).toBe(current);saves.makeSave(input)
 // Mandatory unmodified real action and full publication baseline BEFORE fault injection.
 const positive=tick(input)
 expect(positive.market.tick).toBe(163)
 const closure=positive.studioClosure.closures.find(c=>c.studioId==='studio-aca408ec-r04')!
 expect(closure).toBeDefined();expect(closure.closureWeek).toBe(163)
 expect(positive.rights.estates.filter(e=>e.closureId===closure.closureId)).toHaveLength(1)
 saves.makeSave(positive)
 expect(saves.stableStringify(input)).toBe(before);expect(saves.stableStringify(raw)).toBe(original)
 const realReader=saves.validateSaveV49,marker='P16_REAL_CURRENT49_PUBLICATION_REFUSAL'
 const spy=vi.spyOn(saves,'validateSaveV49').mockImplementation(envelope=>{
  // REAL admission precedes fault; no permissive replacement can publish a candidate.
  const admitted=realReader(envelope)
  expect(admitted.state.market.tick).toBe(163)
  expect(admitted.state.studioClosure.closures.some(c=>c.closureId===closure.closureId)).toBe(true)
  expect(admitted.state.rights.estates.some(e=>e.closureId===closure.closureId)).toBe(true)
  throw new Error(marker)
 })
 try {
  expect(()=>tick(input)).toThrow(marker)
  expect(spy).toHaveBeenCalledTimes(1)
 } finally {
  spy.mockRestore()
  expect(saves.stableStringify(input)).toBe(before)
  expect(saves.stableStringify(raw)).toBe(original)
 }
})

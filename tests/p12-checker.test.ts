import {describe,it,expect} from 'vitest'
// @ts-expect-error Native standalone warning adapter deliberately has no build dependency.
import {evaluate} from '../scripts/p12a-milestone-checker.mjs'
const partial={version:1,order:'OPS-P12A-LIVING-HOLLYWOOD-20260910-05',status:'PARTIAL',milestone:'gate-b'}
describe('R05 explicit checker transport and scope (not real-client hook proof)',()=>{
  it('leaves safe partial, blocked, reentry and Owner stop alone',()=>{
    for(const status of ['PARTIAL','BLOCKED','INTERRUPTED'])expect(evaluate({...partial,status})).toEqual({})
    expect(evaluate(null,{}, {stop_hook_active:true})).toEqual({})
    expect(evaluate(null,{}, {owner_stop:true})).toEqual({})
  })
  it('warns on explicit unproved completion using only nonblocking JSON',()=>{
    const output=evaluate({...partial,status:'COMPLETE'})
    expect(Object.keys(output)).toEqual(['systemMessage'])
    expect(output.systemMessage).toContain('R05 MILESTONE WARNING')
    expect(JSON.stringify(output)).not.toMatch(/"decision"|"continue"/)
  })
  it('does not accept all-green metadata as independent evidence',()=>{
    const output=evaluate({...partial,status:'COMPLETE',evidence:[{kind:'product-review-full',outcome:'PASS'}]})
    expect(output.systemMessage).toBeTruthy()
    expect(()=>evaluate({...partial,order:'R04'})).toThrow()
  })
})

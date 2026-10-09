// UNRUN pure canonical eligibility/context controls; no game modules.
import assert from 'node:assert/strict'
import { targeted,identified,caseKey,receiptKey } from './targeted.mjs'
const talentId='talent',contractId='contract',studioId='studio-5a47d054-r04'
const caseRow={contractId,variant:'expiry',talentId,subjectStudioId:studioId,openedWeek:404,closedWeek:416,outcome:'declined',reason:'historical'}
const discovered={week:404,kind:'discovered',talentId,studioId,eventId:'old-d'},declined={week:416,kind:'declined',talentId,studioId:null,eventId:'old-x'}
const entry={identity:[contractId,0],row:{contractId,terms:{talentId}}},selected=[entry]
const contextEntry=(row,key,sourceOrdinal)=>({row,identity:identified([row],key,416)[0].identity,sourceOrdinal,eventId:row.eventId??null,recordedAtTerminalBoundary:416})
const context={contextRole:'fixture E0G terminal416',cases:[contextEntry(caseRow,caseKey,42)],market:[contextEntry(discovered,receiptKey,167),contextEntry(declined,receiptKey,241)]}
const state=cases=>({market:{tick:416},talentMarket:{cases,receipts:[discovered,declined]}})
let count=0;const test=(name,run)=>{run();count++;process.stdout.write(`PASS ${name}\n`)}
test('expected expiry identity counts; recorded locators remain descriptive',()=>{const out=targeted(state([caseRow]),selected,context);assert.equal(out.discoveryReturn,'ALL');assert.equal(out.declineReturn,'ALL');assert.equal(out.rows[0].cases[0].ordinal,0);assert.equal(out.rows[0].cases[0].recordedE0GSourceOrdinal,42)})
test('changed variant cannot masquerade as expiry; full payload remains visible',()=>{const changed={...caseRow,variant:'replacement',reason:'changed payload'};const out=targeted(state([changed]),selected,context);assert.equal(out.discoveryReturn,'NONE');assert.equal(out.declineReturn,'NONE');assert.deepEqual(out.rows[0].mismatchedCases[0].row,changed);assert.ok(out.rows[0].cases[0].recordedE0GContentDifferences.some(x=>x.path==='$.variant'))})
test('same expected identity with changed payload stays neutral and visible',()=>{const out=targeted(state([{...caseRow,reason:'different actual reason'}]),selected,context);assert.equal(out.declineReturn,'ALL');assert.ok(out.rows[0].cases[0].recordedE0GContentDifferences.some(x=>x.path==='$.reason'));assert.equal(out.classification,'DIAGNOSTIC_NONE_PARTIAL_ALL_VALID')})
test('source occurrence is assigned before target filtering',()=>{const out=targeted(state([{...caseRow,subjectStudioId:'other'},caseRow]),selected,context);assert.equal(out.declineReturn,'NONE');assert.equal(out.rows[0].cases[0].identity.at(-1),1)})
process.stdout.write(`targeted controls ${count}/${count}\n`)

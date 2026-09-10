import {describe,it,expect} from 'vitest'
import {BridgeSession} from '../bridge/session.ts'
import {PROTOCOL_VERSION,SCHEMA_ID} from '../bridge/protocol.ts'
import {industryPage} from '../bridge/industry.ts'
import {parseWireValue} from '../bridge/schema/runtime.ts'
import {BRIDGE_SCHEMA} from '../bridge/schema/bridge-schema.ts'
import type {IndustryQuery} from '../bridge/schema/industry-schema.ts'
import {generateWorld,tick} from '../src/core/index.js'
import {initializeHollywood} from '../src/core/hollywood.js'
const query=(view:IndustryQuery['view'],extra:Partial<IndustryQuery>={}):IndustryQuery=>({protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:'industry-test',requestId:'read-1',expectedStateRevision:0,type:'industryQuery',view,targetId:null,page:0,pageSize:3,lane:'recent',period:'all',...extra})
describe('R05 public Industry projections',()=>{
  it('joins authored films to exact people and current employers with true opening ranks and bounded pages',()=>{
    const state=initializeHollywood(generateWorld('r05-industry-projection'),'fresh')
    const page=industryPage(state,'industry-test',0,query('studios',{lane:'industryPrestige'}))
    expect(page.totalRows).toBe(5);expect(page.studios).toHaveLength(3)
    expect(new Set(page.studios.map(s=>s.lanes.find(l=>l.key==='industryPrestige')!.rank)).size).toBe(3)
    expect(page.studios.every(s=>s.lanes.every(l=>l.movement==='unavailable'&&l.priorRank===null))).toBe(true)
    const movie=industryPage(state,'industry-test',0,query('films'))
    expect(movie.totalRows).toBe(8);expect(movie.films).toHaveLength(3)
    const film=industryPage(state,'industry-test',0,query('film',{targetId:movie.films[0]!.filmId,pageSize:50}))
    expect(film.credits).toHaveLength(6);expect(film.films[0]!.releaseWeek).toBeNull()
    const person=industryPage(state,'industry-test',0,query('person',{targetId:film.credits[0]!.talentId}))
    expect(person.people[0]!.employerStudioId).toBe(film.films[0]!.studioId)
    expect(person.films.map(f=>f.filmId)).toContain(film.films[0]!.filmId)
    const final=industryPage(state,'industry-test',0,query('films',{page:2}))
    expect(final.films).toHaveLength(2);expect(final.pageCount).toBe(3)
    expect(()=>industryPage(state,'industry-test',0,query('films',{page:3}))).toThrow(/outside/)
    for(const p of [page,movie,film,person,final])expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse,p)).toEqual(p)
    page.studios[0]!.name='changed consumer copy'
    expect(industryPage(state,'industry-test',0,query('studios')).studios.some(s=>s.name==='changed consumer copy')).toBe(false)
  })
  it('exposes only actual announced work and earned gross while rivals are still in theatrical runs',()=>{
    let state=initializeHollywood(generateWorld('r05-lifecycle'),'fresh')
    for(let i=0;i<52&&!state.hollywood!.businesses.some(b=>b.runs.length>0);i++)state=tick(state)
    const business=state.hollywood!.businesses.find(b=>b.runs.length>0)!,run=business.runs[0]!
    expect(run).toBeTruthy()
    const page=industryPage(state,'industry-test',0,query('film',{targetId:run.productionId}))
    expect(page.films[0]!.totalGross).toBe(run.cumulativeGrossPaid)
    const savedFilm=state.hollywood!.films.find(f=>f.filmId===run.productionId)!
    expect(savedFilm.provenance).toBe('simulation/v1')
    if(savedFilm.provenance==='simulation/v1')expect(page.films[0]!.totalGross).toBeLessThan(savedFilm.result.boxOffice.total)
    const json=JSON.stringify(page)
    for(const secret of ['cash','account','annualSalary','negativeScale','affinities','expectedTotal','forecast','directCommitment','studioRevenueReceived','skillsActual'])expect(json).not.toContain('"'+secret+'"')
    expect(state.hollywood!.careerEvents.length).toBeGreaterThan(0)
    const session=new BridgeSession(state,'industry-test')
    expect(session.industry(query('studios',{expectedStateRevision:999}))).toMatchObject({accepted:false,reasonCode:'STALE_REVISION'})
  })
  it('follows the exact funded announcement through release, complete credits, history and paged employment',()=>{
    let state=initializeHollywood(generateWorld('r05-announcement-path'),'fresh')
    for(let i=0;i<52&&!state.hollywood!.businesses.some(b=>b.productions.length);i++)state=tick(state)
    const owner=state.hollywood!.businesses.find(b=>b.productions.length)!,production=owner.productions[0]!
    const project=industryPage(state,'industry-test',0,query('project',{targetId:production.id,pageSize:50}))
    expect(project.projects).toHaveLength(1);expect(project.projects[0]).toMatchObject({productionId:production.id,studioId:owner.studioId,announcedWeek:production.startTick,stageLabel:'In production'})
    expect(project.credits).toHaveLength(6);expect(project.films).toHaveLength(0)
    const personId=project.credits[0]!.talentId
    const employment=industryPage(state,'industry-test',0,query('employment',{targetId:personId,pageSize:1}))
    expect(employment.activities).toHaveLength(1);expect(employment.activities[0]!.studioId).toBe(owner.studioId)
    const roster=industryPage(state,'industry-test',0,query('roster',{targetId:owner.studioId,page:1,pageSize:3}))
    expect(roster.totalRows).toBe(6);expect(roster.people).toHaveLength(3)
    for(let i=0;i<52&&!state.hollywood!.films.some(f=>f.filmId===production.id);i++)state=tick(state)
    const released=industryPage(state,'industry-test',0,query('project',{targetId:production.id,pageSize:50}))
    expect(released.projects[0]).toMatchObject({announcedWeek:production.startTick,stageLabel:'Released'})
    expect(released.films[0]!.filmId).toBe(production.id);expect(released.credits.map(c=>c.talentId)).toEqual(project.credits.map(c=>c.talentId))
    const history=industryPage(state,'industry-test',0,query('history',{targetId:owner.studioId,pageSize:50}))
    const release=history.activities.find(a=>a.filmId===production.id&&a.headline.includes('releases'))!
    expect(release.detail).toContain('Audience Awareness');expect(release.detail).toContain('Industry Prestige');expect(release.detail).toContain('Commercial Confidence')
    const output=industryPage(state,'industry-test',0,query('studios',{lane:'output',period:'recent',pageSize:50}))
    expect(output.studios.find(s=>s.studioId===owner.studioId)!.lanes.find(l=>l.key==='output')!.value).toBe(1)
    for(const p of [project,released,employment,roster,history,output])expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse,p)).toEqual(p)
  })

  it('keeps recent Output newcomers distinct from incomparable incumbents and absent observations',()=>{
    const source=generateWorld('r05-recent-output-entry')
    // Migrate immediately before the real 520-week arrival. Two ordinary ticks
    // produce genuine chart cohorts without a 520-tick simulation fixture.
    let state=initializeHollywood({...source,market:{...source.market,tick:518}},'migration')
    const newcomer=state.hollywood!.identities.find(s=>s.eligibleWeek===520)!
    state=tick(state)
    expect(state.hollywood!.chart!.week).toBe(519)
    expect(state.hollywood!.previousChart).toBeNull()
    const initial=industryPage(state,'industry-test',0,query('studios',{lane:'output',period:'recent',pageSize:50}))
    for(const studio of initial.studios)
      expect(studio.lanes.find(l=>l.key==='output')).toMatchObject({movement:'unavailable',movementLabel:'No comparable prior cohort',priorRank:null,priorWeek:null})
    state=tick(state)
    expect(state.hollywood!.chart!.week).toBe(520)
    expect(state.hollywood!.previousChart!.week).toBe(519)
    expect(state.hollywood!.identities.find(s=>s.studioId===newcomer.studioId)!.enteredWeek).toBe(520)
    const recent=industryPage(state,'industry-test',0,query('studios',{lane:'output',period:'recent',pageSize:50}))
    const all=industryPage(state,'industry-test',0,query('studios',{lane:'output',period:'all',pageSize:50}))
    expect(recent.studios).toHaveLength(6)
    expect(recent.studios.find(s=>s.studioId===newcomer.studioId)!.lanes.find(l=>l.key==='output')).toMatchObject({
      value:0,rank:1,movement:'new',movementLabel:'New to this comparison',priorRank:null,priorWeek:null})
    expect(all.studios.find(s=>s.studioId===newcomer.studioId)!.lanes.find(l=>l.key==='output')).toMatchObject({movement:'new',priorRank:null,priorWeek:null})
    for(const studio of recent.studios.filter(s=>s.studioId!==newcomer.studioId))
      expect(studio.lanes.find(l=>l.key==='output')).toMatchObject({movement:'unavailable',movementLabel:'No comparable prior cohort',priorRank:null,priorWeek:null})
    for(const page of [initial,recent,all])expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse,page)).toEqual(page)
  })

})

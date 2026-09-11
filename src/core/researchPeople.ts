import { GENRE_ORDER, SKILL_ORDER } from './tuning.js'
import type { Ceilings, DevRates, GenreExperience, SkillProfiles, Talent, WorkHistory } from './types.js'

/** P13 adds a profession to the existing person; it does not invent a second identity. */
export type PreResearchTalent = Omit<Talent, 'skills' | 'ceilings' | 'devRate' | 'genreExperience' | 'workHistory'> & {
  skills: Omit<SkillProfiles, 'research'> & Partial<Pick<SkillProfiles, 'research'>>
  ceilings: Omit<Ceilings, 'research'> & Partial<Pick<Ceilings, 'research'>>
  devRate: Omit<DevRates, 'research'> & Partial<Pick<DevRates, 'research'>>
  genreExperience: Omit<GenreExperience, 'research'> & Partial<Pick<GenreExperience, 'research'>>
  workHistory: Omit<WorkHistory, 'research'> & Partial<Pick<WorkHistory, 'research'>>
}

/**
 * Zero-evidence migration foundation. Existing identities, film skills, ceilings,
 * histories, pay and persona remain exact. No RNG, inferred expertise, employment,
 * research project, expenditure or invented past is created here.
 * Frozen save validation must run before this governed migration helper.
 */
export function withResearchFoundation(person: PreResearchTalent): Talent {
  const skills = Object.fromEntries(SKILL_ORDER.research.map(key => [key, { actual: 1, perceived: 1 }]))
  const ceilings = Object.fromEntries(SKILL_ORDER.research.map(key => [key, 1]))
  const genreExperience = Object.fromEntries(GENRE_ORDER.map(genre => [genre, { actual: 0, perceived: 0 }])) as GenreExperience['research']
  return {
    ...person,
    skills: { ...person.skills, research: person.skills.research ?? skills },
    ceilings: { ...person.ceilings, research: person.ceilings.research ?? ceilings },
    devRate: { ...person.devRate, research: person.devRate.research ?? 1 },
    genreExperience: { ...person.genreExperience, research: person.genreExperience.research ?? genreExperience },
    workHistory: { ...person.workHistory, research: person.workHistory.research ?? 0 },
  }
}

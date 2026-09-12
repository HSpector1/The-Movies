# Bounded Post operating-cost correction

**Classification: independent Current Ops paper calculation; not a runtime result.**

Basis: `docs/engineering/p13b-launch-review/03-PAPER-ECONOMICS.md` at `15b45afd36ada15ed51e3ba656de6a4a3befb5e7`, together with the same commit's companion §6. No rates, durations, scope or horizon definitions are changed.

## The shared error

The paper's own formula charges each body from its operational week through the exclusive horizon end. The sound chain contains a six-week Post fit-out beside a twelve-week stage conversion. Its two bodies each cost $2,000/week after their own completion. Companion §6 also preserves independently operational Post and its continuing cost when the stage is cancelled.

The displayed allocation totals instead price the combined $4,000/week sound operating delta only from the later stage completion. That omits six chargeable Post weeks:

`6 × $2,000 = $12,000` in each affected row.

For cooperation sound first, sound knowledge is available at 787; Post completes 793, stage 799 and lighting 798. At horizon end 832:

`Post: (832−793)×2,000 = 78,000`

`Stage: (832−799)×2,000 = 66,000`

`Lighting: (832−798)×1,000 = 34,000`

`Total = 178,000`, not 166,000.

## Corrected [780,832) allocation totals

| Route | Published operation | Corrected operation | Corrected department + deployment cash | Corrected whole-fixture cash |
|---|---:|---:|---:|---:|
| Cooperate sound then light | $166,000 | $178,000 | $4,706,760 | $5,486,760 |
| Split sound and light | $153,000 | $165,000 | $4,453,760 | $5,233,760 |
| Cooperate sound then residual light | $171,000 | $183,000 | $4,311,760 | $5,091,760 |
| Split sound and residual light | $162,000 | $174,000 | $4,102,760 | $4,882,760 |

All four rise by the same $12,000. Knowledge/operational dates, R&D, signing, payroll, employment overhead, laboratory/instrument costs, idle person-weeks and physical capital remain as stated. The full-project cooperation-minus-splitting cash difference remains $253,000; the residual comparison remains $209,000. Neither is a universal strategy rule or ROI claim.

## Corrected startup trace through week 468

The source states Post completion at 309 and stage completion at 315:

`Post: (468−309)×2,000 = 318,000`

`Stage: (468−315)×2,000 = 306,000`

Sound operation is therefore **$624,000**, not $612,000.

Department/deployment cash becomes **$5,080,720**, not $5,068,720.

With the unchanged $3,375,000 base overhead, whole-fixture cash becomes **$8,455,720**, not $8,443,720.

The later 477-week content gap and its separately listed idle employment/Laboratory costs are not altered by this correction. The lighting-only near-release comparison and rival lighting trace do not contain the sound-Post omission.

## Reproduction and review boundary

`03-check-paper-economics.py` reproduces these five corrections using integer dollars and the source's half-open horizons. It also checks the unchanged selected staffing, waiting and rival-lighting arithmetic. Its output is `04-CALCULATED-CORRECTIONS.json`.

This check does not certify every source excerpt, the original 43-file archive, future runtime behavior, the whole-game UX or the proposed budget's practical sufficiency. The earlier reviewer did not catch the Post-onset omission; preserve that chronology rather than silently revising the reviewer's original report.

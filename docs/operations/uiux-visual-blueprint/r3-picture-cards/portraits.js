'use strict';
// Portrait standard (illustrative placeholders, original code-drawn art).
// One system for every surface: rail 44px, card 72px, dossier 120px, compare 96px.
// Slots: backplate = role colour; badge top-left = rank (illus.); bar below = status.
// Twelve distinguishable faces are produced from explicit feature seeds in data.js:
//   f = [skin, hair style, hair colour, face shape, extra (0 none / 1 glasses / 2 facial hair), clothing]
const ROLE_PLATE = { Director: '#2f5e66', Actor: '#7d3a3f', Writer: '#5a6b3a', 'Craft lead': '#4d5566', Candidate: '#6b5a3a' };
const SKIN = [['#f0cfae', '#d9ad88'], ['#e6b48f', '#c98f66'], ['#c98a63', '#a86d4b'], ['#a56a45', '#83512f'], ['#7a4a30', '#5c351f'], ['#f5dcc4', '#dcb89b']];
const HAIR = ['#2b1d16', '#5a3a22', '#8b5a2b', '#c9a15a', '#3c3c3c'];
const CLOTH = [['#3a3f4a', '#f2ede2'], ['#6a4a3a', '#e9dcc4'], ['#2c4a44', '#f2ede2']];
function portraitSVG(p, size, opts = {}) {
  const [sk, hs, hc, fs, ex, cl] = p.f || [0, 0, 0, 0, 0, 0];
  const [skin, shade] = SKIN[sk % SKIN.length];
  const hair = HAIR[hc % HAIR.length];
  const [coat, shirt] = CLOTH[cl % CLOTH.length];
  const plate = ROLE_PLATE[p.role] || ROLE_PLATE.Candidate;
  const fw = fs ? 27 : 30; // face half-width
  const hairPaths = [
    `<path d="M20 44q2-30 30-30t30 30v6q-8-14-30-14T20 50z" fill="${hair}"/>`, // short crop
    `<path d="M19 46q0-32 31-32q30 0 31 32l-4 4q-2-20-27-20q-16 0-22 14z" fill="${hair}"/>`, // side part
    `<path d="M17 48q0-36 33-36t33 36v22q-6-10-8-24q-4-14-25-14t-25 14q-2 14-8 24z" fill="${hair}"/>`, // bob
    `<path d="M21 46q0-30 29-30t29 30q-6-12-29-12t-29 12z" fill="${hair}"/><circle cx="50" cy="14" r="9" fill="${hair}"/>`, // bun
    `<path d="M16 50q0-38 34-38t34 38v28q-8-6-10-26q-3-20-24-20t-24 20q-2 20-10 26z" fill="${hair}"/>`, // long
    `<path d="M18 48q-4-34 32-34t32 34q-4-8-10-8t-6 6q-4-8-16-8t-16 8q0-6-6-6t-10 8z" fill="${hair}"/>`, // curly
    `<path d="M20 42q4-26 30-26t30 26q-10-12-30-12T20 42z" fill="${hair}"/>`, // slicked
  ];
  const extra = ex === 1
    ? `<g fill="none" stroke="#2b221c" stroke-width="2"><circle cx="39" cy="60" r="8"/><circle cx="61" cy="60" r="8"/><path d="M47 60h6"/></g>`
    : ex === 2 ? `<path d="M36 78q14 10 28 0v6q-14 8-28 0z" fill="${hair}"/>` : '';
  const badge = opts.rank ? `<g><rect x="4" y="4" width="26" height="18" rx="4" fill="#d4a437"/><text x="17" y="17" font-size="12" font-weight="700" text-anchor="middle" fill="#2b221c" font-family="Futura, 'Avenir Next', 'Gill Sans', 'Trebuchet MS', sans-serif">${opts.rank}</text></g>` : '';
  return `<svg class="pt" viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-label="Illustrated placeholder portrait of ${p.name}" role="img">
<rect width="100" height="120" rx="8" fill="${plate}"/>
<path d="M8 120v-16q6-20 42-22t42 22v16z" fill="${coat}"/>
<path d="M38 82l12 20 12-20v-8H38z" fill="${shirt}"/>
<rect x="42" y="72" width="16" height="16" fill="${shade}"/>
<ellipse cx="50" cy="52" rx="${fw}" ry="34" fill="${skin}"/>
<path d="M${50 + fw - 4} 40q6 20-4 44q10-10 4-44z" fill="${shade}" opacity=".6"/>
<ellipse cx="${50 - fw}" cy="56" rx="5" ry="7" fill="${skin}"/><ellipse cx="${50 + fw}" cy="56" rx="5" ry="7" fill="${skin}"/>
${hairPaths[hs % hairPaths.length]}
<path d="M33 50q6-4 12 0M55 50q6-4 12 0" stroke="#2b221c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
<ellipse cx="40" cy="59" rx="3" ry="3.4" fill="#2b221c"/><ellipse cx="60" cy="59" rx="3" ry="3.4" fill="#2b221c"/>
<path d="M50 60v12l-4 2" stroke="${shade}" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M42 80q8 5 16 0" stroke="#7a3b32" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${extra}${badge}</svg>`;
}

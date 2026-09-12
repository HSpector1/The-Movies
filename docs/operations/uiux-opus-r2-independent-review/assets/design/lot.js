'use strict';
// Target-lot proof: an original code-drawn isometric studio lot at a stated fidelity
// ("greybox-plus": textured ground, shaded building materials, signage that is not
// the label, posed people, props). It exists so the UI can be judged against a
// world that is not a diagram. It is NOT a renderer proposal.
const LOT = (() => {
  const OX = 700, OY = 30, C = 0.866;
  const P = (u, v, h = 0) => [OX + (u - v) * C, OY + (u + v) * 0.5 - h];
  const pts = a => a.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
  const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return `#${((f(r) << 16) | (f(g) << 8) | f(b)).toString(16).padStart(6, '0')}`; };
  const MAT = { stucco: '#d9c7a6', brick: '#b0674d', wood: '#a3865c', concrete: '#b9b4a6', roofTar: '#5d5650', roofTile: '#8f4f3c', roofMetal: '#8c9aa1', roofGreen: '#5f7060' };
  // windows on a face: face along u (front-left, at v = v0+d) or along v (front-right, at u = u0+w)
  function windows(u0, v0, w, d, h, along, count, rows = 1, glass = '#7e8d94') {
    let s = '';
    for (let r = 0; r < rows; r++) {
      const zBot = h * (0.28 + r * 0.42), zTop = zBot + h * 0.24;
      for (let i = 0; i < count; i++) {
        const t0 = (i + 0.25) / count, t1 = (i + 0.75) / count;
        if (along === 'u') { const a = P(u0 + w * t0, v0 + d, zBot), b = P(u0 + w * t1, v0 + d, zBot), c = P(u0 + w * t1, v0 + d, zTop), e = P(u0 + w * t0, v0 + d, zTop); s += poly([a, b, c, e], glass) + poly([a, b, c, e], 'none', 'stroke="#3a3a3a" stroke-width=".8"'); }
        else { const a = P(u0 + w, v0 + d * t0, zBot), b = P(u0 + w, v0 + d * t1, zBot), c = P(u0 + w, v0 + d * t1, zTop), e = P(u0 + w, v0 + d * t0, zTop); s += poly([a, b, c, e], glass) + poly([a, b, c, e], 'none', 'stroke="#3a3a3a" stroke-width=".8"'); }
      }
    }
    return s;
  }
  function door(u0, v0, w, d, h, along, t = 0.5, wd = 0.12) {
    const z = h * 0.42;
    if (along === 'u') { const a = P(u0 + w * (t - wd / 2), v0 + d), b = P(u0 + w * (t + wd / 2), v0 + d), c = P(u0 + w * (t + wd / 2), v0 + d, z), e = P(u0 + w * (t - wd / 2), v0 + d, z); return poly([a, b, c, e], '#2f2a26'); }
    const a = P(u0 + w, v0 + d * (t - wd / 2)), b = P(u0 + w, v0 + d * (t + wd / 2)), c = P(u0 + w, v0 + d * (t + wd / 2), z), e = P(u0 + w, v0 + d * (t - wd / 2), z); return poly([a, b, c, e], '#2f2a26');
  }
  function box(u, v, w, d, h, wall, roof, opts = {}) {
    const top = [P(u, v, h), P(u + w, v, h), P(u + w, v + d, h), P(u, v + d, h)];
    const left = [P(u, v + d), P(u + w, v + d), P(u + w, v + d, h), P(u, v + d, h)];
    const right = [P(u + w, v), P(u + w, v + d), P(u + w, v + d, h), P(u + w, v, h)];
    const shadow = [P(u, v + d), P(u + w, v + d), P(u + w + h * 0.9, v + d + h * 0.5), P(u + h * 0.9, v + d + h * 0.5)];
    let s = poly(shadow, 'rgba(30,24,14,.28)') + poly(left, shade(wall, 0.86)) + poly(right, shade(wall, 0.68)) + poly(top, roof);
    if (opts.parapet) { const hp = h + 6; s += poly([P(u, v, h), P(u + w, v, h), P(u + w, v, hp), P(u, v, hp)], shade(wall, 1.05)) + poly([P(u, v + d, h), P(u + w, v + d, h), P(u + w, v + d, hp), P(u, v + d, hp)], shade(wall, 0.9)) + poly([P(u + w, v, h), P(u + w, v + d, h), P(u + w, v + d, hp), P(u + w, v, hp)], shade(wall, 0.72)); }
    if (opts.ridge) { const r = h + opts.ridge; s += poly([P(u, v + d / 2, r), P(u + w, v + d / 2, r), P(u + w, v + d, h), P(u, v + d, h)], shade(roof, 0.85)) + poly([P(u, v, h), P(u + w, v, h), P(u + w, v + d / 2, r), P(u, v + d / 2, r)], shade(roof, 1.08)) + poly([P(u + w, v, h), P(u + w, v + d / 2, r), P(u + w, v + d, h)], shade(wall, 0.62)); }
    if (opts.sawtooth) { const n = 4, r = h + 14; for (let i = 0; i < n; i++) { const a = u + (w / n) * i, b = a + w / n; s += poly([P(a, v, h), P(b, v, h), P(b, v + d, h), P(a, v + d, h)], shade(roof, 1)) + poly([P(a, v, h), P(a, v + d, h), P(a + (w / n) * 0.55, v + d, r), P(a + (w / n) * 0.55, v, r)], '#9fb3bb') + poly([P(a + (w / n) * 0.55, v, r), P(a + (w / n) * 0.55, v + d, r), P(b, v + d, h), P(b, v, h)], shade(roof, 0.8)); } }
    if (opts.windowsU) s += windows(u, v, w, d, h, 'u', opts.windowsU, opts.rows || 1);
    if (opts.windowsV) s += windows(u, v, w, d, h, 'v', opts.windowsV, opts.rows || 1);
    if (opts.door) s += door(u, v, w, d, h, opts.door);
    if (opts.stageNo) { const [x, y] = P(u + w * 0.5, v + d, h * 0.62); s += `<text transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) skewY(30) scale(1 .9)" font-size="${Math.round(h * 0.5)}" font-weight="700" text-anchor="middle" fill="${shade(wall, 0.45)}" font-family="Futura, 'Avenir Next', 'Gill Sans', 'Trebuchet MS', sans-serif" opacity=".8">${opts.stageNo}</text>`; }
    if (opts.sign) { const [x, y] = P(u + w * 0.5, v + d + 6, h * 0.95); s += `<rect x="${(x - 22).toFixed(1)}" y="${(y - 7).toFixed(1)}" width="44" height="10" rx="1.5" fill="#f2e6c8" stroke="#6b5a3a" stroke-width="1"/><rect x="${(x - 16).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="32" height="1.6" fill="#6b5a3a"/><rect x="${(x - 12).toFixed(1)}" y="${(y - 1).toFixed(1)}" width="24" height="1.4" fill="#6b5a3a"/>`; }
    return `<g>${s}</g>`;
  }
  function tree(u, v, r = 14) { const [x, y] = P(u, v); return `<g><ellipse cx="${x + 6}" cy="${y + 3}" rx="${r * 1.1}" ry="${r * 0.45}" fill="rgba(30,24,14,.22)"/><rect x="${x - 2}" y="${y - r * 1.4}" width="4" height="${r * 1.4}" fill="#6b4a2a"/><circle cx="${x}" cy="${y - r * 1.6}" r="${r}" fill="#4f7d47"/><circle cx="${x - r * 0.35}" cy="${y - r * 1.9}" r="${r * 0.75}" fill="#6a9b58"/><circle cx="${x + r * 0.3}" cy="${y - r * 1.4}" r="${r * 0.6}" fill="#3f6a3a"/></g>`; }
  function palm(u, v) { const [x, y] = P(u, v); const fr = a => `<path d="M${x} ${y - 34} q ${a * 14} -12 ${a * 26} -4" stroke="#4c7f45" stroke-width="4" fill="none" stroke-linecap="round"/>`; return `<g><ellipse cx="${x + 5}" cy="${y + 2}" rx="12" ry="5" fill="rgba(30,24,14,.22)"/><path d="M${x} ${y} q 2 -18 0 -34" stroke="#7a5a35" stroke-width="4" fill="none"/>${fr(1)}${fr(-1)}<path d="M${x} ${y - 34} q -8 -14 -4 -22 M${x} ${y - 34} q 8 -14 4 -22" stroke="#5c8f50" stroke-width="4" fill="none" stroke-linecap="round"/></g>`; }
  function car(u, v, color) { return box(u, v, 22, 11, 8, color, shade(color, 1.15)) + box(u + 5, v + 1, 11, 9, 5, shade(color, 0.9), '#dfe6e8'); }
  function person(u, v, coat, dir = 1) { const [x, y] = P(u, v); return `<g><ellipse cx="${x + 2}" cy="${y + 1}" rx="5" ry="2" fill="rgba(30,24,14,.3)"/><path d="M${x - 3} ${y} v-9 q0-4 3-4 q3 0 3 4 v9z" fill="${coat}"/><circle cx="${x}" cy="${y - 16}" r="3.4" fill="#e6bd98"/><path d="M${x - 3.6} ${y - 17} q3.6-5 7.2 0" fill="#3b2a20"/><path d="M${x} ${y - 13} l${4 * dir} 5" stroke="${coat}" stroke-width="2"/></g>`; }
  function light(u, v) { const [x, y] = P(u, v); return `<g><rect x="${x - 1}" y="${y - 30}" width="2" height="30" fill="#4a4540"/><rect x="${x - 5}" y="${y - 36}" width="10" height="7" rx="1" fill="#3a3632"/><circle cx="${x}" cy="${y - 32.5}" r="2.2" fill="#f4e3a5"/></g>`; }
  function road(a, b, w = 26) { const [x1, y1] = P(a[0], a[1]), [x2, y2] = P(b[0], b[1]); return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#a9a397" stroke-width="${w + 6}" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#8e887d" stroke-width="${w}" stroke-linecap="round"/>`; }
  const B = {
    script: { u: 560, v: 110, w: 70, d: 46, h: 30, wall: MAT.stucco, roof: MAT.roofTile, o: { ridge: 12, windowsU: 3, windowsV: 2, door: 'v', sign: true } },
    casting: { u: 250, v: 300, w: 78, d: 50, h: 34, wall: MAT.brick, roof: MAT.roofTar, o: { parapet: true, windowsU: 4, windowsV: 2, door: 'u', sign: true } },
    stage07: { u: 380, v: 430, w: 150, d: 100, h: 62, wall: MAT.concrete, roof: MAT.roofMetal, o: { ridge: 22, stageNo: '7', door: 'u', windowsV: 0 } },
    stage04: { u: 560, v: 250, w: 140, d: 96, h: 60, wall: MAT.concrete, roof: MAT.roofMetal, o: { ridge: 20, stageNo: '4', door: 'v' } },
    post: { u: 730, v: 470, w: 96, d: 60, h: 40, wall: MAT.wood, roof: MAT.roofGreen, o: { parapet: true, windowsU: 5, windowsV: 3, rows: 2, door: 'u', sign: true } },
    lab: { u: 830, v: 200, w: 80, d: 54, h: 36, wall: MAT.stucco, roof: MAT.roofTar, o: { parapet: true, windowsU: 4, windowsV: 2, door: 'u' } },
    scene: { u: 560, v: 560, w: 120, d: 60, h: 34, wall: MAT.wood, roof: MAT.roofTar, o: { sawtooth: true, door: 'u' } },
    admin: { u: 170, v: 520, w: 84, d: 54, h: 42, wall: MAT.stucco, roof: MAT.roofTile, o: { ridge: 14, windowsU: 4, windowsV: 3, rows: 2, door: 'u', sign: true } },
  };
  // anchor for labels/markers = middle of the front-left face base, in SVG px (viewBox 0 0 1440 868)
  function anchor(id) { const b = B[id]; if (!b) return null; const [x, y] = P(b.u + b.w * 0.5, b.v + b.d); const [tx, ty] = P(b.u + b.w * 0.5, b.v + b.d * 0.5, b.h); return { x, y, top: ty, topX: tx }; }
  function footprint(id) { const b = B[id]; return [P(b.u, b.v), P(b.u + b.w, b.v), P(b.u + b.w, b.v + b.d), P(b.u, b.v + b.d)]; }
  function svg(opts = {}) {
    const early = !!opts.early;
    const order = Object.keys(B).sort((a, b) => (B[a].u + B[a].v) - (B[b].u + B[b].v));
    const keep = early ? ['script', 'casting', 'stage07', 'admin'] : order;
    let s = `<svg class="lot" viewBox="0 0 1440 868" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
<defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".12"/></feComponentTransfer><feBlend in2="SourceGraphic" mode="multiply"/></filter>
<radialGradient id="sun" cx="35%" cy="20%" r="80%"><stop offset="0" stop-color="#c9c28e"/><stop offset="1" stop-color="#a39c70"/></radialGradient></defs>
<rect width="1440" height="868" fill="url(#sun)"/><rect width="1440" height="868" filter="url(#grain)" fill="#b9b184" opacity=".85"/>`;
    // grass and dirt patches
    s += `<g opacity=".7">${[[380, 80, 240, 90], [1060, 120, 280, 110], [220, 640, 300, 110], [900, 700, 340, 120], [700, 40, 160, 60], [1200, 500, 220, 90]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#8aa35f"/>`).join('')}</g><g opacity=".35">${[[520, 420, 90, 40], [980, 300, 80, 34], [300, 520, 70, 30]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#a4874f"/>`).join('')}</g>`;
    // roads (world grid)
    s += `<g>${road([100, 380], [960, 380], 30)}${road([470, 60], [470, 720], 30)}${road([100, 620], [700, 620], 22)}${road([720, 120], [720, 700], 22)}</g>`;
    // gate (front-left): two pillars and an arched sign
    s += `<g>${box(112, 392, 12, 12, 36, '#d7c8a4', '#8b6e3f')}${box(112, 344, 12, 12, 36, '#d7c8a4', '#8b6e3f')}${(() => { const [x1, y1] = P(118, 350, 36), [x2, y2] = P(118, 398, 36); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 22; return `<path d="M${x1} ${y1} Q${mx} ${my - 10} ${x2} ${y2}" stroke="#4a3c2c" stroke-width="5" fill="none"/><rect x="${mx - 30}" y="${my - 10}" width="60" height="14" rx="2" fill="#f2e6c8" stroke="#6b5a3a"/><rect x="${mx - 22}" y="${my - 5}" width="44" height="3" fill="#6b5a3a"/>`; })()}</g>`;
    // water tower with studio marque (back-right)
    s += `<g>${(() => { const [x, y] = P(880, 620); const legs = [-16, -6, 6, 16].map(dx => `<path d="M${x + dx * 1.4} ${y} L${x + dx} ${y - 70}" stroke="#5a4a38" stroke-width="3"/>`).join(''); return `<ellipse cx="${x + 10}" cy="${y + 4}" rx="30" ry="9" fill="rgba(30,24,14,.22)"/>${legs}<path d="M${x - 22} ${y - 40} L${x + 22} ${y - 40} M${x - 19} ${y - 58} L${x + 19} ${y - 58}" stroke="#5a4a38" stroke-width="2"/><rect x="${x - 26}" y="${y - 118}" width="52" height="48" rx="4" fill="#a48f6a"/><rect x="${x - 26}" y="${y - 118}" width="18" height="48" rx="4" fill="#b8a27c"/><path d="M${x - 30} ${y - 118} L${x} ${y - 138} L${x + 30} ${y - 118}z" fill="#6e5e46"/><rect x="${x - 20}" y="${y - 104}" width="40" height="12" rx="1" fill="#f2e6c8"/><rect x="${x - 15}" y="${y - 100}" width="30" height="2.4" fill="#6b5a3a"/><rect x="${x - 12}" y="${y - 96}" width="24" height="2" fill="#6b5a3a"/>`; })()}</g>`;
    // buildings in painter's order
    for (const id of keep) { const b = B[id]; s += box(b.u, b.v, b.w, b.d, b.h, b.wall, b.roof, b.o); }
    // props: lights and cars and people
    if (!early) {
      s += light(520, 545) + light(545, 545) + light(700, 360) + light(740, 250);
      s += car(300, 395, '#7a2f2a') + car(330, 395, '#2f3d5c') + car(700, 640, '#5a5a5a') + car(780, 300, '#8a7b52');
      s += person(420, 540, '#3a3f4a', 1) + person(432, 546, '#7d3a3f', -1) + person(447, 541, '#4d5566', 1) + person(590, 356, '#2f5e66', 1) + person(604, 360, '#5a6b3a', -1) + person(300, 362, '#7d3a3f', 1) + person(312, 366, '#3a3f4a', -1) + person(800, 545, '#4d5566', 1) + person(640, 168, '#5a6b3a', 1);
    } else { s += person(300, 362, '#7d3a3f', 1) + person(312, 366, '#3a3f4a', -1) + person(420, 540, '#2f5e66', 1); }
    // trees
    s += [[80, 300], [90, 460], [860, 80], [980, 140], [1000, 420], [560, 30], [230, 250], [640, 690], [420, 700], [900, 560]].map(([u, v]) => tree(u, v, 13 + (u % 7))).join('') + [[350, 140], [720, 90], [150, 700], [980, 300], [470, 780]].map(([u, v]) => palm(u, v)).join('');
    return s + '</svg>';
  }
  return { svg, anchor, footprint, B, P };
})();

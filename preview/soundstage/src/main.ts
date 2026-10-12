import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
type Mode = 'baseline' | 'concrete' | 'asphalt' | 'both';
type Pose = 'idle' | 'walk' | 'direct' | 'work';
type Figure = {
    root: THREE.Group;
    bones: Map<string, THREE.Bone>;
    bind: Map<string, THREE.Quaternion>;
    pose: Pose;
};
const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const status = el('status'), error = el('error'), canvas = document.querySelector('canvas')!;
const events = new AbortController();
const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>(), textures = new Set<THREE.Texture>(), skeletons = new Set<THREE.Skeleton>();
let renderer: THREE.WebGLRenderer | undefined, controls: OrbitControls | undefined, disposed = false, ready = false, paused = false, frame = 0, last = 0, phase = 0, epoch = 0, mode: Mode = 'baseline';
let pending = 0, renderCount = 0, loadingModels = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#29343b');
const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 80);
const figures: Record<string, Figure> = {};
const floorMeshes: THREE.Mesh[] = [], serviceMeshes: THREE.Mesh[] = [];
const baseline = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
let candidateMaterials: THREE.MeshStandardMaterial[] = [];
let sample: {
    start: number;
    frames: number[];
    cpu: number[];
    done: (v: unknown) => void;
    timer: number;
    invalid: Set<string>;
    signature: string;
} | undefined;
const loadFailures: string[] = [];
const manager = new THREE.LoadingManager();
manager.onError = url => loadFailures.push(url);
const loader = new GLTFLoader(manager), textureLoader = new THREE.TextureLoader();
const track = (root: THREE.Object3D) => root.traverse(o => { if (o instanceof THREE.Mesh) {
    geometries.add(o.geometry);
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        for (const value of Object.values(m))
            if (value instanceof THREE.Texture)
                textures.add(value);
    }
} if (o instanceof THREE.SkinnedMesh) {
    o.frustumCulled = false;
    skeletons.add(o.skeleton);
} });
function releaseCandidate(list: THREE.MeshStandardMaterial[]) { for (const m of list) {
    m.map?.dispose();
    m.roughnessMap?.dispose();
    m.dispose();
} }
function fail(message: string) { error.textContent = message; error.hidden = false; }
function snapshot() { return { loadingModels, ownedResourceCounts: {geometries:geometries.size,materials:materials.size,textures:textures.size,skeletons:skeletons.size}, measurement: sample ? {invalidReasons:[...sample.invalid]} : null, ready, disposed, paused, hidden: document.hidden, mode, pending, renderCount, poses: Object.fromEntries(Object.entries(figures).map(([k, v]) => [k, v.pose])), camera: camera.position.toArray(), target: controls?.target.toArray(), geometry: scene.children.filter(o => !(o instanceof THREE.Light)).map(o => ({ name: o.name, position: o.position.toArray(), scale: o.scale.toArray(), rotation: o.quaternion.toArray() })), lighting: scene.children.filter(o => o instanceof THREE.Light).map(o => ({ type: o.type, position: o.position.toArray(), intensity: (o as THREE.Light).intensity })), drawingBuffer: renderer?.getDrawingBufferSize(new THREE.Vector2()).toArray(), calls: renderer?.info.render.calls, triangles: renderer?.info.render.triangles, resources: renderer ? { ...renderer.info.memory } : null, contextLost: renderer?.getContext().isContextLost(), importedClips: 0 }; }
function comparisonSignature() { const s = snapshot(); return JSON.stringify({ camera: s.camera, target: s.target, geometry: s.geometry, lighting: s.lighting, mode: s.mode, poses: s.poses, drawingBuffer:s.drawingBuffer, projection:camera.projectionMatrix.elements }); }
function draw() { if (sample && comparisonSignature() !== sample.signature)
    sample.invalid.add('Comparison setting changed'); if (!renderer || disposed || document.hidden)
    return; const start = performance.now(); renderer.render(scene, camera); renderCount++; if (sample) {
    sample.frames.push(start);
    sample.cpu.push(performance.now() - start);
} el('metrics').textContent = `30 FPS target · ${renderer.info.render.calls} draw calls · ${renderer.info.render.triangles.toLocaleString()} triangles · ${renderer.info.memory.textures} texture resources (not GPU bytes) · DPR ${renderer.getPixelRatio()}`; }
function view(which = 'management') { if (!controls)
    return; if (which === 'crew') {
    camera.position.set(5, 4.2, 6);
    controls.target.set(-.3, .75, .2);
}
else if (which === 'service') {
    camera.position.set(10, 5.4, 7);
    controls.target.set(5.1, .1, .3);
}
else {
    camera.position.set(14, 13, 17);
    controls.target.set(1.5, .6, -.2);
} controls.update(); draw(); }
function pose(f: Figure, t: number) {
    for (const [name, q] of f.bind)
        f.bones.get(name)!.quaternion.copy(q);
    const b = (n: string) => f.bones.get(n), s = Math.sin(t * 2 * Math.PI);
    // Selected rigs share the exact bind hierarchy. Offsets follow crew3d's arm-lowering convention.
    b('upperarm_l')?.rotateZ(-1.18);
    b('upperarm_r')?.rotateZ(1.18);
    b('lowerarm_l')?.rotateZ(-.22);
    b('lowerarm_r')?.rotateZ(.22);
    if (f.pose === 'walk') {
        b('thigh_l')?.rotateX(s * .38);
        b('thigh_r')?.rotateX(-s * .38);
        b('calf_l')?.rotateX(Math.max(0, -s) * .48);
        b('calf_r')?.rotateX(Math.max(0, s) * .48);
        b('upperarm_l')?.rotateX(-s * .22);
        b('upperarm_r')?.rotateX(s * .22);
    }
    else if (f.pose === 'direct') {
        b('upperarm_r')?.rotateZ(-.85 + s * .08);
        b('lowerarm_r')?.rotateX(.7);
        b('Head')?.rotateY(s * .05);
    }
    else if (f.pose === 'work') {
        b('upperarm_l')?.rotateX(.35);
        b('upperarm_r')?.rotateX(.35);
        b('lowerarm_l')?.rotateX(.75 + s * .025);
        b('lowerarm_r')?.rotateX(.75 - s * .025);
    }
    else {
        b('spine_02')?.rotateZ(s * .012);
        b('Head')?.rotateY(s * .04);
    }
}
function animate(now: number) { if (disposed)
    return; frame = requestAnimationFrame(animate); if (document.hidden || paused || !ready) {
    if (sample)
        sample.invalid.add(document.hidden ? 'Page hidden' : 'Motion paused or preview not ready');
    last = now;
    return;
} const delta = now - last; if (delta < 1000 / 30)
    return; last = now - (delta % (1000 / 30)); phase += Math.min(delta, .1 * 1000) / 4000; Object.values(figures).forEach(f => pose(f, phase)); draw(); }
function setPaused(value: boolean) { if (sample && value)
    sample.invalid.add('Motion paused'); paused = value; el('pause').textContent = paused ? 'Resume motion' : 'Pause motion'; }
async function materialSet(asset: string, tile: number) { const results = await Promise.allSettled(['diff', 'rough'].map(kind => textureLoader.loadAsync(`/assets/textures/${asset}/${asset}_${kind}_1k.jpg`))); const ok = results.flatMap(v => v.status === 'fulfilled' ? [v.value] : []); if (results.some(v => v.status === 'rejected')) {
    ok.forEach(t => t.dispose());
    throw new Error(`Could not load ${asset}. Keep this Terminal running and reload; verify the selected asset files.`);
} const [color, rough] = ok; color.colorSpace = THREE.SRGBColorSpace; for (const t of ok) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / tile, 1 / tile);
    t.anisotropy = 1;
} return new THREE.MeshStandardMaterial({ map: color, roughnessMap: rough, color: 0xffffff, roughness: 1, metalness: 0 }); }
async function setMaterial(next: Mode) {
    if (disposed || !ready)
        throw new Error('Preview is not ready');
    if (!['baseline', 'concrete', 'asphalt', 'both'].includes(next))
        throw new Error('Unknown material selection');
    if (sample)
        sample.invalid.add('Material selection requested');
    const ticket = ++epoch;
    pending++;
    status.textContent = 'Loading selected material maps…';
    error.hidden = true;
    const nextMaterials: THREE.MeshStandardMaterial[] = [];
    try {
        let concrete: THREE.MeshStandardMaterial | undefined, asphalt: THREE.MeshStandardMaterial | undefined;
        if (next === 'concrete' || next === 'both') {
            concrete = await materialSet('concrete_floor', 2.1);
            nextMaterials.push(concrete);
        }
        if (next === 'asphalt' || next === 'both') {
            asphalt = await materialSet('asphalt_03', 2);
            nextMaterials.push(asphalt);
        }
        if (ticket !== epoch || disposed) {
            releaseCandidate(nextMaterials);
            return false;
        }
        for (const [mesh, original] of baseline)
            mesh.material = original;
        if (concrete)
            floorMeshes.forEach(m => m.material = concrete!);
        if (asphalt)
            serviceMeshes.forEach(m => m.material = asphalt!);
        releaseCandidate(candidateMaterials);
        candidateMaterials = nextMaterials;
        mode = next;
        el<HTMLSelectElement>('material').value = next;
        el('material-note').textContent = next === 'baseline' ? 'Baseline: existing floor and exterior materials. New texture resources released.' : `${concrete ? 'Concrete Floor: interior base color + roughness, 2.1 m repeat. ' : ''}${asphalt ? 'Asphalt 03: exterior base color + roughness, 2 m repeat. ' : ''}No normals, displacement or geometry changes.`;
        status.textContent = 'Ready · selected models only · procedural demonstrations';
        draw();
        return true;
    }
    catch (e) {
        releaseCandidate(nextMaterials);
        if (ticket === epoch && !disposed) {
            el<HTMLSelectElement>('material').value = mode;
            fail(String(e));
            status.textContent = 'Previous material retained; selected maps failed to load.';
        }
        throw e;
    }
    finally {
        pending--;
    }
}
function disposeTracked() {
    skeletons.forEach(s => s.dispose());
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    const images = new Set(Array.from(textures, t => t.image));
    textures.forEach(t => t.dispose());
    for (const image of images) if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
    skeletons.clear(); geometries.clear(); materials.clear(); textures.clear();
}
function cleanup() {
    if (disposed) return snapshot();
    disposed = true; ready = false; epoch++;
    cancelAnimationFrame(frame); events.abort(); observer?.disconnect(); controls?.dispose();
    if (sample) {
        clearTimeout(sample.timer);
        sample.done({aborted:true, reason:'preview disposed', invalidReasons:[...sample.invalid]});
        sample = undefined;
    }
    releaseCandidate(candidateMaterials); candidateMaterials = [];
    disposeTracked(); scene.clear(); baseline.clear();
    floorMeshes.length = 0; serviceMeshes.length = 0;
    for (const key of Object.keys(figures)) delete figures[key];
    renderer?.renderLists.dispose(); renderer?.dispose(); renderer?.forceContextLoss();
    document.querySelectorAll('button,select').forEach(b => (b as HTMLButtonElement).disabled = true);
    status.textContent = 'Preview stopped; rendering and GPU resources released. Close this window or press Control-C in its Terminal to release the execution lane.';
    return snapshot();
}
function measure(duration = 60000) { if (!ready || paused || document.hidden || sample || pending)
    throw new Error('Measurement needs a ready, visible, running preview with no pending map loads'); if (duration !== 60000)
    throw new Error('Recorded measurement duration must be 60000 ms'); return new Promise(resolve => { const start = performance.now(); sample = { start, frames: [], cpu: [], done: resolve, invalid: new Set<string>(), signature: comparisonSignature(), timer: window.setTimeout(() => { const s = sample!; sample = undefined; const elapsed = performance.now() - s.start; const intervals = s.frames.slice(1).map((v, i) => v - s.frames[i]).sort((a, b) => a - b), cpu = s.cpu.sort((a, b) => a - b); const pct = (v: number[], p: number) => v[Math.floor((v.length - 1) * p)] ?? null; if (document.hidden)
        s.invalid.add('Page hidden at completion'); if (comparisonSignature() !== s.signature)
        s.invalid.add('Comparison setting changed'); resolve({ valid: s.invalid.size === 0, invalidReasons: [...s.invalid], durationMs: elapsed, renderedFrames: s.frames.length, renderedFps: s.frames.length / (elapsed / 1000), frameIntervalMs: { p50: pct(intervals, .5), p95: pct(intervals, .95), max: intervals.at(-1) }, renderSubmissionCpuMs: { p50: pct(cpu, .5), p95: pct(cpu, .95) }, snapshot: snapshot(), visibility: document.visibilityState }); }, duration) }; }); }
let observer: ResizeObserver | undefined;
Object.assign(window, { preview: { snapshot, setMaterial, setPaused, view, measure, cleanup, freeze(value=0) { setPaused(true); phase = value; Object.values(figures).forEach(f => pose(f, value)); draw(); }, setPose(name: string, value: Pose) { if (!['idle', 'walk', 'direct', 'work'].includes(value))
            throw new Error('Unknown procedural pose'); for (const [key, f] of Object.entries(figures))
            if (name === 'both' || name === key) {
                f.pose = value;
                pose(f, phase);
            } draw(); }, rig() { return Object.fromEntries(Object.entries(figures).map(([key, f]) => [key, { bones: [...f.bones.keys()], clips: [], bounds: new THREE.Box3().setFromObject(f.root).getSize(new THREE.Vector3()).toArray(), worldHandOrigins: ['hand_l', 'hand_r'].map(n => f.bones.get(n)!.getWorldPosition(new THREE.Vector3()).toArray()) }])); } } });
async function init() {
    try {
        const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
        if (!gl)
            throw new Error('WebGL2 is unavailable. Enable supported browser graphics or try the installed Chrome. No 3D preview has run.');
        renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
        renderer.shadowMap.enabled = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = false;
        controls.maxPolarAngle = Math.PI * .48;
        controls.minDistance = 3;
        controls.maxDistance = 34;
        controls.addEventListener('change', draw);
        const hemi = new THREE.HemisphereLight(0xe3edf6, 0x756756, 2.1);
        scene.add(hemi);
        const sun = new THREE.DirectionalLight(0xffe0b0, 2.7);
        sun.position.set(2, 8, 5);
        scene.add(sun);
        observer = new ResizeObserver(() => { const box = el('viewport').getBoundingClientRect(), width = Math.min(1280, Math.floor(box.width)), height = Math.min(720, Math.floor(box.height)); renderer!.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); draw(); });
        observer.observe(el('viewport'));
        const files = { wall: 'arch/Arch_M01_StageWall.glb', corner: 'arch/Arch_M04_StageCorner.glb', floor: 'arch/Arch_M14_GroundTile.glb', director: 'characters/Char_Director_Standard.glb', operator: 'characters/Char_CameraDP_Standard.glb', camera: 'props/Prop_StudioCamera.glb', chair: 'props/Prop_DirectorsChair.glb', light: 'props/Prop_Fresnel.glb', stand: 'props/Prop_CStand.glb' };
        const loaded: Record<string, THREE.Group> = {};
        for (const [name, path] of Object.entries(files)) {
            const gltf = await loader.loadAsync(`/assets/${path}`);
            track(gltf.scene);
            if (disposed) {disposeTracked(); return;}
            if (loadFailures.length)
                throw new Error('Embedded model texture failed: ' + loadFailures.join(', '));
            if (gltf.animations.length !== 0)
                throw new Error(`Unexpected clips in pinned ${name}; review provenance before selecting animations.`);
            loaded[name] = gltf.scene;
        }
        const add = (key: string, name: string, x: number, y: number, z: number, scale = new THREE.Vector3(1, 1, 1), turn = 0) => { const obj = key === 'director' || key === 'operator' ? loaded[key] : loaded[key].clone(true); obj.name = name; obj.position.set(x, y, z); obj.scale.copy(scale); obj.rotation.y = turn; scene.add(obj); return obj; };
        for (let i = 0; i < 4; i++)
            add('wall', `rear wall ${i}`, -3 + i * 2, 0, -4, new THREE.Vector3(1, .4, 1));
        for (let i = 0; i < 2; i++)
            add('wall', `cutaway side ${i}`, -4, 0, -3 + i * 2, new THREE.Vector3(1, .4, 1), Math.PI / 2);
        add('corner', 'stage corner', -4, 0, -4, new THREE.Vector3(1, 3.2 / 8.4, 1));
        for (const [name, x, sx, target] of [['stage floor', 0, 1, floorMeshes], ['service area', 6, .5, serviceMeshes]] as const) {
            const obj = add('floor', name, x, 0, 0, new THREE.Vector3(sx, 1, 1));
            obj.traverse(o => { if (o instanceof THREE.Mesh) {
                o.geometry = o.geometry.clone();
                geometries.add(o.geometry);
                const pos = o.geometry.getAttribute('position'), uv = new Float32Array(pos.count * 2);
                for (let i = 0; i < pos.count; i++) {
                    uv[i * 2] = pos.getX(i) * sx;
                    uv[i * 2 + 1] = pos.getZ(i);
                }
                o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
                target.push(o);
                baseline.set(o, o.material);
            } });
        }
        add('camera', 'studio camera', 1, .05, -.3);
        add('chair', 'director chair', -2.3, .015, 1.65);
        add('light', 'Fresnel light', -2.8, .015, -1.4);
        add('stand', 'C stand', 2.6, .02, -1.5);
        for (const [name, x, z, p] of [['director', -1.3, .5, 'idle'], ['operator', 1, .95, 'work']] as const) {
            const root = add(name, name, x, .01, z);
            const bones = new Map<string, THREE.Bone>();
            root.traverse(o => { if (o instanceof THREE.Bone)
                bones.set(o.name, o); });
            if (bones.size !== 65 || !bones.has('Head') || !bones.has('upperarm_l'))
                throw new Error(`${name}: unexpected rig; procedural pose disabled`);
            figures[name] = { root, bones, bind: new Map([...bones].map(([n, b]) => [n, b.quaternion.clone()])), pose: p };
            pose(figures[name], 0);
        }
        view();
        ready = true;
        document.querySelectorAll('button,select').forEach(b => (b as HTMLButtonElement).disabled = false);
        status.textContent = 'Ready · selected models only · procedural demonstrations';
        last = performance.now();
        frame = requestAnimationFrame(animate);
        draw();
    }
    catch (e) {
        fail(`Preview could not load. ${String(e)} Check the START PREVIEW Terminal and local asset files, then reload.`);
        cleanup();
    } finally {loadingModels=false;}
}
function on(id: string, event: string, fn: () => void) { el(id).addEventListener(event, fn, { signal: events.signal }); }
on('material', 'change', () => { void setMaterial(el<HTMLSelectElement>('material').value as Mode).catch(() => { }); });
on('pause', 'click', () => setPaused(!paused));
on('reset', 'click', () => view());
on('close', 'click', () => view('crew'));
on('service', 'click', () => view('service'));
on('stop', 'click', cleanup);
on('pose', 'change', () => { const name = el<HTMLSelectElement>('figure').value; for (const [key, f] of Object.entries(figures))
    if (name === 'both' || key === name) {
        f.pose = el<HTMLSelectElement>('pose').value as Pose;
        pose(f, phase);
    } draw(); });
on('figure', 'change', () => { const f = figures[el<HTMLSelectElement>('figure').value]; if (f)
    el<HTMLSelectElement>('pose').value = f.pose; });
document.addEventListener('visibilitychange', () => { if (sample && document.hidden)
    sample.invalid.add('Page hidden'); last = performance.now(); if (!document.hidden)
    draw(); }, { signal: events.signal });
window.addEventListener('pagehide', cleanup, { signal: events.signal });
// Server shutdown ends this isolated preview even if its tab remains open.
const connection = new EventSource('/__preview_lifecycle');
connection.addEventListener('error', () => { connection.close(); cleanup(); });
events.signal.addEventListener('abort', () => connection.close(), { once: true });
void init();

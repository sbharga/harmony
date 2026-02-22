import json


def render_html(spec: dict, harmony_score: float | None = None, heatmap: dict | None = None) -> str:
    spec_json = json.dumps(spec)
    score_js = "null" if harmony_score is None else str(round(harmony_score, 1))
    heatmap_js = "null" if heatmap is None else json.dumps(heatmap)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Harmony 3D View</title>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ background: #1a1a2e; overflow: hidden; width: 100vw; height: 100vh; font-family: sans-serif; }}
  canvas {{ display: block; }}
  #score-badge {{
    display: none;
    position: fixed; top: 12px; right: 12px;
    background: rgba(15,15,30,0.85);
    border: 1.5px solid #6366f1;
    border-radius: 10px;
    padding: 8px 14px;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
    backdrop-filter: blur(6px);
    z-index: 100;
    line-height: 1.5;
  }}
  #score-badge .label {{ color: #a5b4fc; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }}
  #score-badge .value {{ font-size: 22px; font-weight: 800; color: #fff; }}
  #legend {{
    position: fixed; bottom: 12px; left: 12px;
    background: rgba(15,15,30,0.75);
    border-radius: 8px;
    padding: 8px 12px;
    color: #cbd5e1;
    font-size: 11px;
    backdrop-filter: blur(4px);
    z-index: 100;
  }}
  #legend div {{ display: flex; align-items: center; gap: 6px; margin: 2px 0; }}
  #legend span {{ width: 12px; height: 12px; border-radius: 2px; display: inline-block; flex-shrink: 0; }}
  #heatmap-panel {{
    display: none;
    position: fixed; top: 12px; left: 12px;
    background: rgba(15,15,30,0.82);
    border-radius: 10px;
    padding: 8px 10px;
    backdrop-filter: blur(4px);
    z-index: 100;
    border: 1px solid #334155;
  }}
  #heatmap-panel .hm-title {{ color: #94a3b8; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing:.05em; margin-bottom:4px; }}
  #heatmap-panel .hm-sub {{ color: #64748b; font-size: 9px; margin-bottom:4px; }}
  #heatmap-canvas {{ border-radius: 4px; display: block; }}
  #heatmap-legend {{ display:flex; gap:8px; flex-wrap:wrap; margin-top:5px; }}
  #heatmap-legend span {{ font-size:9px; color:#94a3b8; display:flex; align-items:center; gap:3px; }}
  #heatmap-legend i {{ width:9px; height:9px; border-radius:2px; display:inline-block; flex-shrink:0; }}
</style>
</head>
<body>
<div id="heatmap-panel">
  <div class="hm-title">Harmony Heatmap</div>
  <div class="hm-sub">Back wall = top</div>
  <canvas id="heatmap-canvas"></canvas>
  <div id="heatmap-legend">
    <span><i style="background:#10b981"></i>Clear</span>
    <span><i style="background:#f59e0b"></i>Tight (&lt;18cm)</span>
    <span><i style="background:#ef4444"></i>Occupied</span>
    <span><i style="background:#8b5cf6"></i>Unreachable</span>
  </div>
</div>
<div id="score-badge">
  <div class="label">Harmony Score</div>
  <div class="value" id="score-val"></div>
</div>
<div id="legend"></div>

<script type="importmap">
{{
  "imports": {{
    "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
  }}
}}
</script>
<script type="module">
import * as THREE from 'three';
import {{ OrbitControls }} from 'three/addons/controls/OrbitControls.js';
import {{ CSS2DRenderer, CSS2DObject }} from 'three/addons/renderers/CSS2DRenderer.js';

const SPEC = {spec_json};
const HARMONY_SCORE = {score_js};
const HEATMAP = {heatmap_js};

// ── Palette (from testing/harmonysimulation-claude/src/preview/assets/palette.js) ─
const PALETTE = {{
  chair:        0x4b6cb7,
  sofa:         0xb07d62,
  bed:          0xd9d2c3,
  desk:         0x8a6a3d,
  table:        0x8a6a3d,
  dresser:      0x7a5c3a,
  shelf:        0x7a5c3a,
  tv:           0x222222,
  rug:          0xddd6c8,
  pillar:       0x9aa3ad,
  unknown:      0x999999,
}};

function colorOf(value, type) {{
  try {{ if (value !== undefined && value !== null) return new THREE.Color(value); }} catch {{}}
  return new THREE.Color(PALETTE[type] ?? PALETTE.unknown);
}}

// ── Mesh helpers ──────────────────────────────────────────────────────────────
function box(w, h, d, color, castShadow = true) {{
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({{ color, roughness: 0.7, metalness: 0.05 }})
  );
  m.castShadow = castShadow;
  m.receiveShadow = true;
  return m;
}}

function cyl(rt, rb, h, color, segs = 16) {{
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, segs),
    new THREE.MeshStandardMaterial({{ color, roughness: 0.6, metalness: 0.1 }})
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}}

function at(mesh, x, y, z) {{ mesh.position.set(x, y, z); return mesh; }}

// ── Furniture model builders ──────────────────────────────────────────────────
// Each returns a THREE.Group positioned at origin (item center at ground level).
// Ported from testing/harmonysimulation-claude/src/preview/assets/

// ── Bed ───────────────────────────────────────────────────────────────────────
const BED_PRESETS = {{
  twin:          {{ w:0.99, d:1.90, h:0.50 }},
  full:          {{ w:1.37, d:1.90, h:0.55 }},
  queen:         {{ w:1.52, d:2.03, h:0.60 }},
  king:          {{ w:1.93, d:2.03, h:0.62 }},
  daybed:        {{ w:0.99, d:2.00, h:0.55 }},
  loft:          {{ w:0.99, d:1.90, h:1.60 }},
  bunk:          {{ w:0.99, d:1.90, h:1.60 }},
  mattress_floor:{{ w:1.52, d:2.03, h:0.30 }},
}};
function makeBed(variant, color) {{
  const dims = BED_PRESETS[variant] || BED_PRESETS.queen;
  const c = colorOf(color, 'bed');
  const g = new THREE.Group();
  const platformH = Math.max(0.08, dims.h * 0.2);
  const mattressH = dims.h - platformH;
  const isLoft = variant === 'loft' || variant === 'bunk';

  g.add(at(box(dims.w, platformH, dims.d, 0x8b7355), 0, platformH/2, 0));
  g.add(at(box(dims.w, mattressH, dims.d, c), 0, platformH + mattressH/2, 0));
  if (variant !== 'mattress_floor') {{
    // headboard at -z side (back of bed)
    g.add(at(box(dims.w, 0.5, 0.12, c), 0, platformH + mattressH + 0.25, -dims.d/2 + 0.06));
  }}
  if (isLoft) {{
    g.add(at(box(dims.w, 0.25, dims.d*0.9, c), 0, dims.h + 0.8, 0));
    g.add(at(box(dims.w, 0.2, 0.08, c), 0, dims.h + 1.0, -dims.d/2 + 0.04));
  }}
  return g;
}}

// ── Sofa ──────────────────────────────────────────────────────────────────────
const SOFA_PRESETS = {{
  loveseat:  {{ w:1.6, d:0.9, h:0.85 }},
  sofa3:     {{ w:2.1, d:0.95, h:0.90 }},
  sectionalL:{{ w:2.6, d:2.0, h:0.90 }},
  futon:     {{ w:1.9, d:0.9, h:0.80 }},
}};
function makeSofa(variant, color) {{
  const dims = SOFA_PRESETS[variant] || SOFA_PRESETS.sofa3;
  const c = colorOf(color, 'sofa');
  const g = new THREE.Group();
  const seatH = dims.h * 0.45;
  const backH = dims.h - seatH;
  g.add(at(box(dims.w, seatH, dims.d, c), 0, seatH/2, 0));
  g.add(at(box(dims.w, backH, 0.12, c), 0, seatH + backH/2, -dims.d/2 + 0.06));
  if (variant === 'sectionalL') {{
    g.add(at(box(dims.w*0.5, seatH, dims.d*0.6, c), dims.w*0.25, seatH/2, dims.d*0.25));
  }}
  return g;
}}

// ── Seat / Chair ──────────────────────────────────────────────────────────────
const SEAT_PRESETS = {{
  office:  {{ w:0.60, d:0.60, h:1.05 }},
  accent:  {{ w:0.60, d:0.65, h:0.90 }},
  dining:  {{ w:0.48, d:0.52, h:0.90 }},
  stool:   {{ w:0.40, d:0.40, h:1.625 }},
  bench:   {{ w:1.10, d:0.42, h:0.45 }},
  ottoman: {{ w:0.60, d:0.60, h:0.42 }},
}};
function makeSeat(variant, color) {{
  const size = SEAT_PRESETS[variant] || SEAT_PRESETS.accent;
  const c = colorOf(color, 'chair');
  const g = new THREE.Group();
  const baseH = size.h * 0.45;
  const seatThick = Math.max(0.05, baseH * 0.2);
  const seatBottom = Math.max(0.05, baseH - seatThick/2);
  const backH = (variant === 'stool' || variant === 'ottoman') ? 0 : size.h - baseH;

  g.add(at(box(size.w, seatThick, size.d, c), 0, baseH, 0));
  if (backH > 0) {{
    g.add(at(box(size.w, backH, Math.max(0.05, size.d*0.12), c), 0, baseH + backH/2, -size.d/2 + 0.03));
  }}
  if (variant === 'bench' || variant === 'ottoman') {{
    g.add(at(box(size.w, seatBottom, size.d*0.25, 0x5a3e28), 0, seatBottom/2, -size.d*0.25));
    g.add(at(box(size.w, seatBottom, size.d*0.25, 0x5a3e28), 0, seatBottom/2,  size.d*0.25));
  }} else {{
    const legH = Math.max(0.05, seatBottom);
    for (const [sx, sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {{
      const leg = cyl(0.03, 0.03, legH, 0x5a3e28);
      leg.position.set(sx*(size.w/2-0.05), legH/2, sz*(size.d/2-0.05));
      g.add(leg);
    }}
  }}
  return g;
}}

// ── Table ─────────────────────────────────────────────────────────────────────
const TABLE_PRESETS = {{
  desk:      {{ w:1.40, d:0.70, h:0.75 }},
  nightstand:{{ w:0.55, d:0.45, h:0.55 }},
  vanity:    {{ w:1.00, d:0.45, h:0.78 }},
  coffee:    {{ w:1.00, d:0.60, h:0.42 }},
  side:      {{ w:0.50, d:0.50, h:0.55 }},
  dining:    {{ w:1.60, d:0.90, h:0.75 }},
  console:   {{ w:1.20, d:0.35, h:0.85 }},
  high:      {{ w:0.70, d:0.70, h:1.75 }},
}};
function makeTable(variant, color) {{
  const dims = TABLE_PRESETS[variant] || TABLE_PRESETS.side;
  const c = colorOf(color, variant === 'desk' ? 'desk' : 'table');
  const g = new THREE.Group();
  const topThick = 0.06;
  const topY = variant === 'coffee' ? dims.h * 0.5 : dims.h * 0.9;
  const legH = Math.max(0.05, topY - topThick/2);

  g.add(at(box(dims.w, topThick, dims.d, c), 0, topY, 0));
  for (const [sx, sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {{
    const leg = cyl(0.035, 0.035, legH, 0x6b4b2d);
    leg.position.set(sx*(dims.w/2-0.05), legH/2, sz*(dims.d/2-0.05));
    g.add(leg);
  }}
  if (variant === 'nightstand' || variant === 'console') {{
    g.add(at(box(dims.w*0.8, 0.04, dims.d*0.8, c), 0, legH*0.35, 0));
  }}
  return g;
}}

// ── StorageUnit ───────────────────────────────────────────────────────────────
const STORAGE_PRESETS = {{
  dresser_low: {{ w:1.2, d:0.45, h:0.85 }},
  dresser_tall:{{ w:1.0, d:0.50, h:1.40 }},
  wardrobe:    {{ w:1.4, d:0.60, h:2.00 }},
  closet_rack: {{ w:1.2, d:0.45, h:1.60 }},
  hamper:      {{ w:0.45,d:0.45, h:0.70 }},
  bookshelf:   {{ w:0.9, d:0.35, h:1.80 }},
  cube:        {{ w:0.8, d:0.35, h:0.80 }},
  cabinet:     {{ w:1.0, d:0.45, h:0.90 }},
  sideboard:   {{ w:1.5, d:0.45, h:0.85 }},
  shoe_rack:   {{ w:0.8, d:0.35, h:0.60 }},
}};
function makeStorageUnit(variant, color) {{
  const dims = STORAGE_PRESETS[variant] || STORAGE_PRESETS.dresser_low;
  const c = colorOf(color, 'dresser');
  const g = new THREE.Group();

  g.add(at(box(dims.w, dims.h, dims.d, c), 0, dims.h/2, 0));

  if (variant === 'wardrobe') {{
    g.add(at(box(dims.w*0.98, dims.h*0.95, 0.02, 0xf2f2f2), 0, dims.h*0.5, dims.d/2 + 0.01));
  }}
  if (variant === 'hamper') {{
    g.add(at(box(dims.w*0.9, 0.03, dims.d*0.9, 0xc2b8a3), 0, dims.h, 0));
  }}
  if (variant === 'closet_rack') {{
    g.add(at(box(dims.w*0.9, 0.04, 0.04, 0x888888), 0, dims.h*0.9, 0));
  }}
  return g;
}}

// ── Pillar ────────────────────────────────────────────────────────────────────
function makePillar(roomH, color) {{
  const h = roomH ?? 3;
  const g = new THREE.Group();
  const c = colorOf(color, 'pillar');
  const pillar = cyl(0.175, 0.175, h, c, 32);
  pillar.position.set(0, h/2, 0);
  g.add(pillar);
  return g;
}}

// ── UnknownObstacle ───────────────────────────────────────────────────────────
function makeUnknown(shape, color) {{
  const c = colorOf(color, 'unknown');
  const g = new THREE.Group();
  const h = 0.6;
  if (shape === 'round') {{
    const m = cyl(0.3, 0.3, h, c, 24);
    m.position.set(0, h/2, 0);
    g.add(m);
  }} else {{
    g.add(at(box(0.6, h, 0.6, c), 0, h/2, 0));
  }}
  return g;
}}

// ── Scene setup ───────────────────────────────────────────────────────────────
const room = SPEC.room || {{w:4, d:4, h:2.5}};
const anchors = SPEC.anchors || {{}};

const renderer = new THREE.WebGLRenderer({{ antialias: true }});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 15, 40);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth/window.innerHeight, 0.05, 200);
const cx = room.w/2, cz = room.d/2;
const dist = Math.max(room.w, room.d) * 1.5;
camera.position.set(cx + dist*0.7, dist*0.75, cz + dist*0.9);
camera.lookAt(cx, 0, cz);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(cx, 0.5, cz);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 1;
controls.maxDistance = 40;
controls.update();

// ── Lighting ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.25));
scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.8));
const sun = new THREE.DirectionalLight(0xfff8ee, 1.2);
sun.position.set(room.w*0.6+3, room.h*2+4, room.d*0.4+5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = Math.max(room.w, room.d) + 2;
Object.assign(sun.shadow.camera, {{ near:0.5, far:60, left:-sc, right:sc, top:sc, bottom:-sc }});
scene.add(sun);

// ── Floor ─────────────────────────────────────────────────────────────────────
const floorColor = room.floorColor ? new THREE.Color(room.floorColor) : new THREE.Color(0xe5e9f1);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(room.w, room.d),
  new THREE.MeshStandardMaterial({{ color: floorColor, roughness:0.8 }})
);
floor.rotation.x = -Math.PI/2;
floor.position.set(room.w/2, 0, room.d/2);
floor.receiveShadow = true;
scene.add(floor);

const gridHelper = new THREE.GridHelper(Math.max(room.w,room.d)*2, Math.max(room.w,room.d)*4, 0x334155, 0x1e293b);
gridHelper.position.set(room.w/2, 0.002, room.d/2);
scene.add(gridHelper);

// ── Walls ─────────────────────────────────────────────────────────────────────
const wallMat = new THREE.MeshStandardMaterial({{ color:0xf0ebe3, roughness:0.9, side:THREE.DoubleSide }});
function makeWall(w, h, px, py, pz, ry) {{
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
  m.position.set(px, py, pz);
  m.rotation.y = ry;
  m.receiveShadow = true;
  scene.add(m);
}}
makeWall(room.w, room.h, room.w/2, room.h/2, 0, 0); // back wall always
const hasLeft  = anchors?.pillar?.wall === 'left'  || anchors?.door?.wall === 'left';
const hasRight = anchors?.pillar?.wall === 'right' || anchors?.door?.wall === 'right';
if (hasLeft)  makeWall(room.d, room.h, 0,       room.h/2, room.d/2,  Math.PI/2);
if (hasRight) makeWall(room.d, room.h, room.w,  room.h/2, room.d/2, -Math.PI/2);

// ── Anchor highlights ─────────────────────────────────────────────────────────
function placeAnchor(a, key) {{
  const w = a.w || 0.9;
  const isDoor = key === 'door';
  const h = isDoor ? 2.0 : 1.2;
  const color = isDoor ? 0x22c55e : 0x38bdf8;
  let px = room.w/2, py = h/2, pz = 0.03, ry = 0;
  if (a.wall === 'front')      {{ pz = room.d - 0.03; }}
  else if (a.wall === 'left')  {{ px = 0.03; pz = a.z ?? room.d/2; ry =  Math.PI/2; }}
  else if (a.wall === 'right') {{ px = room.w-0.03; pz = a.z ?? room.d/2; ry = -Math.PI/2; }}
  else {{ px = a.x ?? room.w/2; }}
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.06),
    new THREE.MeshStandardMaterial({{ color, transparent:true, opacity:0.75 }})
  );
  m.position.set(px, py, pz);
  m.rotation.y = ry;
  scene.add(m);
}}
if (anchors?.door)   placeAnchor(anchors.door,   'door');
if (anchors?.pillar) placeAnchor(anchors.pillar,  'pillar');

// ── Furniture ─────────────────────────────────────────────────────────────────
const LABEL_COLORS = {{
  seat:'#93c5fd', sofa:'#fdba74', bed:'#e5e7eb',
  table:'#fcd34d', storageunit:'#86efac',
  pillar:'#cbd5e1', unknownobstacle:'#d1d5db',
}};
const legendItems = {{}};

(SPEC.objects || []).forEach(obj => {{
  const t = (obj.type || 'unknownobstacle').toLowerCase();
  const v = (obj.variant || '').toLowerCase();
  const yawRad = ((obj.yaw_deg || 0) * Math.PI) / 180;

  let group;
  if      (t === 'bed')         group = makeBed(v || 'queen', obj.color);
  else if (t === 'sofa')        group = makeSofa(v || 'sofa3', obj.color);
  else if (t === 'seat')        group = makeSeat(v || 'accent', obj.color);
  else if (t === 'table')       group = makeTable(v || 'side', obj.color);
  else if (t === 'storageunit') group = makeStorageUnit(v || 'dresser_low', obj.color);
  else if (t === 'pillar')      group = makePillar(room.h, obj.color);
  else                          group = makeUnknown(obj.shape, obj.color);

  group.position.set(obj.pos?.x || 0, 0, obj.pos?.z || 0);
  group.rotation.y = yawRad;
  scene.add(group);

  // CSS2D label
  const label = document.createElement('div');
  const labelColor = LABEL_COLORS[t] || '#e2e8f0';
  label.style.cssText = `background:rgba(15,15,30,0.72);color:${{labelColor}};padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;white-space:nowrap;pointer-events:none;border:1px solid ${{labelColor}}44;`;
  label.textContent = v ? `${{obj.type}} ${{obj.variant}}` : obj.type;
  const labelObj = new CSS2DObject(label);
  // Position label above the group (estimate height)
  const approxH = group.children.reduce((mx, c) => {{
    const b = new THREE.Box3().setFromObject(c);
    return Math.max(mx, b.max.y);
  }}, 0.5);
  labelObj.position.set(obj.pos?.x || 0, approxH + 0.15, obj.pos?.z || 0);
  scene.add(labelObj);

  // Legend
  const palKey = t === 'seat' ? 'chair' : t === 'storageunit' ? 'dresser' : t;
  const palColor = '#' + new THREE.Color(PALETTE[palKey] ?? PALETTE.unknown).getHexString();
  if (!legendItems[t]) legendItems[t] = {{ color: palColor, label: obj.type }};
}});

// Legend UI
const legendEl = document.getElementById('legend');
Object.values(legendItems).forEach(item => {{
  legendEl.innerHTML += `<div><span style="background:${{item.color}}"></span>${{item.label}}</div>`;
}});

// Heatmap overlay (ported from HeatmapOverlay.jsx)
if (HEATMAP !== null) {{
  const {{ cells, rows, cols }} = HEATMAP;
  const target = 200;
  const scale = Math.max(4, Math.min(12, Math.floor(target / Math.max(rows, cols))));
  const canvas = document.getElementById('heatmap-canvas');
  canvas.width  = cols * scale;
  canvas.height = rows * scale;
  const ctx = canvas.getContext('2d');
  for (let r = 0; r < rows; r++) {{
    for (let c = 0; c < cols; c++) {{
      const cell = cells[r][c];
      let color;
      if (cell.occupied)    color = '#ef4444';
      else if (cell.unreachable) color = '#8b5cf6';
      else {{
        const v = Math.max(0, Math.min(1, cell.v));
        const hue = 120 - 120 * v; // green→red
        color = `hsl(${{hue}}, 85%, 52%)`;
      }}
      ctx.fillStyle = color;
      ctx.fillRect(c * scale, r * scale, scale, scale);
    }}
  }}
  document.getElementById('heatmap-panel').style.display = 'block';
}}

// Score badge
if (HARMONY_SCORE !== null) {{
  document.getElementById('score-badge').style.display = 'block';
  const val = document.getElementById('score-val');
  val.textContent = HARMONY_SCORE.toFixed(1);
  val.style.color = HARMONY_SCORE >= 75 ? '#4ade80' : HARMONY_SCORE >= 50 ? '#facc15' : '#f87171';
}}

// ── Render loop ───────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
}});
function animate() {{
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}}
animate();
</script>
</body>
</html>"""

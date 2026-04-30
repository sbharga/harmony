import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ──────────────────────────────────────────────
// easing / math helpers
const easeInOut3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpAngle = (a, b, t) => {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

// ──────────────────────────────────────────────
// geometry helpers
function gBox(g, mat, w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function gCyl(g, mat, r, h, x, y, z, segs = 12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, segs), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

// ──────────────────────────────────────────────
// furniture builders
function makeSofa() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x7a6352, roughness: 0.88 });
  const cush = new THREE.MeshStandardMaterial({ color: 0x8d7362, roughness: 0.92 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x2e1f14, roughness: 0.6 });
  gBox(g, body, 2.2, 0.38, 0.95, 0, 0.19, 0);
  gBox(g, body, 2.2, 0.68, 0.2, 0, 0.72, -0.375);
  gBox(g, body, 0.2, 0.58, 0.95, -1.0, 0.29, 0);
  gBox(g, body, 0.2, 0.58, 0.95, 1.0, 0.29, 0);
  for (let i = -1; i <= 1; i++) gBox(g, cush, 0.66, 0.13, 0.8, i * 0.66, 0.445, 0.05);
  for (let i = -1; i <= 1; i++) gBox(g, cush, 0.66, 0.5, 0.13, i * 0.66, 0.44, -0.25);
  for (const [lx, lz] of [
    [-0.95, -0.42],
    [0.95, -0.42],
    [-0.95, 0.42],
    [0.95, 0.42],
  ])
    gBox(g, leg, 0.07, 0.1, 0.07, lx, 0.05, lz);
  return g;
}

function makeCoffeeTable() {
  const g = new THREE.Group();
  const top = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.45, metalness: 0.04 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.55 });
  gBox(g, top, 1.15, 0.06, 0.68, 0, 0.43, 0);
  gBox(g, top, 1.04, 0.04, 0.6, 0, 0.19, 0);
  for (const [lx, lz] of [
    [-0.5, -0.29],
    [0.5, -0.29],
    [-0.5, 0.29],
    [0.5, 0.29],
  ])
    gCyl(g, leg, 0.032, 0.43, lx, 0.215, lz);
  gBox(g, new THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: 0.8 }), 0.28, 0.04, 0.2, -0.25, 0.47, 0.1);
  gBox(g, new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.8 }), 0.26, 0.04, 0.2, -0.24, 0.51, 0.1);
  return g;
}

function makeArmchair() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x5c7a6b, roughness: 0.88 });
  const cush = new THREE.MeshStandardMaterial({ color: 0x6e8c7e, roughness: 0.92 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x1e1208, roughness: 0.55 });
  gBox(g, body, 0.9, 0.36, 0.85, 0, 0.18, 0);
  gBox(g, body, 0.9, 0.6, 0.18, 0, 0.66, -0.335);
  gBox(g, body, 0.17, 0.5, 0.85, -0.395, 0.25, 0);
  gBox(g, body, 0.17, 0.5, 0.85, 0.395, 0.25, 0);
  gBox(g, cush, 0.72, 0.13, 0.7, 0, 0.415, 0.04);
  gBox(g, cush, 0.72, 0.46, 0.13, 0, 0.47, -0.265);
  for (const [lx, lz] of [
    [-0.35, -0.37],
    [0.35, -0.37],
    [-0.35, 0.37],
    [0.35, 0.37],
  ])
    gBox(g, leg, 0.06, 0.09, 0.06, lx, 0.045, lz);
  return g;
}

function makeOttoman() {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x9b7d5e, roughness: 0.9 });
  const top = new THREE.MeshStandardMaterial({ color: 0xb09070, roughness: 0.92 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.55 });
  const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.38, 18), body);
  bm.position.set(0, 0.19, 0);
  bm.castShadow = true;
  bm.receiveShadow = true;
  g.add(bm);
  const tm = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 18), top);
  tm.position.set(0, 0.415, 0);
  tm.castShadow = true;
  g.add(tm);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.012, 6, 24),
    new THREE.MeshStandardMaterial({ color: 0x6a5040, roughness: 0.9 })
  );
  ring.position.set(0, 0.45, 0);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    gCyl(g, leg, 0.025, 0.09, Math.sin(a) * 0.3, 0.045, Math.cos(a) * 0.3);
  }
  return g;
}

function makeBookshelf() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4c2a, roughness: 0.72 });
  const back = new THREE.MeshStandardMaterial({ color: 0x3e2a12, roughness: 0.9 });
  const bookColors = [0x8b2020, 0x1a4a8b, 0x2a6b35, 0xb5860d, 0x5a2d82, 0x8b6020, 0x1a6b6b, 0xa04040, 0x3a6a9a];
  gBox(g, wood, 0.04, 2.0, 0.4, -0.62, 1.0, 0);
  gBox(g, wood, 0.04, 2.0, 0.4, 0.62, 1.0, 0);
  gBox(g, wood, 1.28, 0.04, 0.4, 0, 1.98, 0);
  gBox(g, wood, 1.28, 0.04, 0.4, 0, 0.02, 0);
  gBox(g, back, 1.2, 1.92, 0.03, 0, 0.98, -0.185);
  for (let s = 0; s < 4; s++) {
    const sy = 0.42 + s * 0.4;
    gBox(g, wood, 1.2, 0.03, 0.38, 0, sy, 0);
    let bx = -0.54;
    for (let b = 0; b < 7; b++) {
      const bw = 0.055 + Math.random() * 0.04;
      const bh = 0.22 + Math.random() * 0.12;
      const bmat = new THREE.MeshStandardMaterial({ color: bookColors[(s * 7 + b) % bookColors.length], roughness: 0.82 });
      gBox(g, bmat, bw, bh, 0.3, bx + bw / 2, sy + 0.02 + bh / 2, 0);
      bx += bw + 0.008;
    }
  }
  return g;
}

function makePlant() {
  const g = new THREE.Group();
  const pot = new THREE.MeshStandardMaterial({ color: 0xb06030, roughness: 0.82 });
  const soil = new THREE.MeshStandardMaterial({ color: 0x2e1e10, roughness: 1 });
  const stem = new THREE.MeshStandardMaterial({ color: 0x4a6a2a, roughness: 0.9 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3a7a30, roughness: 0.92, side: THREE.DoubleSide });
  const potM = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.34, 14), pot);
  potM.position.set(0, 0.17, 0);
  potM.castShadow = true;
  potM.receiveShadow = true;
  g.add(potM);
  const soilM = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 14), soil);
  soilM.position.set(0, 0.325, 0);
  g.add(soilM);
  gCyl(g, stem, 0.028, 0.6, 0, 0.63, 0);
  const leafAngles = [
    [0, 0.4],
    [0.3, 0.55],
    [-0.3, 0.55],
    [0.5, 0.38],
    [-0.5, 0.38],
    [0.18, 0.72],
    [-0.18, 0.72],
    [0, 0.85],
  ];
  leafAngles.forEach(([, ay], i) => {
    const a = (i / leafAngles.length) * Math.PI * 2;
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.3 + Math.random() * 0.14, 0.1 + Math.random() * 0.06), leaf);
    lm.position.set(Math.sin(a) * 0.14, 0.38 + ay, Math.cos(a) * 0.14);
    lm.rotation.set(Math.random() * 0.3 - 0.15, a, -0.25 - Math.random() * 0.35);
    lm.castShadow = true;
    g.add(lm);
  });
  return g;
}

function makeRug() {
  const g = new THREE.Group();
  const layers = [
    [3.2, 2.1, 0.002, 0x5e3e28],
    [2.9, 1.85, 0.003, 0xa07850],
    [2.55, 1.58, 0.004, 0x7a5838],
    [1.8, 1.1, 0.005, 0xc09068],
  ];
  layers.forEach(([w, d, y, col]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: col, roughness: 1 }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

function makeSideTable() {
  const g = new THREE.Group();
  const top = new THREE.MeshStandardMaterial({ color: 0xc8a87a, roughness: 0.5, metalness: 0.04 });
  const leg = new THREE.MeshStandardMaterial({ color: 0x3e2410, roughness: 0.58 });
  gBox(g, top, 0.55, 0.05, 0.55, 0, 0.6, 0);
  gBox(g, top, 0.48, 0.04, 0.48, 0, 0.31, 0);
  for (const [lx, lz] of [
    [-0.22, -0.22],
    [0.22, -0.22],
    [-0.22, 0.22],
    [0.22, 0.22],
  ])
    gCyl(g, leg, 0.026, 0.6, lx, 0.3, lz);
  gCyl(g, new THREE.MeshStandardMaterial({ color: 0xd4b060, roughness: 0.4, metalness: 0.5 }), 0.028, 0.28, 0, 0.77, 0);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.09, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: 0xf5ecd0, roughness: 0.9, transparent: true, opacity: 0.88 })
  );
  shade.position.set(0, 0.97, 0);
  shade.castShadow = true;
  g.add(shade);
  return g;
}

function makeTVStand() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x2e2016, roughness: 0.65 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0e0c0a, roughness: 0.45 });
  const knob = new THREE.MeshStandardMaterial({ color: 0x8a7a60, roughness: 0.4, metalness: 0.5 });
  gBox(g, wood, 1.9, 0.14, 0.55, 0, 0.07, 0);
  gBox(g, wood, 1.9, 0.14, 0.55, 0, 0.54, 0);
  gBox(g, wood, 0.06, 0.54, 0.52, -0.92, 0.27, 0);
  gBox(g, wood, 0.06, 0.54, 0.52, 0.92, 0.27, 0);
  gBox(g, wood, 0.06, 0.38, 0.52, 0, 0.27, 0);
  gBox(g, dark, 0.84, 0.32, 0.04, -0.44, 0.31, 0.275);
  gBox(g, dark, 0.84, 0.32, 0.04, 0.44, 0.31, 0.275);
  gCyl(g, knob, 0.022, 0.022, -0.44, 0.31, 0.29);
  gCyl(g, knob, 0.022, 0.022, 0.44, 0.31, 0.29);
  gBox(g, dark, 1.65, 0.96, 0.07, 0, 1.02, 0.06);
  gBox(
    g,
    new THREE.MeshStandardMaterial({
      color: 0x0c1820,
      roughness: 0.1,
      emissive: new THREE.Color(0x081016),
      emissiveIntensity: 0.7,
    }),
    1.58,
    0.88,
    0.02,
    0,
    1.02,
    0.1
  );
  gBox(g, dark, 0.12, 0.08, 0.4, -0.5, 0.04, 0);
  gBox(g, dark, 0.12, 0.08, 0.4, 0.5, 0.04, 0);
  return g;
}

function makeFloorLamp() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xb0a088, roughness: 0.28, metalness: 0.75 });
  const shade = new THREE.MeshStandardMaterial({ color: 0xfff3cc, roughness: 0.9, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.06, 16), metal);
  base.position.set(0, 0.03, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  gCyl(g, metal, 0.022, 1.6, 0, 0.83, 0);
  const sm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.19, 0.3, 16), shade);
  sm.position.set(0, 1.7, 0);
  sm.castShadow = true;
  g.add(sm);
  return g;
}

// ──────────────────────────────────────────────
// catalogue & plan helpers
const ITEMS = [
  {
    id: "rug",
    label: "Area Rug",
    build: makeRug,
    layouts: [
      { x: 0.1, z: 0.6, ry: 0 },
      { x: 0.3, z: 0.2, ry: Math.PI * 0.08 },
      { x: -0.2, z: 0.8, ry: Math.PI / 2 },
    ],
    birdW: 3.2,
    birdD: 2.1,
    birdH: 0.01,
    isRound: false,
  },
  {
    id: "sofa",
    label: "Sofa",
    build: makeSofa,
    layouts: [
      { x: 0, z: 2.15, ry: 0 },
      { x: -0.4, z: 1.9, ry: Math.PI * 0.1 },
      { x: 2.1, z: 0.2, ry: -Math.PI / 2 },
    ],
    birdW: 2.2,
    birdD: 0.95,
    birdH: 0.65,
    isRound: false,
  },
  {
    id: "coffeetable",
    label: "Coffee Table",
    build: makeCoffeeTable,
    layouts: [
      { x: 0.1, z: 0.9, ry: 0 },
      { x: -0.2, z: 0.65, ry: 0 },
      { x: 0.85, z: 0.2, ry: Math.PI / 2 },
    ],
    birdW: 1.15,
    birdD: 0.68,
    birdH: 0.45,
    isRound: false,
  },
  {
    id: "armchair",
    label: "Armchair",
    build: makeArmchair,
    layouts: [
      { x: -1.8, z: 0.85, ry: Math.PI * 0.22 },
      { x: 1.8, z: 1.0, ry: -Math.PI * 0.22 },
      { x: 0.5, z: -2.0, ry: -Math.PI * 0.12 },
    ],
    birdW: 0.9,
    birdD: 0.85,
    birdH: 0.72,
    isRound: false,
  },
  {
    id: "ottoman",
    label: "Ottoman",
    build: makeOttoman,
    layouts: [
      { x: 1.7, z: 0.95, ry: 0 },
      { x: -1.65, z: 0.35, ry: 0 },
      { x: -0.6, z: -0.2, ry: 0 },
    ],
    birdW: 0.82,
    birdD: 0.82,
    birdH: 0.45,
    isRound: true,
  },
  {
    id: "bookshelf",
    label: "Bookshelf",
    build: makeBookshelf,
    layouts: [
      { x: -2.58, z: -0.7, ry: Math.PI / 2 },
      { x: -0.7, z: -2.58, ry: 0 },
      { x: -1.2, z: -2.58, ry: 0 },
    ],
    birdW: 1.28,
    birdD: 0.42,
    birdH: 2.0,
    isRound: false,
  },
  {
    id: "plant",
    label: "Plant",
    build: makePlant,
    layouts: [
      { x: 2.25, z: -1.8, ry: 0 },
      { x: -2.2, z: 1.7, ry: 0 },
      { x: -2.4, z: -1.6, ry: 0 },
    ],
    birdW: 0.5,
    birdD: 0.5,
    birdH: 1.05,
    isRound: true,
  },
  {
    id: "sidetable",
    label: "Side Table",
    build: makeSideTable,
    layouts: [
      { x: -1.75, z: 2.05, ry: 0 },
      { x: 1.3, z: 2.1, ry: 0 },
      { x: 1.9, z: 1.7, ry: 0 },
    ],
    birdW: 0.55,
    birdD: 0.55,
    birdH: 0.65,
    isRound: false,
  },
  {
    id: "tvstand",
    label: "TV Stand",
    build: makeTVStand,
    layouts: [
      { x: 0, z: -2.45, ry: 0 },
      { x: 2.35, z: -0.5, ry: -Math.PI / 2 },
      { x: -2.42, z: 0.1, ry: Math.PI / 2 },
    ],
    birdW: 1.9,
    birdD: 0.56,
    birdH: 1.5,
    isRound: false,
  },
  {
    id: "floorlamp",
    label: "Floor Lamp",
    build: makeFloorLamp,
    layouts: [
      { x: 1.9, z: 2.1, ry: 0 },
      { x: 2.5, z: 2.4, ry: 0 },
      { x: 2.1, z: -2.1, ry: 0 },
    ],
    birdW: 0.42,
    birdD: 0.42,
    birdH: 1.75,
    isRound: true,
  },
];

const ORIENTATION_LABELS = ["Conversational", "Flow-Optimised", "Light-Facing"];
// Pre-computed harmony scores for each demo layout
const LAYOUT_SCORES = [62, 77, 68];

function makeBirdsEyeTexture(layoutIdx) {
  const SIZE = 512;
  const ROOM = 6.0;
  const SCALE = SIZE / ROOM;
  const OX = SIZE / 2;
  const OZ = SIZE / 2;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e2d5bc";
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "rgba(90,60,30,0.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i < SIZE; i += SIZE / 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(SIZE, i);
    ctx.stroke();
  }

  ctx.fillStyle = "#7a6548";
  ctx.fillRect(0, 0, SIZE, 10);
  ctx.fillRect(0, 0, 10, SIZE);

  const colMap = {
    rug: "rgba(120,88,56,0.30)",
    sofa: "#9b7f63",
    coffeetable: "#c8aa7e",
    armchair: "#6a8c7e",
    ottoman: "#b09070",
    bookshelf: "#7a5a30",
    plant: "#5a8c4a",
    sidetable: "#c8a868",
    tvstand: "#3c2c1a",
    floorlamp: "#c0b080",
  };

  ITEMS.forEach((item) => {
    const lay = item.layouts[layoutIdx];
    const px = OX + lay.x * SCALE;
    const pz = OZ + lay.z * SCALE;
    const hw = (item.birdW / 2) * SCALE;
    const hd = (item.birdD / 2) * SCALE;

    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(lay.ry);

    ctx.shadowColor = "rgba(0,0,0,0.20)";
    ctx.shadowBlur = 7;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = colMap[item.id] || "#aaa";
    ctx.beginPath();
    if (item.isRound) {
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
    } else if (ctx.roundRect) {
      ctx.roundRect(-hw, -hd, hw * 2, hd * 2, 4);
    } else {
      ctx.rect(-hw, -hd, hw * 2, hd * 2);
    }
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(item.label, 0, 1);

    ctx.restore();
  });

  ctx.fillStyle = "rgba(60,40,20,0.55)";
  const sbX = SIZE - 80,
    sbY = SIZE - 18;
  ctx.fillRect(sbX, sbY, (SIZE / ROOM) * 1, 3);
  ctx.font = "500 10px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#4a3010";
  ctx.fillText("1 m", sbX + SIZE / ROOM / 2, sbY - 4);

  return new THREE.CanvasTexture(canvas);
}

// ──────────────────────────────────────────────
// component
export default function LiveDemo() {
  const mountRef = useRef(null);
  const labelsRef = useRef(null);
  const startedRef = useRef(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [oriIdx, setOriIdx] = useState(0);
  const [oriLabel, setOriLabel] = useState("");
  const [hint, setHint] = useState("");
  const [layoutScore, setLayoutScore] = useState(null);

  // Trigger animation only when section enters viewport
  useEffect(() => {
    const target = mountRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setShouldPlay(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.6,          // require majority in view
        rootMargin: "0px 0px -15% 0px", // don’t trigger too early
      }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldPlay || startedRef.current) return;
    startedRef.current = true;
    const el = mountRef.current;
    const labelsEl = labelsRef.current;
    if (!el || !labelsEl) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x111a0e, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111a0e);
    const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);

    scene.add(new THREE.AmbientLight(0xfdf6e3, 0.5));
    const sun = new THREE.DirectionalLight(0xfff5e0, 1.7);
    sun.position.set(7, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 35;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -8;
    sun.shadow.camera.right = sun.shadow.camera.top = 8;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc8ddc8, 0.3);
    fill.position.set(-6, 6, -5);
    scene.add(fill);
    const warm = new THREE.PointLight(0xffcc80, 0.45, 9);
    warm.position.set(2, 2, 2);
    scene.add(warm);

    const roomPivot = new THREE.Group();
    scene.add(roomPivot);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), new THREE.MeshStandardMaterial({ color: 0xcfb990, roughness: 0.88 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomPivot.add(floor);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.6), new THREE.MeshStandardMaterial({ color: 0xf0e9da, roughness: 0.92 }));
    backWall.position.set(0, 1.8, -3.1);
    backWall.receiveShadow = true;
    roomPivot.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.6), new THREE.MeshStandardMaterial({ color: 0xeae2d2, roughness: 0.92 }));
    leftWall.position.set(-3.1, 1.8, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    roomPivot.add(leftWall);

    const baseM = new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.7 });
    gBox(roomPivot, baseM, 6.2, 0.1, 0.05, 0, 0.05, -3.07);
    gBox(roomPivot, baseM, 0.05, 0.1, 6.2, -3.07, 0.05, 0);

    const furnitureGroups = ITEMS.map((item) => {
      const grp = item.build();
      grp.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });
      const lay = item.layouts[0];
      grp.position.set(lay.x, -5, lay.z);
      grp.rotation.y = lay.ry;
      grp.userData = { currentLayout: 0 };
      roomPivot.add(grp);
      return grp;
    });

    const labelDivs = ITEMS.map((item) => {
      const div = document.createElement("div");
      div.textContent = item.label;
      div.style.cssText = [
        "position:absolute",
        "pointer-events:none",
        "background:rgba(12,20,10,0.84)",
        "color:#c0d4a8",
        "border:1px solid rgba(160,190,130,0.35)",
        "font-size:10px",
        "font-weight:700",
        "letter-spacing:0.08em",
        "padding:2px 8px",
        "border-radius:999px",
        "white-space:nowrap",
        "transform:translate(-50%,-50%)",
        "transition:opacity 0.35s ease",
        "opacity:0",
      ].join(";");
      labelsEl.appendChild(div);
      return div;
    });

    const CAM_R = 10.0;
    let camTheta = Math.PI * 0.2;
    let camPhi = 0.6;
    const THETA_MIN = -Math.PI * 0.44;
    const THETA_MAX = Math.PI * 0.44;
    const PHI_MIN = 0.28;
    const PHI_MAX = 1.1;
    const setCam = (theta, phi) => {
      camera.position.set(CAM_R * Math.sin(phi) * Math.sin(theta), CAM_R * Math.cos(phi), CAM_R * Math.sin(phi) * Math.cos(theta));
      camera.lookAt(0, 0.5, 0);
    };
    // Initial camera: modest orbit view to watch the rise
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 0.5, 0);

    const updateLabels = (visible) => {
      ITEMS.forEach((item, i) => {
        const div = labelDivs[i];
        if (!visible) {
          div.style.opacity = "0";
          return;
        }
        const grp = furnitureGroups[i];
        const layoutIdx = grp.userData.currentLayout;
        const lay = item.layouts[layoutIdx];
        const localPos = new THREE.Vector3(lay.x, item.birdH + 0.25, lay.z);
        const cosY = Math.cos(roomPivot.rotation.y);
        const sinY = Math.sin(roomPivot.rotation.y);
        const wx = cosY * localPos.x - sinY * localPos.z;
        const wz = sinY * localPos.x + cosY * localPos.z;
        const worldPos = new THREE.Vector3(wx, localPos.y, wz);
        const v = worldPos.clone().project(camera);
        if (v.z > 1) {
          div.style.opacity = "0";
          return;
        }
        div.style.opacity = "0.95";
        div.style.left = (v.x * 0.5 + 0.5) * el.clientWidth + "px";
        div.style.top = (v.y * -0.5 + 0.5) * el.clientHeight + "px";
      });
    };

    let inTransition = false;
    let layoutTransT = 0;
    let layoutTransDur = 1.5;
    let fromPos = [];
    let toPos = [];
    let fromRot = [];
    let toRot = [];
    const startLayoutTransition = (newIdx, dur) => {
      fromPos = furnitureGroups.map((g) => g.position.clone());
      fromRot = furnitureGroups.map((g) => g.rotation.y);
      toPos = ITEMS.map((item) => {
        const l = item.layouts[newIdx];
        return new THREE.Vector3(l.x, 0, l.z);
      });
      toRot = ITEMS.map((item) => item.layouts[newIdx].ry);
      layoutTransT = 0;
      layoutTransDur = dur;
      inTransition = true;
      furnitureGroups.forEach((g) => {
        g.userData.currentLayout = newIdx;
      });
    };

    let animPhase = "rise";
    let isDragging = false,
      lastX = 0,
      lastY = 0;
    const onDown = (e) => {
      if (animPhase !== "interactive") return;
      isDragging = true;
      lastX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      lastY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
    };
    const onUp = () => {
      isDragging = false;
    };
    const onMove = (e) => {
      if (!isDragging) return;
      const cx = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
      const cy = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;
      camTheta = Math.max(THETA_MIN, Math.min(THETA_MAX, camTheta - (cx - lastX) * 0.0044));
      camPhi = Math.max(PHI_MIN, Math.min(PHI_MAX, camPhi + (cy - lastY) * 0.0044));
      lastX = cx;
      lastY = cy;
      setCam(camTheta, camPhi);
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    let phaseT = 0;
    let oriIdxL = 0;
    let labelsVisible = false;
    let lastTime = performance.now();
    let rafId;

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      phaseT += dt;

      if (inTransition) {
        layoutTransT += dt;
        const p = Math.min(layoutTransT / layoutTransDur, 1);
        const e = easeInOut3(p);
        furnitureGroups.forEach((g, i) => {
          g.position.lerpVectors(fromPos[i], toPos[i], e);
          g.rotation.y = lerpAngle(fromRot[i], toRot[i], e);
        });
        if (p >= 1) inTransition = false;
      }

      if (animPhase === "rise") {
        const prog = Math.min(phaseT / 2.2, 1);
        furnitureGroups.forEach((g, i) => {
          const delay = i * 0.1;
          const lp = Math.max(0, Math.min(1, (phaseT - delay) / 1.6));
          g.position.y = lerp(-4, 0, easeInOut3(lp));
        });
        setCam(camTheta, camPhi);
        if (prog >= 1) {
          labelsVisible = true;
          animPhase = "pause";
          phaseT = 0;
          setPhase("pause");
        }
      } else if (animPhase === "pause") {
        setCam(camTheta, camPhi);
        if (phaseT > 0.8) {
          animPhase = "orienting";
          phaseT = 0;
          oriIdxL = 0;
          setPhase("orienting");
          setOriIdx(0);
          setOriLabel(ORIENTATION_LABELS[0]);
          setLayoutScore(LAYOUT_SCORES[0]);
        }
      } else if (animPhase === "orienting") {
        const prog = Math.min(phaseT / 3.0, 1);
        const targetTheta = Math.PI * 0.2 + (oriIdxL === 1 ? 0.22 : oriIdxL === 2 ? -0.15 : 0);
        camTheta = lerp(camTheta, targetTheta, 0.025);
        setCam(camTheta, camPhi);
        if (prog >= 1) {
          phaseT = 0;
          if (oriIdxL < ORIENTATION_LABELS.length - 1) {
            const next = oriIdxL + 1;
            oriIdxL = next;
            setOriIdx(next);
            setOriLabel(ORIENTATION_LABELS[next]);
            setLayoutScore(LAYOUT_SCORES[next]);
            startLayoutTransition(next, 1.4);
          } else {
            animPhase = "interactive";
            setPhase("interactive");
            setOriLabel("");
            setHint("Drag to explore");
          }
        }
      } else if (animPhase === "interactive") {
        if (!isDragging) setCam(camTheta, camPhi);
      }

      updateLabels(labelsVisible && animPhase !== "photo" && animPhase !== "flip");
      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("touchstart", onDown);
      labelDivs.forEach((d) => d.remove());
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [shouldPlay]);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-forest-dark">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(0deg,#a5b890 0,#a5b890 1px,transparent 0,transparent 44px)",
            "repeating-linear-gradient(90deg,#a5b890 0,#a5b890 1px,transparent 0,transparent 44px)",
          ].join(","),
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-moss mb-3">
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-milk tracking-tight">Watch your room come to life.</h2>
          <p className="mt-4 text-moss-pale/55 max-w-xl mx-auto text-base">
            From a bird&#39;s-eye floor plan, Harmony raises your furniture into 3D and finds the optimal arrangement — automatically.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c, i) => (
            <div key={i} className={`absolute w-5 h-5 border-moss/40 ${c} z-20 -m-1.5`} />
          ))}

          <div className="relative" style={{ height: 520 }}>
            <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" style={{ cursor: phase === "interactive" ? "grab" : "default" }} />
            <div ref={labelsRef} className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl" />

            {oriLabel && (
              <div key={oriLabel} className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10" style={{ animation: "fadeSlideDown 0.35s ease forwards" }}>
                <div className="bg-forest-dark/85 backdrop-blur-md border border-moss/30 rounded-full px-5 py-1.5 flex items-center gap-2.5 shadow-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss inline-block" />
                  <span className="text-sm font-semibold text-moss tracking-wide">{oriLabel}</span>
                  {layoutScore != null && (
                    <span className="text-xs font-bold text-moss/70 bg-moss/10 px-2 py-0.5 rounded-full">
                      {layoutScore}
                    </span>
                  )}
                </div>
              </div>
            )}

            {phase === "orienting" && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none z-10">
                {ORIENTATION_LABELS.map((l, i) => (
                  <div
                    key={l}
                    className="transition-all duration-500 rounded-full"
                    style={{
                      width: oriIdx >= i ? 22 : 8,
                      height: 8,
                      background: oriIdx >= i ? "#a5b890" : "rgba(165,184,144,0.20)",
                    }}
                  />
                ))}
              </div>
            )}

            {phase === "interactive" && (
              <div className="absolute top-4 right-4 pointer-events-none z-10" style={{ animation: "fadeIn 0.6s ease forwards" }}>
                <div className="bg-forest-dark/75 backdrop-blur-md border border-moss/25 rounded-xl px-3 py-2 text-right shadow-lg">
                  <p className="text-moss/50 text-[9px] font-bold tracking-[0.18em] uppercase mb-0.5">Best layout</p>
                  <p className="text-moss text-xs font-semibold">{ORIENTATION_LABELS[1]} — {LAYOUT_SCORES[1]}</p>
                </div>
              </div>
            )}
            {phase === "interactive" && hint && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none" style={{ animation: "fadeIn 1.2s ease forwards" }}>
                <p className="text-moss/45 text-xs tracking-[0.22em] uppercase">{hint}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
          {[
            { n: "01", title: "Floor Plan Upload", body: "Bird's-eye plan with labelled furniture footprints." },
            { n: "02", title: "3D Reconstruction", body: "Each piece rises from the plan with realistic geometry." },
            { n: "03", title: "Layout Optimisation", body: "Three harmony-scored arrangements explored live." },
          ].map((s) => (
            <div key={s.n} className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-moss/40">{s.n}</span>
              <p className="text-sm font-semibold text-milk/88">{s.title}</p>
              <p className="text-xs text-moss-pale/42 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

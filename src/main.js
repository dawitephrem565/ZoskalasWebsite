import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const METAL_COLORS = {
  'white-gold': 0xe8e8e8,
  'rose-gold': 0xe8b4a0,
  'yellow-gold': 0xc9a96e,
  'platinum': 0xd4d4d4,
};

const products = [
  {
    id: 'round', name: 'Classic Round Brilliant',
    desc: 'Timeless elegance meets exceptional brilliance and fire in every facet.',
    specs: ['2.5 ct', 'D Color', 'VS1 Clarity', '18K White Gold'],
    price: '$24,500', cut: 'round', metal: 'white-gold',
  },
  {
    id: 'princess', name: 'Princess Cut Solitaire',
    desc: 'Modern sophistication with a crisp square silhouette and radiant sparkle.',
    specs: ['2.0 ct', 'E Color', 'VS2 Clarity', '18K Rose Gold'],
    price: '$19,800', cut: 'princess', metal: 'rose-gold',
  },
  {
    id: 'cushion', name: 'Cushion Cut Romance',
    desc: 'Vintage charm with a soft rounded square and a dreamy, candlelit glow.',
    specs: ['2.8 ct', 'F Color', 'VS1 Clarity', 'Platinum'],
    price: '$31,200', cut: 'cushion', metal: 'platinum',
  },
  {
    id: 'emerald', name: 'Emerald Cut Elegance',
    desc: 'Art Deco refinement with stepped facets and a hall-of-mirrors effect.',
    specs: ['3.2 ct', 'E Color', 'VVS2 Clarity', '18K Yellow Gold'],
    price: '$42,800', cut: 'emerald', metal: 'yellow-gold',
  },
  {
    id: 'oval', name: 'Oval Cut Radiance',
    desc: 'Elongated brilliance that creates a flattering, graceful silhouette.',
    specs: ['2.2 ct', 'D Color', 'VS1 Clarity', 'Platinum'],
    price: '$27,500', cut: 'oval', metal: 'platinum',
  },
];

let currentProduct = 0;

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.15, 'rgba(255,255,255,0.7)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.2)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function createFlatNormals(expanded) {
  const pos = expanded.attributes.position;
  const normals = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i += 3) {
    const p0 = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    const p1 = [pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1)];
    const p2 = [pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2)];
    const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const e2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
    const n = [
      e1[1] * e2[2] - e1[2] * e2[1],
      e1[2] * e2[0] - e1[0] * e2[2],
      e1[0] * e2[1] - e1[1] * e2[0],
    ];
    const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
    if (len > 0) { n[0] /= len; n[1] /= len; n[2] /= len; }
    for (let j = 0; j < 3; j++) {
      normals[(i + j) * 3] = n[0];
      normals[(i + j) * 3 + 1] = n[1];
      normals[(i + j) * 3 + 2] = n[2];
    }
  }
  expanded.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return expanded;
}

function createGemGeometry(radiusFn, height, segments = 16) {
  const profile = [
    { y: 1, r: (a) => 0.01 }, { y: 1, r: (a) => 0.5 * radiusFn(a) },
    { y: 0.65, r: (a) => 0.78 * radiusFn(a) }, { y: 0.25, r: (a) => 0.62 * radiusFn(a) },
    { y: 0, r: (a) => 1.0 * radiusFn(a) }, { y: -0.3, r: (a) => 0.72 * radiusFn(a) },
    { y: -0.58, r: (a) => 0.35 * radiusFn(a) }, { y: -0.82, r: (a) => 0.01 },
    { y: -0.85, r: (a) => 0 },
  ];
  const positions = [];
  const indices = [];
  for (const p of profile) {
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      const r = p.r(a);
      positions.push(r * Math.cos(a), p.y * height, r * Math.sin(a));
    }
  }
  for (let r = 0; r < profile.length - 1; r++) {
    for (let i = 0; i < segments; i++) {
      const a = r * segments + i;
      const b = r * segments + (i + 1) % segments;
      const c = (r + 1) * segments + i;
      const d = (r + 1) * segments + (i + 1) % segments;
      indices.push(a, c, b); indices.push(b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return createFlatNormals(geo.toNonIndexed());
}

const roundRadii = (a) => 1;
const princessRadii = (a) => {
  const angle = ((a % (Math.PI / 2)) + Math.PI / 4);
  return 0.88 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
};
const cushionRadii = (a) => {
  const sq = 1 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
  return 0.78 * sq + 0.22;
};
const ovalRadii = (a) => {
  const aspect = 0.7;
  const ca = Math.cos(a); const sa = Math.sin(a);
  return 1 / Math.sqrt(ca * ca + sa * sa / (aspect * aspect));
};

function createEmeraldGeometry(length, width, height) {
  const halfL = length / 2; const halfW = width / 2;
  const tiers = [
    { y: height / 2, l: halfL * 0.6, w: halfW * 0.6 },
    { y: height * 0.35, l: halfL * 0.85, w: halfW * 0.85 },
    { y: height * 0.15, l: halfL, w: halfW },
    { y: 0, l: halfL, w: halfW },
    { y: -height * 0.2, l: halfL * 0.8, w: halfW * 0.8 },
    { y: -height * 0.4, l: halfL * 0.55, w: halfW * 0.55 },
    { y: -height * 0.65, l: halfL * 0.25, w: halfW * 0.25 },
    { y: -height * 0.78, l: 0, w: 0 },
  ];
  const positions = [];
  const indices = [];
  for (const t of tiers) {
    positions.push(-t.l, t.y, -t.w); positions.push(t.l, t.y, -t.w);
    positions.push(t.l, t.y, t.w); positions.push(-t.l, t.y, t.w);
  }
  for (let r = 0; r < tiers.length - 1; r++) {
    for (let i = 0; i < 4; i++) {
      const a = r * 4 + i; const b = r * 4 + (i + 1) % 4;
      const c = (r + 1) * 4 + i; const d = (r + 1) * 4 + (i + 1) % 4;
      indices.push(a, c, b); indices.push(b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return createFlatNormals(geo.toNonIndexed());
}

function createRingBand(innerRadius, thickness, metalColor) {
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(innerRadius, thickness, 24, 48),
    new THREE.MeshPhysicalMaterial({
      color: metalColor, roughness: 0.2, metalness: 1, envMapIntensity: 2, clearcoat: 0.1,
    })
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = -1.4;
  band.castShadow = true;
  return band;
}

function createProngs(gemRadius, metalColor) {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: metalColor, roughness: 0.25, metalness: 1, envMapIntensity: 1.5,
  });
  for (const angle of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.5, 6), mat);
    const r = gemRadius * 0.75;
    prong.position.set(r * Math.cos(angle), -0.12, r * Math.sin(angle));
    prong.rotation.z = Math.PI / 2;
    prong.rotation.y = -angle;
    prong.castShadow = true;
    group.add(prong);
  }
  return group;
}

function buildProduct(index) {
  const group = new THREE.Group();
  const product = products[index];
  const metalColor = METAL_COLORS[product.metal];

  const gemHeight = 1.4;
  const gemRadius = 0.9;

  let gemGeo;
  switch (product.cut) {
    case 'princess': gemGeo = createGemGeometry(princessRadii, gemHeight, 4); break;
    case 'cushion': gemGeo = createGemGeometry(cushionRadii, gemHeight, 8); break;
    case 'emerald': gemGeo = createEmeraldGeometry(1.6, 1.0, gemHeight); break;
    case 'oval': gemGeo = createGemGeometry(ovalRadii, gemHeight, 16); break;
    default: gemGeo = createGemGeometry(roundRadii, gemHeight, 16);
  }

  const gemMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.02, metalness: 0, transmission: 0.5, thickness: 2.0,
    ior: 2.417, envMapIntensity: 5, clearcoat: 0.4, clearcoatRoughness: 0.05,
    transparent: true, opacity: 1, specularIntensity: 1.0,
    specularColor: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0x223355),
    emissiveIntensity: 0.08,
  });

  const gem = new THREE.Mesh(gemGeo, gemMat);
  gem.position.y = 0.5;
  gem.scale.set(gemRadius, gemRadius, gemRadius);
  gem.castShadow = true;
  group.add(gem);

  const band = createRingBand(0.9, 0.15, metalColor);
  group.add(band);

  const prongs = createProngs(gemRadius, metalColor);
  prongs.position.y = 0.5;
  group.add(prongs);

  return group;
}

function disposeMesh(obj) {
  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
    else obj.material.dispose();
  }
  if (obj.children) {
    while (obj.children.length) {
      disposeMesh(obj.children[0]);
      obj.remove(obj.children[0]);
    }
  }
}

const container = document.getElementById('hero-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070707);

const camera = new THREE.PerspectiveCamera(28, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 2.0, 7.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true, powerPreference: 'high-performance',
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environmentIntensity = 1.5;
pmrem.dispose();

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.5;
controls.maxDistance = 14;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI * 0.45;
controls.enableZoom = true;
controls.enablePan = false;
controls.update();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(container.clientWidth, container.clientHeight),
  0.35, 0.15, 0.05
);
composer.addPass(bloomPass);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));

const key = new THREE.DirectionalLight(0xffffff, 2.5);
key.position.set(4, 6, 5);
key.castShadow = true;
key.shadow.mapSize.width = 1024;
key.shadow.mapSize.height = 1024;
scene.add(key);

const fill = new THREE.DirectionalLight(0x4488ff, 0.4);
fill.position.set(-3, 2, -2);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffaa88, 0.6);
rim.position.set(0, -2, 4);
scene.add(rim);

const back = new THREE.DirectionalLight(0xffffff, 0.3);
back.position.set(0, 1, -5);
scene.add(back);

const platformMat = new THREE.MeshPhysicalMaterial({
  color: 0x0d0d0d, roughness: 0.15, metalness: 0.4,
  envMapIntensity: 1, transparent: true, opacity: 0.8, side: THREE.DoubleSide,
});
const platform = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), platformMat);
platform.rotation.x = -Math.PI / 2;
platform.position.y = -1.55;
platform.receiveShadow = true;
scene.add(platform);

const glowRing = new THREE.Mesh(
  new THREE.RingGeometry(2.9, 3.15, 64),
  new THREE.MeshBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
);
glowRing.rotation.x = -Math.PI / 2;
glowRing.position.y = -1.52;
scene.add(glowRing);

const backdropSphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x1a1a24, transparent: true, opacity: 0.6, side: THREE.BackSide })
);
backdropSphere.position.set(-0.8, 0.6, -1.0);
scene.add(backdropSphere);

const backdropSphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.6, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x1a1420, transparent: true, opacity: 0.4, side: THREE.BackSide })
);
backdropSphere2.position.set(0.7, 0.2, -0.9);
scene.add(backdropSphere2);

const particleTexture = createParticleTexture();
const particleCount = 120;
const pPos = new Float32Array(particleCount * 3);
const pSizes = new Float32Array(particleCount);
const pPhases = new Float32Array(particleCount);
const pSpeeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 2.2 + Math.random() * 1.8;
  pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  pPos[i * 3 + 1] = r * Math.cos(phi) * 0.8 + 0.6;
  pPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  pSizes[i] = 0.015 + Math.random() * 0.04;
  pPhases[i] = Math.random() * Math.PI * 2;
  pSpeeds[i] = 0.2 + Math.random() * 0.4;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));

const particleMat = new THREE.PointsMaterial({
  map: particleTexture, size: 0.06, transparent: true, opacity: 0.5,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

let productGroup = buildProduct(0);
scene.add(productGroup);

function switchProduct(index) {
  if (index === currentProduct) return;
  scene.remove(productGroup);
  disposeMesh(productGroup);
  productGroup = buildProduct(index);
  scene.add(productGroup);
  currentProduct = index;
}

const heroSection = document.getElementById('hero');
let isVisible = true;

const observer = new IntersectionObserver((entries) => {
  isVisible = entries[0].isIntersecting;
}, { threshold: 0.1 });
observer.observe(heroSection);

const carousel = document.getElementById('carousel');
document.getElementById('carousel-next')?.addEventListener('click', () => {
  carousel.scrollBy({ left: 280, behavior: 'smooth' });
});
document.getElementById('carousel-prev')?.addEventListener('click', () => {
  carousel.scrollBy({ left: -280, behavior: 'smooth' });
});

function onResize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w === 0 || h === 0) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}

window.addEventListener('resize', onResize);

let frameCount = 0;

function animate() {
  requestAnimationFrame(animate);

  if (!isVisible) {
    composer.render();
    return;
  }

  controls.update();

  const time = Date.now() * 0.001;

  productGroup.rotation.y += 0.003;
  productGroup.position.y = 0.5 + Math.sin(time * 0.8) * 0.04;

  particles.rotation.y += 0.0005;
  particles.rotation.x = Math.sin(time * 0.1) * 0.02;

  const pos = particles.geometry.attributes.position;
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const theta = Math.atan2(pos.getZ(i3), pos.getX(i3)) + 0.002;
    const r = Math.sqrt(pos.getX(i3) ** 2 + pos.getZ(i3) ** 2);
    pos.setXYZ(i3, r * Math.cos(theta), pos.getY(i3) + Math.sin(time * pSpeeds[i] + pPhases[i]) * 0.0003, r * Math.sin(theta));
  }
  pos.needsUpdate = true;

  bloomPass.strength = 0.35 + Math.sin(time * 0.5) * 0.05;

  frameCount++;
  composer.render();
}

animate();

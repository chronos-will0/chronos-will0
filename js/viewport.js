/* =========================================================================
   VIEWPORT ENGINE
   -------------------------------------------------------------------------
   Builds one live, orbitable Three.js viewport per entry in MODELS
   (see js/config.js). Each viewport has:
     - a Material Preview mode (lit, colored/textured shading)
     - a Topology mode (flat grey shading + black wireframe overlay,
       matching Blender's wireframe/topology look)
     - a live stats readout (Vertices / Edges / Faces / Triangles)
   Runs as a single ES module so it can import Three.js from a CDN
   via the import map in index.html — no build step required.
   ========================================================================= */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const TOPO_COLOR = 0x9a9a9a;
const WIRE_COLOR = 0x0a0a0a;
const ACCENT_YELLOW = 0xf5ff00;

const instances = [];

function buildDemoMesh() {
  // A small procedural placeholder so the section works before any
  // .glb files are added — an icosahedron reads clearly in both
  // material and topology shading.
  const geo = new THREE.IcosahedronGeometry(1.1, 1);
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xf5ff00, roughness: 0.35, metalness: 0.15 });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);
  return group;
}

function collectStats(root) {
  let objects = 0, vertices = 0, triangles = 0;
  root.traverse((node) => {
    if (node.isMesh) {
      objects += 1;
      const geo = node.geometry;
      const posCount = geo.attributes.position ? geo.attributes.position.count : 0;
      vertices += posCount;
      if (geo.index) triangles += geo.index.count / 3;
      else triangles += posCount / 3;
    }
  });
  const faces = triangles; // exported meshes are triangulated for the web
  // Euler's formula (V - E + F = 2) gives a reasonable edge estimate
  // for a closed manifold mesh: E = V + F - 2.
  const edges = Math.max(0, Math.round(vertices + faces - 2));
  return { objects, vertices: Math.round(vertices), edges, faces: Math.round(faces), triangles: Math.round(triangles) };
}

function applyTopologyMaterial(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (!node.userData._origMaterial) node.userData._origMaterial = node.material;
    if (!node.userData._wireMesh) {
      const wireGeo = node.geometry;
      const wireMat = new THREE.MeshBasicMaterial({ color: WIRE_COLOR, wireframe: true, transparent: true, opacity: 0.55 });
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.renderOrder = 2;
      node.add(wire);
      node.userData._wireMesh = wire;
    }
    node.material = new THREE.MeshStandardMaterial({
      color: TOPO_COLOR,
      flatShading: true,
      roughness: 0.9,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    node.userData._wireMesh.visible = true;
  });
}

function applyMaterialShading(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (node.userData._origMaterial) node.material = node.userData._origMaterial;
    if (node.userData._wireMesh) node.userData._wireMesh.visible = false;
  });
}

function frameObject(object, camera, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const dist = maxDim * 1.8;
  camera.position.set(center.x + dist * 0.6, center.y + dist * 0.45, center.z + dist * 0.8);
  camera.near = maxDim / 100;
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}

function createViewport(cardEl, modelCfg) {
  const canvasWrap = cardEl.querySelector(".vp-canvas-wrap");
  const statsEl = cardEl.querySelector(".vp-stats");
  const loadingEl = cardEl.querySelector(".vp-loading");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0b);
  scene.fog = new THREE.Fog(0x0a0a0b, 8, 22);

  const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.01, 100);
  camera.position.set(2, 1.6, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.minDistance = 0.5;
  controls.maxDistance = 20;

  // three-point lighting, tuned to the yellow/cyan accent palette
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 4);
  const fill = new THREE.DirectionalLight(0x2fe0e0, 0.55);
  fill.position.set(-5, 2, -3);
  const rim = new THREE.DirectionalLight(0xf5ff00, 0.5);
  rim.position.set(0, -3, -5);
  const hemi = new THREE.HemisphereLight(0x8899aa, 0x0a0a0a, 0.6);
  scene.add(key, fill, rim, hemi);

  // subtle ground grid
  const grid = new THREE.GridHelper(20, 40, 0x2b2c30, 0x1a1b1e);
  grid.position.y = -1.001;
  scene.add(grid);

  let root = new THREE.Group();
  scene.add(root);

  function resize() {
    const w = canvasWrap.clientWidth;
    const h = canvasWrap.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvasWrap);
  resize();

  function onModelReady(object) {
    root.add(object);
    frameObject(object, camera, controls);
    const stats = collectStats(object);
    statsEl.innerHTML =
      `Objects <b>${stats.objects}</b><br>` +
      `Vertices <b>${stats.vertices}</b><br>` +
      `Edges <b>${stats.edges}</b><br>` +
      `Faces <b>${stats.faces}</b><br>` +
      `Triangles <b>${stats.triangles}</b>`;
    loadingEl.style.display = "none";
  }

  if (modelCfg.file) {
    const loader = new GLTFLoader();
    loader.load(
      modelCfg.file,
      (gltf) => onModelReady(gltf.scene),
      undefined,
      () => {
        // file missing/failed to load -> fall back to demo mesh so the
        // card still shows something instead of breaking
        loadingEl.textContent = "model not found — showing placeholder";
        onModelReady(buildDemoMesh());
      }
    );
  } else {
    onModelReady(buildDemoMesh());
  }

  const inst = { scene, camera, renderer, controls, root, canvasWrap };
  instances.push(inst);

  // shading toggle
  const btnMaterial = cardEl.querySelector('[data-shade="material"]');
  const btnTopo = cardEl.querySelector('[data-shade="topology"]');
  btnMaterial.addEventListener("click", () => {
    if (btnMaterial.classList.contains("active")) return;
    applyMaterialShading(root);
    btnMaterial.classList.add("active");
    btnTopo.classList.remove("active");
    window.SFX && SFX.toggle();
  });
  btnTopo.addEventListener("click", () => {
    if (btnTopo.classList.contains("active")) return;
    applyTopologyMaterial(root);
    btnTopo.classList.add("active");
    btnMaterial.classList.remove("active");
    window.SFX && SFX.toggle();
  });

  // pause auto-rotate while the user is dragging
  controls.addEventListener("start", () => (controls.autoRotate = false));
  controls.addEventListener("end", () => {
    setTimeout(() => (controls.autoRotate = true), 4000);
  });
}

function cardTemplate(modelCfg) {
  return `
    <article class="vp-card reveal" data-id="${modelCfg.id}">
      <div class="vp-toolbar">
        <div class="vp-toolbar-left"><span class="dot"></span> ${modelCfg.title}</div>
        <div class="vp-shade-toggle">
          <button class="vp-shade-btn active" data-shade="material">Material</button>
          <button class="vp-shade-btn" data-shade="topology">Topology</button>
        </div>
      </div>
      <div class="vp-canvas-wrap">
        <div class="vp-loading">loading mesh…</div>
        <div class="vp-stats"></div>
        <div class="vp-hint">drag to orbit · scroll to zoom</div>
      </div>
      <div class="vp-info">
        <h3>${modelCfg.title}</h3>
        <p>${modelCfg.description || ""}</p>
      </div>
    </article>
  `;
}

function initViewports() {
  const grid = document.getElementById("viewport-grid");
  if (!grid || typeof MODELS === "undefined") return;
  grid.innerHTML = MODELS.map(cardTemplate).join("");
  MODELS.forEach((cfg) => {
    const card = grid.querySelector(`[data-id="${cfg.id}"]`);
    createViewport(card, cfg);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    instances.forEach((inst) => {
      inst.controls.update();
      inst.renderer.render(inst.scene, inst.camera);
    });
  }
  animate();

  // reveal-on-scroll for viewport cards
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".vp-card.reveal").forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", initViewports);

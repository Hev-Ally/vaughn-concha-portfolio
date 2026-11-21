import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const models = [
  {
    name: 'Basketball jersey',
    type: 'APPAREL / CUSTOM SUBLIMATION',
    modelUrl: './assets/jersey.glb',
    textureUrl: './assets/jersey-texture.png',
    project: 'Basketball jersey',
    format: 'Interactive 3D',
    design: 'Custom sublimation',
    artist: 'Vaughn Concha',
    credit: {
      artist: 'Sev',
      artistUrl: 'https://sketchfab.com/sevclothing',
      license: 'CC BY 4.0',
      modelUrl: 'https://sketchfab.com/3d-models/basketball-jersey-3ee634a324d5400ab84555b0636416f6',
    },
  },
];

const viewer = document.querySelector('#viewer');
const loading = document.querySelector('#loading');
const rotateButton = document.querySelector('#rotateButton');
const resetButton = document.querySelector('#resetButton');
const previousButton = document.querySelector('#previousModel');
const nextButton = document.querySelector('#nextModel');
const modelTrack = document.querySelector('#modelTrack');
const modelCount = document.querySelector('#modelCount');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, viewer.clientWidth / viewer.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (error) {
  console.error('Unable to initialize the 3D viewer:', error);
  loading.classList.add('error');
  loading.textContent = '3D preview is unavailable in this browser. You can still browse the rest of the portfolio.';
}

let controls;
let activeModel = null;
let activeModelIndex = 0;
let loadSequence = 0;
let loadingModel = false;
let rotating = !prefersReducedMotion;

function updateModelDetails(model) {
  const detailValues = [model.project, model.format, model.design, model.artist];
  document.querySelectorAll('.model-details strong').forEach((detail, index) => {
    detail.textContent = detailValues[index];
  });

  const credit = document.querySelector('#modelCredit');
  credit.replaceChildren(document.createTextNode('3D model by '));

  const artistLink = document.createElement('a');
  artistLink.href = model.credit.artistUrl;
  artistLink.target = '_blank';
  artistLink.rel = 'noopener noreferrer';
  artistLink.textContent = model.credit.artist;

  const modelLink = document.createElement('a');
  modelLink.href = model.credit.modelUrl;
  modelLink.target = '_blank';
  modelLink.rel = 'noopener noreferrer';
  modelLink.textContent = 'View original model';

  credit.append(artistLink, document.createTextNode(` / ${model.credit.license} · `), modelLink);
}

function renderModelCards() {
  modelTrack.replaceChildren();

  models.forEach((model, index) => {
    const card = document.createElement('button');
    card.className = 'model-card';
    card.type = 'button';
    card.setAttribute('aria-pressed', String(index === activeModelIndex));
    card.setAttribute('aria-label', `Show ${model.name}`);
    card.addEventListener('click', () => selectModel(index));

    const preview = document.createElement('span');
    preview.className = 'model-card-preview';
    preview.setAttribute('aria-hidden', 'true');
    preview.textContent = String(index + 1).padStart(2, '0');

    const copy = document.createElement('span');
    copy.className = 'model-card-copy';

    const name = document.createElement('span');
    name.className = 'model-card-name';
    name.textContent = model.name;

    const type = document.createElement('span');
    type.className = 'model-card-type';
    type.textContent = model.type;

    copy.append(name, type);
    card.append(preview, copy);
    modelTrack.append(card);
  });

  modelCount.textContent = `${String(activeModelIndex + 1).padStart(2, '0')} / ${String(models.length).padStart(2, '0')}`;
  previousButton.disabled = models.length < 2;
  nextButton.disabled = models.length < 2;
}

function disposeModel(model, extraTexture) {
  const textures = new Set();
  if (extraTexture) textures.add(extraTexture);

  model.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && value.isTexture) textures.add(value);
      });
      material.dispose();
    });
  });

  textures.forEach((texture) => texture.dispose());
}

function resetView() {
  camera.position.set(0, 0, 5);
  controls.target.set(0, 0, 0);
  controls.update();
  if (activeModel) activeModel.rotation.set(0, 0, 0);
}

async function loadSelectedModel(index) {
  const sequence = ++loadSequence;
  const model = models[index];
  loadingModel = true;
  loading.classList.remove('error');
  loading.textContent = `LOADING ${model.name.toUpperCase()}...`;
  loading.hidden = false;
  updateModelDetails(model);

  if (activeModel) {
    scene.remove(activeModel);
    disposeModel(activeModel);
    activeModel = null;
  }

  try {
    const [gltf, texture] = await Promise.all([
      new GLTFLoader().loadAsync(model.modelUrl),
      new THREE.TextureLoader().loadAsync(model.textureUrl),
    ]);

    if (sequence !== loadSequence) {
      disposeModel(gltf.scene, texture);
      return;
    }

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    const loadedModel = gltf.scene;
    loadedModel.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if ('map' in material) {
          material.map = texture;
          material.needsUpdate = true;
        }
      });
    });

    const bounds = new THREE.Box3().setFromObject(loadedModel);
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 2.5 / Math.max(size.x, size.y, size.z);
    loadedModel.scale.setScalar(scale);

    const scaledBounds = new THREE.Box3().setFromObject(loadedModel);
    loadedModel.position.sub(scaledBounds.getCenter(new THREE.Vector3()));
    activeModel = loadedModel;
    scene.add(activeModel);
    resetView();
    loadingModel = false;
    loading.hidden = true;
  } catch (error) {
    if (sequence !== loadSequence) return;
    loadingModel = false;
    console.error(`Unable to load 3D model "${model.name}":`, error);
    loading.classList.add('error');
    loading.textContent = `Unable to load ${model.name}. Check that its model and texture files are available in assets/.`;
  }
}

function selectModel(index) {
  if (index < 0 || index >= models.length) return;
  const changed = index !== activeModelIndex;
  activeModelIndex = index;
  renderModelCards();
  const selectedCard = modelTrack.children[index];
  selectedCard.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
  if (!changed && (activeModel || loadingModel)) return;
  loadSelectedModel(index);
}

function stepModel(direction) {
  selectModel((activeModelIndex + direction + models.length) % models.length);
}

renderModelCards();
previousButton.addEventListener('click', () => stepModel(-1));
nextButton.addEventListener('click', () => stepModel(1));

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D model preview');
  viewer.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.autoRotate = rotating;
  controls.autoRotateSpeed = 1.5;
  controls.minDistance = 2;
  controls.maxDistance = 9;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x9dbdff, 1.5);
  fillLight.position.set(-5, 2, -4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 2);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  rotateButton.setAttribute('aria-pressed', String(rotating));
  rotateButton.textContent = rotating ? 'Pause rotation' : 'Start rotation';

  rotateButton.addEventListener('click', () => {
    rotating = !rotating;
    controls.autoRotate = rotating;
    rotateButton.setAttribute('aria-pressed', String(rotating));
    rotateButton.textContent = rotating ? 'Pause rotation' : 'Start rotation';
  });

  resetButton.addEventListener('click', resetView);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function resizeViewer() {
    const width = viewer.clientWidth;
    const height = viewer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', resizeViewer);
  animate();
  loadSelectedModel(activeModelIndex);
}

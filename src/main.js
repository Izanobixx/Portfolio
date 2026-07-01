import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WindowManager } from './WindowManager';
import { ComputerWindow } from './windows/ComputerWindow';
import { DustSystem } from './systems/DustSystem';
import { InteractionManager } from './InteractionManager';
import { DialogueManager } from './DialogueManager';
import { ChatWindow } from './windows/ChatWindow';
import { PlayerController } from './PlayerController';
import { preloadImagesLowRes, loadFullResImages } from './utils/ImageLoader.js';

// --------------------
// LOADING SCREEN
// --------------------
const loadingScreen = document.getElementById("loading");
console.log("loadingScreen:", loadingScreen);

// --------------------
// SCENE
// --------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const clock = new THREE.Clock();

// --------------------
// CAMERA
// --------------------
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5);
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// --------------------
// RENDERER
// --------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.cssText = 'position:fixed; top:0; left:0; z-index:1;';
document.body.appendChild(renderer.domElement);

// --------------------
// LIGHTS
// --------------------
scene.add(new THREE.AmbientLight(0xfff3da, 0.8));
scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1));

// --------------------
// DUST
// --------------------
const dust = new DustSystem(scene); // Si quieres pasar el manager, hazlo aquí

// --------------------
// CARGAR LISTA DE IMÁGENES (ASÍNCRONA)
// --------------------
async function getAllImageUrls() {
    const urls = new Set();

    // Imágenes fijas (rutas relativas a public/)
    const fixedImages = [
        'images/portada2.png',
        'images/contraPortada.PNG',
        'images/RightPage.PNG',
        'images/LeftPage.PNG',
        'images/micalet.jpg',
        'images/bajo.png',
        'images/logos/reaper.png',
        'images/logos/musescore.png',
        'images/logos/cakewalk.png',
        'images/logos/supercollider.png',
        'textures/corcho.png',
        'textures/wood.png',
    ];
    fixedImages.forEach(url => urls.add(url));

    // Screenshots de juegos (desde gamesData)
    try {
        const module = await import('./windows/data/gamesData.js');
        module.gamesData.forEach(game => {
            if (game.screenshots) {
                game.screenshots.forEach(url => urls.add(url)); // ya deben ser relativas
            }
        });
    } catch (e) {
        console.warn('No se pudo cargar gamesData para las imágenes:', e);
    }

    //Imagenes de FE
    try {
        const filesRes = await fetch(import.meta.env.BASE_URL + 'files.json');
        console.log("LOADING IMAGES!!!!!!!!!!!!!!!!!!");
        if (filesRes.ok) {
            const filesTree = await filesRes.json();
            // Función recursiva para extraer imágenes
            const collectImageUrls = (node) => {
                if (node.type === 'image' && node.url) {
                    console.log("IMAGE URL: " + node.url);
                    // node.url empieza con '/computer/...' (relativo a public/)
                    urls.add(node.url);
                }
                if (node.children) {
                    node.children.forEach(child => collectImageUrls(child));
                }
            };
            collectImageUrls(filesTree);
        } else {
            console.warn('No se pudo cargar files.json');
        }
    } catch (e) {
        console.warn('Error al cargar files.json:', e);
    }

    // Aplicar BASE_URL a todas las rutas
    return [...urls].map(url => import.meta.env.BASE_URL + url);
}

// --------------------
// OBTENER URLS Y PRECARGAR
// --------------------
let imagesLowResReady = false;
let modelLoaded = false;
let texturesLoaded = false;

// 1. Cargar las URLs (esperar a que estén listas)
const imageUrls = await getAllImageUrls();

// 2. Precargar versión low-res de todas las imágenes
await preloadImagesLowRes(imageUrls);
imagesLowResReady = true;
console.log('Low-res images ready');

// --------------------
// LOADING MANAGER (PARA THREE.JS)
// --------------------
const manager = new THREE.LoadingManager();
manager.onLoad = () => {
    texturesLoaded = true;
    checkAllLoaded();
};
manager.onProgress = (url, loaded, total) => {
    console.log(`${loaded}/${total} – ${url}`);
};
manager.onError = (url) => {
    console.error(`Error cargando: ${url}`);
};

// --------------------
// LOADER CON MANAGER
// --------------------
const loader = new GLTFLoader(manager);
console.log("starting model load");

let fan, pendulum;
let izanController = null;
const clickableObjects = [];
const goPositions = {};

loader.load(
    import.meta.env.BASE_URL + 'models/room.glb',
    (gltf) => {
        console.log("model loaded");

        const model = gltf.scene;

        model.traverse((child) => {
            if (child.name === "Fan") fan = child;
            if (child.name === "Pendulum") pendulum = child;

            if (child.name && child.name.startsWith('GO_')) {
                goPositions[child.name] = child.position.clone();
            }

            if (child.isMesh) {
                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
                child.updateMatrixWorld(true);

                if (child.name.includes("Computer") || child.name.includes("Keyboard") ||
                    child.name.includes("Bed") || child.name.includes("Shelf") ||
                    child.name.includes("Games") || child.name.includes("Corcho")) {
                    clickableObjects.push(child);
                }

                const mat = child.material;
                if (mat) {
                    child.material = new THREE.MeshStandardMaterial({ map: mat.map });
                    if (child.name.includes("Emissive")) {
                        child.material.emissive = new THREE.Color(0xDF5D09);
                        child.material.emissiveIntensity = 100;
                    }
                    if (child.name.includes("EmissiveGreen")) {
                        child.material.emissive = new THREE.Color(0x11ff11);
                        child.material.emissiveIntensity = 50;
                    }
                    if (mat.map && mat.map.image) {
                        child.material.transparent = true;
                        child.material.alphaTest = 0.75;
                        child.material.needsUpdate = true;
                        if (child.material.transparent) child.material.side = THREE.DoubleSide;
                    }
                }
            }
        });

        let izanRoot = null, izanMesh = null;
        model.traverse((child) => {
            if ((child.type === 'Armature' || child.type === 'Group' || child.type === 'Object3D') && child.name === 'Izan') {
                izanRoot = child;
            }
        });
        if (izanRoot && !izanMesh) {
            izanRoot.traverse((c) => {
                if (c.isSkinnedMesh && !izanMesh) izanMesh = c;
            });
        }
        if (izanRoot && izanMesh) {
            const mixer = new THREE.AnimationMixer(izanRoot);
            const clips = gltf.animations;
            izanController = new PlayerController(izanRoot, mixer, clips, goPositions);
        }

        model.position.set(0, 0, 0);
        model.scale.set(0.6, 0.6, 0.6);
        model.rotation.y = 3 * Math.PI / 2;
        scene.add(model);

        modelLoaded = true;
        checkAllLoaded();

        // Inicializar gestores
        const windowManager = new WindowManager();
        const interactionManager = new InteractionManager(camera, renderer, clickableObjects, windowManager, izanController);
        window.interactionManager = interactionManager;
    },
    undefined,
    (error) => console.error("model loading error:", error)
);

// --------------------
// CONTROL DE CARGA COMPLETA
// --------------------
function checkAllLoaded() {
    if (modelLoaded && texturesLoaded && imagesLowResReady) {
        loadFullResImages(imageUrls);
        finishLoading();
    }
}

// --------------------
// FINALIZAR LOADING SCREEN
// --------------------
async function finishLoading() {
    console.log("finishing loading sequence");
    await wait(500);
    loadingScreen.classList.add("open");
    console.log("opening doors");
    await wait(1600);
    loadingScreen.remove();

    window.dialogueManager.show([
        { speaker: 'IZAN', text: 'Bua, qué desordenada tengo la habitación. Todo lleno de trastos, el ordenador, mis instrumentos... ' },
        { speaker: 'IZAN', text: 'Mientras me pongo a ordenar, voy a rebuscar un poco entre mis cosas. Igual encuentro algo interesante.' }
    ]);
    console.log("loading screen removed");
}

// --------------------
// UTILITY
// --------------------
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------
// RESIZE
// --------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 + 1;
});

// --------------------
// RENDER LOOP
// --------------------
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (izanController) izanController.update(delta);
    dust.update();

    targetX = -mouseX * 0.15;
    targetY = -mouseY * 0.1;
    camera.rotation.y += (targetX - camera.rotation.y) * 0.03;
    camera.rotation.x += (targetY - camera.rotation.x) * 0.03;

    if (fan) fan.rotation.y += 0.05 * delta * 60;
    if (pendulum) pendulum.rotation.x = Math.sin(clock.getElapsedTime() * 2) * 0.1;

    renderer.render(scene, camera);
}
animate();

// --------------------
// DIALOGUE MANAGER
// --------------------
window.dialogueManager = new DialogueManager();

// --------------------
// SUBWAY SURFERS (CÓDIGO EXISTENTE, SIN CAMBIOS)
// --------------------
const subwayWindow = document.getElementById('subway-window');
const subwayTitlebar = document.getElementById('subway-titlebar');
const subwayIframe = document.getElementById('subway-iframe');
const resizeHandle = document.getElementById('subway-resize-handle');

let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
let isResizing = false, resizeStartX = 0, resizeStartY = 0, resizeStartWidth = 0, resizeStartHeight = 0;

let posX = window.innerWidth - 420;
let posY = window.innerHeight - 290;
subwayWindow.style.left = Math.max(0, posX) + 'px';
subwayWindow.style.top = Math.max(0, posY) + 'px';

document.getElementById('bored-button').addEventListener('click', () => {
    const windowEl = document.getElementById('subway-window');
    const iframe = document.getElementById('subway-iframe');
    windowEl.style.display = 'block';
    const videoId = 'iKggOfcKM28';
    const timestamp = new Date().getTime();
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&t=${timestamp}`;
    if (parseInt(windowEl.style.left) + windowEl.offsetWidth > window.innerWidth ||
        parseInt(windowEl.style.top) + windowEl.offsetHeight > window.innerHeight) {
        windowEl.style.left = (window.innerWidth - 350) + 'px';
        windowEl.style.top = (window.innerHeight - 250) + 'px';
    }
});

document.getElementById('close-subway').addEventListener('click', () => {
    const windowEl = document.getElementById('subway-window');
    const iframe = document.getElementById('subway-iframe');
    windowEl.style.display = 'none';
    iframe.src = '';
});

subwayTitlebar.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    dragOffsetX = e.clientX - subwayWindow.offsetLeft;
    dragOffsetY = e.clientY - subwayWindow.offsetTop;
    subwayTitlebar.style.cursor = 'grabbing';
    e.preventDefault();
});

document.addEventListener('pointermove', (e) => {
    if (isDragging) {
        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;
        newX = Math.max(0, Math.min(window.innerWidth - subwayWindow.offsetWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight - subwayWindow.offsetHeight, newY));
        subwayWindow.style.left = newX + 'px';
        subwayWindow.style.top = newY + 'px';
    }
    if (isResizing) {
        let newWidth = resizeStartWidth + (e.clientX - resizeStartX);
        let newHeight = resizeStartHeight + (e.clientY - resizeStartY);
        const aspectRatio = 16 / 9;
        if (newWidth / newHeight > aspectRatio) newWidth = newHeight * aspectRatio;
        else newHeight = newWidth / aspectRatio;
        newWidth = Math.max(250, Math.min(window.innerWidth - parseInt(subwayWindow.style.left), newWidth));
        newHeight = Math.max(180, Math.min(window.innerHeight - parseInt(subwayWindow.style.top), newHeight));
        subwayWindow.style.width = newWidth + 'px';
        subwayWindow.style.height = (newHeight + 28) + 'px';
    }
});

document.addEventListener('pointerup', () => {
    if (isDragging) {
        isDragging = false;
        subwayTitlebar.style.cursor = 'grab';
    }
    if (isResizing) {
        isResizing = false;
        resizeHandle.style.cursor = 'nwse-resize';
    }
});

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = subwayWindow.offsetWidth;
    resizeStartHeight = subwayWindow.offsetHeight - 28;
    e.preventDefault();
    resizeHandle.style.cursor = 'grabbing';
});

window.addEventListener('resize', () => {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const winLeft = parseInt(subwayWindow.style.left) || 0;
    const winTop = parseInt(subwayWindow.style.top) || 0;
    const winW = subwayWindow.offsetWidth;
    const winH = subwayWindow.offsetHeight;
    if (winLeft + winW > winWidth) subwayWindow.style.left = Math.max(0, winWidth - winW) + 'px';
    if (winTop + winH > winHeight) subwayWindow.style.top = Math.max(0, winHeight - winH) + 'px';
});
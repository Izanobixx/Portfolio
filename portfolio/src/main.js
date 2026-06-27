import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WindowManager } from './WindowManager';
import { ComputerWindow } from './windows/ComputerWindow';
import { DustSystem } from './systems/DustSystem';
import { InteractionManager } from './InteractionManager';
import { DialogueManager } from './DialogueManager';

console.log("main.js loaded");

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

// --------------------
// CAMERA
// --------------------
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.6, 5);
let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

// --------------------
// RENDERER
// --------------------
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

// ensure canvas is behind UI overlays
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "1";

document.body.appendChild(renderer.domElement);

// --------------------
// LIGHTS
// --------------------
const light = new THREE.AmbientLight(0xfff3da, 0.8);
scene.add(light);

const hemiLight = new THREE.HemisphereLight(
    0xffffff, // cielo
    0x222222, // suelo/sombra
    1
);
scene.add(hemiLight);

// --------------------
// DUST
// --------------------
const dust = new DustSystem(scene);


// --------------------
// LOADER
// --------------------
const loader = new GLTFLoader();

console.log("starting model load");

let modelLoaded = false;
let minTimePassed = false;

// --------------------
// LOAD MODEL
// --------------------
let fan;
const clickableObjects = [];

loader.load(
    '/models/room.glb',

    function (gltf) {
        console.log("model loaded");

        const model = gltf.scene;

        model.traverse((child)=>{

            if (child.name == "Fan"){
                fan = child;
            }
            

            if (child.isMesh){

                //update bounding box manually to avoid fing collision erros
                child.geometry.computeBoundingBox();
                child.geometry.computeBoundingSphere();
                child.updateMatrixWorld(true);

                console.log("FOUND: " + child.name);
                if (child.name.includes("Computer") || child.name.includes("Keyboard") || child.name.includes("Bed") || child.name.includes("Shelf") || child.name.includes("Videogames") || child.name.includes("Corcho")){
                    
                    clickableObjects.push(child);
                } 

                child.material = new THREE.MeshStandardMaterial({map: child.material.map});

                const material = child.material;

                if (child.name.includes("Emissive"))
                {
                    child.material.emissive = new THREE.Color(0xDF5D09);
                    child.material.emissiveIntensity = 100;
                }
                if (child.name.includes("EmissiveGreen")){
                    child.material.emissive = new THREE.Color(0x11ff11);
                    child.material.emissiveIntensity = 50;
                }

                if (material.map && material.map.image){
                    material.transparent = true;
                    material.alphaTest = 0.75;
                    material.needsUpdate = true;
                    if (material.transparent){
                        material.side = THREE.DoubleSide;
                    }
                }
            }
        });

        model.position.set(0, 0, 0);
        model.scale.set(0.6, 0.6, 0.6);
        model.rotation.y = 3 * Math.PI / 2;

        scene.add(model);

        modelLoaded = true;
        tryFinishLoading();
    },

    undefined,

    function (error) {
        console.error("model loading error:", error);
    }
);

// --------------------
// LOADING CONTROL
// --------------------
function tryFinishLoading() {
    console.log("checking loading state");

    if (modelLoaded && minTimePassed) {
        finishLoading();
    }
}

// --------------------
// FINISH LOADING
// --------------------
async function finishLoading() {
    console.log("finishing loading sequence");

    await wait(500);

    loadingScreen.classList.add("open");

    console.log("opening doors");

    await wait(1600);

    loadingScreen.remove();

    console.log("loading screen removed");
}

// --------------------
// MINIMUM LOADING TIME
// --------------------
setTimeout(function () {
    console.log("minimum loading time reached");

    minTimePassed = true;
    tryFinishLoading();
}, 2000);

// --------------------
// WAIT UTILITY
// --------------------
function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

// --------------------
// RESIZE
// --------------------
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener(
    "mousemove",
    (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 + 1;
    }
);

// --------------------
// RENDER LOOP
// --------------------
function animate() {
    requestAnimationFrame(animate);

    dust.update();
    updateCameraRotAndPos();
    if (fan){
        fan.rotation.y += 0.05;
    }

    renderer.render(scene, camera);
}

function updateCameraRotAndPos(){
    targetX = -mouseX * 0.15;
    targetY = -mouseY * 0.1;

    camera.rotation.y += (targetX - camera.rotation.y) * 0.03;
    camera.rotation.x += (targetY - camera.rotation.x) * 0.03;
}

animate();

// --------------------
// COMPUTER WINDOWS
// --------------------

const windowManager = new WindowManager();
const interactionManager = new InteractionManager(camera, renderer, clickableObjects, windowManager);

// --------------------
// DIALOGUE MANAGER
// --------------------

window.dialogueManager = new DialogueManager();

setTimeout(() => {
    window.dialogueManager.show([
        { speaker: 'IZAN', text: 'Bienvenido a mi habitación. Siéntete como en casa. Aquí tengo mis trastos, el ordenador, algunos libros... cotillea lo que quieras.' },
        { speaker: 'IZAN', text: 'Si ves algo que te llame la atención, haz clic. Igual encuentras algo interesante.' }
    ]);
}, 5000);

// --------------------
// SUBWAY SURFERS
// --------------------

const subwayWindow = document.getElementById('subway-window');
const subwayTitlebar = document.getElementById('subway-titlebar');
const subwayIframe = document.getElementById('subway-iframe');
const subwayContainer = document.getElementById('subway-video-container');
const resizeHandle = document.getElementById('subway-resize-handle');

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isResizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;

// Posición inicial (esquina inferior derecha)
let posX = window.innerWidth - 420;
let posY = window.innerHeight - 290;

subwayWindow.style.left = Math.max(0, posX) + 'px';
subwayWindow.style.top = Math.max(0, posY) + 'px';

// ----- ABRIR VENTANA (desde el botón) -----
document.getElementById('bored-button').addEventListener('click', () => {
    const windowEl = document.getElementById('subway-window');
    const iframe = document.getElementById('subway-iframe');
    
    // Mostrar ventana
    windowEl.style.display = 'block';
    
    // Asignar src con autoplay y timestamp para evitar caché
    const videoId = 'iKggOfcKM28';
    const timestamp = new Date().getTime();
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&t=${timestamp}`;
    
    // Asegurar posición visible
    if (parseInt(windowEl.style.left) + windowEl.offsetWidth > window.innerWidth ||
        parseInt(windowEl.style.top) + windowEl.offsetHeight > window.innerHeight) {
        windowEl.style.left = (window.innerWidth - 350) + 'px';
        windowEl.style.top = (window.innerHeight - 250) + 'px';
    }
});

// ----- CERRAR VENTANA -----
document.getElementById('close-subway').addEventListener('click', () => {
    const windowEl = document.getElementById('subway-window');
    const iframe = document.getElementById('subway-iframe');
    
    // Ocultar ventana
    windowEl.style.display = 'none';
    
    // Vaciar el src para detener el video y liberar recursos
    iframe.src = '';
});

// ----- ARRASTRE (desde la barra de título) -----
subwayTitlebar.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return; // No arrastrar si se hace clic en un botón
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
        // Evitar que se salga de la pantalla
        newX = Math.max(0, Math.min(window.innerWidth - subwayWindow.offsetWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight - subwayWindow.offsetHeight, newY));
        subwayWindow.style.left = newX + 'px';
        subwayWindow.style.top = newY + 'px';
    }

    if (isResizing) {
        let newWidth = resizeStartWidth + (e.clientX - resizeStartX);
        let newHeight = resizeStartHeight + (e.clientY - resizeStartY);
        // Mantener aspect ratio 16:9
        const aspectRatio = 16 / 9;
        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }
        // Límites
        newWidth = Math.max(250, Math.min(window.innerWidth - parseInt(subwayWindow.style.left), newWidth));
        newHeight = Math.max(180, Math.min(window.innerHeight - parseInt(subwayWindow.style.top), newHeight));
        subwayWindow.style.width = newWidth + 'px';
        subwayWindow.style.height = (newHeight + 28) + 'px'; // incluye la altura de la barra de título
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

// ----- REESCALADO (desde la esquina inferior derecha) -----
resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartWidth = subwayWindow.offsetWidth;
    resizeStartHeight = subwayWindow.offsetHeight - 28; // altura del video sin la barra
    e.preventDefault();
    resizeHandle.style.cursor = 'grabbing';
});

// Actualizar la posición si la ventana se redimensiona
window.addEventListener('resize', () => {
    // Asegurar que la ventana no quede fuera de la pantalla
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const winLeft = parseInt(subwayWindow.style.left) || 0;
    const winTop = parseInt(subwayWindow.style.top) || 0;
    const winW = subwayWindow.offsetWidth;
    const winH = subwayWindow.offsetHeight;
    if (winLeft + winW > winWidth) {
        subwayWindow.style.left = Math.max(0, winWidth - winW) + 'px';
    }
    if (winTop + winH > winHeight) {
        subwayWindow.style.top = Math.max(0, winHeight - winH) + 'px';
    }
});
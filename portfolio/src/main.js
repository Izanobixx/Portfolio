import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { WindowManager } from './WindowManager';
import { ComputerWindow } from './windows/ComputerWindow';
import { DustSystem } from './systems/DustSystem';
import { InteractionManager } from './InteractionManager';

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1));

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

                if (child.name.includes("Computer") || child.name.includes("Keyboard") || child.name.includes("Bed") || child.name.includes("Shelf") || child.name.includes("Videogames")){
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
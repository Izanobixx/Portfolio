import * as THREE from "three";
import { ComputerWindow } from "./windows/ComputerWindow";

export class InteractionManager{

    constructor(camera, renderer, objects, windowManager){
        this.camera = camera;
        this.renderer = renderer;
        this.objects = objects;
        this.windowManager = windowManager;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init(){
        this.renderer.domElement.addEventListener("click", (event) => {this.onClick(event);});
    }

    onClick(event){
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = (event.clientY / window.innerHeight) * 2 - 1;

        this.raycaster.setFromCamera(this.mouse,this.camera);

        const hits = this.raycaster.intersectObjects(this.objects,true);

        if (hits.length == 0) return;

        const object = hits[0].object;

        console.log("SNIPED:",object.name);

        this.handleObject(object,event);
    }

    handleObject(object,event){
        if(object.name.includes("Computer")){
            this.windowManager.createWindow(ComputerWindow,{title:"Computer.exe",width:700,height:400, originX:event.clientX, originY:event.clientY});
        }
    }

}
import * as THREE from "three";
import { ComputerWindow } from "./windows/ComputerWindow";
import { CorkBoardWindow } from "./windows/CorkBoardWindow.js";
import { EmbedWindow } from "./windows/EmbedWindow.js";
import { ChatWindow } from "./windows/ChatWindow.js";

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
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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
        if (object.name.includes('Corcho')) {
            import('./windows/CorkBoardWindow.js').then(module => {
                const CorkBoardWindow = module.CorkBoardWindow;
                const corkWin = this.windowManager.createWindow(CorkBoardWindow, {
                    title: 'Corcho.exe',
                    width: 700,
                    height: 450,
                    x: window.innerWidth / 2 - 650,
                    y: window.innerHeight / 2 - 225,
                    originX: event.clientX,
                    originY: event.clientY
                });
                import('./windows/PostItCreatorWindow.js').then(module2 => {
                    const PostItCreatorWindow = module2.PostItCreatorWindow;
                    this.windowManager.createWindow(PostItCreatorWindow, {
                        title: 'Nueva_nota.exe',
                        width: 400,
                        height: 450,
                        x: window.innerWidth / 2 + 150,
                        y: window.innerHeight / 2 - 225,
                        originX: event.clientX,
                        originY: event.clientY,
                        corchoWindow: corkWin
                    });
                });
            });
        }
        if (object.name.includes('Keyboard')){
            //const embedCode = `<iframe id="score-iframe" width="100%" height="100%" src="https://musescore.com/user/29082442/scores/24891487/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe>`
            //this.windowManager.createWindow(EmbedWindow, {title: 'Euforia.msc', width:700, height:500, x: event.clientX, y: event.clientY, originX: event.clientX, originY: event.clientY, embedCode: embedCode});
        
            import('./windows/MusicBookWindow.js').then(module => {
                const MusicBookWindow = module.MusicBookWindow;
                this.windowManager.createWindow(MusicBookWindow, {
                    title: 'Libro de Música.exe',
                    width: window.innerWidth,
                    height: window.innerHeight,
                    x: 0,
                    y: 0,
                    originX: 0,
                    originY: 0
                });
            });
        }
    }

}
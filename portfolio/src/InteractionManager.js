import * as THREE from "three";
import { ComputerWindow } from "./windows/ComputerWindow";
import { CorkBoardWindow } from "./windows/CorkBoardWindow.js";
import { EmbedWindow } from "./windows/EmbedWindow.js";
import { ChatWindow } from "./windows/ChatWindow.js";
import { PostItCreatorWindow } from "./windows/PostItCreatorWindow.js";
import { MusicBookWindow } from "./windows/MusicBookWindow.js";
import { GameWindow } from "./windows/GameWindow.js";

export class InteractionManager{

    constructor(camera, renderer, objects, windowManager, izanController){
        this.camera = camera;
        this.renderer = renderer;
        this.objects = objects;
        this.windowManager = windowManager;
        this.izanController = izanController;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();

        //this.openChatForDebug();
    }

    openChatForDebug() {
        console.log('Abriendo chat para debug');
        const width = 800;
        const height = 500;
        const x = window.innerWidth / 2 - width / 2;
        const y = window.innerHeight / 2 - height / 2;
        this.windowManager.createWindow(ChatWindow, {
            title: "Comunicador.exe",
            width: width,
            height: height,
            x: x,
            y: y,
            originX: x,
            originY: y
        });
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
            /*if (this.izanController){
                this.izanController.moveToGO('GO_Computer', () => {
                    this.windowManager.createWindow(ComputerWindow,{title:"Computer.exe",width:700,height:400, x:window.innerWidth / 2 - 350, y:window.innerHeight / 2 - 200, originX:event.clientX, originY:event.clientY});
                });
            }
            else{*/
                this.windowManager.createWindow(ComputerWindow,{title:"Computer.exe",width:700,height:400, x:window.innerWidth / 2 - 350, y:window.innerHeight / 2 - 200, originX:event.clientX, originY:event.clientY});
            //}
        }
        if (object.name.includes('Corcho')) {
            if (this.izanController){
                this.izanController.moveToGO('GO_Corcho', () => {
                    const corkWin = this.windowManager.createWindow(CorkBoardWindow, {title: 'Corcho.exe',width: 700,height: 450,x: window.innerWidth / 2 - 650,y: window.innerHeight / 2 - 225,originX: event.clientX,originY: event.clientY});
                    this.windowManager.createWindow(PostItCreatorWindow, {title: 'Nueva_nota.exe',width: 400,height: 450,x: window.innerWidth / 2 + 150,y: window.innerHeight / 2 - 225,originX: event.clientX,originY: event.clientY,corchoWindow: corkWin});
                });
            }
            else{
                const corkWin = this.windowManager.createWindow(CorkBoardWindow, {title: 'Corcho.exe',width: 700,height: 450,x: window.innerWidth / 2 - 650,y: window.innerHeight / 2 - 225,originX: event.clientX,originY: event.clientY});
            this.windowManager.createWindow(PostItCreatorWindow, {title: 'Nueva_nota.exe',width: 400,height: 450,x: window.innerWidth / 2 + 150,y: window.innerHeight / 2 - 225,originX: event.clientX,originY: event.clientY,corchoWindow: corkWin});
            }
        }
        if (object.name.includes('Keyboard')){
            
            if (this.izanController){
                this.izanController.moveToGO('GO_Keyboard', () => {
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
            else{
                this.windowManager.createWindow(MusicBookWindow, {
                    title: 'Libro de Música.exe',
                    width: window.innerWidth,
                    height: window.innerHeight,
                    x: 0,
                    y: 0,
                    originX: 0,
                    originY: 0
                });
            }
        }
        if (object.name.includes('Games')){
            let gameWin = null;
            /*if (this.izanController){
                this.izanController.moveToGO('GO_Games', () => {
                    gameWin = this.windowManager.createWindow(GameWindow, {
                        title: 'Game_child.exe',
                        width: 500,
                        height: 800,
                        x: window.innerWidth / 2 - 250,
                        y: window.innerHeight / 2 - 400,
                        originX: event.clientX,
                        originY: event.clientY
                    });
                });
            }
            else{*/
                gameWin = this.windowManager.createWindow(GameWindow, {
                    title: 'Game_child.exe',
                    width: 500,
                    height: 800,
                    x: window.innerWidth / 2 - 250,
                    y: window.innerHeight / 2 - 400,
                    originX: event.clientX,
                    originY: event.clientY
                });
            //}
            if (gameWin){
                window.gameWindowInstance = gameWin;
            }
        }
        if (object.name.includes('Shelf')){
            if (this.izanController){
                this.izanController.moveToGO('GO_Shelf', () => {
                    this.windowManager.createWindow(ComputerWindow,{title:"Computer.exe",width:700,height:400, originX:event.clientX, originY:event.clientY});
                });
            }
        }
        if (object.name.includes('Bed')){
            if (this.izanController){
                this.izanController.moveToGO('GO_Bed', () => {
                    this.windowManager.createWindow(ComputerWindow,{title:"Computer.exe",width:700,height:400, originX:event.clientX, originY:event.clientY});
                });
            }
        }
    }

}
import { Window } from "./windows/Window";

export class WindowManager{

    constructor(){
        this.zIndex = 1;
        this.windows = [];
    }

    createWindow(type, options = {}){
        console.log("Creating window type: ", type);
        console.log("Options: ", options);
        console.log("please fucking work");
        
        const win = new type(this, options);

        if (!win || typeof win.open !== "function") {
            console.error("Invalid window instance:", win);
            return;
        }

        this.windows.push(win);
        win.open();

        return win;
    }

    bringToFront(win){
        win.element.style.zIndex = ++this.zIndex;
    }
}
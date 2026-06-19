import { Window } from "./windows/Window";

export class WindowManager{

    constructor(){
        this.zIndex = 1;
        this.windows = [];
    }

    createWindow(type, options){
        const win = new type(this,options);

        this.windows.push(win);

        win.open();
        return win;
    }

    bringToFront(win){
        win.element.style.zIndex = ++this.zIndex;
    }
}
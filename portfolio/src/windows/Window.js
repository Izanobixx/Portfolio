export class Window{

    constructor(manager, options){
        this.manager = manager

        this.title = options.title || "Window";
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.x = options.x || 100;
        this.y = options.y || 100;

        this.isMaximized = false;

        this.create();
        this.initEvents();
    }

    create(){
        this.element = document.createElement("div");

        this.element.className = "xp-window";

        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";
        this.element.style.left = this.x + "px";
        this.element.style.top = this.y + "px";

        this.element.innerHTML = `
            <div class="xp-titlebar">
                <div class="xp-title">${this.title}</div>

                <div class="xp-controls">
                    <button class="min">_</button>
                    <button class="max">□</button>
                    <button class="close">X</button>
                </div>
            </div>

            <div class="xp-content"></div>

            <div class="resize-handle resize-right"></div>
            <div class="resize-handle resize-bottom"></div>
            <div class="resize-handle resize-corner"></div>
        `;

        document.getElementById("window-container")
            .appendChild(this.element);
        
        this.enableResize();
    }

    open(){
        this.element.style.display = "block";
        this.focus();
    }

    close(){
        this.element.remove();
    }

    focus(){
        this.element.style.zIndex = ++this.manager.zIndex;
    }

    enableResize() {

        const el = this.element;

        const right = el.querySelector(".resize-right");
        const bottom = el.querySelector(".resize-bottom");
        const corner = el.querySelector(".resize-corner");

        const startResizeHorizontal = (e) =>{
            startResize(e,'h');
        }
        const startResizeVertical = (e) =>{
            startResize(e,'v');
        }
        const startResizeAll = (e) =>{
            startResize(e,'a');
        }

        const startResize = (e,type) => {
            e.preventDefault();

            const startX = e.clientX;
            const startY = e.clientY;

            const startWidth = el.offsetWidth;
            const startHeight = el.offsetHeight;

            const onMove = (e) => {
                const newWidth = startWidth + (e.clientX - startX);
                const newHeight = startHeight + (e.clientY - startY);

                const snappedWidth = Math.round(newWidth / 10) * 10;
                const snappedHeight = Math.round(newHeight / 10) * 10;

                if (type == 'h' || type == 'a')
                    el.style.width = Math.max(200, snappedWidth) + "px";
                if (type == 'v' || type == 'a')
                    el.style.height = Math.max(150, snappedHeight) + "px";
            };

            const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        };

        console.log("resize-right:", right);
        console.log("resize-bottom:", bottom);
        console.log("resize-corner:", corner);
        right.addEventListener("mousedown", startResizeHorizontal); //horizontal
        bottom.addEventListener("mousedown", startResizeVertical); //vertical
        corner.addEventListener("mousedown", startResizeAll); //horizontal and vertical
    }

    initEvents(){
        this.element.addEventListener("mousedown", () => {this.manager.bringToFront(this);});
        this.element.querySelector(".close").onclick = () => {this.close();};
        this.element.querySelector(".max").onclick = () => {this.toggleMaximize();};
        this.element.querySelector(".min").onclick = () => {this.element.style.display = "none";};

        this.initDrag();
    }

    initDrag(){
        const bar = this.element.querySelector(".xp-titlebar");

        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;

        bar.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - this.element.offsetLeft;
            offsetY = e.clientY - this.element.offsetTop;

            this.manager.bringToFront(this);
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.element.style.left = (e.clientX - offsetX) + "px";
            this.element.style.top = (e.clientY - offsetY) + "px";
        });

        window.addEventListener("mouseup", () => {isDragging = false;});
    }

    toggleMaximize(){
        if (!this.isMaximized){
            this.prev = {
                x:this.element.offsetLeft,
                y:this.element.offsetTop,
                w:this.element.offsetWidth,
                h:this.element.offsetHeight
            };

            this.element.style.left = "0";
            this.element.style.top = "0";
            this.element.style.width = "100vw";
            this.element.style.height = "100vh";
        }
        else{
            if (!this.prev) return;
            this.element.style.left = this.prev.x + "px";
            this.element.style.top = this.prev.y + "px";
            this.element.style.width = this.prev.w + "px";
            this.element.style.height = this.prev.h + "px";
        }

        this.isMaximized = !this.isMaximized;
    }
}
export class Window {

    constructor(manager, options) {
        this.manager = manager;

        this.title = options.title || "Window";
        this.width = options.width || 400;
        this.height = options.height || 300;

        this.x = options.x ?? window.innerWidth / 2;
        this.y = options.y ?? window.innerHeight / 2;

        this.originX = options.originX ?? this.x;
        this.originY = options.originY ?? this.y;

        this.targetX = this.x;
        this.targetY = this.y;

        this.isMaximized = false;

        this.content = options.content || '';

        this.imagesData = options.imagesData || [];
        this.currentImageIndex = options.currentImageIndex || 0;

        this.create();
        this.initEvents();
    }

    create() {
        this.element = document.createElement("div");
        this.element.className = "xp-window";

        this.element.style.width = this.width + "px";
        this.element.style.height = this.height + "px";

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

        const contentEl = this.element.querySelector(".xp-content");
        if (this.content)
            contentEl.innerHTML = this.content;

        const el = this.element;

        // spawn at origin (click point)
        el.style.left = this.targetX + "px";
        el.style.top = this.targetY + "px";

        // displacement zoom pos
        const offsetX = this.originX - this.targetX;
        const offsetY = this.originY - this.targetY;

        //initial state
        el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.1)`;
        el.style.opacity = "0";

        document.getElementById("window-container").appendChild(el);

        void el.offsetHeight;

        el.style.transform = "translate(0, 0) scale(1)";
        el.style.opacity = "1";

        const onFinish = (e) => {
            if (e.propertyName === "transform") {
                el.style.transition = "none";
                el.style.transform = "none";
                el.removeEventListener("transitionend", onFinish);
            }
        };
        el.addEventListener("transitionend", onFinish);

        this.enableResize();
    }

    open() {
        this.focus();
    }

    close() {
        this.element.remove();
    }

    focus() {
        this.element.style.zIndex = ++this.manager.zIndex;
    }

    initEvents() {
        this.element.querySelector(".close").onclick = () => this.close();
        this.element.querySelector(".max").onclick = () => this.toggleMaximize();
        this.element.querySelector(".min").onclick = () => this.element.style.display = "none";

        this.initDrag();
    }

    initDrag() {
        const bar = this.element.querySelector(".xp-titlebar");

        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;

        bar.addEventListener("mousedown", (e) => {
            dragging = true;
            offsetX = e.clientX - this.element.offsetLeft;
            offsetY = e.clientY - this.element.offsetTop;
            this.focus();
        });

        window.addEventListener("mousemove", (e) => {
            if (!dragging) return;

            this.element.style.left = (e.clientX - offsetX) + "px";
            this.element.style.top = (e.clientY - offsetY) + "px";
        });

        window.addEventListener("mouseup", () => dragging = false);
    }

    startOpenAnimation(){
        const el = this.element;

        el.style.transformOrigin = `${this.originX - this.x}px ${this.originY - this.y}px`;

        requestAnimationFrame(() => {
            el.classList.remove("opening");
        });
    }

    enableResize() {
        const el = this.element;

        const right = el.querySelector(".resize-right");
        const bottom = el.querySelector(".resize-bottom");
        const corner = el.querySelector(".resize-corner");

        const startResize = (e, type) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = el.offsetWidth;
            const startHeight = el.offsetHeight;

            const onMove = (moveEvent) => {
                const newWidth = startWidth + (moveEvent.clientX - startX);
                const newHeight = startHeight + (moveEvent.clientY - startY);
                const snappedWidth = Math.round(newWidth / 10) * 10;
                const snappedHeight = Math.round(newHeight / 10) * 10;

                if (type === 'h' || type === 'a')
                    el.style.width = Math.max(450, snappedWidth) + "px";
                if (type === 'v' || type === 'a')
                    el.style.height = Math.max(250, snappedHeight) + "px";
            };

            const onUp = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onUp);
                document.body.style.cursor = 'default';
            };

            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
            document.body.style.cursor = (type === 'h') ? 'ew-resize' : (type === 'v' ? 'ns-resize' : 'nwse-resize');
        };

        const startResizeHorizontal = (e) => startResize(e, 'h');
        const startResizeVertical = (e) => startResize(e, 'v');
        const startResizeAll = (e) => startResize(e, 'a');

        right.addEventListener("pointerdown", startResizeHorizontal);
        bottom.addEventListener("pointerdown", startResizeVertical);
        corner.addEventListener("pointerdown", startResizeAll);
    }

    toggleMaximize() {
        if (!this.isMaximized) {
            this.prev = {
                x: this.element.offsetLeft,
                y: this.element.offsetTop,
                w: this.element.offsetWidth,
                h: this.element.offsetHeight
            };

            this.element.style.left = "0px";
            this.element.style.top = "0px";
            this.element.style.width = "100vw";
            this.element.style.height = "100vh";
        } else {
            if (!this.prev) return;

            this.element.style.left = this.prev.x + "px";
            this.element.style.top = this.prev.y + "px";
            this.element.style.width = this.prev.w + "px";
            this.element.style.height = this.prev.h + "px";
        }

        this.isMaximized = !this.isMaximized;
    }
}
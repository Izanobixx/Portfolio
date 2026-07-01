import { Window } from "./Window";

export class PostItCreatorWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Nueva_nota.exe",
            width: options.width || 400,
            height: options.height || 450,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.corchoWindow = options.corchoWindow;
        this.strokes = [];
        this.isDrawing = false;
        this.currentStroke = [];
        this.currentColor = '#333';
        this.currentSize = 3.5;
        this.canvas = null;
        this.ctx = null;
        this.eraserMode = false;
        this.history = [];

        this.canvasWidth = 300;
        this.canvasHeight = 300;

        this.windowBackground = 'url(' + import.meta.env.BASE_URL + 'textures/wood.png)';

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.transform = 'none';
        this.element.style.opacity = '1';
        this.element.style.transition = 'none';

        this.renderCreator();
        this.bindEvents();
        this.setupResize();
    }

    renderCreator() {
        const content = this.element.querySelector('.xp-content');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            gap: 10px;
            background: ${this.windowBackground};
            background-size: cover;
            background-position: center;
            height: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;

        const instruccion = document.createElement('p');
        instruccion.textContent = 'Dibuja en la nota y luego fíjala en el corcho';
        instruccion.style.cssText = 'margin:0; font-size:13px; color:#333; text-align:center; flex-shrink:0; background: rgba(255,255,255,0.6); padding: 4px 12px; border-radius: 8px;';
        content.appendChild(instruccion);

        const canvasContainer = document.createElement('div');
        canvasContainer.style.cssText = `
            aspect-ratio: 1/1;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
            background: #fff9c4;
            border-radius: 4px;
            border: 2px solid #aaa;
            overflow: hidden;
            position: relative;
        `;
        content.appendChild(canvasContainer);

        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position:relative;
            max-width: 100%;
            max-height: 100%;
            width: 100%;
            height: 100%;
            aspect-ratio: 1/1;
            cursor: crosshair;
            touch-action: none;
            background: #fff9c4;
            border: 2px solid #aaa;
            image-rendering: pixelated;
        `;
        canvasContainer.appendChild(canvas);

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex; gap:8px; flex-shrink:0; justify-content:center; flex-wrap:wrap; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 8px;';

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Eliminar';
        clearBtn.style.cssText = 'padding:6px 12px; background:#f0f0f0; color:#222; border:1px solid #aaa; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;';
        clearBtn.addEventListener('click', () => {
            this.history.push(JSON.stringify(this.strokes));
            this.strokes = [];
            this.currentStroke = [];
            this.redrawCanvas();
        });
        btnContainer.appendChild(clearBtn);

        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Deshacer';
        undoBtn.style.cssText = 'padding:6px 12px; background:#f0f0f0; color:#222; border:1px solid #aaa; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;';
        undoBtn.addEventListener('click', () => {
            if (this.strokes.length === 0) return;
            this.history.push(JSON.stringify(this.strokes));
            this.strokes.pop();
            this.redrawCanvas();
        });
        btnContainer.appendChild(undoBtn);

        const fixBtn = document.createElement('button');
        fixBtn.textContent = '📌Fijar';
        fixBtn.style.cssText = 'padding:6px 16px; background:#12aa43; color:white; border:none; border-radius:4px; cursor:pointer; font-size:13px; font-weight:bold;';
        fixBtn.addEventListener('click', () => {
            if (this.strokes.length === 0 || this.strokes.every(s => s.length < 2)) {
                alert('Esa nota es demasiado aburrida!');
                return;
            }
            const colors = ['#fff9c4', '#ffccbc', '#c8e6c9', '#bbdefb', '#f8bbd0'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.corchoWindow.addPostIt(this.strokes, color);
            this.close();
        });
        btnContainer.appendChild(fixBtn);

        content.appendChild(btnContainer);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        const getCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            const { x, y } = getCoords(e);
            this.currentStroke = [{x, y}];
            this.strokes.push(this.currentStroke);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing) return;
            const { x, y } = getCoords(e);
            this.currentStroke.push({x, y});
            this.redrawCanvas();
        });

        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            this.history.push(JSON.stringify(this.strokes));
            this.redrawCanvas();
        });

        canvas.addEventListener('mouseleave', () => {
            if (this.isDrawing) {
                this.isDrawing = false;
                this.history.push(JSON.stringify(this.strokes));
                this.redrawCanvas();
            }
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undoBtn.click();
            }
        });

        this.redrawCanvas();
    }

    redrawCanvas() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(0, 0, w, h);

        if (this.strokes.length === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '55px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Dibuja aquí', w/2, h/2);
            return;
        }

        this.strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x, stroke[i].y);
            }
            ctx.strokeStyle = this.eraserMode ? '#fff9c4' : this.currentColor;
            ctx.lineWidth = this.eraserMode ? 12 : this.currentSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        });
    }

    setupResize() {
        const resizeObserver = new ResizeObserver(() => {
            if (this.canvas) {
                this.redrawCanvas();
            }
        });
        resizeObserver.observe(this.element);
        this._resizeObserver = resizeObserver;
    }

    bindEvents() {}

    close() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }
        super.close();
    }
}
import { call } from "three/tsl";

// src/CableManager.js
export class CableManager {
    constructor() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:99999;';
        document.body.appendChild(this.svg);

        // Filtro para sombra
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'cableShadow');
        filter.setAttribute('x', '-10%');
        filter.setAttribute('y', '-10%');
        filter.setAttribute('width', '120%');
        filter.setAttribute('height', '120%');
        const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
        feDropShadow.setAttribute('dx', '0');
        feDropShadow.setAttribute('dy', '2');
        feDropShadow.setAttribute('stdDeviation', '3');
        feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.6)');
        filter.appendChild(feDropShadow);
        defs.appendChild(filter);
        this.svg.appendChild(defs);

        // Cable exterior (capa gruesa)
        this.pathOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathOuter.setAttribute('stroke', '#2a2a2a');
        this.pathOuter.setAttribute('stroke-width', '12');
        this.pathOuter.setAttribute('fill', 'none');
        this.pathOuter.setAttribute('stroke-linecap', 'round');
        this.pathOuter.setAttribute('filter', 'url(#cableShadow)');
        this.svg.appendChild(this.pathOuter);

        // Cable interior (capa fina, núcleo)
        this.pathInner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathInner.setAttribute('stroke', '#439738');
        this.pathInner.setAttribute('stroke-width', '4');
        this.pathInner.setAttribute('fill', 'none');
        this.pathInner.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.pathInner);

        // Reflejo central (brillo)
        this.pathHighlight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathHighlight.setAttribute('stroke', 'rgba(180,180,180,0.15)');
        this.pathHighlight.setAttribute('stroke-width', '2');
        this.pathHighlight.setAttribute('fill', 'none');
        this.pathHighlight.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(this.pathHighlight);

        this.onConnectCallback = null;

        this.isDragging = false;
        this.isConnected = false;
        this.startPoint = { x: 0, y: 0 };
        this.endPoint = { x: 0, y: 0 };
        this.sourceElement = null;

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
    }

    onConnect(callback){
        this.onConnectCallback = callback;
    }

    startDrag(connectorElement) {
        console.log('startDrag llamado');
        if (this.isDragging || this.isConnected) return;
        this.sourceElement = connectorElement;
        const rect = connectorElement.getBoundingClientRect();
        this.startPoint = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
        this.endPoint = { ...this.startPoint };
        this.isDragging = true;
        this.updateLine();
        document.addEventListener('pointermove', this.onPointerMove);
        document.addEventListener('pointerup', this.onPointerUp);
    }

    onPointerMove(e) {
        if (!this.isDragging) return;
        this.endPoint = { x: e.clientX, y: e.clientY };
        this.updateLine();
    }

    onPointerUp(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerup', this.onPointerUp);

        const usbEl = document.getElementById('usb-port');
        if (usbEl) {
            const rect = usbEl.getBoundingClientRect();
            const centerX = rect.left + rect.width/2;
            const centerY = rect.top + rect.height/2;
            const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
            if (dist < 30) {
                this.isConnected = true;
                this.endPoint = { x: centerX, y: centerY };
                this.updateLine();
                console.log('Cable conectado!');
                if (this.onConnectCallback) {
                    const cb = this.onConnectCallback;
                    this.onConnectCallback = null; // Ejecutar una sola vez
                    cb();
                }
                this.startAutoUpdate();
                return;
            }
        }
        this.endPoint = { ...this.startPoint };
        this.updateLine();
        this.isConnected = false;
    }

    updateLine() {
        const x1 = this.startPoint.x;
        const y1 = this.startPoint.y;
        const x2 = this.endPoint.x;
        const y2 = this.endPoint.y;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len < 10) {
            const d = `M ${x1} ${y1} L ${x2} ${y2}`;
            this.pathOuter.setAttribute('d', d);
            this.pathInner.setAttribute('d', d);
            this.pathHighlight.setAttribute('d', d);
            return;
        }

        const controlDist = Math.min(120, Math.max(40, len * 0.35));

        let c1x = x1 + controlDist * (dx > 0 ? 1 : -1);
        let c1y = y1;

        let c2x = x2 - controlDist * (dx > 0 ? 1 : -1);
        let c2y = y2;

        const d = `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
        this.pathOuter.setAttribute('d', d);
        this.pathInner.setAttribute('d', d);
        this.pathHighlight.setAttribute('d', d);
    }

    startAutoUpdate() {
        if (!this.isConnected) return;
        const updatePositions = () => {
            if (!this.isConnected) return;
            if (this.sourceElement) {
                const rect = this.sourceElement.getBoundingClientRect();
                this.startPoint = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
            }
            const usbEl = document.getElementById('usb-port');
            if (usbEl) {
                const rect = usbEl.getBoundingClientRect();
                this.endPoint = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
            }
            this.updateLine();
            requestAnimationFrame(updatePositions);
        };
        updatePositions();
    }

    disconnect() {
        this.isConnected = false;
        this.isDragging = false;
        this.pathOuter.setAttribute('d', '');
        this.pathInner.setAttribute('d', '');
        this.pathHighlight.setAttribute('d', '');
    }
}

export const cableManager = new CableManager();
import { Window } from "./Window";
import { CableManager } from "../CableManager.js";

export class ComputerWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "My Computer.exe",
            width: options.width || 600,
            height: options.height || 400,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.currentPath = '/';
        this.history = [];
        this.filesTree = null;
        this.contentGrid = null;
        this.addressInput = null;
        this.statusSpan = null;
        this.sidebarDynamic = null;
        this.sidebarFiles = null;
        this.backBtn = null;
        this.goBtn = null;
        this.downloadBtn = null;

        this.selectedFile = null;
        this.selectedElement = null;

        this.cableManager = null;
        this.cablePath = '/Documentos/Test';

        this.folderIcons = {
            'documentos': '📎',
            'imagenes': '🖼️',
            'vídeos': '🎬',
            'no_entrar': '🛑'
        };

        this.folderDialogues = {
            '/Imagenes/Personal/Nudes' : [{ speaker: 'IZAN', text: 'No sé que pensaba encontrar en esta carpeta, la verdad.' }],
            '/NO_ENTRAR' : [{ speaker: 'IZAN', text: '¿Qué es esta carpeta?' }],
            '/NO_ENTRAR/NO_SIGAS/PARA_YA': [{ speaker: 'IZAN', text: '.....' }],
            '/Documentos/Observaciones': [{ speaker: 'IZAN', text: 'Qué es esta carpeta?..' }]
        }

        this.loadFiles().then(() => {
            this.renderExplorer();
            this.bindEvents();
            this.navigateTo('/');
            this.updateConnectorVisibility('/')
        });

        const content = this.element.querySelector('.xp-content');
        if (content) {
            content.style.overflow = 'visible';
        }

        this._gameWindowClosedHandler = (e) => {
            const closedWin = e.detail.window;
            if (this.cableManager && this.cableManager.isConnected && this.cableManager.connectedGameWindow === closedWin) {
                this.cableManager.disconnect();
                this.updateConnectorVisibility(this.currentPath);
            }
        };
        document.addEventListener('gameWindowClosed', this._gameWindowClosedHandler);
    }
    

    async loadFiles() {
        try {
            const response = await fetch('/files.json');
            if (!response.ok) throw new Error('Failed to load files.json');
            this.filesTree = await response.json();
        } catch (error) {
            console.warn('Could not load files.json, using empty structure.', error);
            this.filesTree = { id: 'root', label: 'Este equipo', icon: '📂', type: 'folder', children: [] };
        }
    }

    getItemsAtPath(path) {
        if (path === '/') {
            return this.filesTree.children || [];
        }
        const parts = path.split('/').filter(p => p !== '');
        let node = this.filesTree;
        for (const part of parts) {
            const child = node.children?.find(c => c.label === part && c.type === 'folder');
            if (!child) return null;
            node = child;
        }
        return node.children || [];
    }

    folderExists(path) {
        if (path === '/') return true;
        const parts = path.split('/').filter(p => p !== '');
        let node = this.filesTree;
        for (const part of parts) {
            const child = node.children?.find(c => c.label === part && c.type === 'folder');
            if (!child) return false;
            node = child;
        }
        return true;
    }

    navigateTo(path) {
        this.deselectItem();
        if (!this.folderExists(path) && path !== '/') {
            this.navigateTo('/');
            return;
        }
        const items = this.getItemsAtPath(path);
        if (this.currentPath !== path) {
            this.history.push(this.currentPath);
        }
        const wasInTest = this.currentPath && this.currentPath.includes(this.cablePath);
        const isInTest = path.includes(this.cablePath);
        if (wasInTest && !isInTest && this.cableManager && this.cableManager.isConnected) {
            this.cableManager.disconnect();
        }

        this.ReactToDirectory(path);

        this.currentPath = path;
        this.renderItems(items || []);
        this.updateAddress(path);
        this.updateStatus();
        this.highlightSidebar(path);

        this.updateConnectorVisibility(path);
    }

    goBack() {
        if (this.currentPath === '/') return;
        const parts = this.currentPath.split('/').filter(p => p !== '');
        parts.pop();
        const parentPath = '/' + parts.join('/');
        this.navigateTo(parentPath);
    }

    goToPath(inputPath) {
        let cleanPath = inputPath.replace(/^C:\\Este equipo/i, '').replace(/\\/g, '/');
        if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
        cleanPath = cleanPath.replace(/\/+/g, '/').trim();
        if (cleanPath === '/') {
            this.navigateTo('/');
            return;
        }
        if (this.folderExists(cleanPath)) {
            this.navigateTo(cleanPath);
        } else {
            this.navigateTo('/');
        }
    }

    renderItems(items) {
        if (this.currentPath === '/NO_ENTRAR/NO_SIGAS/PARA_YA/ULTIMO_AVISO_NO_ENTRAR'){
            this.renderRickRoll();
            return;
        }

        if (this.contentGrid) {
            this.contentGrid.style.padding = '12px';
            this.contentGrid.style.gap = '12px';
            this.contentGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';
            this.contentGrid.style.display = 'grid';
            this.contentGrid.style.alignContent = 'start';
            this.contentGrid.style.overflow = 'hidden';
            this.contentGrid.style.overflowY = 'auto';
            this.contentGrid.style.overflowX = 'hidden';
        }
        else
            return;

        this.contentGrid.innerHTML = '';
        if (!items || items.length === 0) {
            this.contentGrid.innerHTML = '<div class="empty-message">Esta carpeta está vacía.</div>';
            return;
        }
        for (const item of items) {
            const div = document.createElement('div');
            div.className = 'grid-item';
            div.dataset.id = item.id;
            div.dataset.type = item.type;

            let iconHtml = '';
            if (item.type === 'image') {
                iconHtml = `<img src="${item.url}" style="width:48px; height:48px; object-fit:cover; border-radius:4px;" alt="${item.label}">`;
            } else if (item.type === 'folder' && this.folderIcons[item.label.trim().toLowerCase()]) {
                iconHtml = `<span class="icon-emoji">${this.folderIcons[item.label.trim().toLowerCase()]}</span>`;
            } else {
                iconHtml = `<span class="icon-emoji">${item.icon}</span>`;
            }

            div.innerHTML = `
                <div class="icon">${iconHtml}</div>
                <div class="label">${item.label}</div>
            `;

            div.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(item, div);
            });

            div.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (item.type === 'folder') {
                    const newPath = this.currentPath === '/' ? '/' + item.label : this.currentPath + '/' + item.label;
                    this.navigateTo(newPath);
                } else {
                    this.openFile(item);
                }
            });

            this.contentGrid.appendChild(div);
        }

        this.contentGrid.addEventListener('click', (e) => {
            if (e.target === this.contentGrid) {
                this.deselectItem();
            }
        });
    }

    renderRickRoll() {
        if (!this.contentGrid) return;
        
        this.contentGrid.innerHTML = '';
        this.contentGrid.style.padding = '0';
        this.contentGrid.style.gap = '0';
        this.contentGrid.style.gridTemplateColumns = '1fr';
        this.contentGrid.style.alignContent = 'stretch';
        this.contentGrid.style.display = 'flex';
        this.contentGrid.style.flexDirection = 'column';
        
        const container = document.createElement('div');
        container.style.cssText = `
            width: 100%;
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
            overflow: hidden;
        `;
        
        container.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=1&loop=0&rel=0" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen
                style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
            ></iframe>
        `;
        
        container.style.position = 'relative';
        this.contentGrid.appendChild(container);
        
        this.contentGrid.style.overflow = 'hidden';

        //if (!this._rickRollDialogShown) {
            setTimeout( () => {
                this._rickRollDialogShown = true;
                if (window.dialogueManager) {
                    const rickMessages = [
                        "Te falta calle.",
                        "Sabía que caerías.",
                        "No te sientas mal. A mí también me han hecho esto. Muchas veces.",
                        "El creador de esta web tiene un sentido del humor cuestionable."
                    ];
                    const randomMsg = rickMessages[Math.floor(Math.random() * rickMessages.length)];
                    window.dialogueManager.show([
                        { speaker: 'RICK ASTLEY', text: randomMsg }
                    ]);
                }
            }, 1500);
        //}
    }

    renderMatrixView() {
        if (this.contentGrid) {
            this.contentGrid.style.display = 'none';
        }

        let matrixContainer = this.element.querySelector('.matrix-container');
        if (!matrixContainer) {
            matrixContainer = document.createElement('div');
            matrixContainer.className = 'matrix-container';
            matrixContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:10;';
            const content = this.element.querySelector('.xp-content');
            content.appendChild(matrixContainer);
        } else {
            matrixContainer.innerHTML = '';
        }

        if (this.matrixView) {
            this.matrixView.destroy();
        }
        this.matrixView = new MatrixView(matrixContainer);
    }

    selectItem(item, element) {
        if (this.selectedElement === element && this.selectedFile === item) return;
        this.deselectItem();
        this.selectedFile = item;
        this.selectedElement = element;
        element.classList.add('selected');
        this.updateDownloadButton();
    }

    deselectItem() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
        this.selectedFile = null;
        this.updateDownloadButton();
    }

    updateDownloadButton() {
        if (!this.downloadBtn) return;
        const isFile = this.selectedFile && this.selectedFile.type !== 'folder';
        this.downloadBtn.disabled = !isFile;
        this.downloadBtn.title = isFile ? 'Descargar archivo seleccionado' : 'Selecciona un archivo para descargar';
    }

    downloadSelectedFile() {
        if (!this.selectedFile || this.selectedFile.type === 'folder') return;
        const file = this.selectedFile;
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.label;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    updateAddress(path) {
        if (this.addressInput) {
            const displayPath = 'C:\\Este equipo' + (path === '/' ? '' : path.replace(/\//g, '\\'));
            this.addressInput.value = displayPath;
        }
    }

    updateStatus() {
        if (this.statusSpan) {
            const items = this.getItemsAtPath(this.currentPath);
            this.statusSpan.textContent = `${(items || []).length} elementos`;
        }
    }

    highlightSidebar(path) {
        const items = this.element.querySelectorAll('.folder-item[data-path]');
        items.forEach(el => {
            el.classList.toggle('active', el.dataset.path === path);
        });
    }

    renderExplorer() {
        const content = this.element.querySelector('.xp-content');
        content.innerHTML = `
            <div class="xp-explorer">
                <div class="xp-addressbar">
                    <button id="pc-back-btn" title="Volver a la carpeta anterior">◀</button>
                    <span>Dirección:</span>
                    <input type="text" id="pc-address" value="C:\\Este equipo">
                    <button id="pc-go-btn">Ir</button>
                    <button id="pc-download-btn" disabled title="Selecciona un archivo para descargar">⬇ Descargar</button>
                </div>
                <div class="xp-explorer-body">
                    <div class="xp-sidebar" id="pc-sidebar">
                        <div class="sidebar-header">Carpetas</div>
                        <div class="folder-item" data-path="/">
                            <span>🖥️</span> Este equipo
                        </div>
                        <div id="sidebar-dynamic"></div>
                        <hr>
                        <div class="sidebar-header">Archivos rápidos</div>
                        <div id="sidebar-files"></div>
                    </div>
                    <div class="xp-content-grid" id="pc-content-grid"></div>
                </div>
                <div class="xp-statusbar">
                    <span id="pc-item-count">0 elementos</span>
                    <span style="margin-left:auto;">My Computer</span>
                </div>
            </div>
        `;

        this.contentGrid = content.querySelector('#pc-content-grid');
        this.addressInput = content.querySelector('#pc-address');
        this.statusSpan = content.querySelector('#pc-item-count');
        this.sidebarDynamic = content.querySelector('#sidebar-dynamic');
        this.sidebarFiles = content.querySelector('#sidebar-files');
        this.backBtn = content.querySelector('#pc-back-btn');
        this.goBtn = content.querySelector('#pc-go-btn');
        this.downloadBtn = content.querySelector('#pc-download-btn');

        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.goBack());
        }

        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadSelectedFile());
        }

        this.buildSidebar();
        this.updateDownloadButton();
    }

    bindEvents() {
        if (this.goBtn && this.addressInput) {
            const goHandler = () => {
                this.goToPath(this.addressInput.value);
            };
            this.goBtn.addEventListener('click', goHandler);
            this.addressInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') goHandler();
            });
        }
    }

    updateConnectorVisibility(path) {

        if (!this.currentPath.includes(this.cablePath)) {
            if (this.cableManager && this.cableManager.isConnected) {
                this.cableManager.disconnect();
            }
            const oldContainer = this.element.querySelector('.connector-container');
            if (oldContainer) oldContainer.remove();
            // Restaurar grid
            if (this.contentGrid) this.contentGrid.style.display = '';
            return;
        }

        if (!this.cableManager) {
            this.cableManager = new CableManager(() => {this.handleCableConnected();});
        }
        
        // Eliminar cualquier contenedor anterior
        const oldContainer = this.element.querySelector('.connector-container');
        if (oldContainer) {
            oldContainer.remove();
        }
        // Limpiar intervalo de glitch si existe
        if (this._glitchInterval) {
            clearInterval(this._glitchInterval);
            this._glitchInterval = null;
        }

        // Restaurar el grid si estaba oculto
        if (this.contentGrid) {
            this.contentGrid.style.display = '';
        }

        // Solo mostrar en la carpeta /Documentos/Test
        if (this.currentPath !== this.cablePath) {
            return;
        }

        // Ocultar el grid
        if (this.contentGrid) {
            this.contentGrid.style.display = 'none';
        }

        // Crear contenedor centrado
        const container = document.createElement('div');
        container.className = 'connector-container';
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 30px;
            gap: 20px;
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 4px;
            margin: 0px;
            min-height: 200px;
            box-shadow: inset 0 0 30px rgba(0,0,0,0.8);
            font-family: 'Courier New', monospace;
        `;

        // Texto de instrucción críptico
        const instructionText = document.createElement('div');
        instructionText.style.cssText = `
            font-size: 14px;
            color: #88aa88;
            text-align: center;
            user-select: none;
            letter-spacing: 2px;
            text-transform: uppercase;
            opacity: 0.8;
            font-weight: 300;
        `;
        instructionText.textContent = '> CONEXIÓN DE DATOS REQUERIDA';

        // Subtexto con glitch
        const subText = document.createElement('div');
        subText.style.cssText = `
            font-size: 12px;
            color: #ce4646;
            text-align: center;
            user-select: none;
            letter-spacing: 1px;
            margin-top: 4px;
            font-style: italic;
            font-family: 'Courier New', monospace;
        `;
        const prefix = '// Enlace físico requerido. Id de dispositivo destino: [';
        const suffix = ']';
        subText.innerHTML = `${prefix}${this.generateGlitchString()}${suffix}`;

        container.appendChild(instructionText);
        container.appendChild(subText);

        // Conector (igual que antes)
        const connector = document.createElement('div');
        connector.id = 'cable-connector';
        connector.style.cssText = `
            width: 48px;
            height: 48px;
            background: #111;
            border: 2px solid #556655;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(85, 102, 85, 0.2), inset 0 0 15px rgba(85, 102, 85, 0.1);
            transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            user-select: none;
        `;

        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 10px;
            height: 10px;
            background: #88aa88;
            border-radius: 50%;
            opacity: 0.6;
            transition: opacity 0.3s;
            box-shadow: 0 0 12px rgba(136, 170, 136, 0.4);
        `;
        connector.appendChild(dot);

        connector.addEventListener('mouseenter', () => {
            connector.style.transform = 'scale(1.08)';
            connector.style.boxShadow = '0 0 30px rgba(85, 102, 85, 0.4), inset 0 0 20px rgba(85, 102, 85, 0.2)';
            connector.style.borderColor = '#88aa88';
            dot.style.opacity = '1';
        });
        connector.addEventListener('mouseleave', () => {
            connector.style.transform = 'scale(1)';
            connector.style.boxShadow = '0 0 20px rgba(85, 102, 85, 0.2), inset 0 0 15px rgba(85, 102, 85, 0.1)';
            connector.style.borderColor = '#556655';
            dot.style.opacity = '0.6';
        });

        connector.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (this.cableManager) {
                this.cableManager.startDrag(connector);
            } else {
                console.warn('CableManager no inicializado');
            }
        });

        container.appendChild(connector);

        // Insertar en el cuerpo del explorador
        const explorerBody = this.element.querySelector('.xp-explorer-body');
        if (explorerBody) {
            explorerBody.appendChild(container);
        }

        // Iniciar glitch
        this._glitchInterval = setInterval(() => {
            if (subText) {
                const glitch = this.generateGlitchString();
                subText.innerHTML = `${prefix}${glitch}${suffix}`;
            }
        }, 120);
    }

    handleCableConnected() {
        // Llamar a GameWindow si existe
        if (window.gameWindowInstance && typeof window.gameWindowInstance.showConnectionSuccess === 'function') {
            window.gameWindowInstance.showConnectionSuccess();
        } else {
            console.warn('GameWindow no encontrada o no tiene showConnectionSuccess');
        }

        // También actualizar el contenedor de conexión (la ventana de "> CONEXIÓN DE DATOS REQUERIDA")
        const container = this.element.querySelector('.connector-container');
        if (container) {
            container.style.borderColor = '#00ff00';
            container.style.boxShadow = 'inset 0 0 30px rgb(0, 255, 0), 0 0 30px rgba(35, 202, 35, 0.57)';
            const subText = container.querySelector('div:nth-child(2)');
            if (subText) {
                subText.style.color = '#00ff00';
                subText.textContent = '// Enlace físico establecido. Dispositivo destino: [Game_Child]';
            }
            // Cambiar el texto de instrucción
            const instructionText = container.querySelector('div:first-child');
            if (instructionText) {
                instructionText.textContent = '> CONEXIÓN COMPLETA';
                instructionText.style.color = '#88aa88';
            }
            // Eliminar intervalo de glitch
            if (this._glitchInterval) {
                clearInterval(this._glitchInterval);
                this._glitchInterval = null;
            }
        }
    }

    showConnectionSuccess(container) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            font-size: 13px;
            color: #88aa88;
            text-align: center;
            margin-top: 8px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
            opacity: 0.9;
            border-top: 1px solid #88aa88;
            padding-top: 10px;
            width: 100%;
        `;
        successMsg.textContent = '> Conexión establecida. Transferencia de datos iniciada.';
        container.appendChild(successMsg);

        // También mostrar en el grid si está visible (por si acaso)
        if (this.contentGrid) {
            this.contentGrid.style.display = 'grid'; // Mostrar grid con mensaje
            this.contentGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #88aa88; font-family: 'Courier New', monospace; font-size: 16px; background: #0a0a0a; border: 1px solid #88aa88; border-radius: 4px;">
                    ✅ Conexión establecida con Game Child.<br>
                    <span style="font-size: 14px; opacity: 0.7;">Transferencia de datos iniciada...</span>
                </div>
            `;
        }
    }

    generateGlitchString(length = 10) {
        const chars = '!@#$%^&*()_+-=[]{}|;:,.>/?TontoElQueLoLea';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    buildSidebar() {
        if (!this.sidebarDynamic || !this.sidebarFiles) return;
        const topFolders = this.filesTree.children?.filter(c => c.type === 'folder') || [];
        this.sidebarDynamic.innerHTML = topFolders.map(f => {
            const icon = this.folderIcons[f.label.trim().toLowerCase()] || f.icon;
            return `
                <div class="folder-item" data-path="/${f.label}">
                    <span>${icon}</span> ${f.label}
                </div>
            `;
        }).join('');

        const rootFiles = this.filesTree.children?.filter(c => c.type !== 'folder') || [];
        this.sidebarFiles.innerHTML = rootFiles.map(f => `
            <div class="file-item" data-file="${f.id}">
                <span>${f.icon}</span> ${f.label}
            </div>
        `).join('');

        const folderItems = this.element.querySelectorAll('.folder-item[data-path]');
        folderItems.forEach(el => {
            el.removeEventListener('click', this._folderClickHandler);
            el._folderClickHandler = () => {
                const path = el.dataset.path;
                this.navigateTo(path);
            };
            el.addEventListener('click', el._folderClickHandler);
        });

        const fileItems = this.element.querySelectorAll('.file-item[data-file]');
        fileItems.forEach(el => {
            el.removeEventListener('click', this._fileClickHandler);
            el._fileClickHandler = () => {
                const fileId = el.dataset.file;
                const rootFiles = this.filesTree.children?.filter(c => c.type !== 'folder') || [];
                const file = rootFiles.find(f => f.id === fileId);
                if (file) this.openFile(file);
            };
            el.addEventListener('click', el._fileClickHandler);
        });
    }

    async openFile(file) {
        let content = '';
        let title = file.label;
        let width = 500;
        let height = 400;
        const centerX = window.innerWidth / 2 - width / 2;
        const centerY = window.innerHeight / 2 - height / 2;

        //DIALOGUES
        if (window.dialogueManager){
            this.ReactToFile(file.label);
        }

        if (file.type === 'image') {
            const items = this.getItemsAtPath(this.currentPath) || [];
            const images = items.filter(item => item.type === 'image');
            const currentIndex = images.findIndex(img => img.id === file.id);

            if (images.length === 0) {
                content = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#222; color:#fff;">No hay imágenes</div>`;
            } else {
                const currentUrl = images[currentIndex].url;
                const hasNav = images.length > 1;
                content = `
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; position:relative; background:#222;">
                        <img id="image-viewer" src="${currentUrl}" style="max-width:100%; max-height:100%; object-fit:contain; user-select:none;">
                        ${hasNav ? `
                            <button id="prev-image" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); color:white; border:none; padding:10px 15px; cursor:pointer; font-size:24px; border-radius:4px; opacity:0.7; transition:opacity 0.2s; user-select:none;">◀</button>
                            <button id="next-image" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); color:white; border:none; padding:10px 15px; cursor:pointer; font-size:24px; border-radius:4px; opacity:0.7; transition:opacity 0.2s; user-select:none;">▶</button>
                        ` : ''}
                    </div>
                `;
                width = 700;
                height = 550;
            }

            const win = this.manager.createWindow(Window, {
                title: title,
                width: width,
                height: height,
                x: centerX,
                y: centerY,
                originX: centerX,
                originY: centerY,
                content: content,
                imagesData: images,
                currentImageIndex: currentIndex
            });

            if (window.dialogueManager && images.length > 1) {

                const img = win.element.querySelector('#image-viewer');
                const prevBtn = win.element.querySelector('#prev-image');
                const nextBtn = win.element.querySelector('#next-image');
                let idx = currentIndex;

                const updateImage = (newIdx) => {
                    idx = (newIdx + images.length) % images.length;
                    img.src = images[idx].url;
                    win.title = images[idx].label;
                    const titleBar = win.element.querySelector('.xp-title');
                    if (titleBar) titleBar.textContent = images[idx].label;

                    this.ReactToFile(images[idx].label);
                };

                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateImage(idx - 1);
                });
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateImage(idx + 1);
                });

                document.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') {
                        const activeWin = this.manager.windows[this.manager.windows.length - 1];
                        if (activeWin === win) {
                            updateImage(idx - 1);
                            e.preventDefault();
                        }
                    } else if (e.key === 'ArrowRight') {
                        const activeWin = this.manager.windows[this.manager.windows.length - 1];
                        if (activeWin === win) {
                            updateImage(idx + 1);
                            e.preventDefault();
                        }
                    }
                });

                prevBtn.addEventListener('mouseenter', () => prevBtn.style.opacity = '1');
                prevBtn.addEventListener('mouseleave', () => prevBtn.style.opacity = '0.7');
                nextBtn.addEventListener('mouseenter', () => nextBtn.style.opacity = '1');
                nextBtn.addEventListener('mouseleave', () => nextBtn.style.opacity = '0.7');
            }

            return;
        }

        switch (file.type) {
            case 'pdf':
                content = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; background:#f0f0f0;">
                        <embed src="${file.url}" style="flex:1; width:100%; border:none;" type="application/pdf">
                        <div style="font-size:11px; text-align:center; padding:4px; background:#e8e8e8; border-top:1px solid #ccc;">
                            <a href="${file.url}" download style="color:#0047ab; text-decoration:none;">Descargar PDF</a>
                        </div>
                    </div>
                `;
                width = 700;
                height = 550;
                break;

            case 'video':
                content = `
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#000;">
                        <video controls style="width:100%; height:100%; object-fit:contain;">
                            <source src="${file.url}" type="video/mp4">
                            Tu navegador no soporta la etiqueta de video.
                        </video>
                    </div>
                `;
                width = 700;
                height = 500;
                break;

            case 'text':
                try {
                    const response = await fetch(file.url);
                    if (!response.ok) throw new Error('No se pudo cargar el archivo');
                    const text = await response.text();
                    content = `
                        <div style="width:100%; height:100%; padding:16px; box-sizing:border-box; overflow:auto; background:#f8f8f8; font-family:monospace; white-space:pre-wrap; word-wrap:break-word; font-size:13px; color:#333;">
                            ${text}
                        </div>
                    `;
                } catch (error) {
                    content = `
                        <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f8f8f8; font-family:sans-serif; font-size:14px; color:#c00;">
                            Error al cargar el archivo: ${error.message}
                        </div>
                    `;
                }
                width = 600;
                height = 450;
                break;

            default:
                content = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f8f8f8; font-family:sans-serif; font-size:14px; color:#333;">
                        <p style="margin:0 0 12px 0;">No se puede previsualizar este archivo.</p>
                        <a href="${file.url}" download style="color:#0047ab; text-decoration:underline;">Descargar ${file.label}</a>
                    </div>
                `;
                width = 500;
                height = 300;
                break;
        }

        const win = this.manager.createWindow(Window, {
            title: title,
            width: width,
            height: height,
            x: centerX,
            y: centerY,
            originX: centerX,
            originY: centerY,
            content: content
        });

        if (window.dialogueManager){
            this.ReactToCloseFile(file.label, win);
        }
    }

    ReactToDirectory(path){
        if(this.folderDialogues[path]){
            window.dialogueManager.show(
                this.folderDialogues[path]
            );
        }
    }

    ReactToFile(fileName){
        switch(fileName){
            case 'AmongUsArea.jpeg':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Mis amigos de la uni. Tengo ganas de verles mañana.' }
            ]);
            break;
            case 'WarmUp.jpeg':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Bua, en esta foto incluso parece que sabemos lo que hacemos.' }
            ]);
            break;
            case 'C4.png':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Este es mi frame favorito.' }
            ]);
            break;
            case 'Graduación1.jpg':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Desde aquel día, cada uno de nosotros se fue por un camino diferente.' },
                { speaker: 'IZAN', text: 'Se les echa de menos' }
            ]);
            break;
            case 'Bajo.jpeg':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Performative final boss' }
            ]);
            break;
            case 'SML.jpg':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Aún recuerdo cuando hice este fangame de Mario Odyssey de LEGO.' },
                { speaker: 'IZAN', text: 'Menos mal que N1ntend0 nunca lo llegó a ver.' }
            ]);
            break;
            case 'ZombieGame_3.png':
            window.dialogueManager.show([
                { speaker: 'IZAN', text: 'Este juego tenía mucho potencial.' },
                { speaker: 'IZAN', text: 'Un juego de zombies con estética cartoon pero sangrienta. Tenía hasta chat de proximidad' },
                { speaker: 'IZAN', text: 'Quizás algún día cuando tenga más presupuesto vuelva a él.' }
            ]);
            break;
        }
    }

    ReactToCloseFile(fileName, win){
        const originalClose = win.close.bind(win);
        win.close = function(){
            switch(fileName){
                case 'Nota1.txt':
                    if (window.dialogueManager) {
                        window.dialogueManager.show([
                            { speaker: 'IZAN', text: 'No recuerdo haber escrito ese texto.' },
                            { speaker: 'IZAN', text: 'Debo haberlo descargado sin querer de Internet.' }
                        ]);
                        setTimeout(() => {
                            originalClose();
                        }, 1);
                    } else {
                        originalClose();
                    }
                    break;
                default:
                    originalClose();
                    break;
            }
        };
    }

    close(){
        document.removeEventListener('gameWindowClosed', this._gameWindowClosedHandler);
        if (this.cableManager) {
            this.cableManager.destroy();
            this.cableManager = null;
        }
        super.close();
    }
}
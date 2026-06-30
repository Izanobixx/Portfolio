// src/windows/GameWindow.js
import { Window } from "./Window";
import { gamesData, categories } from "./data/gamesData.js";

// --- AudioContext global ---
let globalAudioCtx = null;

function playClickSound() {
    try {
        // Crear el contexto si no existe
        if (!globalAudioCtx) {
            globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Reanudar si está suspendido (política de autoplay)
        if (globalAudioCtx.state === 'suspended') {
            globalAudioCtx.resume();
        }
        const audioCtx = globalAudioCtx;

        // Componente medio-grave (cuerpo del click)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 1100 + Math.random() * 200;
        gain2.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.05);

        // Textura de ruido (roce del plástico)
        const bufferSize = audioCtx.sampleRate * 0.03;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.12;
        }
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;
        const gainNoise = audioCtx.createGain();
        gainNoise.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025);
        noiseSource.connect(gainNoise);
        gainNoise.connect(audioCtx.destination);
        noiseSource.start(audioCtx.currentTime);
        noiseSource.stop(audioCtx.currentTime + 0.03);

    } catch (e) {
        // Silenciar errores (por si el navegador bloquea el audio)
    }
}

export class GameWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Retro Consola.exe",
            width: options.width || 660,
            height: options.height || 780,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.currentGameId = null;
        this.currentCategory = 'all';
        this.filteredGames = [];
        this.isScreenOff = false;
        this.isInstallMode = false;
        this.isFullscreen = false;
        this._savedContentHTML = null;
        this._fullscreenCloseHandler = null;

        if (!document.getElementById('gamewindow-scroll-style')) {
            const style = document.createElement('style');
            style.id = 'gamewindow-scroll-style';
            style.textContent = `
                .gamewindow-scroll-content::-webkit-scrollbar {
                    width: 6px;
                    background: transparent;
                }
                .gamewindow-scroll-content::-webkit-scrollbar-thumb {
                    background: #4a6b0a;
                    border-radius: 4px;
                }
                .gamewindow-scroll-content::-webkit-scrollbar-track {
                    background: #9bbc0f;
                    border-radius: 4px;
                }
                .gamewindow-scroll-content {
                    scrollbar-color: #4a6b0a #9bbc0f;
                }

                .cartridge-grid::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                    display: none;
                }
                .cartridge-grid {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
            `;
            document.head.appendChild(style);
        }

        this.renderGameWindow();
        this.bindEvents();
        this.selectGame(gamesData[0]?.id || null);

        this.element.__gameWindowInstance = this;
    }

    // ---------- Datos ----------
    getGames() {
        return gamesData;
    }

    getCategories() {
        return categories;
    }

    getGame(id) {
        return gamesData.find(g => g.id === id) || null;
    }

    getGamesByCategory(categoryId) {
        if (categoryId === 'all') return gamesData;
        return gamesData.filter(g => g.categories.includes(categoryId));
    }

    // ---------- Renderizado ----------
    renderGameWindow() {
        const content = this.element.querySelector('.xp-content');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #e8dcc8;
            padding: 16px;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
            color: #3a2a1a;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: inset 0 0 0 2px #c0b09a, 0 4px 12px rgba(0,0,0,0.3);
        `;

        // Logo
        const logo = document.createElement('div');
        logo.textContent = 'Game Child';
        logo.style.cssText = `
            font-family: 'Press Start 2P', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #2a1a0a;
            text-shadow: 0 2px 0 #b8a48c;
            letter-spacing: 2px;
            text-align: center;
            padding: 4px 0 8px 0;
            flex-shrink: 0;
        `;
        content.appendChild(logo);

        // Envoltorio pantalla
        const screenWrapper = document.createElement('div');
        screenWrapper.style.cssText = `
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 12px;
            max-height: 45%;
        `;
        content.appendChild(screenWrapper);

        // Contenedor TV
        const tvContainer = document.createElement('div');
        tvContainer.style.cssText = `
            width: 80%;
            max-width: 400px;
            aspect-ratio: 1 / 1;
            max-height: 100%;
            background: #8bac0f;
            border: 6px solid #aaaaaa;
            border-radius: 12px;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        `;
        screenWrapper.appendChild(tvContainer);

        // Scanlines
        const scanlines = document.createElement('div');
        scanlines.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 2px, transparent 2px, transparent 4px);
            pointer-events: none;
            z-index: 5;
        `;
        tvContainer.appendChild(scanlines);

        // Fondo de pantalla
        const screenBg = document.createElement('div');
        screenBg.style.cssText = `
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            background: #9bbc0f;
            border-radius: 6px;
            box-shadow: inset 0 0 30px rgba(0,0,0,0.15);
            padding: 12px;
            overflow: hidden;
            color: #1a3a0a;
            font-size: 14px;
            line-height: 1.5;
        `;
        tvContainer.appendChild(screenBg);

        // Contenido de la pantalla (scroll oculto)
        this.screenContent = document.createElement('div');
        this.screenContent.className = 'gamewindow-scroll-content';
        this.screenContent.style.cssText = `
            height: 100%;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding-right: 4px;
        `;
        screenBg.appendChild(this.screenContent);

        // Mensaje inicial
        this.screenContent.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:16px; opacity:0.6; text-align:center; color:#1a3a0a;">
                <div>
                    <span style="display:block; font-size:28px; margin-bottom:6px;">🎮</span>
                    Selecciona un cartucho
                </div>
            </div>
        `;

        // Flechas de scroll para la pantalla de información
        const arrowUpInfo = document.createElement('div');
        arrowUpInfo.className = 'scroll-arrow-up-info';
        arrowUpInfo.textContent = '▲';
        arrowUpInfo.style.cssText = `
            position: absolute;
            top: 4px;
            left: 50%;
            transform: translateX(-50%);
            color: #1a3a0a;
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            cursor: pointer;
            z-index: 6;
            text-shadow: 0 0 8px rgba(155, 188, 15, 0.8);
            background: rgba(155,188,15,0.6);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        screenBg.appendChild(arrowUpInfo);

        const arrowDownInfo = document.createElement('div');
        arrowDownInfo.className = 'scroll-arrow-down-info';
        arrowDownInfo.textContent = '▼';
        arrowDownInfo.style.cssText = `
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            color: #1a3a0a;
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            cursor: pointer;
            z-index: 6;
            text-shadow: 0 0 8px rgba(155, 188, 15, 0.8);
            background: rgba(155,188,15,0.6);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        screenBg.appendChild(arrowDownInfo);

        this.arrowUpInfo = arrowUpInfo;
        this.arrowDownInfo = arrowDownInfo;

        // Eventos para flechas de información
        arrowUpInfo.addEventListener('click', () => {
            this.screenContent.scrollBy({ top: -80, behavior: 'smooth' });
        });
        arrowDownInfo.addEventListener('click', () => {
            this.screenContent.scrollBy({ top: 80, behavior: 'smooth' });
        });

        this.screenContent.addEventListener('scroll', () => this.updateInfoScrollIndicators());

        // ---- Estante de cartuchos ----
        const shelfWrapper = document.createElement('div');
        shelfWrapper.style.cssText = `
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
            width: 100%;
        `;
        content.appendChild(shelfWrapper);

        const shelfContainer = document.createElement('div');
        shelfContainer.style.cssText = `
            width: 80%;
            max-width: 400px;
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            background: #d8ccb8;
            border-radius: 8px;
            padding: 8px 4px 4px 4px;
            border-top: 2px solid #b8a690;
            margin: 0 auto 12px auto;
        `;
        shelfWrapper.appendChild(shelfContainer);

        // Barra de categorías
        const categoryBar = document.createElement('div');
        categoryBar.style.cssText = `
            display: flex;
            gap: 4px;
            padding: 0 4px 6px 4px;
            overflow-x: auto;
            flex-shrink: 0;
            scrollbar-width: none;
            flex-wrap: wrap;
        `;
        categoryBar.innerHTML = `
            <button class="cat-btn" data-cat="all" style="background:#8a3a2a;color:#f0e6d4;border:none;padding:2px 12px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:bold;text-transform:uppercase;box-shadow:0 2px 0 #4a1a0a;">Todos</button>
            ${this.getCategories().filter(c => c.id !== 'hidden').map(cat => `
                <button class="cat-btn" data-cat="${cat.id}" style="background:#b8a690;color:#3a2a1a;border:1px solid #8a7a6a;padding:2px 12px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:11px;text-transform:uppercase;">${cat.label}</button>
            `).join('')}
        `;
        shelfContainer.appendChild(categoryBar);

        // Contenedor del grid con scroll oculto y flechas
        const gridWrapper = document.createElement('div');
        gridWrapper.style.cssText = `
            position: relative;
            flex: 1;
            min-height: 0;
            overflow: hidden;
        `;
        shelfContainer.appendChild(gridWrapper);

        // Grid de cartuchos
        this.cartridgeGrid = document.createElement('div');
        this.cartridgeGrid.className = 'cartridge-grid';
        this.cartridgeGrid.style.cssText = `
            height: 100%;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
            gap: 10px;
            padding: 4px 2px 4px 2px;
            overflow-y: auto;
            align-content: start;
            box-sizing: border-box;
        `;
        gridWrapper.appendChild(this.cartridgeGrid);

        // Flechas para el grid de cartuchos
        const arrowUpCart = document.createElement('div');
        arrowUpCart.className = 'scroll-arrow-up-cart';
        arrowUpCart.textContent = '▲';
        arrowUpCart.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            color: #3a2a1a;
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            cursor: pointer;
            z-index: 6;
            text-shadow: 0 0 8px rgba(216, 204, 184, 0.8);
            background: rgba(216, 204, 184, 0.7);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        gridWrapper.appendChild(arrowUpCart);

        const arrowDownCart = document.createElement('div');
        arrowDownCart.className = 'scroll-arrow-down-cart';
        arrowDownCart.textContent = '▼';
        arrowDownCart.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            color: #3a2a1a;
            font-size: 18px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
            cursor: pointer;
            z-index: 6;
            text-shadow: 0 0 8px rgba(216, 204, 184, 0.8);
            background: rgba(216, 204, 184, 0.7);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        gridWrapper.appendChild(arrowDownCart);

        this.arrowUpCart = arrowUpCart;
        this.arrowDownCart = arrowDownCart;

        // Eventos para flechas del grid
        arrowUpCart.addEventListener('click', () => {
            this.cartridgeGrid.scrollBy({ top: -80, behavior: 'smooth' });
        });
        arrowDownCart.addEventListener('click', () => {
            this.cartridgeGrid.scrollBy({ top: 80, behavior: 'smooth' });
        });

        this.cartridgeGrid.addEventListener('scroll', () => this.updateCartridgeScrollIndicators());

        // ---- Decoración inferior (botones) ----
        const decorContainer = document.createElement('div');
        decorContainer.style.cssText = `
            width: 80%;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
            margin-top: auto;
            margin-bottom: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            background: #d0c0a8;
            border-radius: 8px;
            padding: 8px 14px;
            border: 2px solid #b8a48c;
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1);
        `;
        shelfWrapper.appendChild(decorContainer);

        // Botón Power
        const powerBtn = document.createElement('button');
        powerBtn.textContent = '⏻';
        powerBtn.style.cssText = `
            background: #3a2a1a;
            color: #f0e6d4;
            border: 2px solid #2a1a0a;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            font-size: 20px;
            cursor: pointer;
            box-shadow: inset 0 -3px 0 #1a0a00, 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.1s;
            font-family: 'Courier New', monospace;
        `;
        powerBtn.addEventListener('mouseenter', () => {
            powerBtn.style.transform = 'scale(1.05)';
        });
        powerBtn.addEventListener('mouseleave', () => {
            powerBtn.style.transform = 'scale(1)';
        });
        powerBtn.addEventListener('mousedown', () => {
            powerBtn.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)';
        });
        powerBtn.addEventListener('mouseup', () => {
            powerBtn.style.boxShadow = 'inset 0 -3px 0 #1a0a00, 0 2px 4px rgba(0,0,0,0.3)';
        });
        powerBtn.addEventListener('click', () => {
            playClickSound();
            this.isScreenOff = !this.isScreenOff;
            if (this.isScreenOff) {
                this.screenContent.style.display = 'none';
                powerBtn.textContent = '⏻';
                powerBtn.style.background = '#8a3a2a';
            } else {
                this.screenContent.style.display = 'flex';
                powerBtn.textContent = '⏻';
                powerBtn.style.background = '#3a2a1a';
                if (this.isInstallMode) {
                    this.showInstallMessage();
                } else if (this.currentGameId) {
                    const game = this.getGame(this.currentGameId);
                    if (game) this.updateScreen(game);
                    else this.updateScreen(null);
                } else {
                    this.updateScreen(null);
                }
            }
        });
        decorContainer.appendChild(powerBtn);

        // Botón Install
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Install';
        installBtn.style.cssText = `
            background: #6a4a3a;
            color: #f0e6d4;
            border: 2px solid #4a2a1a;
            border-radius: 6px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: inset 0 -3px 0 #3a1a0a, 0 2px 4px rgba(0,0,0,0.3);
            font-family: 'Courier New', monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.1s;
        `;
        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'scale(1.02)';
            installBtn.style.background = '#7a5a4a';
        });
        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'scale(1)';
            installBtn.style.background = '#6a4a3a';
        });
        installBtn.addEventListener('mousedown', () => {
            installBtn.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)';
        });
        installBtn.addEventListener('mouseup', () => {
            installBtn.style.boxShadow = 'inset 0 -3px 0 #3a1a0a, 0 2px 4px rgba(0,0,0,0.3)';
        });
        installBtn.addEventListener('click', () => {
            playClickSound();
            this.showInstallMessage();
        });
        decorContainer.appendChild(installBtn);

        // USB
        const usbContainer = document.createElement('div');
        usbContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 4px;
            background: #4a3a2a;
            border: 2px solid #2a1a0a;
            border-radius: 4px;
            padding: 2px 6px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
        `;
        const usbPort = document.createElement('div');
        usbPort.className = 'usb-port';
        usbPort.style.cssText = `
            width: 16px;
            height: 12px;
            background: #2a1a0a;
            border-radius: 2px;
            border: 1px solid #1a0a00;
            box-shadow: inset 0 0 4px rgba(0,0,0,0.5);
        `;
        const usbLabel = document.createElement('span');
        usbLabel.textContent = 'USB';
        usbLabel.style.cssText = `
            color: #f0e6d4;
            font-size: 8px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.5px;
            opacity: 0.7;
        `;
        usbContainer.appendChild(usbPort);
        usbContainer.appendChild(usbLabel);
        decorContainer.appendChild(usbContainer);

        // Guardar referencias
        this.tvContainer = tvContainer;
        this.shelfContainer = shelfContainer;
        this.categoryBar = categoryBar;
        this.powerBtn = powerBtn;
        this.installBtn = installBtn;
        this.decorContainer = decorContainer;
        this.screenBg = screenBg;

        // Inicializar indicadores
        this.updateInfoScrollIndicators();
        this.updateCartridgeScrollIndicators();
    }

    // ---------- Mostrar mensaje de instalación ----------
    showInstallMessage() {
        if (this.isFullscreen) this.closeFullscreen();

        this.isInstallMode = true;
        if (this.isScreenOff) {
            this.screenContent.style.display = 'none';
            return;
        }
        this.screenContent.style.display = 'flex';
        this.screenContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; color:#1a3a0a; gap:12px;">
                <span style="font-size:28px;">💾</span>
                <span style="font-size:16px; font-weight:bold;">Conecte un USB para instalar contenido</span>
                <span style="font-size:12px; opacity:0.6;">Insertar cartucho para cancelar</span>
            </div>
        `;
        this.currentGameId = null;
        this.renderCartridges(this.currentCategory);
        this.updateInfoScrollIndicators();
    }

    // ---------- Actualizar pantalla con información del juego ----------
    updateScreen(game) {
        if (this.isFullscreen) this.closeFullscreen();

        if (this.isInstallMode) {
            this.isInstallMode = false;
        }
        if (this.isScreenOff) {
            this.screenContent.style.display = 'none';
            return;
        }
        this.screenContent.style.display = 'flex';

        if (!game) {
            this.screenContent.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:16px; opacity:0.6; text-align:center; color:#1a3a0a;">
                    <div>
                        <span style="display:block; font-size:28px; margin-bottom:6px;">🎮</span>
                        Selecciona un cartucho
                    </div>
                </div>
            `;
            this.updateInfoScrollIndicators();
            return;
        }

        let html = `
            <div style="display:flex; flex-direction:column; gap:4px; height:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #4a6b0a; padding-bottom:4px;">
                    <div style="display:flex; flex-direction:column; gap:2px;">
                        <span style="font-size:18px; font-weight:bold; color:#1a3a0a;">${game.title}</span>
                        <div style="display:flex; gap:8px; font-size:12px; opacity:0.7; color:#1a3a0a; flex-wrap:wrap;">
                            ${game.year ? `<span>${game.year}</span>` : ''}
                            ${game.descargas ? `<span>⬇ ${game.descargas}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; font-size:11px; color:#1a3a0a;">
                    ${game.platform ? `<span style="border:1px solid #4a6b0a; padding:0 3px; border-radius:4px;">${game.platform}</span>` : ''}
                    ${game.categories.map(catId => {
                        const cat = this.getCategories().find(c => c.id === catId);
                        return cat ? `<span style="opacity:0.7;">#${cat.label}</span>` : '';
                    }).join('')}
                </div>
                <div style="flex:1; overflow-y:auto; font-size:12px; line-height:1.4; margin-top:4px; padding-right:4px; color:#1a3a0a;">
                    ${game.description || ''}
                </div>
                ${game.screenshots && game.screenshots.length > 0 ? `
                    <div style="display:flex; gap:6px; overflow-x:auto; padding:4px 0; flex-shrink:0;">
                        ${game.screenshots.map(url => `
                            <img src="${url}" style="height:60px; border:2px solid #4a6b0a; border-radius:4px; object-fit:cover; flex-shrink:0; cursor:pointer;" data-url="${url}" />
                        `).join('')}
                    </div>
                ` : ''}
                <div style="display:flex; gap:8px; margin-top:4px; flex-wrap:wrap; border-top:1px solid #4a6b0a; padding-top:6px;">
                    ${game.itchUrl ? `<a href="${game.itchUrl}" target="_blank" style="color:#1a3a0a; text-decoration:none; border:1px solid #4a6b0a; padding:2px 10px; border-radius:16px; font-size:11px; background:rgba(0,0,0,0.05);">▶ Jugar</a>` : ''}
                    ${game.playStoreUrl ? `<a href="${game.playStoreUrl}" target="_blank" style="color:#1a3a0a; text-decoration:none; border:1px solid #4a6b0a; padding:2px 10px; border-radius:16px; font-size:11px; background:rgba(0,0,0,0.05);">▶ Play Store</a>` : ''}
                    ${game.collaborators && game.collaborators.length > 0 ? `<span style="opacity:0.6; font-size:12px; color:#1a3a0a;">${game.collaborators.join(', ')}</span>` : ''}
                </div>
            </div>
        `;
        this.screenContent.innerHTML = html;
        this.attachImageClickListeners();
        this.updateInfoScrollIndicators();
    }

    // ---------- Asignar eventos de clic a las imágenes ----------
    attachImageClickListeners() {
        this.screenContent.querySelectorAll('img[data-url]').forEach(img => {
            img.removeEventListener('click', this._imageClickHandler);
            this._imageClickHandler = (e) => {
                e.stopPropagation();
                if (!this.isScreenOff && !this.isFullscreen) {
                    this.openFullscreenImage(img.dataset.url);
                }
            };
            img.addEventListener('click', this._imageClickHandler);
        });
    }

    // ---------- Fullscreen de imagen ----------
    openFullscreenImage(url) {
        if (this.isScreenOff || this.isFullscreen) return;
        this._savedContentHTML = this.screenContent.innerHTML;
        this.isFullscreen = true;

        this.screenContent.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%; cursor:pointer; background:#9bbc0f; border-radius:12px;">
                <img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain; border:none; box-shadow:0 0 20px rgba(0,0,0,0.3); border-radius:10px;" />
            </div>
        `;

        this._fullscreenCloseHandler = (e) => {
            if (e.target === this.screenContent || e.target.tagName === 'IMG') {
                this.closeFullscreen();
            }
        };
        this.screenContent.addEventListener('click', this._fullscreenCloseHandler);
        this.updateInfoScrollIndicators();
    }

    closeFullscreen() {
        if (!this.isFullscreen) return;
        if (this._savedContentHTML) {
            this.screenContent.innerHTML = this._savedContentHTML;
            this._savedContentHTML = null;
            this.attachImageClickListeners();
        }
        if (this._fullscreenCloseHandler) {
            this.screenContent.removeEventListener('click', this._fullscreenCloseHandler);
            this._fullscreenCloseHandler = null;
        }
        this.isFullscreen = false;
        this.updateInfoScrollIndicators();
    }

    // ---------- Renderizar cartuchos ----------
    renderCartridges(categoryId = 'all') {
        const games = this.getGamesByCategory(categoryId);
        this.filteredGames = games;
        this.cartridgeGrid.innerHTML = '';

        if (games.length === 0) {
            this.cartridgeGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; opacity:0.4; padding:20px; color:#2c1f14;">No hay cartuchos</div>`;
            this.updateCartridgeScrollIndicators();
            return;
        }

        games.forEach(game => {
            const cart = document.createElement('div');
            cart.className = 'cartridge-item';
            cart.dataset.id = game.id;
            cart.style.cssText = `
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 4px;
                border-radius: 6px;
                border: 2px solid transparent;
                transition: all 0.15s;
                background: #c0392b;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 0 #922b21;
                text-align: center;
                position: relative;
                aspect-ratio: 1/1;
                justify-content: center;
            `;
            cart.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; width:100%; height:100%;">
                    <span style="font-size:13px; color:#f5e6d3; font-weight:bold; text-shadow:0 1px 2px rgba(0,0,0,0.5); text-align:center; line-height:1.2; max-width:100%; padding:0 2px; word-break:break-word;">${game.title}</span>
                </div>
            `;
            cart.addEventListener('click', () => {
                playClickSound();
                this.selectGame(game.id);
            });
            cart.addEventListener('mouseenter', () => {
                cart.style.transform = 'scale(1.03)';
                cart.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4), inset 0 -2px 0 #922b21';
                cart.style.borderColor = '#e67e22';
            });
            cart.addEventListener('mouseleave', () => {
                cart.style.transform = 'scale(1)';
                cart.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 0 #922b21';
                if (this.currentGameId !== game.id) {
                    cart.style.borderColor = 'transparent';
                }
            });
            if (game.id === this.currentGameId) {
                cart.style.borderColor = '#f1c40f';
                cart.style.boxShadow = '0 0 0 2px #f1c40f, 0 2px 4px rgba(0,0,0,0.3)';
                cart.style.background = '#e74c3c';
            }
            this.cartridgeGrid.appendChild(cart);
        });

        this.updateCartridgeScrollIndicators();
    }

    // ---------- Seleccionar juego ----------
    selectGame(gameId) {
        if (this.isFullscreen) this.closeFullscreen();

        if (this.isInstallMode) {
            this.isInstallMode = false;
        }
        if (!gameId) {
            this.currentGameId = null;
            this.updateScreen(null);
            this.renderCartridges(this.currentCategory);
            return;
        }
        const game = this.getGame(gameId);
        if (!game) return;
        this.currentGameId = gameId;
        this.updateScreen(game);
        this.renderCartridges(this.currentCategory);
        const cartEl = this.cartridgeGrid.querySelector(`[data-id="${gameId}"]`);
        if (cartEl) {
            cartEl.style.transform = 'scale(0.95)';
            setTimeout(() => cartEl.style.transform = 'scale(1)', 150);
            cartEl.style.borderColor = '#f1c40f';
            cartEl.style.boxShadow = '0 0 0 2px #f1c40f, 0 2px 4px rgba(0,0,0,0.3)';
            cartEl.style.background = '#e74c3c';
        }
    }

    // ---------- Eventos de categorías ----------
    bindEvents() {
        this.categoryBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.cat-btn');
            if (!btn) return;
            const cat = btn.dataset.cat;
            this.currentCategory = cat;
            this.categoryBar.querySelectorAll('.cat-btn').forEach(b => {
                if (b.dataset.cat === cat) {
                    b.style.background = '#8a3a2a';
                    b.style.color = '#f0e6d4';
                    b.style.borderColor = '#8a3a2a';
                } else {
                    b.style.background = '#b8a690';
                    b.style.color = '#3a2a1a';
                    b.style.borderColor = '#8a7a6a';
                }
            });
            this.renderCartridges(cat);
            if (this.currentGameId && !this.getGamesByCategory(cat).some(g => g.id === this.currentGameId)) {
                this.selectGame(null);
            }
        });
        const allBtn = this.categoryBar.querySelector('.cat-btn[data-cat="all"]');
        if (allBtn) allBtn.click();
    }

    // ---------- Conexión USB ----------
    onCableConnected() {
        this.showConnectionSuccess();
    }

    showConnectionSuccess() {
        if (this.isScreenOff) {
            this.isScreenOff = false;
            this.screenContent.style.display = 'flex';
            this.powerBtn.textContent = '⏻';
            this.powerBtn.style.background = '#3a2a1a';
        }

        const target = 'PC11042005';
        let index = 0;
        const prefix = '[';
        const suffix = ']';

        this.screenContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; color:#1a3a0a; gap:8px;">
                <div style="font-size:16px; font-weight:bold; color:#1a3a0a;">Conexión establecida</div>
                <div id="connection-glitch" style="font-size:14px; font-family:'Courier New', monospace; color:#1a3a0a; min-height:1.5em;"></div>
                <div style="font-size:12px; opacity:0.7; margin-top:4px;">Pulse 'Instalar' para comenzar la transferencia de datos...</div>
            </div>
        `;

        const glitchEl = this.screenContent.querySelector('#connection-glitch');
        if (!glitchEl) return;

        const animateText = () => {
            if (index <= target.length) {
                const revealed = target.substring(0, index);
                const remaining = target.length - index;
                const randomPart = this.generateGlitchString(remaining);
                glitchEl.textContent = `${prefix}${revealed}${randomPart}${suffix}`;
                index++;
                setTimeout(animateText, 150);
            } else {
                glitchEl.textContent = `${prefix}${target}${suffix}`;
                glitchEl.style.color = '#ff0000';
            }
        };

        setTimeout(animateText, 300);
        this.updateInfoScrollIndicators();
    }

    generateGlitchString(length = 5) {
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>/?abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // ---------- Indicadores de scroll para la pantalla de información ----------
    updateInfoScrollIndicators() {
        if (!this.screenContent) return;
        const { scrollTop, scrollHeight, clientHeight } = this.screenContent;
        const canScrollUp = scrollTop > 5;
        const canScrollDown = scrollTop + clientHeight < scrollHeight - 5;

        this.arrowUpInfo.style.opacity = canScrollUp ? '0.8' : '0';
        this.arrowUpInfo.style.pointerEvents = canScrollUp ? 'auto' : 'none';
        this.arrowDownInfo.style.opacity = canScrollDown ? '0.8' : '0';
        this.arrowDownInfo.style.pointerEvents = canScrollDown ? 'auto' : 'none';
    }

    // ---------- Indicadores de scroll para el grid de cartuchos ----------
    updateCartridgeScrollIndicators() {
        if (!this.cartridgeGrid) return;
        const { scrollTop, scrollHeight, clientHeight } = this.cartridgeGrid;
        const canScrollUp = scrollTop > 5;
        const canScrollDown = scrollTop + clientHeight < scrollHeight - 5;

        this.arrowUpCart.style.opacity = canScrollUp ? '0.8' : '0';
        this.arrowUpCart.style.pointerEvents = canScrollUp ? 'auto' : 'none';
        this.arrowDownCart.style.opacity = canScrollDown ? '0.8' : '0';
        this.arrowDownCart.style.pointerEvents = canScrollDown ? 'auto' : 'none';
    }

    // ---------- Cerrar ventana ----------
    close() {
        if (this.isFullscreen) this.closeFullscreen();
        const event = new CustomEvent('gameWindowClosed', {
            detail: { window: this }
        });
        document.dispatchEvent(event);
        window.gameWindowInstance = null;
        super.close();
    }
}
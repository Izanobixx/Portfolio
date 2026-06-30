import { Window } from "./Window";
import { EmbedWindow } from './EmbedWindow.js';
import 'turn.js';
import $ from 'jquery';
import { questions } from "../questions.js";

window.$ = $;

export class MusicBookWindow extends Window {

    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || 'Líbro_de_música_1104.exe',
            width: options.width || 1800,
            height: options.height || 1400,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.element.style.zIndex = 99999;
        this.manager.bringToFront(this);

        this.tracksData = {
            'Euforia': {
                year: '2025',
                duration: '03:27',
                url: 'https://musescore.com/user/29082442/scores/24891487',
                title: 'Euforia_v012.msc'
            },
            '20 de diciembre': {
                year: '2024',
                duration: 'π',
                url: 'https://musescore.com/user/29082442/scores/22494373',
                title: '20_de_diciembre_FINAL_FINAL.msc'
            },
            'El carambolo': {
                year: '2023',
                duration: '1:57',
                url: 'https://musescore.com/user/29082442/scores/21944557',
                title: 'El_caramboulou.msc'
            },
            'Outro': {
                year: '2025',
                duration: '1:18',
                url: 'https://musescore.com/user/29082442/scores/25673938',
                title: 'Outro_max.msc'
            },
            'Noche de Elfos': {
                year: '2023',
                duration: '1:14',
                url: 'https://musescore.com/user/29082442/scores/21993256',
                title: 'Navideña_3.msc'
            },
            'OG-Canadá': {
                year: '2024',
                duration: '3:00',
                url: 'https://musescore.com/user/29082442/scores/22019152',
                title: 'OG_1.msc'
            },
            'OG-Perú': {
                year: '2024',
                duration: '0:51',
                url: 'https://musescore.com/user/29082442/scores/21999301',
                title: 'OG_2.msc'
            },
            'OG-País Vasco': {
                year: '2024',
                duration: '1:45',
                url: 'https://musescore.com/user/29082442/scores/22016008',
                title: 'OG_3.msc'
            },
            'OG-Marruecos': {
                year: '2024',
                duration: '3:31',
                url: 'https://musescore.com/user/29082442/scores/22047583',
                title: 'OG_4.msc'
            },
            'As The World Caves In': {
                year: '2026',
                duration: '3:17',
                url: 'https://musescore.com/user/29082442/scores/30596555',
                title: 'As_he_world_caves_in.msc'
            }
        };
        this.compositionCategories = [
            { name: 'Orquestal', items: ['Euforia', 'OG-Canadá'] },
            { name: 'Piano', items: ['20 de diciembre', 'Outro', 'As The World Caves In'] },
            { name: 'Suite OG', items: ['OG-Canadá', 'OG-Perú', 'OG-País Vasco', 'OG-Marruecos'] },
            { name: 'Arr.', items: ['As The World Caves In'] },
            { name: 'Otras', items: ['Noche de Elfos', 'El carambolo'] }
        ];

        this.worksData = [
            {
                title: 'Influencia de la música afroamericana en la 9º Sinfonía de Antonín Dvorák',
                subtitle: 'Un análisis de la unión cultural en la música clásica del siglo XIX',
                year: '2023',
                description: 'Trabajo final de la asignatura de Historia de la Música. Explora cómo los ritmos y melodías afroamericanos influyeron en la obra de Dvorák, y cómo esta fusión refleja un momento de intercambio cultural en la música clásica del siglo XIX.',
                file: import.meta.env.BASE_URL + 'pdfs/Trabajo.pdf'
            },
            {
                title: 'El lied romántico y «Der Zwerg» de Schubert',
                subtitle: 'Música y poesía',
                year: '2022',
                description: 'Análisis del lied «Der Zwerg», donde se explica cómo Schubert usa una melodía repetitiva y un bajo inquietante para reflejar la soledad y la tensión dramática del poema, logrando una profunda unión entre música y texto.',
                file: import.meta.env.BASE_URL + 'pdfs/DerZwerg.pdf'
            },
            {
                title: 'Los tratados teóricos de Rameau',
                subtitle: 'Resumen de la sistematización de la armonía en el siglo XVIII',
                year: '2022',
                description: 'Resumen de los seis tratados de Jean‑Philippe Rameau, que, sin aportar descubrimientos revolucionarios, recopilaron y ordenaron los conocimientos armónicos de su época para facilitar su estudio y difusión.',
                file: import.meta.env.BASE_URL + 'pdfs/Rameau.pdf'
            },
            {
                title: 'El Lacrimosa de Mozart: del Réquiem al meme',
                subtitle: '',
                year: '2022',
                description: 'Breve recorrido por el último movimiento del Réquiem de Mozart, destacando su breve letra, su estilo galante y su inesperado resurgimiento en la cultura popular gracias a los memes',
                file: import.meta.env.BASE_URL + 'pdfs/Requiem.pdf'
            }
        ];

        const baseWidth = 1050;
        const baseHeight = 750;
        const padding = 80;
        const availWidth = window.innerWidth - padding;
        const availHeight = window.innerHeight - padding;
        const scaleX = availWidth / baseWidth;
        const scaleY = availHeight / baseHeight;
        this.scaleFactor = Math.min(1, scaleX, scaleY);
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;

        this.element.classList.add('frameless');
        const titlebar = this.element.querySelector('.xp-titlebar');
        if (titlebar) titlebar.style.display = 'none';
        this.element.style.border = 'none';
        this.element.style.boxShadow = 'none';
        this.element.style.borderRadius = '8px';
        this.element.style.overflow = 'hidden';
        this.element.style.background = 'transparent';
        this.element.style.webkitBackdropFilter = 'blur(10px)';
        this.element.style.backdropFilter = 'blur(10px)';

        const content = this.element.querySelector('.xp-content');
        if (content) {
            content.style.padding = '40px';
            content.style.overflow = 'visible';
            content.style.background = 'transparent';
            content.style.borderRadius = '8px';
            content.style.display = 'flex';
            content.style.alignItems = 'center';
            content.style.justifyContent = 'center';
            content.style.pointerEvents = 'none';
        }

        const handles = this.element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());

        this.renderBook(content);
    }

    buildCompositionsHTML() {
        let html = `
            <div style="padding:40px; background: transparent; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                <style>
                    /* Oculta la barra de scroll en todos los navegadores */
                    .compositions-scroll {
                        overflow-y: auto;
                        scrollbar-width: none; /* Firefox */
                        -ms-overflow-style: none; /* IE/Edge */
                    }
                    .compositions-scroll::-webkit-scrollbar {
                        display: none; /* Chrome/Safari/Opera */
                    }
                </style>
                <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">Mis Composiciones</h2>
                
                <div style="
                    margin: 16px 0 24px 0;
                    padding: 16px 20px;
                    background: #f0e8dc;
                    border-left: 4px solid #8b6b4c;
                    border-radius: 0 6px 6px 0;
                    font-style: italic;
                    color: #4a2c1a;
                    font-size: 15px;
                    line-height: 1.6;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                ">
                    <span style="font-weight: bold; color: #2c1810;">⚠️ ATENCIÓN:</span>
                    Las siguientes composiciones han sido creadas por un ser humano (yo). 
                    Si encuentras algún error, por favor, no se lo chives a mi profesor de armonía. 
                </div>

                <div id="compositions-container" class="compositions-scroll">
        `;
        this.compositionCategories.forEach(cat => {
            const isOpen = cat.name === 'Orquestal' ? ' open' : '';
            html += `<details${isOpen} style="margin-bottom:12px;"><summary style="font-weight:bold; font-size:18px; cursor:pointer; color:#2c1810;">${cat.name}</summary><div style="padding-left:20px; margin-top:8px;">`;
            cat.items.forEach(item => {
                const data = this.tracksData[item];
                if (data) {
                    html += `<div class="song-item" data-track="${item}" style="padding:8px 0; border-bottom:1px solid #e0d6c8; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                        <span>${item}</span>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="color:#6b4c3a; font-size:14px;">${data.year} · ${data.duration}</span>
                            <button class="play-btn-small" style="background:#2c1810; color:white; border:none; padding:3px 12px; border-radius:4px; cursor:pointer; font-size:12px; transition: background 0.2s;">
                                ▶ Escuchar
                            </button>
                        </div>
                    </div>`;
                }
            });
            html += `</div></details>`;
        });
        html += `</div></div>`;
        return html;
    }

    buildWorksHTML() {
        let html = `
            <div style="padding:40px; background: transparent; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                <style>
                    .works-scroll::-webkit-scrollbar { display: none; }
                </style>
                <div class="works-scroll" style="height:100%; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                    <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">Trabajos de Conservatorio</h2>
                    <div style="margin-top:20px;">
        `;
        this.worksData.forEach(work => {
            html += `
                <div style="background: #fff; padding:15px; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:15px;">
                    <h3 style="color:#2c1810; margin:0; font-size:18px;">${work.title}</h3>
                    ${work.subtitle ? `<p style="font-style:italic; color:#6b4c3a; margin:4px 0; font-size:14px;">${work.subtitle}</p>` : ''}
                    <p style="color:#3d2b1a; font-size:14px; margin:6px 0;">${work.year}</p>
                    <p style="color:#3d2b1a; font-size:14px; line-height:1.5;">${work.description}</p>
                    <button class="pdf-btn" data-file="${work.file}" style="margin-top:10px; background:#2c1810; color:white; border:none; padding:6px 16px; border-radius:4px; cursor:pointer; font-size:14px;">📄 Abrir PDF</button>
                </div>
            `;
        });
        html += `</div></div></div>`;
        return html;
    }

    openPDF(file, title) {
        const width = 400;
        const height = 600;
        const centerX = window.innerWidth / 2 - width / 2;
        const centerY = window.innerHeight / 2 - height / 2;
        const embedCode = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; background:#f0f0f0;">
                        <embed src="${file}" style="flex:1; width:100%; border:none;" type="application/pdf">
                        <div style="font-size:11px; text-align:center; padding:4px; background:#e8e8e8; border-top:1px solid #ccc;">
                            <a href="${file}" download style="color:#0047ab; text-decoration:none;">Descargar PDF</a>
                        </div>
                    </div>
                `;
        this.manager.createWindow(EmbedWindow, {
            title: title || 'Documento',
            width: width,
            height: height,
            x: centerX,
            y: centerY,
            originX: centerX,
            originY: centerY,
            embedCode: embedCode
        });
    }

    getPages() {
        return [
            {
                title: 'Portada',
                content: `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background-image: url('${import.meta.env.BASE_URL}images/portada2.png'); background-size: cover; background-position: center; padding:40px; box-sizing:border-box; font-family: 'Georgia', serif; overflow:hidden; position:relative;">
                    </div>
                `
            },
            {
                title: 'Índice',
                content: `
                    <div style="display:flex; flex-direction:column; height:100%; padding:40px; box-sizing:border-box; background: transparent; font-family: 'Georgia', serif;">
                        <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:12px; margin:0 0 24px 0; text-align:left; font-size:28px; letter-spacing:1px;">
                            Índice
                        </h2>
                        
                        <!-- Capítulos (ocupan todo el ancho) -->
                        <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:24px;">
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e8d9c8;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">01</span>
                                <a href="#" data-page="2" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Estudios Musicales
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e8d9c8;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">02</span>
                                <a href="#" data-page="3" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Composiciones
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e8d9c8;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">03</span>
                                <a href="#" data-page="4" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Trabajos
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e8d9c8;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">04</span>
                                <a href="#" data-page="5" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Trivia Musical
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e8d9c8;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">05</span>
                                <a href="#" data-page="6" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Aptitudes
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0;">
                                <span style="font-size:14px; color:#8b6b4c; font-weight:bold; min-width:30px;">06</span>
                                <a href="#" data-page="7" style="color:#2c1810; text-decoration:none; font-size:18px; transition:color 0.2s; flex:1;"
                                onmouseenter="this.style.color='#8b6b4c'" onmouseleave="this.style.color='#2c1810'">
                                    Contraportada
                                </a>
                                <span style="font-size:14px; color:#8b6b4c;">→</span>
                            </div>
                        </div>

                        <!-- Video (debajo del índice, ocupando el espacio restante) -->
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-start; background:rgba(255,248,235,0.4); border-radius:12px; margin-top:-20px; padding:16px; border:1px solid #e8d9c8;">
                            <p style="font-size:14px; color:#6b4c3a; margin:0 0 10px 0; text-align:center; font-style:italic; letter-spacing:0.5px; margin-top:-10px;">
                                Doctor Gradus Ad Parnassum — Debussy
                            </p>
                            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
                                <iframe 
                                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
                                    src="https://www.youtube.com/embed/RtNzACtsnCk" 
                                    title="Doctor Gradus Ad Parnassum - Izan Pinto"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                            <p style="font-size:12px; color:#8b6b4c; margin:8px 0 0 0; text-align:center; font-style:italic; margin-bottom:-15px;">
                                Yo con ~14 años
                            </p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Estudios Musicales',
                content: this.getEstudiosContent()
            },
            {
                title: 'Composiciones',
                content: this.buildCompositionsHTML()
            },
            {
                title: 'Trabajos',
                content: this.buildWorksHTML()
            },
            {
                title: 'Trivia Musical',
                content: `
                    <div style="padding:40px; background: transparent; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; display:flex; flex-direction:column; overflow:hidden;">
                        <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">Trivia Musical</h2>
                        <div id="quiz-container" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:20px;">
                            <p id="quiz-question" style="font-size:22px; color:#2c1810; text-align:center; margin-bottom:30px;"></p>
                            <div id="quiz-options" style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:400px;"></div>
                            <div id="quiz-result" style="margin-top:20px; font-size:18px; color:#2c1810;"></div>
                            <button id="quiz-restart" style="display:none; margin-top:20px; padding:8px 20px; background:#2c1810; color:white; border:none; border-radius:4px; cursor:pointer;">🔄 Más preguntas</button>
                        </div>
                    </div>
                `
            },
            {
                title: 'Aptitudes',
                content: `
                    <div style="display:flex; flex-direction:column; height:100%; padding:30px 40px 40px 40px; box-sizing:border-box; background: transparent; font-family: 'Georgia', serif;">
                        <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:8px; margin:0 0 16px 0; text-align:left;">Aptitudes</h2>
                        
                        <!-- Instrumentos (ocupan todo el ancho) -->
                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; margin-top: 35px;">
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e0d6c8;">
                                <div style="flex:1;">
                                    <span style="font-weight:bold; color:#2c1810;">Piano</span>
                                    <span style="color:#6b4c3a; font-size:14px; margin-left:8px;">— Profesional</span>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e0d6c8;">
                                <div style="flex:1;">
                                    <span style="font-weight:bold; color:#2c1810;">Guitarra</span>
                                    <span style="color:#6b4c3a; font-size:14px; margin-left:8px;">— Amateur</span>
                                    <span style="font-size:12px; color:#8b6b4c; font-style:italic; margin-left:8px;">(sé suficientes acordes para fingir)</span>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:12px; padding:6px 0; border-bottom:1px solid #e0d6c8;">
                                <div style="flex:1;">
                                    <span style="font-weight:bold; color:#2c1810;">Bajo</span>
                                    <span style="color:#6b4c3a; font-size:14px; margin-left:8px;">— Intermedio</span>
                                </div>
                            </div>
                        </div>

                        <!-- Columna doble: imagen y software -->
                        <div style="display:flex; gap:30px; flex:1; align-items:flex-start; margin-top: 35px;">
                            <!-- Imagen (izquierda) -->
                            <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
                                <img src="${import.meta.env.BASE_URL}images/bajo.png" alt="Mi bajo" style="width:100%; max-width:200px; border-radius:6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border:2px solid #d4c4b0;">
                                <p style="font-size:12px; color:#6b4c3a; margin-top:6px; font-style:italic;">Cool AF</p>
                            </div>
                            <!-- Software (derecha) -->
                            <div style="flex:1; display:flex; flex-direction:column; gap:10px;">
                                <p style="font-size:14px; font-weight:bold; color:#2c1810; margin:0 0 4px 0;">Herramientas digitales</p>
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <a href="https://www.reaper.fm" target="_blank" style="display:flex; align-items:center; gap:10px; color:#2c1810; text-decoration:none; font-size:14px; border:1px solid #d4c4b0; border-radius:20px; padding:6px 16px 6px 12px; background:white; transition:all 0.15s;">
                                        <img src="${import.meta.env.BASE_URL}images/logos/reaper.png" alt="Reaper" style="height:22px; width:auto;">
                                        <span>Reaper</span>
                                    </a>
                                    <a href="https://musescore.org" target="_blank" style="display:flex; align-items:center; gap:10px; color:#2c1810; text-decoration:none; font-size:14px; border:1px solid #d4c4b0; border-radius:20px; padding:6px 16px 6px 12px; background:white; transition:all 0.15s;">
                                        <img src="${import.meta.env.BASE_URL}images/logos/musescore.png" alt="MuseScore" style="height:22px; width:auto;">
                                        <span>MuseScore</span>
                                    </a>
                                    <a href="https://www.cakewalk.com" target="_blank" style="display:flex; align-items:center; gap:10px; color:#2c1810; text-decoration:none; font-size:14px; border:1px solid #d4c4b0; border-radius:20px; padding:6px 16px 6px 12px; background:white; transition:all 0.15s;">
                                        <img src="${import.meta.env.BASE_URL}images/logos/cakewalk.png" alt="Cakewalk" style="height:22px; width:auto;">
                                        <span>Cakewalk by Bandlab</span>
                                    </a>
                                    <a href="https://supercollider.github.io" target="_blank" style="display:flex; align-items:center; gap:10px; color:#2c1810; text-decoration:none; font-size:14px; border:1px solid #d4c4b0; border-radius:20px; padding:6px 16px 6px 12px; background:white; transition:all 0.15s;">
                                        <img src="${import.meta.env.BASE_URL}images/logos/supercollider.png" alt="Supercollider" style="height:22px; width:auto;">
                                        <span>Supercollider</span>
                                    </a>
                                </div>
                                <p style="font-size:11px; color:#8b6b4c; margin:4px 0 0 0; font-style:italic;">(y algún que otro plugin)</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Contraportada',
                content: `
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background-image: url('${import.meta.env.BASE_URL}images/contraPortada.PNG'); background-size: cover; background-position: center; padding:40px; box-sizing:border-box; font-family: 'Georgia', serif; overflow:hidden; position:relative;">
                    </div>
                `
            }
        ];
    }

    getEstudiosContent() {
        const startYear = 2013;
        const currentYear = new Date().getFullYear();
        const years = currentYear - startYear;
        const yearsText = `${years} años`;

        return `
            <div style="padding:40px; background: transparent; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none; text-align: justify; position:relative;">
                <style>
                    .estudios-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .scroll-indicator {
                        position: absolute;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 28px;
                        color: #8b6b4c;
                        opacity: 0.6;
                        animation: bounce 1.5s infinite;
                        transition: opacity 0.5s ease;
                        pointer-events: none;
                        z-index: 5;
                    }
                    .scroll-indicator.hidden {
                        opacity: 0;
                    }
                    @keyframes bounce {
                        0%, 100% { transform: translateX(-50%) translateY(0); }
                        50% { transform: translateX(-50%) translateY(-8px); }
                    }
                </style>
                <div class="estudios-scroll" style="height:100%; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                    <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px; text-align: left;">Estudios Musicales</h2>
                    <p style="font-size:20px; line-height:1.8; color:#3d2b1a;">
                        Lo que aprendí en ${yearsText}... (y contando)
                    </p>
                    <p style="font-size:14px; line-height:1.8; color:#3d2b1a; margin-top:15px;">
                        Estuve diez años en el <b>Institut Musical Giner</b> de Valencia, la mayoría de ellos peleándome con el piano y fingiendo que entendía la armonía.
                        También andaba metido en coros, como los PCV (<b>Pequeños Cantores de Valencia</b>), donde pude ser solista en frente de <i>miles</i> de personas.
                    </p>
                    <p style="font-size:14px; line-height:1.8; color:#3d2b1a; margin-top:10px;">
                        En 2017, una <b>beca</b> en un concurso de piano me dio un empujón. Desde entonces he ido combinando lo que aprendí en el conservatorio con lo que he ido descubriendo por mi cuenta: <i>producción, composición,</i> y todo lo que haga falta para convertir una idea en algo que suene decente.
                    </p>
                    <div style="width: 100%; text-align: center; margin: 15px 0;">
                        <img src="${import.meta.env.BASE_URL}images/micalet.jpg" alt="Con el director del Institut Musical Giner" style="width: 100%; max-width: 100%; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); height: auto;">
                        <p style="font-size:12px; color:#6b4c3a; margin-top:4px;">Con el director del Giner, 2017</p>
                    </div>
                    <p style="font-size:14px; line-height:1.8; color:#3d2b1a; margin-top:10px;">
                        Todo esto, sumado a unas cuantas asignaturas de <i>historia de la música, análisis, y composición</i> entre otras, me ha dado un lenguaje musical que es un poco mío y un poco de todo lo que he escuchado.
                    </p>
                    <div style="margin-top:20px; font-size: 15px; background:#e8d9c8; padding:15px; border-radius:8px; text-align: left;">
                        <p style="font-style:italic; color:#2c1810; margin:0;">"La música es más importante que la física." — Evil Isaac Newton</p>
                    </div>
                </div>
                <!-- Indicador de scroll -->
                <div class="scroll-indicator" id="scroll-indicator">↓</div>
                <script>
                    (function() {
                        const container = document.querySelector('.estudios-scroll');
                        const indicator = document.getElementById('scroll-indicator');
                        if (container && indicator) {
                            const checkScroll = () => {
                                const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
                                if (isAtBottom) {
                                    indicator.classList.add('hidden');
                                } else {
                                    indicator.classList.remove('hidden');
                                }
                            };
                            container.addEventListener('scroll', checkScroll);
                            // Verificar estado inicial después de cargar
                            setTimeout(checkScroll, 100);
                        }
                    })();
                </script>
            </div>
        `;
    }

    renderBook(content) {
        const pages = this.getPages();
        
        content.style.cssText = `
            background: transparent;
            padding: 40px;
            height: 100%;
            box-sizing: border-box;
            overflow: visible;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            position:relative;
        `;

        const bookContainer = document.createElement('div');
        bookContainer.id = 'music-book';
        bookContainer.style.cssText = `
            width: ${this.baseWidth}px;
            height: ${this.baseHeight}px;
            margin: 0 auto;
            position: relative;
            background: transparent;
            border-radius: 8px;
            overflow: visible;
            pointer-events: auto;
            aspect-ratio: ${this.baseWidth}/${this.baseHeight};
        `;
        content.appendChild(bookContainer);

        // --- Botón de cierre (fijo en la esquina superior derecha) ---
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 36px;
            height: 36px;
            border: 2px solid #8b6b4c;
            border-radius: 50%;
            background: #f9f0e6;
            color: #2c1810;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 12px rgba(0,0,0,0.2);
            transition: all 0.2s;
            pointer-events: auto;
            font-family: 'Georgia', serif;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = '#e8d9c8';
            closeBtn.style.transform = 'scale(1.05)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = '#f9f0e6';
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });
        document.body.appendChild(closeBtn);
        this._closeBtn = closeBtn;

        // --- Crear páginas ---
        pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'book-page';
            pageDiv.dataset.page = index;

            let backgroundStyle = '';
            if (index === 0) {
                backgroundStyle = 'background: transparent;';
            } else if (index % 2 === 0) {
                backgroundStyle = 'background-image: url("' + import.meta.env.BASE_URL + 'images/RightPage.PNG"); background-size: cover; background-position: center;';
            } else {
                backgroundStyle = 'background-image: url("' + import.meta.env.BASE_URL + 'images/LeftPage.PNG"); background-size: cover; background-position: center;';
            }

            pageDiv.style.cssText = `
                padding: 0;
                ${backgroundStyle}
                border-radius: 8px;
                overflow: hidden;
                pointer-events: auto;
            `;
            
            pageDiv.innerHTML = page.content;
            bookContainer.appendChild(pageDiv);
        });

        // --- Inicializar turn.js ---
        const $book = $(bookContainer);
        const scaledWidth = this.baseWidth * this.scaleFactor;
        const scaledHeight = this.baseHeight * this.scaleFactor;

        bookContainer.style.width = `${scaledWidth}px`;
        bookContainer.style.height = `${scaledHeight}px`;

        bookContainer.style.transform = `scale(1)`;
        bookContainer.style.transformOrigin = 'center center';

        $book.turn({
            width: scaledWidth,
            height: scaledHeight,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            when: {
                turned: (e, page) => {
                    this.currentPage = page;
                    this.initQuiz();

                    const totalPages = this.getPages().length;
                    if (page === totalPages && !this._finalDialogShown) {
                        this._finalDialogShown = true;
                        if (window.dialogueManager) {
                            window.dialogueManager.show([
                                { speaker: 'IZAN', text: 'Que curioso...' },
                                { speaker: 'IZAN', text: 'Nunca me había fijado en ese mensaje de ahí'}
                            ]);
                        }
                    }
                }
            }
        });

        // --- Eventos de clic/arrastre para pasar páginas ---
        let pointerDownX = 0;
        let pointerDownY = 0;
        let pointerDownTime = 0;

        bookContainer.addEventListener('pointerdown', (e) => {
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
            pointerDownTime = Date.now();
        });

        bookContainer.addEventListener('pointerup', (e) => {
            const dx = e.clientX - pointerDownX;
            const dy = e.clientY - pointerDownY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const elapsed = Date.now() - pointerDownTime;

            const isClick = distance < 5 && elapsed < 300;

            if (e.target.closest('a, button, .song-item, .pdf-btn, .spotify-btn, .play-btn-small, details, summary')) {
                return;
            }

            if (isClick) {
                const rect = bookContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                if (x > width * 0.5) {
                    $book.turn('next');
                } else {
                    $book.turn('previous');
                }
            }
        });

        // --- Forzar overflow hidden en elementos internos de turn.js ---
        setTimeout(() => {
            bookContainer.querySelectorAll('.turn-page, .flip, .even, .odd, .shadow, .turn-page-wrapper').forEach(el => {
                el.style.overflow = 'hidden';
            });
        }, 100);

        // --- ResizeObserver único ---
        const resizeObserver = new ResizeObserver(() => {

            const padding = 80;

            const scaleX =
                (window.innerWidth - padding) / this.baseWidth;

            const scaleY =
                (window.innerHeight - padding) / this.baseHeight;

            this.scaleFactor = Math.min(1, scaleX, scaleY);


            const newWidth = this.baseWidth * this.scaleFactor;
            const newHeight = this.baseHeight * this.scaleFactor;

            const scale = this.scaleFactor;

            bookContainer.style.transform = `scale(${scale})`;
            bookContainer.style.transformOrigin = 'center center';

            $book.turn('size', this.baseWidth, this.baseHeight);

        });
        

        resizeObserver.observe(bookContainer);
        this._resizeObserver = resizeObserver;

        // --- Eventos de índice y botones ---
        bookContainer.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageNum = parseInt(link.dataset.page, 10) + 1;
                $book.turn('page', pageNum);
            });
        });

        bookContainer.querySelectorAll('.song-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const track = el.dataset.track;
                const data = this.tracksData[track];
                if (data && data.url) {
                    window.open(data.url, '_blank');
                } else {
                    console.warn('No se encontró la URL para:', track);
                }
            });
        });

        bookContainer.querySelectorAll('.pdf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const file = btn.dataset.file;
                const title = btn.closest('div')?.querySelector('h3')?.textContent || 'PDF';
                this.openPDF(file, "trabajo_teo.pdf");
            });
        });
    }

    initQuiz() {
        const container = document.getElementById('quiz-container');
        if (!container) return;

        if (container.dataset.initialized === 'true') return;

        container.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Georgia', serif;
            background: rgba(255, 248, 235, 0.85);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            backdrop-filter: blur(2px);
            position: relative;
        `;

        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 20);
        let currentIndex = 0;
        let score = 0;

        let questionEl = document.getElementById('quiz-question');
        let optionsEl = document.getElementById('quiz-options');
        let resultEl = document.getElementById('quiz-result');
        let progressEl = document.getElementById('quiz-progress');
        let restartBtn = document.getElementById('quiz-restart');

        if (!questionEl) {
            questionEl = document.createElement('p');
            questionEl.id = 'quiz-question';
            container.prepend(questionEl);
        }
        if (!optionsEl) {
            optionsEl = document.createElement('div');
            optionsEl.id = 'quiz-options';
            container.appendChild(optionsEl);
        }
        if (!resultEl) {
            resultEl = document.createElement('div');
            resultEl.id = 'quiz-result';
            container.appendChild(resultEl);
        }
        if (!progressEl) {
            progressEl = document.createElement('div');
            progressEl.id = 'quiz-progress';
            progressEl.style.cssText = `
                font-size: 14px;
                color: #6b4c3a;
                margin-bottom: 16px;
                align-self: flex-start;
                font-style: italic;
            `;
            container.prepend(progressEl);
        }
        if (!restartBtn) {
            restartBtn = document.createElement('button');
            restartBtn.id = 'quiz-restart';
            restartBtn.textContent = '🔄 Más preguntas';
            restartBtn.style.cssText = `
                display: none;
                margin-top: 20px;
                padding: 10px 24px;
                background: #2c1810;
                color: #f9f0e6;
                border: none;
                border-radius: 30px;
                cursor: pointer;
                font-size: 16px;
                font-family: 'Georgia', serif;
                transition: all 0.2s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            `;
            restartBtn.addEventListener('mouseenter', () => {
                restartBtn.style.background = '#4a2c1a';
                restartBtn.style.transform = 'scale(1.02)';
            });
            restartBtn.addEventListener('mouseleave', () => {
                restartBtn.style.background = '#2c1810';
                restartBtn.style.transform = 'scale(1)';
            });
            container.appendChild(restartBtn);
        }

        const showQuestion = () => {
            if (currentIndex >= selected.length) {
                questionEl.style.cssText = `
                    font-size: 24px;
                    color: #2c1810;
                    text-align: center;
                    margin: 20px 0;
                    font-weight: bold;
                `;
                questionEl.textContent = `¡Has completado el trivia! Puntuación: ${score}/${selected.length}`;
                optionsEl.innerHTML = '';
                resultEl.innerHTML = '';
                progressEl.textContent = '';
                restartBtn.style.display = 'inline-block';
                return;
            }

            const q = selected[currentIndex];
            const optionsCopy = [...q.options];
            const shuffledOptions = optionsCopy.sort(() => Math.random() - 0.5);
            const newCorrectIndex = shuffledOptions.indexOf(q.options[q.correct]);

            questionEl.style.cssText = `
                font-size: 22px;
                color: #2c1810;
                text-align: center;
                margin: 0 0 20px 0;
                line-height: 1.4;
                font-weight: bold;
            `;
            questionEl.textContent = q.question;

            progressEl.textContent = `Pregunta ${currentIndex + 1} de ${selected.length}`;

            optionsEl.innerHTML = '';
            optionsEl.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
                max-width: 450px;
                margin: 0 auto;
            `;

            shuffledOptions.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.textContent = opt;
                btn.style.cssText = `
                    padding: 14px 20px;
                    background: #f7f0e6;
                    border: 2px solid #d4c4b0;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 17px;
                    font-family: 'Georgia', serif;
                    text-align: left;
                    transition: all 0.15s ease;
                    color: #2c1810;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    position: relative;
                `;
                btn.addEventListener('mouseenter', () => {
                    btn.style.background = '#ede3d6';
                    btn.style.borderColor = '#b8a08a';
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                });
                btn.addEventListener('mouseleave', () => {
                    if (!btn.disabled) {
                        btn.style.background = '#f7f0e6';
                        btn.style.borderColor = '#d4c4b0';
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                    }
                });
                btn.addEventListener('click', () => {
                    if (btn.disabled) return;
                    const isCorrect = idx === newCorrectIndex;
                    if (isCorrect) {
                        score++;
                        resultEl.textContent = '¡Correcto!';
                        resultEl.style.color = '#2c8c3e';
                        btn.style.background = '#d4edda';
                        btn.style.borderColor = '#2c8c3e';
                    } else {
                        resultEl.textContent = `Incorrecto. La respuesta correcta era: ${shuffledOptions[newCorrectIndex]}`;
                        resultEl.style.color = '#c0392b';
                        btn.style.background = '#f8d7da';
                        btn.style.borderColor = '#c0392b';
                        optionsEl.querySelectorAll('button').forEach((b, i) => {
                            if (i === newCorrectIndex) {
                                b.style.background = '#d4edda';
                                b.style.borderColor = '#2c8c3e';
                            }
                        });
                    }
                    resultEl.style.cssText = `
                        margin-top: 16px;
                        font-size: 17px;
                        font-weight: bold;
                        text-align: center;
                        padding: 8px 16px;
                        background: ${isCorrect ? 'rgba(44,140,62,0.08)' : 'rgba(192,57,43,0.08)'};
                        border-radius: 30px;
                        transition: all 0.2s;
                    `;
                    optionsEl.querySelectorAll('button').forEach(b => b.disabled = true);
                    if (!isCorrect) {
                        resultEl.style.animation = 'none';
                        setTimeout(() => {
                            resultEl.style.animation = 'shake 0.4s ease';
                        }, 10);
                    }
                    setTimeout(() => {
                        currentIndex++;
                        resultEl.style.animation = '';
                        showQuestion();
                    }, 1800);
                });
                optionsEl.appendChild(btn);
            });
            resultEl.textContent = '';
            resultEl.style.cssText = `
                margin-top: 16px;
                font-size: 17px;
                font-weight: bold;
                text-align: center;
                padding: 8px 16px;
                border-radius: 30px;
                transition: all 0.2s;
                min-height: 40px;
            `;
        };

        restartBtn.addEventListener('click', () => {
            const newShuffled = [...questions].sort(() => 0.5 - Math.random());
            const newSelected = newShuffled.slice(0, 20);
            selected.length = 0;
            selected.push(...newSelected);
            currentIndex = 0;
            score = 0;
            restartBtn.style.display = 'none';
            resultEl.textContent = '';
            resultEl.style.cssText = `
                margin-top: 16px;
                font-size: 17px;
                font-weight: bold;
                text-align: center;
                padding: 8px 16px;
                border-radius: 30px;
                transition: all 0.2s;
                min-height: 40px;
            `;
            showQuestion();
        });

        container.dataset.initialized = 'true';
        showQuestion();

        if (!document.getElementById('quiz-shake-style')) {
            const style = document.createElement('style');
            style.id = 'quiz-shake-style';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    bindEvents() {}

    close() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        if (this._closeBtn) {
            this._closeBtn.remove();
            this._closeBtn = null;
        }

        super.close();
    }
}
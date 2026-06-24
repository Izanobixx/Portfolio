import { Window } from "./Window";
import { EmbedWindow } from './EmbedWindow.js';
import 'turn.js';
import $ from 'jquery';

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

        this.tracksData = {
            'Euforia': {
                year: '2025',
                duration: '03:27',
                embedCode: '<iframe id="score-iframe" width="100%" height="100%" src="https://musescore.com/user/29082442/scores/24891487/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/24891487/s/4Nvb5C" target="_blank">Euforia – Izan Pinto</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'Euforia_v012.msc'
            },
            '20 de diciembre': {
                year: '2024',
                duration: 'π',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/22494373/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/22494373/s/EbLQXC" target="_blank">20 de Diciembre – Izan Pinto</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: '20_de_diciembre_FINAL_FINAL.msc'
            },
            'El carambolo': {
                year: '2023',
                duration: '1:57',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/21944557/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/21944557/s/Rvg6ZD" target="_blank">El Crambolo</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'El_caramboulou.msc'
            },
            'Outro': {
                year: '2025',
                duration: '1:18',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/25673938/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/25673938/s/byMpqN" target="_blank">Outro - Izan Pinto</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'Outro_max.msc'
            },
            'Noche de Elfos': {
                year: '2023',
                duration: '1:14',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/21993256/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/21993256/s/WzqQhX" target="_blank">Noche de Elfos – Izan Pinto</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'Navideña_3.msc'
            },
            'OG-Canadá': {
                year: '2024',
                duration: '3:00',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/22019152/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/22019152/s/UgE2Zi" target="_blank">OG - Canadá</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'OG_1.msc'
            },
            'OG-Perú': {
                year: '2024',
                duration: '0:51',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/21999301/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/21999301/s/hDeJHx" target="_blank">OG - Perú</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'OG_2.msc'
            },
            'OG-País Vasco': {
                year: '2024',
                duration: '1:45',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/22016008/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/22016008/s/JZ8aLv" target="_blank">OG - País Vasco</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'OG_3.msc'
            },
            'OG-Marruecos': {
                year: '2024',
                duration: '3:31',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/22047583/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/22047583/s/0scDGh" target="_blank">OG - Marruecos</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
                title: 'OG_4.msc'
            },
            'As The World Caves In': {
                year: '2026',
                duration: '3:17',
                embedCode: '<iframe id="score-iframe" width="100%" height="394" src="https://musescore.com/user/29082442/scores/30596555/embed" frameborder="0" allowfullscreen allow="autoplay; fullscreen"></iframe><span><a href="https://musescore.com/user/29082442/scores/30596555/s/793WeH" target="_blank">As The World Caves In – Sarah Cothran\'s Cover | SOLO PIANO</a> by <a href="https://musescore.com/user/29082442">Izan Pinto</a></span>',
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
                file: '/pdfs/Trabajo.pdf'
            },
            {
                title: 'El lied romántico y «Der Zwerg» de Schubert',
                subtitle: 'Música y poesía',
                year: '2022',
                description: 'Análisis del lied «Der Zwerg», donde se explica cómo Schubert usa una melodía repetitiva y un bajo inquietante para reflejar la soledad y la tensión dramática del poema, logrando una profunda unión entre música y texto.',
                file: '/pdfs/DerZwerg.pdf'
            },
            {
                title: 'Los tratados teóricos de Rameau',
                subtitle: 'Resumen de la sistematización de la armonía en el siglo XVIII',
                year: '2022',
                description: 'Resumen de los seis tratados de Jean‑Philippe Rameau, que, sin aportar descubrimientos revolucionarios, recopilaron y ordenaron los conocimientos armónicos de su época para facilitar su estudio y difusión.',
                file: '/pdfs/Rameau.pdf'
            },
            {
                title: 'El Lacrimosa de Mozart: del Réquiem al meme',
                subtitle: '',
                year: '2022',
                description: 'Breve recorrido por el último movimiento del Réquiem de Mozart, destacando su breve letra, su estilo galante y su inesperado resurgimiento en la cultura popular gracias a los memes',
                file: '/pdfs/Requiem.pdf'
            }
        ];

        this.element.classList.add('frameless');
        const titlebar = this.element.querySelector('.xp-titlebar');
        if (titlebar) titlebar.style.display = 'none';
        this.element.style.border = 'none';
        this.element.style.boxShadow = 'none';
        this.element.style.borderRadius = '8px';
        this.element.style.overflow = 'hidden';
        this.element.style.background = 'transparent';
        this.element.style.pointerEvents = 'none';

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
            <div style="padding:40px; background: #f9f0e6; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
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
                <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">🎼 Mis Composiciones</h2>
                
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
            <div style="padding:40px; background: #f9f0e6; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                <style>
                    .works-scroll::-webkit-scrollbar { display: none; }
                </style>
                <div class="works-scroll" style="height:100%; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none;">
                    <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">📄 Trabajos de Conservatorio</h2>
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
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background: #f5e6d3; padding:40px; box-sizing:border-box; font-family: 'Georgia', serif; overflow:hidden;">
                        <h1 style="font-size:48px; color:#2c1810; margin-bottom:20px;">🎵 Mi Libro de Música</h1>
                        <p style="font-size:20px; color:#4a2c1a;">Un viaje a través de mis composiciones y estudios</p>
                        <div style="margin-top:40px; width:80%; border-top:2px solid #8b6b4c;"></div>
                        <p style="margin-top:20px; font-style:italic; color:#6b4c3a;">Pasa las páginas para explorar</p>
                    </div>
                `
            },
            {
                title: 'Índice',
                content: `
                    <div style="padding:40px; background: #f9f0e6; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow:hidden;">
                        <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">📑 Índice</h2>
                        <ul style="list-style:none; padding:0; font-size:18px; line-height:2.5;">
                            <li><strong>🎓</strong> <a href="#" data-page="2">Estudios Musicales</a></li>
                            <li><strong>🎼</strong> <a href="#" data-page="3">Composiciones</a></li>
                            <li><strong>📄</strong> <a href="#" data-page="4">Trabajos</a></li>
                            <li><strong>✨</strong> <a href="#" data-page="5">Inspiración</a></li>
                        </ul>
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
                title: 'Inspiración',
                content: `
                    <div style="padding:40px; background: #f9f0e6; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow:hidden;">
                        <h2 style="color:#2c1810; border-bottom:2px solid #8b6b4c; padding-bottom:10px;">✨ Inspiración</h2>
                        <p style="font-size:16px; line-height:1.8; color:#3d2b1a;">
                            Mi música está influenciada por una amplia gama de artistas y géneros:
                        </p>
                        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:20px;">
                            <span style="background:#2c1810; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Jazz</span>
                            <span style="background:#4a2c1a; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Música Clásica</span>
                            <span style="background:#6b4c3a; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Electrónica</span>
                            <span style="background:#8b6b4c; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Ambiente</span>
                            <span style="background:#a88b6b; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Banda Sonora</span>
                            <span style="background:#2c1810; color:#f9f0e6; padding:8px 16px; border-radius:20px; font-size:14px;">Experimental</span>
                        </div>
                        <div style="margin-top:30px; background:#e8d9c8; padding:20px; border-radius:8px;">
                            <p style="font-style:italic; color:#2c1810; margin:0;">"La inspiración existe, pero tiene que encontrarte trabajando." — Picasso</p>
                        </div>
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
            <div style="padding:40px; background: #f9f0e6; height:100%; box-sizing:border-box; font-family: 'Georgia', serif; overflow-y:auto; scrollbar-width: none; -ms-overflow-style: none; text-align: justify;">
                <style>
                    .estudios-scroll::-webkit-scrollbar {
                        display: none;
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
                        <img src="/images/micalet.jpg" alt="Con el director del Institut Musical Giner" style="width: 100%; max-width: 100%; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); height: auto;">
                        <p style="font-size:12px; color:#6b4c3a; margin-top:4px;">Con el director del Giner, 2017</p>
                    </div>
                    <p style="font-size:14px; line-height:1.8; color:#3d2b1a; margin-top:10px;">
                        Todo esto, sumado a unas cuantas asignaturas de <i>historia de la música, análisis, y composición</i> entre otras, me ha dado un lenguaje musical que es un poco mío y un poco de todo lo que he escuchado.
                    </p>
                    <div style="margin-top:20px; font-size: 15px; background:#e8d9c8; padding:15px; border-radius:8px; text-align: left;">
                        <p style="font-style:italic; color:#2c1810; margin:0;">"La música es más importante que la física." — Evil Isaac Newton</p>
                    </div>
                </div>
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
        `;

        const bookContainer = document.createElement('div');
        bookContainer.id = 'music-book';
        bookContainer.style.cssText = `
            width: 85%;
            height: 85%;
            max-width: 1050px;
            max-height: 750px;
            margin: 0 auto;
            position: relative;
            background: transparent;
            border-radius: 8px;
            overflow: visible;
            pointer-events: auto;
        `;
        content.appendChild(bookContainer);

        pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'book-page';
            pageDiv.dataset.page = index;
            pageDiv.style.cssText = `
                padding: 0;
                background: ${index === 0 ? 'transparent' : '#f9f0e6'};
                border-radius: 8px;
                overflow: hidden;
                ${index === 0 ? 'pointer-events: none;' : ''}
            `;
            pageDiv.innerHTML = page.content;
            bookContainer.appendChild(pageDiv);
        });

        const $book = $(bookContainer);
        const initialWidth = bookContainer.clientWidth || 800;
        const initialHeight = bookContainer.clientHeight || 500;

        $book.turn({
            width: initialWidth,
            height: initialHeight,
            autoCenter: true,
            acceleration: true,
            gradients: true,
            elevation: 50,
            when: {
                turned: (e, page) => {
                    this.currentPage = page;
                }
            }
        });

        setTimeout(() => {
            bookContainer.querySelectorAll('.turn-page, .flip, .even, .odd, .shadow, .turn-page-wrapper').forEach(el => {
                el.style.overflow = 'hidden';
            });
        }, 100);

        const resizeObserver = new ResizeObserver(() => {
            const w = bookContainer.clientWidth;
            const h = bookContainer.clientHeight;
            if (w > 0 && h > 0) {
                $book.turn('size', w, h);
            }
        });
        resizeObserver.observe(bookContainer);
        this._resizeObserver = resizeObserver;

        // Eventos del índice
        bookContainer.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageNum = parseInt(link.dataset.page, 10) + 1;
                $book.turn('page', pageNum);
            });
        });

        // Evento para los elementos de las canciones (dropdowns)
        bookContainer.querySelectorAll('.song-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const track = el.dataset.track;
                const data = this.tracksData[track];
                if (data) {
                    const width = 400;
                    const height = 600;
                    const centerX = window.innerWidth / 2 - width / 2;
                    const centerY = window.innerHeight / 2 - height / 2;
                    this.manager.createWindow(EmbedWindow, {
                        title: data.title,
                        width: width,
                        height: height,
                        x: centerX,
                        y: centerY,
                        originX: centerX,
                        originY: centerY,
                        embedCode: data.embedCode
                    });
                } else {
                    console.warn('No se encontró la partitura:', track);
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

        // Eventos de Spotify (álbumes)
        bookContainer.querySelectorAll('.spotify-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                alert('Este embed se abriría en una nueva ventana para no interferir con el libro.');
            });
        });
    }

    bindEvents() {}

    close() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        }

        const $book = $('#music-book');
        if ($book.length) {
            $book.turn('destroy');
        }
        super.close();
    }
}
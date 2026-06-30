//CorkBoard;357

import { ConfirmWindow } from "./ConfirmWindow.js";
import { Window } from "./Window";
import { supabase } from "../supabaseClient.js";

export class CorkBoardWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Corcho.exe",
            width: options.width || 700,
            height: options.height || 450,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.postIts = [];
        this.isDraggingAny = false;
        this.postItSizePercent = 12;
        this.loading = false;

        this.loadPostIts();
    }

    async loadPostIts() {
        this.loading = true;
        try {
            const { data, error } = await supabase
                .from('postits')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            this.postIts = data || [];
        } catch (error) {
            console.error('Error cargando post-its:', error);
            this.postIts = [];
        } finally {
            this.loading = false;
            this.renderCorcho();
            this.bindEvents();
        }
    }

    renderCorcho() {
        const content = this.element.querySelector('.xp-content');
        content.innerHTML = '';
        content.style.cssText = `
            background-color: #8B6B4C;
            background-image: url('${import.meta.env.BASE_URL}textures/corcho.png');
            background-size: cover;
            background-position: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
        `;

        if (this.loading) {
            const loadingMsg = document.createElement('div');
            loadingMsg.textContent = 'Cargando notas...';
            loadingMsg.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:18px; background:rgba(0,0,0,0.5); padding:10px 20px; border-radius:8px;';
            content.appendChild(loadingMsg);
            return;
        }

        this.postIts.forEach(post => {
            this.renderPostIt(content, post);
        });
    }

    renderPostIt(container, post) {
        const div = document.createElement('div');
        div.className = 'corcho-postit postit-container';
        div.dataset.id = post.id;
        div.style.cssText = `
            position: absolute;
            left: ${post.x}%;
            top: ${post.y}%;
            transform: rotate(${post.rotation || 0}deg);
            width: ${this.postItSizePercent}%;
            aspect-ratio: 1/1;
            background: ${post.color || '#fff9c4'};
            box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            border-radius: 2px;
            padding: 4px;
            cursor: grab;
            user-select: none;
            touch-action: none;
            box-sizing: border-box;
        `;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
            pointer-events: none;
            border-radius: 2px;
        `;
        div.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (post.strokes) {
            post.strokes.forEach(stroke => {
                if (stroke.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(stroke[0].x, stroke[0].y);
                for (let i = 1; i < stroke.length; i++) {
                    ctx.lineTo(stroke[i].x, stroke[i].y);
                }
                ctx.strokeStyle = stroke.color || '#333';
                ctx.lineWidth = stroke.size || 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            });
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete-btn-hidden';
        deleteBtn.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            border: none;
            background: #ff4444;
            color: white;
            border-radius: 50%;
            font-size: 12px;
            cursor: pointer;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            z-index: 10;
            display: flex;
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const message = `Recuerda que alguien dedicó su tiempo para dibujar esta nota. ¿Estás seguro de que la quieres borrar?`;
            const centerX = window.innerWidth / 2 - 175;
            const centerY = window.innerHeight / 2 - 75;
            this.manager.createWindow(ConfirmWindow, {
                title: 'Confirmar eliminación',
                width: 350,
                height: 150,
                x: centerX,
                y: centerY,
                originX: centerX,
                originY: centerY,
                message: message,
                onConfirm: () => {
                    this.animateAndDelete(post.id, div);
                },
                onCancel: () => {}
            });
        });
        div.appendChild(deleteBtn);

        this.makeDraggable(div, post);
        container.appendChild(div);
    }

    async updatePostItPosition(post) {
        try {
            const { error } = await supabase
                .from('postits')
                .update({ x: post.x, y: post.y })
                .eq('id', post.id);
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error actualizando posición de nota:', error);
        }
    }

    makeDraggable(element, post) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        const onDown = (e) => {
            if (e.target.closest('button')) return;
            isDragging = true;
            this.isDraggingAny = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.cursor = 'grabbing';
            element.style.zIndex = 100;
            e.preventDefault();
            e.stopPropagation();
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const container = this.element.querySelector('.xp-content');
            const containerRect = container.getBoundingClientRect();
            const sizePx = containerRect.width * (this.postItSizePercent / 100);
            let newX = e.clientX - containerRect.left - offsetX;
            let newY = e.clientY - containerRect.top - offsetY;

            newX = Math.max(0, Math.min(containerRect.width - sizePx, newX));
            newY = Math.max(0, Math.min(containerRect.height - sizePx, newY));

            const xPct = (newX / containerRect.width) * 100;
            const yPct = (newY / containerRect.height) * 100;
            post.x = xPct;
            post.y = yPct;
            element.style.left = xPct + '%';
            element.style.top = yPct + '%';
        };

        const onUp = async (e) => {
            if (isDragging) {
                isDragging = false;
                this.isDraggingAny = false;
                element.style.cursor = 'grab';
                element.style.zIndex = '';
                await this.updatePostItPosition(post);
                e.stopPropagation();
                e.preventDefault();
            }
        };

        element.addEventListener('mousedown', onDown);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        element._onDown = onDown;
        element._onMove = onMove;
        element._onUp = onUp;
    }

    async deletePostItFromDB(id) {
        try {
            const { error } = await supabase
                .from('postits')
                .delete()
                .eq('id', id);
            if (error) throw error;
        } catch (error) {
            console.error('Error eliminando nota:', error);
        }
    }

    animateAndDelete(id, element) {
        element.classList.add('postit-falling');
        
        setTimeout(async () => {
            if (element.parentNode) {
                element.remove();
            }
            await this.deletePostItFromDB(id);
            this.postIts = this.postIts.filter(p => p.id !== id);
        }, 600);
    }

    async addPostIt(strokes, color = '#fff9c4') {
        const scaledStrokes = strokes.map(stroke => 
            stroke.map(point => ({
                x: Math.round(point.x * (128 / 300)),
                y: Math.round(point.y * (128 / 300))
            }))
        );

        const maxX = 100 - this.postItSizePercent;
        const maxY = 100 - this.postItSizePercent;
        const newPost = {
            x: 10 + Math.random() * maxX * 0.8,
            y: 10 + Math.random() * maxY * 0.8,
            rotation: (Math.random() - 0.5) * 10,
            color: color,
            strokes: scaledStrokes
        };

        try {
            const { data, error } = await supabase
                .from('postits')
                .insert([newPost])
                .select('*');
            if (error) throw error;
            if (data && data.length > 0) {
                this.postIts.push(data[0]);
                const content = this.element.querySelector('.xp-content');
                content.innerHTML = '';
                this.renderCorcho();
            }
        } catch (error) {
            console.error('Error añadiendo nota:', error);
            alert('No se pudo guardar la nota. Inténtalo de nuevo');
        }
    }

    bindEvents() {
        const content = this.element.querySelector('.xp-content');
        if (!content) return;
        content.addEventListener('click', (e) => {
            if (this.isDraggingAny) {
                this.isDraggingAny = false;
                return;
            }
            if (e.target === content) {
                import('./PostItCreatorWindow.js').then(module => {
                    const PostItCreatorWindow = module.PostItCreatorWindow;
                    this.manager.createWindow(PostItCreatorWindow, {
                        title: 'Nueva_nota.exe',
                        width: 400,
                        height: 450,
                        x: window.innerWidth / 2 - 200,
                        y: window.innerHeight / 2 - 225,
                        originX: window.innerWidth / 2 - 200,
                        originY: window.innerHeight / 2 - 225,
                        corchoWindow: this
                    });
                });
            }
        });
    }
}
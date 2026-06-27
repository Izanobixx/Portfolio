// src/DialogueManager.js

export class DialogueManager {
    constructor() {
        this.messages = [];
        this.currentIndex = 0;
        this.isTyping = false;
        this.rafId = null;
        this.charIndex = 0;
        this.fullText = '';
        this.nextDelay = 25;
        this.lastUpdate = 0;

        // Contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'dialogue-container';
        this.container.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 800px;
            padding: 20px 30px 25px 30px;
            background: rgba(10, 8, 6, 0.95);
            border: 1px solid rgba(139, 107, 76, 0.3);
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.6);
            z-index: 999999;
            box-sizing: border-box;
            pointer-events: auto;
            cursor: pointer;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease, transform 0.3s ease;
            font-family: 'Georgia', serif;
            color: #f0ece6;
            margin: 0;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        `;

        // Nombre del hablante
        this.speakerEl = document.createElement('div');
        this.speakerEl.id = 'dialogue-speaker';
        this.speakerEl.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            color: #e8c87a;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        `;
        this.container.appendChild(this.speakerEl);

        // Texto del diálogo
        this.textEl = document.createElement('div');
        this.textEl.id = 'dialogue-text';
        this.textEl.style.cssText = `
            font-size: 18px;
            line-height: 1.7;
            min-height: 60px;
            padding-right: 30px;
            color: #f5efe8;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        `;
        this.container.appendChild(this.textEl);

        // Indicador de continuar (flecha)
        this.continueIndicator = document.createElement('div');
        this.continueIndicator.id = 'dialogue-continue';
        this.continueIndicator.textContent = '▼';
        this.continueIndicator.style.cssText = `
            position: absolute;
            bottom: 14px;
            right: 22px;
            font-size: 20px;
            color: #8b6b4c;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        `;
        this.container.appendChild(this.continueIndicator);

        // Animación CSS para la flecha (se activa con clase .visible)
        const style = document.createElement('style');
        style.textContent = `
            @keyframes blink {
                0%, 100% { opacity: 0.2; transform: translateY(0); }
                50% { opacity: 1; transform: translateY(-3px); }
            }
            #dialogue-continue.visible {
                animation: blink 1.4s infinite;
                opacity: 1;
            }
            #dialogue-continue:not(.visible) {
                animation: none;
                opacity: 0;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(this.container);

        // Eventos para avanzar
        this.container.addEventListener('click', () => this.advance());
        document.addEventListener('keydown', (e) => {
            if (this.container.style.display !== 'none') {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                this.advance();
            }
        });
    }

    show(messages) {
        if (!Array.isArray(messages)) {
            console.warn('DialogueManager: messages must be an array');
            return;
        }

        this.messages = messages.map(msg => {
            if (typeof msg === 'string') {
                return { speaker: 'IZAN', text: msg };
            }
            return { speaker: msg.speaker || 'IZAN', text: msg.text };
        });

        this.currentIndex = 0;
        this.container.style.display = 'block';
        void this.container.offsetWidth;
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateX(-50%) translateY(0)';
        this.showCurrentMessage();
    }

    playBlip(){
        if (!this.blipEnabled) return;
        
        try{
            if (!this.audioCtx)
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioCtx.state === 'suspended')
                this.audioCtx.resume();

            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.value = 600 + Math.random() * 100;
            gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + 0.05);
        } catch(e){
            console.warn('Blip sound nota available: ', e);
        }
    }

    showCurrentMessage() {
        if (this.currentIndex >= this.messages.length) {
            this.hide();
            return;
        }

        const msg = this.messages[this.currentIndex];
        this.speakerEl.textContent = msg.speaker;
        if (msg.speaker === 'IZAN'){
            this.speakerEl.style.color = '#e8c87a';
        }
        else if (msg.speaker === 'RICK ASTLEY'){
            this.speakerEl.style.color = '#ff8888';
        }
        else{
            this.speakerEl.style.color = '#dddddd';
        }

        this.textEl.textContent = '';
        this.continueIndicator.classList.remove('visible');
        this.isTyping = true;
        this.charIndex = 0;
        this.lastUpdate = 0;
        this.nextDelay = 25;
        this.fullText = msg.text;

        this.audioCtx = null;
        this.blipEnabled = true;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        const typeNextChar = (timestamp) => {
            if (this.charIndex >= this.fullText.length) {
                this.isTyping = false;
                this.continueIndicator.classList.add('visible');
                this.rafId = null;
                return;
            }

            if (this.lastUpdate === 0) {
                this.lastUpdate = timestamp;
            }

            let delay = this.nextDelay;

            if (timestamp - this.lastUpdate >= delay) {
                const char = this.fullText.charAt(this.charIndex);
                this.textEl.textContent += char;
                if (char !== ' ') {
                    this.playBlip();
                }
                this.charIndex++;
                this.lastUpdate = timestamp;

                // Ajustar delay según el carácter escrito
                if (char === '.' || char === '?' || char === '!') {
                    this.nextDelay = 350;
                } else if (char === ',' || char === ';' || char === ':') {
                    this.nextDelay = 180;
                } else if (char === '—' || char === '…') {
                    this.nextDelay = 300;
                } else if (char === ' ') {
                    this.nextDelay = 15;
                } else {
                    this.nextDelay = 25;
                }
            }

            this.rafId = requestAnimationFrame(typeNextChar);
        };

        this.rafId = requestAnimationFrame(typeNextChar);
    }

    advance() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (this.isTyping) {
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.textEl.textContent = this.fullText;
            this.isTyping = false;
            this.continueIndicator.classList.add('visible');
            return;
        }

        if (this.currentIndex + 1 >= this.messages.length) {
            this.hide();
        } else {
            this.currentIndex++;
            this.showCurrentMessage();
        }
    }

    hide() {
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateX(-50%) translateY(10px)';
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.isTyping = false;
        this.continueIndicator.classList.remove('visible');

        setTimeout(() => {
            this.container.style.display = 'none';
            this.textEl.textContent = '';
            this.speakerEl.textContent = '';
            this.messages = [];
            this.currentIndex = 0;
        }, 350);
    }
}
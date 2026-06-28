// src/windows/ChatWindow.js
import { Window } from "./Window";
import { conversation } from "./data/chat-conversation.js";

export class ChatWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Comunicador.exe",
            width: options.width || 800,
            height: options.height || 500,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });
        
        this.manager = manager;
        if (this.manager){
            this.manager.closeAllWindows();
            this.manager.setBlockNewWindows();
        }

        this.isProcessing = false;
        this.aborted = false;
        this.currentIndex = 0;
        this.messagesContainer = null;
        this.typingIndicator = null;
        this.inputBar = null;

        this.soundEnabled = true;
        this.audioCtx = null;

        this.conversation = conversation;

        this.element.classList.add('frameless');
        const titlebar = this.element.querySelector('.xp-titlebar');
        if (titlebar) {
            const controls = this.element.querySelector('.xp-controls');
            if (controls) controls.style.display = 'none';
            titlebar.style.background = 'rgba(0, 0, 0, 0.3)';
            titlebar.style.color = '#00ff41';
            titlebar.style.borderBottom = '1px solid #00ff41';
            titlebar.style.padding = '4px 8px';
            titlebar.style.fontSize = '14px';
            titlebar.style.cursor = 'default';
            const titleSpan = titlebar.querySelector('.xp-title');
            if (titleSpan) titleSpan.textContent = 'Comunicador.exe';
        }

        if (titlebar) {
            titlebar.style.pointerEvents = 'none';
        }

        this.element.style.border = '2px solid #00ff41';
        this.element.style.boxShadow = '0 0 30px rgba(0,255,65,0.3)';
        this.element.style.borderRadius = '8px';
        this.element.style.overflow = 'hidden';
        this.element.style.background = '#0a0a0a';
        this.element.style.pointerEvents = 'auto';

        this.renderChat();
        this.setupDrag();
        this.setupFocusOnClick();

        setTimeout(() => {
            this.processConversation();
        }, 500);
    }

    ensureAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    playTypingSound() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.ensureAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 500 + Math.random() * 75;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.04);
        } catch (_) { }
    }

    playSendSound() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.ensureAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (_) { }
    }

    playReceiveSound() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.ensureAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500 + Math.random() * 75, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } catch (_) { }
    }

    playReadySound() {
        if (!this.soundEnabled) return;
        try {
            const ctx = this.ensureAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.06);
        } catch (_) { }
    }

    setupDrag() {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        const onMouseDown = (e) => {
            if (e.target.closest('button')) return;
            if (e.target.closest('#chat-input-bar')) return;
            isDragging = true;
            const rect = this.element.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            this.element.style.cursor = 'grabbing';
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            this.element.style.left = (startLeft + dx) + 'px';
            this.element.style.top = (startTop + dy) + 'px';
            e.preventDefault();
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                this.element.style.cursor = '';
            }
        };

        this.element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        this._dragListeners = { onMouseDown, onMouseMove, onMouseUp };
    }

    setupFocusOnClick() {
        this.element.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            if (e.target.closest('#chat-input-bar')) return;
            if (this._textarea && !this._textarea.readOnly) {
                this._textarea.focus();
            }
        });
    }

    renderChat() {
        const content = this.element.querySelector('.xp-content');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            height: 100%;
            background: #0a0a0a;
            padding: 12px;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
            color: #00ff41;
            overflow: hidden;
            position: relative;
        `;

        this.messagesContainer = document.createElement('div');
        this.messagesContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px 4px;
            margin-bottom: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            scrollbar-width: thin;
            scrollbar-color: #00ff41 #0a0a0a;
        `;
        const style = document.createElement('style');
        style.textContent = `
            #chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            #chat-messages::-webkit-scrollbar-track {
                background: #0a0a0a;
            }
            #chat-messages::-webkit-scrollbar-thumb {
                background: #00ff41;
                border-radius: 3px;
            }
        `;
        content.appendChild(style);
        this.messagesContainer.id = 'chat-messages';
        content.appendChild(this.messagesContainer);

        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
            #chat-input-bar {
                border: 2px solid #00ff41 !important;
                transition: box-shadow 0.3s ease, border-color 0.3s ease;
                border-radius: 0 !important;
            }
            #chat-input-bar.waiting {
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.4);
                animation: pulse-border 1.2s ease-in-out infinite;
            }
            #chat-input-bar.waiting textarea {
                border: none !important;
                box-shadow: none !important;
                animation: none !important;
                border-radius: 0 !important;
                padding-left: 4px;
            }
            @keyframes pulse-border {
                0%, 100% { box-shadow: 0 0 8px rgba(0, 255, 65, 0.2); }
                50% { box-shadow: 0 0 30px rgba(0, 255, 65, 0.8); }
            }
        `;
        content.appendChild(pulseStyle);

        this.typingIndicator = document.createElement('div');
        this.typingIndicator.textContent = 'IZAN está escribiendo...';
        this.typingIndicator.style.cssText = `
            color: #00ff41;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s;
            padding: 6px 0;
            font-family: 'Courier New', monospace;
            font-style: italic;
            align-self: flex-start;
        `;
        this.messagesContainer.appendChild(this.typingIndicator);

        this.inputBar = document.createElement('div');
        this.inputBar.id = 'chat-input-bar';
        this.inputBar.style.cssText = `
            display: flex;
            align-items: flex-end;
            gap: 8px;
            padding: 6px 4px;
            border-top: 1px solid #00ff41;
            min-height: 40px;
            opacity: 0.5;
            font-size: 14px;
            color: #00ff41;
            font-family: 'Courier New', monospace;
        `;
        this.inputBar.innerHTML = `<span style="color:#00ff41;">❯</span> <span style="opacity:0.6;">Esperando mensaje...</span>`;
        content.appendChild(this.inputBar);
    }

    async processConversation() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        let lastSpeaker = null;

        for (let i = 0; i < this.conversation.length; i++) {
            if (this.aborted) break;
            const msg = this.conversation[i];
            this.currentIndex = i;

            if (msg.speaker === 'IZAN') {
                const showLabel = (lastSpeaker !== 'IZAN');
                if (msg.text === "" || msg.text === null) {
                    await this.showIzanThinking(msg.delay || 1000);
                } else {
                    await this.showIzanMessage(msg.text, msg.delay || 0, showLabel);
                    lastSpeaker = 'IZAN';
                }
            } else if (msg.speaker === 'YOU') {
                const showLabel = (lastSpeaker !== 'YOU');
                await this.showUserMessageInput(msg.text, showLabel);
                lastSpeaker = 'YOU';
            } else if (msg.speaker === 'NULL') {
                const delay = msg.delay || 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        if (!this.aborted) {
            this.inputBar.innerHTML = `<span style="color:#00ff41;">❯</span> <span style="opacity:0.6;">[Comunicación finalizada]</span>`;
        }

        setTimeout(() => {
            if (this.manager)
                this.manager.unblockNewWindows();
            this.close();
        }, 3000);

        this.isProcessing = false;
    }

    showIzanMessage(text, delay, showLabel) {
        return new Promise((resolve) => {
            this.typingIndicator.textContent = 'IZAN está escribiendo...';
            this.typingIndicator.style.opacity = '1';
            this.scrollToBottom();

            setTimeout(() => {
                this.typingIndicator.style.opacity = '0';

                const msgDiv = this.createMessageBubble('IZAN', text, false, showLabel);
                this.messagesContainer.insertBefore(msgDiv, this.typingIndicator);
                this.scrollToBottom();

                msgDiv.style.opacity = '0';
                msgDiv.style.transition = 'opacity 0.15s ease';
                requestAnimationFrame(() => {
                    msgDiv.style.opacity = '1';
                    this.playReceiveSound();
                });

                resolve();
            }, delay);
        });
    }

    showIzanThinking(delay) {
        return new Promise((resolve) => {
            this.typingIndicator.textContent = 'IZAN está escribiendo...';
            this.typingIndicator.style.opacity = '1';
            this.scrollToBottom();

            setTimeout(() => {
                this.typingIndicator.style.opacity = '0';
                resolve();
            }, delay);
        });
    }

    showUserMessageInput(text, showLabel) {
        return new Promise((resolve) => {
            const actions = this.parseMessage(text);
            let actionIndex = 0;
            let currentText = '';
            let isComplete = false;
            let isAutoTyping = true;
            let firstCharWritten = false;

            this.inputBar.innerHTML = '';
            this.inputBar.style.opacity = '1';

            // Aplicar clase waiting para el efecto de pulsación
            this.inputBar.classList.add('waiting');

            const textarea = document.createElement('textarea');
            textarea.value = '';
            textarea.style.cssText = `
                flex: 1;
                background: transparent;
                border: none !important;
                color: #00ff41;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                outline: none;
                padding: 4px 0;
                resize: none;
                overflow: hidden;
                min-height: 24px;
                max-height: 120px;
                line-height: 1.5;
                width: 100%;
                box-shadow: none !important;
                animation: none !important;
                border-radius: 0 !important;
            `;
            textarea.rows = 1;
            this.inputBar.appendChild(textarea);

            const sendBtn = document.createElement('button');
            sendBtn.textContent = '➤';
            sendBtn.style.cssText = `
                background: none;
                border: none;
                color: #00ff41;
                font-size: 18px;
                cursor: default;
                opacity: 0.4;
                transition: opacity 0.2s;
                padding: 0 6px;
                flex-shrink: 0;
                align-self: flex-end;
                margin-bottom: 4px;
            `;
            this.inputBar.appendChild(sendBtn);

            const adjustHeight = () => {
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            };

            const executeAction = () => {
                if (actionIndex >= actions.length) {
                    isComplete = true;
                    isAutoTyping = false;
                    sendBtn.style.cursor = 'pointer';
                    sendBtn.style.opacity = '1';
                    textarea.focus();
                    this.playReadySound();
                    adjustHeight();
                    // Quitar la clase waiting cuando el mensaje está completo
                    this.inputBar.classList.remove('waiting');
                    return;
                }

                const action = actions[actionIndex];
                if (action.type === 'char') {
                    if (!firstCharWritten) {
                        firstCharWritten = true;
                        this.inputBar.classList.remove('waiting');
                    }
                    currentText += action.char;
                    textarea.value = currentText;
                    this.playTypingSound();
                } else if (action.type === 'backspace') {
                    if (currentText.length > 0) {
                        currentText = currentText.slice(0, -1);
                        textarea.value = currentText;
                    }
                }
                actionIndex++;
                adjustHeight();
                this.scrollToBottom();
            };

            const onKeyDown = (e) => {
                if (isComplete) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage();
                    }
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.preventDefault();
                    }
                    return;
                }

                if (isAutoTyping) {
                    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab'];
                    if (controlKeys.includes(e.key)) {
                        e.preventDefault();
                        return;
                    }
                    if (e.ctrlKey || e.altKey || e.metaKey) {
                        e.preventDefault();
                        return;
                    }
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        return;
                    }
                    e.preventDefault();
                    executeAction();
                }
            };

            const onInput = (e) => {
                if (isAutoTyping) {
                    if (textarea.value !== currentText) {
                        textarea.value = currentText;
                    }
                } else if (isComplete) {
                    if (textarea.value !== currentText) {
                        textarea.value = currentText;
                    }
                }
                adjustHeight();
            };

            const sendMessage = () => {
                if (!isComplete) return;
                const userText = textarea.value;
                const msgDiv = this.createMessageBubble('TÚ', userText, true, showLabel);
                this.messagesContainer.insertBefore(msgDiv, this.typingIndicator);
                this.scrollToBottom();

                this.inputBar.innerHTML = `<span style="color:#00ff41;">❯</span> <span style="opacity:0.6;">Mensaje enviado.</span>`;
                this.inputBar.style.opacity = '0.5';
                this.playSendSound();

                resolve();
            };

            textarea.addEventListener('keydown', onKeyDown);
            textarea.addEventListener('input', onInput);
            sendBtn.addEventListener('click', sendMessage);

            textarea.focus();

            this._inputHandlers = { onKeyDown, onInput, sendMessage };
            this._textarea = textarea;
            this._sendBtn = sendBtn;
        });
    }

    parseMessage(text) {
        const actions = [];
        let i = 0;
        while (i < text.length) {
            const char = text[i];
            if (char === '/') {
                let numStr = '';
                i++;
                while (i < text.length && /\d/.test(text[i])) {
                    numStr += text[i];
                    i++;
                }
                const count = parseInt(numStr, 10) || 0;
                for (let j = 0; j < count; j++) {
                    actions.push({ type: 'backspace' });
                }
            } else {
                actions.push({ type: 'char', char: char });
                i++;
            }
        }
        return actions;
    }

    createMessageBubble(speaker, text, isPlayer, showLabel) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: ${isPlayer ? 'flex-end' : 'flex-start'};
            margin-bottom: 4px;
            max-width: 85%;
            align-self: ${isPlayer ? 'flex-end' : 'flex-start'};
        `;

        if (showLabel) {
            const speakerLabel = document.createElement('div');
            speakerLabel.textContent = speaker;
            speakerLabel.style.cssText = `
                font-size: 12px;
                color: #00ff41;
                opacity: 0.6;
                margin-bottom: 2px;
                font-weight: bold;
                letter-spacing: 0.5px;
            `;
            container.appendChild(speakerLabel);
        }

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.textContent = text;
        bubble.style.cssText = `
            background: ${isPlayer ? 'rgba(0, 255, 65, 0.08)' : 'rgba(0, 255, 65, 0.04)'};
            border: 1px solid rgba(0, 255, 65, 0.2);
            border-radius: 8px;
            padding: 8px 14px;
            font-size: 15px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-break: break-word;
            color: #00ff41;
            font-family: 'Courier New', monospace;
            border-left: ${isPlayer ? 'none' : '2px solid #00ff41'};
            border-right: ${isPlayer ? '2px solid #00ff41' : 'none'};
            min-height: ${text === '' ? '30px' : 'auto'};
            min-width: ${text === '' ? '60px' : 'auto'};
        `;
        container.appendChild(bubble);

        return container;
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        }, 20);
    }

    close() {
        this.aborted = true;
        if (this._dragListeners) {
            this.element.removeEventListener('mousedown', this._dragListeners.onMouseDown);
            document.removeEventListener('mousemove', this._dragListeners.onMouseMove);
            document.removeEventListener('mouseup', this._dragListeners.onMouseUp);
        }
        if (this._textarea && this._inputHandlers) {
            this._textarea.removeEventListener('keydown', this._inputHandlers.onKeyDown);
            this._textarea.removeEventListener('input', this._inputHandlers.onInput);
            if (this._sendBtn) {
                this._sendBtn.removeEventListener('click', this._inputHandlers.sendMessage);
            }
        }

        if (this.manager && this.manager.unblockNewWindows)
            this.manager.unblockNewWindows();

        super.close();
    }
}
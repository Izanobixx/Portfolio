import { Window } from "./Window";

export class EmbedWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Reproductor",
            width: options.width || 700,
            height: options.height || 500,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: ''
        });

        this.embedCode = options.embedCode || '';

        // Eliminar los handles de redimensionado
        this.element.querySelectorAll('.resize-handle').forEach(el => el.remove());

        // Desactivar los eventos de redimensionado (sobrescribimos el método)
        this.enableResize = () => {};

        this.renderEmbed();
    }

    renderEmbed() {
        const content = this.element.querySelector('.xp-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 0;
            box-sizing: border-box;
            background: #f5f5f5;
            overflow: hidden;
        `;

        content.innerHTML = '';

        if (this.embedCode) {
            const container = document.createElement('div');
            container.style.cssText = `
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
                background: #000;
            `;
            container.innerHTML = this.embedCode;
            content.appendChild(container);

            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                    display: block;
                `;
                iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');
            }
        } else {
            content.innerHTML = `
                <div style="padding:30px 20px; text-align:center; font-family:sans-serif; color:#555; max-width:500px; line-height:1.6;">
                    <p style="font-size:18px; margin-bottom:16px;">¡Vaya! Algo ha salido <strong>TERRIBLEMENTE MAL</strong>💀.</p>
                    <p style="font-size:14px; margin-bottom:12px;">
                        He fallado como programador... he intentado cargar un embedding dentro de una ventana, pero he fracasado estrepitosamente.
                    </p>
                    <p style="font-size:14px; margin-bottom:16px;">
                        Por favor, contacta conmigo para restregarme lo mal programador que soy por haber hecho tremendo bug imperdonable. Muchas gracias, y disculpa las molestias.
                    </p>
                    <p style="font-size:16px; margin-top:8px;">
                        <a href="https://www.youtube.com/watch?v=9k8VvdfM-sg" 
                             target="_blank" 
                             style="color:#0047ab; text-decoration:underline; font-weight:bold; hover:color:#ff6600;">
                            Vídeo de disculpa oficial
                        </a>
                    </p>
                    <p style="font-size:12px; color:#999; margin-top:16px;">(Haz clic en el enlace para verlo)</p>
                </div>
            `;
        }
    }
}
import { Window } from "./Window";

export class ConfirmWindow extends Window {
    constructor(manager, options = {}) {
        super(manager, {
            title: options.title || "Confirmar eliminación",
            width: options.width || 350,
            height: options.height || 150,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY,
            content: '',
            noAnimation: true
        });

        this.message = options.message || "¿Estás seguro?";
        this.onConfirm = options.onConfirm || null;
        this.onCancel = options.onCancel || null;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.transform = 'none';
        this.element.style.opacity = '1';
        this.element.style.transition = 'none';

        // Eliminar botones de control (minimizar, maximizar, cerrar)
        const controls = this.element.querySelector('.xp-controls');
        if (controls) {
            controls.style.display = 'none';
        }

        // Eliminar manejadores de redimensionado
        const resizeHandles = this.element.querySelectorAll('.resize-handle');
        resizeHandles.forEach(handle => handle.remove());

        // Deshabilitar redimensionado quitando eventos (la clase base no los quita fácilmente)
        // Como hemos eliminado los elementos, los eventos ya no se dispararán.
        // También podemos desactivar el cursor de redimensionado en los bordes.
        this.element.style.resize = 'none'; // no tiene efecto directo, pero por si acaso

        // Evitar que el botón de cerrar de la barra de título cierre la ventana
        const closeBtn = this.element.querySelector('.close');
        if (closeBtn) {
            closeBtn.style.display = 'none'; // ocultarlo también
        }

        this.renderContent();
        this.bindEvents();
    }

    renderContent() {
        const content = this.element.querySelector('.xp-content');
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            gap: 3px;
            background: #f5f5f5;
            height: 100%;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, sans-serif;
        `;

        const messageEl = document.createElement('p');
        messageEl.textContent = this.message;
        messageEl.style.cssText = 'margin:0; font-size:15px; color:#333; text-align:center; line-height:1.5;';
        content.appendChild(messageEl);

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex; gap:20px; justify-content:center;';

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'Sí';
        yesBtn.style.cssText = 'padding:8px 24px; background:#0047ab; color:white; border:none; border-radius:4px; cursor:pointer; font-size:14px;';
        yesBtn.addEventListener('click', () => {
            if (this.onConfirm) this.onConfirm();
            this.close();
        });
        btnContainer.appendChild(yesBtn);

        const noBtn = document.createElement('button');
        noBtn.textContent = 'No';
        noBtn.style.cssText = 'padding:8px 24px; background:#e0e0e0; color:#333; border:1px solid #aaa; border-radius:4px; cursor:pointer; font-size:14px;';
        noBtn.addEventListener('click', () => {
            if (this.onCancel) this.onCancel();
            this.close();
        });
        btnContainer.appendChild(noBtn);

        content.appendChild(btnContainer);
    }

    bindEvents() {
        // Sobrescribir para evitar que se añadan eventos de redimensionado de la clase base
        // No hacemos nada aquí.
    }

    // Anular el método enableResize de la clase base para que no haga nada
    enableResize() {
        // Vacío
    }

    close() {
        super.close();
    }
}
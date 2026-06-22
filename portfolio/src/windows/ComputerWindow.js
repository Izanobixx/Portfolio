import { Window } from "./Window";

export class ComputerWindow extends Window{

    constructor(manager, options = {}){
        super(manager, {
            title: options.title || "My Computer.exe",
            width: options.width || 600,
            height: options.height || 400,
            x: options.x,
            y: options.y,
            originX: options.originX,
            originY: options.originY
        });

        this.loadContent();
    }

    loadContent() {
        const content = this.element.querySelector(".xp-content");

        content.innerHTML = `
            <h1>Izan Pinto</h1>
            <p>Game Developer</p>
            <ul>
                <li>Projects</li>
                <li>Github</li>
                <li>Contact</li>
            </ul>
        `;
    }
}
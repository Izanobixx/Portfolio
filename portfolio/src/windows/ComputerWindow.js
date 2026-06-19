import { Window } from "./Window";

export class ComputerWindow extends Window{

    constructor(manager){
        super(manager,{title:"My Computer.exe", width:600, height:400});
        this.loadContent();
    }

    loadContent(){
        const content = this.element.querySelector(".xp-content");

        content.innerHTML = `


        <h1>
        Izan Pinto
        </h1>


        <p>
        Game Developerrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
        </p>


        <ul>

        <li>Projects</li>
        <li>Github</li>
        <li>Contact</li>

        </ul>


        `;
    }
}
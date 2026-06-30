import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

export class DustSystem{

    constructor(scene){
        this.scene = scene;
        this.count = 500;
        this.noise = createNoise3D();
        this.time = 0;
        this.basePositions = new Float32Array(this.count * 3);
        this.init();
    }

    init(){
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++){
            const i3 = i*3;
            const x = (Math.random()-0.5)*10;
            const y = Math.random()*5;
            const z = (Math.random()-0.5)*10;

            positions[i3] = x;
            positions[i3+1] = y;
            positions[i3+2] = z;

            this.basePositions[i3] = x;
            this.basePositions[i3+1] = y;
            this.basePositions[i3+2] = z;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions,3));
        const texture = new THREE.TextureLoader().load(import.meta.env.BASE_URL + "textures/particle.png");
        const material = new THREE.PointsMaterial({map:texture, color:0xffffff, size: 0.1, transparent: true, opacity: 0.04, depthWrite: false});
        this.points = new THREE.Points(geometry,material);

        this.scene.add(this.points);
    }

    update(){
        this.time += 0.001;

        const pos = this.points.geometry.attributes.position.array;

        for (let i=0; i < this.count; i++){
            const i3 = i*3;

            const x = this.basePositions[i3];
            const y = this.basePositions[i3+1];
            const z = this.basePositions[i3+2];

            let size = 2;
            const windX = this.noise(x*size, y*size, this.time) * 0.7;
            const windY = this.noise(y*size, z*size, this.time + 10) * 0.7;
            const windZ = this.noise(z*size, x*size, this.time + 20) * 0.7;

            pos[i3] = x + windX + this.time * 0.02;
            pos[i3+1] = y + windY;
            pos[i3+2] = z + windZ;
        }

        this.points.geometry.attributes.position.needsUpdate = true;
    }

}
import * as THREE from 'three';

export class PlayerController {
    constructor(model, mixer, clips, goPositions = {}) {
        this.model = model;
        this.mixer = mixer;
        this.goPositions = goPositions;
        this.initialPosition = model.position.clone();
        this.targetPosition = model.position.clone();
        this.speed = 4.0;
        this.rotationSpeed = 8.0;
        this.arrivalThreshold = 0.05;
        this.isMoving = false;

        this.forwardVector = new THREE.Vector3(1, 0, 0);
        
        this.isStarting = false;
        this.hasStarted = false;
        this.isTransitioning = false;
        this.pendingAction = null;

        this.targetLocation = null;

        this.animations = {};
        this.currentAnimation = null;
        this.setUpAnimations(clips);
    }

    getPOIConfig(name) {
        const configs = {
            'GO_Computer': { location: 'computer' },
            'GO_Keyboard': { location: 'keyboard' },
            'GO_Corcho': { location: 'corcho' },
            'GO_Games': { location: 'games' },
            'GO_Bed': { location: 'bed' },
            'GO_Shelf': { location: 'shelf' }
        };
        return configs[name] || null;
    }

    setUpAnimations(clips) {
        if (!clips || clips.length === 0) {
            console.warn('No hay clips de animación.');
            return;
        }

        const findClip = (name) => clips.find(clip => clip.name === name);
        
        const startClip = findClip('start') || findClip('Start');
        const standStartClip = findClip('stand_start') || findClip('stand_start');
        const idleClip = findClip('idle') || findClip('Idle');
        const walkClip = findClip('walk') || findClip('Walk');

        if (idleClip) this.animations.idle = this.mixer.clipAction(idleClip);
        else console.warn('Animación "idle" no encontrada.');
        if (walkClip) this.animations.walk = this.mixer.clipAction(walkClip);
        else console.warn('Animación "walk" no encontrada.');

        if (startClip) {
            this.animations.start = this.mixer.clipAction(startClip);
            this.animations.start.setLoop(THREE.LoopRepeat);
            this.isStarting = true;
        } else {
            console.warn('Animación "start" no encontrada. Se usará idle.');
        }
        if (standStartClip) {
            this.animations.stand_start = this.mixer.clipAction(standStartClip);
            this.animations.stand_start.setLoop(THREE.LoopOnce);
            this.animations.stand_start.clampWhenFinished = true;
        } else {
            console.warn('Animación "stand_start" no encontrada. No se podrá levantar.');
        }

        const locations = ['computer', 'keyboard', 'corcho', 'games', 'bed', 'shelf'];
        locations.forEach(loc => {
            ['idle', 'sit', 'stand'].forEach(type => {
                const name = `${type}_${loc}`;
                const clip = findClip(name);
                if (clip) {
                    if (!this.animations[loc]) this.animations[loc] = {};
                    this.animations[loc][type] = this.mixer.clipAction(clip);
                }
            });
        });

        if (this.animations.start) {
            this.playAnimation('start');
        } else if (this.animations.idle) {
            this.playAnimation('idle');
            this.hasStarted = true;
        }
    }

    getLocationAnimation(location, type) {
        if (this.animations[location] && this.animations[location][type]) {
            return this.animations[location][type];
        }
        return null;
    }

    isMoving(){
        return this.isMoving;
    }

    moveTo(position, callback) {
        if (this.isStarting && !this.hasStarted) {
            this.pendingAction = { type: 'move', position, callback };
            if (!this.isTransitioning) {
                this.startStandUp();
            }
            return;
        }

        if (this.isTransitioning) {
            this.pendingAction = { type: 'move', position, callback };
            return;
        }

        this._moveCallback = callback || null;
        this.targetPosition.copy(position);
        const distance = this.model.position.distanceTo(this.targetPosition);
        if (distance < 0.01) {
            return;
        }
        this.isMoving = true;
        this.playAnimation('walk');
    }

    moveToGO(name, callback) {
        if (this.goPositions[name]) {
            const config = this.getPOIConfig(name);
            if (config) {
                this.executePOI(name, config, callback);
            } else {
                this.moveTo(this.goPositions[name], callback);
            }
        } else {
            console.warn(`Posición GO_ "${name}" no encontrada.`);
            if (callback) callback();
        }
    }

    startStandUp() {
        if (this.isTransitioning || this.hasStarted) return;
        const standAnim = this.animations.stand_start;
        if (!standAnim) {
            console.warn('No hay animación stand_start. Saltando.');
            this.hasStarted = true;
            this.isStarting = false;
            this.playAnimation('idle');
            this.processPending();
            return;
        }

        this.isTransitioning = true;
        const duration = standAnim.getClip().duration || 6250;
        this.playAnimation('stand_start');
        setTimeout(() => {
            this.isTransitioning = false;
            this.hasStarted = true;
            this.isStarting = false;
            this.playAnimation('idle');
            this.processPending();
        }, duration * 1000 + 100);
    }

    processPending() {
        if (this.pendingAction) {
            const action = this.pendingAction;
            this.pendingAction = null;
            if (action.type === 'move') {
                this.moveTo(action.position, action.callback);
            } else if (action.type === 'poi') {
                this.executePOI(action.name, action.config, action.callback);
            }
        }
    }

    executePOI(name, config, callback) {
        // Si estamos en inicio o transición, encolar
        if (this.isStarting || this.isTransitioning || !this.hasStarted) {
            this.pendingAction = { type: 'poi', name, config, callback };
            if (this.isStarting && !this.isTransitioning) {
                this.startStandUp();
            }
            return;
        }

        // Si ya estamos en esa ubicación O ya estamos yendo hacia ella, ejecutar callback directamente
        if (!this.isMoving){
            if (this.currentLocation === config.location || this.targetLocation === config.location) {
                // Si ya está en camino, no abrir ahora; se abrirá al llegar
                // Pero si queremos abrir al llegar, debemos encolar
                if (this.targetLocation === config.location) {
                    // Está en camino, encolar para abrir al llegar
                    this.pendingAction = { type: 'poi', name, config, callback };
                    return;
                }
                if (callback) callback();
                return;
            }
        }

        // Si estamos en otra ubicación, intentar stand de la actual
        const fromLoc = this.currentLocation;
        if (fromLoc && fromLoc !== config.location) {
            const standAnim = this.getLocationAnimation(fromLoc, 'stand');
            if (standAnim) {
                this.isTransitioning = true;
                this.playAnimation(standAnim);
                setTimeout(() => {
                    this.isTransitioning = false;
                    // Establecer targetLocation antes de moverse
                    this.targetLocation = config.location;
                    this.moveTo(this.goPositions[name], () => {
                        this.arriveToLocation(config);
                        // Limpiar targetLocation al llegar
                        this.targetLocation = null;
                        if (callback) callback();
                    });
                }, 1000); // Ajustar según duración
                return;
            }
        }

        // Movimiento directo
        this.targetLocation = config.location;
        this.moveTo(this.goPositions[name], () => {
            this.arriveToLocation(config);
            this.targetLocation = null;
            if (callback) callback();
        });
    }

    arriveToLocation(config) {
        const loc = config.location;
        this.currentLocation = loc;
        // Intentar reproducir sit
        const sitAnim = this.getLocationAnimation(loc, 'sit');
        if (sitAnim) {
            this.playAnimation(sitAnim);
            setTimeout(() => {
                const idleAnim = this.getLocationAnimation(loc, 'idle');
                if (idleAnim) {
                    this.playAnimation(idleAnim);
                } else {
                    this.playAnimation('idle');
                }
            }, 800);
        } else {
            const idleAnim = this.getLocationAnimation(loc, 'idle');
            if (idleAnim) {
                this.playAnimation(idleAnim);
            } else {
                this.playAnimation('idle');
            }
        }
    }

    update(delta) {
        if (this.isTransitioning) {
            if (this.mixer) this.mixer.update(delta);
            return;
        }

        // Movimiento normal
        const distance = this.model.position.distanceTo(this.targetPosition);
        if (distance > this.arrivalThreshold) {
            const step = this.speed * delta;
            const direction = new THREE.Vector3()
                .copy(this.targetPosition)
                .sub(this.model.position);
            direction.y = 0;
            direction.normalize();

            if (distance < step) {
                this.model.position.copy(this.targetPosition);
                this.isMoving = false;
                if (this._moveCallback) {
                    this._moveCallback();
                    this._moveCallback = null;
                }
            } else {
                this.model.position.add(direction.clone().multiplyScalar(step));
                if (direction.length() > 0.001) {
                    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
                        this.forwardVector,
                        direction
                    );
                    const lerpFactor = Math.min(1, this.rotationSpeed * delta);
                    this.model.quaternion.slerp(targetQuat, lerpFactor);
                }
            }
        } else {
            if (this.isMoving) {
                this.model.position.copy(this.targetPosition);
                this.isMoving = false;
                if (this._moveCallback) {
                    this._moveCallback();
                    this._moveCallback = null;
                }
            }
        }

        if (this.mixer) this.mixer.update(delta);
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    isAtLocation(location) {
        return this.currentLocation === location;
    }

    playAnimation(name, fadeTime = 0.2) {
        if (this.currentAnimation === name) return;
        let anim = null;
        if (this.animations[name]) {
            anim = this.animations[name];
        } else {
            for (const loc in this.animations) {
                if (this.animations[loc] && this.animations[loc][name]) {
                    anim = this.animations[loc][name];
                    break;
                }
            }
        }
        if (!anim) {
            console.warn(`Animación "${name}" no encontrada.`);
            return;
        }
        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(fadeTime);
        }
        anim.reset().fadeIn(fadeTime).play();
        this.currentAnimation = anim;
    }
}
/**
 * B"H
 */

import * as THREE from '/games/scripts/build/three.module.js';
export default class RainEffect {
    timeElapsed = 0; /*in seconds, float precision*/
    startTime = Date.now()
    constructor({
        scene, 
        boundingBox, 
        density = 0.1,
        dropSpeed=10,
        dropLength=0.05,
    }) {
        this.scene = scene;
        this.boundingBox = boundingBox;
        this.density = density;
        this.isRaining = true;
        this.dropSpeed = dropSpeed||8.0; // Increase for faster rain
        this.dropLength = dropLength||0.1; // Decrease for shorter raindrops
        this.initRain({
            start: Date.now()
        });
    }
    started = false;

    initRain({
        start /**
        started milliseconds timestamp
         */
    }) {
        if(!start) {
            start = Date.now()
        }
        this.startTime = start;
        this.timeElapsed = (Date.now() - start) / 1000;
        if(!this.started) {
            this.started = true;
            // Calculate the volume of the bounding box to adjust the number of raindrops based on the desired density
            const volume = (this.boundingBox.max.x - this.boundingBox.min.x) * 
                        (this.boundingBox.max.y - this.boundingBox.min.y) * 
                        (this.boundingBox.max.z - this.boundingBox.min.z);
            const raindropCount = Math.ceil(volume * this.density); 

            const vertices = new Float32Array(raindropCount * 6); // Two vertices per line, three components per vertex

            for (let i = 0; i < raindropCount; i++) {
                const x = THREE.MathUtils.randFloat(this.boundingBox.min.x, this.boundingBox.max.x);
                const y = THREE.MathUtils.randFloat(this.boundingBox.min.y+5, this.boundingBox.max.y-5);
                const z = THREE.MathUtils.randFloat(this.boundingBox.min.z, this.boundingBox.max.z);
                const length = this.dropLength;

                // Start vertex
                vertices[i * 6] = x;
                vertices[i * 6 + 1] = y;
                vertices[i * 6 + 2] = z;
                // End vertex
                vertices[i * 6 + 3] = x; // Same x to keep the raindrop vertical
                vertices[i * 6 + 4] = y - length; // y - length to make the line vertical and downwards
                vertices[i * 6 + 5] = z; // Same z
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0.0 },
                    boundingBoxMinY: { value: this.boundingBox.min.y },
                    currentTime: {value: 0},
                    boundingBoxMaxY: { value: this.boundingBox.max.y },
                    dropSpeed: { value: this.dropSpeed }, // Use the class property
                    dropLength: { value: this.dropLength }, // Use the class property
                },
                vertexShader: /*glsl*/`
                uniform float dropSpeed;          // Speed of raindrops falling
                uniform float boundingBoxMinY;    // Minimum Y coordinate of bounding box
                uniform float boundingBoxMaxY;    // Maximum Y coordinate of bounding box
                uniform float currentTime;        // Current time in seconds (corrected comment)

                void main() {
                    // Get the original starting position for each raindrop
                    vec3 originalPosition = position.xyz;
                    // Calculate total distance of the bounding box
                    float totalDistance = boundingBoxMaxY - boundingBoxMinY;
                    // Calculate animation duration for a single drop to traverse the bounding box
                    float animationDuration = totalDistance / dropSpeed;

                    // Calculate a repeating offset based on the current time, ensuring seamless looping
                    float dropPositionOffset = mod(currentTime * dropSpeed, totalDistance);
                    /*
                    float cy = originalPosition.y  - mod(currentTime * dropSpeed, animationDuration) ;
                    */
                   // Adjust the calculation to ensure seamless looping from bottom to top
                    float cy = mod(originalPosition.y - dropPositionOffset + totalDistance, totalDistance) + boundingBoxMinY;

                    // Set the final position of the raindrop
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(
                        originalPosition.x, cy, originalPosition.z, 1.0);
                }
                `,
                fragmentShader: /*glsl*/`
                    void main() {
                        gl_FragColor = vec4(0.67, 0.84, 0.90, 0.5); // Light blue color, semi-transparentaw 
                    }
                `,
                transparent: true,
                depthTest: true,
                depthWrite: false, // Consider setting this to false for transparent objects
            });

            console.log("Set unfiormes",material.uniforms)

            this.rain = new THREE.LineSegments(geometry, material);
            this.scene.add(this.rain);
        } else {
            if(this.rain) {
                this.rain.visible = true;
            }
        }
    }

    stop() {
        this.isRaining = false;
        if(this.rain) {
            this.rain.visible = false;
        }
    }

    update(deltaTime) {
        if (!this.isRaining) return;
        this.timeElapsed = (Date.now() - this.startTime) / 1000;
        
        this.rain.material.uniforms.currentTime.value = this.timeElapsed;
        //console.log("Time elapsed", this.timeElapsed, this.rain.material.uniforms.currentTime,
        /*
        this.boundingBox.min.y,
        this.boundingBox.max.y
        )*/
    }
}
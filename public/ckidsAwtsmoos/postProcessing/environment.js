/**
 * B"H
 * 
 * environment manager 
 * for weather and other effects to happen in the game
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class Environment {
    raindropsGroup = new THREE.Group();
    isRaining = false;
    cloudsGroup = new THREE.Group();
    originalLighting = null;
    groupBoundingBox = null;
    raindropBufferGeometry = null;
    raindropInstance = null;
    constructor({ scene }) {
        this.scene = scene;
    }

    startRain() {
        if (!this.scene || this.isRaining) return;

        const nivrayimGroup = this.scene.getObjectByName('nivrayimGroup');
        
        if (!nivrayimGroup) {
            console.error("nivrayimGroup not found in the scene.");
            return;
        }

        this.originalLighting = {};
    
        this.scene.traverse(child => {
            if (child instanceof THREE.Light) {
                const lightId = child.uuid;
                const originalLight = child.clone();
                this.originalLighting[lightId] = originalLight;
    
                switch (child.type) {
                    case 'AmbientLight':
                        child.intensity *= 0.5;
                        break;
                    default:
                        break;
                }
            }
        });
    
        this.scene.userData.originalLighting = this.originalLighting;
    
        const numClouds = 5;
        const cloudGeometry = new THREE.SphereGeometry(10, 32, 32);
        const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.7 });
    
        this.groupBoundingBox = this.calculateGroupBoundingBox(nivrayimGroup);
        const topY = this.groupBoundingBox.max.y;
    
        for (let i = 0; i < numClouds; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                THREE.MathUtils.randFloat(this.groupBoundingBox.min.x, this.groupBoundingBox.max.x),
                THREE.MathUtils.randFloat(topY + 10, topY + 30),
                THREE.MathUtils.randFloat(this.groupBoundingBox.min.z, this.groupBoundingBox.max.z)
            );
            this.cloudsGroup.add(cloud);
        }
    
        this.raindropsGroup.add(this.cloudsGroup);
        this.scene.add(this.raindropsGroup);
    
        this.isRaining = true;
        this.addRaindrops();
    }

    stopRain() {
        if (!this.isRaining) return;

        for (const child of this.scene.children) {
            if (child instanceof THREE.Light) {
                const lightId = child.uuid;
                const originalLight = this.originalLighting[lightId];
                if (originalLight) {
                    this.scene.remove(child);
                    this.scene.add(originalLight.clone());
                }
            }
        }
        
        this.raindropsGroup.remove(this.cloudsGroup);
        this.cloudsGroup.clear();
        this.raindropsGroup.clear();
        this.scene.remove(this.raindropsGroup);
        
        this.isRaining = false;
        this.groupBoundingBox = null;
    }

    calculateGroupBoundingBox(group) {
        if (!group) return null;

        const boundingBox = new THREE.Box3();

        group.traverse(child => {
            if (child instanceof THREE.Mesh) {
                boundingBox.expandByObject(child);
            }
        });

        return boundingBox;
    }

    addRaindrops() {
        const boundingBox = this.groupBoundingBox || this.sceneBoundingBox;
    
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    
        const raindropDensity = 500;
        const numberOfRaindrops = Math.ceil(raindropDensity);
    
        const raindropMesh = new THREE.InstancedMesh(geometry, material, numberOfRaindrops);
        
        const positions = new Float32Array(numberOfRaindrops * 3);
        for (let i = 0; i < numberOfRaindrops; i++) {
            positions[i * 3] = THREE.MathUtils.randFloat(boundingBox.min.x, boundingBox.max.x);
            positions[i * 3 + 1] = THREE.MathUtils.randFloat(boundingBox.min.y, boundingBox.max.y);
            positions[i * 3 + 2] = THREE.MathUtils.randFloat(boundingBox.min.z, boundingBox.max.z);
        }
        raindropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        
        // Set instance matrices
        for (let i = 0; i < numberOfRaindrops; i++) {
            const position = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );
            const rotation = new THREE.Euler();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3(1, 1, 1);
            const matrix = new THREE.Matrix4().compose(position, quaternion, scale);
            raindropMesh.setMatrixAt(i, matrix);
        }
        
        this.raindropsGroup.add(raindropMesh);
        this.raindropInstance = raindropMesh;
        this.raindropBufferGeometry = raindropMesh.geometry;
    }

    update() {
        if (
            !this.isRaining || 
            !this.raindropBufferGeometry ||
            !this.raindropInstance
        ) return;
    
        const positions = this.raindropBufferGeometry.getAttribute('position');
        for (let i = 0, ul = positions.count; i < ul; i++) {
            positions.setY(i, positions.getY(i) - 0.01);
            if (positions.getY(i) < this.groupBoundingBox.min.y) {
                positions.setY(i, this.groupBoundingBox.max.y);
                positions.setX(i, THREE.MathUtils.randFloat(this.groupBoundingBox.min.x, this.groupBoundingBox.max.x));
                positions.setZ(i, THREE.MathUtils.randFloat(this.groupBoundingBox.min.z, this.groupBoundingBox.max.z));
            }
        }
        positions.needsUpdate = true;
    
        // Update instance matrices
        const raindropMesh = this.raindropInstance
        for (let i = 0; i < raindropMesh.count; i++) {
            const position = new THREE.Vector3(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );
            const rotation = new THREE.Euler();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3(1, 1, 1);
            const matrix = new THREE.Matrix4().compose(position, quaternion, scale);
            raindropMesh.setMatrixAt(i, matrix);
        }
    }
}

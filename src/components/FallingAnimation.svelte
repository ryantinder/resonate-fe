<script lang="ts">
    import { browser } from "$app/environment";
    import * as THREE from "three";
    import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
    import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
	import { onMount } from "svelte";

    let isMounted = false;

    onMount(()=>{
        isMounted = true;
    });
    
    $: if (browser && isMounted) {

        // Setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        let element = document.getElementById('animation')
        if (element) {
            element.appendChild(renderer.domElement);
        } else {
            document.body.appendChild(renderer.domElement);
        }

        const fontLoader = new FontLoader();

        // Parameters
        const textColor = 0x074ede; // Neon green
        const backgroundColor = 0xffffff; // Black
        const numCharacters = 1_000; // Number of falling characters
        const isMobile = window.innerWidth < 768;

        // Adjust x for window width
        function getXForGroup(group: number) {
            if (group === 0) {
                group += isMobile ? 0.5 : 0;
            }
            return group * (window.innerWidth / window.innerHeight) * 2.5;
        }

        // Animation
        const fallingCharacters: any = [];

        let myFont: any;
        let numCols = isMobile ? 10 : 5;

        fontLoader.load('/fonts/helvetiker_bold.typeface.json', function (font: any) {
            myFont = font;
            for (let i = 0; i < numCharacters; i++) {
                const group = i % numCols;
                const geometry = new THREE.SphereGeometry( 0.1, 64, 64 );
                const material = new THREE.MeshBasicMaterial({ color: textColor });
                const mesh = new THREE.Mesh(geometry, material);
                if (i % 4 == 0) {
                    mesh.position.x = -getXForGroup(group) - Math.random() * 4;
                    mesh.position.y = 10 + Math.random() * 20;
                } else if (i % 4 == 1) {
                    mesh.position.x = getXForGroup(group) + Math.random() * 4;
                    mesh.position.y = 10 + Math.random() * 20;
                } 
                // else if (i % 4 == 2) {
                //     mesh.position.y = -getXForGroup(group);
                //     mesh.position.x = 10 + Math.random() * 20;
                // } else {
                //     mesh.position.y = getXForGroup(group);
                //     mesh.position.x = 10 + Math.random() * 20;
                // }
                
                mesh.position.z = - 10 + Math.random() * 5;
                scene.add(mesh);

                fallingCharacters.push({
                    mesh: mesh,
                    speed: 0.005 + Math.random() * 0.05,
                });
            }
        });


        let speedMultiplier = 1;
        function animate() {
            requestAnimationFrame(animate);

            // Update positions
            fallingCharacters.forEach(function (character: any, index: number) {
                if (index % 4 < 2) {
                    character.mesh.position.y -= character.speed * speedMultiplier;
                    if (character.mesh.position.y < -16) {
                        character.mesh.position.y = 16 + Math.random() * 5;
                    }
                } 
                // else {
                //     character.mesh.position.x -= character.speed * speedMultiplier;
                //     if (character.mesh.position.x < -20) {
                //         character.mesh.position.x = 20 + Math.random() * 5;
                //     }
                // }
            });

            renderer.setClearColor(backgroundColor);
            renderer.render(scene, camera);
        }

        onresize = function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        addEventListener('resize', onresize);

        animate();

    }     
</script>
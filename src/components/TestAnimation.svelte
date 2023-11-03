<script lang="ts">
    import { browser } from "$app/environment";
    import * as THREE from "three";
    import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
    import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import { onMount } from "svelte";

    let isMounted = false;

    onMount(()=>{
        isMounted = true;
    });
    
    $: if (browser && isMounted) {
        // Scene, camera, and lighting setup
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        let cameraStartPosition = [0,0,4];
        camera.position.set(cameraStartPosition[0], cameraStartPosition[1], cameraStartPosition[2]);
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        let element = document.getElementById('animation')
        if (element) {
            element.appendChild(renderer.domElement);
        } else {
            document.body.appendChild(renderer.domElement);
        }

        let isMobile = window.innerWidth < 768;


        let buttonGeometry = new THREE.BoxGeometry( 1, 1, 1 );
        let material2 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const button1 = new THREE.Mesh( buttonGeometry, material2 );
        button1.position.set(0,0,0);
        scene.add(button1);

        // callbacks and animation
        function animate(time: number) {
            renderer.render(scene, camera);
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        onresize = function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        let color = 0xff0000;
        function onMouseClick( event ) {
            const intersects = raycaster.intersectObject( button1 );
            if (intersects.length > 0) {
                intersects[0].object.material.color.set( color );
                color = color === 0xff0000 ? 0x00ff00 : 0xff0000;
                // window.open('https://www.google.com', '_blank');
                // console.log('Mesh clicked!')
            }
        }
        function onMouseMove( event ) {
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );
        }
        window.addEventListener( 'click', onMouseClick, false );
        window.addEventListener( 'mousemove', onMouseMove, false );

        renderer.setClearColor(0xFFFFFF);
        renderer.setAnimationLoop(animate);
    }     
</script>

<div class="w-[100vw] h-[100vh]">

</div>
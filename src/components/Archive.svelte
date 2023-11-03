<script>
    // const loader = new FontLoader();

    // loader.load( 'fonts/helvetiker_bold.typeface.json', function ( font: any ) {

        //     const geometry = new TextGeometry( 'Are you based anon?', {
        //         font: font,
        //         size: 0.4,
        //         height: 0.005,
        //         // curveSegments: 12,
        //         // bevelEnabled: true,
        //         // bevelThickness: 10,
        //         // bevelSize: 8,
        //         // bevelOffset: 0,
        //         // bevelSegments: 5
        //     } );

        //     const material = new THREE.MeshBasicMaterial( { color: 0x0fff0 } );
        //     const mesh = new THREE.Mesh( geometry, material );
        //     mesh.position.x -= 2.5;
        //     mesh.position.z += 2.0;
        //     scene.add( mesh );
        // } );

        // const orbit = new OrbitControls(camera, renderer.domElement);
        // orbit.update();



    // import { browser } from "$app/environment";
    // import * as THREE from "three";
    // import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
    // import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
    // import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	// import { onMount } from "svelte";

    // let isMounted = false;

    // onMount(()=>{
    //     isMounted = true;
    // });
    
    // $: if (browser && isMounted) {

    //     // Setup
    //     const scene = new THREE.Scene();
    //     const cameraGroup = new THREE.Group();
    //     scene.add(cameraGroup);

    //     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //     let cameraStartPosition = [0,15,100];
    //     camera.position.set(cameraStartPosition[0], cameraStartPosition[1], cameraStartPosition[2]);
    //     cameraGroup.add(camera);

    //     const renderer = new THREE.WebGLRenderer();
    //     renderer.setSize(window.innerWidth, window.innerHeight);
    //     let element = document.getElementById('animation')
    //     if (element) {
    //         element.appendChild(renderer.domElement);
    //     } else {
    //         document.body.appendChild(renderer.domElement);
    //     }

    //     const main = document.getElementById('main');

    //     const cursor = {x: 0, y: 0};
    //     let sectionIndex = 0;
    //     // where the camera should transition relative to the sphere
    //     let cameraPositions = [
    //         {
    //             x: cameraStartPosition[0],
    //             y: cameraStartPosition[1],
    //             z: cameraStartPosition[2],
    //         },
    //         {
    //             x: 0,
    //             y: 2.05,
    //             z: 1.1,
    //         },
    //         {
    //             x: 0,
    //             y: 0,
    //             z: 1,
    //         },
    //     ];
    //     let normalizedScroll = 0;

    //     // const isMobile = window.innerWidth < 768;

    //     // initialize objects
    //     const SphereGeometry = new THREE.SphereGeometry( 2, 125, 125);
    //     const material = new THREE.MeshBasicMaterial({ 
    //         color: 0x074ede,
    //         wireframe: true,
    //     });
    //     const sphere = new THREE.Mesh(SphereGeometry, material);
    //     scene.add(sphere);

    //     // callbacks and animation
    //     function animate(time: number) {
    //         sphere.rotateY(0.001);
    //         // sphere.position.x += 0.01
    //         // cameraGroup.position.x += cursor.x;
    //         // cameraGroup.position.y += cursor.y;
    //         renderer.render(scene, camera);
    //     }

    //     let previousScroll = 0;
    //     const updateScroll = (e: any) => {
    //         e.preventDefault();
    //         let scrollDown = e.target.scrollTop >= previousScroll;
    //         previousScroll = e.target.scrollTop;
    //         let nextIndex = 0;
    //         nextIndex = scrollDown ? Math.min(sectionIndex+1, cameraPositions.length - 1) : Math.max(sectionIndex-1,0);
    //         let currentScroll = e.target.scrollTop + 2;
    //         let newSectionIndex;
    //         if (!scrollDown) {
    //             newSectionIndex = Math.min(Math.floor((currentScroll+window.innerHeight-2) / window.innerHeight), cameraPositions.length - 1);
    //         } else {
    //             newSectionIndex = Math.floor((currentScroll) / window.innerHeight);
    //         }
    //         console.log({
    //             currentScroll,
    //             ih:window.innerHeight,
    //             newSectionIndex,
    //             wtf:Math.min(Math.floor((currentScroll+window.innerHeight*5) / window.innerHeight), cameraPositions.length - 1),
    //         })
    //         if (newSectionIndex != sectionIndex) {
    //             sectionIndex = newSectionIndex;
    //         }
    //         normalizedScroll = ((currentScroll) / window.innerHeight) % 1;
    //         let targetX = sphere.position.x + cameraPositions[nextIndex].x;
    //         let targetY = sphere.position.y + cameraPositions[nextIndex].y;
    //         let targetZ = sphere.position.z + cameraPositions[nextIndex].z;
    //         let xDelta = cameraPositions[sectionIndex].x - targetX;
    //         let yDelta = cameraPositions[sectionIndex].y - targetY;
    //         let zDelta = cameraPositions[sectionIndex].z - targetZ;
    //         let newX = cameraPositions[sectionIndex].x - (xDelta*normalizedScroll); //+ cursor.x;
    //         let newY = cameraPositions[sectionIndex].y - (yDelta*normalizedScroll); //+ cursor.y;
    //         let newZ = cameraPositions[sectionIndex].z - (zDelta*normalizedScroll);
    //         // console.log({
    //         //     sectionIndex,
    //         //     nextIndex,
    //         //     scrollDown,
    //         //     newSectionIndex,
    //         //     normalizedScroll: normalizedScroll,
    //         //     // targetX,
    //         //     // newX,
    //         //     // targetY,
    //         //     // newY,
    //         //     targetZ,
    //         //     zDelta,
    //         //     newZ,
    //         // })
    //         camera.position.set(newX, newY, newZ);
    //         renderer.render(scene, camera);
    //     }

    //     onresize = function () {
    //         camera.aspect = window.innerWidth / window.innerHeight;
    //         camera.updateProjectionMatrix();
    //         renderer.setSize(window.innerWidth, window.innerHeight);
    //     };

    //     addEventListener('resize', onresize);
    //     // @ts-ignore
    //     main.addEventListener('scroll', updateScroll);

    //     window.addEventListener('mousemove', (event) => {
    //         console.log(sectionIndex)
    //         // if (sectionIndex == 0) {
    //         //     cursor.x = -((event.clientX / window.innerWidth) - 0.5) * 25;
    //         //     cursor.y = ((event.clientY / window.innerHeight) - 0.5) * 25;
    //         // } else if (sectionIndex == 1) {
    //         //     // cursor.x = -((event.clientX / window.innerWidth) - 0.5) * 0.000005;
    //         //     // cursor.y = ((event.clientY / window.innerHeight) - 0.5) * 0.000005;
    //         //     cursor.x = cameraPositions[sectionIndex].x - ((event.clientX / window.innerWidth) - 0.5) * 0.05;
    //         //     cursor.y = cameraPositions[sectionIndex].y + ((event.clientY / window.innerHeight) - 0.5) * 0.05;
    //         // } else {
    //         //     cursor.x = cameraPositions[sectionIndex].x + ((event.clientX / window.innerWidth) - 0.5) * 0.5;
    //         //     cursor.y = cameraPositions[sectionIndex].y -((event.clientY / window.innerHeight) - 0.5) * 0.5;
    //         // }
    //         // console.log(cursor, window.innerWidth, window.innerHeight)
    //         // cameraGroup.position.x += -((event.clientX / window.innerWidth) - 0.5) * (camera.position.z / 100);
    //         // cameraGroup.position.y += ((event.clientY / window.innerHeight) - 0.5) * (camera.position.z / 100);
    //     })

    //     renderer.setClearColor(0xFFFFFF);
    //     renderer.setAnimationLoop(animate);

    // } 
















    // function showText() {
    //         let text;
    //         loader.load( 'fonts/helvetiker_bold.typeface.json', function ( font: any ) {
    //             const geometry = new TextGeometry("you're in the circle", {
    //                 font: font,
    //                 size: isMobile ? 0.3 : 0.6,
    //                 height: isMobile ? 0.1 : 0.2,
    //             } );

    //             const material = new THREE.MeshStandardMaterial( { color: 0x00FF00 } );
    //             const texture = new THREE.TextureLoader().load('/bluegradient7.jpeg')
    //             material.metallnessMap = texture;
    //             sphere.castShadow = true
    //             sphere.recieveShadow = true
    //             const mesh = new THREE.Mesh( geometry, material );
    //             mesh.position.x = isMobile ? -1.6 : -3.2;
    //             mesh.position.y = -0.2;
    //             mesh.position.z = -2.5;
    //             text = mesh;
    //             scene.add(mesh);
    //         });
    //         return text;
    //     }


        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        // scene.add(ambientLight)
        // const light = new THREE.DirectionalLight()
        // light.position.set(2.5, 2, 2)
        // light.castShadow = true
        // light.shadow.mapSize.width = 512
        // light.shadow.mapSize.height = 512
        // light.shadow.camera.near = 0.5
        // light.shadow.camera.far = 100
        // scene.add(light)



        // let buttonGeometry = new THREE.BoxGeometry( 1, 1, 1 );
            // let material = new THREE.MeshBasicMaterial( { color: 0x00ff00, opacity: 0.7, transparent: true } );
            // const button1 = new THREE.Mesh( buttonGeometry, material );
            // button1.position.x = -1.6;
            // button1.position.y = 0.2;
            // button1.position.z = -2.5;
            // button1.onClick = () => {
            //     if (!audio.paused) {
            //         audio.pause();
            //     } else {
            //         audio = new Audio('/emotional-abstract.mp3');
            //         setupAudioContext();
            //         audio.paused ? audio.play() : audio.pause();
            //     }
            // }
            // scene.add(button1);

            // const button2 = new THREE.Mesh( buttonGeometry, material );
            // button2.position.x = 1.6;
            // button2.position.y = 0.2;
            // button2.position.z = -2.5;
            // button2.onClick = () => {
            //     if (!audio.paused) {
            //         audio.pause();
            //     } else {
            //         audio = new Audio('/floating-abstract.mp3');
            //         setupAudioContext();
            //         audio.paused ? audio.play() : audio.pause();
            //     }
            // }
            // scene.add(button2);
            
            // const button3 = new THREE.Mesh( buttonGeometry, material );
            // button3.position.x = 0;
            // button3.position.y = 0.2;
            // button3.position.z = -2.5;
            // button3.onClick = () => {
            //     if (!audio.paused) {
            //         audio.pause();
            //     } else {
            //         audio = new Audio('/empty-mind.mp3');
            //         setupAudioContext();
            //         audio.paused ? audio.play() : audio.pause();
            //     }
            // }
            // scene.add(button3);

            // buttons = [button1, button2, button3];



</script>

<!-- <div class="flex flex-col justify-center align-middle content-center
            mx-auto my-auto w-[400px] h-[400px] rounded-full
            bg-[conic-gradient(#ffffff,#0320fc,#0320fc)]
             at-right
            shadow-2xl shadow-blue-400"
    >
    <h1 class="text-4xl text-center">
        Are you <span class="text-[#0320fc]">based?</span>
    </h1>
    
    <div class="flex flex-row max-w-fit gap-4 justify-center content-center mx-auto">
        <button class="button-primary shadow-md shadow-white/60">
            <a href="/">Twitter</a>
        </button>
        <button class="button-secondary shadow-md shadow-white/60">
            <a href="/">Discord</a>
        </button>
    </div>
</div> -->

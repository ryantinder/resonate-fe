<script lang="ts">
    import { browser } from "$app/environment";
    // @ts-ignore
    import * as THREE from "three";
    // @ts-ignore
    import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
    // @ts-ignore
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { onMount } from "svelte";

    let isMounted = false;

    onMount(()=>{
        isMounted = true;
    });
    
    $: if (browser && isMounted) {
        
        // songs and index for buttons
        let songIndex = 0;
        let songs = [
            '/emotional-abstract.mp3',
            '/floating-abstract.mp3',
            '/empty-mind.mp3',
        ];

        // setup audio context
        let audio = new Audio(songs[songIndex]);
        let audioContext: any;
        let source: any;
        let analyser: any;
        let dataArray = new Uint8Array(512);

        const setupAudioContext = () => {
            audioContext = new window.AudioContext();
            source = audioContext.createMediaElementSource(audio);
            analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 1024;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        };

        // Scene, camera, and renderer
        const scene = new THREE.Scene();
        const cameraGroup = new THREE.Group();
        scene.add(cameraGroup);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        let cameraStartPosition = [0,17,100];
        camera.position.set(cameraStartPosition[0], cameraStartPosition[1], cameraStartPosition[2]);
        cameraGroup.add(camera);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMapEnabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        let element = document.getElementById('animation')
        if (element) {
            element.appendChild(renderer.domElement);
        } else {
            document.body.appendChild(renderer.domElement);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)
        const light = new THREE.DirectionalLight()
        light.position.set(2.5, 2, 2)
        light.castShadow = true
        light.shadow.mapSize.width = 512
        light.shadow.mapSize.height = 512
        light.shadow.camera.near = 0.5
        light.shadow.camera.far = 100
        scene.add(light)

        // state variables
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const main = document.getElementById('home');
        const cursor = {x: 0, y: 0};
        const isMobile = window.innerWidth < 768;
        let buttons: any = [];
        let sectionIndex = 0;
        let cameraPositions = [
            {
                x: cameraStartPosition[0],
                y: isMobile ? cameraStartPosition[1] + 4 : cameraStartPosition[1],
                z: cameraStartPosition[2],
            },
            {
                x: 0,
                y: isMobile ? 6.0 : 5.5,
                z: 4.2,
            },
            {
                x: 0,
                y: 0,
                z: 3.9,
            },
        ];
        let normalizedScroll = 0;
        let nextIndex = 0;

        // load font
        const loader = new FontLoader();

        // orderButton helper
        const getPositionByName = (name: string) => {
            if (name === 'backward') {
               return 0;
            } else if (name === 'play') {
                return 1;
            } else if (name === 'pause') {
                return 2;
            } else if (name === 'forward') {
                return 3;
            } else {
                return 0;
            }
        }

        let buttonGroup = new THREE.Group();
        function showButtons() {
            const loader = new GLTFLoader();
            const gltfs = [ 
                {
                    fname: '/forward.glb',
                    onClick: () => {
                        audio.pause();
                        songIndex += 1;
                        audio = new Audio(songs[songIndex%songs.length]);
                        setupAudioContext();
                        audio.play();
                    }
                },
                {
                    fname: '/pause.glb',
                    onClick: () => {
                        audio.pause();
                    }
                },
                {
                    fname: '/play.glb',
                    onClick: () => {
                        audio.play();
                    }
                },
                {
                    fname: '/backward.glb',
                    onClick: () => {
                        audio.pause();
                        songIndex -= 1;
                        if (songIndex < 0) songIndex = songs.length - 1;
                        audio = new Audio(songs[songIndex%songs.length]);
                        setupAudioContext();
                        audio.play();
                    }
                },
            ];
            let count = 0;
            for (let obj of gltfs) {
                let fname = obj.fname;
                let onClick = obj.onClick;
                loader.load(fname, ( gltf: any ) => {
                    let gltfGroup = gltf.scene;
                    gltfGroup.userData.name = fname.replace('/', '').replace('.glb', '');
                    gltfGroup.position.set(getPositionByName(gltfGroup.userData.name)*2.5+4.0, 0, -2.5);
                    gltfGroup.userData.onClick = onClick;
                    let mesh = gltfGroup.children[0];
                    mesh.castShadow = true;
                    mesh.recieveShadow = true;
                    mesh.material = new THREE.MeshBasicMaterial({
                        color: 0x36ffbf,
                        opacity: 0.8,
                        transparent: true,
                    });
                    buttons.push(gltfGroup);
                    buttonGroup.add(gltfGroup);
                    count += 1;
                });
            }
            buttonGroup.scale.set(0.5, 0.5, 0.5);
            buttonGroup.position.set(-4, 0.25, -1.0);
            scene.add(buttonGroup);
        }

        function showSphere() {
            let sphereGeometry = new THREE.SphereGeometry( 5, isMobile ? 60 : 120, isMobile ? 60 : 120);
            let material = new THREE.ShaderMaterial({
                uniforms: {
                    u_time: {
                        type: "f",
                        value: 1.0,
                    },
                    u_amplitude: {
                        type: "f",
                        value: 3.0,
                    },
                    u_data_arr: {
                        type: "float[64]",
                        value: dataArray,
                    },
                    u_z_adjustment: {
                        type: "f",
                        value: isMobile ? 1.23 : 1.0,
                    }
                },
                vertexShader: /* glsl */`
                    varying float x;
                    varying float y;
                    varying float z;
                    varying float z2;
                    varying float z3;
                    varying float floor_x;
                    varying float floor_y;
                    varying vec3 vUv;
                    
                    uniform float u_time;
                    uniform float u_amplitude;
                    uniform float[64] u_data_arr;
                    uniform float u_z_adjustment;

                    void main() {
                        vUv = position;

                        x = abs(position.x);
                        y = abs(position.y);

                        floor_x = round(x);
                        floor_y = round(y);
                        int index = int(floor_x) + int(floor_y) * 15;
                        int index2 = int(round(vUv.x*0.8)) + int(round(vUv.y*0.8));

                        z = sin(u_data_arr[index] / 80.0 + u_data_arr[index] / 80.0) * 0.1;
                        z2 = sin(u_data_arr[index2] / 70.0 + u_data_arr[index2] / 70.0) * 0.1;
                        z3 = sin(u_data_arr[index] / 650.0 + u_data_arr[index] / 650.0) * 0.1 * u_z_adjustment;
                        float zPos = mix(position.z, position.z + z2*z*15.0, 1.0);
                        // gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, zPos, 1.0);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, position.z, 1.0);
                    }
                `,
                fragmentShader: /* glsl */`
                    varying float x;
                    varying float y;
                    varying float z3;
                    varying float z2;
                    varying vec3 vUv;

                    uniform float u_time;
                    
                    float rand(vec2 co) {
                        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
                    }

                    void main() {
                        gl_FragColor = vec4(max(0.0, z3 * 8.0), max(0.00, vUv.z + z3*55.0), max(0.85, vUv.y*z2*30.0), 1.0);
                        // gl_FragColor = vec4(0.0, 0.0, 1, 1.0);
                    }
                `,
                wireframe: true,
            });
            sphere2 = new THREE.Mesh(sphereGeometry, material);
            scene.add(sphere2);
        }

        // initialize objects
        let sphereGeometry = new THREE.SphereGeometry( 5, 50, 50);
        let material = new THREE.MeshBasicMaterial({
            color: 0x074ede,
            wireframe: true,
        });
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.castShadow = true
        sphere.recieveShadow = true
        scene.add(sphere);

        let sphere2: any;
        // callbacks and animation
        function animate(time: number) {
            if (analyser !== undefined) {
                analyser.getByteFrequencyData(dataArray);
                if (sphere2) {
                    sphere2.material.uniforms.u_data_arr.value = dataArray;
                }
            }
            if (sphere !== undefined) {
                sphere.rotateY(0.001);
            }
            if (!audio.paused) {
                sphere2.rotateZ(0.0025);
            }
            cameraGroup.position.x = cursor.x;
            cameraGroup.position.y = cursor.y;
            let xDelta = cameraPositions[nextIndex].x - (cameraPositions[sectionIndex].x + sphere.position.x);
            let yDelta = cameraPositions[nextIndex].y - (cameraPositions[sectionIndex].y + sphere.position.y);
            let zDelta = cameraPositions[nextIndex].z - (cameraPositions[sectionIndex].z + sphere.position.z);
            let newX = (xDelta*normalizedScroll) + (cameraPositions[sectionIndex].x + sphere.position.x); //+ cursor.x;
            let newY = (yDelta*normalizedScroll) + (cameraPositions[sectionIndex].y + sphere.position.y); //+ cursor.y;
            let newZ = (zDelta*normalizedScroll) + (cameraPositions[sectionIndex].z + sphere.position.z);
            
            camera.position.set(newX, newY, newZ);
            renderer.render(scene, camera);
        }

        function party(isOn: boolean) {
            if (sphere2) return;
            if (isOn) {
                scene.remove(sphere);
                renderer.setClearColor(0x031d47);
                showSphere();
                showButtons();
            } else {
            }
        }
        
        const updateScroll = (e: any) => {
            e.preventDefault();
            if (camera.position.z < cameraPositions[cameraPositions.length-1].z + 0.1) {
                party(true);
            } else {
                party(false);
            }
            let newSectionIndex = Math.floor((e.target.scrollTop+2) / window.innerHeight);
            if (newSectionIndex != sectionIndex) {
                sectionIndex = newSectionIndex;
            }
            if (sectionIndex < cameraPositions.length - 1) {
                nextIndex = sectionIndex+1;
            } else {
                nextIndex = sectionIndex;
            }
            normalizedScroll = ((e.target.scrollTop+2) / window.innerHeight) % 1;
        }

        // @ts-ignore
        main.addEventListener('scroll', updateScroll);
        
        window.addEventListener( 'click', () => {
            if (!audioContext) {
                setupAudioContext();
            }
            if (sectionIndex === 2) {
                const intersects = raycaster.intersectObjects( buttons );
                if (intersects.length > 0) {
                    try {
                        intersects[0].object.onClick();
                    } catch (e) {
                        intersects[0].object.parent.userData.onClick();
                    }
                }
            }
        }, false );

        window.addEventListener('mousemove', (event) => {
            if (sectionIndex == 2 && !isMobile) {
                cursor.x = cameraPositions[sectionIndex].x + ((event.clientX / window.innerWidth) - 0.5) * 5;
                cursor.y = cameraPositions[sectionIndex].y - ((event.clientY / window.innerHeight) - 0.5) * 5;
            }
            if (sectionIndex === 2) {
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                raycaster.setFromCamera( mouse, camera );
            }
        })

        addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        renderer.setClearColor(0xFFFFFF);
        renderer.setAnimationLoop(animate);

    }     
</script>
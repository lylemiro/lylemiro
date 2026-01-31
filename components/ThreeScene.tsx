import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

interface ThreeSceneProps {
    minimalMode: boolean;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ minimalMode }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const noise2D = createNoise2D();

    useEffect(() => {
        if (minimalMode || !mountRef.current) return;

        // --- PALETTE ---
        const COLORS = {
            skyTop: new THREE.Color('#050011'),
            skyBottom: new THREE.Color('#2a003b'),
            sunTop: new THREE.Color('#ffe600'),
            sunBottom: new THREE.Color('#ff0055'),
            gridWater: new THREE.Color('#ff00aa'),
            gridMountain: new THREE.Color('#00f0ff'),
            mountainFill: new THREE.Color('#030008'),
        };

        const width = window.innerWidth;
        const height = window.innerHeight;

        // --- SETUP ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);

        const isMobile = width < 768;
        camera.position.set(0, isMobile ? 30 : 25, isMobile ? 240 : 220);
        camera.lookAt(0, 5, -200);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const clock = new THREE.Clock();

        // Fog removed per user request for a clearer look
        scene.fog = null;

        // --- BACKGROUND GRADIENT (Sky) ---
        const skyGeo = new THREE.SphereGeometry(2000, 32, 32);
        skyGeo.scale(-1, 1, 1);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: COLORS.skyTop },
                bottomColor: { value: COLORS.skyBottom },
                offset: { value: 100 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
            fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize( vWorldPosition + offset ).y;
          gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
        }
      `,
            side: THREE.BackSide,
            fog: false
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);

        // --- FAR GALAXY (SPIRAL) --- 
        const galaxyGeo = new THREE.BufferGeometry();
        const galaxyCount = 2000;
        const galaxyPos = new Float32Array(galaxyCount * 3);
        const galaxyColors = new Float32Array(galaxyCount * 3);
        const gColorInside = new THREE.Color('#ff6030');
        const gColorOutside = new THREE.Color('#1b3984');

        for (let i = 0; i < galaxyCount; i++) {
            const rBase = Math.random();
            const radius = Math.pow(rBase, 2.5) * 140;
            const spinAngle = radius * 0.3;
            const branches = 2;
            const branchAngle = (i % branches) * ((Math.PI * 2) / branches);

            const randomness = Math.pow(Math.random(), 3) * 10;
            const randX = randomness * (Math.random() < 0.5 ? 1 : -1);
            const randY = randomness * (Math.random() < 0.5 ? 1 : -1);
            const randZ = randomness * (Math.random() < 0.5 ? 1 : -1);

            const x = Math.cos(branchAngle + spinAngle) * radius + randX;
            const y = Math.sin(branchAngle + spinAngle) * radius + randY;
            const z = (Math.random() - 0.5) * 5 + randZ;

            galaxyPos[i * 3] = x;
            galaxyPos[i * 3 + 1] = y;
            galaxyPos[i * 3 + 2] = z;

            const mixedColor = gColorInside.clone();
            mixedColor.lerp(gColorOutside, radius / 140);

            galaxyColors[i * 3] = mixedColor.r;
            galaxyColors[i * 3 + 1] = mixedColor.g;
            galaxyColors[i * 3 + 2] = mixedColor.b;
        }

        galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
        galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

        const galaxyMat = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            fog: false,
            transparent: true,
            opacity: 0.9
        });

        const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
        galaxy.position.set(isMobile ? -140 : -400, 350, -900);
        galaxy.scale.set(1.75, 1.75, 1.75); // Increased 75% for "closer" look
        galaxy.rotation.x = Math.PI / 1.7;
        galaxy.rotation.y = Math.PI / 8;
        galaxy.rotation.z = -Math.PI / 12;
        galaxy.renderOrder = 1;
        scene.add(galaxy);

        // --- STARS ---
        const starCount = isMobile ? 6000 : 3000;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const spreadX = isMobile ? 1500 : 3000;
        for (let i = 0; i < starCount * 3; i += 3) {
            starPos[i] = (Math.random() - 0.5) * spreadX;
            starPos[i + 1] = Math.random() * 800 + 50;
            starPos[i + 2] = -Math.random() * 800 - 600;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: isMobile ? 1.2 : 0.8,
            transparent: true,
            opacity: 0.9,
            fog: false
        });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);



        // --- SUN ---
        const sunGeo = new THREE.PlaneGeometry(300, 300);
        const sunMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    colorTop: { value: COLORS.sunTop },
                    colorBottom: { value: COLORS.sunBottom }
                }
            ]),
            vertexShader: `
        varying vec2 vUv;
        #include <fog_pars_vertex>
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
            fragmentShader: `
        uniform vec3 colorTop;
        uniform vec3 colorBottom;
        varying vec2 vUv;
        #include <fog_pars_fragment>
        void main() {
          float dist = distance(vUv, vec2(0.5, 0.5));
          if (dist > 0.5) discard;

          // Classic Vaporwave Sun Stripes (Horizontal Bars)
          float stripes = step(0.15, fract(vUv.y * 12.0));
          // Fade stripes towards the top
          float stripeMask = mix(1.0, stripes, smoothstep(0.8, 0.2, vUv.y));
          
          vec3 gradient = mix(colorBottom, colorTop, vUv.y);
          gl_FragColor = vec4(gradient * 1.5, stripeMask);
          #include <fog_fragment>
        }
      `,
            transparent: true,
            fog: false,
            depthWrite: true,
        });

        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(0, isMobile ? 20 : 40, -500);
        sun.renderOrder = 2; // Above comet/galaxy
        scene.add(sun);

        // Balanced Sun Glow size and color
        const glowGeo = new THREE.PlaneGeometry(700, 700);
        const glowMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    color: { value: new THREE.Color('#ff4400') } // Deeper Red-Orange
                }
            ]),
            vertexShader: `
                varying vec2 vUv;
                #include <fog_pars_vertex>
                void main() {
                    vUv = uv;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying vec2 vUv;
                #include <fog_pars_fragment>
                void main() {
                    float d = distance(vUv, vec2(0.5, 0.5));
                    // Balanced alpha for a radiant but controlled glow
                    float alpha = smoothstep(0.5, 0.0, d) * 0.5;
                    gl_FragColor = vec4(color, alpha);
                    #include <fog_fragment>
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false
        });
        const sunGlow = new THREE.Mesh(glowGeo, glowMat);
        sunGlow.position.set(0, 40, -505); // Slightly behind sun
        sunGlow.renderOrder = 2; // Sync with sun
        scene.add(sunGlow);

        const sunReflect = sun.clone();
        sunReflect.scale.y = -1;
        sunReflect.position.y = isMobile ? -20 : -40;
        sunReflect.position.z = -500;
        const sunReflectMat = sunMat.clone();
        sunReflectMat.uniforms.colorTop = { value: new THREE.Color('#550022') };
        sunReflectMat.uniforms.colorBottom = { value: new THREE.Color('#220011') };
        sunReflect.material = sunReflectMat;
        sunReflect.renderOrder = 1;
        scene.add(sunReflect);

        // --- HORIZON CRUCIFIX ---
        const cruxGroup = new THREE.Group();
        const cruxMat = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }); // Stark silhouette

        // Vertical Bar
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(4, 60, 4), cruxMat);
        // Horizontal Bar
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(40, 4, 4), cruxMat);
        hBar.position.y = 15;

        cruxGroup.add(vBar);
        cruxGroup.add(hBar);
        // Lowered Y further to sit on the valley floor
        cruxGroup.position.set(0, 15, -480);
        cruxGroup.renderOrder = 3;
        scene.add(cruxGroup);

        // --- BLACK HOLE ---
        const blackHoleGroup = new THREE.Group();
        // Repositioned: Center top, leaning right (Responsive X)
        blackHoleGroup.position.set(isMobile ? 110 : 200, 250, -600);
        scene.add(blackHoleGroup);

        // 1. Event Horizon (Scaled down to 10 - Planet sized)
        const horizonGeo = new THREE.SphereGeometry(10, 64, 64);
        const horizonMat = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
        const horizon = new THREE.Mesh(horizonGeo, horizonMat);
        blackHoleGroup.add(horizon);

        // 2. Accretion Disk (Scaled down)
        const diskGeo = new THREE.RingGeometry(12, 32, 128);
        diskGeo.rotateX(-Math.PI / 2);

        const diskMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    time: { value: 0 },
                    innerColor: { value: new THREE.Color(0xffffaa) }, // Bright Yellow/White
                    outerColor: { value: new THREE.Color(0xff4500) }  // Vibrant Orange
                }
            ]),
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vWorldPos;
                #include <fog_pars_vertex>
                void main() {
                    vUv = uv;
                    vec4 worldPos = modelMatrix * vec4(position, 1.0);
                    vWorldPos = worldPos.xyz;
                    vec4 mvPosition = viewMatrix * worldPos;
                    gl_Position = projectionMatrix * mvPosition;
                    #include <fog_vertex>
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 innerColor;
                uniform vec3 outerColor;
                varying vec2 vUv;
                #include <fog_pars_fragment>
                
                // Simplex noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

                float snoise(vec2 v) {
                    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                        -0.577350269189626, // -1.0 + 2.0 * C.x
                                        0.024390243902439); // 1.0 / 41.0
                    // First corner
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v - i + dot(i, C.xx);

                    // Other corners
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;

                    // Permutations
                    i = mod289(i); 
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m ;
                    m = m*m ;

                    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
                    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;

                    // Normalise gradients implicitly by scaling m
                    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
                    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

                    // Compute final noise value at P
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    // Polar coordinates
                    vec2 centered = vUv - 0.5;
                    float r = length(centered) * 2.0; // 0 to 1 (approx)
                    float a = atan(centered.y, centered.x);
                    
                    if (r < 0.35 || r > 1.0) discard; // Ring limits

                    // Swirl animation
                    float swirl = snoise(vec2(r * 5.0, a * 3.0 + time * 1.5 - r * 4.0));
                    
                    // Gradient: Inner fast/bright -> Outer slow/dark
                    vec3 col = mix(outerColor, innerColor, smoothstep(0.4, 0.9, 1.0 - r));
                    
                    // Add noise texture to alpha/brightness
                    float brightness = 1.0 + 1.5 * swirl; // BOOSTED brightness
                    
                    // Rim light / intensity boost at inner edge
                    float innerRim = smoothstep(0.35, 0.45, r);
                    float outerFade = smoothstep(1.0, 0.8, r);
                    float opacity = innerRim * outerFade * (0.8 + 0.5 * swirl);

                    gl_FragColor = vec4(col * brightness, opacity);
                    #include <fog_fragment>
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            fog: false
        });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        disk.rotation.x = Math.PI / 6; // Fixed angle (30 deg), simpler and nicer look
        blackHoleGroup.add(disk);

        // Reflection (Darker)
        const bhReflect = blackHoleGroup.clone();
        bhReflect.scale.y = -1;
        bhReflect.position.y = -40;

        // We'd ideally clone materials to darken them, but for now simple scale reflection is okay.
        // Let's just clone the simple meshes for now or re-use group with logic?
        // Cloning complex shader groups can be tricky with uniforms. 
        // Let's simply manually add a simplified reflection for the disk.

        const diskReflectMat = diskMat.clone();
        diskReflectMat.uniforms.time = { value: 0 };
        diskReflectMat.uniforms.innerColor = { value: new THREE.Color(0xaa5500) };
        diskReflectMat.uniforms.outerColor = { value: new THREE.Color(0x551100) };
        const diskReflect = new THREE.Mesh(diskGeo, diskReflectMat);
        diskReflect.rotation.x = Math.PI - Math.PI / 6; // Mirrored tilt

        const horizonReflect = new THREE.Mesh(horizonGeo, horizonMat);

        const bhReflectGroup = new THREE.Group();
        bhReflectGroup.add(diskReflect);
        bhReflectGroup.add(horizonReflect);
        bhReflectGroup.position.set(isMobile ? 110 : 200, -250, -600); // Matched responsive reposition
        bhReflectGroup.scale.y = -1; // Mirror geometry
        scene.add(bhReflectGroup);


        // --- UNIFIED TERRAIN & GRID ---
        const planeW = 600;
        const planeD = 400;
        const segsX = 80;
        const segsZ = 40;
        const terrainGeo = new THREE.PlaneGeometry(planeW, planeD, segsX, segsZ);

        const pos = terrainGeo.attributes.position;
        const colors = new Float32Array(pos.count * 3);

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);

            const normalizedZ = (y + planeD / 2) / planeD;
            const angle = normalizedZ * Math.PI * 2;
            const valleyOffset = Math.sin(angle) * 40;
            const valleyWidth = 80 + Math.cos(angle * 2) * 20;
            const effectiveX = Math.abs(x - valleyOffset);

            let z = 0;

            if (effectiveX > valleyWidth) {
                // Mountain
                const dist = effectiveX - valleyWidth;
                let h = Math.pow(dist * 0.08, 1.8) * 2.5;
                if (h > 45) h = 45;
                z = h;

                const n1 = noise2D(x * 0.03, y * 0.03);
                const n2 = noise2D(x * 0.1, y * 0.1);
                const n3 = noise2D(x * 0.2, y * 0.2);
                z += (n1 * 12) + (n2 * 6) + (n3 * 3);

                colors[i * 3] = COLORS.gridMountain.r;
                colors[i * 3 + 1] = COLORS.gridMountain.g;
                colors[i * 3 + 2] = COLORS.gridMountain.b;

            } else {
                // Valley
                const n1 = noise2D(x * 0.03, y * 0.03);
                const n2 = noise2D(x * 0.15, y * 0.15);
                const wave = Math.sin(x * 0.1) * 2.0 + Math.cos(y * 0.08) * 2.0;

                z = -5 + (n1 * 5) + (n2 * 2) + wave;

                colors[i * 3] = COLORS.gridWater.r;
                colors[i * 3 + 1] = COLORS.gridWater.g;
                colors[i * 3 + 2] = COLORS.gridWater.b;
            }

            pos.setZ(i, z);
        }

        terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        terrainGeo.computeVertexNormals();

        const mountainMat = new THREE.MeshBasicMaterial({ color: COLORS.mountainFill, fog: false });
        const wireMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            wireframe: true,
            transparent: true,
            opacity: 0.5,
            fog: false
        });

        const createTerrainChunk = () => {
            const mesh = new THREE.Mesh(terrainGeo, mountainMat);
            const wire = new THREE.Mesh(terrainGeo, wireMat);
            wire.position.z = 0.1;
            const group = new THREE.Group();
            group.add(mesh);
            group.add(wire);
            group.rotation.x = -Math.PI / 2;
            return group;
        };

        const t1 = createTerrainChunk();
        const t2 = createTerrainChunk();

        t1.position.z = 0;
        t2.position.z = -planeD;

        scene.add(t1);
        scene.add(t2);

        const createReflectionChunk = () => {
            const mesh = new THREE.Mesh(terrainGeo, new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.9, fog: false }));
            const wire = new THREE.Mesh(terrainGeo, new THREE.MeshBasicMaterial({
                vertexColors: true,
                wireframe: true,
                transparent: true,
                opacity: 0.15,
                fog: false
            }));
            wire.position.z = 0.1;
            const group = new THREE.Group();
            group.add(mesh);
            group.add(wire);
            group.rotation.x = -Math.PI / 2;
            group.scale.y = -1;
            group.position.y = -1;
            return group;
        };

        const r1 = createReflectionChunk();
        const r2 = createReflectionChunk();
        r1.position.z = 0;
        r2.position.z = -planeD;

        scene.add(r1);
        scene.add(r2);


        // --- PLANET ---
        const planetGroup = new THREE.Group();
        const planetGeo = new THREE.SphereGeometry(15, 32, 32);
        const planetShader = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    color1: { value: new THREE.Color('#4169e1') }, // Royal Blue
                    color2: { value: new THREE.Color('#1e3a8a') }  // Deep Blue
                }
            ]),
            vertexShader: `
            varying vec2 vUv;
            #include <fog_pars_vertex>
            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                #include <fog_vertex>
            }
        `,
            fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            #include <fog_pars_fragment>
            void main() {
                gl_FragColor = vec4(mix(color2, color1, vUv.y), 0.9);
                #include <fog_fragment>
            }
        `,
            transparent: true,
            fog: false
        });
        const planet = new THREE.Mesh(planetGeo, planetShader);
        planetGroup.add(planet);

        // Create multiple concentric rings for Saturn-like appearance
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        for (let i = 0; i < 10; i++) {
            const ringRadius = 20 + (i * 2); // 50% reduction (Start at 20, increment by 2)
            const ringGeo = new THREE.TorusGeometry(ringRadius, 0.45, 16, 100); // 50% reduction 0.9 -> 0.45
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = -Math.PI / 6;
            planetGroup.add(ring);
        }

        // Responsive Position for Planet
        planetGroup.position.set(isMobile ? 90 : 180, 120, -400);
        scene.add(planetGroup);

        // --- RED PLANET (Counter-Orbit) ---
        const redPlanetGroup = new THREE.Group();
        const redPlanetGeo = new THREE.SphereGeometry(7.5, 32, 32); // Upscaled by 3x (2.5 * 3 = 7.5)
        const redPlanetShader = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.fog,
                {
                    color1: { value: new THREE.Color('#ff4444') }, // Bright Red
                    color2: { value: new THREE.Color('#8b0000') }  // Dark Red
                }
            ]),
            vertexShader: `
            varying vec2 vUv;
            #include <fog_pars_vertex>
            void main() {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                #include <fog_vertex>
            }
        `,
            fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            #include <fog_pars_fragment>
            void main() {
                gl_FragColor = vec4(mix(color2, color1, vUv.y), 0.9);
                #include <fog_fragment>
            }
        `,
            transparent: true,
            fog: false
        });
        const redPlanet = new THREE.Mesh(redPlanetGeo, redPlanetShader);
        redPlanetGroup.add(redPlanet);

        // No ring for red planet


        redPlanetGroup.position.set(isMobile ? 90 : 180, 120, -400);
        scene.add(redPlanetGroup);

        // --- FILM GRAIN ---
        const grainMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                amount: { value: 0.15 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float amount;
                varying vec2 vUv;
                float r(vec2 p) { return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
                void main() {
                    float n = r(vUv + time);
                    gl_FragColor = vec4(vec3(n), amount);
                }
            `,
            transparent: true,
            blending: THREE.MultiplyBlending,
            premultipliedAlpha: true,
            depthTest: false,
            depthWrite: false
        });
        const grain = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), grainMat);
        grain.renderOrder = 10000;
        scene.add(grain);


        // --- IMPACT PARTICLES SYSTEM ---
        const impactParticleCount = 800;
        const impactGeo = new THREE.BufferGeometry();
        const impactPositions = new Float32Array(impactParticleCount * 3);
        const impactSizes = new Float32Array(impactParticleCount);

        for (let i = 0; i < impactParticleCount; i++) {
            impactPositions[i * 3] = 0; impactPositions[i * 3 + 1] = -5000; impactPositions[i * 3 + 2] = 0;
            impactSizes[i] = 0;
        }

        impactGeo.setAttribute('position', new THREE.BufferAttribute(impactPositions, 3));
        impactGeo.setAttribute('size', new THREE.BufferAttribute(impactSizes, 1));

        const impactMat = new THREE.ShaderMaterial({
            uniforms: {
                // Use a mix of colors via Vertex colors or simple single color
                // For now, let's keep it Gold/White to contrast the Cyan/Magenta meteor
                color: { value: new THREE.Color(0xffffff) }
            },
            vertexShader: `
                attribute float size;
                varying float vAlpha;
                void main() {
                    vAlpha = size / 20.0; 
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
                    gl_FragColor = vec4(color, vAlpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const impactSystem = new THREE.Points(impactGeo, impactMat);
        impactSystem.renderOrder = 20; // Ensure sparkles traverse over sun/terrain
        scene.add(impactSystem);

        const activeImpacts: { x: number, y: number, z: number, age: number, seeds: { dx: number, dy: number, dz: number }[] }[] = [];


        // --- LASER RAIN (Gradient Meteors: Magenta -> Cyan) ---
        // Style: Glowing soft beam, similar to comet but smaller/faster
        const meteors: THREE.Group[] = [];

        // Tail: Tapered cylinder with Soft Glow Shader
        // Radius reduced slightly from comet logic
        const meteorTailGeo = new THREE.CylinderGeometry(0.3, 2.0, 80, 16, 1, true);
        meteorTailGeo.rotateX(-Math.PI / 2);
        meteorTailGeo.translate(0, 0, -40); // Center adjustment

        const meteorTailMat = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x00ffff) }, // Cyan (Head)
                color2: { value: new THREE.Color(0xff00ff) }  // Magenta (Tail)
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    // Gradient
                    vec3 col = mix(color1, color2, vUv.y);
                    
                    // Distance Fade
                    float distAlpha = pow(1.0 - vUv.y, 1.2); 
                    
                    // Fresnel / Edge Softness
                    vec3 viewDir = normalize(vViewPosition);
                    float viewDot = abs(dot(viewDir, vNormal));
                    float sideGlow = pow(viewDot, 1.0); // Slightly sharper than comet for perceived speed
                    
                    gl_FragColor = vec4(col * (1.2 + sideGlow), distAlpha * sideGlow * 0.9);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.FrontSide
        });

        for (let i = 0; i < 8; i++) {
            const group = new THREE.Group();

            // Add slight head glow?
            const headGlow = new THREE.Mesh(
                new THREE.SphereGeometry(2.0, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
            );
            group.add(headGlow);

            const tail = new THREE.Mesh(meteorTailGeo, meteorTailMat);
            tail.renderOrder = 10;
            group.add(tail);

            group.position.set(0, 500, 0); // Hide init
            scene.add(group);
            meteors.push(group);
        }
        const activeMeteors: { group: THREE.Group, velocity: THREE.Vector3 }[] = [];


        // --- BACKGROUND SHOOTING STARS ---
        // Simple white lines, varied lengths
        const bgShooters: { mesh: THREE.Line, velocity: THREE.Vector3, lengthScale: number }[] = [];
        // Base Unit Length = 1
        const bgShooterGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1)
        ]);
        const bgShooterMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1.0, // Maximum visibility
            fog: false, // Fix: Ignore purple fog to ensure they look WHITE
            depthWrite: false, // Ensure they don't occlude and render bright
            blending: THREE.AdditiveBlending // Make them pop
        });

        // Pool
        const bgShooterPool: THREE.Line[] = [];
        for (let i = 0; i < 30; i++) { // Increased pool size
            const line = new THREE.Line(bgShooterGeo, bgShooterMat);
            line.position.set(0, 500, 0);
            line.renderOrder = 2; // Ensure they render above stars background
            scene.add(line);
            bgShooterPool.push(line);
        }


        // --- COMET (The "One") ---
        // Style: "Glowing Speed Streak". 
        // Gradient: Cyan (Head) -> Magenta (Tail)
        const cometGroup = new THREE.Group();

        // 1. Glowing Head (Scaled DOWN 75%)
        const cometHeadGeo = new THREE.SphereGeometry(2.0, 32, 32); // Radius 8 -> 2
        const cometHeadMat = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xff00ff) } // Magenta
            },
            vertexShader: `
                varying vec2 vUv; 
                varying vec3 vNormal;
                void main() { 
                    vUv = uv; 
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
                }
            `,
            fragmentShader: `
                uniform vec3 color; 
                varying vec3 vNormal;
                void main() { 
                    float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, 1.0) + vec4(1.0) * intensity; // Fresnel glow
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        const cometHead = new THREE.Mesh(cometHeadGeo, cometHeadMat);
        cometGroup.add(cometHead);

        // 2. Streaky Tail (High Fidelity Beam)
        const tailLen = 800; // Increased to 800 for massive trail

        // Geometry: Start slightly wider than head (radius 8), taper to 0
        // Using high segment count for smooth lighting
        // Geometry: Start smaller (1.0) than head (2.0)
        const tailGeo = new THREE.CylinderGeometry(0.0, 1.0, tailLen, 64, 1, true);
        tailGeo.rotateX(-Math.PI / 2);
        tailGeo.translate(0, 0, -tailLen / 2 + 1.2); // Offset INTO the head slightly

        const tailMat = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x00ffff) }, // Cyan
                color2: { value: new THREE.Color(0x0088ff) }, // Light Blue
                viewVector: { value: new THREE.Vector3(0, 0, 1) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    // vUv.y: 0 (Head/Wide) -> 1 (Tail/Tip)
                    // We deduced this from CylinderGeometry + RotateX(-90).
                    
                    // Gradient Color
                    vec3 col = mix(color1, color2, vUv.y);
                    
                    // Distance Fade: We want Head (y=0) to be OPAQUE (1.0).
                    // We want Tip (y=1) to be TRANSPARENT (0.0).
                    // Previous logic smoothstep(0.0, 0.8, vUv.y) made Head transparent!
                    
                    float distAlpha = 1.0 - smoothstep(0.2, 1.0, vUv.y); 
                    // 0.0 to 0.2: Alpha 1.0 (Solid connection to head)
                    // 0.2 to 1.0: Fades to 0.0
                    
                    // Fresnel / Soft Edge beam core
                    vec3 viewDir = normalize(vViewPosition);
                    float viewDot = dot(viewDir, vNormal);
                    
                    // Beam Core: Bright center, soft edges
                    float beamCore = pow(abs(viewDot), 1.5); 
                    beamCore = 0.4 + 0.6 * beamCore; 
                    
                    float alpha = distAlpha * beamCore; 
                    
                    gl_FragColor = vec4(col, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.FrontSide
        });

        const cometTail1 = new THREE.Mesh(tailGeo, tailMat);
        cometGroup.add(cometTail1);

        // Outer Glow (Wider, fainter) - NARROWER (3.0)
        const tailGeo2 = new THREE.CylinderGeometry(0.0, 3.0, tailLen * 0.95, 64, 1, true);
        tailGeo2.rotateX(-Math.PI / 2);
        tailGeo2.translate(0, 0, -(tailLen * 0.95) / 2 + 1.2);

        const tailMat2 = tailMat.clone();
        tailMat2.uniforms = {
            color1: { value: new THREE.Color(0x00ffff) },
            color2: { value: new THREE.Color(0x0055aa) }
        };
        // Use darker colors but same shader
        tailMat2.vertexShader = tailMat.vertexShader;
        tailMat2.fragmentShader = tailMat.fragmentShader;

        const cometTail2 = new THREE.Mesh(tailGeo2, tailMat2);
        cometGroup.add(cometTail2);

        cometGroup.position.set(0, 2000, 0);
        scene.add(cometGroup);

        let cometActive = false;
        let cometVelocity = new THREE.Vector3();
        // Fix: Use "let" or "var" correctly if defined in function scope, otherwise assumes block scope.
        // But here we are initializing state variables.
        let cometTimer = 0;
        let meteorTimer = 0;
        let cometTurnVector = new THREE.Vector3(0, 1, 0);


        // --- ANIMATION LOOP ---
        const speed = 0.5;

        const animate = () => {
            if (!rendererRef.current) return;

            t1.position.z += speed;
            t2.position.z += speed;
            if (t1.position.z >= planeD) t1.position.z = -planeD;
            if (t2.position.z >= planeD) t2.position.z = -planeD;

            r1.position.z += speed;
            r2.position.z += speed;
            if (r1.position.z >= planeD) r1.position.z = -planeD;
            if (r2.position.z >= planeD) r2.position.z = -planeD;

            // --- PLANET REVOLUTION ---
            // Significantly slowed down orbit (was 0.0001) for majestic look
            const orbitTime = Date.now() * 0.00005;
            // Widened orbit significantly to create more space (was 240/280)
            const orbitRadius = isMobile ? 350 : 450;
            const orbitX = Math.cos(orbitTime) * orbitRadius;

            // Lowered height to 80 (from 120) for closer-to-horizon orbit
            const orbitY = 80 + Math.sin(orbitTime * 0.5) * 40;

            const orbitZ = -500 + Math.sin(orbitTime) * 100; // Orbiting the sun at z=-500
            planetGroup.position.set(orbitX, orbitY, orbitZ);

            planet.rotation.y -= 0.002;
            planetGroup.rotation.x = Math.sin(orbitTime * 0.3) * 0.1; // Dynamic tilt

            // --- RED PLANET COUNTER-REVOLUTION ---
            // Opposite direction (negative time), smaller radius
            const redOrbitRadius = isMobile ? 160 : 200;
            const redOrbitX = Math.cos(-orbitTime) * redOrbitRadius; // Negative for opposite direction
            const redOrbitY = 80 + Math.sin(-orbitTime * 0.5) * 40;
            const redOrbitZ = -500 + Math.sin(-orbitTime) * 100;
            redPlanetGroup.position.set(redOrbitX, redOrbitY, redOrbitZ);

            redPlanet.rotation.y += 0.002;
            redPlanetGroup.rotation.x = Math.sin(-orbitTime * 0.3) * 0.1;

            galaxy.rotation.z += 0.0005;

            // --- BLACK HOLE ANIM ---
            diskMat.uniforms.time.value += 0.01;
            diskReflectMat.uniforms.time.value += 0.01;
            // Removed mesh rotation (disk.rotation.z) as per user request ("not rotating")
            // The shader 'time' update handles the "revolving" visual.

            // --- SPAWN BACKGROUND STARS (30 per minute = 1 every 2 sec) ---
            if (bgShooters.length < 20) {
                if (Math.random() < 0.0083) { // ~0.83% chance per frame => 1 per 2 sec (60fps)
                    const s = bgShooterPool.find(l => l.position.y > 400);
                    if (s) {
                        const goingRight = Math.random() > 0.5;
                        const sx = goingRight ? -1000 : 1000;
                        const sy = 100 + Math.random() * 300; // Lowered ceiling slightly
                        // BEHIND SUN (Sun is at -500). Pushing back to -800 to -1200
                        const sz = -800 - Math.random() * 400;
                        s.position.set(sx, sy, sz);

                        // Velocity: Horizontal with slight downward drift (No Upward)
                        const speedBase = 6 + Math.random() * 6;
                        const vx = goingRight ? speedBase : -speedBase;

                        // Fix: Ensure they don't look "off angled" or go up.
                        // Angle: 30-40 degrees downward.
                        // tan(30) ~= 0.58, tan(40) ~= 0.84
                        const slope = 0.58 + Math.random() * 0.26; // 0.58 to 0.84
                        const vy = -Math.abs(vx) * slope; // Downward proportional to speed

                        const vz = (Math.random() - 0.5) * 1.2;
                        const vel = new THREE.Vector3(vx, vy, vz);

                        s.lookAt(s.position.clone().add(vel));

                        // Fix rotation? Line is 0,0,0 to 0,0,1 (+Z).
                        // lookAt aligns +Z to target. This is correct.

                        const isLong = Math.random() > 0.7;
                        // Reduce length slightly if "long trailed" looks messy
                        const len = isLong ? (40 + Math.random() * 40) : (15 + Math.random() * 20);
                        s.scale.set(1, 1, len);
                        bgShooters.push({ mesh: s, velocity: vel, lengthScale: len });
                    }
                }
            }
            for (let i = bgShooters.length - 1; i >= 0; i--) {
                const item = bgShooters[i];
                item.mesh.position.add(item.velocity);
                if (Math.abs(item.mesh.position.x) > 1200 || item.mesh.position.y < -100) {
                    item.mesh.position.y = 500;
                    item.mesh.scale.set(1, 1, 1);
                    bgShooters.splice(i, 1);
                }
            }

            // --- UPDATE COMET ---
            if (!cometActive) {
                cometTimer++;
                // INCREASED FREQUENCY: Threshold lowered from 800 to 150 (~2.5s)
                if (cometTimer > 150 && Math.random() > 0.98) {
                    cometActive = true;
                    cometTimer = 0;
                    // Randomize START side (Left or Right)
                    const startX = (Math.random() > 0.5 ? -1 : 1) * (800 + Math.random() * 200);

                    // ADJUSTED SPAWN HEIGHT: Near top of the Sun
                    const startY = 180 + Math.random() * 60;
                    const startZ = -1000 - Math.random() * 200;
                    cometGroup.position.set(startX, startY, startZ);

                    // Randomize TARGET side (Opposite of start + variation)
                    // Multiplier 1.5 to 2.5 ensures it crosses the screen fully
                    const targetX = -startX * (1.5 + Math.random());

                    // RANDOM SLOPES: Ensure it's never flat.
                    // Go UP or GO DOWN significantly.
                    const minSlope = 300;
                    const maxSlope = 600;
                    const slopeDirection = Math.random() > 0.5 ? 1 : -1;
                    const slopeY = slopeDirection * (minSlope + Math.random() * (maxSlope - minSlope));

                    const targetY = startY + slopeY;

                    // Add Z drift for 3D depth
                    const targetZ = startZ + (Math.random() - 0.5) * 400;

                    const dir = new THREE.Vector3(targetX - startX, targetY - startY, targetZ - startZ).normalize();

                    cometVelocity = dir.multiplyScalar(1.2); // Maintain steady speed
                    cometGroup.renderOrder = 0; // Render behind everything else
                    cometGroup.lookAt(cometGroup.position.clone().add(dir));
                    // Spin the head/glow slightly for effect
                    cometHead.rotation.z = Math.random() * Math.PI;

                    // REMOVED CURVE LOGIC
                }
            } else {
                // LINEAR MOVEMENT (No Curve)
                cometGroup.position.add(cometVelocity);

                // Update orientation to face new velocity
                const lookTarget = cometGroup.position.clone().add(cometVelocity);
                cometGroup.lookAt(lookTarget);

                if (Math.abs(cometGroup.position.x) > 1500 || Math.abs(cometGroup.position.z) > 1500) {
                    cometActive = false;
                    cometGroup.position.set(0, 2000, 0);
                }
            }


            // --- SPAWN MAIN METEORS (10 per minute = 1 every 6 seconds) ---
            meteorTimer++;
            // 60fps * 6s = 360 frames per meteor
            if (activeMeteors.length < 1 && meteorTimer > 360) {
                if (Math.random() > 0.5) { // 50% chance when timer hits
                    const meteor = meteors.find(m => m.position.y > 400);
                    if (meteor) {
                        meteorTimer = 0; // Reset

                        const startX = (Math.random() - 0.5) * 600;
                        const startY = 300 + Math.random() * 100;
                        const startZ = -300 + Math.random() * 100;

                        meteor.position.set(startX, startY, startZ);

                        const targetX = (Math.random() - 0.5) * 150;
                        const targetZ = -50 + (Math.random() - 0.5) * 150;

                        const dir = new THREE.Vector3(targetX, -10, targetZ).sub(meteor.position).normalize();

                        const moveSpeed = 3.0 + Math.random() * 1.5;
                        const vel = dir.multiplyScalar(moveSpeed);

                        meteor.lookAt(meteor.position.clone().add(vel));

                        activeMeteors.push({ group: meteor, velocity: vel });
                    }
                }
            }

            // --- UPDATE MAIN METEORS ---
            for (let i = activeMeteors.length - 1; i >= 0; i--) {
                const item = activeMeteors[i];
                item.group.position.add(item.velocity);

                // Check Ground Crossing
                // IMPACT HEIGHT INCREASED TO 5 (to ensure visibility above valley floor)
                if (item.group.position.y <= 5) {

                    const impactX = item.group.position.x;
                    const impactY = 2; // Slight offset above ground
                    const impactZ = item.group.position.z;

                    // 1. Shockwave
                    for (let k = 0; k < 15; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        const spd = 2 + Math.random() * 3;
                        activeImpacts.push({
                            x: impactX, y: impactY + 1, z: impactZ, age: 0,
                            seeds: [{ dx: Math.cos(angle) * spd, dy: 0, dz: Math.sin(angle) * spd }]
                        });
                    }

                    // 2. Splash (Upward)
                    for (let k = 0; k < 40; k++) { // Increased particle count
                        activeImpacts.push({
                            x: impactX, y: impactY, z: impactZ, age: 0,
                            seeds: [{
                                dx: (Math.random() - 0.5) * 12,
                                dy: Math.random() * 15 + 8, // Higher splash
                                dz: (Math.random() - 0.5) * 12
                            }]
                        });
                    }

                    // 3. Flash
                    activeImpacts.push({
                        x: impactX, y: impactY + 5, z: impactZ, age: 0,
                        seeds: [{ dx: 0, dy: 0, dz: 0 }]
                    });

                    // Reset
                    item.group.position.y = 500;
                    activeMeteors.splice(i, 1);

                }
                else if (item.group.position.y < -50) {
                    item.group.position.y = 500;
                    activeMeteors.splice(i, 1);
                }
            }

            // --- UPDATE IMPACT PARTICLES ---
            const positionsAttributes = impactGeo.attributes.position as THREE.BufferAttribute;
            const sizeAttributes = impactGeo.attributes.size as THREE.BufferAttribute;
            let pIdx = 0;

            for (let k = 0; k < impactParticleCount; k++) {
                positionsAttributes.setXYZ(k, 0, -5000, 0);
                sizeAttributes.setX(k, 0);
            }

            for (let i = activeImpacts.length - 1; i >= 0; i--) {
                const impact = activeImpacts[i];
                const isFlash = impact.seeds[0].dx === 0 && impact.seeds[0].dy === 0;

                // Slower fade for impacts so they are visible longer
                impact.age += isFlash ? 0.05 : 0.02;

                if (impact.age > 1.0) {
                    activeImpacts.splice(i, 1);
                    continue;
                }

                for (let s = 0; s < impact.seeds.length; s++) {
                    if (pIdx >= impactParticleCount) break;

                    const seed = impact.seeds[s];

                    if (isFlash) {
                        positionsAttributes.setXYZ(pIdx, impact.x, impact.y, impact.z);
                        sizeAttributes.setX(pIdx, (1.0 - impact.age) * 150.0); // Bigger Flash
                    } else {
                        const expansion = Math.pow(impact.age, 0.4) * 15;

                        const px = impact.x + seed.dx * expansion;
                        const py = impact.y + seed.dy * expansion - (impact.age * 5);
                        const pz = impact.z + seed.dz * expansion;

                        // Keep above ground
                        const finalPy = Math.max(0, py);

                        const size = (1.0 - impact.age) * 10.0; // Bigger debris

                        positionsAttributes.setXYZ(pIdx, px, finalPy, pz);
                        sizeAttributes.setX(pIdx, size);
                    }
                    pIdx++;
                }
            }

            positionsAttributes.needsUpdate = true;
            sizeAttributes.needsUpdate = true;

            // Update Grain
            grainMat.uniforms.time.value += 0.01;

            rendererRef.current.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        let lastWidth = window.innerWidth;
        let lastHeight = window.innerHeight;

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Only update if width changes significantly or height expands
            // This prevents squashing when nav bars appear
            if (Math.abs(width - lastWidth) > 50 || height > lastHeight) {
                lastWidth = width;
                lastHeight = height;

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
        };
    }, [minimalMode, noise2D]);

    if (minimalMode) return null;

    return (
        <div
            ref={mountRef}
            className="fixed top-0 left-0 w-full z-0 pointer-events-none overflow-hidden"
            style={{ height: 'var(--app-height, 100vh)' }}
        />
    );
};

export default ThreeScene;
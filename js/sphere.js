/* sorbet — three.js particle sphere for hero
 * Module entry. Loads three.js from CDN as ESM.
 * Renders a translucent sphere with surrounding particle field
 * Reacts to mouse / touch and slowly self-rotates
 * Falls back gracefully if WebGL is unavailable
 */

(async () => {
  const container = document.getElementById("heroSphere");
  if (!container) return;

  // Skip on reduced-motion or low-end devices
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let THREE, RoomEnvironment;
  try {
    THREE = await import("three");
    const env = await import("three/addons/environments/RoomEnvironment.js");
    RoomEnvironment = env.RoomEnvironment;
  } catch (err) {
    console.warn("three.js failed to load — falling back to static logo", err);
    return;
  }

  // ----- Setup -----
  const size = container.clientWidth || 280;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 3.4;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.borderRadius = "50%";

  // PBR environment map for realistic glass reflection
  try {
    if (RoomEnvironment) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new RoomEnvironment();
      const envTex = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envTex;
      pmrem.dispose();
    }
  } catch (e) {
    console.warn("environment map failed, using basic lighting only", e);
  }

  // ----- Translucent sphere -----
  const sphereGeo = new THREE.SphereGeometry(1, 96, 96);
  const sphereMat = new THREE.MeshPhysicalMaterial({
    color: 0x7DBFD8,
    transmission: 0.62,
    thickness: 1.6,
    roughness: 0.25,
    metalness: 0,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
    iridescence: 0.55,
    iridescenceIOR: 1.4,
    ior: 1.45,
    attenuationColor: 0x8EC4DE,
    attenuationDistance: 1.2,
    transparent: true,
    opacity: 0.92,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // Inner emissive core (soft glow)
  const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xB8DDED,
    transparent: true,
    opacity: 0.85,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Halo glow ring around sphere
  const haloGeo = new THREE.SphereGeometry(1.05, 64, 64);
  const haloMat = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x8EC4DE) },
      viewVector: { value: new THREE.Vector3(0, 0, 1) },
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(0.6 - dot(vNormal, vNormel), 2.4);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        gl_FragColor = vec4(glowColor, intensity * 0.7);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  scene.add(halo);

  // ----- Orbiting particle field -----
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const particleCount = isMobile ? 80 : 220;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // points scattered between r=1.15 and r=1.7
    const r = 1.15 + Math.random() * 0.55;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
    velocities[i3] = (Math.random() - 0.5) * 0.0015;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.0015;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.0015;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x6AADCF,
    size: 0.022,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ----- Lights -----
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(2, 2.5, 3);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x8EC4DE, 0.7);
  rimLight.position.set(-2, -1.5, -2);
  scene.add(rimLight);
  const fill = new THREE.PointLight(0xB8DDED, 0.4, 8);
  fill.position.set(0, 0, 2);
  scene.add(fill);

  // ----- Mouse interaction -----
  let mouseX = 0, mouseY = 0;
  let targetRotX = 0, targetRotY = 0;
  let actualRotX = 0, actualRotY = 0;

  const onPointer = (cx, cy) => {
    const rect = container.getBoundingClientRect();
    const x = (cx - rect.left) / rect.width - 0.5;
    const y = (cy - rect.top) / rect.height - 0.5;
    mouseX = x;
    mouseY = y;
    targetRotY = x * 0.9;
    targetRotX = -y * 0.6;
  };
  window.addEventListener("mousemove", (e) => onPointer(e.clientX, e.clientY));
  container.addEventListener("touchmove", (e) => {
    if (e.touches[0]) onPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // ----- Resize handling -----
  const handleResize = () => {
    const w = container.clientWidth || 280;
    renderer.setSize(w, w);
  };
  window.addEventListener("resize", handleResize);

  // ----- Render loop -----
  let t = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    t += 0.0035;

    // Smooth rotation interpolation
    actualRotX += (targetRotX - actualRotX) * 0.07;
    actualRotY += (targetRotY - actualRotY) * 0.07;
    sphere.rotation.x = actualRotX;
    sphere.rotation.y = actualRotY + t * 0.6;
    particles.rotation.x = actualRotX * 0.5;
    particles.rotation.y = -t * 0.4 + actualRotY * 0.5;

    // Core pulse
    const pulse = 1 + Math.sin(t * 3) * 0.04;
    core.scale.setScalar(pulse);

    // Drift particles slightly
    const pos = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];
      // soft tether — keep within sphere shell
      const r = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2);
      if (r > 1.85 || r < 1.05) {
        velocities[i3] *= -1;
        velocities[i3 + 1] *= -1;
        velocities[i3 + 2] *= -1;
      }
    }
    particleGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  };
  animate();

  // Mark loaded so CSS can fade in
  container.classList.add("is-loaded");
})();

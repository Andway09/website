const canvas = document.getElementById("three-canvas");
const container = canvas.parentElement;

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.z = 5;

/* RENDERER */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* LIGHTS */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

/* GROUND PLANE for shadow */
const groundGeo = new THREE.PlaneGeometry(10, 10);
const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.5;
ground.receiveShadow = true;
scene.add(ground);

/* LOGO */
let logo;
let logoGroup;
const loader = new THREE.TextureLoader();

loader.load(
  "assets/co-designs-logo.png",
  (texture) => {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.2,
      metalness: 0.6,
      emissive: new THREE.Color(0x00eaff),
      emissiveIntensity: 0.5
    });

    const aspect = texture.image.width / texture.image.height;
    logoGroup = new THREE.Group();

    for (let i = 0; i < 7; i++) {
      const geometry = new THREE.PlaneGeometry(3, 3 / aspect);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.z = i * -0.06; // more subtle depth layering
      mesh.castShadow = true;
      logoGroup.add(mesh);
    }

    logo = logoGroup;
    logo.position.y = 0;
    scene.add(logo);
  },
  undefined,
  (error) => console.error("Logo failed to load", error)
);

/* ANIMATION */
let time = 0;

function animate() {
  requestAnimationFrame(animate);

  if (logo) {
    time += 0.01;

    // Floating up/down with soft sine waves
    logo.position.y = Math.sin(time * 1.2) * 0.35 + Math.sin(time * 0.3) * 0.05;

    // Smooth spinning rotation
    logo.rotation.y += 0.015;
    logo.rotation.x = Math.sin(time * 0.8) * 0.15 + Math.sin(time * 0.4) * 0.05;
    logo.rotation.z = Math.sin(time * 0.2) * 0.03;

    // Breathing scale effect
    const scale = 1 + Math.sin(time * 1.7) * 0.035;
    logo.scale.set(scale, scale, scale);

    // Emissive pulse glow
    logo.children.forEach((mesh, i) => {
      mesh.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + i) * 0.1;
    });
  }

  renderer.render(scene, camera);
}

animate();

/* MOUSE PARALLAX */
document.addEventListener("mousemove", (e) => {
  if (!logo) return;

  const x = (e.clientX / window.innerWidth - 0.5) * 0.5;
  const y = (e.clientY / window.innerHeight - 0.5) * 0.35;

  logo.rotation.y += (x - logo.rotation.y) * 0.08;
  logo.rotation.x += (y - logo.rotation.x) * 0.08;
});

/* RESIZE */
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

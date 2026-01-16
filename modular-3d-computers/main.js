const canvas = document.getElementById("three-canvas");
const container = canvas.parentElement;

/* SCENE */
const scene = new THREE.Scene();
scene.background = null;

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(-5, 4, -4);
scene.add(rimLight);

/* GROUND (shadow catcher) */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.ShadowMaterial({ opacity: 0.15 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.5;
ground.receiveShadow = true;
scene.add(ground);

/* LOGO */
let logo;
const loader = new THREE.TextureLoader();

loader.load("assets/co-designs-logo.png", (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    color: 0x000000,
    roughness: 0.35,
    metalness: 0.25
  });

  const aspect = texture.image.width / texture.image.height;
  logo = new THREE.Group();

  for (let i = 0; i < 7; i++) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3 / aspect),
      material.clone()
    );
    mesh.position.z = -i * 0.06;
    mesh.castShadow = true;
    logo.add(mesh);
  }

  scene.add(logo);
});

/* ANIMATION */
let time = 0;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

function animate() {
  requestAnimationFrame(animate);

  if (logo) {
    time += 0.01;

    logo.position.y = Math.sin(time * 1.1) * 0.35;

    mouseX += (targetX - mouseX) * 0.06;
    mouseY += (targetY - mouseY) * 0.06;

    logo.rotation.y = mouseX + time * 0.15;
    logo.rotation.x = mouseY + Math.sin(time * 0.6) * 0.1;

    const scale = 1 + Math.sin(time * 1.6) * 0.03;
    logo.scale.setScalar(scale);

    logo.children.forEach((mesh, i) => {
      mesh.position.z = -i * 0.06 + Math.sin(time + i) * 0.006;
    });
  }

  renderer.render(scene, camera);
}

animate();

/* MOUSE */
document.addEventListener("mousemove", (e) => {
  targetX = (e.clientX / window.innerWidth - 0.5) * 0.5;
  targetY = (e.clientY / window.innerHeight - 0.5) * 0.35;
});

/* RESIZE */
window.addEventListener("resize", () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

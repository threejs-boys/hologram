import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import GUI from "lil-gui";
import { buffer } from "three/examples/jsm/nodes/Nodes.js";

/**
 * GUI
 **/
const gui = new GUI();

/**
 * Canvas
 **/
const canvas = document.querySelector("canvas#webgl");

/**
 * Scene
 **/
const scene = new THREE.Scene();

/**
 * Loaders
 **/

// const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
/**
 * Sizes
 **/

/**
 * Parent Object
 **/

const parentObject = new THREE.Object3D();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 **/
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.set(1, 2, 2);
scene.add(camera);

/**
 * Audio
 **/

// Like adding mic to camera
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Sound
const glitchSound = new THREE.Audio(audioListener);
scene.add(glitchSound);

// instantiate a loader
const loader = new THREE.AudioLoader();

// load a resource
loader.load(
  // resource URL
  "/audio/glitch.mp3",

  // onLoad callback
  function (audioBuffer) {
    // set the audio object buffer to the loaded object
    glitchSound.setBuffer(audioBuffer);
    glitchSound.setVolume(0.1);
    glitchSound.setLoop(true);
    // glitchSound.setPlaybackRate(100);
  },

  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },

  // onError callback
  function (err) {
    console.log("An error happened");
  }
);

// Function to resume audio context on user gesture
const resumeAudioContext = () => {
  const audioContext = audioListener.context;
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  window.removeEventListener("click", resumeAudioContext);
  window.removeEventListener("touchstart", resumeAudioContext);
};

// Volume on and off

// Add event listeners to resume audio context
window.addEventListener("click", resumeAudioContext);
window.addEventListener("touchstart", resumeAudioContext);

/**
 * Controls
 **/
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 **/

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setClearColor("#181818");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

/**
 * Mobile Model
 **/

// COLOR
const materialsParams = {};
materialsParams.color = "#8105fe";
materialsParams.color2 = "#67f19c";
materialsParams.volume = 0.2;

// Material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  //   side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,

  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(materialsParams.color)),
    uColor2: new THREE.Uniform(new THREE.Color(materialsParams.color2)),

    // Params
    uFrequency: new THREE.Uniform(20),
    uFresnelSharpness: new THREE.Uniform(2.0),
    uFresnelItensity: new THREE.Uniform(1.25),
  },
});

// Volume
// Add volume control to GUI
gui
  .add(materialsParams, "volume")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Volume")
  .onChange((volume) => {
    glitchSound.setVolume(volume);
  });

gui
  .addColor(materialsParams, "color")
  .name("Color 1")
  .onChange((color) => {
    return material.uniforms.uColor.value.set(color);
  });
gui
  .addColor(materialsParams, "color2")
  .name("Color 2")
  .onChange((color) => {
    return material.uniforms.uColor.value.set(color);
  });

gui
  .add(material.uniforms.uFrequency, "value")
  .min(1)
  .max(50)
  .step(1)
  .name("Frquency");
gui
  .add(material.uniforms.uFresnelSharpness, "value")
  .min(1)
  .max(10)
  .step(0.01)
  .name("F_Sharpness");
gui
  .add(material.uniforms.uFresnelItensity, "value")
  .min(0)
  .max(10)
  .step(0.01)
  .name("F_Intensity");

let phone = null;
gltfLoader.load("/phone/phone.glb", (gltf) => {
  gltf.scene.scale.set(0.3, 0.3, 0.3);

  phone = gltf.scene;
  //   phone.rotation.y = Math.PI;
  //   phone.position.set(0.5, -0.47, 1);

  phone.traverse((child) => {
    // Change the material
    if (child.isMesh) child.material = material;
  });
  scene.add(phone);
});

/**
 * Clock (optional)
 **/
const clock = new THREE.Clock();

/**
 * Lights
 **/
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
// directionalLight.castShadow = true;
// const pointLight = new THREE.PointLight(0xffffff, 5.5);
// pointLight.castShadow = true;
// directionalLight.position.set(0, 10, 0);
// scene.add(ambientLight, directionalLight, pointLight);
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.1);
// pointLight.position.y = 2;

// /**
//  * Helpers
//  * - Grid and Axes
//  **/
scene.add(new THREE.AxesHelper(5) /*, new THREE.GridHelper(5) */);

/**
 * Tick
 **/

const tick = () => {
  // Update controls
  controls.update();
  const elapsedTime = clock.getElapsedTime();

  material.uniforms.uTime.value = elapsedTime;

  // Rotate objects
  if (phone !== null) {
    // phone.rotation.z = -elapsedTime * 0.1;
    phone.rotation.y = elapsedTime * 0.2;

    // Play Glitch Sound
    if (!glitchSound.isPlaying) {
      glitchSound.play();
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

// Start the tick
tick();

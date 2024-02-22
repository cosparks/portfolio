import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { randFloat, seededRandom, randInt } from 'three/src/math/MathUtils';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const clock = new THREE.Clock();

// global params
var time = 0.0;
var skyboxSize = 750;
var skyboxOffsetY = -200;

const targetWidth = window.innerWidth;
const targetHeight = window.innerHeight;

const fogColour = new THREE.Vector4(0.25 * 0.5, 0.1 * 0.5, 0.2 * 0.5, 1.0);
const fogDensity = 3.5;

const sunColour = new THREE.Vector3(1.0, 0.5, 0.3);
const sunFocus = 6.0;
var sunPosWcs = new THREE.Vector3(93, 102, -skyboxSize+20);

const colourStar1 = new THREE.Vector3(1, 0.5, 1);
const focusStar1 = 15.0;
var wcsPosStar1 = new THREE.Vector3(-700, 50, -skyboxSize+20);

const colourStar2 = new THREE.Vector3(1, 0.8, 1);
const focusStar2 = 18.0;
var wcsPosStar2 = new THREE.Vector3(-274, 282, -skyboxSize+20);

const colourStar3 = new THREE.Vector3(1, 0.5, 0.6);
const focusStar3 = 12.0;
var wcsPosStar3 = new THREE.Vector3(-95, 244, -skyboxSize+20);

// water shader
// const waterColour = new THREE.Vector3(0.0, 0.3, 0.5);
const waterColour = new THREE.Vector3(1, 1, 1);
//const planetAmbientColour = new THREE.Vector3(0.0, 0.4, 0.8);
const planetAmbientColour = new THREE.Vector3(1.0, 1.0, 0.8);
const waterDiffuseColour = new THREE.Vector3(0.0, 1.0, 0.0);

const numWaves = 32;
var floatArray = new Float32Array(numWaves * 2);
// var seed = randInt(0,2147483647);
// console.log("generating water direction vectors with seed: " + seed);
seededRandom(1810774799);
for (var i = 0; i < numWaves; i++) {
  var randX = seededRandom() * 2 - 1;
  var randY = seededRandom() * 2 - 1;
  floatArray[i * 2] = randX;
  floatArray[i * 2 + 1] = randY;
}

///////////////////////////////////////////////////
// INIT

// renderer and scenes
var canvas = document.querySelector("canvas");
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  depthBuffer: true
});
var scene = new THREE.Scene();
var postScene = new THREE.Scene();
renderer.setClearColor(0x101010);     // set background colour
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(targetWidth, targetHeight);
// canvas.appendChild(renderer.domElement);

// var stats = new Stats();
// document.body.appendChild(stats.dom);

// render target
const format = THREE.DepthFormat;
const type = THREE.UnsignedIntType;
var target = new THREE.WebGLRenderTarget(targetWidth, targetHeight);
target.texture.minFilter = THREE.NearestFilter;
target.texture.magFilter = THREE.NearestFilter;
target.stencilBuffer = ( format === THREE.DepthStencilFormat ) ? true : false;
target.depthTexture = new THREE.DepthTexture();
target.depthTexture.format = format;
target.depthTexture.type = type;

// cameras and controls
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 4000); // view angle, aspect ratio, near, far
camera.position.set(150, 30, 500);
camera.lookAt(0,0,0);
scene.add(camera);

var postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// var controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// lighting
var vcsPositionSun = new THREE.Vector3();
vcsPositionSun.set(sunPosWcs.x, sunPosWcs.y, sunPosWcs.z);
vcsPositionSun.applyMatrix4(camera.matrixWorldInverse);

var vcsPositionStar1 = new THREE.Vector3();
vcsPositionStar1.set(wcsPosStar1.x, wcsPosStar1.y, wcsPosStar1.z);
vcsPositionStar1.applyMatrix4(camera.matrixWorldInverse);

var vcsPositionStar2 = new THREE.Vector3();
vcsPositionStar2.set(wcsPosStar2.x, wcsPosStar2.y, wcsPosStar2.z);
vcsPositionStar2.applyMatrix4(camera.matrixWorldInverse);

var vcsPositionStar3 = new THREE.Vector3();
vcsPositionStar3.set(wcsPosStar3.x, wcsPosStar3.y, wcsPosStar3.z);
vcsPositionStar3.applyMatrix4(camera.matrixWorldInverse);

// skybox texture
var textureLoader = new THREE.TextureLoader();
var posxTexture = textureLoader.load( "./assets/space-posx.png" );
var posyTexture = textureLoader.load( "./assets/space-posy.png" );
var poszTexture = textureLoader.load( "./assets/space-posz.png" );
var negxTexture = textureLoader.load( "./assets/space-negx.png" );
var negyTexture = textureLoader.load( "./assets/space-negy.png" );
var negzTexture = textureLoader.load( "./assets/space-negz.png" );

//////////////////////////////////////////////////////////////////////
//  shader materials
var waterMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    time: { value: time },
    vcsPositionSun: { value: vcsPositionSun },
    sunColour: { value: sunColour },
    vcsPositionStar1: { value: vcsPositionStar1 },
    colourStar1: { value: colourStar1 },
    vcsPositionStar2: { value: vcsPositionStar2 },
    colourStar2: { value: colourStar2 },
    vcsPositionStar3: { value: vcsPositionStar3 },
    colourStar3: { value: colourStar3 },
    waterColour: { value: waterColour },
    diffuseColour: { value: waterDiffuseColour },
    ambientColour: { value: planetAmbientColour },
    numWaves: { value: numWaves },
    waveDirections: { value: floatArray },
    uNegxTexture: {type: 't', value: negxTexture},
    uNegyTexture: {type: 't', value: negyTexture},
    uNegzTexture: {type: 't', value: negzTexture},
    uPosxTexture: {type: 't', value: posxTexture},
    uPosyTexture: {type: 't', value: posyTexture},
    uPoszTexture: {type: 't', value: poszTexture},
    skyboxSize: { value: skyboxSize },
    skyboxOffsetY: { value: skyboxOffsetY },
    inverseViewMatrix: { value: camera.matrixWorld }
  },
	vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent
} );

var sphereMaterial = new THREE.ShaderMaterial( {
  uniforms: {
    time: { value: time },
    vcsPositionSun: { value: vcsPositionSun },
    sunColour: { value: sunColour }
  },
	vertexShader: document.getElementById( 'normalVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent
} );

// post-process
var postMaterial = new THREE.ShaderMaterial( {
  vertexShader: document.getElementById( 'postVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'postFragmentShader' ).textContent,
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    inverseProjectionMatrix: { value: camera.projectionMatrixInverse },
    inverseViewMatrix: { value: camera.matrixWorld },
    aspectRatio: { value: 0.0 },
    cameraNear: { value: camera.near },
    cameraFar: { value: camera.far },
    sunPosUv: { value: null },
    sunColour: { value: sunColour },
    sunFocus: { value: sunFocus },
    uvPosStar1: { value: null },
    colourStar1: { value: colourStar1 },
    focusStar1: { value: focusStar1 },
    uvPosStar2: { value: null },
    colourStar2: { value: colourStar2 },
    focusStar2: { value: focusStar2 },
    uvPosStar3: { value: null },
    colourStar3: { value: colourStar3 },
    focusStar3: { value: focusStar3 },
    fogColour: { value: fogColour },
    fogDensity: { value: fogDensity },
  }
} );

//////////////////////////////////////////////////////////////////////
// objects

var waterGeometry = new THREE.PlaneGeometry(1250, 1250, 400, 400);
waterGeometry.rotateX(-Math.PI / 2.0)
waterGeometry.computeVertexNormals();
var waterObject = new THREE.Mesh( waterGeometry, waterMaterial );
waterObject.position.set(0, 0, 0);
scene.add(waterObject);

// sphere for debugging
// var sphereGeometry = new THREE.SphereGeometry(10, 50, 50);
// var sphereObject = new THREE.Mesh( sphereGeometry, sphereMaterial );
// sphereObject.position.set(0, 40, 0);
// scene.add(sphereObject);

var wallGeometry = new THREE.PlaneGeometry(2*skyboxSize, 2*skyboxSize, 1, 1);

var posxMaterial = new THREE.MeshBasicMaterial( {map: posxTexture, side:THREE.FrontSide });
var posxWall = new THREE.Mesh(wallGeometry, posxMaterial);
posxWall.position.x = skyboxSize;
posxWall.position.y = skyboxSize + skyboxOffsetY;
posxWall.rotation.y = -Math.PI / 2;
scene.add(posxWall);

var negyMaterial = new THREE.MeshBasicMaterial( {map: negyTexture, side:THREE.FrontSide });
var negyWall = new THREE.Mesh(wallGeometry, negyMaterial);
negyWall.position.y = skyboxOffsetY;
negyWall.rotation.x = -Math.PI / 2;
scene.add(negyWall);

var negzMaterial = new THREE.MeshBasicMaterial( {map: negzTexture, side:THREE.FrontSide });
var negzWall = new THREE.Mesh(wallGeometry, negzMaterial);
negzWall.position.y = skyboxSize + skyboxOffsetY;
negzWall.position.z = -skyboxSize;
scene.add(negzWall);

var negxMaterial = new THREE.MeshBasicMaterial( {map: negxTexture, side:THREE.FrontSide });
var negxWall = new THREE.Mesh(wallGeometry, negxMaterial);
negxWall.position.x = -skyboxSize;
negxWall.position.y = skyboxSize + skyboxOffsetY;
negxWall.rotation.y = Math.PI / 2;
scene.add(negxWall);

var posyMaterial = new THREE.MeshBasicMaterial( {map: posyTexture, side:THREE.FrontSide });
var posyWall = new THREE.Mesh(wallGeometry, posyMaterial);
posyWall.position.y = 2 * skyboxSize + skyboxOffsetY;
posyWall.rotation.x = Math.PI / 2;
scene.add(posyWall);

var poszMaterial = new THREE.MeshBasicMaterial( {map: poszTexture, side:THREE.FrontSide });
var poszWall = new THREE.Mesh(wallGeometry, poszMaterial);
poszWall.position.z = skyboxSize;
poszWall.position.y = skyboxSize + skyboxOffsetY;
poszWall.rotation.y = Math.PI;
scene.add(poszWall);

// post-process
const postPlane = new THREE.PlaneGeometry( 2, 2 );
const postQuad = new THREE.Mesh( postPlane, postMaterial );
postScene.add( postQuad );

///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK
// const gui = new GUI( { width: 300 } );
// gui.add(params, 'format', formats).onChange(setupRenderTarget);
// gui.add(params, 'type', types).onChange(setupRenderTarget);
// gui.open();<div id="front-page-filler"> </div>

// movement - please calibrate these values
const xSpeed = 3.0;
const ySpeed = 3.0;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
      sunPosWcs.y += ySpeed;
    } else if (keyCode == 83) {
      sunPosWcs.y -= ySpeed;
    } else if (keyCode == 65) {
      sunPosWcs.x -= xSpeed;
    } else if (keyCode == 68) {
      sunPosWcs.x += xSpeed;
    }
};

// adapt to window resize


window.addEventListener('resize', function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  target.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

// set up smooth scroll
document.addEventListener('DOMContentLoaded', function() {
  var smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
  
  for (var i = 0; i < smoothScrollLinks.length; i++) {
      smoothScrollLinks[i].addEventListener('click', function(event) {
          event.preventDefault();
          var targetId = this.getAttribute('href').substring(1);
          var targetElement = document.getElementById(targetId);
          targetElement.scrollIntoView({
              behavior: 'smooth'
          });
      });
  }
  var topLink = document.querySelector('.fixed-top-link');
  
  topLink.addEventListener('click', function(event) {
      event.preventDefault();
      window.scrollTo({
          top: 0,
          behavior: 'smooth'
      });
  });
});

function updateSceneUniforms() {
  time = clock.getElapsedTime();
  waterMaterial.uniforms.time.value = time;

  vcsPositionSun.set(sunPosWcs.x, sunPosWcs.y, sunPosWcs.z);
  vcsPositionSun.applyMatrix4(camera.matrixWorldInverse);
  waterMaterial.uniforms.vcsPositionSun.value = vcsPositionSun;

  vcsPositionStar1.set(wcsPosStar1.x, wcsPosStar1.y, wcsPosStar1.z);
  vcsPositionStar1.applyMatrix4(camera.matrixWorldInverse);
  waterMaterial.uniforms.vcsPositionStar1.value = vcsPositionStar1;

  vcsPositionStar2.set(wcsPosStar2.x, wcsPosStar2.y, wcsPosStar2.z);
  vcsPositionStar2.applyMatrix4(camera.matrixWorldInverse);
  waterMaterial.uniforms.vcsPositionStar2.value = vcsPositionStar2;

  vcsPositionStar3.set(wcsPosStar3.x, wcsPosStar3.y, wcsPosStar3.z);
  vcsPositionStar3.applyMatrix4(camera.matrixWorldInverse);
  waterMaterial.uniforms.vcsPositionStar3.value = vcsPositionStar3;

  waterMaterial.uniforms.inverseViewMatrix.value = camera.matrixWorld;
}

function setPostMaterialUniforms() {
  postMaterial.uniforms.tDiffuse.value = target.texture;
  postMaterial.uniforms.tDepth.value = target.depthTexture;

  postMaterial.uniforms.inverseViewMatrix.value = camera.matrixWorld;

  // get aspect ratio
  var ratio = window.innerHeight / window.innerWidth;
  postMaterial.uniforms.aspectRatio.value = ratio;

  // set sun position UV coordinates
  var sunCcs = new THREE.Vector4(vcsPositionSun.x, vcsPositionSun.y, vcsPositionSun.z, 1.0);
  sunCcs.applyMatrix4(camera.projectionMatrix);
  var sunPosUv = new THREE.Vector3(sunCcs.x / sunCcs.w,sunCcs.y / sunCcs.w, sunCcs.z / sunCcs.w);
  sunPosUv.set((sunPosUv.x + 1) / 2, (sunPosUv.y + 1) / 2, sunPosUv.z);
  postMaterial.uniforms.sunPosUv.value = sunPosUv;

  var ccsPosStar1 = new THREE.Vector4(vcsPositionStar1.x, vcsPositionStar1.y, vcsPositionStar1.z, 1.0);
  ccsPosStar1.applyMatrix4(camera.projectionMatrix);
  var uvPosStar1 = new THREE.Vector3(ccsPosStar1.x / ccsPosStar1.w,ccsPosStar1.y / ccsPosStar1.w, ccsPosStar1.z / ccsPosStar1.w);
  uvPosStar1.set((uvPosStar1.x + 1) / 2, (uvPosStar1.y + 1) / 2, uvPosStar1.z);
  postMaterial.uniforms.uvPosStar1.value = uvPosStar1;

  var ccsPosStar2 = new THREE.Vector4(vcsPositionStar2.x, vcsPositionStar2.y, vcsPositionStar2.z, 1.0);
  ccsPosStar2.applyMatrix4(camera.projectionMatrix);
  var uvPosStar2 = new THREE.Vector3(ccsPosStar2.x / ccsPosStar2.w,ccsPosStar2.y / ccsPosStar2.w, ccsPosStar2.z / ccsPosStar2.w);
  uvPosStar2.set((uvPosStar2.x + 1) / 2, (uvPosStar2.y + 1) / 2, uvPosStar2.z);
  postMaterial.uniforms.uvPosStar2.value = uvPosStar2;

  var ccsPosStar3 = new THREE.Vector4(vcsPositionStar3.x, vcsPositionStar3.y, vcsPositionStar3.z, 1.0);
  ccsPosStar3.applyMatrix4(camera.projectionMatrix);
  var uvPosStar3 = new THREE.Vector3(ccsPosStar3.x / ccsPosStar3.w,ccsPosStar3.y / ccsPosStar3.w, ccsPosStar3.z / ccsPosStar3.w);
  uvPosStar3.set((uvPosStar3.x + 1) / 2, (uvPosStar3.y + 1) / 2, uvPosStar3.z);
  postMaterial.uniforms.uvPosStar3.value = uvPosStar3;
}

function animate() {
    requestAnimationFrame(animate);      // requests the next update call;  this creates a loop
    
    updateSceneUniforms();

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);

    setPostMaterialUniforms();

    renderer.setRenderTarget( null );
    renderer.render( postScene, postCamera );

    // stats.update();
}

animate();
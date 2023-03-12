import "./style.css";

import * as CANNON from "cannon-es";
import {
  Scene,
  WebGLRenderer,
  PlaneGeometry,
  PerspectiveCamera,
  OrthographicCamera,
  BoxGeometry,
  Mesh,
  DirectionalLight,
  Color,
  NearestFilter,
  RGBAFormat,
  WebGLRenderTarget,
  Clock,
  ShaderMaterial,
  Vector4,
} from "three";

import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertexShader from "./glsl/glsl.vert?raw";
import fragmentShader from "./glsl/glsl.frag?raw";
import shadowFragmentShader from "./glsl/shadow.frag?raw";

type Box = {
  body: CANNON.Body;
  mesh: Mesh;
  material: ShaderMaterial;
  shadowMaterial: ShaderMaterial;
};

let time = 0;
let delta = 0;
let clock = new Clock();
clock.start();

let intensity_0 = new Vector4(1, 0, 0, 0);

let basePoint = 140;
let gui = new GUI();
let params = {
  randomColor: false,
  colorfull: false,
  amount: 100,
};
gui.add(params, "randomColor");
gui.add(params, "colorfull");
gui.add(params, "amount", 1, 100);

function rand(num: number) {
  return Math.floor(Math.random() * num);
}

function createMaterial(color: string, vertexShader: any, fragmentShader: any) {
  const uniforms = {
    uTime: {
      value: 0,
    },
    uColor: {
      value: new Color(color),
    },
    uLightPos: {
      value: light.position,
    },
    uDepthMap: {
      value: light.shadow.map.texture,
    },
    uShadowCameraP: {
      value: shadowCamera.projectionMatrix,
    },
    uShadowCameraV: {
      value: shadowCamera.matrixWorldInverse,
    },
    uIntensity_0: {
      value: intensity_0,
    },
  };

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  });

  const shadowMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader: shadowFragmentShader,
    uniforms,
  });

  return { material, shadowMaterial };
}

function createObj(geometry: any, color: string) {
  const { material, shadowMaterial } = createMaterial(
    color,
    vertexShader,
    fragmentShader
  );
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  return { mesh, material, shadowMaterial };
}

let world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

let scene = new Scene();

let camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.set(3, 3, 3).multiplyScalar(2);
camera.lookAt(scene.position);

let renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0xe1e5ea);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf3f3f3, 1);
document.body.appendChild(renderer.domElement);

const light = new DirectionalLight(0xffffff, 1);
light.position.set(10, 15, 5);
scene.add(light);

// シャドウカメラ
const frustumSize = 80;
const shadowCamera = (light.shadow.camera = new OrthographicCamera(
  -frustumSize / 2,
  frustumSize / 2,
  frustumSize / 2,
  -frustumSize / 2,
  1,
  frustumSize
));
scene.add(shadowCamera);
light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(scene.position);

// 深度マップ
light.shadow.mapSize.x = 2048;
light.shadow.mapSize.y = 2048;

const pars = {
  minFilter: NearestFilter,
  magFilter: NearestFilter,
  format: RGBAFormat,
};

light.shadow.map = new WebGLRenderTarget(
  light.shadow.mapSize.x,
  light.shadow.mapSize.y,
  pars
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const ground = createGround();
scene.add(ground.mesh);
world.addBody(ground.body);

const boxList: Box[] = [];

function addObj() {
  const randScale = () => -0.5 + Math.random();

  let basePoint = params.randomColor ? rand(360) : 140;

  const randColor = () => {
    // カラフルモード
    if (params.colorfull) {
      return `hsl(${rand(360)}, 80%, 50%)`;
    }

    // デフォルトカラー
    return `hsl(${rand(50) + basePoint}, 80%, 50%)`;
  };

  const weight = 0.5;
  for (let i = 0; i < params.amount; i++) {
    const options = {
      color: randColor(),
      weight,
      position: {
        x: randScale(),
        y: 10 + i * weight * 2,
        z: randScale(),
      },
      mass: 100,
    };
    const box = createBox(options);
    boxList.push(box);
    scene.add(box.mesh);
    world.addBody(box.body);
  }
}

/**
 * 床を生成する
 */
function createGround(size = 100) {
  const body = new CANNON.Body({
    mass: 0, // 0だと動かない剛体になる
  });
  body.addShape(new CANNON.Plane());

  // cannonではz軸を上向きの軸にしているので床を設置するとxy麺に床が生成される
  // three.jsだとy軸を上としがちなので、変な感じにならないように90度回転させる
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

  const geometry = new PlaneGeometry(size, size);
  const { material, shadowMaterial } = createMaterial(
    "white", // "hsl(160, 85%, 25%)",
    vertexShader,
    fragmentShader
  );

  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;

  return { body, mesh, material, shadowMaterial };
}

/**
 * 箱を生成する
 */
function createBox(
  options = {
    color: `red`,
    weight: 50,
    position: { x: 0, y: 200, z: 0 },
    mass: 50,
  }
) {
  const { color, weight, position, mass } = options;

  let body = new CANNON.Body({
    mass, // 重さ
    position: new CANNON.Vec3(position.x, position.y, position.z), // m
    shape: new CANNON.Box(new CANNON.Vec3(weight / 2, weight / 2, weight / 2)), // three.jsのSphereと同じもの,meshのsizeはbodyのsizeの2倍にしてあげ流必要があるのでこっちを半分にした
  });

  body.angularVelocity.set(Math.random(), Math.random(), 0); // 回転を加える

  const { mesh, material, shadowMaterial } = createObj(
    new BoxGeometry(weight, weight, weight),
    color
  );
  mesh.position.set(position.x, position.y, position.z);

  return { mesh, body, material, shadowMaterial };
}

let fixedTimeStep = 1.0 / 60.0;
let maxSubStep = 3;
let lastTime: number;

function loop(t: number) {
  delta = clock.getDelta();
  time += delta;

  // 深度カメラ更新
  shadowCamera.position.copy(light.position);
  shadowCamera.lookAt(scene.position);

  if (lastTime !== undefined) {
    const dt = (t - lastTime) / 1000;
    world.step(fixedTimeStep, dt, maxSubStep);
  }

  lastTime = t;

  // canonの情報をコピーしてmeshに反映することでcannonとthree.jsの疎通ができる
  for (const box of boxList) {
    box.mesh.position.copy(box.body.position as any);
    box.mesh.quaternion.copy(box.body.quaternion as any);
  }

  // 深度
  ground.mesh.material = ground.shadowMaterial;
  for (const box of boxList) {
    box.mesh.material = box.shadowMaterial;
  }
  renderer.setRenderTarget(light.shadow.map);
  renderer.render(scene, shadowCamera);

  // 通常のレンダリング
  ground.mesh.material = ground.material;
  for (const box of boxList) {
    box.mesh.material = box.material;
  }
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);

  requestAnimationFrame(loop);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
loop(0);
resize();

const button = document.createElement("button");
button.addEventListener("click", () => {
  addObj();
});
button.textContent = "追加";
button.classList.add("button");

const buttonWrapper = document.createElement("div");
buttonWrapper.classList.add("button-wrapper");
buttonWrapper.appendChild(button);

document.body.appendChild(buttonWrapper);

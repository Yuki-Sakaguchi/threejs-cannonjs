import "./style.css";

import * as CANNON from "cannon-es";
import {
  Scene,
  WebGLRenderer,
  PlaneGeometry,
  PerspectiveCamera,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  DoubleSide,
  AmbientLight,
  DirectionalLight,
} from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

type Box = {
  body: CANNON.Body;
  mesh: Mesh;
};

// let gui = new GUI();
// let params = {
//   color: 0x00ff00,
//   scale: 1.0,
// };
// gui
//   .addColor(params, "color")
//   .onChange(() => cube.material.color.set(params.color));
// gui.add(params, "scale", 1.0, 4.0).onChange(() => {
//   cube.scale.set(params.scale, params.scale, params.scale);
// });

let world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

let scene = new Scene();

let camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.set(20, 30, 30);

let renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambient = new AmbientLight(0xffffff, 1.0);
scene.add(ambient);
const direction = new DirectionalLight(0xffffff, 1);
scene.add(direction);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const ground = createGround();
scene.add(ground.mesh);
world.addBody(ground.body);

const boxList: Box[] = [];
const randScale = () => (-0.5 + Math.random()) * 10;
const weight = 1;
for (let i = 0; i < 100; i++) {
  const options = {
    weight,
    position: {
      x: randScale(),
      y: 10 + i * weight * 2,
      z: randScale(),
    },
    mass: 100,
  };
  boxList[i] = createBox(options);
  scene.add(boxList[i].mesh);
  world.addBody(boxList[i].body);
}

/**
 * 床を生成する
 */
function createGround(size = 1000) {
  const body = new CANNON.Body({
    mass: 0, // 0だと動かない剛体になる
  });
  body.addShape(new CANNON.Plane());

  // cannonではz軸を上向きの軸にしているので床を設置するとxy麺に床が生成される
  // three.jsだとy軸を上としがちなので、変な感じにならないように90度回転させる
  body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

  const geometry = new PlaneGeometry(size, size);
  const material = new MeshStandardMaterial({
    color: 0x23372f,
    side: DoubleSide,
  });

  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;

  return { body, mesh };
}

/**
 * 箱を生成する
 */
function createBox(
  options = {
    weight: 50,
    position: { x: 0, y: 200, z: 0 },
    mass: 50,
  }
) {
  const { weight, position, mass } = options;

  let body = new CANNON.Body({
    mass, // 重さ
    position: new CANNON.Vec3(position.x, position.y, position.z), // m
    shape: new CANNON.Box(new CANNON.Vec3(weight / 2, weight / 2, weight / 2)), // three.jsのSphereと同じもの,meshのsizeはbodyのsizeの2倍にしてあげ流必要があるのでこっちを半分にした
  });

  body.angularVelocity.set(Math.random(), Math.random(), 0); // 回転を加える

  let geometry = new BoxGeometry(weight, weight, weight);
  let material = new MeshStandardMaterial({ color: 0xaa0000, roughness: 0.0 });

  let mesh = new Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);

  return { body, mesh };
}

let fixedTimeStep = 1.0 / 60.0;
let maxSubStep = 3;
let lastTime: number;

function animate(time: number) {
  requestAnimationFrame(animate);

  if (lastTime !== undefined) {
    const dt = (time - lastTime) / 1000;
    world.step(fixedTimeStep, dt, maxSubStep);
  }

  // canonの情報をコピーしてmeshに反映することでcannonとthree.jsの疎通ができる
  for (const box of boxList) {
    box.mesh.position.copy(box.body.position as any);
    box.mesh.quaternion.copy(box.body.quaternion as any);
  }

  lastTime = time;
  renderer.render(scene, camera);
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
animate(0);
resize();

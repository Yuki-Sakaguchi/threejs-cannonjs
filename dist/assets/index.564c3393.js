import{C as B,V as G,G as N,W as O,S as W,P as E,a as q,D as H,O as U,N as S,R as $,b as K,c as J,B as M,d as Q,e as g,f as X,M as F,g as Y,h as L,i as Z,j as ee}from"./vendor.04b5918b.js";const oe=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const t of o)if(t.type==="childList")for(const d of t.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function r(o){const t={};return o.integrity&&(t.integrity=o.integrity),o.referrerpolicy&&(t.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?t.credentials="include":o.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(o){if(o.ep)return;o.ep=!0;const t=r(o);fetch(o.href,t)}};oe();var P=`varying vec3 vNormal;

uniform mat4 uShadowCameraP;
uniform mat4 uShadowCameraV;

varying vec4 vShadowCoord;

void main(){
    vNormal = normal;
    vec3 pos = position;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
    vShadowCoord = uShadowCameraP * uShadowCameraV * modelMatrix * vec4(pos, 1.0);
}
`,z=`uniform vec3 uColor;
uniform sampler2D uDepthMap;
uniform vec3 uLightPos;
uniform vec4 uIntensity_0;

varying vec3 vNormal;

varying vec4 vShadowCoord;

// https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/packing.glsl.js#L24
#include <packing>

float frustumTest(vec3 shadowCoord, float shadowFactor){
    bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
    bool inFrustum = all( inFrustumVec );

    bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
    bool frustumTest = all( frustumTestVec );

    if(frustumTest == false){
        shadowFactor = 1.0;
    }

    return shadowFactor;
}

void main(){
    float cosTheta = dot(normalize(uLightPos), vNormal);
    float difLight = max(0.0, cosTheta);

    vec3 shadowCoord = (vShadowCoord.xyz / vShadowCoord.w * 0.5 + 0.5);

    float depth_shadowCoord = shadowCoord.z;

    vec2 depthMapUv = shadowCoord.xy;
    float depth_depthMap = unpackRGBAToDepth(texture2D(uDepthMap, depthMapUv));

    //http://www.opengl-tutorial.org/intermediate-tutorials/tutorial-16-shadow-mapping/
    float bias = 0.005 * tan(acos(cosTheta)); // cosTheta is dot( n,l ), clamped between 0 and 1
    bias = clamp(bias, 0.0, 0.01);

    float shadowFactor = step(depth_shadowCoord - bias, depth_depthMap);
    shadowFactor = frustumTest(shadowCoord, shadowFactor);
    
    float shading = shadowFactor * difLight;
    
    vec3 color = vec3(0.0);

    if(uIntensity_0.x == 1.0){
        color = mix(uColor - 0.1, uColor + 0.1, shading);
    } 
    else if(uIntensity_0.y == 1.0){
        color = vec3(shading);
    }
    else if(uIntensity_0.z == 1.0){
        color = vec3(shadowFactor);
    }
    else if(uIntensity_0.w == 1.0){
        color = vec3(difLight);
    }



    gl_FragColor = vec4(color, 1.0);
}
`,te=`// https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderChunk/packing.glsl.js#L18
#include <packing>

void main(){
    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
}
`;let T=0,_=0,k=new B;k.start();console.log(T);let ne=new G(1,0,0,0),y=new N,c={randomColor:!1,colorfull:!1,amount:100};y.add(c,"randomColor");y.add(c,"colorfull");y.add(c,"amount",1,100);function C(n){return Math.floor(Math.random()*n)}function R(n,e,r){const a={uTime:{value:0},uColor:{value:new Y(n)},uLightPos:{value:s.position},uDepthMap:{value:s.shadow.map.texture},uShadowCameraP:{value:m.projectionMatrix},uShadowCameraV:{value:m.matrixWorldInverse},uIntensity_0:{value:ne}},o=new L({vertexShader:e,fragmentShader:r,uniforms:a}),t=new L({vertexShader:e,fragmentShader:te,uniforms:a});return{material:o,shadowMaterial:t}}function ae(n,e){const{material:r,shadowMaterial:a}=R(e,P,z),o=new F(n,r);return l.add(o),{mesh:o,material:r,shadowMaterial:a}}let w=new O;w.gravity.set(0,-9.82,0);let l=new W,h=new E(75,window.innerWidth/window.innerHeight,1,1e4);h.position.set(3,3,3).multiplyScalar(2);h.lookAt(l.position);let i=new q({antialias:!0,alpha:!0});i.setClearColor(14804458);i.setPixelRatio(Math.min(2,window.devicePixelRatio));i.setSize(window.innerWidth,window.innerHeight);i.setClearColor(15987699,1);document.body.appendChild(i.domElement);const s=new H(16777215,1);s.position.set(10,15,5);l.add(s);const p=80,m=s.shadow.camera=new U(-p/2,p/2,p/2,-p/2,1,p);l.add(m);s.shadow.camera.position.copy(s.position);s.shadow.camera.lookAt(l.position);s.shadow.mapSize.x=2048;s.shadow.mapSize.y=2048;const re={minFilter:S,magFilter:S,format:$};s.shadow.map=new K(s.shadow.mapSize.x,s.shadow.mapSize.y,re);const se=new J(h,i.domElement);se.update();const u=ie();l.add(u.mesh);w.addBody(u.body);const f=[];function j(){const n=()=>-.5+Math.random();let e=c.randomColor?C(360):140;const r=()=>c.colorfull?`hsl(${C(360)}, 80%, 50%)`:`hsl(${C(50)+e}, 80%, 50%)`,a=.5;for(let o=0;o<c.amount;o++){const t={color:r(),weight:a,position:{x:n(),y:10+o*a*2,z:n()},mass:100},d=de(t);f.push(d),l.add(d.mesh),w.addBody(d.body)}}function ie(n=100){const e=new M({mass:0});e.addShape(new Q),e.quaternion.setFromAxisAngle(new g(1,0,0),-Math.PI/2);const r=new X(n,n),{material:a,shadowMaterial:o}=R("white",P,z),t=new F(r,a);return t.rotation.x=-Math.PI/2,t.position.y=0,{body:e,mesh:t,material:a,shadowMaterial:o}}function de(n={color:"red",weight:50,position:{x:0,y:200,z:0},mass:50}){const{color:e,weight:r,position:a,mass:o}=n;let t=new M({mass:o,position:new g(a.x,a.y,a.z),shape:new Z(new g(r/2,r/2,r/2))});t.angularVelocity.set(Math.random(),Math.random(),0);const{mesh:d,material:I,shadowMaterial:V}=ae(new ee(r,r,r),e);return d.position.set(a.x,a.y,a.z),{mesh:d,body:t,material:I,shadowMaterial:V}}let le=1/60,ce=3,b;function A(n){if(_=k.getDelta(),T+=_,m.position.copy(s.position),m.lookAt(l.position),b!==void 0){const e=(n-b)/1e3;w.step(le,e,ce)}b=n;for(const e of f)e.mesh.position.copy(e.body.position),e.mesh.quaternion.copy(e.body.quaternion);u.mesh.material=u.shadowMaterial;for(const e of f)e.mesh.material=e.shadowMaterial;i.setRenderTarget(s.shadow.map),i.render(l,m),u.mesh.material=u.material;for(const e of f)e.mesh.material=e.material;i.setRenderTarget(null),i.render(l,h),requestAnimationFrame(A)}function D(){const n=window.innerWidth,e=window.innerHeight;i.setPixelRatio(window.devicePixelRatio),i.setSize(n,e),h.aspect=n/e,h.updateProjectionMatrix()}window.addEventListener("resize",D);A(0);D();j();const v=document.createElement("button");v.addEventListener("click",()=>{j()});v.textContent="\u8FFD\u52A0";v.classList.add("button");const x=document.createElement("div");x.classList.add("button-wrapper");x.appendChild(v);document.body.appendChild(x);

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VesselId } from '../../types/cardio';
import { VESSEL_REGISTRY } from '../../constants/vesselMapping';
import { createVesselShaderMaterial } from './VesselShader';
import { LegendOverlay } from './LegendOverlay';
import { SvgHeartFallback } from './SvgHeartFallback';
import { RotateCcw, Eye, Compass, Layers, ShieldCheck } from 'lucide-react';

interface HeartCanvasProps {
  probabilities: Record<VesselId, number>;
  selectedVessel: VesselId | null;
  onSelectVessel: (vessel: VesselId) => void;
  onShowSafetyModal: () => void;
  theme?: 'dark' | 'light';
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  probabilities,
  selectedVessel,
  onSelectVessel,
  onShowSafetyModal,
  theme = 'dark'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is2dFallback, setIs2dFallback] = useState(false);
  const [hoveredVessel, setHoveredVessel] = useState<VesselId | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [cameraView, setCameraView] = useState<'Anterior' | 'Posterior' | 'Inferior' | 'Lateral' | 'Free'>('Anterior');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const heartGroupRef = useRef<THREE.Group | null>(null);

  // Lighting references for dynamic theme adaptation
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const vesselMaterialsRef = useRef<Record<VesselId, THREE.ShaderMaterial | null>>({
    LAD: null,
    LCX: null,
    RCA: null
  });
  const vesselMeshesRef = useRef<Record<VesselId, THREE.Mesh[]>>({
    LAD: [],
    LCX: [],
    RCA: []
  });

  // Camera glide target coordinates
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(0.2, 0.4, 3.2));
  const cameraTargetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Pointer position & raycasting throttle state
  const pointerPosRef = useRef<{ x: number; y: number; isInside: boolean }>({ x: 0, y: 0, isInside: false });
  const pendingRaycastRef = useRef<boolean>(false);

  // Initialize and run Three.js scene
  useEffect(() => {
    if (is2dFallback || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 550;

    // 1. Scene with theme-aware background & subtle fog
    const isDark = theme === 'dark';
    const bgCol = isDark ? 0x070b13 : 0xf8fafc;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgCol);
    scene.fog = new THREE.FogExp2(bgCol, isDark ? 0.12 : 0.08);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0.2, 0.4, 3.2);
    cameraRef.current = camera;

    // 3. Renderer with high performance & capped pixel ratio for seamless scrolling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        precision: 'highp'
      });
      renderer.setSize(width, height);
      // Cap at 1.35 to avoid fill-rate bottleneck on high-DPI/Retina displays
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);
    } catch {
      setIs2dFallback(true);
      return;
    }

    // 4. OrbitControls with smooth, responsive damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 1.6;
    controls.maxDistance = 5.5;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(isDark ? 0x2d3748 : 0x94a3b8, isDark ? 1.2 : 1.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.0 : 2.2);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(isDark ? 0x06b6d4 : 0x38bdf8, isDark ? 1.5 : 1.2);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x818cf8, isDark ? 1.8 : 1.1);
    rimLight.position.set(0, -4, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 6. Cardiac Root Group
    const cardiacRoot = new THREE.Group();
    heartGroupRef.current = cardiacRoot;
    scene.add(cardiacRoot);

    // === BUILD ANATOMICAL HEART GEOMETRY ===

    // A. Ventricular Myocardium (Optimized MeshStandardMaterial for high framerate)
    const ventricleGeo = new THREE.SphereGeometry(1.0, 36, 36);
    const vPos = ventricleGeo.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      let x = vPos.getX(i);
      let y = vPos.getY(i);
      let z = vPos.getZ(i);

      // Taper downwards into conical cardiac apex (pointing down, forward, and left)
      if (y < 0.2) {
        const factor = 1.0 - (0.2 - y) * 0.45;
        x *= factor;
        z *= factor;
        x -= (0.2 - y) * 0.12; // tilt leftwards towards apex
      }
      // Anterior fullness
      if (z > 0) {
        z *= 1.08;
      }
      vPos.setXYZ(i, x * 0.95, y * 1.15, z * 0.92);
    }
    ventricleGeo.computeVertexNormals();

    const myocardiumMat = new THREE.MeshStandardMaterial({
      color: 0x5a0c1a,
      emissive: 0x1a0206,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.90
    });

    const myocardiumMesh = new THREE.Mesh(ventricleGeo, myocardiumMat);
    myocardiumMesh.name = 'Myocardium_Ventricles';
    cardiacRoot.add(myocardiumMesh);

    // B. Atria (Left and Right Atrial Chambers above AV groove)
    const atriaGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const atriaMat = new THREE.MeshStandardMaterial({
      color: 0x3d0716,
      roughness: 0.4,
      transparent: true,
      opacity: 0.85
    });

    const rightAtrium = new THREE.Mesh(atriaGeo, atriaMat);
    rightAtrium.position.set(0.48, 0.72, -0.15);
    rightAtrium.scale.set(0.9, 0.8, 0.9);
    cardiacRoot.add(rightAtrium);

    const leftAtrium = new THREE.Mesh(atriaGeo, atriaMat);
    leftAtrium.position.set(-0.48, 0.76, -0.25);
    leftAtrium.scale.set(0.85, 0.8, 0.85);
    cardiacRoot.add(leftAtrium);

    // C. Great Arteries: Aorta Root and Arch
    const aortaCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.05, 0.75, 0.1),
      new THREE.Vector3(0.05, 1.25, 0.15),
      new THREE.Vector3(-0.15, 1.45, -0.1),
      new THREE.Vector3(-0.25, 1.05, -0.45)
    );
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 28, 0.2, 16, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.3,
      metalness: 0.2
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    aortaMesh.name = 'Aorta_Root';
    cardiacRoot.add(aortaMesh);

    // Brachiocephalic aortic branches
    const branchGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const b1 = new THREE.Mesh(branchGeo, aortaMat);
    b1.position.set(0.05, 1.42, 0.05);
    b1.rotation.z = -0.2;
    cardiacRoot.add(b1);

    const b2 = new THREE.Mesh(branchGeo, aortaMat);
    b2.position.set(-0.06, 1.46, -0.05);
    b2.rotation.z = -0.1;
    cardiacRoot.add(b2);

    const b3 = new THREE.Mesh(branchGeo, aortaMat);
    b3.position.set(-0.16, 1.44, -0.15);
    b3.rotation.z = 0.1;
    cardiacRoot.add(b3);

    // Pulmonary Trunk
    const pulmoCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0.18, 0.72, 0.28),
      new THREE.Vector3(0.05, 1.05, 0.35),
      new THREE.Vector3(-0.25, 1.05, 0.2),
      new THREE.Vector3(-0.45, 0.95, -0.05)
    );
    const pulmoGeo = new THREE.TubeGeometry(pulmoCurve, 24, 0.18, 16, false);
    const pulmoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.35,
      transparent: true,
      opacity: 0.9
    });
    const pulmoMesh = new THREE.Mesh(pulmoGeo, pulmoMat);
    pulmoMesh.name = 'Pulmonary_Trunk';
    cardiacRoot.add(pulmoMesh);

    // === CORONARY ARTERY SHADER MATERIALS ===
    const matLad = createVesselShaderMaterial(probabilities.LAD);
    const matLcx = createVesselShaderMaterial(probabilities.LCX);
    const matRca = createVesselShaderMaterial(probabilities.RCA);

    vesselMaterialsRef.current = { LAD: matLad, LCX: matLcx, RCA: matRca };

    const meshesLad: THREE.Mesh[] = [];
    const meshesLcx: THREE.Mesh[] = [];
    const meshesRca: THREE.Mesh[] = [];

    // --- 1. LAD (Left Anterior Descending Artery) ---
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.72, 0.25),
      new THREE.Vector3(-0.12, 0.52, 0.52),
      new THREE.Vector3(-0.08, 0.25, 0.72),
      new THREE.Vector3(-0.04, -0.05, 0.85),
      new THREE.Vector3(-0.02, -0.38, 0.82),
      new THREE.Vector3(-0.05, -0.68, 0.68),
      new THREE.Vector3(-0.10, -0.92, 0.38),
      new THREE.Vector3(-0.14, -1.02, 0.15)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 36, 0.038, 10, false);
    const ladMesh = new THREE.Mesh(ladGeo, matLad);
    ladMesh.name = 'Node_LAD';
    ladMesh.userData = { vesselId: 'LAD' };
    cardiacRoot.add(ladMesh);
    meshesLad.push(ladMesh);

    // LAD Diagonal Branch 1 (D1)
    const d1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.25, 0.72),
      new THREE.Vector3(-0.32, 0.12, 0.74),
      new THREE.Vector3(-0.55, -0.05, 0.62),
      new THREE.Vector3(-0.68, -0.28, 0.45)
    ]);
    const d1Mesh = new THREE.Mesh(new THREE.TubeGeometry(d1Curve, 18, 0.024, 8, false), matLad);
    d1Mesh.userData = { vesselId: 'LAD' };
    cardiacRoot.add(d1Mesh);
    meshesLad.push(d1Mesh);

    // LAD Diagonal Branch 2 (D2)
    const d2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, -0.05, 0.85),
      new THREE.Vector3(-0.25, -0.22, 0.78),
      new THREE.Vector3(-0.42, -0.42, 0.60)
    ]);
    const d2Mesh = new THREE.Mesh(new THREE.TubeGeometry(d2Curve, 14, 0.02, 8, false), matLad);
    d2Mesh.userData = { vesselId: 'LAD' };
    cardiacRoot.add(d2Mesh);
    meshesLad.push(d2Mesh);

    // --- 2. LCX (Left Circumflex Artery) ---
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.72, 0.25),
      new THREE.Vector3(-0.35, 0.65, 0.30),
      new THREE.Vector3(-0.65, 0.52, 0.18),
      new THREE.Vector3(-0.85, 0.32, -0.05),
      new THREE.Vector3(-0.88, 0.05, -0.32),
      new THREE.Vector3(-0.75, -0.22, -0.55),
      new THREE.Vector3(-0.50, -0.48, -0.65)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 34, 0.035, 10, false);
    const lcxMesh = new THREE.Mesh(lcxGeo, matLcx);
    lcxMesh.name = 'Node_LCX';
    lcxMesh.userData = { vesselId: 'LCX' };
    cardiacRoot.add(lcxMesh);
    meshesLcx.push(lcxMesh);

    // LCX Obtuse Marginal Branch (OM1)
    const om1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.85, 0.32, -0.05),
      new THREE.Vector3(-0.92, 0.02, 0.08),
      new THREE.Vector3(-0.85, -0.28, 0.12),
      new THREE.Vector3(-0.68, -0.55, 0.08)
    ]);
    const om1Mesh = new THREE.Mesh(new THREE.TubeGeometry(om1Curve, 18, 0.024, 8, false), matLcx);
    om1Mesh.userData = { vesselId: 'LCX' };
    cardiacRoot.add(om1Mesh);
    meshesLcx.push(om1Mesh);

    // --- 3. RCA (Right Coronary Artery) ---
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.75, 0.22),
      new THREE.Vector3(0.42, 0.65, 0.35),
      new THREE.Vector3(0.72, 0.45, 0.28),
      new THREE.Vector3(0.85, 0.15, 0.15),
      new THREE.Vector3(0.82, -0.18, 0.05),
      new THREE.Vector3(0.68, -0.48, -0.15),
      new THREE.Vector3(0.42, -0.68, -0.45),
      new THREE.Vector3(0.08, -0.82, -0.55)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 36, 0.038, 10, false);
    const rcaMesh = new THREE.Mesh(rcaGeo, matRca);
    rcaMesh.name = 'Node_RCA';
    rcaMesh.userData = { vesselId: 'RCA' };
    cardiacRoot.add(rcaMesh);
    meshesRca.push(rcaMesh);

    // RCA Acute Marginal Branch
    const amCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.85, 0.15, 0.15),
      new THREE.Vector3(0.88, -0.08, 0.32),
      new THREE.Vector3(0.75, -0.35, 0.45),
      new THREE.Vector3(0.55, -0.62, 0.48)
    ]);
    const amMesh = new THREE.Mesh(new THREE.TubeGeometry(amCurve, 18, 0.024, 8, false), matRca);
    amMesh.userData = { vesselId: 'RCA' };
    cardiacRoot.add(amMesh);
    meshesRca.push(amMesh);

    vesselMeshesRef.current = { LAD: meshesLad, LCX: meshesLcx, RCA: meshesRca };

    // 7. Raycasting for Interaction (Decoupled from mousemove to prevent CPU stalls)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointerPosRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerPosRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerPosRef.current.isInside = true;
      pendingRaycastRef.current = true;
    };

    const handlePointerLeave = () => {
      pointerPosRef.current.isInside = false;
      pendingRaycastRef.current = false;
      setHoveredVessel(null);
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';
    };

    const handleClick = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allVessels = [...meshesLad, ...meshesLcx, ...meshesRca];
      const intersects = raycaster.intersectObjects(allVessels, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const vId = hit.userData?.vesselId as VesselId;
        if (vId) {
          onSelectVessel(vId);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    renderer.domElement.addEventListener('click', handleClick);

    // 8. Animation & Render Loop with IntersectionObserver pausing for zero-lag scrolling
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = lastTime;

    const animate = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return; // Pause rendering loop when canvas is scrolled off-screen
      }

      const now = performance.now();
      const timeSec = now * 0.001;

      // FPS tracking
      frameCount++;
      if (now - fpsTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTime)));
        frameCount = 0;
        fpsTime = now;
      }

      // Smooth camera glide interpolation towards target
      if (camera && controls) {
        camera.position.lerp(cameraTargetPos.current, 0.05);
        controls.target.lerp(cameraTargetLookAt.current, 0.05);
        controls.update();
      }

      // Subtle biological cardiac heartbeat contraction (systole/diastole cycle)
      if (cardiacRoot) {
        const beatCycle = Math.sin(timeSec * 4.5);
        const contraction = beatCycle > 0 ? Math.pow(beatCycle, 3) * 0.03 : beatCycle * 0.012;
        const scaleVal = 1.0 + contraction;
        cardiacRoot.scale.set(scaleVal, 1.0 - contraction * 0.5, scaleVal);
      }

      // Perform batched raycasting only if pointer moved within canvas
      if (pendingRaycastRef.current && pointerPosRef.current.isInside) {
        pendingRaycastRef.current = false;
        mouse.set(pointerPosRef.current.x, pointerPosRef.current.y);
        raycaster.setFromCamera(mouse, camera);
        const allVessels = [...meshesLad, ...meshesLcx, ...meshesRca];
        const intersects = raycaster.intersectObjects(allVessels, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const vId = hit.userData?.vesselId as VesselId;
          if (vId) {
            setHoveredVessel(vId);
            renderer.domElement.style.cursor = 'pointer';
          } else {
            setHoveredVessel(null);
            renderer.domElement.style.cursor = 'grab';
          }
        } else {
          setHoveredVessel(null);
          renderer.domElement.style.cursor = 'grab';
        }
      }

      // Update shader uniforms
      const vessels: VesselId[] = ['LAD', 'LCX', 'RCA'];
      vessels.forEach((v) => {
        const mat = vesselMaterialsRef.current[v];
        if (mat) {
          mat.uniforms.uTime.value = timeSec;
          mat.uniforms.uStenosisProbability.value = probabilities[v] ?? 0.1;
          mat.uniforms.uSelected.value = selectedVessel === v ? 1.0 : 0.0;
          mat.uniforms.uHovered.value = hoveredVessel === v ? 1.0 : 0.0;
        }
      });

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Intersection Observer to halt rendering when off-screen (eliminates scroll lag)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry ? entry.isIntersecting : true;
        isVisibleRef.current = visible;
        if (visible && !animFrameIdRef.current) {
          lastTime = performance.now();
          animFrameIdRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );

    if (mountRef.current) {
      observer.observe(mountRef.current);
    }

    // Resize Observer
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
        renderer.domElement.removeEventListener('click', handleClick);
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, [is2dFallback]);

  // Sync lighting & scene background when theme prop changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const isDark = theme === 'dark';
    const bgCol = isDark ? 0x070b13 : 0xf8fafc;
    sceneRef.current.background = new THREE.Color(bgCol);
    if (sceneRef.current.fog) {
      sceneRef.current.fog = new THREE.FogExp2(bgCol, isDark ? 0.12 : 0.08);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(isDark ? 0x2d3748 : 0x94a3b8);
      ambientLightRef.current.intensity = isDark ? 1.2 : 1.6;
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = isDark ? 2.0 : 2.2;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(isDark ? 0x06b6d4 : 0x38bdf8);
      fillLightRef.current.intensity = isDark ? 1.5 : 1.2;
    }
    if (rimLightRef.current) {
      rimLightRef.current.color.setHex(0x818cf8);
      rimLightRef.current.intensity = isDark ? 1.8 : 1.1;
    }
  }, [theme]);

  // Sync probabilities and selection into shader uniforms when props change
  useEffect(() => {
    const vessels: VesselId[] = ['LAD', 'LCX', 'RCA'];
    vessels.forEach((v) => {
      const mat = vesselMaterialsRef.current[v];
      if (mat) {
        mat.uniforms.uStenosisProbability.value = probabilities[v] ?? 0.1;
        mat.uniforms.uSelected.value = selectedVessel === v ? 1.0 : 0.0;
        mat.uniforms.uHovered.value = hoveredVessel === v ? 1.0 : 0.0;
      }
    });

    // Camera glide to focused vessel
    if (selectedVessel && VESSEL_REGISTRY[selectedVessel]) {
      const meta = VESSEL_REGISTRY[selectedVessel];
      cameraTargetPos.current.set(...meta.cameraFocusPosition);
      cameraTargetLookAt.current.set(...meta.cameraTarget);
      setCameraView(selectedVessel === 'LAD' ? 'Anterior' : selectedVessel === 'LCX' ? 'Lateral' : 'Inferior');
    }
  }, [probabilities, selectedVessel, hoveredVessel]);

  // Camera presets
  const handleSetCameraPreset = useCallback((preset: 'Anterior' | 'Posterior' | 'Inferior' | 'Lateral' | 'Reset') => {
    if (preset === 'Reset' || preset === 'Anterior') {
      cameraTargetPos.current.set(0.2, 0.4, 3.2);
      cameraTargetLookAt.current.set(0, 0, 0);
      setCameraView('Anterior');
    } else if (preset === 'Posterior') {
      cameraTargetPos.current.set(0.0, 0.5, -3.2);
      cameraTargetLookAt.current.set(0, 0, 0);
      setCameraView('Posterior');
    } else if (preset === 'Inferior') {
      cameraTargetPos.current.set(0.1, -2.8, 1.2);
      cameraTargetLookAt.current.set(0, -0.2, 0);
      setCameraView('Inferior');
    } else if (preset === 'Lateral') {
      cameraTargetPos.current.set(-3.1, 0.3, 0.5);
      cameraTargetLookAt.current.set(0, 0, 0);
      setCameraView('Lateral');
    }
  }, []);

  return (
    <div className="canvas-wrapper">
      {/* 3D WebGL Canvas or 2D Resilient Fallback */}
      {is2dFallback ? (
        <SvgHeartFallback
          probabilities={probabilities}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
        />
      ) : (
        <div ref={mountRef} className="three-mount-container" />
      )}

      {/* Floating HUD Controls */}
      <div className="canvas-hud-top">
        <div className="canvas-status-pill">
          <span className="live-dot" />
          <span className="mode-text">{is2dFallback ? '2D Vector Engine' : 'WebGL 2.0 Anatomical Mesh'}</span>
          {!is2dFallback && <span className="fps-counter">{fps} FPS</span>}
        </div>

        <div className="canvas-mode-toggle">
          <button
            className={`hud-toggle-btn ${!is2dFallback ? 'active' : ''}`}
            onClick={() => setIs2dFallback(false)}
            title="3D Hardware-Accelerated Interactive Model"
          >
            <Compass size={14} />
            <span>3D Mesh</span>
          </button>
          <button
            className={`hud-toggle-btn ${is2dFallback ? 'active' : ''}`}
            onClick={() => setIs2dFallback(true)}
            title="2D Anatomical Diagram Fallback"
          >
            <Layers size={14} />
            <span>2D Diagram</span>
          </button>
        </div>
      </div>

      {/* Camera Orientation Gizmo Bar */}
      {!is2dFallback && (
        <div className="camera-gizmo-bar">
          <button
            className={`gizmo-btn ${cameraView === 'Anterior' ? 'active' : ''}`}
            onClick={() => handleSetCameraPreset('Anterior')}
            title="Anterior (Frontal / LAD focus)"
          >
            Anterior
          </button>
          <button
            className={`gizmo-btn ${cameraView === 'Posterior' ? 'active' : ''}`}
            onClick={() => handleSetCameraPreset('Posterior')}
            title="Posterior (Back wall)"
          >
            Posterior
          </button>
          <button
            className={`gizmo-btn ${cameraView === 'Lateral' ? 'active' : ''}`}
            onClick={() => handleSetCameraPreset('Lateral')}
            title="Left Lateral (LCX focus)"
          >
            Lateral
          </button>
          <button
            className={`gizmo-btn ${cameraView === 'Inferior' ? 'active' : ''}`}
            onClick={() => handleSetCameraPreset('Inferior')}
            title="Inferior (RCA focus)"
          >
            Inferior
          </button>
          <button
            className="gizmo-btn reset"
            onClick={() => handleSetCameraPreset('Reset')}
            title="Reset Camera Orientation"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* Selected Vessel Callout Overlay */}
      {selectedVessel && (
        <div className="selected-vessel-badge">
          <div className="vessel-badge-glow" />
          <span className="vessel-label">Selected Vascular Territory:</span>
          <strong>{VESSEL_REGISTRY[selectedVessel].displayName} ({selectedVessel})</strong>
          <span className="vessel-prob-pill">
            Predicted Risk: {Math.round(probabilities[selectedVessel] * 100)}%
          </span>
        </div>
      )}

      {/* Continuous Risk Heatmap Legend HUD */}
      <LegendOverlay onInfoClick={onShowSafetyModal} />
    </div>
  );
};

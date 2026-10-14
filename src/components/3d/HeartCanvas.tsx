import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VesselId, VesselRisk } from '../../types/cardio';
import { VESSEL_REGISTRY, getProbabilityColor } from '../../constants/vesselMapping';
import { createVesselShaderMaterial } from './VesselShader';
import { LegendOverlay } from './LegendOverlay';
import { SvgHeartFallback } from './SvgHeartFallback';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Compass,
  Layers,
  ShieldAlert,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface HeartCanvasProps {
  probabilities: Record<VesselId, number>;
  selectedVessel: VesselId | null;
  onSelectVessel: (vessel: VesselId) => void;
  onOpenDrawer?: (vessel: VesselId) => void;
  onShowSafetyModal: () => void;
  theme?: 'dark' | 'light';
  overallCadProbability?: number;
  overallCadRiskClassification?: string;
  vesselsData?: Record<VesselId, VesselRisk>;
}

export const HeartCanvas: React.FC<HeartCanvasProps> = ({
  probabilities,
  selectedVessel,
  onSelectVessel,
  onOpenDrawer,
  onShowSafetyModal,
  theme = 'dark',
  overallCadProbability,
  overallCadRiskClassification,
  vesselsData
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [is2dFallback, setIs2dFallback] = useState(false);
  const [hoveredVessel, setHoveredVessel] = useState<VesselId | null>(null);
  const [isInfoCollapsed, setIsInfoCollapsed] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [cameraView, setCameraView] = useState<'Anterior' | 'Posterior' | 'Inferior' | 'Lateral' | 'Free'>('Anterior');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const isAutoRotatingRef = useRef<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const cardiacRootRef = useRef<THREE.Group | null>(null);

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

  // Keep isAutoRotatingRef in sync
  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  // Initialize and run Three.js scene
  useEffect(() => {
    if (is2dFallback || !mountRef.current) return;

    const width = mountRef.current.clientWidth > 0
      ? mountRef.current.clientWidth
      : (mountRef.current.parentElement?.clientWidth || 700);
    const height = mountRef.current.clientHeight > 0
      ? mountRef.current.clientHeight
      : 580;

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      rendererRef.current = renderer;

      // Clear any prior canvas to guarantee clean single canvas mount
      while (mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
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
    controls.minDistance = 1.5;
    controls.maxDistance = 5.5;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight(isDark ? 0x2d3748 : 0x94a3b8, isDark ? 1.2 : 1.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.0 : 2.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(isDark ? 0x06b6d4 : 0x38bdf8, isDark ? 1.5 : 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const rimLight = new THREE.DirectionalLight(0x818cf8, isDark ? 1.8 : 1.1);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 6. Cardiac Anatomical Geometry Setup
    const cardiacRoot = new THREE.Group();
    cardiacRootRef.current = cardiacRoot;
    scene.add(cardiacRoot);

    // Myocardial Base Mass (Ventricles + Atria)
    const myoMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x22141a : 0xe2d4d9,
      roughness: 0.55,
      metalness: 0.1,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
      transmission: 0.05,
      thickness: 0.6
    });

    const ventGeo = new THREE.SphereGeometry(1.0, 36, 36);
    ventGeo.scale(0.85, 1.25, 0.75);
    const ventMesh = new THREE.Mesh(ventGeo, myoMat);
    ventMesh.position.set(0, -0.15, 0);
    cardiacRoot.add(ventMesh);

    // Left Ventricular Apex
    const apexGeo = new THREE.ConeGeometry(0.72, 0.95, 32);
    apexGeo.scale(0.9, 1.0, 0.75);
    const apexMesh = new THREE.Mesh(apexGeo, myoMat);
    apexMesh.position.set(0.12, -1.05, 0.05);
    apexMesh.rotation.z = Math.PI + 0.12;
    apexMesh.rotation.x = -0.15;
    cardiacRoot.add(apexMesh);

    // Ascending Aortic Root
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.6, 0.1),
      new THREE.Vector3(0.1, 1.0, 0.15),
      new THREE.Vector3(0.2, 1.35, 0.0),
      new THREE.Vector3(0.0, 1.5, -0.25),
      new THREE.Vector3(-0.3, 1.4, -0.45)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 28, 0.18, 18, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x991b1b : 0xdc2626,
      roughness: 0.45,
      metalness: 0.2
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    cardiacRoot.add(aortaMesh);

    // Pulmonary Trunk
    const paCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.5, 0.3),
      new THREE.Vector3(-0.25, 0.9, 0.25),
      new THREE.Vector3(-0.35, 1.2, 0.0)
    ]);
    const paGeo = new THREE.TubeGeometry(paCurve, 20, 0.16, 16, false);
    const paMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e3a8a : 0x2563eb,
      roughness: 0.45,
      metalness: 0.2
    });
    const paMesh = new THREE.Mesh(paGeo, paMat);
    cardiacRoot.add(paMesh);

    // Coronary Arteries via Dynamic GLSL Shaders
    const matLad = createVesselShaderMaterial(probabilities.LAD);
    const matLcx = createVesselShaderMaterial(probabilities.LCX);
    const matRca = createVesselShaderMaterial(probabilities.RCA);

    vesselMaterialsRef.current = { LAD: matLad, LCX: matLcx, RCA: matRca };

    const meshesLad: THREE.Mesh[] = [];
    const meshesLcx: THREE.Mesh[] = [];
    const meshesRca: THREE.Mesh[] = [];

    // --- 1. LAD (Left Anterior Descending Artery) ---
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.72, 0.28),
      new THREE.Vector3(-0.08, 0.48, 0.55),
      new THREE.Vector3(-0.06, 0.18, 0.78),
      new THREE.Vector3(-0.02, -0.15, 0.88),
      new THREE.Vector3(0.04, -0.55, 0.78),
      new THREE.Vector3(0.12, -0.92, 0.52),
      new THREE.Vector3(0.15, -1.25, 0.18)
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 42, 0.04, 10, false);
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
    const d1Mesh = new THREE.Mesh(new THREE.TubeGeometry(d1Curve, 18, 0.026, 8, false), matLad);
    d1Mesh.userData = { vesselId: 'LAD' };
    cardiacRoot.add(d1Mesh);
    meshesLad.push(d1Mesh);

    // LAD Diagonal Branch 2 (D2)
    const d2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, -0.05, 0.85),
      new THREE.Vector3(-0.25, -0.22, 0.78),
      new THREE.Vector3(-0.42, -0.42, 0.60)
    ]);
    const d2Mesh = new THREE.Mesh(new THREE.TubeGeometry(d2Curve, 14, 0.022, 8, false), matLad);
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
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 34, 0.038, 10, false);
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
    const om1Mesh = new THREE.Mesh(new THREE.TubeGeometry(om1Curve, 18, 0.026, 8, false), matLcx);
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
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 36, 0.04, 10, false);
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
    const amMesh = new THREE.Mesh(new THREE.TubeGeometry(amCurve, 18, 0.026, 8, false), matRca);
    amMesh.userData = { vesselId: 'RCA' };
    cardiacRoot.add(amMesh);
    meshesRca.push(amMesh);

    vesselMeshesRef.current = { LAD: meshesLad, LCX: meshesLcx, RCA: meshesRca };

    // 7. Raycasting for Interaction with High Precision
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.1 };
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (event: MouseEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

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
      // Ignore click if it was an orbit rotation drag gesture (> 6px movement)
      const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      if (dist > 6) return;

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

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    renderer.domElement.addEventListener('click', handleClick);

    // 8. Animation & Render Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTime = lastTime;

    const animate = () => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      const now = performance.now();
      const timeSec = now * 0.001;

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

      // Continuous Auto-Rotation if enabled
      if (isAutoRotatingRef.current && cardiacRoot) {
        cardiacRoot.rotation.y += 0.005;
      }

      // Subtle biological cardiac heartbeat contraction (systole/diastole cycle)
      if (cardiacRoot) {
        const beatCycle = Math.sin(timeSec * 4.5);
        const contraction = beatCycle > 0 ? Math.pow(beatCycle, 3) * 0.025 : beatCycle * 0.01;
        const scaleVal = 1.0 + contraction;
        cardiacRoot.scale.set(scaleVal, 1.0 - contraction * 0.5, scaleVal);
      }

      // Raycasting hit test
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

    // Render initial frame immediately to prevent blank canvas on load
    renderer.render(scene, camera);
    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. ResizeObserver to dynamically update camera & renderer as soon as flex layout settles
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.render(scene, camera);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }
    // Multi-phase resize triggers to capture flexbox layout settling immediately
    const t0 = setTimeout(handleResize, 16);
    const t1 = setTimeout(handleResize, 60);
    const t2 = setTimeout(handleResize, 180);
    const t3 = setTimeout(handleResize, 400);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('mousemove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
        renderer.domElement.removeEventListener('click', handleClick);
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    };
  }, []);

  // When switching between 2D diagram and 3D model, immediately recalculate viewport and re-render
  useEffect(() => {
    if (!is2dFallback && rendererRef.current && cameraRef.current && mountRef.current) {
      const resizeAndRender = () => {
        if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
        const w = mountRef.current.clientWidth || 600;
        const h = mountRef.current.clientHeight || 580;
        if (w > 0 && h > 0) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
          if (sceneRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        }
      };
      requestAnimationFrame(resizeAndRender);
      const timerA = setTimeout(resizeAndRender, 50);
      const timerB = setTimeout(resizeAndRender, 180);
      return () => {
        clearTimeout(timerA);
        clearTimeout(timerB);
      };
    }
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
      cameraTargetPos.current.set(meta.cameraFocusPosition[0], meta.cameraFocusPosition[1], meta.cameraFocusPosition[2]);
      cameraTargetLookAt.current.set(meta.cameraTarget[0], meta.cameraTarget[1], meta.cameraTarget[2]);
      setCameraView(selectedVessel === 'LAD' ? 'Anterior' : selectedVessel === 'LCX' ? 'Lateral' : 'Inferior');
    }
  }, [probabilities, selectedVessel, hoveredVessel]);

  // Camera presets
  const handleSetCameraPreset = useCallback((preset: 'Anterior' | 'Posterior' | 'Inferior' | 'Lateral' | 'Reset') => {
    if (preset === 'Reset' || preset === 'Anterior') {
      cameraTargetPos.current.set(0.2, 0.4, 3.2);
      cameraTargetLookAt.current.set(0, 0, 0);
      setCameraView('Anterior');
      setIsAutoRotating(false);
      if (cardiacRootRef.current) {
        cardiacRootRef.current.rotation.y = 0;
      }
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

  // Smooth Zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    const currentDist = cameraTargetPos.current.distanceTo(cameraTargetLookAt.current);
    const newDist = Math.max(1.6, Math.min(5.5, currentDist * factor));
    const dir = new THREE.Vector3().subVectors(cameraTargetPos.current, cameraTargetLookAt.current).normalize();
    cameraTargetPos.current.copy(cameraTargetLookAt.current).addScaledVector(dir, newDist);
    setCameraView('Free');
  };

  return (
    <div className="canvas-wrapper">
      {/* 3D WebGL Canvas always mounted for immediate rendering */}
      <div
        ref={mountRef}
        className="three-mount-container"
        style={{ display: is2dFallback ? 'none' : 'block' }}
      />

      {/* 2D Resilient Fallback Overlay */}
      {is2dFallback && (
        <SvgHeartFallback
          probabilities={probabilities}
          selectedVessel={selectedVessel}
          onSelectVessel={onSelectVessel}
        />
      )}

      {/* Floating HUD Top Bar */}
      <div className="canvas-hud-top">
        <div className="canvas-status-pill">
          <span className="live-dot" />
          <span className="mode-text">
            {is2dFallback ? '2D Vector Fallback' : 'WebGL 2.0 Coronary Explorer'}
          </span>
          {!is2dFallback && <span className="fps-counter">{fps} FPS</span>}
        </div>

        <div className="canvas-mode-toggle">
          <button
            className={`hud-toggle-btn ${!is2dFallback ? 'active' : ''}`}
            onClick={() => setIs2dFallback(false)}
            title="3D Hardware-Accelerated Interactive Model"
          >
            <Compass size={14} />
            <span>3D Model</span>
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

      {/* Synchronized Coronary Artery Explorer Bar */}
      <div className="coronary-explorer-nav-bar" role="tablist" aria-label="Coronary Artery Explorer">
        <span className="explorer-nav-label">Select Artery:</span>
        {(['LAD', 'LCX', 'RCA'] as VesselId[]).map((vId) => {
          const prob = probabilities[vId] ?? 0.1;
          const colorInfo = getProbabilityColor(prob);
          const isSelected = selectedVessel === vId;
          const meta = VESSEL_REGISTRY[vId];

          return (
            <button
              key={vId}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`artery-explorer-chip ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectVessel(vId)}
              style={{
                borderColor: isSelected ? colorInfo.hex : undefined,
                boxShadow: isSelected ? `0 0 12px ${colorInfo.hex}55` : undefined
              }}
              title={`Inspect ${meta.displayName} (${Math.round(prob * 100)}% risk)`}
            >
              <span className="artery-chip-dot" style={{ backgroundColor: colorInfo.hex }} />
              <div className="artery-chip-text">
                <strong className="artery-code">{vId}</strong>
                <span className="artery-sub-desc">
                  {vId === 'LAD' ? 'Anterior' : vId === 'LCX' ? 'Lateral' : 'Inferior'}
                </span>
              </div>
              <span className="artery-prob-badge font-mono" style={{ color: colorInfo.hex }}>
                {Math.round(prob * 100)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Camera Orientation Gizmo & Zoom Controls Bar */}
      {!is2dFallback && (
        <div className="camera-gizmo-bar">
          <div className="gizmo-views-group">
            <button
              className={`gizmo-btn ${cameraView === 'Anterior' ? 'active' : ''}`}
              onClick={() => handleSetCameraPreset('Anterior')}
              title="Anterior View (LAD focus)"
            >
              Anterior (LAD)
            </button>
            <button
              className={`gizmo-btn ${cameraView === 'Lateral' ? 'active' : ''}`}
              onClick={() => handleSetCameraPreset('Lateral')}
              title="Left Lateral View (LCX focus)"
            >
              Lateral (LCX)
            </button>
            <button
              className={`gizmo-btn ${cameraView === 'Inferior' ? 'active' : ''}`}
              onClick={() => handleSetCameraPreset('Inferior')}
              title="Inferior View (RCA focus)"
            >
              Inferior (RCA)
            </button>
            <button
              className={`gizmo-btn ${cameraView === 'Posterior' ? 'active' : ''}`}
              onClick={() => handleSetCameraPreset('Posterior')}
              title="Posterior View (Back wall)"
            >
              Posterior
            </button>
          </div>

          <div className="gizmo-tools-group">
            <button
              type="button"
              className="gizmo-tool-btn"
              onClick={() => handleZoom('in')}
              title="Zoom In"
              aria-label="Zoom camera in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="gizmo-tool-btn"
              onClick={() => handleZoom('out')}
              title="Zoom Out"
              aria-label="Zoom camera out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className={`gizmo-tool-btn ${isAutoRotating ? 'active-tool' : ''}`}
              onClick={() => setIsAutoRotating((prev) => !prev)}
              title={isAutoRotating ? 'Pause 360° Auto-Rotation' : 'Start 360° Auto-Rotation'}
              aria-label="Toggle auto rotation"
            >
              {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              className="gizmo-btn reset"
              onClick={() => handleSetCameraPreset('Reset')}
              title="Reset Camera View to Default"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Selected Vessel Interactive Information Panel */}
      {selectedVessel && (
        <div className={`selected-artery-info-card ${isInfoCollapsed ? 'collapsed' : ''}`} role="region" aria-label="Selected Artery Risk Output">
          <div className="info-card-header">
            <div className="info-vessel-title-row">
              <span
                className="vessel-indicator-dot"
                style={{ backgroundColor: getProbabilityColor(probabilities[selectedVessel]).hex }}
              />
              <div className="vessel-titles">
                <h4>{VESSEL_REGISTRY[selectedVessel].displayName} ({selectedVessel})</h4>
                {!isInfoCollapsed && (
                  <span className="vessel-anat-desc">{VESSEL_REGISTRY[selectedVessel].anatomicalDescription}</span>
                )}
              </div>
            </div>

            <div className="info-card-header-actions">
              {isInfoCollapsed && (
                <span
                  className="metric-big-pct font-mono compact"
                  style={{ color: getProbabilityColor(probabilities[selectedVessel]).hex }}
                >
                  {Math.round(probabilities[selectedVessel] * 100)}%
                </span>
              )}
              <button
                type="button"
                className="info-collapse-btn"
                onClick={() => setIsInfoCollapsed((prev) => !prev)}
                title={isInfoCollapsed ? 'Expand Arterial Details Panel' : 'Minimize Panel to View 3D Heart'}
                aria-label={isInfoCollapsed ? 'Expand Arterial Details' : 'Minimize Details'}
              >
                {isInfoCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>
          </div>

          {!isInfoCollapsed && (
            <>
              <div className="info-card-metrics-grid">
                <div className="metric-box">
                  <span className="metric-box-label">Calibrated Stenosis Probability (≥50%)</span>
                  <div className="metric-box-val-row">
                    <span
                      className="metric-big-pct font-mono"
                      style={{ color: getProbabilityColor(probabilities[selectedVessel]).hex }}
                    >
                      {Math.round(probabilities[selectedVessel] * 100)}%
                    </span>
                    <span
                      className="metric-tier-pill"
                      style={{
                        backgroundColor: `${getProbabilityColor(probabilities[selectedVessel]).hex}22`,
                        color: getProbabilityColor(probabilities[selectedVessel]).hex,
                        border: `1px solid ${getProbabilityColor(probabilities[selectedVessel]).hex}`
                      }}
                    >
                      {getProbabilityColor(probabilities[selectedVessel]).label}
                    </span>
                  </div>
                  {vesselsData && vesselsData[selectedVessel] && (
                    <span className="metric-sub-ci font-mono">
                      95% Wilson CI: [{Math.round(vesselsData[selectedVessel].confidence_interval_95[0] * 100)}% - {Math.round(vesselsData[selectedVessel].confidence_interval_95[1] * 100)}%]
                    </span>
                  )}
                </div>

                {overallCadProbability !== undefined && (
                  <div className="metric-box comparison">
                    <span className="metric-box-label">Overall CAD Risk</span>
                    <span className="metric-cad-pct font-mono">
                      {Math.round(overallCadProbability * 100)}%
                    </span>
                    <span className="metric-cad-sub">
                      Tier: {overallCadRiskClassification || 'Global Risk'}
                    </span>
                  </div>
                )}
              </div>

              <div className="info-territory-row">
                <strong>Myocardial Perfusion:</strong>{' '}
                {vesselsData?.[selectedVessel]?.territory_description || VESSEL_REGISTRY[selectedVessel].clinicalSignificance}
              </div>

              {onOpenDrawer && (
                <button
                  type="button"
                  className="info-deep-dive-btn"
                  onClick={() => onOpenDrawer(selectedVessel)}
                  title={`Open comprehensive TreeSHAP waterfall and clinical notes for ${selectedVessel}`}
                >
                  <span>Detailed Territory SHAP Analysis</span>
                  <ExternalLink size={12} />
                </button>
              )}

              {/* Mandatory Clinical Disclaimer */}
              <div className="info-clinical-disclaimer">
                <ShieldAlert size={12} className="disclaimer-shield" />
                <span>
                  <strong>Model Estimate Notice:</strong> Statistical risk prediction derived from 54 clinical biomarkers. Does not depict patient catheterization imagery or measured anatomical plaque.
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Continuous Risk Heatmap Legend HUD */}
      <LegendOverlay onInfoClick={onShowSafetyModal} />
    </div>
  );
};

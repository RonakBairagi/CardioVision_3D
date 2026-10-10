import * as THREE from 'three';

export interface DynamicVesselUniforms {
  [uniform: string]: THREE.IUniform<any>;
  uStenosisProbability: { value: number };
  uSelected: { value: number };
  uHovered: { value: number };
  uTime: { value: number };
}

export const createVesselShaderMaterial = (initialProb: number = 0.1) => {
  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uStenosisProbability; // 0.0 to 1.0
    uniform float uSelected;           // 0.0 or 1.0
    uniform float uHovered;            // 0.0 or 1.0
    uniform float uTime;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    void main() {
      // Continuous perceptual color stops
      // Low: Cool Cyan/Teal (0.05, 0.65, 0.91)
      // Mid: Warm Amber     (0.96, 0.62, 0.04)
      // High: Vivid Crimson (0.94, 0.15, 0.20)
      vec3 lowColor  = vec3(0.05, 0.68, 0.88);
      vec3 midColor  = vec3(0.96, 0.62, 0.04);
      vec3 highColor = vec3(0.95, 0.12, 0.20);

      float p = clamp(uStenosisProbability, 0.0, 1.0);
      vec3 baseRiskColor;
      if (p < 0.5) {
        baseRiskColor = mix(lowColor, midColor, p * 2.0);
      } else {
        baseRiskColor = mix(midColor, highColor, (p - 0.5) * 2.0);
      }

      // Lighting calculation
      vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
      vec3 norm = normalize(vNormal);
      float diff = max(dot(norm, lightDir), 0.25);
      
      // Fresnel rim lighting for biological arterial appearance
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 2.5);

      // Selected vessel dynamic cardiac pulsation
      float pulse = 1.0 + 0.35 * sin(uTime * 5.0) * uSelected;
      float hoverHighlight = uHovered * 0.3;

      // Surface glow
      vec3 emissive = baseRiskColor * (0.4 + fresnel * 0.6) * pulse;
      vec3 litColor = baseRiskColor * diff + emissive + vec3(hoverHighlight);

      // Specular highlight
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(norm, halfDir), 0.0), 32.0);
      litColor += vec3(0.4) * spec;

      gl_FragColor = vec4(litColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uStenosisProbability: { value: initialProb },
      uSelected: { value: 0.0 },
      uHovered: { value: 0.0 },
      uTime: { value: 0.0 }
    }
  });
};

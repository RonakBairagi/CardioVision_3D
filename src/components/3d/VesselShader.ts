import * as THREE from 'three';

export function createVesselShaderMaterial(initialProbability: number = 0.1): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uStenosisProbability: { value: initialProbability },
      uSelected: { value: 0.0 },
      uHovered: { value: 0.0 },
      uTime: { value: 0.0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uStenosisProbability;
      uniform float uSelected;
      uniform float uHovered;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Continuous color stops:
        // <= 0.30: Cool Teal (0.05, 0.65, 0.91)
        // 0.30 - 0.65: Amber (0.96, 0.62, 0.04)
        // > 0.65: Crimson (0.93, 0.26, 0.26)
        vec3 lowColor  = vec3(0.05, 0.65, 0.91);
        vec3 midColor  = vec3(0.96, 0.62, 0.04);
        vec3 highColor = vec3(0.93, 0.26, 0.26);

        vec3 baseRiskColor;
        if (uStenosisProbability < 0.5) {
          baseRiskColor = mix(lowColor, midColor, uStenosisProbability * 2.0);
        } else {
          baseRiskColor = mix(midColor, highColor, (uStenosisProbability - 0.5) * 2.0);
        }

        // Simple diffuse shading
        vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
        float diff = max(dot(vNormal, lightDir), 0.25);

        // Subtle pulsation if selected or hovered
        float pulse = 1.0 + 0.18 * sin(uTime * 4.5) * max(uSelected, uHovered);
        vec3 finalColor = baseRiskColor * diff * pulse;

        // Extra specular rim highlight if selected
        if (uSelected > 0.5) {
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          finalColor += vec3(0.3, 0.3, 0.4) * pow(rim, 2.0);
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
}

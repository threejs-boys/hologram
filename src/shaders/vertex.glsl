uniform float uTime;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

float random2D (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main()
{
    // Final position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Glitch
    float glitchTIme =  uTime -  modelPosition.y;
    float glitchStrength =  sin(glitchTIme) +sin(glitchTIme * 3.45)+sin(glitchTIme* 8.76) ;
    glitchStrength =  smoothstep(0.3, 1.0, glitchStrength);
    glitchStrength *=0.05;
   modelPosition.x += ( random2D(modelPosition.xz + uTime ) - 0.5) * glitchStrength;
   modelPosition.z += ( random2D(modelPosition.zx + uTime ) - 0.5) * glitchStrength;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;


    // Model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    // 0.0 because we don't want to translate the normal

    // Varyings
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
    vUv =  uv; 

   
}


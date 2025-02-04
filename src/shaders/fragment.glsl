uniform float uTime;
uniform vec3 uColor;
uniform vec3 uColor2;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
varying float vGlitchTime;


// Tweaks
uniform float uFresnelSharpness ; //2.0
uniform float uFresnelItensity ; //1.25
uniform float uFrequency ; //20

void main()
{
    // Normal
    vec3 normal = normalize(vNormal);

    // if(gl_FrontFacing)
    // {
    //     normal *= -1.0; // or -normal
    // }
    // Stripes Pattern
    float stripes = - vPosition.y + uTime * 0.2;
    stripes  = mod(stripes *uFrequency,1.0);  // ? 20.0 is the frequence
    // ? For Sharpness use Pow
    stripes =  pow(stripes, 5.0);

    // Fresnel
    vec3 viewDirection =  vPosition -  cameraPosition;
    viewDirection =  normalize(viewDirection); // 0 to 1 all 
    // negative values are converted to 0 and positive to btn 0 & 1
    float fresnel =dot( viewDirection, normal) + 1.0; // 1.0 is the bias
    fresnel = pow(fresnel, uFresnelSharpness); // 2.0 is the sharpness

    // Fallof
    float fallof = 1.0- smoothstep(0.8, 0.1, fresnel);

    // Hologram
    float hologram =  stripes + fresnel;
    hologram+=fresnel * uFresnelItensity; // 1.25 is the intensity
    hologram *= fallof;
    
    float pct = sin(vGlitchTime);
    // Happens when the glitch happens

    vec3 color = mix(uColor, uColor2,pct);

    gl_FragColor =  vec4(color, hologram ); ;
     // Check in 3js if there is something corresponding to this and replace with code
    #include <tonemapping_fragment> // Tonemapping
    #include <colorspace_fragment>  // Color space conversion
}



// vec3(0.1,0.1,0.7)



// Hologram
// Outside Brighter
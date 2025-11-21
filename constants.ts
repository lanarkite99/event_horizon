

export const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const FRAGMENT_SHADER_SOURCE = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define PI 3.14159265359

  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mass;
  uniform float u_time;
  uniform float u_clickedTime;

  vec2 rotate(vec2 mt, vec2 st, float angle){
    float cosVal = cos((angle + u_clickedTime) * PI);
    float sinVal = sin(angle * 0.0); 
    
    // Physics realism tweak:
    // float cosVal = cos(angle) * (u_time * 0.3);
    // float sinVal = sin(angle) * (u_time * 0.3);
    
    float nx = (cosVal * (st.x - mt.x)) + (sinVal * (st.y - mt.y)) + mt.x;
    float ny = (cosVal * (st.y - mt.y)) - (sinVal * (st.x - mt.x)) + mt.y;
    return vec2(nx, ny);
  }

  void main() {
    // gl_FragCoord is bottom-left origin. We flip Y to match DOM Top-Left origin logic for texture mapping.
    // 0 at top, 1 at bottom.
    vec2 st = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y)/u_resolution;
    
    // u_mouse is passed as DOM coordinates (0 at top).
    // We use it directly so mt Y is also 0 at top, 1 at bottom.
    vec2 mt = vec2(u_mouse.x, u_mouse.y)/u_resolution;

    float dx = st.x - mt.x;
    float dy = st.y - mt.y;

    float dist = sqrt(dx * dx + dy * dy);
    
    // Avoid division by zero near singularity
    float safeDist = max(dist, 0.001);
    float pull = u_mass / (safeDist * safeDist);
    
    vec3 color = vec3(0.0);
    
    vec2 r = rotate(mt, st, pull);
    
    // Clamp texture coordinates to avoid repeating edges artifacts if image doesn't cover perfectly
    // r = clamp(r, 0.0, 1.0); 
    
    vec4 imgcolor = texture2D(u_image, r);
    
    // Darken the center (Event Horizon effect)
    float darkness = 1.0;
    if(u_mass > 0.0) {
       // Create a black hole shadow
       float eventHorizon = sqrt(u_mass) * 0.05; 
       if(dist < eventHorizon) {
          darkness = smoothstep(0.0, eventHorizon, dist);
       }
    }

    color = vec3(
      (imgcolor.x - (pull * 0.25)),
      (imgcolor.y - (pull * 0.25)), 
      (imgcolor.z - (pull * 0.25))
    );
    
    gl_FragColor = vec4(color * darkness, 1.0);
  }
`;

export const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80";

export const INITIAL_MASS = 500;
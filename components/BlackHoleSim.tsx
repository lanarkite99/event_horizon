import React, { useEffect, useRef, useState } from 'react';
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from '../constants';

interface BlackHoleSimProps {
  imageUrl: string;
  targetMass: number;
  isAutoMode: boolean;
}

const BlackHoleSim: React.FC<BlackHoleSimProps> = ({ imageUrl, targetMass, isAutoMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to hold mutable state for the animation loop without triggering re-renders
  const stateRef = useRef({
    mass: 0,
    targetMass: targetMass,
    mouseX: 0,
    mouseY: 0,
    mouseMoved: false,
    clicked: false,
    clickedTime: 0,
    startTime: Date.now(),
    width: 0,
    height: 0
  });

  // Sync props to refs
  useEffect(() => {
    stateRef.current.targetMass = targetMass;
  }, [targetMass]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // --- Shader Compilation Helpers ---
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // --- Buffers ---
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // --- Uniform Locations ---
    const locations = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      mass: gl.getUniformLocation(program, "u_mass"),
      time: gl.getUniformLocation(program, "u_time"),
      clickedTime: gl.getUniformLocation(program, "u_clickedTime"),
      image: gl.getUniformLocation(program, "u_image")
    };

    // --- Texture Loading ---
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Placeholder pixel while loading
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = imageUrl;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };

    // --- Resize Handler ---
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      // Update internal state
      stateRef.current.width = width;
      stateRef.current.height = height;
      
      // Update canvas buffer size
      canvas.width = width;
      canvas.height = height;
      
      gl.viewport(0, 0, width, height);
      gl.uniform2f(locations.resolution, width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // --- Animation Loop ---
    let animationFrameId: number;

    const render = () => {
      const now = Date.now();
      const state = stateRef.current;
      const currentTime = (now - state.startTime) / 1000;

      // --- Physics & Logic Updates ---
      
      // Smooth mass transition
      if (Math.abs(state.mass - state.targetMass) > 1) {
        state.mass += (state.targetMass - state.mass) * 0.05;
      }

      // Click effect logic
      if (state.clicked) {
        state.clickedTime += 0.03;
      } else if (state.clickedTime > 0) {
        state.clickedTime += -(state.clickedTime * 0.05);
        if (state.clickedTime < 0) state.clickedTime = 0;
      }

      // Auto movement logic (Orbit)
      if (isAutoMode || !state.mouseMoved) {
        const originX = state.width;
        const originY = state.height;
        state.mouseY = (-(originY / 2) + Math.sin(currentTime * 0.7) * ((originY * 0.25))) + state.height;
        state.mouseX = (originX / 2) + Math.sin(currentTime * 0.6) * -(originX * 0.35);
      }

      // --- Draw ---
      gl.uniform1f(locations.mass, state.mass * 0.00001); // Scale down for shader
      gl.uniform2f(locations.mouse, state.mouseX, state.mouseY);
      gl.uniform1f(locations.time, currentTime);
      gl.uniform1f(locations.clickedTime, state.clickedTime);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [imageUrl, isAutoMode]); // Re-init if image or auto mode changes fundamentally (though auto mode is handled in loop too)

  // --- Event Handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isAutoMode) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      stateRef.current.mouseX = e.clientX - rect.left;
      // In WebGL Y is usually bottom-up, but our shader logic might expect top-down depending on how we pass it.
      // The original code did: mouse.y = -e.pageY + canvas.height;
      // Let's stick to standard DOM coords first, but shader expects: 
      // vec2 mt = vec2(u_mouse.x, u_resolution.y - u_mouse.y)/u_resolution; 
      // This implies u_mouse.y should be screen coordinates (top=0).
      stateRef.current.mouseY = e.clientY - rect.top; 
      stateRef.current.mouseMoved = true;
    }
  };

  const handleMouseDown = () => {
    stateRef.current.clicked = true;
  };

  const handleMouseUp = () => {
    stateRef.current.clicked = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (isAutoMode) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && e.touches.length > 0) {
          stateRef.current.mouseX = e.touches[0].clientX - rect.left;
          stateRef.current.mouseY = e.touches[0].clientY - rect.top;
          stateRef.current.mouseMoved = true;
      }
  }

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        className={`block w-full h-full ${isAutoMode ? 'cursor-default' : 'cursor-crosshair'}`}
      />
    </div>
  );
};

export default BlackHoleSim;

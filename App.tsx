import React, { useState } from 'react';
import BlackHoleSim from './components/BlackHoleSim';
import Controls from './components/Controls';
import { DEFAULT_IMAGE_URL, INITIAL_MASS } from './constants';

const App: React.FC = () => {
  const [mass, setMass] = useState<number>(INITIAL_MASS);
  const [bgUrl, setBgUrl] = useState<string>(DEFAULT_IMAGE_URL);
  const [isAutoMode, setIsAutoMode] = useState<boolean>(false);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* WebGL Layer */}
      <div className="absolute inset-0 z-0">
        <BlackHoleSim 
            imageUrl={bgUrl} 
            targetMass={mass} 
            isAutoMode={isAutoMode} 
        />
      </div>

      {/* UI Layer */}
      <Controls 
        mass={mass}
        setMass={setMass}
        bgUrl={bgUrl}
        setBgUrl={setBgUrl}
        isAutoMode={isAutoMode}
        setIsAutoMode={setIsAutoMode}
      />
      
      {/* Info Badge (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 hidden md:block">
          <div className="text-right">
              <p className="text-white/30 text-xs font-mono">GLSL GRAVITY ENGINE v2.0</p>
          </div>
      </div>
    </div>
  );
};

export default App;

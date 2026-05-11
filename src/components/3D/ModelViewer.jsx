import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';

function Model({ modelPath, onLoad }) {
  // useGLTF 可以處理完整 URL 或相對路徑
  const gltf = useGLTF(modelPath);
  if (!gltf?.scene) {
    return null;
  }
  
  React.useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);
  
  return <primitive object={gltf.scene} />;
}

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#666'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ marginTop: '12px' }}>載入模型中...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ModelViewer({ modelPath, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div style={{ 
      position: 'relative',
      width: '100%', 
      height: '100%', 
    }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5
        }}>
          <LoadingFallback />
        </div>
      )}
      
      <Canvas camera={{ position: [0, 0.5, 2], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} onLoad={() => setIsLoading(false)} />
        </Suspense>
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={0}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  );
}

export default ModelViewer;

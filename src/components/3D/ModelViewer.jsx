import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera } from '@react-three/drei';

function Model({ modelPath, onLoad }) {
  // useGLTF 必須在頂層調用，不能在 try-catch 中
  const gltf = useGLTF(modelPath, true);
  
  React.useEffect(() => {
    if (gltf?.scene && onLoad) {
      console.log('✅ GLB 模型加載成功:', modelPath);
      onLoad();
    }
  }, [gltf?.scene, onLoad, modelPath]);
  
  if (!gltf?.scene) {
    return null;
  }
  
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

function ModelViewer({ modelPath, onClose, cameraConfig = {} }) {
  const [isLoading, setIsLoading] = useState(true);
  const [modelKey, setModelKey] = React.useState(0);
  const previousPathRef = React.useRef(modelPath);
  const canvasRef = React.useRef(null);
  
  // 默認相機配置
  const defaultCameraConfig = {
    position: [0, 0.5, 2],
    fov: 50
  };
  
  const finalCameraConfig = { ...defaultCameraConfig, ...cameraConfig };
  
  React.useEffect(() => {
    // 當 modelPath 改變時，重置加載狀態並強制重新加載模型
    if (previousPathRef.current !== modelPath) {
      console.log('🔄 模型路徑已改變:', previousPathRef.current, '->', modelPath);
      previousPathRef.current = modelPath;
      setIsLoading(true);
      // 延遲改變 key，避免立即銷毀 Canvas
      const timer = setTimeout(() => {
        setModelKey(prev => prev + 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [modelPath]);
  
  // 處理 WebGL Context Lost 錯誤
  const handleContextLost = React.useCallback((event) => {
    console.warn('⚠️ WebGL Context Lost, 嘗試恢復...');
    event.preventDefault();
  }, []);
  
  const handleContextRestored = React.useCallback(() => {
    console.log('✅ WebGL Context 已恢復');
  }, []);
  
  React.useEffect(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
    };
  }, [handleContextLost, handleContextRestored]);
  
  return (
    <div style={{ 
      position: 'relative',
      width: '100%', 
      height: '100%', 
    }} ref={canvasRef}>
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
          zIndex: 5,
        }}>
          <LoadingFallback />
        </div>
      )}
      
      <Canvas 
        camera={{ position: finalCameraConfig.position, fov: finalCameraConfig.fov }}
        gl={{ antialias: true, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          console.log('✅ Canvas 已建立');
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model 
            key={modelKey}
            modelPath={modelPath} 
            onLoad={() => setIsLoading(false)}
          />
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

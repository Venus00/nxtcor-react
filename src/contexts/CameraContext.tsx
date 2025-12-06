// contexts/CameraContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CameraId = 'cam1' | 'cam2';

interface CameraContextType {
  camId: CameraId;
  setCamId: (id: CameraId) => void;
}

const CameraContext = createContext<CameraContextType | null>(null);

export function useCameraContext() {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCameraContext must be used within CameraProvider');
  }
  return context;
}

// Shortcut - most components just need this
export function useCamId(): CameraId {
  return useCameraContext().camId;
}

export function CameraProvider({ children, defaultCamId = 'cam1' as CameraId }: { 
  children: ReactNode; 
  defaultCamId?: CameraId;
}) {
  const [camId, setCamId] = useState<CameraId>(defaultCamId);

  return (
    <CameraContext.Provider value={{ camId, setCamId }}>
      {children}
    </CameraContext.Provider>
  );
}
// components/CameraSelector.tsx
import { useCameraContext, type CameraId } from '../contexts/CameraContext';

const CAMERAS: { id: CameraId; label: string }[] = [
  { id: 'cam1', label: 'Caméra 1' },
  { id: 'cam2', label: 'Caméra 2' },
];

export function CameraSelector() {
  const { camId, setCamId } = useCameraContext();

  return (
    <div className="flex gap-2">
      {CAMERAS.map((cam) => (
        <button
          key={cam.id}
          onClick={() => setCamId(cam.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${camId === cam.id
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          {cam.label}
        </button>
      ))}
    </div>
  );
}
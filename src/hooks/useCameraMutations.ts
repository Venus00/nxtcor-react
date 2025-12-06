// hooks/useCameraMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import { cameraKeys } from './useCameraQueries';

// =============================================================================
// SYSTEM MUTATIONS
// =============================================================================
export function useSetTime(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (time: string) => apiFetch(`/camera/${camId}/system/time`, 'POST', { time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.systemTime(camId) });
    },
  });
}

export function useReboot(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/system/reboot`, 'POST'),
  });
}

// =============================================================================
// VIDEO MUTATIONS
// =============================================================================
export function useSetVideoColor(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/color`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.videoColor(camId) });
    },
  });
}
export function useSetVideoSharpness(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/sharpness`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.videoSharpness(camId) });
    },
  });
}

export function useSetExposure(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/exposure`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.exposure(camId) });
    },
  });
}
export function useSetWhiteBalance(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/whitebalance`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.whitebalance(camId) });
    },
  });
}
export function useSetVideoImageControl(camId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/flip`, 'POST', params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cameraKeys.flip(camId) });
        },
    });
}

export function useSetVideoInDenoise(camId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/denoise`, 'POST', params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cameraKeys.denoise(camId) });
        }
    });
}
export function useSetDayNight(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/daynight`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.dayNight(camId) });
    },
  });
}

export function useSetFocus(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/focus`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.focus(camId) });
    },
  });
}

export function useSetZoom(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/zoom`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.zoom(camId) });
    },
  });
}

export function useSetFlip(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/flip`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.flip(camId) });
    },
  });
}

export function useSetDefog(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/video/defog`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.defog(camId) });
    },
  });
}

export function useSetEncode(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/encode`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.encode(camId) });
    },
  });
}

export function useSetOSD(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/osd`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.osd(camId) });
    },
  });
}

// =============================================================================
// PTZ MUTATIONS
// =============================================================================
export function usePtzMove(camId: string) {
  return useMutation({
    mutationFn: ({ direction, speed = 4 }: { direction: string; speed?: number }) =>
      apiFetch(`/camera/${camId}/ptz/move/${direction}`, 'POST', { speed }),
  });
}

export function usePtzStop(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/move/stop`, 'POST', {}),
  });
}

export function usePtzZoomIn(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/zoom/in`, 'POST', {}),
  });
}

export function usePtzZoomOut(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/zoom/out`, 'POST', {}),
  });
}

export function usePtzZoomStop(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/zoom/stop`, 'POST', {}),
  });
}

export function useGotoPreset(camId: string) {
  return useMutation({
    mutationFn: (presetId: number) =>
      apiFetch(`/camera/${camId}/ptz/preset/goto`, 'POST', { presetId }),
  });
}

export function useSetPreset(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (presetId: number) =>
      apiFetch(`/camera/${camId}/ptz/preset/set`, 'POST', { presetId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.presets(camId) });
    },
  });
}

export function useStartTour(camId: string) {
  return useMutation({
    mutationFn: (tourId: number) =>
      apiFetch(`/camera/${camId}/ptz/tour/start`, 'POST', { tourId }),
  });
}

export function useStopTour(camId: string) {
  return useMutation({
    mutationFn: (tourId: number) =>
      apiFetch(`/camera/${camId}/ptz/tour/stop`, 'POST', { tourId }),
  });
}

export function useLightOn(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/light/on`, 'POST', {}),
  });
}

export function useLightOff(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/light/off`, 'POST', {}),
  });
}

export function useWiper(camId: string) {
  return useMutation({
    mutationFn: () => apiFetch(`/camera/${camId}/ptz/wiper`, 'POST', {}),
  });
}

// =============================================================================
// EVENTS MUTATIONS
// =============================================================================
export function useSetMotion(camId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: any) => apiFetch(`/camera/${camId}/events/motion`, 'POST', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.motion(camId) });
    },
  });
}

// =============================================================================
// LIVE MUTATIONS
// =============================================================================
export function useGetTemperature(camId: string) {
  return useMutation({
    mutationFn: ({ x, y }: { x: number; y: number }) =>
      apiFetch(`/camera/${camId}/live/temperature`, 'POST', { x, y }),
  });
}

// =============================================================================
// VIDEO MODE MUTATION
// =============================================================================
export interface VideoInModeParams {
  channel?: number;
  mode: number;
  config0: number;
  config1: number;
  timeSection?: string[][];
}

export function useSetVideoInMode(camId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: VideoInModeParams) => 
      apiFetch(`/camera/${camId}/video/mode`, 'POST', {
        channel: params.channel ?? 0,
        mode: params.mode,
        config0: params.config0,
        config1: params.config1,
        timeSection: params.timeSection,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cameraKeys.videoMode(camId) });
    },
  });
}
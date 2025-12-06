// hooks/useCameraQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';

// =============================================================================
// QUERY KEYS - Centralized for consistency
// =============================================================================
export const cameraKeys = {
  // System
  system: (camId: string) => ['camera', camId, 'system'] as const,
  systemInfo: (camId: string) => ['camera', camId, 'system', 'info'] as const,
  systemTime: (camId: string) => ['camera', camId, 'system', 'time'] as const,

  // Video
    videoMode: (camId: string) => ['camera', camId, 'video', 'mode'] as const,
  setup: (camId: string) => ['camera', camId, 'setup'] as const,
  videoColor: (camId: string) => ['camera', camId, 'video', 'color'] as const,
  videoSharpness: (camId: string) => ['camera', camId, 'video', 'Sharpness'] as const,
  exposure: (camId: string) => ['camera', camId, 'video', 'exposure'] as const,
  dayNight: (camId: string) => ['camera', camId, 'video', 'daynight'] as const,
  focus: (camId: string) => ['camera', camId, 'video', 'focus'] as const,
  zoom: (camId: string) => ['camera', camId, 'video', 'zoom'] as const,
  flip: (camId: string) => ['camera', camId, 'video', 'flip'] as const,
  backlight: (camId: string) => ['camera', camId, 'video', 'backlight'] as const,
  defog: (camId: string) => ['camera', camId, 'video', 'defog'] as const,
  encode: (camId: string) => ['camera', camId, 'encode'] as const,
  osd: (camId: string) => ['camera', camId, 'osd'] as const,

  // Network
  network: (camId: string) => ['camera', camId, 'network'] as const,
  tcpIp: (camId: string) => ['camera', camId, 'network', 'tcpip'] as const,
  rtsp: (camId: string) => ['camera', camId, 'network', 'rtsp'] as const,
  onvif: (camId: string) => ['camera', camId, 'network', 'onvif'] as const,

  // PTZ
  ptz: (camId: string) => ['camera', camId, 'ptz'] as const,
  ptzStatus: (camId: string) => ['camera', camId, 'ptz', 'status'] as const,
  presets: (camId: string) => ['camera', camId, 'ptz', 'presets'] as const,
  tours: (camId: string) => ['camera', camId, 'ptz', 'tours'] as const,

  // Events
  events: (camId: string) => ['camera', camId, 'events'] as const,
  motion: (camId: string) => ['camera', camId, 'events', 'motion'] as const,
  tamper: (camId: string) => ['camera', camId, 'events', 'tamper'] as const,
  audioDetect: (camId: string) => ['camera', camId, 'events', 'audio'] as const,

  // Storage
  storage: (camId: string) => ['camera', camId, 'storage'] as const,
  storageDevice: (camId: string) => ['camera', camId, 'storage', 'device'] as const,

  // Live
  rtspUrls: (camId: string) => ['camera', camId, 'live', 'rtsp'] as const,
  snapshotUrls: (camId: string) => ['camera', camId, 'live', 'snapshot'] as const,
  thermal: (camId: string) => ['camera', camId, 'live', 'thermal'] as const,
};

// =============================================================================
// SYSTEM QUERIES
// =============================================================================
export function useSystemInfo(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.systemInfo(camId),
    queryFn: () => apiFetch(`/camera/${camId}/system/info`),
    enabled,
  });
}

export function useSystemTime(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.systemTime(camId),
    queryFn: () => apiFetch(`/camera/${camId}/system/time`),
    enabled,
  });
}

export function useAllSystem(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.system(camId),
    queryFn: () => apiFetch(`/camera/${camId}/system`),
    enabled,
  });
}

// =============================================================================
// VIDEO QUERIES
// =============================================================================



// =============================================================================
// VIDEO MODE TYPES
// =============================================================================
export interface VideoInModeRaw {
  mode: number;           // 0 = full-time, 1 = schedule
  config0: number;        // 0=Day, 1=Night, 2=Normal
  config1: number;        // Used in schedule mode
  timeSection: string[][]; // [7 days][6 periods] - "enabled HH:MM:SS-HH:MM:SS"
}

// =============================================================================
// VIDEO MODE PARSER
// =============================================================================
function parseVideoInModeResponse(config: Record<string, any>, channel = 0): VideoInModeRaw {
  const data: VideoInModeRaw = {
    mode: 0,
    config0: 0,
    config1: 0,
    timeSection: Array(7).fill(null).map(() => Array(6).fill('0 00:00:00-23:59:59')),
  };
  console.log(config)
  for (const [key, value] of Object.entries(config)) {
    if (key === `table.VideoInMode[${channel}].Mode`) {
      data.mode = parseInt(String(value), 10) || 0;
    }
    if (key === `table.VideoInMode[${channel}].Config[0]`) {
      data.config0 = parseInt(String(value), 10) || 0;
    }
    if (key === `table.VideoInMode[${channel}].Config[1]`) {
      data.config1 = parseInt(String(value), 10) || 0;
    }
    
    const tsMatch = key.match(/table\.VideoInMode\[(\d+)\]\.TimeSection\[(\d+)\]\[(\d+)\]/);
    if (tsMatch && parseInt(tsMatch[1], 10) === channel) {
      const day = parseInt(tsMatch[2], 10);
      const period = parseInt(tsMatch[3], 10);
      if (day >= 0 && day < 7 && period >= 0 && period < 6) {
        data.timeSection[day][period] = String(value);
      }
    }
  }

  return data;
}

// =============================================================================
// VIDEO MODE QUERY
// =============================================================================
export function useVideoInMode(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.videoMode(camId),
    queryFn: async () => {
      const response = await apiFetch(`/camera/${camId}/video/mode`);
      return parseVideoInModeResponse(response.config || {}, 0);
    },
    enabled,
  });
}
export function useAllSetup(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.setup(camId),
    queryFn: () => apiFetch(`/camera/${camId}/setup`),
    enabled,
  });
}

export function useVideoColor(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.videoColor(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/color`),
    enabled,
  });
}

export function useVideoSharpness(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.videoSharpness(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/sharpness`),
    enabled,
  });
}

export function useExposure(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.exposure(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/exposure`),
    enabled,
  });
}

export function useDayNight(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.dayNight(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/daynight`),
    enabled,
  });
}

export function useFocus(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.focus(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/focus`),
    enabled,
  });
}

export function useZoom(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.zoom(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/zoom`),
    enabled,
  });
}

export function useFlip(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.flip(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/flip`),
    enabled,
  });
}

export function useBacklight(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.backlight(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/backlight`),
    enabled,
  });
}

export function useDefog(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.defog(camId),
    queryFn: () => apiFetch(`/camera/${camId}/video/defog`),
    enabled,
  });
}

export function useEncode(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.encode(camId),
    queryFn: () => apiFetch(`/camera/${camId}/encode`),
    enabled,
  });
}

export function useOSD(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.osd(camId),
    queryFn: () => apiFetch(`/camera/${camId}/osd`),
    enabled,
  });
}

// =============================================================================
// NETWORK QUERIES
// =============================================================================
export function useAllNetwork(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.network(camId),
    queryFn: () => apiFetch(`/camera/${camId}/network`),
    enabled,
  });
}

export function useTcpIp(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.tcpIp(camId),
    queryFn: () => apiFetch(`/camera/${camId}/network/tcpip`),
    enabled,
  });
}

export function useRtsp(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.rtsp(camId),
    queryFn: () => apiFetch(`/camera/${camId}/network/rtsp`),
    enabled,
  });
}

export function useOnvif(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.onvif(camId),
    queryFn: () => apiFetch(`/camera/${camId}/network/onvif`),
    enabled,
  });
}

// =============================================================================
// PTZ QUERIES
// =============================================================================
export function useAllPtz(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.ptz(camId),
    queryFn: () => apiFetch(`/camera/${camId}/ptz`),
    enabled,
  });
}

export function usePtzStatus(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.ptzStatus(camId),
    queryFn: () => apiFetch(`/camera/${camId}/ptz/status`),
    enabled,
    refetchInterval: 1000, // Refresh every second for live status
  });
}

export function usePresets(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.presets(camId),
    queryFn: () => apiFetch(`/camera/${camId}/ptz/presets`),
    enabled,
  });
}

export function useTours(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.tours(camId),
    queryFn: () => apiFetch(`/camera/${camId}/ptz/tours`),
    enabled,
  });
}

// =============================================================================
// EVENTS QUERIES
// =============================================================================
export function useAllEvents(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.events(camId),
    queryFn: () => apiFetch(`/camera/${camId}/events`),
    enabled,
  });
}

export function useMotion(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.motion(camId),
    queryFn: () => apiFetch(`/camera/${camId}/events/motion`),
    enabled,
  });
}

export function useTamper(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.tamper(camId),
    queryFn: () => apiFetch(`/camera/${camId}/events/tamper`),
    enabled,
  });
}

export function useAudioDetect(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.audioDetect(camId),
    queryFn: () => apiFetch(`/camera/${camId}/events/audio`),
    enabled,
  });
}

// =============================================================================
// STORAGE QUERIES
// =============================================================================
export function useAllStorage(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.storage(camId),
    queryFn: () => apiFetch(`/camera/${camId}/storage`),
    enabled,
  });
}

export function useStorageDevice(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.storageDevice(camId),
    queryFn: () => apiFetch(`/camera/${camId}/storage/device`),
    enabled,
  });
}

// =============================================================================
// LIVE QUERIES
// =============================================================================
export function useRtspUrls(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.rtspUrls(camId),
    queryFn: () => apiFetch(`/camera/${camId}/live/rtsp`),
    enabled,
  });
}

export function useSnapshotUrls(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.snapshotUrls(camId),
    queryFn: () => apiFetch(`/camera/${camId}/live/snapshot`),
    enabled,
  });
}

export function useThermal(camId: string, enabled = true) {
  return useQuery({
    queryKey: cameraKeys.thermal(camId),
    queryFn: () => apiFetch(`/camera/${camId}/live/thermal`),
    enabled,
  });
}
// Utility to fetch and parse PTZ status from the provided API
import axios from 'axios';

export interface PTZStatus {
    pan: number; // degrees
    tilt: number; // degrees
    raw: any;
    zoom: number
}

/**
 * Fetches PTZ status from the camera API and parses pan/tilt from status.Postion[0] and status.Postion[1].
 * @param cameraId Camera identifier (e.g., 'cam1')
 * @param baseUrl API base URL (e.g., 'http://172.24.161.28:3000')
 */
export async function fetchPTZStatus(cameraId: string, baseUrl: string): Promise<PTZStatus> {
    const url = `${baseUrl}/camera/${cameraId}/ptz/status`;
    const res = await axios.get(url);
    if (!res.data?.success || !res.data.status) throw new Error('Invalid PTZ status response');
    const status = res.data.status;
    const zoom = parseFloat(status['status.Postion[2]']) || 0;
    const pan = parseFloat(status['status.Postion[0]']) || 0;
    const tilt = parseFloat(status['status.Postion[1]']) || 0;
    return { pan, tilt, raw: status, zoom };
}

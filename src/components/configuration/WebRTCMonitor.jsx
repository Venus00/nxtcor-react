import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API_BASE = 'http://192.168.10.208:9898';

export default function WebRTCMonitor() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState({ cam1: 'disconnected', cam2: 'disconnected' });
  const [trackIds, setTrackIds] = useState({ cam1: 0, cam2: 0 });
  
  const videoRefs = useRef({ cam1: null, cam2: null });
  const peerConnections = useRef({});
  const logOutputRef = useRef(null);

  useEffect(() => {
    log('WebRTC Test Page loaded. Ready to connect!', 'success');
  }, []);

  useEffect(() => {
    if (logOutputRef.current) {
      logOutputRef.current.scrollTop = logOutputRef.current.scrollHeight;
    }
  }, [logs]);

  function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, type, timestamp };
    setLogs(prev => [...prev, logEntry]);
  }

  function updateStatus(cam, newStatus) {
    setStatus(prev => ({ ...prev, [cam]: newStatus }));
  }

  async function connectCamera(cam) {
    try {
      log(`Connecting to ${cam}...`, 'info');
      updateStatus(cam, 'connecting');

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnections.current[cam] = pc;

      pc.ontrack = (e) => {
        log(`${cam} video track received`, 'success');
        if (videoRefs.current[cam]) {
          videoRefs.current[cam].srcObject = e.streams[0];
        }
      };

      pc.oniceconnectionstatechange = () => {
        log(`${cam} ICE state: ${pc.iceConnectionState}`, 'info');
        if (pc.iceConnectionState === 'connected') {
          updateStatus(cam, 'connected');
        } else if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          updateStatus(cam, 'disconnected');
        }
      };

      pc.addTransceiver('video', { direction: 'recvonly' });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      log(`Sending offer to ${cam}...`, 'info');
      const response = await fetch(`${API_BASE}/${cam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: offer.sdp
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const answer = await response.json();
      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: answer.sdp
      }));

      log(`${cam} WebRTC connection established!`, 'success');
    } catch (e) {
      log(`Error connecting ${cam}: ${e.message}`, 'error');
      updateStatus(cam, 'disconnected');
    }
  }

  function disconnectCamera(cam) {
    if (peerConnections.current[cam]) {
      peerConnections.current[cam].close();
      delete peerConnections.current[cam];
      
      if (videoRefs.current[cam]) {
        videoRefs.current[cam].srcObject = null;
      }
      
      updateStatus(cam, 'disconnected');
      log(`${cam} disconnected`, 'info');
    }
  }

  async function startTracking(cam) {
    try {
      const response = await fetch(`${API_BASE}/ia_process/trackobject/${cam}/start`, {
        method: 'POST'
      });
      const data = await response.json();
      log(`${cam} tracking started: ${data.status}`, 'success');
    } catch (e) {
      log(`Error starting tracking for ${cam}: ${e.message}`, 'error');
    }
  }

  async function stopTracking(cam) {
    try {
      const response = await fetch(`${API_BASE}/ia_process/trackobject/${cam}/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      log(`${cam} tracking stopped: ${data.status}`, 'info');
    } catch (e) {
      log(`Error stopping tracking for ${cam}: ${e.message}`, 'error');
    }
  }

  async function trackObject(cam) {
    const trackId = trackIds[cam];
    
    if (isNaN(trackId) || trackId < 0 || trackId > 255) {
      log(`Invalid track ID for ${cam}. Must be 0-255`, 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/ia_process/trackobject_ids/${cam}/start/${trackId}`, {
        method: 'POST'
      });
      const data = await response.json();
      log(`${cam} now tracking object ID ${trackId}: ${data.status}`, 'success');
    } catch (e) {
      log(`Error tracking object for ${cam}: ${e.message}`, 'error');
    }
  }

  async function stopTrackingObject(cam) {
    try {
      const response = await fetch(`${API_BASE}/ia_process/trackobject_ids/${cam}/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      log(`${cam} object tracking stopped: ${data.status}`, 'info');
    } catch (e) {
      log(`Error stopping object tracking for ${cam}: ${e.message}`, 'error');
    }
  }

  const CameraCard = ({ camId, title }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <Badge 
            variant="outline"
            className={`
              ${status[camId] === 'connected' ? 'bg-green-100 text-green-800 border-green-300' : ''}
              ${status[camId] === 'connecting' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
              ${status[camId] === 'disconnected' ? 'bg-red-100 text-red-800 border-red-300' : ''}
            `}
          >
            {status[camId] === 'connected' && 'Connected'}
            {status[camId] === 'connecting' && 'Connecting...'}
            {status[camId] === 'disconnected' && 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video 
              ref={el => videoRefs.current[camId] = el} 
              autoPlay 
              playsInline
              className="w-full h-full"
            ></video>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => connectCamera(camId)} className="bg-green-600 hover:bg-green-700">
              Connect Stream
            </Button>
            <Button onClick={() => disconnectCamera(camId)} variant="destructive">
              Disconnect
            </Button>
            <Button onClick={() => startTracking(camId)} className="bg-blue-600 hover:bg-blue-700">
              Start Tracking
            </Button>
            <Button onClick={() => stopTracking(camId)} className="bg-orange-600 hover:bg-orange-700">
              Stop Tracking
            </Button>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <label className="block text-sm font-semibold text-slate-700">Track Object ID:</label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                min="0" 
                max="255" 
                value={trackIds[camId]} 
                onChange={(e) => setTrackIds(prev => ({ ...prev, [camId]: parseInt(e.target.value) || 0 }))}
                placeholder="0-255"
                className="w-24"
              />
              <Button onClick={() => trackObject(camId)} className="bg-blue-600 hover:bg-blue-700 flex-1">
                Track ID
              </Button>
              <Button onClick={() => stopTrackingObject(camId)} variant="destructive" className="flex-1">
                Stop Track
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold text-white text-center drop-shadow-lg">
          🎥 WebRTC Camera Monitoring System
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CameraCard camId="cam1" title="Camera 1 (RGB)" />
          <CameraCard camId="cam2" title="Camera 2 (Thermal)" />
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">📋 System Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={logOutputRef}
              className="bg-slate-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm space-y-1 border border-slate-700"
            >
              {logs.map((entry, idx) => (
                <div 
                  key={idx} 
                  className={`
                    ${entry.type === 'error' ? 'text-red-400' : ''}
                    ${entry.type === 'success' ? 'text-green-400' : ''}
                    ${entry.type === 'info' ? 'text-cyan-400' : ''}
                  `}
                >
                  [{entry.timestamp}] {entry.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

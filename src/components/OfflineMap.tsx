import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface OfflineMapProps {
    className?: string;
}

const OfflineMap: React.FC<OfflineMapProps> = ({ className }) => {
    // Center coordinates: 30.861114176029012, -3.7202736169236093
    const position: [number, number] = [30.861114176029012, -3.7202736169236093];
    const zoom = 15;

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            className={className}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Use online tiles since offline tiles are incomplete */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
            />
        </MapContainer>
    );
};

export default OfflineMap;
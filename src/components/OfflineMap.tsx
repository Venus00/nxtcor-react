import React from 'react';
import { MapContainer, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface OfflineMapProps {
    className?: string;
}

const OfflineMap: React.FC<OfflineMapProps> = ({ className }) => {
    // Use actual image dimensions (1399 x 689)
    const imageBounds: [[number, number], [number, number]] = [[0, 0], [689, 1399]];
    const center: [number, number] = [344.5, 699.5];

    return (
        <MapContainer
            center={center}
            zoom={3}
            className={className}
            style={{ width: '100%', height: '100%', backgroundColor: '#1f2937' }}
            crs={L.CRS.Simple}
            minZoom={-2}
            maxZoom={2}
            attributionControl={false}
            zoomControl={true}
            scrollWheelZoom={true}
            dragging={true}
        >
            <ImageOverlay
                url="/map.png"
                bounds={imageBounds}
            />
        </MapContainer>
    );
};

export default OfflineMap;
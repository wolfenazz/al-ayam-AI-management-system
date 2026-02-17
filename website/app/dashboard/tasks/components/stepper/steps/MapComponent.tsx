'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationData, MapComponentProps } from './mapTypes';

// Re-export types for convenience
export type { LocationData, MapComponentProps } from './mapTypes';

// Custom marker icon for task location
const createTaskIcon = () => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                width: 36px;
                height: 36px;
                position: relative;
            ">
                <div style="
                    width: 36px;
                    height: 36px;
                    background: #1e3fae;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <span style="
                        transform: rotate(45deg);
                        color: white;
                        font-size: 16px;
                        font-family: 'Material Symbols Outlined';
                    ">location_on</span>
                </div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to fly to location when it changes
function FlyToLocation({ location }: { location: LocationData | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (location) {
            map.flyTo([location.lat, location.lng], 15, {
                duration: 1.5,
            });
        }
    }, [location, map]);
    
    return null;
}

export default function MapComponent({ center, zoom, location, onLocationSelect }: MapComponentProps) {
    const taskIcon = createTaskIcon();

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            className="w-full h-full"
            style={{ background: '#e8eaf0' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onLocationSelect={onLocationSelect} />
            
            {location && (
                <>
                    <Marker position={[location.lat, location.lng]} icon={taskIcon} />
                    <FlyToLocation location={location} />
                </>
            )}
        </MapContainer>
    );
}

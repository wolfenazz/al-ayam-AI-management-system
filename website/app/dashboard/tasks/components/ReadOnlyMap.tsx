'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

interface ReadOnlyMapProps {
    location: {
        lat: number;
        lng: number;
    };
    address?: string;
}

// Component to handle map resize
function MapResizer() {
    const map = useMap();
    
    useEffect(() => {
        // Multiple attempts to invalidate size at different intervals
        const intervals = [10, 50, 100, 200, 300, 500, 1000];
        const timeouts = intervals.map(delay => 
            setTimeout(() => {
                map.invalidateSize(true);
            }, delay)
        );
        
        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [map]);
    
    return null;
}

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

// Counter to ensure unique map keys across all instances
let mapInstanceCounter = 0;

export default function ReadOnlyMap({ location }: ReadOnlyMapProps) {
    const [isReady, setIsReady] = useState(false);
    const taskIcon = useMemo(() => createTaskIcon(), []);
    
    // Generate a truly unique ID for each map instance using a counter
    const mapKey = useMemo(() => {
        mapInstanceCounter++;
        return `map-${mapInstanceCounter}-${Date.now()}`;
    }, []);

    // Wait for container to be properly mounted and have dimensions
    useEffect(() => {
        const checkContainer = () => {
            if (containerRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;
                if (offsetWidth > 0 && offsetHeight > 0) {
                    setIsReady(true);
                    return true;
                }
            }
            return false;
        };

        // Check immediately
        if (!checkContainer()) {
            // If not ready, check again after a short delay
            const timer = setTimeout(() => {
                if (!checkContainer()) {
                    // Try again after animation
                    const timer2 = setTimeout(checkContainer, 300);
                    return () => clearTimeout(timer2);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div 
            ref={containerRef}
            style={{
                width: '100%',
                height: '250px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border, #e8eaf2)',
                position: 'relative',
                backgroundColor: '#e8eaf0'
            }}
        >
            {!isReady ? (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            border: '2px solid #1e3fae',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <span style={{ fontSize: '12px', color: '#536293' }}>Loading map...</span>
                    </div>
                </div>
            ) : (
                <MapContainer
                    key={mapKey}
                    center={[location.lat, location.lng]}
                    zoom={15}
                    style={{ 
                        width: '100%',
                        height: '100%',
                        background: '#e8eaf0'
                    }}
                    dragging={true}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    touchZoom={true}
                    zoomControl={true}
                >
                    <MapResizer />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.lat, location.lng]} icon={taskIcon} />
                </MapContainer>
            )}
        </div>
    );
}

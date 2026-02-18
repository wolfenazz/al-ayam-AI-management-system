'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReadOnlyMapProps {
    location: {
        lat: number;
        lng: number;
    };
    address?: string;
}

// Custom hook to handle map invalidation and resizing
function MapController() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Function to reliable invalidate size
        const invalidate = () => {
            map.invalidateSize();
        };

        // Invalidate immediately
        invalidate();

        // Invalidate after a small delay to allow for modal transitions
        const timer = setTimeout(invalidate, 100);

        // Use ResizeObserver to watch the map container
        const container = map.getContainer();
        const resizeObserver = new ResizeObserver(() => {
            invalidate();
        });

        resizeObserver.observe(container);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
        };
    }, [map]);

    return null;
}

const customIcon = L.divIcon({
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

export default function ReadOnlyMap({ location }: ReadOnlyMapProps) {
    // Generate a unique key to force re-mounting when location changes
    // This ensures a fresh map instance is created
    const mapKey = `map-${location.lat}-${location.lng}`;

    return (
        <div className="w-full h-62.5 rounded-xl overflow-hidden border border-border bg-surface relative z-0">
            <MapContainer
                key={mapKey}
                center={[location.lat, location.lng]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={true}
                doubleClickZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.lat, location.lng]} icon={customIcon} />
                <MapController />
            </MapContainer>
        </div>
    );
}

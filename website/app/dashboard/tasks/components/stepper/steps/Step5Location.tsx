'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { MapComponentProps, LocationData } from './mapTypes';
import { StepErrors } from '../hooks/useTaskForm';

interface Step5LocationProps {
    location: LocationData | null;
    onLocationChange: (location: LocationData | null) => void;
    errors: StepErrors;
}

// Bahrain center coordinates
const BAHNAIN_CENTER = { lat: 26.0667, lng: 50.5577 };
const BAHRAIN_ZOOM = 10;

// Dynamic import for map component to avoid SSR issues
// Using type assertion to handle the dynamic import type
const MapComponent = dynamic<MapComponentProps>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => import('./MapComponent' as any).then((mod: any) => mod.default) as any,
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-sm text-text-secondary">Loading map...</span>
                </div>
            </div>
        ),
    }
);

export default function Step5Location({
    location,
    onLocationChange,
    errors,
}: Step5LocationProps) {
    const [isLocating, setIsLocating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLocationSelect = useCallback(async (lat: number, lng: number) => {
        // Reverse geocode to get address
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            onLocationChange({
                lat,
                lng,
                address: data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
        } catch {
            onLocationChange({
                lat,
                lng,
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
        }
    }, [onLocationChange]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // Use Nominatim for geocoding (free, no API key needed)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery + ', Bahrain'
                )}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                onLocationChange({
                    lat: parseFloat(lat),
                    lng: parseFloat(lon),
                    address: display_name,
                });
            } else {
                alert('Location not found in Bahrain. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search for location. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleLocationSelect(position.coords.latitude, position.coords.longitude);
                setIsLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please click on the map instead.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleClearLocation = () => {
        onLocationChange(null);
    };

    return (
        <div className="h-full flex flex-col p-6 sm:p-8">
            {/* Step Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-[24px] text-primary">location_on</span>
                    <h3 className="font-bold text-text-primary text-xl">Task Location</h3>
                </div>
                <p className="text-base text-text-secondary">
                    Pin the location on the map where the task needs to be performed. Click on the map to pin the task location in Bahrain.
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined text-[18px] text-text-secondary absolute left-3 top-1/2 -translate-y-1/2">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
                        placeholder="Search location in Bahrain..."
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        'Search'
                    )}
                </button>
            </div>

            {/* Error Message */}
            {errors.location && (
                <div className="mb-4 bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-accent-red text-[18px]">error</span>
                    <span className="text-sm text-accent-red">{errors.location}</span>
                </div>
            )}

            {/* Map Container */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-border shadow-sm min-h-50 sm:min-h-75">
                {isClient ? (
                    <React.Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center bg-surface">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="text-sm text-text-secondary">Loading map...</span>
                            </div>
                        </div>
                    }>
                        <MapComponent
                            center={BAHNAIN_CENTER}
                            zoom={BAHRAIN_ZOOM}
                            location={location}
                            onLocationSelect={handleLocationSelect}
                        />
                    </React.Suspense>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface">
                        <div className="flex flex-col items-center gap-2">
                            <span className="material-symbols-outlined text-[48px] text-text-secondary">map</span>
                            <span className="text-sm text-text-secondary">Map will load after page renders</span>
                        </div>
                    </div>
                )}

                {/* Map Controls Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-1000">
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="w-11 h-11 bg-white rounded-lg shadow-md flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary-light transition-colors disabled:opacity-50"
                        title="Use my location"
                        aria-label="Use my location"
                    >
                        {isLocating ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">my_location</span>
                        )}
                    </button>

                    {location && (
                        <button
                            onClick={handleClearLocation}
                            className="w-11 h-11 bg-white rounded-lg shadow-md flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                            title="Clear location"
                            aria-label="Clear location"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    )}
                </div>

                {/* Map Hint Overlay */}
                {!location && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs text-text-secondary font-medium z-1000">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">touch_app</span>
                        Click anywhere on the map to place a pin
                    </div>
                )}
            </div>

            {/* Location Details */}
            {location && (() => {
                const loc = location; // Capture location in a local variable for TypeScript narrowing
                return (
                    <div className="mt-4 p-4 bg-primary-light rounded-xl border border-primary/20">
                        <div className="flex items-start gap-3">
                            <div className="size-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-white text-[20px]">location_on</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-primary mb-1">Location Pinned</p>
                                <p className="text-xs text-text-secondary break-all">
                                    {loc.address || `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`}
                                </p>
                                <p className="text-xs text-text-secondary/70 mt-1">
                                    Coordinates: {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 text-accent-green">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                <span className="text-xs font-medium">Set</span>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Quick Location Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-secondary shrink-0">Quick select:</span>
                {[
                    { name: 'Manama', lat: 26.2285, lng: 50.5860 },
                    { name: 'Muharraq', lat: 26.2572, lng: 50.6119 },
                    { name: 'Riffa', lat: 26.1300, lng: 50.5550 },
                    { name: 'Airport', lat: 26.2708, lng: 50.6336 },
                ].map((place) => (
                    <button
                        key={place.name}
                        onClick={() => handleLocationSelect(place.lat, place.lng)}
                        className="text-xs px-3 py-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-primary hover:border-primary transition-colors min-h-9"
                    >
                        {place.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

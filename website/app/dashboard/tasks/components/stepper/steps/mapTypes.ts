// Shared types for MapComponent and Step5Location

export interface LocationData {
    lat: number;
    lng: number;
    address?: string;
}

export interface MapComponentProps {
    center: { lat: number; lng: number };
    zoom: number;
    location: LocationData | null;
    onLocationSelect: (lat: number, lng: number) => void | Promise<void>;
}

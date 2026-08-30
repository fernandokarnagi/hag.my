import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin } from 'lucide-react';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function LocationMarker({ position, onClick }: { position: [number, number] | null; onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);

  const parseCoordinates = (val: string): [number, number] | null => {
    if (!val) return null;
    const parts = val.split(',').map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  const defaultPosition: [number, number] = parseCoordinates(value) || [5.9804, 116.0735];

  function handleMapClick(lat: number, lng: number) {
    const rounded = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    setPosition([lat, lng]);
    onChange(rounded);
  }

  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field flex-1"
          placeholder="lat,long"
        />
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="btn btn-secondary btn-md px-3"
          title="Pick from map"
        >
          <MapPin className="h-4 w-4" />
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={() => setShowMap(false)} />
          <div className="relative w-full max-w-2xl animate-scale-in">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text">Select Location</h2>
                <button onClick={() => setShowMap(false)} className="text-text-muted hover:text-text">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-[400px]">
                <MapContainer
                  center={defaultPosition}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position || defaultPosition} onClick={handleMapClick} />
                </MapContainer>
              </div>
              <div className="p-4 border-t border-border">
                <p className="text-sm text-text-secondary">
                  Click anywhere on the map to select a location. Selected: <span className="font-mono text-text">{value || 'Not selected'}</span>
                </p>
                <div className="flex justify-end gap-3 mt-3">
                  <button onClick={() => setShowMap(false)} className="btn btn-secondary btn-md">Cancel</button>
                  <button onClick={() => setShowMap(false)} className="btn btn-primary btn-md">Confirm</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

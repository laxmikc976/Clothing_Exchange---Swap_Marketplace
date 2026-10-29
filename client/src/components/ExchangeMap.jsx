import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, ShieldCheck } from 'lucide-react';

// Recommended Safe Exchange Zones
export const SAFE_EXCHANGE_HUBS = [
  {
    name: 'Central Metro Station - Exit 2',
    address: 'Near Customer Service & CCTV Security Zone',
    lat: 17.3312,
    lng: 76.8365,
    type: 'safe-spot'
  },
  {
    name: 'City Center Mall - Main Plaza',
    address: 'Ground Floor Information Desk / Public Fountain',
    lat: 17.3297,
    lng: 76.8343,
    type: 'safe-spot'
  },
  {
    name: 'Central Public Library Hub',
    address: 'Front Courtyard with Public Seating & Daytime Security',
    lat: 17.3245,
    lng: 76.8410,
    type: 'safe-spot'
  },
  {
    name: 'University Campus Gate 1',
    address: 'Visitor Parking / Security Guard Checkpoint',
    lat: 17.3380,
    lng: 76.8290,
    type: 'safe-spot'
  }
];

const ExchangeMap = ({
  lat = 17.3297,
  lng = 76.8343,
  address = 'Central Mall Public Plaza',
  isEditable = false,
  onLocationSelect = null,
  height = '320px'
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentCoords, setCurrentCoords] = useState({ lat: lat || 17.3297, lng: lng || 76.8343 });
  const [currentAddress, setCurrentAddress] = useState(address || 'Central Exchange Hub');
  const [isLocating, setIsLocating] = useState(false);

  // Custom pulsed SVG marker
  const createCustomIcon = (label = 'Meetup Spot') => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 2px;
          ">
            <span>📍 ${label}</span>
          </div>
          <div style="
            width: 24px;
            height: 24px;
            background: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3), 0 4px 10px rgba(0,0,0,0.5);
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if map instance already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = currentCoords.lat || 17.3297;
    const initialLng = currentCoords.lng || 76.8343;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // OpenStreetMap dark / crisp tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initial marker
    const marker = L.marker([initialLat, initialLng], {
      icon: createCustomIcon(currentAddress.slice(0, 18)),
      draggable: isEditable
    }).addTo(map);

    markerRef.current = marker;

    if (isEditable) {
      // Map click handler to move pin
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng, `Custom Pinned Spot (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      });

      // Marker drag handler
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateLocation(pos.lat, pos.lng, `Custom Pinned Spot (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
      });
    }

    // Force map re-render on resize
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateLocation = (newLat, newLng, newAddress) => {
    setCurrentCoords({ lat: newLat, lng: newLng });
    if (newAddress) setCurrentAddress(newAddress);

    if (markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      markerRef.current.setIcon(createCustomIcon((newAddress || 'Selected Spot').slice(0, 18)));
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([newLat, newLng]);
    }

    if (onLocationSelect) {
      onLocationSelect({
        lat: Number(newLat.toFixed(5)),
        lng: Number(newLng.toFixed(5)),
        address: newAddress || currentAddress
      });
    }
  };

  // Locate User GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        updateLocation(latitude, longitude, 'My Current Vicinity (Pinned)');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed', err);
        alert('Could not retrieve current location. Using default meetup spot.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-slate-900 group">
        <div 
          ref={mapContainerRef} 
          style={{ height, width: '100%' }} 
          className="z-0"
        />

        {/* Floating Controls Over Map */}
        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
          {isEditable && (
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="bg-black/80 hover:bg-black text-white p-2.5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg transition-transform hover:scale-105 flex items-center space-x-1.5 text-xs font-semibold"
              title="Locate my position"
            >
              <Navigation size={14} className={`text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
            </button>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/90 hover:bg-white text-gray-900 px-2.5 py-1.5 rounded-xl shadow-lg text-xs font-bold flex items-center space-x-1 border border-gray-300 transition-colors"
          >
            <Compass size={14} className="text-blue-600" />
            <span>Open in Maps</span>
          </a>
        </div>

        {/* Floating Location Badge */}
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-xs flex items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-2 truncate">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <MapPin size={16} />
            </div>
            <div className="truncate">
              <p className="font-bold text-white truncate">{currentAddress}</p>
              <p className="text-[10px] text-gray-400">Coordinates: {currentCoords.lat?.toFixed(4)}, {currentCoords.lng?.toFixed(4)}</p>
            </div>
          </div>
          {isEditable && (
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
              Click map to repin
            </span>
          )}
        </div>
      </div>

      {/* Recommended Safe Exchange Hubs (Only in editable mode) */}
      {isEditable && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300 flex items-center">
              <ShieldCheck size={14} className="text-emerald-400 mr-1.5" />
              Recommended Verified Safe Exchange Spots:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAFE_EXCHANGE_HUBS.map((hub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateLocation(hub.lat, hub.lng, hub.name)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  currentAddress === hub.name
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="font-bold text-white flex items-center space-x-1">
                  <span>🏢</span>
                  <span className="truncate">{hub.name}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{hub.address}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeMap;

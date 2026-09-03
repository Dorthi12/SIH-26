import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation, X, Check, Loader2 } from "lucide-react";

// Fix default leaflet marker icon issue in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export interface SelectedLocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: SelectedLocationData) => void;
  initialLocation?: SelectedLocationData | null;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const DEFAULT_CENTER: [number, number] = [30.7333, 76.7794]; // Default Chandigarh / Punjab region

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [pinnedCoords, setPinnedCoords] = useState<[number, number]>(
    initialLocation
      ? [initialLocation.latitude, initialLocation.longitude]
      : DEFAULT_CENTER,
  );
  const [locationName, setLocationName] = useState(
    initialLocation?.name || "",
  );

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: pinnedCoords,
        zoom: initialLocation ? 13 : 9,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(pinnedCoords, { draggable: true }).addTo(map);
      markerInstanceRef.current = marker;
      mapInstanceRef.current = map;

      // Click on map to place pin
      map.on("click", (e: L.LeafletMouseEvent) => {
        const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng];
        updatePin(newCoords, true);
      });

      // Drag pin end
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        const newCoords: [number, number] = [position.lat, position.lng];
        updatePin(newCoords, true);
      });

      // Reverse geocode initial position if name is empty
      if (!locationName) {
        reverseGeocode(pinnedCoords[0], pinnedCoords[1]);
      }

      // Invalidate size after modal animation
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      // Cleanup on close
      if (!isOpen && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const updatePin = (
    coords: [number, number],
    fetchAddress: boolean = true,
  ) => {
    setPinnedCoords(coords);
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng(coords);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(coords);
    }
    if (fetchAddress) {
      reverseGeocode(coords[0], coords[1]);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
        {
          headers: {
            "User-Agent": "AgrisenseApp/1.0",
          },
        },
      );
      const data = await res.json();
      if (data && data.address) {
        const address = data.address;
        const nameParts = [
          address.suburb || address.village || address.town || address.city_district || address.city || address.county,
          address.state_district || address.state,
        ].filter(Boolean);
        const name = nameParts.length > 0 ? nameParts.join(", ") : data.display_name.split(",").slice(0, 2).join(",");
        setLocationName(name || "Selected Pin Location");
      } else {
        setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setLocationName(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&countrycodes=in&limit=5`,
        {
          headers: {
            "User-Agent": "AgrisenseApp/1.0",
          },
        },
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Location search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const coords: [number, number] = [lat, lon];
    const nameParts = result.display_name.split(",");
    const name = nameParts.slice(0, 2).join(",").trim();

    setLocationName(name);
    setSearchResults([]);
    setSearchQuery("");
    updatePin(coords, false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(13);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        updatePin(coords, true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(14);
        }
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to retrieve your location. Please select on the map.");
        setIsLocating(false);
      },
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      name: locationName || "Selected Location",
      latitude: pinnedCoords[0],
      longitude: pinnedCoords[1],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-ivory-300 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ivory-200 px-6 py-4 bg-ivory-50">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-forest" />
            <h3 className="font-bold text-charcoal text-base">Select Pin Location</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-charcoal-muted hover:bg-ivory-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
          {/* Search bar & Current Location */}
          <div className="flex flex-col sm:flex-row gap-2 relative z-10">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search village, city, district..."
                className="w-full rounded-2xl border border-ivory-300 bg-ivory-50 pl-10 pr-10 py-2.5 text-sm text-charcoal placeholder-charcoal-muted focus:border-forest focus:ring-2 focus:ring-forest/15 outline-none transition-all"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-charcoal-muted" />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-forest" />
              )}
            </form>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-forest/30 bg-forest/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-forest hover:bg-forest/10 transition-colors disabled:opacity-50"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span>Locate Me</span>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="rounded-2xl border border-ivory-300 bg-white shadow-lg p-2 space-y-1 z-20">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => selectSearchResult(result)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-charcoal hover:bg-forest/5 rounded-xl transition-colors truncate flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 text-forest/70 shrink-0" />
                  <span className="truncate">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Interactive Map View */}
          <div className="relative rounded-2xl overflow-hidden border border-ivory-300 h-72 sm:h-80 w-full shadow-inner">
            <div ref={mapContainerRef} className="h-full w-full z-0" />
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-ivory-200 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-charcoal shadow-sm flex items-center gap-1.5">
              <span>Click or drag pin to fine-tune position</span>
            </div>
          </div>

          {/* Selected Location Pill */}
          <div className="rounded-2xl border border-ivory-200 bg-ivory-50 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
                {isGeocoding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4.5 w-4.5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold tracking-widest text-charcoal-muted">
                  Pinned Location
                </p>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Enter location name..."
                  className="text-sm font-semibold text-charcoal bg-transparent outline-none w-full border-b border-dashed border-ivory-300 focus:border-forest py-0.5"
                />
              </div>
            </div>
            <span className="text-[10px] font-mono text-charcoal-muted shrink-0 hidden sm:inline">
              {pinnedCoords[0].toFixed(3)}, {pinnedCoords[1].toFixed(3)}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-ivory-200 px-6 py-4 bg-ivory-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-charcoal-muted hover:bg-ivory-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-600 transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Confirm Pin Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};

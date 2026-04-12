import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Navigation, ExternalLink, Globe } from 'lucide-react';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyD7_ibpCTgMRShrNQJbnZyY1KaWhrRrT4g";

const LocationSelector = ({ onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.length < 3) {
      setResults([]);
      return;
    }

    // Dynamic Script Loading for Google Maps SDK
    if (GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'your_api_key_here' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        let resultsFound = false;

        if (GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'your_api_key_here' && window.google) {
          try {
            // Modern Google Maps Places API (New)
            const { AutocompleteSuggestion } = await window.google.maps.importLibrary("places");
            const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: search,
            });

            if (suggestions && suggestions.length > 0) {
              setResults(suggestions.map(s => ({
                id: s.placePrediction.placeId,
                name: s.placePrediction.mainText.text,
                address: s.placePrediction.text.text,
                source: 'google'
              })));
              resultsFound = true;
            }
          } catch (googleError) {
            console.warn('Google Places API (New) failed, falling back to OSM:', googleError.message);
            // Fall through to OSM fallback
          }
        }

        if (!resultsFound) {
          // Fallback to Nominatim (OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&addressdetails=1&limit=5`);
          const data = await response.json();
          setResults(data.map(item => ({
            id: item.place_id,
            name: item.display_name.split(',')[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            source: 'osm'
          })));
        }
      } catch (error) {
        console.error('All location search providers failed:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSelect = async (result) => {
    if (result.source === 'google') {
      // Deep fetch details if needed, but for simplicity we use the prediction
      onSelect({
        name: result.name,
        address: result.address,
        google_place_id: result.id
      });
    } else {
      onSelect({
        name: result.name,
        address: result.address,
        lat: result.lat,
        lng: result.lng
      });
    }
    onClose();
  };

  return (
    <div className="w-96 bg-white rounded-[28px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.4)] border border-border-light overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-bg-secondary to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary">Set Location</h3>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Across the globe</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-text-tertiary hover:bg-bg-secondary rounded-xl transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="p-4">
        <div className="relative mb-4 group">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-brand-primary animate-pulse' : 'text-text-tertiary'}`} />
          <input
            autoFocus
            className="w-full h-12 bg-bg-secondary border-none rounded-2xl pl-12 pr-4 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all placeholder:text-text-tertiary/60"
            placeholder="Search city, landmark, or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {results.map(result => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-4 p-4 hover:bg-bg-secondary rounded-2xl transition-all group text-left border border-transparent hover:border-border-light"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-text-tertiary border border-border-light group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all shrink-0">
                <Navigation size={18} className="group-hover:rotate-45 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-text-primary truncate mb-0.5">{result.name}</p>
                <p className="text-[10px] font-medium text-text-tertiary line-clamp-2 leading-relaxed">{result.address}</p>
              </div>
            </button>
          ))}

          {loading && results.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Scanning map data...</p>
            </div>
          )}

          {!search && (
            <div className="py-20 text-center opacity-30">
              <Globe size={48} className="mx-auto mb-4 text-text-tertiary" />
              <p className="text-[10px] font-black uppercase tracking-widest">Enter a destination to begin</p>
            </div>
          )}

          {search && results.length === 0 && !loading && (
            <div className="py-20 text-center opacity-40">
              <p className="text-sm font-bold text-text-primary mb-1">No locations found</p>
              <p className="text-[10px] font-black uppercase tracking-widest">Try refining your search terms</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-bg-secondary/50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary">Powered by {GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'your_api_key_here' ? 'Google Cloud' : 'OpenStreetMap'}</span>
        <ExternalLink size={12} className="text-text-tertiary" />
      </div>
    </div>
  );
};

export default LocationSelector;

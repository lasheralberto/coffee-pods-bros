import React, { useState } from 'react';
import { MapPin, Navigation, X, Search, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapParams } from '../../services/mapsMcpServer';

interface MapCoffeeExplorerProps {
  initialLocation?: string;
  initialParams?: MapParams;
  embedded?: boolean;
  onClose?: () => void;
}

const getMapLabel = (params: MapParams) => {
  if (params.origin && params.destination) {
    return `Directions: ${params.origin} to ${params.destination}`;
  }
  if (typeof params.latitude === 'number' && typeof params.longitude === 'number') {
    return `Origin: ${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)}`;
  }
  return `Location: ${params.location || 'Coffee'}`;
};

export default function MapCoffeeExplorer({
  initialLocation = 'Coffee shop',
  initialParams,
  embedded = false,
  onClose,
}: MapCoffeeExplorerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapParams, setMapParams] = useState<MapParams>(initialParams ?? { location: initialLocation });
  const [searchValue, setSearchValue] = useState('');
  const [isFlying, setIsFlying] = useState(false);
  const [targetLocation, setTargetLocation] = useState('');

  const triggerFlyTo = (params: MapParams) => {
    const targetName = params.location
      || params.destination
      || (typeof params.latitude === 'number' && typeof params.longitude === 'number'
        ? `${params.latitude.toFixed(4)}, ${params.longitude.toFixed(4)}`
        : 'Unknown Location');
    setTargetLocation(targetName);
    setIsFlying(true);
    if (!embedded) setIsOpen(true);
    
    // Simulate flight time and map loading
    setTimeout(() => {
      setMapParams(params);
      // Wait a bit more for the iframe to load the new location before fading out
      setTimeout(() => {
        setIsFlying(false);
      }, 1000);
    }, 1500);
  };

  const handleMapQuery = (params: MapParams) => {
    triggerFlyTo(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    triggerFlyTo({ location: searchValue });
    setSearchValue('');
  };

  const getMapUrl = () => {
    if (mapParams.origin && mapParams.destination) {
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(mapParams.origin)}&daddr=${encodeURIComponent(mapParams.destination)}&t=k&z=18&output=embed`;
    }
    if (typeof mapParams.latitude === 'number' && typeof mapParams.longitude === 'number') {
      return `https://maps.google.com/maps?q=${mapParams.latitude},${mapParams.longitude}&t=k&z=8&output=embed`;
    }
    const loc = mapParams.location || 'Coffee';
    return `https://maps.google.com/maps?q=${encodeURIComponent(loc)}&t=k&z=18&output=embed`;
  };

  const mapShell = (
    <div className="w-full overflow-hidden rounded-2xl border border-chestnut-100 bg-surface shadow-lg">
      <div className="flex items-center justify-between gap-3 border-b border-chestnut-100 bg-cream px-4 py-3">
        <div className="flex min-w-0 items-center gap-3 text-espresso">
          <Navigation size={18} />
          <h2 className="truncate text-sm font-semibold sm:text-base">
            {getMapLabel(mapParams)}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface hover:text-primary shrink-0"
            aria-label="Close map"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="relative bg-stone-50">
        {!embedded && (
          <form onSubmit={handleSearch} className="border-b border-chestnut-100 bg-page px-4 py-3">
            <div className="relative flex items-center overflow-hidden rounded-2xl border border-chestnut-100 bg-surface">
              <div className="absolute left-4 text-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for another coffee location..."
                className="w-full bg-transparent py-3 pl-12 pr-32 text-sm text-primary outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={!searchValue.trim()}
                className="absolute right-2 top-2 bottom-2 inline-flex items-center gap-2 rounded-xl bg-espresso px-4 text-sm font-medium text-cream transition-colors hover:bg-espresso/90 disabled:opacity-50"
              >
                <Compass size={16} />
                <span>Fly To</span>
              </button>
            </div>
          </form>
        )}

        <div className="relative h-[320px] w-full overflow-hidden sm:h-[380px]">
          <iframe
            title="Google Maps View"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={getMapUrl()}
            className="absolute inset-0"
          ></iframe>

          <AnimatePresence>
            {isFlying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-espresso/95"
              >
                <motion.div
                  animate={{ scale: [1, 6, 14], opacity: [1, 0.75, 0], rotate: [0, 35, 70] }}
                  transition={{ duration: 1.6, ease: 'easeIn' }}
                  className="absolute h-44 w-44 rounded-full border-4 border-gold-400/30"
                >
                  <div className="absolute inset-4 rounded-full border-2 border-gold-300/30" />
                </motion.div>

                <motion.div
                  initial={{ y: 16, opacity: 0, scale: 0.92 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -16, opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.45 }}
                  className="relative z-20 flex flex-col items-center gap-4 px-6 text-center"
                >
                  <Compass className="animate-spin text-gold-300" style={{ animationDuration: '3s' }} size={52} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.28em] text-gold-200/80">
                      Initiating Flight To
                    </div>
                    <div className="mt-2 max-w-xl truncate text-2xl font-semibold text-cream sm:text-3xl">
                      {targetLocation}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-page px-4 py-3 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.45)]"></span>
         
          </div>
 
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return mapShell;
  }

  return (
    <div className="p-4 w-full max-w-xl mx-auto">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full shadow-2xl rounded-2xl overflow-hidden group">
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors">
          <Search size={22} />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search for a coffee location (e.g., 'Blue Bottle Tokyo')..."
          className="w-full py-5 pl-14 pr-36 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-600/50 focus:bg-zinc-900 transition-all text-lg placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!searchValue.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-amber-700 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-700 transition-colors font-medium flex items-center gap-2"
        >
          <Compass size={18} />
          <span>Fly To</span>
        </button>
      </form>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-6xl"
          >
            <MapCoffeeExplorer
              initialLocation={initialLocation}
              initialParams={mapParams}
              embedded
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

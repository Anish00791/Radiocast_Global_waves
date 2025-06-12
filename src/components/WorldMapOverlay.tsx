
import React from "react";
import { MapPin, Navigation, AlertCircle } from "lucide-react";

interface WorldMapOverlayProps {
  selectionMode: boolean;
  noStationsFound?: boolean;
  selectedLocation?: [number, number] | null;
  className?: string;
}

const WorldMapOverlay: React.FC<WorldMapOverlayProps> = ({
  selectionMode,
  noStationsFound = false,
  selectedLocation,
  className = ''
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 flex items-center justify-center z-10 ${className}`}>
      {selectionMode && (
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border animate-pulse">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <p className="font-medium">Click anywhere on the map to select a location</p>
          </div>
          <p className="text-muted-foreground text-sm mt-1">We'll find radio stations near your selection</p>
        </div>
      )}

      {noStationsFound && selectedLocation && (
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">No radio stations found at this location</p>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Try selecting a different area or search by country name</p>
        </div>
      )}

      {selectedLocation && !selectionMode && !noStationsFound && (
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-border">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">
              {selectedLocation[0].toFixed(2)}, {selectedLocation[1].toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMapOverlay;

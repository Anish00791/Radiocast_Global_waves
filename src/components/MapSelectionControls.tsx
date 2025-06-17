import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, X } from 'lucide-react';

interface MapSelectionControlsProps {
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  onClearSelection: () => void;
  className?: string;
}

const MapSelectionControls: React.FC<MapSelectionControlsProps> = ({
  selectionMode,
  onToggleSelectionMode,
  onClearSelection,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={selectionMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleSelectionMode}
        className="flex items-center gap-2"
        title={selectionMode ? "Cancel selection" : "Select location on map"}
      >
        {selectionMode ? (
          <>
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Select on Map</span>
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
        className="flex items-center gap-2"
        title="Clear current selection"
      >
        <LocateFixed className="h-4 w-4" />
        <span className="hidden sm:inline">Clear</span>
      </Button>
    </div>
  );
};

export default MapSelectionControls;

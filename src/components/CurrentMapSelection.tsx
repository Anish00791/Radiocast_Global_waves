
import React from 'react';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CurrentMapSelectionProps {
  latitude: number;
  longitude: number;
  name?: string;
  isLoading?: boolean;
  className?: string;
}

const CurrentMapSelection: React.FC<CurrentMapSelectionProps> = ({
  latitude,
  longitude,
  name,
  isLoading = false,
  className = ''
}) => {
  // Format coordinates to be more readable
  const formattedLatitude = latitude.toFixed(4);
  const formattedLongitude = longitude.toFixed(4);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="flex items-center gap-1 py-1">
        <MapPin className="h-3 w-3" />
        <span>
          {isLoading ? (
            "Searching..."
          ) : (
            <>
              {name ? `${name} (${formattedLatitude}, ${formattedLongitude})` : 
                `${formattedLatitude}, ${formattedLongitude}`}
            </>
          )}
        </span>
      </Badge>
    </div>
  );
};

export default CurrentMapSelection;

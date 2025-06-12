import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { MapViewStation } from '@/lib/types';
import { useTheme } from 'next-themes';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FullscreenIcon, MinimizeIcon, ZoomInIcon, ZoomOutIcon, MapPinIcon } from 'lucide-react';
import eslintPluginImport from "eslint-plugin-import";

// MapTiler API key
const MAPTILER_KEY = 'kgWApPiL4ozwBKqtyt1B';

interface MapboxViewProps {
  stations?: MapViewStation[];
  className?: string;
}

const MapboxView: React.FC<MapboxViewProps> = ({ stations = [], className = '' }): JSX.Element => {
  const { theme } = useTheme();
  const [selectedStation, setSelectedStation] = useState<MapViewStation | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [zoom, setZoom] = useState<[number]>([1.5]);
  const { play } = usePlayer();
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<{ [key: string]: maplibregl.Marker }>({});

  // Toggle fullscreen mode
  const toggleFullScreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: theme === 'dark'
        ? `https://api.maptiler.com/maps/streets-dark/style.json?key=${MAPTILER_KEY}`
        : `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: center,
      zoom: zoom[0]
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('zoomend', () => {
      if (map.current) {
        setZoom([map.current.getZoom()]);
      }
    });

    map.current.on('moveend', () => {
      if (map.current) {
        const center = map.current.getCenter();
        setCenter([center.lng, center.lat]);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [theme, mapContainer, center, zoom]);

  // Move this up
  const handleStationClick = (station: MapViewStation): void => {
    setSelectedStation(station);

    if (map.current) {
      map.current.flyTo({
        center: station.coordinates,
        zoom: Math.max(zoom[0], 4)
      });
    }
    
    if (play && station.url) {
      const radioStation = {
        id: station.id,
        name: station.name,
        url: station.url,
        country: station.country,
        language: 'Unknown',
        genre: station.genre,
        favicon: station.favicon || '',
      };
      
      play(radioStation);
      
      toast({
        title: `Playing ${station.name}`,
        description: `${station.country} • ${station.genre.join(', ')}`,
      });
    }
  };

  // Then the useEffect
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Add new markers
    stations.forEach(station => {
      const el = document.createElement('div');
      el.className = 'station-marker';
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = theme === 'dark' ? '#ffffff' : '#000000';
      el.style.opacity = selectedStation?.id === station.id ? '1' : '0.7';
      el.style.transform = selectedStation?.id === station.id ? 'scale(1.8)' : 'scale(1)';
      el.style.transition = 'all 0.2s ease';
      el.style.cursor = 'pointer';
      el.style.boxShadow = selectedStation?.id === station.id
        ? `0 0 12px 4px ${theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}`
        : 'none';

      const marker = new maplibregl.Marker(el)
        .setLngLat(station.coordinates)
        .addTo(map.current!);

      el.addEventListener('click', () => handleStationClick(station));
      markers.current[station.id] = marker;
    });
  }, [stations, selectedStation, theme, handleStationClick]);

  // Manual zoom controls
  const handleZoomIn = (): void => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = (): void => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Fixed position info card for selected station */}
      {selectedStation && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 w-80">
          <Card className="p-4 bg-background/90 backdrop-blur-md shadow-lg border border-primary/20">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {selectedStation.favicon && (
                  <img 
                    src={selectedStation.favicon} 
                    alt={selectedStation.name} 
                    className="w-8 h-8 rounded-full"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = "/placeholder-favicon.png";
                    }}
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedStation.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStation.country}</p>
                </div>
              </div>
              <p className="text-xs">{selectedStation.genre.join(', ')}</p>
              <div className="flex gap-2 mt-1">
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleStationClick(selectedStation)}
                >
                  Play Station
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-1/3" 
                  onClick={() => setSelectedStation(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Custom controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <Button variant="secondary" size="icon" onClick={handleZoomIn} className="bg-background/80 backdrop-blur-md">
          <ZoomInIcon className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={handleZoomOut} className="bg-background/80 backdrop-blur-md">
          <ZoomOutIcon className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" onClick={toggleFullScreen} className="bg-background/80 backdrop-blur-md">
          {isFullScreen ? (
            <MinimizeIcon className="h-4 w-4" />
          ) : (
            <FullscreenIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Station selection info */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="px-3 py-2 bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-primary" />
              <span className="text-sm">
                {selectedStation.coordinates[1].toFixed(4)}, {selectedStation.coordinates[0].toFixed(4)}
              </span>
            </div>
          </Card>
        </div>
      )}
      
      {/* Station count display */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="px-3 py-2 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            <span className="text-sm">{stations.length} stations</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapboxView;
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from './ui/card';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { FullscreenIcon, MinimizeIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import { RadioStation } from '../lib/types';

interface WorldMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  stations?: RadioStation[];
  onStationSelect?: (station: RadioStation) => void;
}

const WorldMap = ({ onLocationSelect, stations = [], onStationSelect }: WorldMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Manual zoom controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize the map
      const map = L.map('map', {
        center: [20, 0], // Center on the world map
        zoom: 3, // More zoomed out view
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180]
        ]
      });

      // Add MapTiler tiles with API key
      const key = 'kgWApPiL4ozwBKqtyt1B';
      
      // Set map style based on theme
      const mapStyle = theme === 'dark' ? 
        'https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=' : 
        'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=';
      
      L.tileLayer(`${mapStyle}${key}`, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
        crossOrigin: true
      }).addTo(map);

      // Create a layer group for markers
      markersRef.current = L.layerGroup().addTo(map);

      // Add click handler
      map.on('click', (e) => {
        onLocationSelect?.(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
    }

    // Update map style based on theme
    if (mapRef.current) {
      const key = 'kgWApPiL4ozwBKqtyt1B';
      
      // Instead of trying to get layers, we'll remove all tile layers and add a new one
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer);
        }
      });
      
      const mapStyle = theme === 'dark' ? 
        'https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=' : 
        'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=';
      
      L.tileLayer(`${mapStyle}${key}`, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
        crossOrigin: true
      }).addTo(mapRef.current);
    }

    // Update markers when stations change
    if (markersRef.current && stations.length > 0) {
      markersRef.current.clearLayers();

      // Add individual markers instead of using clusters
      stations.forEach(station => {
        if (station.coordinates && station.coordinates.length === 2) {
          // Create a unique ID for this station's marker
          const markerId = `station-${station.id.replace(/[^a-zA-Z0-9]/g, '')}`;

          // Create custom marker icon
          const icon = L.divIcon({
            html: `<div class="station-marker ${theme === 'dark' ? 'bg-white' : 'bg-black'}" style="width:8px;height:8px;border-radius:50%"></div>`,
            className: 'custom-station-marker',
            iconSize: [8, 8]
          });
          
          const marker = L.marker([station.coordinates[0], station.coordinates[1]], { icon })
            .bindPopup(
              `<div class="p-2 leaflet-popup-custom ${theme === 'dark' ? 'dark-theme' : ''}">
                <h3 class="font-bold text-base">${station.name}</h3>
                ${station.tags ? `<p class="text-sm">${station.tags}</p>` : ''}
                <button id="${markerId}" class="play-button mt-2">Play Station</button>
              </div>`,
              {
                className: theme === 'dark' ? 'dark-popup' : '',
                maxWidth: 300
              }
            );

          // Store click handler reference for cleanup
          const handleStationSelect = () => onStationSelect?.(station);

          // Handle popup open/close events
          marker.on('popupopen', () => {
            const playButton = document.getElementById(markerId);
            if (playButton) {
              // Remove any existing listener first
              playButton.removeEventListener('click', handleStationSelect);
              // Add new listener
              playButton.addEventListener('click', handleStationSelect);
            }
          });

          // Clean up when popup closes
          marker.on('popupclose', () => {
            const playButton = document.getElementById(markerId);
            if (playButton) {
              playButton.removeEventListener('click', handleStationSelect);
            }
          });

          markersRef.current?.addLayer(marker);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stations, onLocationSelect, onStationSelect, theme]);

  return (
    <Card className="w-full h-[400px] overflow-hidden relative" ref={containerRef}>
      <div id="map" className="w-full h-full" />
      
      {/* Custom controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
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
      
      {/* Station count display */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="px-3 py-2 bg-background/80 backdrop-blur-md">
          <span className="text-sm">{stations.length} stations</span>
        </Card>
      </div>
    </Card>
  );
};

export default WorldMap;

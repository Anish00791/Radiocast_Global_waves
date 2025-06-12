
import React, { useEffect, useState, useCallback } from 'react';
import { MapViewStation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { radioStations } from '@/lib/data';
import * as RadioAPI from '@/lib/radioApi';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, MapPin } from 'lucide-react';
import MapboxView from '@/components/MapboxView';
import { Card } from '@/components/ui/card';
import WorldMap from '@/components/WorldMap';

const MapView: React.FC = () => {
  const { toast } = useToast();
  const [mapType, setMapType] = useState<'mapbox' | 'leaflet'>('mapbox');
  
  // Fetch stations data
  const { data: topStations, isLoading: isLoadingTopStations } = useQuery({
    queryKey: ['topStations'],
    queryFn: async () => {
      const stations = await RadioAPI.getTopStations(100);
      return stations;
    }
  });
  
  // Combine local and API stations
  const stations = React.useMemo(() => {
    const combined: MapViewStation[] = [];
    
    // Add local stations with coordinates
    radioStations.forEach(station => {
      if (station.coordinates && station.coordinates.length === 2) {
        combined.push({
          id: station.id,
          name: station.name,
          coordinates: station.coordinates,
          country: station.country,
          genre: station.genre,
          url: station.url,
          favicon: station.favicon
        });
      }
    });
    
    if (topStations) {
      // Only add stations with coordinates
      const apiStationsWithCoordinates = topStations.filter(
        station => station.coordinates && station.coordinates.length === 2
      );
      
      // Add API stations that don't duplicate local stations
      const localIds = new Set(combined.map(s => s.id));
      for (const station of apiStationsWithCoordinates) {
        if (!localIds.has(station.id)) {
          combined.push({
            id: station.id,
            name: station.name,
            coordinates: station.coordinates,
            country: station.country,
            genre: station.genre,
            url: station.url,
            favicon: station.favicon
          });
        }
      }
    }
    
    return combined;
  }, [topStations]);

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Radio Map</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button 
                variant={mapType === 'mapbox' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMapType('mapbox')}
              >
                Mapbox
              </Button>
              <Button 
                variant={mapType === 'leaflet' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMapType('leaflet')}
              >
                Leaflet
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">{stations.length}</span> stations
            </p>
          </div>
        </div>
      </div>
      
      {/* Map Container - adjust for header */}
      <div className="absolute inset-0 pt-16">
        {mapType === 'mapbox' ? (
          <MapboxView stations={stations} />
        ) : (
          <WorldMap 
            stations={stations.map(station => ({
              ...station,
              geo_lat: String(station.coordinates[1]),
              geo_long: String(station.coordinates[0]),
              name: station.name,
              tags: station.genre.join(', ')
            }))}
            onStationSelect={(station) => {
              const mapStation = stations.find(s => s.id === station.id);
              if (mapStation) {
                toast({
                  title: `Selected ${mapStation.name}`,
                  description: `${mapStation.country} • ${mapStation.genre.join(', ')}`,
                });
              }
            }}
          />
        )}
      </div>
      
      {/* Loading overlay */}
      {isLoadingTopStations && (
        <div className="absolute inset-0 pt-16 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-sm font-medium">Loading stations...</p>
          </div>
        </div>
      )}
      
      {/* Map type indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="px-3 py-2 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            {mapType === 'mapbox' ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {mapType === 'mapbox' ? 'Mapbox View' : 'Leaflet View'}
            </span>
          </div>
        </Card>
      </div>
      
      {/* Map token warning - only show in Mapbox mode */}
      {mapType === 'mapbox' && (
        <div className="absolute bottom-16 left-4 z-10">
          <Card className="px-3 py-2 bg-destructive/80 backdrop-blur-md text-destructive-foreground">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">
                Please replace the Mapbox placeholder token with a valid token
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;
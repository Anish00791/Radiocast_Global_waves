import React, { useState, useEffect, useMemo } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Search, MapPin, Radio, Globe } from 'lucide-react';
import { RadioStation } from '@/lib/types';
import { countries } from '@/lib/data';
import { allCities } from '@/lib/cityData';

interface LocationSearchProps {
  stations: RadioStation[];
  onSelect: (coordinates: [number, number] | null, stationId?: string) => void;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ stations, onSelect, className }): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Array<{
    id: string;
    name: string;
    type: 'station' | 'country' | 'city';
    coordinates: [number, number];
    hasRadio?: boolean;
  }>>([]);

  // Create a map of coordinates to determine if a location has radio stations
  const radioStationCoordinates = useMemo(() => {
    const coordinatesMap = new Map<string, boolean>();
    
    stations.forEach(station => {
      if (station.coordinates) {
        // Using a string key since objects can't be used as Map keys
        const key = `${station.coordinates[0]},${station.coordinates[1]}`;
        coordinatesMap.set(key, true);
      }
    });
    
    return coordinatesMap;
  }, [stations]);
  
  // Check if a location has any radio stations nearby (within ~50km)
  const locationHasRadio = (coordinates: [number, number]): boolean => {
    // First check exact matches
    const exactKey = `${coordinates[0]},${coordinates[1]}`;
    if (radioStationCoordinates.has(exactKey)) return true;
    
    // Then check nearby (approximately 0.5 degrees in each direction ~ 50km)
    for (const station of stations) {
      if (station.coordinates) {
        const [stationLat, stationLon] = station.coordinates;
        const [searchLat, searchLon] = coordinates;
        
        // Calculate distance (approximately)
        const latDiff = Math.abs(stationLat - searchLat);
        const lonDiff = Math.abs(stationLon - searchLon);
        
        if (latDiff < 0.5 && lonDiff < 0.5) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Search function that combines stations, countries and cities
  useEffect((): void => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }

    const query = search.toLowerCase();
    let searchResults: Array<{
      id: string;
      name: string;
      type: 'station' | 'country' | 'city';
      coordinates: [number, number];
      hasRadio?: boolean;
    }> = [];
    
    // Max number of results to show
    const MAX_RESULTS = 50;
    let resultsCount = 0;

    // First add stations (highest priority)
    const matchedStations = stations
      .filter(station => 
        station.coordinates && // Only include stations with coordinates
        (station.name.toLowerCase().includes(query) || 
        station.country.toLowerCase().includes(query))
      )
      .map(station => ({
        id: station.id,
        name: `${station.name} (${station.country})`,
        type: 'station' as const,
        coordinates: station.coordinates as [number, number],
        hasRadio: true
      }));
    
    searchResults = [...matchedStations];
    resultsCount += matchedStations.length;

    // If we have room for more results, add matching countries
    if (resultsCount < MAX_RESULTS) {
      const matchedCountries = countries
        .filter(country => 
          country.name.toLowerCase().includes(query) || 
          country.code.toLowerCase() === query
        )
        .map(country => {
          const hasRadio = locationHasRadio(country.coordinates);
          return {
            id: country.code,
            name: country.name,
            type: 'country' as const,
            coordinates: country.coordinates,
            hasRadio
          };
        });
      
      searchResults = [...searchResults, ...matchedCountries];
      resultsCount += matchedCountries.length;
    }
    
    // If we still have room, add matching cities (up to MAX_RESULTS)
    if (resultsCount < MAX_RESULTS) {
      const matchedCities = allCities
        .filter(city => 
          city.name.toLowerCase().includes(query) || 
          city.country.toLowerCase().includes(query)
        )
        .slice(0, MAX_RESULTS - resultsCount)
        .map(city => {
          const hasRadio = locationHasRadio(city.coordinates);
          return {
            id: city.id,
            name: `${city.name}, ${city.country}`,
            type: 'city' as const,
            coordinates: city.coordinates,
            hasRadio
          };
        });
      
      searchResults = [...searchResults, ...matchedCities];
    }

    setResults(searchResults.slice(0, MAX_RESULTS));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stations, locationHasRadio]);

  const handleSelect = (item: typeof results[0]) => {
    if (item.type === 'station') {
      onSelect(item.coordinates, item.id);
    } else {
      onSelect(item.coordinates);
    }
    setOpen(false);
    setSearch('');
  };

  // Group results by type
  const groupedResults = useMemo((): Record<string, typeof results> => {
    const groups: Record<string, typeof results> = {
      stations: [],
      cities: [],
      countries: []
    };
    
    results.forEach(result => {
      if (result.type === 'station') {
        groups.stations.push(result);
      } else if (result.type === 'city') {
        groups.cities.push(result);
      } else if (result.type === 'country') {
        groups.countries.push(result);
      }
    });
    
    return groups;
  }, [results]);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal"
          >
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {search ? search : "Search locations or stations..."}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" align="start">
          <Command>
            <CommandInput 
              placeholder="Search for any location worldwide..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center">
                No locations found
              </CommandEmpty>
              
              {/* Radio Stations */}
              {groupedResults.stations.length > 0 && (
                <CommandGroup heading="Radio Stations">
                  {groupedResults.stations.map(item => (
                    <CommandItem 
                      key={`${item.type}-${item.id}`}
                      value={item.name}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center"
                    >
                      <Radio className="mr-2 h-4 w-4 text-primary" />
                      <span>{item.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Cities */}
              {groupedResults.cities.length > 0 && (
                <CommandGroup heading="Cities">
                  {groupedResults.cities.map(item => (
                    <CommandItem 
                      key={`${item.type}-${item.id}`}
                      value={item.name}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center"
                    >
                      <MapPin className={`mr-2 h-4 w-4 ${item.hasRadio ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{item.name}</span>
                      {item.hasRadio && (
                        <span className="ml-auto text-xs text-primary">
                          Has radio
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {/* Countries */}
              {groupedResults.countries.length > 0 && (
                <CommandGroup heading="Countries">
                  {groupedResults.countries.map(item => (
                    <CommandItem 
                      key={`${item.type}-${item.id}`}
                      value={item.name}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center"
                    >
                      <Globe className={`mr-2 h-4 w-4 ${item.hasRadio ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span>{item.name}</span>
                      {item.hasRadio && (
                        <span className="ml-auto text-xs text-primary">
                          Has radio
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSearch;

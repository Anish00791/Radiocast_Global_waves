import React, { useState, useEffect, useMemo } from "react";
import { radioStations } from "@/lib/data";
import { RadioStation } from "@/lib/types";
import { usePlayer } from "@/contexts/PlayerContext";
import SearchBar from "@/components/SearchBar";
import GenreFilter from "@/components/GenreFilter";
import MoodFilter from "@/components/MoodFilter";
import StationList from "@/components/StationList";
import PlayerControls from "@/components/PlayerControls";
import ThemeToggle from "@/components/ThemeToggle";
import Globe from "@/components/Globe";
import WorldMap from "@/components/WorldMap";
import LocationSearch from "@/components/LocationSearch";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Radio, Sparkles, Globe as GlobeIcon, Music, Database, LocateFixed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as RadioAPI from "@/lib/radioApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import RadioBrowserExplorer from "@/components/RadioBrowserExplorer";

const Index = () => {
  const { favorites } = usePlayer();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [filteredStations, setFilteredStations] = useState<RadioStation[]>(radioStations);
  const [favoriteStations, setFavoriteStations] = useState<RadioStation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  // New states for Radio-Browser API stations
  const [topStations, setTopStations] = useState<RadioStation[]>([]);
  const [recentStations, setRecentStations] = useState<RadioStation[]>([]);
  const [nearbyStations, setNearbyStations] = useState<RadioStation[]>([]);
  const [searchResults, setSearchResults] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState({
    top: true,
    recent: true,
    nearby: false,
    search: false,
  });

  const [activeTab, setActiveTab] = useState('topStations');

  const allAvailableStationsForSearch = useMemo(() => {
    const combined = [
      ...radioStations, // Your local/featured stations
      ...topStations,
      ...recentStations,
      ...nearbyStations, // If a location was selected
      ...searchResults // If a search was performed
    ];
    // Remove duplicates based on id
    return combined.filter((station, index, self) => 
      index === self.findIndex((s) => s.id === station.id)
    );
  }, [radioStations, topStations, recentStations, nearbyStations, searchResults]);

  // Fetch top stations on component mount
  useEffect(() => {
    const fetchTopStations = async () => {
      setIsLoading(prev => ({ ...prev, top: true }));
      try {
        const stations = await RadioAPI.getTopStations(20);
        setTopStations(stations);
      } catch (error) {
        console.error("Error fetching top stations:", error);
        toast({
          title: "Error",
          description: "Could not fetch top stations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, top: false }));
      }
    };

    const fetchRecentStations = async () => {
      setIsLoading(prev => ({ ...prev, recent: true }));
      try {
        const stations = await RadioAPI.getRecentlyPlayedStations(20);
        setRecentStations(stations);
      } catch (error) {
        console.error("Error fetching recent stations:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, recent: false }));
      }
    };

    fetchTopStations();
    fetchRecentStations();
  }, [setIsLoading, setTopStations, setRecentStations, toast]);

  // Filter stations based on search query, genre and mood
  useEffect(() => {
    let filtered = [...radioStations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(query) ||
          station.country.toLowerCase().includes(query) ||
          station.genre.some((g) => g.toLowerCase().includes(query))
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter((station) =>
        station.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    if (selectedMood) {
      filtered = filtered.filter(
        (station) => station.mood?.some((m) => m.toLowerCase() === selectedMood.toLowerCase())
      );
    }

    setFilteredStations(filtered);
  }, [searchQuery, selectedGenre, selectedMood, radioStations, setFilteredStations]);

  // Get favorite stations
  useEffect(() => {
    // Combine favorites from both local data and API results
    const localFavs = radioStations.filter((station) => favorites.includes(station.id));
    const apiFavs = [...topStations, ...recentStations, ...nearbyStations, ...searchResults]
      .filter((station) => favorites.includes(station.id))
      // Remove duplicates
      .filter((station, index, self) => 
        index === self.findIndex((s) => s.id === station.id)
      );
    
    // Combine and remove duplicates
    const allFavs = [...localFavs, ...apiFavs].filter((station, index, self) => 
      index === self.findIndex((s) => s.id === station.id)
    );
    
    setFavoriteStations(allFavs);
  }, [favorites, topStations, recentStations, nearbyStations, searchResults, radioStations, setFavoriteStations]);

  // When location is selected, fetch nearby stations
  useEffect(() => {
    if (selectedLocation) {
      const fetchNearbyStations = async () => {
        setIsLoading(prev => ({ ...prev, nearby: true }));
        try {
          const stations = await RadioAPI.getStationsNearLocation(
            selectedLocation[0], 
            selectedLocation[1],
            15
          );
          setNearbyStations(stations);
          
          if (stations.length > 0) {
            toast({
              title: `${stations.length} stations found near this location`,
              description: "Scroll down to see stations in this area",
            });
          } else {
            toast({
              title: "No radio stations found at this location",
              description: "Try another location or search for stations",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error fetching nearby stations:", error);
        } finally {
          setIsLoading(prev => ({ ...prev, nearby: false }));
        }
      };
      
      fetchNearbyStations();
    }
  }, [selectedLocation, setIsLoading, setNearbyStations, toast]);
  
  // Search for stations when search query changes
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const searchStations = async () => {
        setIsLoading(prev => ({ ...prev, search: true }));
        try {
          const stations = await RadioAPI.searchStations(searchQuery, 20);
          setSearchResults(stations);
        } catch (error) {
          console.error("Error searching stations:", error);
        } finally {
          setIsLoading(prev => ({ ...prev, search: false }));
        }
      };
      
      const timeoutId = setTimeout(() => {
        searchStations();
      }, 500); // Debounce search requests
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, setIsLoading, setSearchResults]);

  // Prepare station data for the globe
  const globeStations = [
    ...radioStations.filter(station => station.coordinates),
    ...topStations.filter(station => station.coordinates),
    ...recentStations.filter(station => station.coordinates),
    ...nearbyStations.filter(station => station.coordinates)
  ]
    // Remove duplicates
    .filter((station, index, self) => 
      index === self.findIndex((s) => s.id === station.id)
    )
    .map(station => ({
      id: station.id,
      name: station.name,
      coordinates: station.coordinates as [number, number]
    }));
    
  // Handle location selection
  const handleLocationSelect = (coordinates: [number, number] | null, stationId?: string) => {
    setSelectedLocation(coordinates);
    setSelectedStationId(stationId || null);
    
    if (stationId) {
      // Find station from all available sources
      const allStations = [
        ...radioStations, 
        ...topStations, 
        ...recentStations, 
        ...nearbyStations,
        ...searchResults
      ];
      
      const station = allStations.find(s => s.id === stationId);
      
      if (station) {
        toast({
          title: "Station Found",
          description: `${station.name} in ${station.country}`,
        });
        
        // Register click with Radio-Browser API
        if (!station.featured) {  // Only for API stations
          RadioAPI.registerStationClick(station.id);
        }
      }
    }
  };

  // Handle station selection on the globe
  const handleStationSelect = (stationId: string) => {
    const allStations = [
      ...radioStations, 
      ...topStations, 
      ...recentStations, 
      ...nearbyStations,
      ...searchResults
    ];
    const station = allStations.find(s => s.id === stationId);
    
    if (station) {
      setSelectedStationId(stationId);
      toast({
        title: "Station Selected",
        description: `${station.name} in ${station.country}`,
      });
      
      // Scroll to the station in the list
      const stationElement = document.getElementById(`station-${stationId}`);
      if (stationElement) {
        stationElement.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Register click with Radio-Browser API
      if (!station.featured) {  // Only for API stations
        RadioAPI.registerStationClick(station.id);
      }
    }
  };

  // Function to handle map location click
  const handleMapClick = (coordinates: [number, number]) => {
    setSelectedLocation(coordinates);
    
    toast({
      title: "Location Selected",
      description: "Finding radio stations in this area...",
    });
  };

  // Get featured stations
  const featuredStations = radioStations.filter((station) => station.featured);

  // Render loading skeleton for station lists
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="relative">
        <Globe 
          className="h-96 w-full" 
          selectedLocation={selectedLocation}
          stations={globeStations}
          onLocationSelect={handleStationSelect}
          onMapClick={handleMapClick}
        />
        <div className="container absolute inset-0 flex flex-col justify-center items-center text-center z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 bg-radio rounded-full opacity-75 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3 w-3 bg-radio-accent rounded-full"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold">Radiocast</h1>
          </div>
          <p className="text-muted-foreground mb-6">Your Gateway to Global Radio</p>
          
          <div className="w-full max-w-lg">
            <div className="flex gap-2 mb-4">
              <SearchBar onSearch={setSearchQuery} className="flex-grow" />
              <ThemeToggle />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <LocationSearch 
                  stations={allAvailableStationsForSearch} 
                  onSelect={handleLocationSelect}
                  className="flex-grow"
                />
              </div>
              
              <GenreFilter
                selectedGenre={selectedGenre}
                onSelectGenre={setSelectedGenre}
              />
            </div>
          </div>
        </div>
        

      </header>
      
      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-10">
          {/* Favorites Section */}
          {favoriteStations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <h2 className="text-2xl font-semibold">Your Favorites</h2>
              </div>
              <StationList stations={favoriteStations} />
            </section>
          )}
          
          {/* Selected Station */}
          {selectedStationId && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Selected Station</h2>
              </div>
              <StationList 
                stations={[
                  ...radioStations,
                  ...topStations,
                  ...recentStations,
                  ...nearbyStations,
                  ...searchResults
                ].filter(station => station.id === selectedStationId)}
              />
            </section>
          )}
          
          {/* Nearby Stations */}
          {selectedLocation && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <GlobeIcon className="h-5 w-5 text-green-500" />
                <h2 className="text-2xl font-semibold">Stations Near Selected Location</h2>
              </div>
              {isLoading.nearby ? renderSkeleton() : (
                nearbyStations.length > 0 ? (
                  <StationList stations={nearbyStations} />
                ) : (
                  <p className="text-muted-foreground">No stations found near this location.</p>
                )
              )}
            </section>
          )}
          
          {/* Radio Browser API Stations */}
          <section>
            <Tabs defaultValue="map">
              <TabsList className="mb-4">
                <TabsTrigger value="explorer" className="flex items-center gap-1">
                  <Database className="h-4 w-4" /> 
                  <span>Radio Browser</span>
                </TabsTrigger>
                <TabsTrigger value="top" className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> 
                  <span>Top Stations</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex items-center gap-1">
                  <Radio className="h-4 w-4" /> 
                  <span>Recently Played</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> 
                  <span>Map View</span>
                </TabsTrigger>
                {searchResults.length > 0 && (
                  <TabsTrigger value="search" className="flex items-center gap-1">
                    <Music className="h-4 w-4" /> 
                    <span>Search Results</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="explorer">
                <RadioBrowserExplorer />
              </TabsContent>
              
              <TabsContent value="top">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-2xl font-semibold">Top Stations Worldwide</h2>
                </div>
                {isLoading.top ? renderSkeleton() : (
                  topStations.length > 0 ? (
                    <StationList stations={topStations} />
                  ) : (
                    <p className="text-muted-foreground">Failed to load top stations.</p>
                  )
                )}
              </TabsContent>
              
              <TabsContent value="recent">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="h-5 w-5 text-blue-500" />
                  <h2 className="text-2xl font-semibold">Recently Played Stations</h2>
                </div>
                {isLoading.recent ? renderSkeleton() : (
                  recentStations.length > 0 ? (
                    <StationList stations={recentStations} />
                  ) : (
                    <p className="text-muted-foreground">Failed to load recently played stations.</p>
                  )
                )}
              </TabsContent>
              
              <TabsContent value="map">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <h2 className="text-2xl font-semibold">Radio Stations Map</h2>
                </div>
                <WorldMap 
                  stations={[
                    ...topStations.map(station => ({
                      ...station,
                      geo_lat: station.coordinates?.[0],
                      geo_long: station.coordinates?.[1]
                    })),
                    ...recentStations.map(station => ({
                      ...station,
                      geo_lat: station.coordinates?.[0],
                      geo_long: station.coordinates?.[1]
                    })),
                    ...nearbyStations.map(station => ({
                      ...station,
                      geo_lat: station.coordinates?.[0],
                      geo_long: station.coordinates?.[1]
                    }))
                  ].filter(station => station.geo_lat && station.geo_long)}
                  onLocationSelect={(lat, lng) => handleLocationSelect([lat, lng])}
                  onStationSelect={(station) => handleStationSelect(station.id)}
                />
              </TabsContent>
              
              {searchResults.length > 0 && (
                <TabsContent value="search">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-5 w-5 text-purple-500" />
                    <h2 className="text-2xl font-semibold">Search Results: {searchQuery}</h2>
                  </div>
                  {isLoading.search ? renderSkeleton() : (
                    <StationList stations={searchResults} />
                  )}
                </TabsContent>
              )}
            </Tabs>
          </section>
          
          {/* Mood Filters */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Music className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Radio Mood</h2>
            </div>
            <MoodFilter
              selectedMood={selectedMood}
              onSelectMood={setSelectedMood}
            />
          </section>

          {/* Featured Stations */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h2 className="text-2xl font-semibold">Featured Stations</h2>
            </div>
            <StationList stations={featuredStations} />
          </section>

          {/* All Stations */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">All Stations</h2>
            </div>
            <StationList stations={filteredStations} />
          </section>
        </div>
      </main>
      
      {/* Fixed Player Controls */}
      <PlayerControls />
    </div>
  );
};

export default Index;

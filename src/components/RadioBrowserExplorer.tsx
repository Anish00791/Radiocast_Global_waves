import React, { useState, useEffect } from "react";
import { 
  getTopStations, 
  getStationsByGenre, 
  searchStations,
  getAllGenres 
} from "@/lib/radioBrowserApi";
import { RadioStation } from "@/lib/types";
import RadioCard from "./RadioCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

const RadioBrowserExplorer: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch top stations on component mount
  useEffect(() => {
    loadTopStations();
    loadGenres();
  }, []);

  const loadTopStations = async () => {
    setIsLoading(true);
    setError(null);
    setActiveGenre(null);
    
    try {
      const topStations = await getTopStations(20);
      setStations(topStations);
    } catch (err) {
      setError("Failed to load top stations. Please try again.");
      console.error("Error loading top stations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const allGenres = await getAllGenres(20);
      setGenres(allGenres);
    } catch (err) {
      console.error("Error loading genres:", err);
    }
  };

  const handleGenreClick = async (genre: string) => {
    setIsLoading(true);
    setError(null);
    setActiveGenre(genre);
    
    try {
      const genreStations = await getStationsByGenre(genre, 20);
      setStations(genreStations);
    } catch (err) {
      setError(`Failed to load ${genre} stations. Please try again.`);
      console.error(`Error loading ${genre} stations:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setActiveGenre(null);
    
    try {
      const searchResults = await searchStations(searchQuery, 20);
      setStations(searchResults);
    } catch (err) {
      setError(`No results found for "${searchQuery}". Please try a different search.`);
      console.error(`Error searching for "${searchQuery}":`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <div>
        <h2 className="text-2xl font-bold mb-4">Radio Browser Explorer</h2>
        <p className="text-muted-foreground mb-4">
          Discover thousands of radio stations from around the world
        </p>
      </div>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          placeholder="Search for stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-0"
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Search
        </Button>
      </form>
      
      {/* Genre filters */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Popular Genres</h3>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <Button 
            variant={activeGenre === null ? "default" : "outline"}
            size="sm"
            onClick={loadTopStations}
          >
            Top Stations
          </Button>
          
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={activeGenre === genre ? "default" : "outline"}
              size="sm"
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Stations grid */}
      {!isLoading && stations.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No stations found. Try a different search.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <RadioCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
};

export default RadioBrowserExplorer; 
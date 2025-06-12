import { RadioStation } from "./types";
import { radioStations } from "./data";
import * as RadioBrowserApi from "./radioBrowserApi";

// Get top stations (combines local featured stations with Radio Browser API top stations)
export async function getTopStations(limit = 20): Promise<RadioStation[]> {
  try {
    // Get top stations from Radio Browser API
    const apiStations = await RadioBrowserApi.getTopStations(limit);
    
    // Combine with our featured local stations
    const featuredStations = radioStations.filter(station => station.featured);
    
    // Combine and remove duplicates (prefer local stations if there's a duplicate)
    const combinedStations = [...featuredStations];
    
    // Only add API stations that don't duplicate IDs we already have
    const existingIds = new Set(combinedStations.map(station => station.id));
    for (const apiStation of apiStations) {
      if (!existingIds.has(apiStation.id)) {
        combinedStations.push(apiStation);
        existingIds.add(apiStation.id);
      }
    }
    
    // Limit to requested number of stations
    return combinedStations.slice(0, limit);
  } catch (error) {
    console.error("Error fetching top stations:", error);
    // Fallback to local stations if API call fails
    return radioStations.filter(station => station.featured).slice(0, limit);
  }
}

// Get recently played stations from Radio Browser API
export async function getRecentlyPlayedStations(limit = 20): Promise<RadioStation[]> {
  try {
    // Use searchStations as a proxy for recently played
    // In a real app, you'd implement a proper endpoint for this
    return await RadioBrowserApi.searchStations("", limit);
  } catch (error) {
    console.error("Error fetching recently played stations:", error);
    return [];
  }
}

// Search stations by name, country, or genre
export async function searchStations(query: string, limit = 20): Promise<RadioStation[]> {
  if (!query) return [];
  
  try {
    // Search in local stations
    const localResults = radioStations.filter(
      station =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.country.toLowerCase().includes(query.toLowerCase()) ||
        station.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
    );
    
    // Search in Radio Browser API
    const apiResults = await RadioBrowserApi.searchStations(query, limit);
    
    // Combine results and remove duplicates (prefer local stations)
    const combinedResults = [...localResults];
    
    // Only add API stations that don't duplicate IDs we already have
    const existingIds = new Set(combinedResults.map(station => station.id));
    for (const apiStation of apiResults) {
      if (!existingIds.has(apiStation.id)) {
        combinedResults.push(apiStation);
        existingIds.add(apiStation.id);
      }
    }
    
    // Limit to requested number of stations
    return combinedResults.slice(0, limit);
  } catch (error) {
    console.error("Error searching stations:", error);
    // Fallback to local search if API call fails
    return radioStations.filter(
      station =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.country.toLowerCase().includes(query.toLowerCase()) ||
        station.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, limit);
  }
}

// Get stations near a location
export async function getStationsNearLocation(
  latitude: number,
  longitude: number,
  limit = 10
): Promise<RadioStation[]> {
  // Find local stations near the coordinates
  const localNearbyStations = radioStations.filter(station => {
    if (!station.coordinates) return false;
    
    const [stationLat, stationLng] = station.coordinates;
    const distance = calculateDistance(latitude, longitude, stationLat, stationLng);
    return distance < 500; // Within 500km
  });
  
  // For Radio Browser API, we don't have direct geo search,
  // so we'll use the country where these coordinates are located
  // This would need to be improved with a reverse geocoding service
  const country = getNearestCountry(latitude, longitude);
  
  if (country) {
    try {
      const apiStations = await RadioBrowserApi.getStationsByCountry(country, limit);
      
      // Combine local and API stations
      const combinedStations = [...localNearbyStations];
      
      // Only add API stations that don't duplicate IDs we already have
      const existingIds = new Set(combinedStations.map(station => station.id));
      for (const apiStation of apiStations) {
        if (!existingIds.has(apiStation.id)) {
          combinedStations.push(apiStation);
          existingIds.add(apiStation.id);
        }
      }
      
      // Limit to requested number of stations
      return combinedStations.slice(0, limit);
    } catch (error) {
      console.error("Error fetching stations near location:", error);
    }
  }
  
  return localNearbyStations.slice(0, limit);
}

// Track station play with Radio Browser API
export async function registerStationClick(stationId: string): Promise<boolean> {
  if (!stationId) return false;
  
  // Only track plays for stations from Radio Browser API (they have UUIDs)
  if (stationId.includes('-')) {
    try {
      return await RadioBrowserApi.trackStationPlay(stationId);
    } catch (error) {
      console.error("Error registering station click:", error);
      return false;
    }
  }
  
  return true; // Always return success for local stations
}

// Additional helper functions for working with stations by different criteria
export async function getStationsByCountry(country: string, limit = 20): Promise<RadioStation[]> {
  try {
    // Use our search function with the country as the query
    return await searchStations(country, limit);
  } catch (error) {
    console.error(`Error fetching stations for country ${country}:`, error);
    return [];
  }
}

export async function getStationsByTag(tag: string, limit = 20): Promise<RadioStation[]> { 
  try {
    // Use RadioBrowserApi directly for tag-based searches
    return await RadioBrowserApi.getStationsByGenre(tag, limit);
  } catch (error) {
    console.error(`Error fetching stations for tag ${tag}:`, error);
    return [];
  }
}

export async function getStationsByLanguage(language: string, limit = 20): Promise<RadioStation[]> { 
  try {
    // Use our search function with the language as the query
    return await searchStations(language, limit);
  } catch (error) {
    console.error(`Error fetching stations for language ${language}:`, error);
    return [];
  }
}

// Helper function to calculate distance between two coordinates (in km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Very simple function to get nearest country (would need proper reverse geocoding in a real app)
function getNearestCountry(lat: number, lng: number): string {
  // This is a very simplified implementation
  // In a real app, you would use a proper reverse geocoding service
  
  // Europe
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) {
    if (lng < 0) return "United Kingdom";
    if (lng < 5) return "France";
    if (lng < 15) return "Germany";
    return "Italy";
  }
  
  // North America
  if (lat > 25 && lat < 50 && lng > -125 && lng < -65) {
    if (lng < -100) return "United States";
    return "United States";
  }
  
  // Default to US if we can't determine
  return "United States";
} 
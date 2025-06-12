import { RadioStation } from './types';

const API_BASE_URL = 'http://localhost:3001/api/radio';

interface RadioBrowserStation {
  stationuuid: string;
  name: string;
  url: string;
  favicon: string;
  tags: string;
  country: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  clickcount: number;
  // ...other fields
}

// Convert RadioBrowser station format to our app's format
function convertToAppFormat(station: RadioBrowserStation): RadioStation {
  // Extract genres from comma-separated tags
  const genres = station.tags 
    ? station.tags.split(',').map(tag => tag.trim())
    : [];
  
  // Determine mood based on tags or other characteristics
  const mood: string[] = [];
  if (station.tags?.toLowerCase().includes('chill')) mood.push('Chill');
  if (station.tags?.toLowerCase().includes('dance')) mood.push('Energetic');
  if (station.bitrate && station.bitrate > 128) mood.push('High Quality');
  if (station.clickcount && station.clickcount > 1000) mood.push('Popular');

  // Estimate coordinates based on country (using dummy values for demo)
  // In a real app, you would use a proper geocoding service or database
  const coordinates: [number, number] = [0, 0]; // Default coordinates

  return {
    id: station.stationuuid,
    name: station.name,
    url: station.url,
    favicon: station.favicon || '/placeholder-favicon.png',
    country: station.country,
    language: station.language || 'Unknown',
    genre: genres,
    mood: mood.length > 0 ? mood : ['Discovery'],
    featured: station.votes > 10, // Consider "featured" if it has many votes
    coordinates: coordinates
  };
}

// Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Helper function to get or set cache
async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  timeout = CACHE_TIMEOUT
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < cached.expiresIn) {
    return cached.data as T;
  }

  const data = await fetcher();
  cache.set(key, {
    data,
    timestamp: now,
    expiresIn: timeout
  });

  return data;
}

// Get top stations
export async function getTopStations(limit = 20): Promise<RadioStation[]> {
  return getCachedData(
    `top:${limit}`,
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/top?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch top stations');
        
        const data: RadioBrowserStation[] = await response.json();
        return data.map(convertToAppFormat);
      } catch (error) {
        console.error('Error fetching top stations:', error);
        return [];
      }
    }
  );
}

// Get stations by genre
export async function getStationsByGenre(genre: string, limit = 20): Promise<RadioStation[]> {
  return getCachedData(
    `genre:${genre}:${limit}`,
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/byGenre?genre=${encodeURIComponent(genre)}&limit=${limit}`);
        if (!response.ok) throw new Error(`Failed to fetch stations for genre: ${genre}`);
        
        const data: RadioBrowserStation[] = await response.json();
        return data.map(convertToAppFormat);
      } catch (error) {
        console.error(`Error fetching stations for genre ${genre}:`, error);
        return [];
      }
    },
    15 * 60 * 1000 // 15 minutes cache for genres
  );
}

// Search stations with debouncing
let searchTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 300;

export async function searchStations(query: string, limit = 20): Promise<RadioStation[]> {
  if (!query.trim()) return [];

  return new Promise((resolve) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      const results = await getCachedData(
        `search:${query}:${limit}`,
        async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
            if (!response.ok) throw new Error(`Failed to search stations for: ${query}`);
            
            const data: RadioBrowserStation[] = await response.json();
            return data.map(convertToAppFormat);
          } catch (error) {
            console.error(`Error searching stations for ${query}:`, error);
            return [];
          }
        },
        10 * 60 * 1000 // 10 minutes cache for search results
      );
      resolve(results);
    }, DEBOUNCE_MS);
  });
}

// Get all available genres
export async function getAllGenres(limit = 50): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/genres?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    
    const data: unknown = await response.json();
    if (Array.isArray(data)) {
      return data.map((item) => typeof item === 'object' && item !== null && 'name' in item ? (item as { name: string }).name : '');
    }
    return [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Track station play
export async function trackStationPlay(stationId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/click/${stationId}`);
    return response.ok;
  } catch (error) {
    console.error(`Error tracking play for station ${stationId}:`, error);
    return false;
  }
}

// Get stations by country
export async function getStationsByCountry(country: string, limit = 20): Promise<RadioStation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(country)}&limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch stations for country: ${country}`);
    
    const data: RadioBrowserStation[] = await response.json();
    // Filter to make sure we only get stations from this country
    const filteredData = data.filter(station => 
      station.country.toLowerCase() === country.toLowerCase()
    );
    
    return filteredData.map(convertToAppFormat);
  } catch (error) {
    console.error(`Error fetching stations for country ${country}:`, error);
    return [];
  }
} 
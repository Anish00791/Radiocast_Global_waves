import { RadioStation } from "@/lib/types";

// URLs of reliable fallback stations that we know work well
const FALLBACK_STATIONS: RadioStation[] = [
  {
    id: "reliable-1",
    name: "Soma FM - Groove Salad",
    country: "USA",
    language: "English",
    genre: ["Ambient", "Electronica"],
    url: "https://ice2.somafm.com/groovesalad-128-mp3",
    favicon: "https://somafm.com/img/groovesalad-400.jpg",
    featured: true,
    tags: ["ambient", "electronica", "chill"],
  },
  {
    id: "reliable-2",
    name: "Radio Paradise",
    country: "USA",
    language: "English",
    genre: ["Eclectic", "Rock", "World"],
    url: "https://stream.radioparadise.com/aac-128",
    favicon: "https://radioparadise.com/favicon-32x32.png",
    featured: true,
    tags: ["eclectic", "indie"],
  },
];

/**
 * Filters out stations that don't have critical properties needed for playback
 * @param stations Array of stations to filter
 * @returns Filtered stations array with only valid entries
 */
export const filterInvalidStations = (stations: RadioStation[]): RadioStation[] => {
  return stations.filter(station => {
    // Station must have an ID, name and URL at minimum
    if (!station.id || !station.name || !station.url) {
      console.log(`Filtering invalid station (missing required fields): ${station.name || 'unknown'}`);
      return false;
    }
    
    // Exclude stations with suspicious URLs (like data: URLs, javascript:, file:, etc.)
    const unsafeUrlPatterns = [
      'javascript:', 'data:', 'file:', 'ftp:', 
      'localhost', '127.0.0.1', '192.168.', '10.', 
      'internal', 'admin', 'phpmyadmin'
    ];
    
    if (unsafeUrlPatterns.some(pattern => station.url.toLowerCase().includes(pattern))) {
      console.log(`Filtering station with unsafe URL: ${station.name} (${station.url})`);
      return false;
    }
    
    // Exclude stations with suspicious names or countries
    const suspiciousStrings = ['test', 'offline', 'error', 'not working', 'invalid'];
    if (suspiciousStrings.some(pattern => 
      station.name.toLowerCase().includes(pattern) || 
      (station.country && station.country.toLowerCase().includes(pattern))
    )) {
      console.log(`Filtering suspicious station name/country: ${station.name} (${station.country || 'unknown'})`);
      return false;
    }
    
    return true;
  });
};

/**
 * Adds fallback stations to ensure users have something that works
 * @param stations The original stations list
 * @returns Original stations plus fallbacks
 */
export const ensureFallbackStations = (stations: RadioStation[]): RadioStation[] => {
  // If we already have stations, just add fallbacks at the end
  if (stations && stations.length > 0) {
    // Only add fallbacks if they don't already exist in the list
    const existingIds = new Set(stations.map(s => s.id));
    const fallbacksToAdd = FALLBACK_STATIONS.filter(fs => !existingIds.has(fs.id));
    
    return [...stations, ...fallbacksToAdd];
  }
  
  // If no stations provided, return just the fallbacks
  return [...FALLBACK_STATIONS];
};

/**
 * Combine station lists, remove duplicates, filter invalid, and ensure fallbacks
 * @param stationLists Multiple arrays of stations to combine
 * @returns Clean, combined list of stations
 */
export const combineAndCleanStations = (...stationLists: RadioStation[][]): RadioStation[] => {
  // Combine all station lists
  const allStations = stationLists.flat();
  
  // Remove duplicates by station ID
  const uniqueStations = allStations.filter((station, index, self) => 
    index === self.findIndex(s => s.id === station.id)
  );
  
  // Filter out invalid stations
  const validStations = filterInvalidStations(uniqueStations);
  
  // Ensure we have fallback stations
  return ensureFallbackStations(validStations);
}; 
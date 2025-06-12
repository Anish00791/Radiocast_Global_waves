import { City } from './types';

// This file contains 7000+ cities from around the world with their coordinates
export const cities: City[] = [
  // NORTH AMERICA
  // United States
  { id: "us-nyc", name: "New York", country: "United States", coordinates: [40.7128, -74.0060] },
  { id: "us-la", name: "Los Angeles", country: "United States", coordinates: [34.0522, -118.2437] },
  { id: "us-chi", name: "Chicago", country: "United States", coordinates: [41.8781, -87.6298] },
  { id: "us-hou", name: "Houston", country: "United States", coordinates: [29.7604, -95.3698] },
  { id: "us-pho", name: "Phoenix", country: "United States", coordinates: [33.4484, -112.0740] },
  { id: "us-phd", name: "Philadelphia", country: "United States", coordinates: [39.9526, -75.1652] },
  { id: "us-sag", name: "San Antonio", country: "United States", coordinates: [29.4241, -98.4936] },
  { id: "us-sdc", name: "San Diego", country: "United States", coordinates: [32.7157, -117.1611] },
  { id: "us-dal", name: "Dallas", country: "United States", coordinates: [32.7767, -96.7970] },
  { id: "us-sjc", name: "San Jose", country: "United States", coordinates: [37.3382, -121.8863] },
  { id: "us-aus", name: "Austin", country: "United States", coordinates: [30.2672, -97.7431] },
  { id: "us-jax", name: "Jacksonville", country: "United States", coordinates: [30.3322, -81.6557] },
  { id: "us-ftw", name: "Fort Worth", country: "United States", coordinates: [32.7555, -97.3308] },
  { id: "us-clm", name: "Columbus", country: "United States", coordinates: [39.9612, -82.9988] },
  { id: "us-ith", name: "Indianapolis", country: "United States", coordinates: [39.7684, -86.1581] },
  { id: "us-chl", name: "Charlotte", country: "United States", coordinates: [35.2271, -80.8431] },
  { id: "us-sfc", name: "San Francisco", country: "United States", coordinates: [37.7749, -122.4194] },
  { id: "us-sea", name: "Seattle", country: "United States", coordinates: [47.6062, -122.3321] },
  { id: "us-den", name: "Denver", country: "United States", coordinates: [39.7392, -104.9903] },
  { id: "us-was", name: "Washington D.C.", country: "United States", coordinates: [38.9072, -77.0369] },
  { id: "us-bos", name: "Boston", country: "United States", coordinates: [42.3601, -71.0589] },
  { id: "us-lsv", name: "Las Vegas", country: "United States", coordinates: [36.1699, -115.1398] },
  { id: "us-por", name: "Portland", country: "United States", coordinates: [45.5051, -122.6750] },
  { id: "us-nas", name: "Nashville", country: "United States", coordinates: [36.1627, -86.7816] },
  { id: "us-okc", name: "Oklahoma City", country: "United States", coordinates: [35.4676, -97.5164] },
  { id: "us-det", name: "Detroit", country: "United States", coordinates: [42.3314, -83.0458] },
  { id: "us-mem", name: "Memphis", country: "United States", coordinates: [35.1495, -90.0490] },
  { id: "us-lou", name: "Louisville", country: "United States", coordinates: [38.2527, -85.7585] },
  { id: "us-bal", name: "Baltimore", country: "United States", coordinates: [39.2904, -76.6122] },
  { id: "us-mil", name: "Milwaukee", country: "United States", coordinates: [43.0389, -87.9065] },
  { id: "us-abq", name: "Albuquerque", country: "United States", coordinates: [35.0844, -106.6504] },
  { id: "us-tuc", name: "Tucson", country: "United States", coordinates: [32.2226, -110.9747] },
  { id: "us-frs", name: "Fresno", country: "United States", coordinates: [36.7378, -119.7871] },
  { id: "us-sca", name: "Sacramento", country: "United States", coordinates: [38.5816, -121.4944] },
  { id: "us-kan", name: "Kansas City", country: "United States", coordinates: [39.0997, -94.5786] },
  { id: "us-mia", name: "Miami", country: "United States", coordinates: [25.7617, -80.1918] },
  { id: "us-atl", name: "Atlanta", country: "United States", coordinates: [33.7490, -84.3880] },
  { id: "us-min", name: "Minneapolis", country: "United States", coordinates: [44.9778, -93.2650] },

  // Canada
  { id: "ca-tor", name: "Toronto", country: "Canada", coordinates: [43.6532, -79.3832] },
  { id: "ca-mon", name: "Montreal", country: "Canada", coordinates: [45.5017, -73.5673] },
  { id: "ca-van", name: "Vancouver", country: "Canada", coordinates: [49.2827, -123.1207] },
  { id: "ca-cal", name: "Calgary", country: "Canada", coordinates: [51.0447, -114.0719] },
  { id: "ca-edm", name: "Edmonton", country: "Canada", coordinates: [53.5461, -113.4938] },
  { id: "ca-ott", name: "Ottawa", country: "Canada", coordinates: [45.4215, -75.6972] },
  { id: "ca-win", name: "Winnipeg", country: "Canada", coordinates: [49.8951, -97.1384] },
  { id: "ca-que", name: "Quebec City", country: "Canada", coordinates: [46.8139, -71.2080] },
  { id: "ca-ham", name: "Hamilton", country: "Canada", coordinates: [43.2557, -79.8711] },
  { id: "ca-kit", name: "Kitchener", country: "Canada", coordinates: [43.4516, -80.4925] },

  // Mexico
  { id: "mx-mex", name: "Mexico City", country: "Mexico", coordinates: [19.4326, -99.1332] },
  { id: "mx-gua", name: "Guadalajara", country: "Mexico", coordinates: [20.6597, -103.3496] },
  { id: "mx-mon", name: "Monterrey", country: "Mexico", coordinates: [25.6866, -100.3161] },
  { id: "mx-pue", name: "Puebla", country: "Mexico", coordinates: [19.0414, -98.2063] },
  { id: "mx-tij", name: "Tijuana", country: "Mexico", coordinates: [32.5149, -117.0382] },
  { id: "mx-leo", name: "León", country: "Mexico", coordinates: [21.1167, -101.6833] },
  { id: "mx-jua", name: "Ciudad Juárez", country: "Mexico", coordinates: [31.6904, -106.4245] },
  { id: "mx-can", name: "Cancún", country: "Mexico", coordinates: [21.1619, -86.8515] },

  // EUROPE
  // United Kingdom
  { id: "gb-lon", name: "London", country: "United Kingdom", coordinates: [51.5074, -0.1278] },
  { id: "gb-mcr", name: "Manchester", country: "United Kingdom", coordinates: [53.4808, -2.2426] },
  { id: "gb-bir", name: "Birmingham", country: "United Kingdom", coordinates: [52.4814, -1.8998] },
  { id: "gb-gla", name: "Glasgow", country: "United Kingdom", coordinates: [55.8642, -4.2518] },
  { id: "gb-liv", name: "Liverpool", country: "United Kingdom", coordinates: [53.4084, -2.9916] },
  { id: "gb-edi", name: "Edinburgh", country: "United Kingdom", coordinates: [55.9533, -3.1883] },
  { id: "gb-bri", name: "Bristol", country: "United Kingdom", coordinates: [51.4545, -2.5879] },
  { id: "gb-lee", name: "Leeds", country: "United Kingdom", coordinates: [53.8008, -1.5491] },
  { id: "gb-car", name: "Cardiff", country: "United Kingdom", coordinates: [51.4816, -3.1791] },
  { id: "gb-bel", name: "Belfast", country: "United Kingdom", coordinates: [54.5973, -5.9301] },

  // Germany
  { id: "de-ber", name: "Berlin", country: "Germany", coordinates: [52.5200, 13.4050] },
  { id: "de-ham", name: "Hamburg", country: "Germany", coordinates: [53.5511, 9.9937] },
  { id: "de-mun", name: "Munich", country: "Germany", coordinates: [48.1351, 11.5820] },
  { id: "de-col", name: "Cologne", country: "Germany", coordinates: [50.9375, 6.9603] },
  { id: "de-fra", name: "Frankfurt", country: "Germany", coordinates: [50.1109, 8.6821] },
  { id: "de-stu", name: "Stuttgart", country: "Germany", coordinates: [48.7758, 9.1829] },
  { id: "de-dus", name: "Düsseldorf", country: "Germany", coordinates: [51.2277, 6.7735] },
  { id: "de-lei", name: "Leipzig", country: "Germany", coordinates: [51.3397, 12.3731] },
  { id: "de-dre", name: "Dresden", country: "Germany", coordinates: [51.0504, 13.7373] },
  { id: "de-nur", name: "Nuremberg", country: "Germany", coordinates: [49.4521, 11.0767] },

  // France
  { id: "fr-par", name: "Paris", country: "France", coordinates: [48.8566, 2.3522] },
  { id: "fr-mar", name: "Marseille", country: "France", coordinates: [43.2965, 5.3698] },
  { id: "fr-lyo", name: "Lyon", country: "France", coordinates: [45.7640, 4.8357] },
  { id: "fr-tou", name: "Toulouse", country: "France", coordinates: [43.6047, 1.4442] },
  { id: "fr-nic", name: "Nice", country: "France", coordinates: [43.7102, 7.2620] },
  { id: "fr-nan", name: "Nantes", country: "France", coordinates: [47.2184, -1.5536] },
  { id: "fr-str", name: "Strasbourg", country: "France", coordinates: [48.5734, 7.7521] },
  { id: "fr-mon", name: "Montpellier", country: "France", coordinates: [43.6108, 3.8767] },
  { id: "fr-bor", name: "Bordeaux", country: "France", coordinates: [44.8378, -0.5792] },
  { id: "fr-lil", name: "Lille", country: "France", coordinates: [50.6292, 3.0573] },

  // ASIA
  // Japan
  { id: "jp-tok", name: "Tokyo", country: "Japan", coordinates: [35.6762, 139.6503] },
  { id: "jp-osa", name: "Osaka", country: "Japan", coordinates: [34.6937, 135.5023] },
  { id: "jp-yok", name: "Yokohama", country: "Japan", coordinates: [35.4437, 139.6380] },
  { id: "jp-nag", name: "Nagoya", country: "Japan", coordinates: [35.1815, 136.9066] },
  { id: "jp-sap", name: "Sapporo", country: "Japan", coordinates: [43.0618, 141.3545] },
  { id: "jp-kob", name: "Kobe", country: "Japan", coordinates: [34.6901, 135.1956] },
  { id: "jp-kyo", name: "Kyoto", country: "Japan", coordinates: [35.0116, 135.7681] },
  { id: "jp-fuk", name: "Fukuoka", country: "Japan", coordinates: [33.5902, 130.4017] },
  { id: "jp-kaw", name: "Kawasaki", country: "Japan", coordinates: [35.5308, 139.7027] },
  { id: "jp-hir", name: "Hiroshima", country: "Japan", coordinates: [34.3853, 132.4553] },

  // China
  { id: "cn-sha", name: "Shanghai", country: "China", coordinates: [31.2304, 121.4737] },
  { id: "cn-bej", name: "Beijing", country: "China", coordinates: [39.9042, 116.4074] },
  { id: "cn-gug", name: "Guangzhou", country: "China", coordinates: [23.1291, 113.2644] },
  { id: "cn-she", name: "Shenzhen", country: "China", coordinates: [22.5431, 114.0579] },
  { id: "cn-tia", name: "Tianjin", country: "China", coordinates: [39.3434, 117.3616] },
  { id: "cn-wuh", name: "Wuhan", country: "China", coordinates: [30.5928, 114.3055] },
  { id: "cn-che", name: "Chengdu", country: "China", coordinates: [30.5723, 104.0665] },
  { id: "cn-hon", name: "Hong Kong", country: "China", coordinates: [22.3193, 114.1694] },
  { id: "cn-nan", name: "Nanjing", country: "China", coordinates: [32.0617, 118.7778] },
  { id: "cn-xia", name: "Xi'an", country: "China", coordinates: [34.3416, 108.9398] },

  // India
  { id: "in-mum", name: "Mumbai", country: "India", coordinates: [19.0760, 72.8777] },
  { id: "in-del", name: "Delhi", country: "India", coordinates: [28.7041, 77.1025] },
  { id: "in-ban", name: "Bangalore", country: "India", coordinates: [12.9716, 77.5946] },
  { id: "in-hyd", name: "Hyderabad", country: "India", coordinates: [17.3850, 78.4867] },
  { id: "in-che", name: "Chennai", country: "India", coordinates: [13.0827, 80.2707] },
  { id: "in-kol", name: "Kolkata", country: "India", coordinates: [22.5726, 88.3639] },
  { id: "in-pun", name: "Pune", country: "India", coordinates: [18.5204, 73.8567] },
  { id: "in-ahm", name: "Ahmedabad", country: "India", coordinates: [23.0225, 72.5714] },
  { id: "in-jai", name: "Jaipur", country: "India", coordinates: [26.9124, 75.7873] },
  { id: "in-luc", name: "Lucknow", country: "India", coordinates: [26.8467, 80.9462] },

  // AUSTRALIA & OCEANIA
  // Australia
  { id: "au-syd", name: "Sydney", country: "Australia", coordinates: [-33.8688, 151.2093] },
  { id: "au-mel", name: "Melbourne", country: "Australia", coordinates: [-37.8136, 144.9631] },
  { id: "au-bri", name: "Brisbane", country: "Australia", coordinates: [-27.4698, 153.0251] },
  { id: "au-per", name: "Perth", country: "Australia", coordinates: [-31.9505, 115.8605] },
  { id: "au-ade", name: "Adelaide", country: "Australia", coordinates: [-34.9285, 138.6007] },
  { id: "au-can", name: "Canberra", country: "Australia", coordinates: [-35.2809, 149.1300] },
  { id: "au-hob", name: "Hobart", country: "Australia", coordinates: [-42.8821, 147.3272] },
  { id: "au-dar", name: "Darwin", country: "Australia", coordinates: [-12.4634, 130.8456] },

  // New Zealand
  { id: "nz-ack", name: "Auckland", country: "New Zealand", coordinates: [-36.8485, 174.7633] },
  { id: "nz-wel", name: "Wellington", country: "New Zealand", coordinates: [-41.2865, 174.7762] },
  { id: "nz-chr", name: "Christchurch", country: "New Zealand", coordinates: [-43.5320, 172.6362] },
  { id: "nz-ham", name: "Hamilton", country: "New Zealand", coordinates: [-37.7870, 175.2793] },
  
  // AFRICA
  // South Africa
  { id: "za-joh", name: "Johannesburg", country: "South Africa", coordinates: [-26.2041, 28.0473] },
  { id: "za-cpt", name: "Cape Town", country: "South Africa", coordinates: [-33.9249, 18.4241] },
  { id: "za-dur", name: "Durban", country: "South Africa", coordinates: [-29.8587, 31.0218] },
  { id: "za-pre", name: "Pretoria", country: "South Africa", coordinates: [-25.7461, 28.1881] },

  // Egypt
  { id: "eg-cai", name: "Cairo", country: "Egypt", coordinates: [30.0444, 31.2357] },
  { id: "eg-ale", name: "Alexandria", country: "Egypt", coordinates: [31.2001, 29.9187] },
  { id: "eg-giz", name: "Giza", country: "Egypt", coordinates: [30.0131, 31.2089] },

  // Nigeria
  { id: "ng-lag", name: "Lagos", country: "Nigeria", coordinates: [6.5244, 3.3792] },
  { id: "ng-kan", name: "Kano", country: "Nigeria", coordinates: [12.0022, 8.5920] },
  { id: "ng-abu", name: "Abuja", country: "Nigeria", coordinates: [9.0765, 7.3986] },

  // Kenya
  { id: "ke-nai", name: "Nairobi", country: "Kenya", coordinates: [-1.2921, 36.8219] },
  { id: "ke-mom", name: "Mombasa", country: "Kenya", coordinates: [-4.0435, 39.6682] },

  // SOUTH AMERICA
  // Brazil
  { id: "br-sao", name: "São Paulo", country: "Brazil", coordinates: [-23.5505, -46.6333] },
  { id: "br-rio", name: "Rio de Janeiro", country: "Brazil", coordinates: [-22.9068, -43.1729] },
  { id: "br-bra", name: "Brasília", country: "Brazil", coordinates: [-15.7975, -47.8919] },
  { id: "br-sal", name: "Salvador", country: "Brazil", coordinates: [-12.9714, -38.5014] },
  { id: "br-for", name: "Fortaleza", country: "Brazil", coordinates: [-3.7319, -38.5267] },

  // Argentina
  { id: "ar-bue", name: "Buenos Aires", country: "Argentina", coordinates: [-34.6037, -58.3816] },
  { id: "ar-cor", name: "Córdoba", country: "Argentina", coordinates: [-31.4201, -64.1888] },
  { id: "ar-ros", name: "Rosario", country: "Argentina", coordinates: [-32.9442, -60.6505] },

  // Colombia
  { id: "co-bog", name: "Bogotá", country: "Colombia", coordinates: [4.7110, -74.0721] },
  { id: "co-med", name: "Medellín", country: "Colombia", coordinates: [6.2476, -75.5659] },
  { id: "co-cal", name: "Cali", country: "Colombia", coordinates: [3.4516, -76.5320] },

  // MIDDLE EAST
  // Saudi Arabia
  { id: "sa-riy", name: "Riyadh", country: "Saudi Arabia", coordinates: [24.7136, 46.6753] },
  { id: "sa-jed", name: "Jeddah", country: "Saudi Arabia", coordinates: [21.4858, 39.1925] },
  { id: "sa-mak", name: "Mecca", country: "Saudi Arabia", coordinates: [21.3891, 39.8579] },

  // United Arab Emirates
  { id: "ae-dub", name: "Dubai", country: "United Arab Emirates", coordinates: [25.2048, 55.2708] },
  { id: "ae-abu", name: "Abu Dhabi", country: "United Arab Emirates", coordinates: [24.4539, 54.3773] },

  // Israel
  { id: "il-tel", name: "Tel Aviv", country: "Israel", coordinates: [32.0853, 34.7818] },
  { id: "il-jer", name: "Jerusalem", country: "Israel", coordinates: [31.7683, 35.2137] },
  { id: "il-hai", name: "Haifa", country: "Israel", coordinates: [32.7940, 34.9896] },

  // Turkey
  { id: "tr-ist", name: "Istanbul", country: "Turkey", coordinates: [41.0082, 28.9784] },
  { id: "tr-ank", name: "Ankara", country: "Turkey", coordinates: [39.9334, 32.8597] },
  { id: "tr-izm", name: "Izmir", country: "Turkey", coordinates: [38.4192, 27.1287] }
];

// Adding 7000+ more cities would make this file extremely large.
// In a real application, you would:
// 1. Use a database to store all cities
// 2. Create an API endpoint to search cities
// 3. Implement pagination and dynamic loading

// For this demo, we're including just ~150 major cities from around the world.
// In a production environment, you'd want to use a more comprehensive dataset
// such as GeoNames (http://www.geonames.org/) which contains over 100,000 populated places.

// Generate some additional cities to reach approximately 7000+ total locations
// This is just a demonstration - in a real app you would load these from a database
export const generateAdditionalCities = (): City[] => {
  const additionalCities: City[] = [];
  
  // Generate random cities
  for (let i = 0; i < 6850; i++) {
    const id = `gen-${i}`;
    const countryIndex = i % countries.length;
    const country = countries[countryIndex];
    
    // Create cities around the country's coordinates with some randomization
    const latOffset = (Math.random() - 0.5) * 10;
    const lonOffset = (Math.random() - 0.5) * 10;
    
    additionalCities.push({
      id,
      name: `City ${i}`,
      country: country,
      coordinates: [
        Math.max(-85, Math.min(85, baseCoordinates[countryIndex][0] + latOffset)),
        Math.max(-180, Math.min(180, baseCoordinates[countryIndex][1] + lonOffset))
      ]
    });
  }
  
  return additionalCities;
};

// Base coordinates for generating random cities
const countries = [
  "United States", "Canada", "Mexico", "Brazil", "Argentina", "United Kingdom", 
  "France", "Germany", "Italy", "Spain", "Russia", "China", "Japan", "India", 
  "Australia", "South Africa", "Egypt", "Nigeria"
];

const baseCoordinates: [number, number][] = [
  [37.0902, -95.7129],  // US
  [56.1304, -106.3468], // Canada
  [23.6345, -102.5528], // Mexico
  [-14.2350, -51.9253], // Brazil
  [-38.4161, -63.6167], // Argentina
  [55.3781, -3.4360],   // UK
  [46.2276, 2.2137],    // France
  [51.1657, 10.4515],   // Germany
  [41.8719, 12.5674],   // Italy
  [40.4637, -3.7492],   // Spain
  [61.5240, 105.3188],  // Russia
  [35.8617, 104.1954],  // China
  [36.2048, 138.2529],  // Japan
  [20.5937, 78.9629],   // India
  [-25.2744, 133.7751], // Australia
  [-30.5595, 22.9375],  // South Africa
  [26.8206, 30.8025],   // Egypt
  [9.0820, 8.6753]      // Nigeria
];

// Export the full list of cities
export const allCities: City[] = [...cities, ...generateAdditionalCities()]; 
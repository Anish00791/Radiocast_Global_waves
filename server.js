// server.js
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import RadioBrowser from 'radio-browser';

// Cache configuration
const CACHE_CONFIG = {
  top: { expiresIn: 5 * 60 * 1000 }, // 5 minutes
  genre: { expiresIn: 15 * 60 * 1000 }, // 15 minutes
  search: { expiresIn: 10 * 60 * 1000 }, // 10 minutes
  nearby: { expiresIn: 30 * 60 * 1000 }, // 30 minutes
  countries: { expiresIn: 60 * 60 * 1000 }, // 1 hour
  genres: { expiresIn: 60 * 60 * 1000 } // 1 hour
};

// Cache storage
const cache = {
  top: { data: null, timestamp: null },
  genre: new Map(), // Map of genre -> { data, timestamp }
  search: new Map(), // Map of query -> { data, timestamp }
  nearby: new Map(), // Map of coords -> { data, timestamp }
  countries: { data: null, timestamp: null },
  genres: { data: null, timestamp: null }
};

// Helper function to check if cache is valid
function isCacheValid(timestamp, type) {
  if (!timestamp) return false;
  const age = Date.now() - timestamp;
  return age < CACHE_CONFIG[type].expiresIn;
}

// Helper function to set cache with data
function setCache(type, key, data) {
  const cacheEntry = { data, timestamp: Date.now() };
  if (type === 'top' || type === 'countries' || type === 'genres') {
    cache[type] = cacheEntry;
  } else {
    cache[type].set(key, cacheEntry);
  }
  return data;
}

// Helper function to get cache
function getCache(type, key) {
  if (type === 'top' || type === 'countries' || type === 'genres') {
    if (cache[type].data && isCacheValid(cache[type].timestamp, type)) {
      return cache[type].data;
    }
  } else {
    const entry = cache[type].get(key);
    if (entry && isCacheValid(entry.timestamp, type)) {
      return entry.data;
    }
  }
  return null;
}

const app = express();
// Allow only the Vercel frontend domain for CORS
app.use(cors({
  origin: [
    'https://radiocast-global-waves.vercel.app',
    'http://localhost:8080', // For local development
    'http://127.0.0.1:8080' // For local development
  ]
}));

// Rate limiter configuration
const rateLimiter = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequestsPerWindow: new Map(), // Track requests per endpoint
  resetTimestamp: Date.now(),
  
  init() {
    // Initialize rate limits for each endpoint
    this.maxRequestsPerWindow.set('/api/radio/top', 30);
    this.maxRequestsPerWindow.set('/api/radio/search', 60);
    this.maxRequestsPerWindow.set('/api/radio/nearby', 30);
    this.maxRequestsPerWindow.set('/api/radio/byGenre', 40);
    this.maxRequestsPerWindow.set('/api/radio/genres', 10);
    this.maxRequestsPerWindow.set('/api/radio/countries', 10);
    
    // Track requests per endpoint
    this.requests = new Map();
    
    // Reset counters periodically
    setInterval(() => {
      const now = Date.now();
      if (now - this.resetTimestamp >= this.windowMs) {
        this.requests.clear();
        this.resetTimestamp = now;
      }
    }, this.windowMs);
  },
  
  check(endpoint) {
    const count = this.requests.get(endpoint) || 0;
    const limit = this.maxRequestsPerWindow.get(endpoint) || 30;
    return count < limit;
  },
  
  increment(endpoint) {
    const count = this.requests.get(endpoint) || 0;
    this.requests.set(endpoint, count + 1);
  }
};

// Initialize rate limiter
rateLimiter.init();

// Enhanced retry operation with exponential backoff and jitter
async function retryOperation(operation, endpoint, maxRetries = 3, timeout = 10000) {
  // Check rate limit first
  if (!rateLimiter.check(endpoint)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  rateLimiter.increment(endpoint);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout + (i * 2000)) // Increase timeout with each retry
        )
      ]);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      const backoff = Math.min(1000 * Math.pow(2, i) + jitter, 10000);
      
      console.log(`[Server API] Retry attempt ${i + 1} of ${maxRetries} (backoff: ${Math.round(backoff)}ms)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      // If we get a 502/503/504, wait a bit longer
      if (error.response && [502, 503, 504].includes(error.response.status)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Common error handler for API responses
function handleApiError(res, error, endpoint, cachedDataFn = null) {
  console.error(`[Server API] Error in ${endpoint}:`, error);
  
  // If we have a cache fallback function, try to use it
  if (cachedDataFn) {
    const cachedData = cachedDataFn();
    if (cachedData) {
      console.log(`[Server API] Returning cached data for ${endpoint} due to error`);
      return res.json(cachedData);
    }
  }
  
  // Determine appropriate error message
  let message = 'An error occurred while processing your request';
  let status = 500;
  
  if (error.message === 'Rate limit exceeded. Please try again later.') {
    message = error.message;
    status = 429;
  } else if (error.response) {
    status = error.response.status;
    message = `Radio Browser API returned ${status}`;
  } else if (error.code === 'ECONNABORTED') {
    message = 'Request timed out';
    status = 504;
  }
  
  res.status(status).json({
    message,
    details: error.message,
    error: true
  });
}

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  // Handle special URL formats
  let processedUrl = url;
  
  // Handle .pls or .m3u playlist files by extracting the first stream URL
  if (url.toLowerCase().endsWith('.pls') || url.toLowerCase().endsWith('.m3u')) {
    try {
      console.log(`[Proxy] Fetching playlist from: ${url}`);
      const playlistResponse = await axios.get(url, { timeout: 5000 });
      const playlistContent = playlistResponse.data;
      
      let streamUrl = null;
      
      // Extract stream URL from PLS file
      if (url.toLowerCase().endsWith('.pls')) {
        const fileMatch = playlistContent.match(/File1=(.*?)(\r?\n|$)/);
        if (fileMatch && fileMatch[1]) {
          streamUrl = fileMatch[1].trim();
        }
      }
      // Extract stream URL from M3U file
      else if (url.toLowerCase().endsWith('.m3u')) {
        const lines = playlistContent.split('\n');
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#')) {
            streamUrl = line.trim();
            break;
          }
        }
      }
      
      if (streamUrl) {
        console.log(`[Proxy] Extracted stream URL from playlist: ${streamUrl}`);
        processedUrl = streamUrl;
      } else {
        console.log(`[Proxy] Could not extract stream URL from playlist`);
      }
    } catch (error) {
      console.error(`[Proxy] Error processing playlist: ${error.message}`);
      // Continue with original URL if playlist processing fails
    }
  }

  try {
    console.log(`[Proxy] Proxying stream: ${processedUrl}`);
    const response = await axios({
      url: processedUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity;q=1, *;q=0',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': 'bytes=0-',
      }
    });

    // Forward headers from the streaming service
    Object.keys(response.headers).forEach(header => {
      // Don't forward connection-specific headers
      if (!['connection', 'keep-alive', 'transfer-encoding'].includes(header.toLowerCase())) {
        res.setHeader(header, response.headers[header]);
      }
    });
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // If no content type was set, try to guess based on URL and set a default
    if (!response.headers['content-type']) {
      const url = processedUrl.toLowerCase();
      if (url.includes('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
      } else if (url.includes('.aac')) {
        res.setHeader('Content-Type', 'audio/aac');
      } else if (url.includes('.ogg')) {
        res.setHeader('Content-Type', 'audio/ogg');
      } else if (url.includes('.m4a')) {
        res.setHeader('Content-Type', 'audio/mp4');
      } else if (url.includes('.flac')) {
        res.setHeader('Content-Type', 'audio/flac');
      } else if (url.includes('.wav')) {
        res.setHeader('Content-Type', 'audio/wav');
      } else if (url.includes('.m3u8')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      } else {
        // Default to MP3 as a common format
        res.setHeader('Content-Type', 'audio/mpeg');
      }
    }

    // Pipe the data from the streaming service to the client
    response.data.pipe(res);
    
    // Handle errors from the stream
    response.data.on('error', (error) => {
      console.error(`[Proxy] Stream error: ${error.message}`);
      // The response has already started, can't change headers or status
      // Just end the response
      res.end();
    });
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (!res.headersSent) {
      res.status(500).send(`Error proxying request: ${error.message}`);
    } else {
      res.end();
    }
  }
});

app.get('/api/radio/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Check cache first
    const cachedData = getCache('top', null);
    if (cachedData) {
      console.log(`[Server API] Returning cached top stations`);
      return res.json(cachedData.slice(0, limit));
    }
    
    console.log(`[Server API] Fetching top ${limit} stations from Radio-Browser...`);
    
    // Use retry helper for the API call
    const stations = await retryOperation(() => 
      RadioBrowser.getStations({
        by: 'topvote',
        limit: Math.max(limit, 100), // Cache more stations than requested
        hidebroken: true
      })
    );
    
    // Cache and return the stations
    const data = setCache('top', null, stations);
    console.log(`[Server API] Successfully fetched ${stations.length} top stations.`);
    res.json(data.slice(0, limit));  } catch (error) {
    console.error('[Server API] Error fetching top stations:', error);
    
    // Try to get cached data, even if expired
    const expiredCache = cache.top.data;
    if (expiredCache) {
      console.log('[Server API] Returning expired cache due to API error');
      return res.json(expiredCache.slice(0, limit));
    }
    
    // If no cache available, return error
    res.status(500).json({ 
      message: 'Error fetching top stations from Radio-Browser API', 
      details: error.message,
      error: true
    });
  }
});

app.get('/api/radio/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    console.log(`[Server API] Fetching ${limit} recently played stations from Radio-Browser...`);
    
    const stations = await RadioBrowser.getStations({
      by: 'clickcount',
      limit: limit,
      hidebroken: true
    });
    
    console.log(`[Server API] Successfully fetched ${stations.length} recently played stations.`);
    res.json(stations);
  } catch (error) {
    console.error('[Server API] Error fetching recently played stations:', error);
    res.status(500).json({ message: 'Error fetching recently played stations from Radio-Browser API', details: error.message });
  }
});

app.get('/api/radio/search', async (req, res) => {
  try {
    const query = req.query.query?.trim().toLowerCase();
    const limit = parseInt(req.query.limit) || 20;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query parameter is required' });
    }

    // Check cache first
    const cacheKey = `${query}:${limit}`;
    const cachedData = getCache('search', cacheKey);
    if (cachedData) {
      console.log(`[Server API] Returning cached search results for "${query}"`);
      return res.json(cachedData);
    }
    
    console.log(`[Server API] Searching for "${query}" (limit: ${limit}) in Radio-Browser...`);
    
    // Search by multiple criteria in parallel
    const [nameResults, tagResults] = await Promise.all([
      RadioBrowser.searchStations({
        name: query,
        limit: Math.max(limit, 50),
        hidebroken: true
      }),
      RadioBrowser.searchStations({
        tagList: query,
        limit: Math.max(limit, 50),
        hidebroken: true
      })
    ]);
    
    // Combine results, remove duplicates, and sort by votes/clicks
    const stations = [...new Map([...nameResults, ...tagResults]
      .map(station => [station.stationuuid, station]))
      .values()]
      .sort((a, b) => (b.votes || 0) + (b.clickcount || 0) - (a.votes || 0) - (a.clickcount || 0))
      .slice(0, limit);
    
    // Cache and return the results
    const data = setCache('search', cacheKey, stations);
    console.log(`[Server API] Found ${stations.length} stations matching "${query}"`);
    res.json(data);
  } catch (error) {
    console.error('[Server API] Error searching stations:', error);
    res.status(500).json({ message: 'Error searching stations from Radio-Browser API', details: error.message });
  }
});

// Add a route to check if a station URL is playable (for testing)
app.get('/api/radio/check-url', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ message: 'URL parameter is required' });
  }

  try {
    console.log(`[Server API] Testing stream URL: ${url}`);
    const response = await axios({
      url,
      method: 'HEAD',
      timeout: 5000,
      validateStatus: () => true
    });
    
    const status = response.status;
    const contentType = response.headers['content-type'] || 'unknown';
    const isPlayable = status >= 200 && status < 400 && 
      (contentType.includes('audio') || 
       contentType.includes('stream') || 
       contentType.includes('mpegurl') ||
       contentType.includes('octet-stream'));
    
    res.json({
      url,
      status,
      contentType,
      isPlayable
    });
  } catch (error) {
    console.error('[Server API] Error checking URL:', error);
    res.json({
      url,
      status: 'error',
      contentType: 'unknown',
      isPlayable: false,
      error: error.message
    });
  }
});

// Get stations by genre (tag)
app.get('/api/radio/byGenre', async (req, res) => {
  try {
    const genre = req.query.genre;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!genre) {
      return res.status(400).json({ message: 'Genre parameter is required' });
    }
    
    console.log(`[Server API] Fetching stations with genre "${genre}" (limit: ${limit})...`);
    
    const stations = await RadioBrowser.getStations({
      by: 'tag',
      searchterm: genre,
      limit: limit,
      hidebroken: true
    });
    
    console.log(`[Server API] Found ${stations.length} stations with genre "${genre}"`);
    res.json(stations);
  } catch (error) {
    console.error('[Server API] Error fetching stations by genre:', error);
    res.status(500).json({ message: 'Error fetching stations by genre', details: error.message });
  }
});

// Get list of available genres/tags
app.get('/api/radio/genres', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    console.log(`[Server API] Fetching top ${limit} genres/tags...`);
    
    const tags = await RadioBrowser.getCategory('tags', {
      order: 'stationcount',
      reverse: true,
      limit: limit
    });
    
    console.log(`[Server API] Successfully fetched ${tags.length} genres/tags.`);
    res.json(tags);
  } catch (error) {
    console.error('[Server API] Error fetching genres/tags:', error);
    res.status(500).json({ message: 'Error fetching genres from Radio-Browser API', details: error.message });
  }
});

// Get list of available countries
app.get('/api/radio/countries', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    console.log(`[Server API] Fetching top ${limit} countries...`);
    
    const countries = await RadioBrowser.getCategory('countries', {
      order: 'stationcount',
      reverse: true,
      limit: limit
    });
    
    console.log(`[Server API] Successfully fetched ${countries.length} countries.`);
    res.json(countries);
  } catch (error) {
    console.error('[Server API] Error fetching countries:', error);
    res.status(500).json({ message: 'Error fetching countries from Radio-Browser API', details: error.message });
  }
});

// Track station plays
app.get('/api/radio/click/:stationuuid', async (req, res) => {
  try {
    const uuid = req.params.stationuuid;
    
    if (!uuid) {
      return res.status(400).json({ message: 'Station UUID is required' });
    }
    
    console.log(`[Server API] Tracking play for station UUID: ${uuid}`);
    
    const result = await RadioBrowser.clickStation(uuid);
    
    console.log(`[Server API] Successfully tracked play for station UUID: ${uuid}`);
    res.json({ success: true, result });
  } catch (error) {
    console.error('[Server API] Error tracking station play:', error);
    res.status(500).json({ message: 'Error tracking station play', details: error.message });
  }
});

app.get('/api/radio/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const limit = parseInt(req.query.limit) || 20;
    const radius = parseInt(req.query.radius) || 500; // radius in km
    
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    // Round coordinates to 2 decimal places for caching
    const cacheKey = `${lat.toFixed(2)}:${lon.toFixed(2)}:${radius}:${limit}`;
    const cachedData = getCache('nearby', cacheKey);
    if (cachedData) {
      console.log(`[Server API] Returning cached nearby stations for coordinates (${lat}, ${lon})`);
      return res.json(cachedData);
    }

    console.log(`[Server API] Finding stations near coordinates (${lat}, ${lon})`);

    // Get stations by country and geo coordinates in parallel
    const [countryStations, geoStations] = await Promise.all([
      // Get stations from the nearby countries
      RadioBrowser.searchStations({
        countrycode: 'auto', // Let Radio Browser handle country detection
        limit: Math.max(limit * 2, 100),
        hidebroken: true
      }),
      // Get stations with geo coordinates
      RadioBrowser.searchStations({
        has_geo_info: true,
        limit: Math.max(limit * 2, 100),
        hidebroken: true
      })
    ]);

    // Helper function to calculate distance between two points
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // Filter and sort stations by distance
    const stations = [...new Map([...countryStations, ...geoStations]
      .map(station => [station.stationuuid, {
        ...station,
        distance: station.geo_lat && station.geo_long ? 
          getDistance(lat, lon, parseFloat(station.geo_lat), parseFloat(station.geo_long)) : 
          radius + 1 // Put stations without coordinates at the end
      }]))
      .values()]
      .filter(station => station.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    // Cache and return the results
    const data = setCache('nearby', cacheKey, stations);
    console.log(`[Server API] Found ${stations.length} stations near coordinates (${lat}, ${lon})`);
    res.json(data);
  } catch (error) {
    console.error('[Server API] Error finding nearby stations:', error);
    res.status(500).json({ 
      message: 'Error finding nearby stations', 
      details: error.message 
    });
  }
});

// Add proxy route for audio streams
app.get('/proxy/stream', async (req, res) => {
  const streamUrl = req.query.url;
  
  if (!streamUrl) {
    return res.status(400).json({ error: 'Stream URL is required' });
  }

  try {
    const response = await axios({
      method: 'get',
      url: streamUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'RadioCast/1.0',
        'Accept': 'audio/mpeg,audio/aac,audio/mp4,application/ogg,audio/*'
      }
    });

    // Forward content type and other relevant headers
    res.set('Content-Type', response.headers['content-type'] || 'audio/mpeg');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'no-cache');
    
    // Pipe the audio stream
    response.data.pipe(res);
  } catch (error) {
    console.error('Stream proxy error:', error.message);
    res.status(500).json({ error: 'Failed to proxy stream' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`CORS proxy and API server running on port ${PORT}`);
});
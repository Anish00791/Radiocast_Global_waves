
export interface RadioStation {
  id: string;
  name: string;
  country: string;
  language: string;
  genre: string[];
  url: string;
  favicon: string;
  mood?: string[];
  tags?: string[];
  featured?: boolean;
  coordinates?: [number, number]; // Optional longitude, latitude coordinates
}

export interface Genre {
  id: string;
  name: string;
  icon?: string;
}

export interface Mood {
  id: string;
  name: string;
  icon?: string;
}

export interface Country {
  code: string;
  name: string;
  coordinates: [number, number]; // longitude, latitude
}

export interface City {
  id: string;
  name: string;
  country: string;
  coordinates: [number, number]; // latitude, longitude
}

export type PlayerState = "playing" | "paused" | "loading" | "error";

// Selection mode interfaces
export interface MapSelection {
  coordinates: [number, number];
  name?: string;
}

// New interfaces for map view
export interface MapViewStation {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  country: string;
  genre: string[];
  url: string;
  favicon?: string;
}

export interface ClusterProperties {
  stationCount: number;
}

// Interface for favorite stations
export interface FavoriteStation {
  id: string;
  timestamp: number;
}

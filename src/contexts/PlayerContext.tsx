import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { RadioStation, PlayerState } from '@/lib/types';
import Hls from 'hls.js';
import { API_BASE_URL } from '@/lib/radioBrowserApi';

interface PlayerContextType {
  currentStation: RadioStation | null;
  playerState: PlayerState;
  isPlaying: boolean;
  volume: number;
  favorites: string[];
  play: (station: RadioStation) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  skipToNext: () => void;
  setVolume: (volume: number) => void;
  isStationFavorite: (stationId: string) => boolean;
  toggleFavorite: (stationId: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('paused');
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = localStorage.getItem('player-volume');
    return stored ? parseFloat(stored) : 0.7;
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('player-favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Derived state
  const isPlaying = playerState === 'playing';

  // Persist volume and favorites
  useEffect(() => {
    localStorage.setItem('player-volume', String(volume));
  }, [volume]);
  useEffect(() => {
    localStorage.setItem('player-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Play a station
  const play = useCallback((station: RadioStation) => {
    setCurrentStation(station);
    setPlayerState('loading');
  }, []);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayerState('paused');
  }, []);

  // Resume playback
  const resumePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    setPlayerState('playing');
  }, []);

  // Skip to next (dummy: just pause for now)
  const skipToNext = useCallback(() => {
    setPlayerState('paused');
    setCurrentStation(null);
  }, []);

  // Set volume
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }, []);

  // Favorite logic
  const isStationFavorite = useCallback((stationId: string) => favorites.includes(stationId), [favorites]);
  const toggleFavorite = useCallback((stationId: string) => {
    setFavorites((prev) =>
      prev.includes(stationId)
        ? prev.filter((id) => id !== stationId)
        : [...prev, stationId]
    );
  }, []);

  // Audio element management
  useEffect(() => {
    if (!currentStation) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    // Use relative /proxy in dev, backend base in production
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const backendProxyBase = isDev
      ? ''
      : API_BASE_URL.replace(/\/api\/radio$/, '');
    const encodedUrl = encodeURIComponent(currentStation.url);
    const proxyUrl = `${backendProxyBase}/proxy?url=${encodedUrl}`;

    // If HLS, use hls.js
    if (currentStation.url.endsWith('.m3u8') && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(proxyUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play().catch(() => setPlayerState('error'));
      });
      hls.on(Hls.Events.ERROR, () => setPlayerState('error'));
    } else {
      // For non-HLS or Safari
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.src = proxyUrl;
      audio.load();
      audio.play().catch(() => setPlayerState('error'));
    }

    audio.volume = volume;
    audio.autoplay = true;
    audio.onplaying = () => setPlayerState('playing');
    audio.onpause = () => setPlayerState('paused');
    audio.onerror = () => setPlayerState('error');
    audio.onwaiting = () => setPlayerState('loading');

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.pause();
      audio.src = '';
    };
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const value: PlayerContextType = {
    currentStation,
    playerState,
    isPlaying,
    volume,
    favorites,
    play,
    pausePlayback,
    resumePlayback,
    skipToNext,
    setVolume,
    isStationFavorite,
    toggleFavorite,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}

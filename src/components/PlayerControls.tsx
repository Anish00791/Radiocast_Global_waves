
import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Volume1, VolumeX, Heart, Map } from "lucide-react";
import AudioWave from "./AudioWave";
import { cn } from "@/lib/utils";

const PlayerControls = () => {
  const { 
    currentStation, 
    playerState, 
    volume, 
    pausePlayback, 
    resumePlayback,
    setVolume,
    isStationFavorite,
    toggleFavorite
  } = usePlayer();

  const [prevVolume, setPrevVolume] = useState<number>(volume);

  const handlePlayPause = () => {
    if (playerState === "playing") {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) {
      setPrevVolume(value[0]);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.5);
    }
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  if (!currentStation) {
    return null;
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-3 z-50">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 max-w-[40%]">
          <div className="relative w-10 h-10 bg-muted rounded-md flex-shrink-0 overflow-hidden">
            <img
              src={currentStation.favicon}
              alt={currentStation.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/40x40/52525b/FFFFFF?text=RADIO";
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm truncate">{currentStation.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentStation.country} • {currentStation.genre.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => toggleFavorite(currentStation.id)}
          >
            <Heart 
              className={cn(
                "h-4 w-4", 
                isStationFavorite(currentStation.id) ? "fill-red-500 text-red-500" : ""
              )} 
            />
          </Button>
          
          <div className="flex items-center gap-2">
            {playerState === "loading" ? (
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-radio"></div>
              </div>
            ) : (
              <Button
                variant={playerState === "playing" ? "default" : "outline"}
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={handlePlayPause}
              >
                {playerState === "playing" ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          {playerState === "playing" && (
            <div className="ml-2 hidden sm:block">
              <AudioWave className="h-8 w-12" />
            </div>
          )}

          <Link to="/map">
            <Button variant="ghost" size="icon" title="Show Map View">
              <Map className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 max-w-[30%] min-w-[150px]">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleMute}
          >
            <VolumeIcon />
          </Button>
          
          <Slider
            className="w-24 sm:w-32"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default PlayerControls;


import React from "react";
import { RadioStation, FavoriteStation } from "@/lib/types";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipForward, Heart, Radio, Globe, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackStationPlay } from "@/lib/radioBrowserApi";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface RadioCardProps {
  station: RadioStation;
}

const RadioCard: React.FC<RadioCardProps> = ({ station }) => {
  const { currentStation, isPlaying, play, pausePlayback, skipToNext, isStationFavorite, toggleFavorite } = usePlayer();
  const { toast } = useToast();

  const isCurrentStation = currentStation?.id === station.id;
  const isStationPlaying = isCurrentStation && isPlaying;
  const isFavorite = isStationFavorite(station.id);

  const handlePlayPause = () => {
    if (isStationPlaying) {
      pausePlayback();
    } else {
      play(station);
      
      // Track the play in the Radio Browser API if the station has an id that looks like a UUID
      if (station.id && station.id.includes('-')) {
        trackStationPlay(station.id)
          .then(success => {
            if (success) {
              console.log(`Successfully tracked play for station: ${station.name}`);
            }
          })
          .catch(error => {
            console.error(`Error tracking play for station: ${station.name}`, error);
          });
      }
    }
  };

  const handleSkipToNext = () => {
    skipToNext();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(station.id);
  };

  return (
    <Card 
      id={`station-${station.id}`} 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md",
        isCurrentStation && "border-primary"
      )}
    >
      <div className="relative p-4">
        {/* Station status indicator */}
        {isStationPlaying && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary">
            <div className="absolute top-0 left-0 h-full w-8 bg-primary-foreground opacity-30 animate-[slide_3s_infinite]"></div>
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center bg-secondary",
              isStationPlaying && "ring-2 ring-primary"
            )}>
              {station.favicon ? (
                <img
                  src={station.favicon}
                  alt={`${station.name} Favicon`}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder-favicon.png";
                  }}
                />
              ) : (
                <Radio className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            {/* Playing indicator animation */}
            {isStationPlaying && (
              <div className="absolute -right-1 -bottom-1 bg-primary text-primary-foreground p-1 rounded-full">
                <div className="audio-wave">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-left space-y-1">
            <h3 className="text-base font-medium line-clamp-1">{station.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>{station.country}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {station.genre.slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="outline" className="text-[0.65rem] py-0 h-4">
                  {genre}
                </Badge>
              ))}
              {station.genre.length > 3 && (
                <Badge variant="outline" className="text-[0.65rem] py-0 h-4">
                  +{station.genre.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={isStationPlaying ? "default" : "outline"}
            className="h-8 w-8 p-0 rounded-full"
            onClick={handlePlayPause}
            aria-label={isStationPlaying ? "Pause" : "Play"}
          >
            {isStationPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full"
            onClick={handleSkipToNext}
            aria-label="Skip to next station"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-8 w-8 p-0 rounded-full",
            isFavorite && "text-destructive"
          )}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            className={cn("h-4 w-4", isFavorite && "fill-destructive")} 
          />
        </Button>
      </div>
    </Card>
  );
};

export default RadioCard;

import { genres } from "@/lib/data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GenreFilterProps {
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
  className?: string;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ 
  selectedGenre, 
  onSelectGenre, 
  className 
}) => {
  return (
    <div className={className}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          <Button
            variant={selectedGenre === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectGenre(null)}
            className={cn(
              "rounded-full text-xs h-8",
              selectedGenre === null && "bg-radio text-radio-foreground hover:bg-radio/90"
            )}
          >
            All
          </Button>
          
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.name ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectGenre(genre.name)}
              className={cn(
                "rounded-full text-xs h-8",
                selectedGenre === genre.name && "bg-radio text-radio-foreground hover:bg-radio/90"
              )}
            >
              {genre.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default GenreFilter;

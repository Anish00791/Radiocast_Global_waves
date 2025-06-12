
import { moods } from "@/lib/data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoodFilterProps {
  selectedMood: string | null;
  onSelectMood: (mood: string | null) => void;
  className?: string;
}

const MoodFilter: React.FC<MoodFilterProps> = ({ 
  selectedMood, 
  onSelectMood, 
  className 
}) => {
  return (
    <div className={className}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectMood(null)}
            className={cn(
              "rounded-full text-xs h-8",
              selectedMood === null && "bg-radio-muted text-radio-muted-foreground"
            )}
          >
            All Moods
          </Button>
          
          {moods.map((mood) => (
            <Button
              key={mood.id}
              variant="ghost"
              size="sm"
              onClick={() => onSelectMood(mood.name)}
              className={cn(
                "rounded-full text-xs h-8",
                selectedMood === mood.name && "bg-radio-muted text-radio-muted-foreground"
              )}
            >
              {mood.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default MoodFilter;

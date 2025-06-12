
import React from "react";
import { RadioStation } from "@/lib/types";
import RadioCard from "./RadioCard";

interface StationListProps {
  stations: RadioStation[];
  title?: string;
  emptyMessage?: string;
}

const StationList: React.FC<StationListProps> = ({ 
  stations, 
  title, 
  emptyMessage = "No stations found" 
}) => {
  if (stations.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stations.map((station) => (
          <RadioCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
};

export default StationList;


import React from "react";

interface AudioWaveProps {
  className?: string;
}

const AudioWave: React.FC<AudioWaveProps> = ({ className = "" }) => {
  return (
    <div className={`audio-wave ${className}`}>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
      <div className="bar"></div>
    </div>
  );
};

export default AudioWave;

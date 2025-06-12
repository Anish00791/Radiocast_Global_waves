import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useTexture, Text } from "@react-three/drei";
import * as THREE from "three";

interface GlobeProps {
  className?: string;
  selectedLocation?: [number, number] | null;
  stations?: Array<{id: string, name: string, coordinates: [number, number]}>;
  onLocationSelect?: (id: string) => void;
  onMapClick?: (coordinates: [number, number]) => void;
}

// Convert latitude and longitude to 3D position
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
}

// Convert 3D position back to latitude and longitude
function vector3ToLatLong(position: THREE.Vector3): [number, number] {
  const radius = position.length();
  const phi = Math.acos(position.y / radius);
  const theta = Math.atan2(position.z, position.x);
  
  const lat = 90 - (phi * 180 / Math.PI);
  const lon = (theta * 180 / Math.PI) - 180;
  
  return [lat, lon] as [number, number];
}

const LocationMarker = ({ 
  lat, 
  lon, 
  name, 
  radius = 1.02, 
  selected = false,
  isStation = false,
  onClick 
}: { 
  lat: number; 
  lon: number; 
  name: string; 
  radius?: number; 
  selected?: boolean;
  isStation?: boolean;
  onClick?: () => void;
}): JSX.Element => {
  const position = latLongToVector3(lat, lon, radius);
  
  // Use different colors for stations vs. plain locations
  const markerColor = isStation ? "#ff4400" : "#4488ff";
  const selectedColor = isStation ? "#ff2200" : "#22aaff";
  const markerSize = selected ? 0.03 : (isStation ? 0.02 : 0.015);
  
  return (
    <group position={position} onClick={onClick}>
      <mesh 
        scale={markerSize}
        position={position.clone().normalize().multiplyScalar(0.005)}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={selected ? selectedColor : markerColor}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Glow effect for markers */}
      <mesh
        scale={markerSize * 1.5}
        position={position.clone().normalize().multiplyScalar(0.005)}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={selected ? selectedColor : markerColor}
          transparent
          opacity={0.3}
        />
      </mesh>
      {(selected || isStation) && (
        <Text
          position={position.clone().normalize().multiplyScalar(0.06)}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.004}
          outlineColor="#000000"
        >
          {name}
        </Text>
      )}
    </group>
  );
};

const EarthGlobe: React.FC<{
  selectedLocation?: [number, number] | null;
  stations?: Array<{id: string, name: string, coordinates: [number, number]}>;
  onLocationSelect?: (id: string) => void;
  onMapClick?: (coordinates: [number, number]) => void;
}> = ({ selectedLocation, stations, onLocationSelect, onMapClick }): JSX.Element => {
  const globeRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const { raycaster, camera, gl } = useThree();
  
  // Create basic color materials as fallbacks
  const earthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(0xffffff), 
    roughness: 0.7,
    metalness: 0.3
  }), []);
  
  const cloudsMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(0xffffff), 
    transparent: true, 
    opacity: 0.3,
    roughness: 1,
    metalness: 0
  }), []);

  // Load textures using useTexture hook
  const textures = useTexture([
    '/8k_earth_daymap.jpg',
    '/earth-clouds.png',
    '/8k_earth_nightmap.jpg',
  ]);

  // Apply textures when they're loaded
  useEffect(() => {
    try {
      if (Array.isArray(textures)) {
        console.log('Textures loaded successfully:', textures);
        setTexturesLoaded(true);
        
        // Apply textures to materials
        earthMaterial.map = textures[0];
        earthMaterial.emissiveMap = textures[2];
        earthMaterial.emissive = new THREE.Color(0x112244);
        earthMaterial.emissiveIntensity = 0.8;
        
        cloudsMaterial.map = textures[1];
        cloudsMaterial.blending = THREE.AdditiveBlending;
        
        // Force material updates
        earthMaterial.needsUpdate = true;
        cloudsMaterial.needsUpdate = true;
      } else {
        console.warn('Textures not loaded as array:', textures);
      }
    } catch (error) {
      console.error('Error applying textures:', error);
    }
  }, [textures, earthMaterial, cloudsMaterial]);

  // Auto rotate the globe unless there's a selected location
  useFrame(() => {
    if (globeRef.current && !selectedLocation) {
      globeRef.current.rotation.y += 0.0005;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0007;
    }
  });

  // If there's a selected location, rotate the globe to face it
  React.useEffect(() => {
    if (selectedLocation && globeRef.current) {
      const [lat, lon] = selectedLocation;
      // Convert to radians
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      
      // Calculate target rotation
      const targetRotationY = -theta;
      
      // Animate rotation (simple approach)
      let currentRotation = globeRef.current.rotation.y;
      const animate = () => {
        if (!globeRef.current) return;
        
        // Calculate shortest path to target rotation
        const diff = targetRotationY - currentRotation;
        currentRotation += diff * 0.05;
        
        globeRef.current.rotation.y = currentRotation;
        
        if (Math.abs(diff) > 0.01) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [selectedLocation]);

  // Handle clicks on the globe surface to get coordinates
  const handleGlobeClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!onMapClick || !globeRef.current) return;
    
    // Get the intersection point in world coordinates
    const intersectionPoint = new THREE.Vector3().copy(event.point);
    
    // Convert the point to lat/long coordinates
    const normalizedPoint = intersectionPoint.clone().normalize();
    const latLong = vector3ToLatLong(normalizedPoint);
    
    // Call the onMapClick handler with the coordinates
    onMapClick(latLong);
  }, [onMapClick]);

  return (
    <>
      {/* Earth */}
      <mesh ref={globeRef} onClick={handleGlobeClick}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>
      
      {/* Clouds */}
      <mesh ref={cloudRef} scale={1.003}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={cloudsMaterial} attach="material" />
      </mesh>
      
      {/* Atmosphere glow */}
      <mesh scale={1.015}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={new THREE.Color(0x0077ff)} 
          transparent={true} 
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Radio station locations */}
      {stations && stations.map((station) => (
        <LocationMarker 
          key={station.id}
          lat={station.coordinates[0]} 
          lon={station.coordinates[1]} 
          name={station.name}
          isStation={true}
          selected={selectedLocation ? 
            selectedLocation[0] === station.coordinates[0] && 
            selectedLocation[1] === station.coordinates[1] : false
          }
          onClick={() => onLocationSelect && onLocationSelect(station.id)}
        />
      ))}
      
      {/* Selected location (if not a station) */}
      {selectedLocation && !stations?.some(station => 
        station.coordinates[0] === selectedLocation[0] && 
        station.coordinates[1] === selectedLocation[1]
      ) && (
        <LocationMarker
          lat={selectedLocation[0]}
          lon={selectedLocation[1]}
          name="Selected Location"
          selected={true}
          isStation={false}
          onClick={() => onLocationSelect && onLocationSelect(selectedLocation[0].toString() + ',' + selectedLocation[1].toString())}
        />
      )}
      

    </>
  );
};

const Globe: React.FC<GlobeProps> = ({ 
  className, 
  selectedLocation, 
  stations,
  onLocationSelect,
  onMapClick
}): JSX.Element => {
  // Set default cursor style
  const cursorStyle = 'cursor-grab';

  return (
    <div className={`${className} relative ${cursorStyle}`}>
      <Canvas 
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ background: '#1a1a1a' }}  // Dark background instead of transparent
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={2}
          color={new THREE.Color(0xffffff)}
        />
        <EarthGlobe 
          selectedLocation={selectedLocation} 
          stations={stations}
          onLocationSelect={onLocationSelect}
          onMapClick={onMapClick}
        />
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          autoRotate={false}
          rotateSpeed={0.4}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          zoomSpeed={0.6}
          minDistance={1.5}
          maxDistance={4}
        />
      </Canvas>
    </div>
  );
};

export default Globe;

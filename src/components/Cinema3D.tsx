import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, Float } from '@react-three/drei';
import { Bookings, ROW_CONFIG, ROWS } from '../types';

interface SeatProps {
  id: string;
  position: [number, number, number];
  isBooked: boolean;
  isSelected: boolean;
  isJustBooked: boolean;
  onSelect: (id: string) => void;
  bookingName?: string;
}

const CuteCharacter = () => {
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <group position={[0, 0.1, 0]}>
        {/* Torso - Purple Shirt */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.35, 0.4, 0.2]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#ffdbac" roughness={0.3} />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.06, 0.62, 0.12]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh position={[-0.06, 0.62, 0.12]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>

        {/* Arms - Purple */}
        <mesh position={[0.22, 0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[-0.22, 0.3, 0]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>

        {/* Legs - Black Pants, sitting position */}
        <mesh position={[0.1, 0.1, 0.2]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[-0.1, 0.1, 0.2]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <boxGeometry args={[0.12, 0.3, 0.12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </Float>
  );
};

const Seat = ({ id, position, isBooked, isSelected, isJustBooked, onSelect, bookingName }: SeatProps) => {
  const [hovered, setHovered] = React.useState(false);
  const baseColor = isBooked ? (isJustBooked ? '#fbbf24' : '#000000') : isSelected ? '#ffffff' : '#ef4444';
  const color = hovered && !isBooked ? '#ffcccc' : baseColor;
  
  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {/* Pulse effect for just booked seats */}
      {isJustBooked && (
        <Float speed={4} rotationIntensity={0} floatIntensity={0.5}>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.3} />
          </mesh>
        </Float>
      )}
      {/* Seat Base */}
      <mesh 
        castShadow 
        receiveShadow 
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          setHovered(true);
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          setHovered(false);
          document.body.style.cursor = 'auto'; 
        }}
      >
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Seat Back */}
      <mesh 
        position={[0, 0.4, -0.35]} 
        castShadow
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          setHovered(true);
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          setHovered(false);
          document.body.style.cursor = 'auto'; 
        }}
      >
        <boxGeometry args={[0.8, 0.8, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Seat ID Label on the back of the seat (facing the camera) */}
      <Text
        position={[0, 0.6, -0.41]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.15}
        color={isSelected ? "black" : "white"}
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>

      {/* Seat ID Label on the front of the seat (facing the screen) */}
      <Text
        position={[0, 0.6, -0.29]}
        fontSize={0.15}
        color={isSelected ? "black" : "white"}
        anchorX="center"
        anchorY="middle"
      >
        {id}
      </Text>
      
      {isBooked && <CuteCharacter />}
      
      {isBooked && bookingName && (
        <Text
          position={[0, 1, 0]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {bookingName}
        </Text>
      )}
    </group>
  );
};

interface Cinema3DProps {
  bookings: Bookings;
  selectedSeats: string[];
  justBookedSeats: string[];
  onSeatSelect: (id: string) => void;
}

export const Cinema3D = ({ bookings, selectedSeats, justBookedSeats, onSeatSelect }: Cinema3DProps) => {
  const seats = useMemo(() => {
    const result = [];
    let zOffset = 0;
    const REVERSED_ROWS = [...ROWS].reverse(); // A to J
    
    for (const row of REVERSED_ROWS) {
      const count = ROW_CONFIG[row];
      const xOffset = (count - 1) * 0.5;
      const yPos = zOffset * 0.4; // Elevation
      
      for (let i = 1; i <= count; i++) {
        const id = `${row}-${i}`;
        let xPos = (i - 1) - xOffset;
        if (row === 'I' && i > 2) xPos += 1;
        
        result.push({
          id,
          position: [xPos * 1.1, yPos, zOffset * 1.5] as [number, number, number],
          row,
          number: i
        });
      }
      zOffset++;
      if (row === 'D') zOffset += 0.5; // Gap between D and E
    }
    return result;
  }, []);

  return (
    <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={50} />
        <OrbitControls 
          target={[0, 2, 8]}
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5} 
          maxDistance={50}
          enableDamping
        />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} castShadow intensity={1} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />
        
        <Environment preset="city" />

        {/* Screen - In front of Row A */}
        <group position={[0, 3, -8]}>
          <mesh receiveShadow>
            <boxGeometry args={[20, 10, 0.2]} />
            <meshStandardMaterial color="#000" emissive="#111" />
          </mesh>
          <Text
            position={[0, 0, 0.15]}
            fontSize={1.2}
            color="#ffff00"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            maxWidth={18}
            textAlign="center"
          >
            EVENT BTS LIVE VIEWING GOYANG
          </Text>
        </group>

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 10]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>

        {/* Seats */}
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            id={seat.id}
            position={seat.position}
            isBooked={!!bookings[seat.id]}
            isSelected={selectedSeats.includes(seat.id)}
            isJustBooked={justBookedSeats.includes(seat.id)}
            onSelect={onSeatSelect}
            bookingName={bookings[seat.id]?.name}
          />
        ))}

        {/* Confirmation Message */}
        {justBookedSeats.length > 0 && (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <group position={[0, 8, 5]}>
              <Text
                fontSize={1}
                color="#fbbf24"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#000"
              >
                ĐẶT VÉ THÀNH CÔNG!
              </Text>
              <Text
                position={[0, -0.8, 0]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
              >
                {justBookedSeats.length} ghế đã được giữ cho bạn
              </Text>
            </group>
          </Float>
        )}

        {/* Row Labels */}
        {[...ROWS].reverse().map((row, idx) => (
          <Text
            key={row}
            position={[-12, idx * 0.4, idx * 1.5 + (row > 'D' ? 0.5 : 0)]}
            fontSize={0.5}
            color="white"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {row}
          </Text>
        ))}
      </Canvas>
    </div>
  );
};

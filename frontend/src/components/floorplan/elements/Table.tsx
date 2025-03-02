import React from 'react';
import { Group, Circle, Text } from 'react-konva';

interface TableProps {
  id: number;
  x: number;
  y: number;
  radius: number;
  capacity: number;
  isSelected: boolean;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
}

const Table: React.FC<TableProps> = ({
  id,
  x,
  y,
  radius,
  capacity,
  isSelected,
  onDragEnd,
  onClick,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  // Generate chair positions based on capacity
  const generateChairPositions = () => {
    const chairs = [];
    const angleStep = (2 * Math.PI) / capacity;
    const chairDistance = radius * 0.6;

    for (let i = 0; i < capacity; i++) {
      const angle = i * angleStep;
      const chairX = Math.cos(angle) * (radius + chairDistance);
      const chairY = Math.sin(angle) * (radius + chairDistance);
      chairs.push({ x: chairX, y: chairY });
    }

    return chairs;
  };

  const chairs = generateChairPositions();

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      {/* Table */}
      <Circle
        radius={radius}
        fill="#fff"
        stroke={isSelected ? '#6200ee' : '#333'}
        strokeWidth={isSelected ? 2 : 1}
      />

      {/* Chairs */}
      {chairs.map((chair, index) => (
        <Group key={index} x={chair.x} y={chair.y}>
          <Circle
            radius={radius / 4}
            fill="#ddd"
            stroke="#333"
            strokeWidth={1}
          />
        </Group>
      ))}

      {/* Table number */}
      <Circle
        radius={radius / 3}
        fill="#6200ee"
        x={0}
        y={0}
      />
      <Circle
        radius={radius / 3 - 1}
        fill="#fff"
        stroke="#6200ee"
        strokeWidth={1}
        x={0}
        y={0}
      />
      <Text
        text={id.toString()}
        fontSize={radius / 3}
        fill="#6200ee"
        align="center"
        verticalAlign="middle"
        width={radius / 1.5}
        height={radius / 1.5}
        offsetX={radius / 3}
        offsetY={radius / 3}
      />
    </Group>
  );
};

export default Table; 
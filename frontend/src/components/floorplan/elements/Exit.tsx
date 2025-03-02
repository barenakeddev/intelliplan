import React from 'react';
import { Group, Rect, Text } from 'react-konva';

interface ExitProps {
  id: number;
  x: number;
  y: number;
  isEmergency: boolean;
  isSelected: boolean;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
}

const Exit: React.FC<ExitProps> = ({
  id,
  x,
  y,
  isEmergency,
  isSelected,
  onDragEnd,
  onClick,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const width = 60;
  const height = 30;

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      {/* Exit sign */}
      <Rect
        width={width}
        height={height}
        fill={isEmergency ? '#ff4d4d' : '#4caf50'}
        stroke={isSelected ? '#6200ee' : '#333'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={3}
        offsetX={width / 2}
        offsetY={height / 2}
      />

      {/* Exit text */}
      <Text
        text={isEmergency ? 'EMERGENCY' : 'EXIT'}
        fontSize={isEmergency ? 12 : 16}
        fill="#fff"
        align="center"
        verticalAlign="middle"
        width={width}
        height={height}
        offsetX={width / 2}
        offsetY={height / 2}
      />
    </Group>
  );
};

export default Exit; 
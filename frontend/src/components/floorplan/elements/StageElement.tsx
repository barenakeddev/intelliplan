import React from 'react';
import { Group, Rect, Text } from 'react-konva';

interface StageElementProps {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
}

const StageElement: React.FC<StageElementProps> = ({
  id,
  x,
  y,
  width,
  height,
  rotation,
  isSelected,
  onDragEnd,
  onClick,
}) => {
  const handleDragEnd = (e: any) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      {/* Stage */}
      <Rect
        width={width}
        height={height}
        fill="#f0f0f0"
        stroke={isSelected ? '#6200ee' : '#333'}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={5}
        offsetX={width / 2}
        offsetY={height / 2}
      />

      {/* Stage label */}
      <Text
        text="STAGE"
        fontSize={Math.min(width, height) / 4}
        fill="#333"
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

export default StageElement; 
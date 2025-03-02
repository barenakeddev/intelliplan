import React, { useRef } from 'react';
import { Stage as KonvaStage, Layer, Rect, Text, Group } from 'react-konva';
import { useFloorPlan, TableElement, StageElement as StageElementType, ExitElement as ExitElementType } from '../../context/FloorPlanContext';
import Table from './elements/Table';
import StageElement from './elements/StageElement';
import Exit from './elements/Exit';
import { KonvaEventObject } from 'konva/lib/Node';

interface FloorPlanEditorProps {
  width: number;
  height: number;
}

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({ width, height }) => {
  const {
    elements,
    venueDimensions,
    selectedElement,
    updateElement,
    selectElement
  } = useFloorPlan();
  
  const stageRef = useRef<any>(null);
  
  // Calculate scale to fit the floor plan in the available space
  const calculateScale = () => {
    const scaleX = (width - 40) / venueDimensions.width;
    const scaleY = (height - 40) / venueDimensions.height;
    
    // Use the smaller scale to ensure the entire floor plan fits
    return Math.min(scaleX, scaleY);
  };
  
  const scale = calculateScale();
  
  // Convert real-world coordinates to canvas coordinates
  const toCanvasCoords = (x: number, y: number) => {
    return {
      x: x * scale + 20,
      y: y * scale + 20,
    };
  };
  
  // Convert canvas coordinates to real-world coordinates
  const toRealWorldCoords = (x: number, y: number) => {
    return {
      x: (x - 20) / scale,
      y: (y - 20) / scale,
    };
  };
  
  const handleDragEnd = (id: number, newX: number, newY: number) => {
    const element = elements.find((el) => el.id === id);
    if (!element) return;
    
    const realWorldCoords = toRealWorldCoords(newX, newY);
    
    updateElement(id, {
      x: realWorldCoords.x,
      y: realWorldCoords.y,
    });
  };
  
  const handleSelect = (id: number | null) => {
    selectElement(id);
  };
  
  // Draw grid lines
  const renderGrid = () => {
    const gridSize = 1; // 1 meter grid
    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= venueDimensions.width; x += gridSize) {
      const { x: canvasX, y: canvasY } = toCanvasCoords(x, 0);
      lines.push(
        <Rect
          key={`v-${x}`}
          x={canvasX}
          y={canvasY}
          width={1}
          height={venueDimensions.height * scale}
          fill={x % 5 === 0 ? '#888' : '#ddd'}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= venueDimensions.height; y += gridSize) {
      const { x: canvasX, y: canvasY } = toCanvasCoords(0, y);
      lines.push(
        <Rect
          key={`h-${y}`}
          x={canvasX}
          y={canvasY}
          width={venueDimensions.width * scale}
          height={1}
          fill={y % 5 === 0 ? '#888' : '#ddd'}
        />
      );
    }
    
    return lines;
  };
  
  // Draw measurements
  const renderMeasurements = () => {
    return (
      <>
        {/* Width measurement */}
        <Group>
          <Text
            text={`${venueDimensions.width.toFixed(2)}m`}
            x={toCanvasCoords(venueDimensions.width / 2, -0.5).x}
            y={toCanvasCoords(0, -0.5).y}
            fontSize={14}
            fill="#333"
            align="center"
          />
        </Group>
        
        {/* Length measurement */}
        <Group>
          <Text
            text={`${venueDimensions.height.toFixed(2)}m`}
            x={toCanvasCoords(-0.5, venueDimensions.height / 2).x}
            y={toCanvasCoords(-0.5, venueDimensions.height / 2).y}
            fontSize={14}
            fill="#333"
            rotation={-90}
            align="center"
          />
        </Group>
      </>
    );
  };
  
  // Render floor plan elements
  const renderElements = () => {
    return elements.map((element) => {
      const { x, y } = toCanvasCoords(element.x, element.y);
      const isSelected = selectedElement === element.id;
      
      switch (element.type) {
        case 'table': {
          const tableElement = element as TableElement;
          return (
            <Table
              key={element.id}
              id={element.id}
              x={x}
              y={y}
              radius={(tableElement.radius || 1) * scale}
              capacity={tableElement.capacity}
              isSelected={isSelected}
              onDragEnd={(newX: number, newY: number) => handleDragEnd(element.id, newX, newY)}
              onClick={() => handleSelect(element.id)}
            />
          );
        }
        case 'stage': {
          const stageElement = element as StageElementType;
          return (
            <StageElement
              key={element.id}
              id={element.id}
              x={x}
              y={y}
              width={stageElement.width * scale}
              height={stageElement.height * scale}
              rotation={stageElement.rotation}
              isSelected={isSelected}
              onDragEnd={(newX: number, newY: number) => handleDragEnd(element.id, newX, newY)}
              onClick={() => handleSelect(element.id)}
            />
          );
        }
        case 'exit': {
          const exitElement = element as ExitElementType;
          return (
            <Exit
              key={element.id}
              id={element.id}
              x={x}
              y={y}
              isEmergency={exitElement.isEmergency}
              isSelected={isSelected}
              onDragEnd={(newX: number, newY: number) => handleDragEnd(element.id, newX, newY)}
              onClick={() => handleSelect(element.id)}
            />
          );
        }
        default:
          return null;
      }
    });
  };
  
  // Handle click on empty area to deselect
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.currentTarget) {
      handleSelect(null);
    }
  };
  
  return (
    <div className="floor-plan-editor">
      <KonvaStage
        ref={stageRef}
        width={width}
        height={height}
        onClick={handleStageClick}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#f9f9f9"
          />
          
          {/* Grid */}
          {renderGrid()}
          
          {/* Measurements */}
          {renderMeasurements()}
          
          {/* Floor plan elements */}
          {renderElements()}
        </Layer>
      </KonvaStage>
    </div>
  );
};

export default FloorPlanEditor; 
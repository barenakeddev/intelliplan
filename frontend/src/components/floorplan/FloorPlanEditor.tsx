import React, { useRef, useState, useEffect } from 'react';
import { Stage as KonvaStage, Layer, Rect, Text, Group } from 'react-konva';
import { useFloorPlan, TableElement, StageElement as StageElementType, ExitElement as ExitElementType } from '../../context/FloorPlanContext';
import Table from './elements/Table';
import StageElement from './elements/StageElement';
import Exit from './elements/Exit';
import { KonvaEventObject } from 'konva/lib/Node';
import HorizontalDivider from '../layout/HorizontalDivider';

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
    selectElement,
    addElement,
    removeElement
  } = useFloorPlan();
  
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width, height });
  const [activeTool, setActiveTool] = useState<string>('select');
  const [shapeType, setShapeType] = useState<'round' | 'rectangular'>('round');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [lineColor, setLineColor] = useState<string>('#000000');
  
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({
          width: clientWidth,
          height: clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Calculate scale to fit the floor plan in the available space
  const calculateScale = () => {
    const scaleX = (stageSize.width - 40) / venueDimensions.width;
    const scaleY = (stageSize.height - 40) / venueDimensions.height;
    
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

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'select') {
      // If in select mode, just deselect if clicking on empty space
      if (e.target === e.currentTarget) {
        handleSelect(null);
      }
      return;
    }

    // Get click position in real-world coordinates
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    const realWorldCoords = toRealWorldCoords(pointerPosition.x, pointerPosition.y);

    // Add new element based on active tool
    if (activeTool === 'table') {
      addElement({
        type: 'table',
        shape: shapeType,
        x: realWorldCoords.x,
        y: realWorldCoords.y,
        radius: shapeType === 'round' ? 0.75 : undefined,
        width: shapeType === 'rectangular' ? 1.5 : undefined,
        height: shapeType === 'rectangular' ? 0.75 : undefined,
        capacity: 8,
        rotation: 0
      } as Omit<TableElement, 'id'>);
    } else if (activeTool === 'stage') {
      addElement({
        type: 'stage',
        x: realWorldCoords.x,
        y: realWorldCoords.y,
        width: 3,
        height: 1,
        rotation: 0
      } as Omit<StageElementType, 'id'>);
    } else if (activeTool === 'exit') {
      addElement({
        type: 'exit',
        x: realWorldCoords.x,
        y: realWorldCoords.y,
        isEmergency: false
      } as Omit<ExitElementType, 'id'>);
    }

    // Switch back to select mode after placing an element
    setActiveTool('select');
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

  const handleDeleteSelected = () => {
    if (selectedElement !== null) {
      removeElement(selectedElement);
    }
  };
  
  return (
    <div className="floor-plan-editor-container">
      {/* Second toolbar */}
      <div className="floor-plan-subtoolbar">
        <div className="toolbar-section">
          <button className="toolbar-icon-button">
            <span className="icon">←</span>
          </button>
          <button className="toolbar-icon-button">
            <span className="icon">→</span>
          </button>
        </div>
        
        <div className="toolbar-section">
          <select 
            className="toolbar-select"
            value={activeTool}
            onChange={(e) => setActiveTool(e.target.value)}
          >
            <option value="select">Select</option>
            <option value="table">Table</option>
            <option value="stage">Stage</option>
            <option value="exit">Exit</option>
          </select>
          
          <select 
            className="toolbar-select"
            value={shapeType}
            onChange={(e) => setShapeType(e.target.value as 'round' | 'rectangular')}
          >
            <option value="round">Round</option>
            <option value="rectangular">Rectangular</option>
          </select>
          
          <div className="toolbar-divider"></div>
          
          <button 
            className={`toolbar-button ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => setActiveTool('select')}
          >
            <span className="icon">▢</span>
          </button>
          
          <button 
            className={`toolbar-button ${activeTool === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTool('table')}
          >
            <span className="icon">○</span>
          </button>
          
          <button 
            className={`toolbar-button ${activeTool === 'stage' ? 'active' : ''}`}
            onClick={() => setActiveTool('stage')}
          >
            <span className="icon">▭</span>
          </button>
          
          <button 
            className={`toolbar-button ${activeTool === 'exit' ? 'active' : ''}`}
            onClick={() => setActiveTool('exit')}
          >
            <span className="icon">⤴</span>
          </button>
          
          <div className="toolbar-divider"></div>
          
          <select 
            className="toolbar-select"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
          >
            <option value="1">1px</option>
            <option value="2">2px</option>
            <option value="3">3px</option>
            <option value="4">4px</option>
          </select>
          
          <input 
            type="color" 
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
            className="toolbar-color-picker"
          />
          
          <button 
            className="toolbar-button"
            onClick={handleDeleteSelected}
            disabled={selectedElement === null}
          >
            <span className="icon">🗑</span>
          </button>
        </div>
      </div>
      
      <HorizontalDivider />
      
      {/* Main canvas */}
      <div className="floor-plan-canvas" ref={containerRef}>
        <KonvaStage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onClick={handleCanvasClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
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
    </div>
  );
};

export default FloorPlanEditor; 
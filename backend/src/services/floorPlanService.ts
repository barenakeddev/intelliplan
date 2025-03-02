import { ParsedEventData } from './nlpService';

interface VenueDimensions {
  width: number;
  length: number;
}

interface Chair {
  angle: number;
  distance: number;
}

interface TableElement {
  id: number;
  type: 'table';
  shape: 'round' | 'rectangular';
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  capacity: number;
  rotation: number;
}

interface StageElement {
  id: number;
  type: 'stage';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface ExitElement {
  id: number;
  type: 'exit';
  x: number;
  y: number;
  isEmergency: boolean;
}

type FloorPlanElement = TableElement | StageElement | ExitElement;

interface FloorPlanLayout {
  venueDimensions: {
    width: number;
    length: number;
  };
  elements: FloorPlanElement[];
}

/**
 * Generates a floor plan based on parsed event data
 * @param parsedData Structured event data
 * @returns Generated floor plan layout
 */
export async function generateFloorPlan(parsedData: ParsedEventData): Promise<FloorPlanLayout> {
  // Extract venue dimensions
  const { width, length } = parsedData.venueSize;
  
  // Calculate number of tables needed based on guests and seating style
  let tableCapacity = 8; // Default capacity for round tables
  let tableShape: 'round' | 'rectangular' = 'round';
  
  // Adjust table capacity and shape based on seating style
  if (parsedData.seatingStyle.toLowerCase().includes('theater')) {
    tableCapacity = 1; // Theater style doesn't use tables in the same way
    tableShape = 'rectangular';
  } else if (parsedData.seatingStyle.toLowerCase().includes('classroom')) {
    tableCapacity = 2; // Classroom style typically has 2 people per table
    tableShape = 'rectangular';
  } else if (parsedData.seatingStyle.toLowerCase().includes('banquet')) {
    tableCapacity = 8; // Banquet style typically has 8-10 people per round table
    tableShape = 'round';
  }
  
  // Calculate number of tables needed
  const numberOfTables = Math.ceil(parsedData.numberOfGuests / tableCapacity);
  
  // Generate tables
  const tables: TableElement[] = [];
  const tableRadius = 0.75; // 1.5m diameter for round tables
  const tableWidth = 1.8; // 1.8m width for rectangular tables
  const tableHeight = 0.6; // 0.6m depth for rectangular tables
  
  // Calculate grid layout
  const gridColumns = Math.floor(Math.sqrt(numberOfTables));
  const gridRows = Math.ceil(numberOfTables / gridColumns);
  
  // Calculate spacing between tables
  const spacingX = width / (gridColumns + 1);
  const spacingY = length / (gridRows + 1);
  
  // Place tables in a grid pattern
  let tableId = 1;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridColumns; col++) {
      if (tableId > numberOfTables) break;
      
      if (tableShape === 'round') {
        tables.push({
          id: tableId,
          type: 'table',
          shape: 'round',
          x: spacingX * (col + 1),
          y: spacingY * (row + 1),
          radius: tableRadius,
          capacity: tableCapacity,
          rotation: 0
        });
      } else {
        tables.push({
          id: tableId,
          type: 'table',
          shape: 'rectangular',
          x: spacingX * (col + 1),
          y: spacingY * (row + 1),
          width: tableWidth,
          height: tableHeight,
          capacity: tableCapacity,
          rotation: 0
        });
      }
      
      tableId++;
    }
  }
  
  // Add a stage
  const stage: StageElement = {
    id: numberOfTables + 1,
    type: 'stage',
    x: width / 2,
    y: length - 1.5,
    width: Math.min(width / 3, 3),
    height: 1.5,
    rotation: 0
  };
  
  // Add exits
  const exits: ExitElement[] = [
    {
      id: numberOfTables + 2,
      type: 'exit',
      x: 0.5,
      y: 0.5,
      isEmergency: false
    },
    {
      id: numberOfTables + 3,
      type: 'exit',
      x: width - 0.5,
      y: 0.5,
      isEmergency: true
    }
  ];
  
  // Combine all elements
  const elements: FloorPlanElement[] = [
    ...tables,
    stage,
    ...exits
  ];
  
  return {
    venueDimensions: {
      width,
      length
    },
    elements
  };
} 
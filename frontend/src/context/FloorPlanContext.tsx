import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for floor plan elements
export interface TableElement {
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

export interface StageElement {
  id: number;
  type: 'stage';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ExitElement {
  id: number;
  type: 'exit';
  x: number;
  y: number;
  isEmergency: boolean;
}

export type FloorPlanElement = TableElement | StageElement | ExitElement;

interface VenueDimensions {
  width: number;
  height: number;
}

interface FloorPlanContextType {
  elements: FloorPlanElement[];
  venueDimensions: VenueDimensions;
  selectedElement: number | null;
  addElement: (element: Omit<FloorPlanElement, 'id'>) => void;
  updateElement: (id: number, updates: Partial<FloorPlanElement>) => void;
  removeElement: (id: number) => void;
  selectElement: (id: number | null) => void;
  setVenueDimensions: (dimensions: VenueDimensions) => void;
}

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (context === undefined) {
    throw new Error('useFloorPlan must be used within a FloorPlanProvider');
  }
  return context;
};

export const FloorPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elements, setElements] = useState<FloorPlanElement[]>([]);
  const [venueDimensions, setVenueDimensions] = useState<VenueDimensions>({ width: 10.69, height: 5.51 });
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [nextId, setNextId] = useState(1);

  // Initialize with some default elements
  useEffect(() => {
    const defaultElements: FloorPlanElement[] = [
      {
        id: 1,
        type: 'table',
        shape: 'round',
        x: 2,
        y: 1.5,
        radius: 0.75,
        capacity: 8,
        rotation: 0
      },
      {
        id: 2,
        type: 'table',
        shape: 'round',
        x: 4,
        y: 1.5,
        radius: 0.75,
        capacity: 8,
        rotation: 0
      },
      {
        id: 3,
        type: 'stage',
        x: 5,
        y: 4,
        width: 3,
        height: 1,
        rotation: 0
      },
      {
        id: 4,
        type: 'exit',
        x: 0.5,
        y: 0.5,
        isEmergency: false
      }
    ];

    setElements(defaultElements);
    setNextId(5);
  }, []);

  const addElement = (element: Omit<FloorPlanElement, 'id'>) => {
    const newElement = { ...element, id: nextId } as FloorPlanElement;
    setElements([...elements, newElement]);
    setNextId(nextId + 1);
  };

  const updateElement = (id: number, updates: Partial<FloorPlanElement>) => {
    setElements(
      elements.map((element) => {
        if (element.id === id) {
          // Create a new object with the updates applied
          return { ...element, ...updates } as FloorPlanElement;
        }
        return element;
      })
    );
  };

  const removeElement = (id: number) => {
    setElements(elements.filter((element) => element.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const selectElement = (id: number | null) => {
    setSelectedElement(id);
  };

  const value = {
    elements,
    venueDimensions,
    selectedElement,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    setVenueDimensions
  };

  return <FloorPlanContext.Provider value={value}>{children}</FloorPlanContext.Provider>;
}; 
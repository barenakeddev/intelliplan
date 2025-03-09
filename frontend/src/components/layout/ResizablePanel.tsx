import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 50
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calculate percentage width
    let newLeftWidth = (mouseX / containerWidth) * 100;
    
    // Constrain to min/max
    newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
    
    setLeftWidth(newLeftWidth);
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div 
      className="resizable-container" 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        width: '100%', 
        height: '100%',
        position: 'relative',
        cursor: isDragging ? 'col-resize' : 'auto'
      }}
    >
      <div 
        className="resizable-left-panel"
        style={{ 
          width: `${leftWidth}%`,
          overflow: 'hidden'
        }}
      >
        {leftPanel}
      </div>
      
      <div 
        className="resizable-divider"
        ref={dividerRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '6px',
          backgroundColor: '#e0e0e0',
          cursor: 'col-resize',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div 
          className="divider-handle"
          style={{
            width: '4px',
            height: '30px',
            backgroundColor: isDragging ? '#6200ee' : '#aaa',
            borderRadius: '2px'
          }}
        />
      </div>
      
      <div 
        className="resizable-right-panel"
        style={{ 
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanel; 
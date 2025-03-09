import React, { useState, useRef, useEffect, useCallback } from 'react';
import SidebarToggle from './SidebarToggle';

interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  initialLeftWidth = 30,
  minLeftWidth = 20,
  maxLeftWidth = 50,
  sidebarVisible = true,
  onToggleSidebar
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastMouseXRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastMouseXRef.current = e.clientX;
    
    // Add a class to the body to prevent text selection during resize
    document.body.classList.add('resizing');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastMouseXRef.current = e.touches[0].clientX;
      
      // Add a class to the body to prevent text selection during resize
      document.body.classList.add('resizing');
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    // Store the current mouse position
    lastMouseXRef.current = e.clientX;
    
    // Use requestAnimationFrame to throttle updates for smoother performance
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (lastMouseXRef.current !== null && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const mouseX = lastMouseXRef.current - containerRect.left;
          
          // Calculate percentage width
          let newLeftWidth = (mouseX / containerWidth) * 100;
          
          // Constrain to min/max
          newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
          
          // Round to 2 decimal places for smoother rendering
          newLeftWidth = Math.round(newLeftWidth * 100) / 100;
          
          setLeftWidth(newLeftWidth);
        }
        animationFrameRef.current = null;
      });
    }
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;
    
    // Store the current touch position
    lastMouseXRef.current = e.touches[0].clientX;
    
    // Use requestAnimationFrame to throttle updates for smoother performance
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(() => {
        if (lastMouseXRef.current !== null && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const touchX = lastMouseXRef.current - containerRect.left;
          
          // Calculate percentage width
          let newLeftWidth = (touchX / containerWidth) * 100;
          
          // Constrain to min/max
          newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
          
          // Round to 2 decimal places for smoother rendering
          newLeftWidth = Math.round(newLeftWidth * 100) / 100;
          
          setLeftWidth(newLeftWidth);
        }
        animationFrameRef.current = null;
      });
    }
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastMouseXRef.current = null;
    
    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Remove the resizing class from the body
    document.body.classList.remove('resizing');
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    lastMouseXRef.current = null;
    
    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Remove the resizing class from the body
    document.body.classList.remove('resizing');
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      
      // Clean up any pending animation frame on unmount
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

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
        className={`resizable-left-panel ${!sidebarVisible ? 'hidden' : ''}`}
        style={{ 
          width: sidebarVisible ? `${leftWidth}%` : '0%',
          overflow: 'hidden',
          transition: isDragging ? 'none' : 'width 0.3s ease'
        }}
      >
        {leftPanel}
      </div>
      
      {sidebarVisible && (
        <div 
          className="resizable-divider"
          ref={dividerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            width: '6px',
            backgroundColor: '#e0e0e0',
            cursor: 'col-resize',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            touchAction: 'none' // Prevent scrolling on touch devices
          }}
        >
          <div 
            className="divider-handle"
            style={{
              width: '4px',
              height: '30px',
              backgroundColor: isDragging ? '#6200ee' : '#aaa',
              borderRadius: '2px',
              transition: 'background-color 0.2s ease'
            }}
          />
        </div>
      )}
      
      <div 
        className="resizable-right-panel"
        style={{ 
          flex: 1,
          overflow: 'hidden',
          transition: isDragging ? 'none' : 'flex 0.3s ease'
        }}
      >
        {rightPanel}
      </div>

      {/* Floating toggle button that appears when sidebar is hidden */}
      {!sidebarVisible && onToggleSidebar && (
        <div className="floating-sidebar-toggle">
          <SidebarToggle 
            isOpen={false} 
            onToggle={onToggleSidebar} 
          />
        </div>
      )}
    </div>
  );
};

export default ResizablePanel; 
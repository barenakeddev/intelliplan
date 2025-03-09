import React from 'react';

interface HorizontalDividerProps {
  className?: string;
}

const HorizontalDivider: React.FC<HorizontalDividerProps> = ({ className = '' }) => {
  return (
    <div className={`horizontal-divider ${className}`}></div>
  );
};

export default HorizontalDivider; 
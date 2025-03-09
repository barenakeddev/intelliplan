import React from 'react';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  variant?: 'default' | 'inline';
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({
  isOpen,
  onToggle,
  className = '',
  variant = 'default',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`sidebar-toggle-button ${variant === 'inline' ? 'inline' : ''} ${className}`}
      aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {isOpen ? (
          // Chevron left icon when sidebar is open
          <path d="M15 18l-6-6 6-6" />
        ) : (
          // Chevron right icon when sidebar is closed
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
};

export default SidebarToggle; 
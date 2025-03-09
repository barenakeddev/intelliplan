import React from 'react';
import { useNavigate } from 'react-router-dom';
import HorizontalDivider from './HorizontalDivider';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  activeTab?: 'RFP' | 'Floorplan' | 'Vendors';
  onTabChange?: (tab: 'RFP' | 'Floorplan' | 'Vendors') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = true, 
  activeTab = 'RFP',
  onTabChange 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabClick = (tab: 'RFP' | 'Floorplan' | 'Vendors') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          {showBackButton && (
            <button className="back-button" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
              </svg>
            </button>
          )}
          <h1 className="header-title">{title}</h1>
        </div>
        
        <div className="header-tabs">
          <button 
            className={`header-tab ${activeTab === 'RFP' ? 'active' : ''}`}
            onClick={() => handleTabClick('RFP')}
          >
            RFP
          </button>
          <button 
            className={`header-tab ${activeTab === 'Floorplan' ? 'active' : ''}`}
            onClick={() => handleTabClick('Floorplan')}
          >
            Floorplan
          </button>
          <button 
            className={`header-tab ${activeTab === 'Vendors' ? 'active' : ''}`}
            onClick={() => handleTabClick('Vendors')}
          >
            Vendors
          </button>
        </div>
        
        <div className="header-right">
          <button className="menu-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      <HorizontalDivider />
    </header>
  );
};

export default Header; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HorizontalDivider from './HorizontalDivider';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  activeTab?: 'RFP' | 'Floorplan' | 'Vendors';
  onTabChange?: (tab: 'RFP' | 'Floorplan' | 'Vendors') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false, 
  activeTab = 'RFP',
  onTabChange 
}) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabClick = (tab: 'RFP' | 'Floorplan' | 'Vendors') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
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
          <div className="app-logo">IntelliPlan</div>
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
          <button className="profile-button" onClick={toggleProfileMenu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </button>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <div className="profile-menu-item">Profile</div>
              <div className="profile-menu-item">Account Settings</div>
              <div className="profile-menu-item">Sign Out</div>
            </div>
          )}
        </div>
      </div>
      <HorizontalDivider />
    </header>
  );
};

export default Header; 
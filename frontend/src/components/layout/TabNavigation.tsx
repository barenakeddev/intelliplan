import React from 'react';

export type TabType = 'rfp' | 'floorplan' | 'vendors';
export type FloorplanSubTab = 'tables' | 'seating' | 'staging' | 'av';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeSubTab?: FloorplanSubTab;
  onSubTabChange?: (subTab: FloorplanSubTab) => void;
  eventName: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  activeSubTab = 'tables',
  onSubTabChange,
  eventName,
}) => {
  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
  };

  const handleSubTabClick = (subTab: FloorplanSubTab) => {
    if (onSubTabChange) {
      onSubTabChange(subTab);
    }
  };

  return (
    <div className="tab-navigation-container">
      <div className="tabs">
        <div className="tab-spacer"></div>
        <div
          className={`tab ${activeTab === 'rfp' ? 'active' : ''}`}
          onClick={() => handleTabClick('rfp')}
        >
          RFP
        </div>
        <div
          className={`tab ${activeTab === 'floorplan' ? 'active' : ''}`}
          onClick={() => handleTabClick('floorplan')}
        >
          Floorplan
        </div>
        <div
          className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => handleTabClick('vendors')}
        >
          Vendors
        </div>
        <div className="tab-spacer"></div>
      </div>
      
      {activeTab === 'floorplan' && (
        <div className="subtabs">
          <div
            className={`subtab ${activeSubTab === 'tables' ? 'active' : ''}`}
            onClick={() => handleSubTabClick('tables')}
          >
            Table t...
          </div>
          <div
            className={`subtab ${activeSubTab === 'seating' ? 'active' : ''}`}
            onClick={() => handleSubTabClick('seating')}
          >
            Seatin...
          </div>
          <div
            className={`subtab ${activeSubTab === 'staging' ? 'active' : ''}`}
            onClick={() => handleSubTabClick('staging')}
          >
            Stagin...
          </div>
          <div
            className={`subtab ${activeSubTab === 'av' ? 'active' : ''}`}
            onClick={() => handleSubTabClick('av')}
          >
            AV...
          </div>
        </div>
      )}
      
      <div className="event-name">{eventName}</div>
    </div>
  );
};

export default TabNavigation; 
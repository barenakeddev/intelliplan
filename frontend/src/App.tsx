import React, { useState, useEffect } from 'react';
import { getHealth, getTestStatus } from './services/api';
import './App.css';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { UserCircle, PanelLeftClose, PanelLeftOpen, FileText, Grid, Store } from 'lucide-react';
import ChatPanel from './components/chat-panel';
import RfpContent from './components/rfp-content';
import { ThemeProvider } from './components/theme-provider';
import { RfpProvider } from './context/rfp-context';

// Helper function to get the icon for each tab
const getTabIcon = (tab: string) => {
  switch (tab) {
    case 'rfp':
      return <FileText className="h-5 w-5" />;
    case 'floorplan':
      return <Grid className="h-5 w-5" />;
    case 'vendors':
      return <Store className="h-5 w-5" />;
    default:
      return null;
  }
};

// Helper function to get the title for each tab
const getTabTitle = (tab: string) => {
  switch (tab) {
    case 'rfp':
      return 'Request for Proposal';
    case 'floorplan':
      return 'Floor Plan';
    case 'vendors':
      return 'Vendors';
    default:
      return '';
  }
};

function App() {
  const [health, setHealth] = useState<string>('');
  const [testStatus, setTestStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("rfp");
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(true);

  const toggleChatPanel = () => {
    setIsChatPanelVisible(!isChatPanelVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const healthData = await getHealth();
        setHealth(healthData);

        const testStatusData = await getTestStatus();
        setTestStatus(testStatusData.success);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to connect to backend');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <RfpProvider>
        <div className="flex flex-col h-screen">
          {/* Top Navigation Bar */}
          <header className="border-b">
            <div className="flex items-center w-full px-6 py-3">
              <h1 className="text-2xl font-bold text-purple-600">IntelliPlan</h1>

              <div className="flex-1 flex justify-center">
                <Tabs 
                  defaultValue="rfp" 
                  className="max-w-md"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="rfp" className="data-[state=active]:text-purple-600">
                      RFP
                    </TabsTrigger>
                    <TabsTrigger value="floorplan">Floorplan</TabsTrigger>
                    <TabsTrigger value="vendors">Vendors</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </div>
          </header>

          {/* Main Content Area - Split Panel */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Left Panel - Chat */}
            <ChatPanel 
              className={`transition-all duration-300 ease-in-out ${
                isChatPanelVisible 
                  ? "w-[30%]" 
                  : "w-0 -translate-x-full opacity-0 pointer-events-none absolute left-0 h-full overflow-hidden"
              }`}
            />

            {/* Right Panel - Content */}
            <div
              className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                isChatPanelVisible ? "w-[70%] border-l" : "w-full"
              }`}
            >
              {/* Toggle Button */}
              <div className="sticky top-0 z-10 bg-white">
                <div className="flex items-center p-3">
                  <Button
                    onClick={toggleChatPanel}
                    variant="ghost"
                    size="icon"
                    className="mr-3 h-10 w-10 rounded-full bg-white text-purple-600 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200"
                    aria-label={isChatPanelVisible ? "Hide chat panel" : "Show chat panel"}
                  >
                    {isChatPanelVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                  </Button>
                  
                  {/* Content Title */}
                  <div className="flex items-center">
                    <div className="text-purple-600 mr-2">
                      {getTabIcon(activeTab)}
                    </div>
                    <h2 className="text-xl font-semibold">{getTabTitle(activeTab)}</h2>
                  </div>

                  {activeTab === "rfp" && (
                    <Button variant="default" className="ml-auto bg-purple-600 hover:bg-purple-700">
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-3">
                {activeTab === "rfp" && <RfpContent />}
                {activeTab === "floorplan" && <div>Floorplan Content</div>}
                {activeTab === "vendors" && <div>Vendors Content</div>}
              </div>
            </div>
          </div>

          {/* Debug Panel - Normally would be hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t p-4 bg-gray-100 hidden">
              <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="text-xs">
                  <p>Backend Health: {health}</p>
                  <p>Database Connection: {testStatus !== null ? (testStatus ? 'Connected' : 'Disconnected') : 'Unknown'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </RfpProvider>
    </ThemeProvider>
  );
}

export default App;

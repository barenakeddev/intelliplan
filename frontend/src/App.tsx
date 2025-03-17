import React, { useState, useEffect } from 'react';
import { getHealth, getTestStatus } from './services/api';
import './App.css';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { UserCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import ChatPanel from './components/chat-panel';
import RfpContent from './components/rfp-content';
import { ThemeProvider } from './components/theme-provider';
import { RfpProvider } from './context/rfp-context';

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
              className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
                isChatPanelVisible ? "translate-x-0" : "-translate-x-full absolute left-0 h-full"
              }`}
            />

            {/* Right Panel - Content */}
            <div
              className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
                isChatPanelVisible ? "border-l" : ""
              }`}
            >
              {/* Toggle Button */}
              <div className="sticky top-0 z-10 bg-white">
                <div className="flex items-center p-4">
                  <Button
                    onClick={toggleChatPanel}
                    variant="ghost"
                    size="icon"
                    className="mr-3 h-10 w-10 rounded-full bg-white text-purple-600 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200"
                    aria-label={isChatPanelVisible ? "Hide chat panel" : "Show chat panel"}
                  >
                    {isChatPanelVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
                  </Button>
                  <h2 className="text-lg font-medium">
                    {activeTab === "rfp" ? "Request for Proposal" : 
                     activeTab === "floorplan" ? "Floor Plan" : "Vendors"}
                  </h2>
                  {activeTab === "rfp" && (
                    <div className="ml-auto">
                      <Button className="bg-purple-600 hover:bg-purple-700">Edit</Button>
                    </div>
                  )}
                </div>
                <hr className="border-gray-200" />
              </div>

              {activeTab === "rfp" && <RfpContent />}
              {activeTab === "floorplan" && (
                <div className="p-4 md:p-6">
                  <h2 className="text-xl font-medium">Floor Plan (Coming Soon)</h2>
                </div>
              )}
              {activeTab === "vendors" && (
                <div className="p-4 md:p-6">
                  <h2 className="text-xl font-medium">Vendors (Coming Soon)</h2>
                </div>
              )}
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

import React, { useState, useEffect } from 'react';
import { getHealth, getTestStatus } from './services/api';
import './App.css';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { UserCircle } from 'lucide-react';
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
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Chat */}
            <ChatPanel />

            {/* Right Panel - Content */}
            <div className="flex-1 overflow-y-auto border-l">
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

import React, { useState, useEffect } from 'react';
import { getHealth, getTestStatus, generateRFP } from './services/api';
import './App.css';

function App() {
  const [health, setHealth] = useState<string>('');
  const [testStatus, setTestStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedRFP, setGeneratedRFP] = useState<string>('');
  const [rfpLoading, setRfpLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch health status
        const healthStatus = await getHealth();
        setHealth(healthStatus);
        
        // Fetch test status
        const testResponse = await getTestStatus();
        if (testResponse.success && testResponse.data) {
          setTestStatus(testResponse.data.status);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateRFP = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for RFP generation.');
      return;
    }

    setRfpLoading(true);
    setError(null);
    
    try {
      const rfpText = await generateRFP(prompt);
      setGeneratedRFP(rfpText);
    } catch (err) {
      console.error('Error generating RFP:', err);
      setError('Failed to generate RFP. Please try again later.');
    } finally {
      setRfpLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>IntelliPlan</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <p>Backend Health: {health}</p>
            <p>Database Connection: {testStatus !== null ? (testStatus ? 'Connected' : 'Disconnected') : 'Unknown'}</p>
          </>
        )}
      </header>

      <main className="App-main">
        <div className="rfp-section">
          <h2>RFP Generator</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your RFP prompt here..."
            rows={4}
            cols={50}
          />
          <button 
            onClick={handleGenerateRFP} 
            disabled={rfpLoading || !prompt.trim()}
          >
            {rfpLoading ? 'Generating...' : 'Generate RFP'}
          </button>

          {error && <p className="error">{error}</p>}

          {generatedRFP && (
            <div className="rfp-result">
              <h3>Generated RFP:</h3>
              <pre>{generatedRFP}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

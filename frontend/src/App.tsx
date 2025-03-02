import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/global.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import { AuthProvider } from './context/AuthContext';
import { FloorPlanProvider } from './context/FloorPlanContext';

// Mock authentication for development
const isAuthenticated = () => {
  return localStorage.getItem('authenticated') === 'true';
};

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return isAuthenticated() ? <>{element}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FloorPlanProvider>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/dashboard" 
                element={<ProtectedRoute element={<Dashboard />} />} 
              />
              <Route 
                path="/event/:id" 
                element={<ProtectedRoute element={<EventDetails />} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </FloorPlanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

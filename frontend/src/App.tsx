import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/global.css';
import './styles/rfp.css';
import './styles/chat.css';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import NewEventPage from './pages/NewEventPage';
import RFPPage from './pages/RFPPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FloorPlanProvider } from './context/FloorPlanContext';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user } = useAuth();
  return user ? <>{element}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/event/:id" 
          element={<ProtectedRoute element={<EventDetails />} />} 
        />
        <Route 
          path="/new-event" 
          element={<ProtectedRoute element={<NewEventPage />} />} 
        />
        <Route 
          path="/event/:eventId/rfp" 
          element={<ProtectedRoute element={<RFPPage />} />} 
        />
        <Route path="/dashboard" element={<Navigate to="/new-event" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FloorPlanProvider>
          <AppRoutes />
        </FloorPlanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

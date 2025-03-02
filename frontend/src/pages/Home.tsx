import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to IntelliPlan</h1>
        <p>The intelligent event planning assistant</p>
        <div className="home-buttons">
          <button 
            className="primary-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 
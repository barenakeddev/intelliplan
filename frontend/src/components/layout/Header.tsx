import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <h1>IntelliPlan</h1>
      </div>
      <div className="header-actions">
        {user ? (
          <>
            <span className="user-email">{user.email}</span>
            <button className="sign-out-button" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <button className="sign-in-button" onClick={() => navigate('/login')}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 
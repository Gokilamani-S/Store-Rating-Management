import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import NormalUserDashboard from './NormalUserDashboard';
import StoreOwnerDashboard from './StoreOwnerDashboard';

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'normal':
        return <NormalUserDashboard />;
      case 'store_owner':
        return <StoreOwnerDashboard />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="container">
          <h1>Store Rating System</h1>
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role.replace('_', ' ').toUpperCase()}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="dashboard-content">
        {renderDashboard()}
      </div>
    </div>
  );
}

export default Dashboard;
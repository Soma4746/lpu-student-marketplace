import React from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../utils/adminAccess';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { state } = useAuth();

  // Route to appropriate dashboard based on user role
  if (canAccessAdmin(state.user)) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;

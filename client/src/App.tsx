import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Layout from './components/layout/Layout';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import PurposeSelection from './pages/PurposeSelection';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterTypeSelection from './pages/auth/RegisterTypeSelection';
import StudentRegister from './pages/auth/StudentRegister';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
// AdminRegister removed - admins should only login
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import TalentStore from './pages/TalentStore';
import ItemDetails from './pages/ItemDetails';
import TalentDetails from './pages/TalentDetails';
import Profile from './pages/Profile';
import CreateItem from './pages/CreateItem';
import CreateTalent from './pages/CreateTalent';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
// Orders and Wishlist now imported from pages above

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ItemManagement from './pages/admin/ItemManagement';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/purpose" element={<PurposeSelection />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/talent-store" element={<TalentStore />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route path="/talent/:id" element={<TalentDetails />} />
              <Route path="/user/:id" element={<UserProfile />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterTypeSelection />} />
              <Route path="/register/student" element={<StudentRegister />} />
              {/* Admin registration route removed - admins should only login */}
              {/* Keep old register route for backward compatibility */}
              <Route path="/register/old" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/payment-success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              <Route path="/create-item" element={
                <ProtectedRoute>
                  <CreateItem />
                </ProtectedRoute>
              } />
              <Route path="/create-talent" element={
                <ProtectedRoute>
                  <CreateTalent />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="items" element={<ItemManagement />} />
              </Route>

              {/* Redirects */}
              <Route path="/items" element={<Navigate to="/marketplace" replace />} />
              <Route path="/talent" element={<Navigate to="/talent-store" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
      </Router>
    </AuthProvider>
  );
}

export default App;

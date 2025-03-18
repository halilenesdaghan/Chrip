import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Forums from './pages/Forums';
import ForumDetail from './pages/ForumDetail';
import CreateForum from './pages/CreateForum';
import Polls from './pages/Polls';
import PollDetail from './pages/PollDetail';
import CreatePoll from './pages/CreatePoll';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route wrapper - authenticated users will be redirected to home
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes (accessible by everyone) */}
      <Route path="/" element={<Home />} />
      
      {/* Authentication routes (redirect to home if already logged in) */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes (require authentication) */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      {/* Forum routes */}
      <Route path="/forums" element={<Forums />} />
      <Route path="/forums/:id" element={<ForumDetail />} />
      <Route path="/forums/create" element={
        <ProtectedRoute>
          <CreateForum />
        </ProtectedRoute>
      } />
      
      {/* Poll routes */}
      <Route path="/polls" element={<Polls />} />
      <Route path="/polls/:id" element={<PollDetail />} />
      <Route path="/polls/create" element={
        <ProtectedRoute>
          <CreatePoll />
        </ProtectedRoute>
      } />
      
      {/* Group routes */}
      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/groups/create" element={
        <ProtectedRoute>
          <CreateGroup />
        </ProtectedRoute>
      } />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
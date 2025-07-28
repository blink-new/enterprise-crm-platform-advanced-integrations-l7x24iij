import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import { TeamKanban } from './pages/TeamKanban';
import Opportunities from './pages/Opportunities';
import Contracts from './pages/Contracts';
import Integrations from './pages/Integrations';
import Users from './pages/Users';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contacts" 
            element={
              <ProtectedRoute requiredModule="contacts">
                <Layout><Contacts /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leads" 
            element={
              <ProtectedRoute requiredModule="leads">
                <Layout><Leads /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team-kanban" 
            element={
              <ProtectedRoute requiredModule="leads">
                <Layout><TeamKanban /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/opportunities" 
            element={
              <ProtectedRoute requiredModule="opportunities">
                <Layout><Opportunities /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contracts" 
            element={
              <ProtectedRoute requiredModule="contracts">
                <Layout><Contracts /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute requiredModule="integrations">
                <Layout><Integrations /></Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredModule="users" requiredPermission="read">
                <Layout><Users /></Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for future modules */}
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Companies</h1>
                    <p className="text-gray-600">Company management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-gray-600">Task management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Calendar</h1>
                    <p className="text-gray-600">Calendar integration coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute requiredModule="reports">
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-gray-600">Advanced reporting coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketing" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Marketing</h1>
                    <p className="text-gray-600">Marketing automation coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute requiredModule="billing">
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Billing</h1>
                    <p className="text-gray-600">Billing management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-gray-600">System settings coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import MainLayout from './screens/MainLayout';
import TopicDetailScreen from './screens/TopicDetailScreen';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/main" element={<MainLayout />} />
          <Route path="/topic/:topicName" element={<TopicDetailScreen />} />
          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

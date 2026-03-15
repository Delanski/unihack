import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Credits from './components/Credits/Credits';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Todo from './pages/Todo';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Cutscenes from './pages/Cutscenes';
import Statistics from './pages/Statistics';
import MainMenu from './pages/MainMenu/MainMenu';
import splashImage from './assets/backgrounds/mmSplashArt.png';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Credits />
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/menu"       element={<ProtectedRoute><MainMenu /></ProtectedRoute>} />
          <Route path="/todo"       element={<ProtectedRoute><Todo /></ProtectedRoute>} />
          <Route path="/pomodoro"   element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
          <Route path="/cutscenes"  element={<ProtectedRoute><Cutscenes /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/"           element={<Navigate to="/login" replace />} />
          <Route path="*"           element={<Navigate to="/menu" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
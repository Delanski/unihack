import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Todo from './pages/Todo';
import Pomodoro from './pages/Pomodoro/Pomodoro';
import Cutscenes from './pages/Cutscenes';
import Statistics from './pages/Statistics';
import MainMenu from './pages/MainMenu/MainMenu';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/menu"       element={<ProtectedRoute><MainMenu /></ProtectedRoute>} />
          <Route path="/todo"       element={<ProtectedRoute><Todo /></ProtectedRoute>} />
          <Route path="/pomodoro"   element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
          <Route path="/cutscenes"  element={<ProtectedRoute><Cutscenes /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Redirect root to login, catch all to menu */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
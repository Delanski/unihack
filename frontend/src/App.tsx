import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Landing from './pages/Landing'
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Todo from './pages/Todo';
import Pomodoro from './pages/Pomodoro';
import Cutscenes from './pages/Cutscenes';
import Statistics from './pages/Statistics';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Landing />} />  

          <Route path="/todo"       element={<ProtectedRoute><Todo /></ProtectedRoute>} />
          <Route path="/pomodoro"   element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
          <Route path="/cutscenes"  element={<ProtectedRoute><Cutscenes /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/todo" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
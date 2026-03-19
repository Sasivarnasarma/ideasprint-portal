import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import RegistrationSuccessful from './pages/RegistrationSuccessful';
import './assets/styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegistrationSuccessful />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

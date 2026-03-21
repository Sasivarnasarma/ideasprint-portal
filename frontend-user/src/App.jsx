import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubmissionProvider } from './context/SubmissionContext';
import Home from './pages/Home';
import Register from './pages/Register';
import RegistrationSuccessful from './pages/RegistrationSuccessful';
import Submission from './pages/Submission';
import SubmissionSuccessful from './pages/SubmissionSuccessful';
import './assets/styles/index.css';

function App() {
  return (
    <AuthProvider>
      <SubmissionProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-success" element={<RegistrationSuccessful />} />
          <Route path="/submission" element={<Submission />} />
          <Route path="/submission-successful" element={<SubmissionSuccessful />} />
        </Routes>
      </BrowserRouter>
      </SubmissionProvider>
    </AuthProvider>
  );
}

export default App;

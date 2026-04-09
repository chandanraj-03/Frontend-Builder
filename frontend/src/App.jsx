import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/landing_page/landing_page';
import Login from './pages/login_page/login';
import Overview from './pages/overview/overview';
import Project from './pages/project/project';
import BuildLog from './pages/build_log/build';
import Preview from './pages/preview/preview';
import Setting from './pages/settings/setting';
import History from './pages/history/history';
import Between from './pages/m_bettewen_n/between';
import FirstPage from './pages/firsrt/first';
import { useAuth } from './context/authcontext.jsx';

// Redirect unauthenticated users to /login
const Protected = ({ element }) => {
  const { token } = useAuth();
  return token ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/overview" element={<Protected element={<Overview />} />} />
        <Route path="/project" element={<Protected element={<Project />} />} />
        <Route path="/build-log" element={<Protected element={<BuildLog />} />} />
        <Route path="/preview" element={<Protected element={<Preview />} />} />
        <Route path="/settings" element={<Protected element={<Setting />} />} />
        <Route path="/history" element={<Protected element={<History />} />} />
        <Route path="/between" element={<Protected element={<Between />} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
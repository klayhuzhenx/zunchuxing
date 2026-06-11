import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from '@arco-design/web-react';
import DriverLayout from './layouts/DriverLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import TripList from './pages/TripList';
import TripDetail from './pages/TripDetail';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';

const darkTheme = {
  '--color-bg-1': '#0a0a0a',
  '--color-bg-2': '#141414',
  '--color-bg-3': '#1a1a1e',
  '--color-text-1': '#ffffff',
  // Minimal override — CSS handles the rest
};

export default function App() {
  return (
    <ConfigProvider>
      <div className="driver-app-dark" style={{ height: '100%' }}>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<DriverLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/trips" element={<TripList />} />
              <Route path="/trips/:id" element={<TripDetail />} />
              <Route path="/history" element={<TripHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </div>
    </ConfigProvider>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CitizenHome from './pages/CitizenHome';
import TrackQuery from './pages/TrackQuery';
import OfficialLogin from './pages/OfficialLogin';
import OfficialDashboard from './pages/OfficialDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CitizenHome />} />
            <Route path="/track" element={<TrackQuery />} />
            <Route path="/track/:ticketId" element={<TrackQuery />} />
            <Route path="/official" element={<OfficialLogin />} />
            <Route path="/official/dashboard" element={<OfficialDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

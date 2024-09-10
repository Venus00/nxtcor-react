import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Live from './pages/Live';
import Configuration from './pages/Configuration';
import Playback from './pages/playback';

const App: React.FC = () => {
  return (
    <Router>
      <div className="h-screen w-screen p-4">
      <Navbar />
        <Routes>
          <Route path="/live" element={<Live />} />
          <Route path="/playback" element={<Playback />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/" element={<Live />} />
        </Routes>
      </div>

    </Router>
  );
}

export default App;

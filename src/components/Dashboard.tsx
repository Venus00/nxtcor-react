import { Route, Routes } from "react-router-dom";
import Navbar from "./Navbar";
import Live from "../pages/Live";
import Playback from "../pages/playback";
import Configuration from "../pages/Configuration";
import Analytics from "./configuration/Analytics";

const Dashboard: React.FC = () => (
  <div className="h-full w-full flex flex-col bg-black">
    <Navbar />
    <Routes>
      <Route path="/live" element={<Live />} />
      <Route path="/playback" element={<Playback />} />
      <Route path="/configuration" element={<Configuration />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/" element={<Live />} />
    </Routes>
  </div>
);
export default Dashboard;
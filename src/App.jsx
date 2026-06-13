import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import SignUp from './pages/SignUp';
import Permissions from './pages/Permissions';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import CheckIn from './pages/CheckIn';
import Insights from './pages/Insights';
import Trends from './pages/Trends';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/empty" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

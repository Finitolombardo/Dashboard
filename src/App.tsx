import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import MissionControl from './pages/MissionControl';
import Quests from './pages/Quests';
import QuestDetail from './pages/QuestDetail';
import Agents from './pages/Agents';
import Inbox from './pages/Inbox';
import Systems from './pages/Systems';
import Campaigns from './pages/Campaigns';
import SessionDetail from './pages/SessionDetail';
import Signals from './pages/Signals';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<MissionControl />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/quests/:id" element={<QuestDetail />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

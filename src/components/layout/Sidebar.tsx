import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Crosshair,
  Bot,
  Inbox,
  Server,
  Megaphone,
  Zap,
  Settings,
} from 'lucide-react';

const mainNav = [
  { to: '/', icon: LayoutDashboard, label: 'Mission Control' },
  { to: '/quests', icon: Crosshair, label: 'Quests' },
  { to: '/agents', icon: Bot, label: 'Agenten' },
  { to: '/inbox', icon: Inbox, label: 'Eingang' },
  { to: '/systems', icon: Server, label: 'Systeme' },
  { to: '/campaigns', icon: Megaphone, label: 'Kampagnen' },
];

const secondaryNav = [
  { to: '/signals', icon: Zap, label: 'Signale' },
  { to: '/settings', icon: Settings, label: 'Einstellungen' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-screen bg-surface-900 border-r border-surface-700/50 flex flex-col fixed left-0 top-0 z-40">
      <div className="px-4 py-4 border-b border-surface-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gold-500 flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-surface-50 leading-tight">Mission Control</h1>
            <p className="text-2xs text-surface-500">Operator-Cockpit</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="mb-3">
          <p className="px-3 mb-1.5 text-2xs font-medium text-surface-500 uppercase tracking-wider">Navigation</p>
          {mainNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="pt-3 border-t border-surface-700/30">
          <p className="px-3 mb-1.5 text-2xs font-medium text-surface-500 uppercase tracking-wider">Sonstiges</p>
          {secondaryNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-surface-700/50">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-6 h-6 rounded-full bg-surface-700 flex items-center justify-center">
            <span className="text-2xs font-medium text-surface-300">OP</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-surface-300 truncate">Operator</p>
            <p className="text-2xs text-surface-500">Online</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-success-500 ml-auto flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

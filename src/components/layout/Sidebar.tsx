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
    <aside className="w-56 h-screen bg-surface-950 border-r border-white/[0.06] flex flex-col fixed left-0 top-0 z-40">
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center shadow-[0_0_12px_rgba(201,144,30,0.15)]">
            <LayoutDashboard size={14} className="text-surface-950" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-surface-50 leading-tight tracking-tight">Mission Control</h1>
            <p className="text-2xs text-surface-500">Operator-Cockpit</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="mb-3">
          <p className="px-3 mb-2 text-2xs font-semibold text-surface-500 uppercase tracking-widest">Navigation</p>
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

        <div className="pt-3 border-t border-white/[0.04]">
          <p className="px-3 mb-2 text-2xs font-semibold text-surface-500 uppercase tracking-widest">Sonstiges</p>
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

      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-6 h-6 rounded-full bg-surface-800 border border-white/[0.06] flex items-center justify-center">
            <span className="text-2xs font-medium text-surface-300">OP</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-surface-300 truncate">Operator</p>
            <p className="text-2xs text-surface-500">Online</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-success-400 ml-auto flex-shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.3)]" />
        </div>
      </div>
    </aside>
  );
}

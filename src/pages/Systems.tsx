import { useState } from 'react';
import { Workflow, Play, Activity, Server, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const sectionTabs = [
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'executions', label: 'Ausführungen', icon: Play },
  { id: 'sessions', label: 'Sitzungen', icon: Activity },
  { id: 'services', label: 'Dienste', icon: Server },
];

function NotConnected({ section }: { section: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3">
      <AlertCircle size={32} className="text-surface-700" />
      <p className="text-sm font-medium text-surface-400">{section} – noch nicht verdrahtet</p>
      <p className="text-2xs text-surface-600 text-center max-w-sm">
        Kein Backend-Endpunkt für {section.toLowerCase()} verfügbar.<br />
        Daten werden angezeigt, sobald <code className="font-mono">tasks.getvoidra.com/api/{section.toLowerCase()}</code> implementiert ist.
      </p>
    </div>
  );
}

export default function Systems() {
  const [activeSection, setActiveSection] = useState('workflows');

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Systeme"
        subtitle="Workflows · Ausführungen · Sitzungen · Dienste"
      />

      <div className="border-b border-white/[0.06] bg-surface-900/40">
        <div className="flex gap-1 px-6 pt-1">
          {sectionTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-2xs font-medium border-b-2 transition-colors ${
                  activeSection === tab.id
                    ? 'border-gold-400 text-gold-400'
                    : 'border-transparent text-surface-500 hover:text-surface-300'
                }`}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSection === 'workflows' && <NotConnected section="Workflows" />}
        {activeSection === 'executions' && <NotConnected section="Ausführungen" />}
        {activeSection === 'sessions' && <NotConnected section="Sitzungen" />}
        {activeSection === 'services' && <NotConnected section="Dienste" />}
      </div>
    </div>
  );
}

import { Database, Key, Bell, Palette, Plug } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function Settings() {
  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Einstellungen"
        subtitle="Konfiguration und Präferenzen"
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <SettingsCard
          icon={Database}
          title="Datenbank"
          description="Supabase-Verbindung und Datenverwaltung"
        />
        <SettingsCard
          icon={Key}
          title="API-Schlüssel"
          description="Verwaltung externer Dienst-Zugangsdaten"
        />
        <SettingsCard
          icon={Plug}
          title="Integrationen"
          description="Notion, Instantly, n8n und weitere Anbindungen"
        />
        <SettingsCard
          icon={Bell}
          title="Benachrichtigungen"
          description="Signal-Schwellenwerte und Alarm-Konfiguration"
        />
        <SettingsCard
          icon={Palette}
          title="Darstellung"
          description="Design-Einstellungen und Anpassungen"
        />
      </div>
    </div>
  );
}

function SettingsCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="card-hover p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-surface-900/70 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-surface-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-surface-200">{title}</h3>
        <p className="text-2xs text-surface-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

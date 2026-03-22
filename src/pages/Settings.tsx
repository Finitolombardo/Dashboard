import { Database, Key, Bell, Palette, Plug, CheckCircle, ExternalLink } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import { API_BASE_URL, FRONTEND_URL, AGENT_CHAT_URL, LEGACY_URL } from '../lib/config';

export default function Settings() {
  const runtimeConfigured = !!import.meta.env.VITE_API_BASE_URL;
  const supabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Einstellungen"
        subtitle="Konfiguration und Praeferenzen"
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {/* Systemverbindung - aktive Karte */}
        <div className="card p-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-900/70 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
              <Database size={18} className="text-gold-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-surface-200">Systemverbindung</h3>
                {runtimeConfigured ? (
                  <span className="flex items-center gap-1 text-2xs text-success-400 border border-success-500/20 bg-success-500/10 rounded px-1.5 py-0.5">
                    <CheckCircle size={10} />
                    Runtime aktiv
                  </span>
                ) : supabaseConfigured ? (
                  <span className="text-2xs text-gold-400 border border-gold-500/20 bg-gold-500/10 rounded px-1.5 py-0.5">
                    Supabase
                  </span>
                ) : (
                  <span className="text-2xs text-surface-500 border border-white/[0.08] rounded px-1.5 py-0.5">
                    Mock-Daten
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1.5">
                <UrlRow
                  label="Frontend / UI"
                  url={FRONTEND_URL}
                  tag="diese App"
                  active
                />
                <UrlRow
                  label="Operative Runtime"
                  url={API_BASE_URL}
                  tag="Quest-SoT"
                  active={runtimeConfigured}
                />
                <UrlRow
                  label="Quest-Ansicht (Runtime-UI)"
                  url={`${API_BASE_URL}/tasks`}
                  tag="kein Frontend"
                />
                <UrlRow
                  label="Agent-Chat"
                  url={AGENT_CHAT_URL}
                />
                <UrlRow
                  label="Legacy"
                  url={LEGACY_URL}
                  tag="eingefroren"
                  legacy
                />
              </div>

              {!runtimeConfigured && (
                <p className="mt-2 text-2xs text-surface-500">
                  Setze <code className="text-gold-400/80">VITE_API_BASE_URL=https://tasks.getvoidra.com</code> um die operative Runtime zu verbinden.
                </p>
              )}
            </div>
          </div>
        </div>

        <SettingsCard
          icon={Key}
          title="API-Schluessel"
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

function UrlRow({
  label,
  url,
  tag,
  active,
  legacy,
}: {
  label: string;
  url: string;
  tag?: string;
  active?: boolean;
  legacy?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-2xs">
      <span className="w-36 text-surface-500 flex-shrink-0">{label}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1 truncate font-mono hover:underline ${
          legacy
            ? 'text-surface-600 line-through'
            : active
            ? 'text-gold-400'
            : 'text-surface-400'
        }`}
      >
        {url.replace('https://', '')}
        <ExternalLink size={9} className="flex-shrink-0 opacity-50" />
      </a>
      {tag && (
        <span className={`flex-shrink-0 border rounded px-1 py-0 ${
          legacy
            ? 'border-surface-700 text-surface-600'
            : 'border-white/[0.08] text-surface-500'
        }`}>
          {tag}
        </span>
      )}
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4 opacity-60 cursor-default">
      <div className="w-10 h-10 rounded-lg bg-surface-900/70 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-surface-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-surface-200">{title}</h3>
        <p className="text-2xs text-surface-500 mt-0.5">{description}</p>
      </div>
      <span className="text-2xs text-surface-500 border border-white/[0.08] rounded px-1.5 py-0.5 flex-shrink-0">
        Demnaechst
      </span>
    </div>
  );
}

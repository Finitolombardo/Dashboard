import { Megaphone, AlertCircle } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

export default function Campaigns() {
  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Kampagnen"
        subtitle="Kampagnen-Daten noch nicht verdrahtet"
      />

      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone size={32} className="text-surface-700" />
          <AlertCircle size={24} className="text-surface-700" />
        </div>
        <p className="text-sm font-medium text-surface-400">Kampagnen – noch nicht verdrahtet</p>
        <p className="text-2xs text-surface-600 text-center max-w-sm">
          Kampagnen-Daten (Instantly, etc.) haben noch keinen Backend-Endpunkt unter{' '}
          <code className="font-mono">tasks.getvoidra.com/api/campaigns</code>.<br />
          Die Seite wird befüllt, sobald dieser Endpunkt implementiert ist.
        </p>
      </div>
    </div>
  );
}

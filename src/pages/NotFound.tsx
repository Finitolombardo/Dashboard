import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-4xl font-semibold text-surface-600">404</p>
      <h1 className="text-lg font-medium text-surface-200">Seite nicht gefunden</h1>
      <p className="text-sm text-surface-500 max-w-xs">
        Diese Seite existiert nicht oder wurde verschoben.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 btn-primary flex items-center gap-2"
      >
        <Home size={14} />
        Zurück zu Mission Control
      </button>
    </div>
  );
}

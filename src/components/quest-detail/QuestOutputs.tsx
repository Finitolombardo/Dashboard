import { FileText, Link as LinkIcon, BarChart3, FileImage, File, Package, ExternalLink } from 'lucide-react';
import type { Artefact } from '../../types';
import TimeAgo from '../shared/TimeAgo';

interface QuestOutputsProps {
  artefacts: Artefact[];
}

const typeIcons: Record<string, React.ElementType> = {
  file: File,
  link: LinkIcon,
  report: BarChart3,
  summary: FileText,
  doc: FileText,
  log: FileText,
  screenshot: FileImage,
  bundle: Package,
};

const typeLabels: Record<string, string> = {
  file: 'Datei',
  link: 'Link',
  report: 'Bericht',
  summary: 'Zusammenfassung',
  doc: 'Dokument',
  log: 'Protokoll',
  screenshot: 'Screenshot',
  bundle: 'Paket',
};

export default function QuestOutputs({ artefacts }: QuestOutputsProps) {
  if (artefacts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Package size={24} className="text-surface-600 mx-auto mb-2" />
          <p className="text-sm text-surface-500">Noch keine Ergebnisse</p>
          <p className="text-2xs text-surface-600 mt-1">Artefakte werden hier erscheinen, sobald sie erstellt werden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="grid grid-cols-2 gap-3">
        {artefacts.map(artefact => {
          const Icon = typeIcons[artefact.type] || File;
          return (
            <div key={artefact.id} className="card-hover p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-surface-800 border border-surface-700/50 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-surface-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-surface-200 truncate">{artefact.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-surface-500">{typeLabels[artefact.type] || artefact.type}</span>
                    <span className="text-2xs text-surface-600">von {artefact.created_by}</span>
                  </div>
                  <TimeAgo date={artefact.created_at} className="mt-1 block" />
                </div>
                <button className="text-surface-500 hover:text-accent-400 transition-colors">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

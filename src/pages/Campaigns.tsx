import { useNavigate } from 'react-router-dom';
import { Megaphone, TrendingUp, TrendingDown, AlertTriangle, Crosshair, ExternalLink } from 'lucide-react';
import { mockCampaigns } from '../data/mock';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import TimeAgo from '../components/shared/TimeAgo';

export default function Campaigns() {
  const navigate = useNavigate();

  const totalSent = mockCampaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalReplied = mockCampaigns.reduce((sum, c) => sum + c.replied, 0);
  const totalPositive = mockCampaigns.reduce((sum, c) => sum + c.positive_replies, 0);

  return (
    <div className="h-screen flex flex-col">
      <PageHeader
        title="Kampagnen"
        subtitle={`${mockCampaigns.length} Kampagnen | ${totalSent} E-Mails gesendet`}
      />

      <div className="px-6 py-3 border-b border-surface-700/50 bg-surface-900/30">
        <div className="flex items-center gap-6">
          <MetricBadge label="Gesendet" value={totalSent.toLocaleString('de-DE')} />
          <MetricBadge label="Beantwortet" value={totalReplied.toString()} />
          <MetricBadge label="Positive Antworten" value={totalPositive.toString()} trend="up" />
          <MetricBadge
            label="Durchschn. Reply-Rate"
            value={totalSent > 0 ? `${((totalReplied / totalSent) * 100).toFixed(1)}%` : '0%'}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-3">
          {mockCampaigns.map(campaign => {
            const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0';
            const replyRate = campaign.sent > 0 ? ((campaign.replied / campaign.sent) * 100).toFixed(1) : '0';
            const positiveRate = campaign.replied > 0 ? ((campaign.positive_replies / campaign.replied) * 100).toFixed(0) : '0';
            const hasBounceIssue = campaign.bounce_rate > 5;
            const hasLowReplyRate = campaign.sent > 100 && parseFloat(replyRate) < 1.5;

            return (
              <div key={campaign.id} className={`card p-4 ${hasBounceIssue ? 'border-warning-500/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-surface-800 border border-surface-700/50 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={16} className="text-surface-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-surface-100">{campaign.name}</h3>
                      <StatusBadge status={campaign.status} dot />
                      <span className="text-2xs text-surface-600">{campaign.platform}</span>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mt-3">
                      <CampaignMetric label="Gesendet" value={campaign.sent.toLocaleString('de-DE')} />
                      <CampaignMetric label="Geoeffnet" value={campaign.opened.toLocaleString('de-DE')} sub={`${openRate}%`} />
                      <CampaignMetric label="Beantwortet" value={campaign.replied.toString()} sub={`${replyRate}%`} warn={hasLowReplyRate} />
                      <CampaignMetric label="Positiv" value={campaign.positive_replies.toString()} sub={`${positiveRate}%`} />
                      <CampaignMetric
                        label="Bounce"
                        value={`${campaign.bounce_rate}%`}
                        warn={hasBounceIssue}
                      />
                      <div className="text-right">
                        <TimeAgo date={campaign.last_update} />
                      </div>
                    </div>

                    {(hasBounceIssue || hasLowReplyRate) && (
                      <div className="flex items-center gap-3 mt-3">
                        {hasBounceIssue && (
                          <div className="flex items-center gap-1 text-2xs text-warning-400">
                            <AlertTriangle size={10} />
                            Bounce-Rate ueber Schwellenwert
                          </div>
                        )}
                        {hasLowReplyRate && (
                          <div className="flex items-center gap-1 text-2xs text-warning-400">
                            <TrendingDown size={10} />
                            Niedrige Reply-Rate
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {(hasBounceIssue || hasLowReplyRate) && (
                      <button className="btn-primary text-2xs py-1 px-2">
                        <Crosshair size={10} /> Optimierungs-Quest
                      </button>
                    )}
                    {campaign.linked_quest_id && (
                      <button
                        className="btn-ghost text-2xs py-1 px-2"
                        onClick={() => navigate(`/quests/${campaign.linked_quest_id}`)}
                      >
                        <ExternalLink size={10} /> Quest
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricBadge({ label, value, trend }: { label: string; value: string; trend?: 'up' | 'down' }) {
  return (
    <div>
      <p className="text-2xs text-surface-500">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-sm font-semibold text-surface-100">{value}</p>
        {trend === 'up' && <TrendingUp size={12} className="text-success-400" />}
        {trend === 'down' && <TrendingDown size={12} className="text-danger-400" />}
      </div>
    </div>
  );
}

function CampaignMetric({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div>
      <p className="text-2xs text-surface-500">{label}</p>
      <p className={`text-sm font-medium ${warn ? 'text-warning-400' : 'text-surface-200'}`}>{value}</p>
      {sub && <p className={`text-2xs ${warn ? 'text-warning-500' : 'text-surface-500'}`}>{sub}</p>}
    </div>
  );
}

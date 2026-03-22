import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Cpu, HelpCircle, CheckCircle2, Package, AlertTriangle, UserPlus, BookOpen } from 'lucide-react';
import type { Quest, Message, Event, Agent } from '../../types';
import TimeAgo from '../shared/TimeAgo';

interface QuestWorkProps {
  quest: Quest;
  messages: Message[];
  events: Event[];
  agent?: Agent;
  isProcessing?: boolean;
  onSend?: (content: string) => void;
}

export default function QuestWork({ quest, messages, events, agent, isProcessing, onSend }: QuestWorkProps) {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isProcessing]);

  function handleSend() {
    const text = newMessage.trim();
    if (!text) return;
    setNewMessage('');
    onSend?.(text);
  }

  const agentName = agent?.name || 'Agent';
  const isActiveQuest = !['done', 'archived'].includes(quest.status);

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Agent status bar */}
        {agent && (
          <div className="px-6 py-2 border-b border-white/[0.06] bg-surface-900/30 flex items-center gap-2">
            <Bot size={14} className="text-surface-400" />
            <span className="text-xs font-medium text-surface-300">{agentName}</span>
            <span className="text-2xs text-surface-600">·</span>
            <span className="text-2xs text-surface-500">{agent.role}</span>
            <div className={`w-1.5 h-1.5 rounded-full ml-auto ${
              isProcessing ? 'bg-gold-400 animate-pulse' : isActiveQuest ? 'bg-emerald-400' : 'bg-surface-600'
            }`} />
            <span className="text-2xs text-surface-500">
              {isProcessing ? 'arbeitet…' : isActiveQuest ? 'bereit' : 'inaktiv'}
            </span>
          </div>
        )}

        {(quest.current_step || quest.next_step) && (
          <div className="px-6 py-3 border-b border-white/[0.06] bg-surface-900/30">
            <div className="grid grid-cols-2 gap-4">
              {quest.current_step && (
                <div>
                  <span className="text-2xs font-medium text-surface-500 uppercase tracking-wider">Aktueller Schritt</span>
                  <p className="text-xs text-surface-200 mt-0.5">{quest.current_step}</p>
                </div>
              )}
              {quest.next_step && (
                <div>
                  <span className="text-2xs font-medium text-surface-500 uppercase tracking-wider">Nächster Schritt</span>
                  <p className="text-xs text-surface-200 mt-0.5">{quest.next_step}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-surface-600 text-sm">
              Noch keine Nachrichten. Schreibe dem Agenten.
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {/* Typing indicator */}
          {isProcessing && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-surface-700">
                <Bot size={14} className="text-surface-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-2xs font-medium text-surface-400">{agentName}</span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-surface-900/60">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="px-6 py-3 border-t border-white/[0.06] bg-surface-900/40">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input"
              placeholder={`Nachricht an ${agentName}...`}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              className="btn-primary px-3"
              onClick={handleSend}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="w-64 border-l border-white/[0.06] bg-surface-900/40 overflow-y-auto flex-shrink-0">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Zeitleiste</h3>
          </div>
          <div className="px-4 py-3 space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-surface-600 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-2xs text-surface-300">{event.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-2xs text-surface-600">{event.actor}</span>
                    <TimeAgo date={event.created_at} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isOperator = message.sender_type === 'operator';
  const isSystem = message.sender_type === 'system';
  const isEvent = message.message_type === 'event';

  // Dispatch lifecycle events get special rendering
  if (isEvent || (isSystem && message.message_type === 'event')) {
    return <DispatchEventBubble message={message} />;
  }

  const Icon = isOperator ? User : isSystem ? Cpu : Bot;

  const typeIcons: Record<string, React.ElementType> = {
    question: HelpCircle,
    approval: CheckCircle2,
    output: Package,
  };
  const TypeIcon = typeIcons[message.message_type];

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-900/50 rounded text-2xs text-surface-500">
        <Cpu size={12} className="flex-shrink-0" />
        <span className="font-medium text-surface-400">{message.sender_name}</span>
        <span className="text-surface-600">·</span>
        <span>{message.content}</span>
        <TimeAgo date={message.created_at} className="ml-auto" />
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOperator ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
        isOperator ? 'bg-gold-500/15' : 'bg-surface-700'
      }`}>
        <Icon size={14} className={isOperator ? 'text-gold-400' : 'text-surface-400'} />
      </div>
      <div className={`max-w-[75%] ${isOperator ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isOperator ? 'justify-end' : ''}`}>
          <span className="text-2xs font-medium text-surface-400">{message.sender_name}</span>
          {TypeIcon && <TypeIcon size={10} className="text-surface-500" />}
          <TimeAgo date={message.created_at} />
        </div>
        <div className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
          isOperator
            ? 'bg-gold-500/10 text-surface-200'
            : 'bg-surface-900/60 text-surface-300'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

/** Renders dispatch lifecycle events with contextual icons and colors. */
function DispatchEventBubble({ message }: { message: Message }) {
  const content = message.content.toLowerCase();

  let Icon = Cpu;
  let colorClass = 'text-surface-400';
  let bgClass = 'bg-surface-900/50 border-surface-700/50';

  if (content.includes('beigetreten') || content.includes('übernommen')) {
    Icon = UserPlus;
    colorClass = 'text-emerald-400';
    bgClass = 'bg-emerald-500/5 border-emerald-500/20';
  } else if (content.includes('fehlgeschlagen') || content.includes('blockiert')) {
    Icon = AlertTriangle;
    colorClass = 'text-red-400';
    bgClass = 'bg-red-500/5 border-red-500/20';
  } else if (content.includes('angefordert') || content.includes('warte')) {
    Icon = Cpu;
    colorClass = 'text-amber-400';
    bgClass = 'bg-amber-500/5 border-amber-500/20';
  } else if (content.includes('abgeschlossen')) {
    Icon = CheckCircle2;
    colorClass = 'text-emerald-400';
    bgClass = 'bg-emerald-500/5 border-emerald-500/20';
  } else if (content.includes('playbook') || content.includes('archivarius')) {
    Icon = BookOpen;
    colorClass = 'text-blue-400';
    bgClass = 'bg-blue-500/5 border-blue-500/20';
  } else if (content.includes('analyse') || content.includes('verbesserung')) {
    Icon = BookOpen;
    colorClass = 'text-violet-400';
    bgClass = 'bg-violet-500/5 border-violet-500/20';
  }

  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded border ${bgClass}`}>
      <Icon size={14} className={`flex-shrink-0 mt-0.5 ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-surface-200">{message.content}</span>
      </div>
      <TimeAgo date={message.created_at} className="flex-shrink-0" />
    </div>
  );
}

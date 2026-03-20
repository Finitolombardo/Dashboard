import { useState } from 'react';
import { Send, Bot, User, Cpu, HelpCircle, CheckCircle2, Package } from 'lucide-react';
import type { Quest, Message, Event } from '../../types';
import TimeAgo from '../shared/TimeAgo';

interface QuestWorkProps {
  quest: Quest;
  messages: Message[];
  events: Event[];
}

export default function QuestWork({ quest, messages, events }: QuestWorkProps) {
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col min-w-0">
        {(quest.current_step || quest.next_step) && (
          <div className="px-6 py-3 border-b border-surface-700/50 bg-surface-900/20">
            <div className="grid grid-cols-2 gap-4">
              {quest.current_step && (
                <div>
                  <span className="text-2xs font-medium text-surface-500 uppercase tracking-wider">Aktueller Schritt</span>
                  <p className="text-xs text-surface-200 mt-0.5">{quest.current_step}</p>
                </div>
              )}
              {quest.next_step && (
                <div>
                  <span className="text-2xs font-medium text-surface-500 uppercase tracking-wider">Naechster Schritt</span>
                  <p className="text-xs text-surface-200 mt-0.5">{quest.next_step}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        <div className="px-6 py-3 border-t border-surface-700/50 bg-surface-900/30">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input"
              placeholder="Nachricht an den Agenten..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newMessage.trim() && setNewMessage('')}
            />
            <button
              className="btn-primary px-3"
              onClick={() => newMessage.trim() && setNewMessage('')}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-64 border-l border-surface-700/50 bg-surface-900/30 overflow-y-auto flex-shrink-0">
        <div className="px-4 py-3 border-b border-surface-700/50">
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
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isOperator = message.sender_type === 'operator';
  const isSystem = message.sender_type === 'system';

  const Icon = isOperator ? User : isSystem ? Cpu : Bot;

  const typeIcons: Record<string, React.ElementType> = {
    question: HelpCircle,
    approval: CheckCircle2,
    output: Package,
  };
  const TypeIcon = typeIcons[message.message_type];

  if (isSystem) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-800/50 rounded text-2xs text-surface-500">
        <Cpu size={12} className="flex-shrink-0" />
        <span>{message.content}</span>
        <TimeAgo date={message.created_at} className="ml-auto" />
      </div>
    );
  }

  return (
    <div className={`flex gap-2.5 ${isOperator ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
        isOperator ? 'bg-accent-600/20' : 'bg-surface-700'
      }`}>
        <Icon size={14} className={isOperator ? 'text-accent-400' : 'text-surface-400'} />
      </div>
      <div className={`max-w-[75%] ${isOperator ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-1.5 mb-1 ${isOperator ? 'justify-end' : ''}`}>
          <span className="text-2xs font-medium text-surface-400">{message.sender_name}</span>
          {TypeIcon && <TypeIcon size={10} className="text-surface-500" />}
          <TimeAgo date={message.created_at} />
        </div>
        <div className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
          isOperator
            ? 'bg-accent-600/15 text-surface-200'
            : 'bg-surface-800 text-surface-300'
        }`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

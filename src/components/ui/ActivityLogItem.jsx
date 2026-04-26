import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Move, 
  Type, 
  Calendar, 
  CheckCircle2, 
  Archive, 
  AlertCircle, 
  UserPlus, 
  MessageSquare, 
  PlusCircle 
} from 'lucide-react';

const ACTION_CONFIG = {
  'card.created': { icon: PlusCircle, color: 'text-green-500', bg: 'bg-green-50' },
  'card.moved': { icon: Move, color: 'text-blue-500', bg: 'bg-blue-50' },
  'card.renamed': { icon: Type, color: 'text-purple-500', bg: 'bg-purple-50' },
  'card.due_date_changed': { icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
  'card.completed': { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
  'card.reopened': { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/5' },
  'card.archived': { icon: Archive, color: 'text-text-tertiary', bg: 'bg-bg-secondary' },
  'card.unarchived': { icon: PlusCircle, color: 'text-primary', bg: 'bg-primary/5' },
  'card.priority_changed': { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/5' },
  'card.member_added': { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/5' },
  'comment.created': { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const ActivityLogItem = ({ log }) => {
  const config = ACTION_CONFIG[log.action] || { icon: AlertCircle, color: 'text-text-tertiary', bg: 'bg-bg-secondary' };
  const Icon = config.icon;

  const renderActionText = () => {
    const meta = log.metadata || {};
    
    switch (log.action) {
      case 'card.created':
        return <span>created this card in <strong>{meta.list_title}</strong></span>;
      case 'card.moved':
        return (
          <span>
            moved this card from <strong>{meta.from_list_title}</strong> to <strong>{meta.to_list_title}</strong>
          </span>
        );
      case 'card.renamed':
        return <span>renamed from "{meta.old_title}" to <strong>"{meta.new_title}"</strong></span>;
      case 'card.due_date_changed':
        return <span>changed due date to <strong>{meta.new_due_date ? new Date(meta.new_due_date).toLocaleDateString() : 'none'}</strong></span>;
      case 'card.completed':
        return <span>marked this card as <strong>completed</strong></span>;
      case 'card.reopened':
        return <span>reopened this card</span>;
      case 'card.archived':
        return <span>archived this card</span>;
      case 'card.unarchived':
        return <span>sent this card back to the board</span>;
      case 'card.priority_changed':
        return <span>set priority to <strong>{meta.new_priority}</strong></span>;
      case 'card.member_added':
        return <span>added a member to this card</span>;
      case 'comment.created':
        return <span>added a comment</span>;
      default:
        return <span>performed an action: {log.action}</span>;
    }
  };

  const userInitial = log.profiles?.full_name?.[0] || log.profiles?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="flex gap-4 group">
      <div className="shrink-0 mt-1">
        <div className={`w-8 h-8 rounded-xl ${config.bg} ${config.color} flex items-center justify-center shadow-sm`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-sm text-text-secondary leading-relaxed">
          <span className="font-black text-foreground mr-1 hover:text-primary cursor-pointer transition-colors">
            {log.profiles?.full_name || log.profiles?.email}
          </span>
          {renderActionText()}
        </div>
        <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          {log.cards?.title && (
            <>
              <span className="w-1 h-1 bg-text-tertiary/20 rounded-full" />
              <span className="truncate max-w-[120px]">on {log.cards.title}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogItem;

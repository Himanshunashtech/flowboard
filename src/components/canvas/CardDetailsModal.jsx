import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlignLeft, CheckSquare, MessageCircle, Paperclip, Clock, 
  UserPlus, Tag, Flag, Trash2, Share2, Plus, Timer, Play, Pause, 
  Square, Calendar, MoreHorizontal, Check, ChevronDown, Copy,
  ArrowRight, Star, Eye, Zap, Archive, Edit3, Network, Settings2,
  Sparkles, AlertCircle, CheckCircle2, Palette, Loader2, ExternalLink
} from 'lucide-react';
import { toggleModal, setActiveCardId } from '../../store/slices/uiSlice';
import { updateCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';
import { compressImage } from '../../lib/imageUtils';
import RichTextEditor from '../ui/RichTextEditor';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import CardActivityList from './CardActivityList';

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  NONE:     { label: 'No Priority', color: 'text-gray-400',   bg: 'bg-gray-100',      dot: 'bg-gray-300' },
  LOW:      { label: 'Low',         color: 'text-blue-500',   bg: 'bg-blue-50',       dot: 'bg-blue-400' },
  MEDIUM:   { label: 'Medium',      color: 'text-yellow-600', bg: 'bg-yellow-50',     dot: 'bg-yellow-400' },
  HIGH:     { label: 'High',        color: 'text-orange-500', bg: 'bg-orange-50',     dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical',    color: 'text-red-600',    bg: 'bg-red-50',        dot: 'bg-red-500' },
};

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useTimer(cardId, userId, onStop) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeEntry, setActiveEntry] = useState(null);
  const intervalRef = useRef(null);

  // Load any in-progress timer on mount
  useEffect(() => {
    const loadActiveTimer = async () => {
      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .is('ended_at', null)
        .maybeSingle();
      if (data) {
        setActiveEntry(data);
        const secs = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000);
        setElapsed(secs);
        setRunning(true);
      }
    };
    if (cardId && userId) loadActiveTimer();
    return () => clearInterval(intervalRef.current);
  }, [cardId, userId]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = async () => {
    const { data } = await supabase
      .from('time_entries')
      .insert({ card_id: cardId, user_id: userId, started_at: new Date().toISOString() })
      .select().single();
    if (data) { setActiveEntry(data); setRunning(true); }
  };

  const stop = async () => {
    if (!activeEntry) return;
    const { data } = await supabase.from('time_entries')
      .update({ ended_at: new Date().toISOString(), duration_seconds: elapsed })
      .eq('id', activeEntry.id)
      .select().single();
    
    setRunning(false);
    setActiveEntry(null);
    setElapsed(0);
    if (onStop && data) onStop(data);
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  return { running, elapsed, fmt, start, stop };
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
const ChecklistProgress = ({ items }) => {
  const total = items.length;
  const done = items.filter(i => i.is_completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className={`text-xs font-black tabular-nums ${pct === 100 ? 'text-green-600' : 'text-text-tertiary'}`}>{pct}%</span>
      <div className="flex-1 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-brand-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-xs text-text-tertiary tabular-nums">{done}/{total}</span>
    </div>
  );
};

// ─── Sidebar Action Button ────────────────────────────────────────────────────
const SidebarBtn = ({ icon: Icon, label, onClick, danger, active }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left
      ${danger ? 'text-red-600 hover:bg-red-50' : active ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
  >
    <Icon size={16} className="shrink-0" />
    <span>{label}</span>
  </button>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CardDetailsModal = () => {
  const dispatch = useDispatch();
  const { activeBoard, lists, cards, members, labels } = useSelector(s => s.board);
  const { activeCardId } = useSelector(s => s.ui);
  const { user } = useSelector(s => s.auth);

  const [card, setCard] = useState(null);
  const [list, setList] = useState(null);
  const [checklists, setChecklists] = useState([]);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [cardLabels, setCardLabels] = useState([]);
  const [cardAssignees, setCardAssignees] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [subtasks, setSubtasks] = useState([]);
  const [blockers, setBlockers] = useState([]); // cards that block this card
  const [cardsBlockingOthers, setCardsBlockingOthers] = useState([]); // cards that this card blocks
  const [similarCards, setSimilarCards] = useState([]);

  // Panel visibility state
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [showLabelPanel, setShowLabelPanel] = useState(false);
  const [showDatePanel, setShowDatePanel] = useState(false);
  const [showCoverPanel, setShowCoverPanel] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState({});
  const [commentText, setCommentText] = useState('');
  const [commentDraft, setCommentDraft] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);

  const timer = useTimer(card?.id, user?.id, (newEntry) => {
    setTimeEntries(prev => [newEntry, ...prev]);
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !card) return;

    let fileToUpload = file;
    if (file.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        fileToUpload = await compressImage(file, 100);
      } finally {
        setIsCompressing(false);
      }
    } else if (file.size > 102400) {
      alert('Non-image file is too large. All attachments must be under 100 KB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = fileToUpload.name ? fileToUpload.name.split('.').pop() : 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${card.board_id}/${card.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      const { data: attachment, error: attachError } = await supabase
        .from('attachments')
        .insert({
          card_id: card.id,
          name: fileToUpload.name || 'compressed-image.jpg',
          url: publicUrlData.publicUrl,
          mime_type: fileToUpload.type,
          size_bytes: fileToUpload.size,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (attachError) throw attachError;

      setAttachments(prev => [attachment, ...prev]);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async (id, url) => {
    // Try to delete from storage if we can parse the path
    try {
      const urlParts = url.split('attachments/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('attachments').remove([filePath]);
      }
    } catch (e) { console.error('Storage delete failed', e); }

    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (!error) {
      setAttachments(prev => prev.filter(a => a.id !== id));
    }
  };

  // ── Load Card Data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeCardId) return;
    const c = cards.find(x => x.id === activeCardId);
    if (c) {
      setCard(c);
      setList(lists.find(l => l.id === c.list_id));
      fetchAll(c.id);
    }
  }, [activeCardId, cards, lists]);

  const fetchAll = async (cardId) => {
    const [cls, lbls, assigns, cmts, atts, entries, fields, subs, blocks, blks] = await Promise.all([
      supabase.from('checklists').select('*, checklist_items(*)').eq('card_id', cardId).order('position'),
      supabase.from('card_labels').select('label_id').eq('card_id', cardId),
      supabase.from('card_assignments').select('user_id, profiles(full_name, avatar_url, email)').eq('card_id', cardId),
      supabase.from('comments').select('*, profiles(full_name, avatar_url)').eq('card_id', cardId).order('created_at', { ascending: false }),
      supabase.from('attachments').select('*').eq('card_id', cardId).order('created_at', { ascending: false }),
      supabase.from('time_entries').select('*').eq('card_id', cardId).not('ended_at', 'is', null).order('started_at', { ascending: false }),
      supabase.from('custom_field_values').select('*').eq('card_id', cardId),
      supabase.from('cards').select('id, title, is_completed').eq('parent_card_id', cardId),
      supabase.from('card_dependencies').select('*, cards:blocking_card_id(title)').eq('blocked_card_id', cardId),
      supabase.from('card_dependencies').select('*, cards:blocked_card_id(title)').eq('blocking_card_id', cardId)
    ]);
    if (cls.data) setChecklists(cls.data);
    if (lbls.data) setCardLabels(lbls.data.map(l => l.label_id));
    if (assigns.data) setCardAssignees(assigns.data);
    if (cmts.data) setComments(cmts.data);
    if (atts.data) setAttachments(atts.data);
    if (entries.data) setTimeEntries(entries.data);
    if (fields.data) {
      const vals = {};
      fields.data.forEach(v => {
        vals[v.custom_field_id] = v.text_value || v.number_value || v.date_value || v.bool_value;
      });
      setCustomFieldValues(vals);
    }
    if (subs.data) setSubtasks(subs.data);
    if (blocks.data) setBlockers(blocks.data);
    if (blks.data) setCardsBlockingOthers(blks.data);

    // Fetch Similar Cards
    const { data: similar } = await supabase.rpc('get_similar_cards', { 
      source_card_id: cardId,
      match_threshold: 0.5 // Lower threshold for demo if sync is patchy
    });
    if (similar) setSimilarCards(similar);
  };

  const handleClose = () => {
    dispatch(setActiveCardId(null));
    dispatch(toggleModal({ modalName: 'cardDetails', isOpen: false }));
  };

  // ── Card Updates ─────────────────────────────────────────────────────────────
  const updateField = async (fields) => {
    const { data, error } = await supabase.from('cards').update(fields).eq('id', card.id).select().single();
    if (!error) {
      setCard(prev => ({ ...prev, ...fields }));
      dispatch(updateCard({ ...card, ...fields }));
    }
  };

  // ── Labels ───────────────────────────────────────────────────────────────────
  const toggleLabel = async (labelId) => {
    if (cardLabels.includes(labelId)) {
      await supabase.from('card_labels').delete().eq('card_id', card.id).eq('label_id', labelId);
      setCardLabels(prev => prev.filter(id => id !== labelId));
    } else {
      await supabase.from('card_labels').insert({ card_id: card.id, label_id: labelId });
      setCardLabels(prev => [...prev, labelId]);
    }
  };

  // ── Assignments ───────────────────────────────────────────────────────────────
  const toggleAssignee = async (member) => {
    const isAssigned = cardAssignees.some(a => a.user_id === member.user_id);
    if (isAssigned) {
      await supabase.from('card_assignments').delete().eq('card_id', card.id).eq('user_id', member.user_id);
      setCardAssignees(prev => prev.filter(a => a.user_id !== member.user_id));
    } else {
      await supabase.from('card_assignments').insert({ card_id: card.id, user_id: member.user_id, assigned_by: user.id });
      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, email').eq('id', member.user_id).single();
      setCardAssignees(prev => [...prev, { user_id: member.user_id, profiles: profile }]);
    }
  };

  // ── Checklists ────────────────────────────────────────────────────────────────
  const addChecklist = async () => {
    if (!newChecklistName.trim()) return;
    const { data } = await supabase.from('checklists').insert({ card_id: card.id, title: newChecklistName }).select().single();
    if (data) setChecklists(prev => [...prev, { ...data, checklist_items: [] }]);
    setNewChecklistName('');
    setAddingChecklist(false);
  };

  const addChecklistItem = async (checklistId) => {
    const text = newItemText[checklistId];
    if (!text?.trim()) return;
    const { data } = await supabase.from('checklist_items').insert({ checklist_id: checklistId, title: text }).select().single();
    if (data) {
      setChecklists(prev => prev.map(cl => 
        cl.id === checklistId ? { ...cl, checklist_items: [...(cl.checklist_items || []), data] } : cl
      ));
      setNewItemText(prev => ({ ...prev, [checklistId]: '' }));
    }
  };

  const toggleChecklistItem = async (checklistId, itemId, current) => {
    await supabase.from('checklist_items').update({ is_completed: !current }).eq('id', itemId);
    setChecklists(prev => prev.map(cl =>
      cl.id === checklistId ? {
        ...cl, 
        checklist_items: cl.checklist_items.map(item => 
          item.id === itemId ? { ...item, is_completed: !current } : item
        )
      } : cl
    ));
  };

  // ── Custom Fields ──────────────────────────────────────────────────────────
  const updateCustomField = async (fieldId, type, value) => {
    const fieldMap = {
      'TEXT': 'text_value',
      'NUMBER': 'number_value',
      'DATE': 'date_value',
      'CHECKBOX': 'bool_value',
      'URL': 'text_value',
      'DROPDOWN': 'text_value',
      'RATING': 'number_value'
    };
    
    const col = fieldMap[type] || 'text_value';
    const { error } = await supabase
      .from('custom_field_values')
      .upsert({ 
        card_id: card.id, 
        custom_field_id: fieldId, 
        [col]: value 
      }, { onConflict: 'card_id,custom_field_id' });

    if (!error) {
      setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  // ── Subtasks ────────────────────────────────────────────────────────────────
  const addSubtask = async () => {
    const title = window.prompt('Subtask title:');
    if (!title) return;
    const { data } = await supabase
      .from('cards')
      .insert({
        board_id: activeBoard.id,
        list_id: card.list_id,
        parent_card_id: card.id,
        title: title,
        created_by: user.id,
        position: subtasks.length
      })
      .select()
      .single();
    
    if (data) setSubtasks([...subtasks, data]);
  };
  const postComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await supabase.from('comments')
      .insert({ card_id: card.id, author_id: user.id, content: { type: 'doc', content: [] }, content_text: commentText })
      .select('*, profiles(full_name, avatar_url)').single();
    if (data) {
      setComments(prev => [...prev, data]);
      setCommentText('');
    }
  };

  const totalTracked = timeEntries.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
  const fmtSecs = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const activeLabelObjects = labels?.filter(l => cardLabels.includes(l.id)) || [];
  const dueDateObj = card?.due_date ? new Date(card.due_date) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !card?.is_completed;

  if (!card) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-[200] flex items-start justify-center p-4 pt-12 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden mb-12"
          onClick={e => e.stopPropagation()}
        >
          {/* Cover Strip */}
          {card.cover_type !== 'NONE' && card.cover_value && (
            <div className="h-32 w-full" style={{ backgroundColor: card.cover_value }} />
          )}

          {/* Header */}
          <div className="px-8 pt-6 pb-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* Labels row */}
              {activeLabelObjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activeLabelObjects.map(l => (
                    <span key={l.id} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: l.color }}>
                      {l.name}
                    </span>
                  ))}
                </div>
              )}
              <input
                key={card.id}
                defaultValue={card.title}
                onBlur={e => { if (e.target.value !== card.title) updateField({ title: e.target.value }); }}
                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                className="w-full text-xl font-bold text-gray-900 bg-transparent outline-none resize-none leading-snug hover:bg-gray-50 focus:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
              />
              <div className="flex items-center gap-1.5 mt-2 px-2">
                <span className="text-sm text-gray-400">in list</span>
                <span className="text-sm font-semibold text-gray-600 underline decoration-gray-300 underline-offset-2 cursor-pointer hover:text-brand-primary">{list?.title}</span>
              </div>

              {/* Meta pills row */}
              <div className="flex items-center flex-wrap gap-2 mt-4 px-2">
                {dueDateObj && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${isOverdue ? 'bg-red-100 text-red-700' : card.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => updateField({ is_completed: !card.is_completed })}>
                    <Calendar size={13} />
                    {format(dueDateObj, 'MMM d')}
                    {card.is_completed && <Check size={11} className="ml-0.5" />}
                  </div>
                )}
                {cardAssignees.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowMemberPanel(true)}>
                    <div className="flex -space-x-1.5">
                      {cardAssignees.slice(0, 3).map(a => (
                        <div key={a.user_id} className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white">
                          {(a.profiles?.full_name || a.profiles?.email || '?')[0].toUpperCase()}
                        </div>
                      ))}
                    </div>
                    {cardAssignees.length} member{cardAssignees.length > 1 ? 's' : ''}
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                    <Paperclip size={12} /> {attachments.length}
                  </div>
                )}
                {PRIORITY_CONFIG[card.priority]?.label !== 'No Priority' && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${PRIORITY_CONFIG[card.priority]?.bg} ${PRIORITY_CONFIG[card.priority]?.color}`}>
                    <Flag size={11} className="fill-current" />
                    {PRIORITY_CONFIG[card.priority]?.label}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex gap-0 overflow-hidden">
            {/* ── Main Content ── */}
            <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(90vh-180px)] space-y-8">
              
              {/* ── Time Tracker ─ */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Timer size={16} className="text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">Time Tracker</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-3xl font-black tabular-nums tracking-tight ${timer.running ? 'text-brand-primary' : 'text-gray-800'}`}>
                        {timer.fmt(timer.elapsed)}
                      </div>
                      {totalTracked > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">Total logged: {fmtSecs(totalTracked)}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {timer.running ? (
                        <button onClick={timer.stop} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-200">
                          <Square size={14} className="fill-white" />
                          Stop
                        </button>
                      ) : (
                        <button onClick={timer.start} className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand-primary/20">
                          <Play size={14} className="fill-white" />
                          Start Timer
                        </button>
                      )}
                    </div>
                  </div>
                  {timer.running && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-red-500 font-semibold">Recording time...</span>
                    </div>
                  )}
                  {/* Recent entries */}
                  {timeEntries.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                      {timeEntries.slice(0, 3).map(e => (
                        <div key={e.id} className="flex justify-between text-xs text-gray-500">
                          <span>{format(new Date(e.started_at), 'MMM d, h:mm a')}</span>
                          <span className="font-semibold text-gray-700">{fmtSecs(e.duration_seconds)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* ── Description ── */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlignLeft size={16} className="text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">Description</h3>
                </div>
                <div className="pl-6">
                  <RichTextEditor content={card.description} onChange={(json, text) => updateField({ description: json, description_text: text })} />
                </div>
              </section>

              {/* ── Custom Fields ── */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 size={16} className="text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">Custom Fields</h3>
                </div>
                <div className="pl-6 grid grid-cols-2 gap-4">
                  {activeBoard.custom_fields?.map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">{field.name}</label>
                      <div className="relative group">
                        {field.type === 'CHECKBOX' ? (
                          <button 
                            onClick={() => updateCustomField(field.id, field.type, !customFieldValues[field.id])}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${customFieldValues[field.id] ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-bg-secondary text-text-tertiary'}`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border-2 ${customFieldValues[field.id] ? 'bg-brand-primary border-brand-primary' : 'border-current'}`}>
                              {customFieldValues[field.id] && <Check size={10} className="text-white" strokeWidth={4} />}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight">{customFieldValues[field.id] ? 'Enabled' : 'Disabled'}</span>
                          </button>
                        ) : field.type === 'DATE' ? (
                          <input 
                            type="date"
                            className="w-full h-10 bg-bg-secondary border-none rounded-xl px-4 text-xs font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                            value={customFieldValues[field.id]?.slice(0, 10) || ''}
                            onChange={(e) => updateCustomField(field.id, field.type, e.target.value)}
                          />
                        ) : (
                          <input 
                            type={field.type === 'NUMBER' ? 'number' : 'text'}
                            placeholder={`Enter ${field.name.toLowerCase()}...`}
                            className="w-full h-10 bg-bg-secondary border-none rounded-xl px-4 text-xs font-bold text-text-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                            value={customFieldValues[field.id] || ''}
                            onChange={(e) => updateCustomField(field.id, field.type, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {(!activeBoard.custom_fields || activeBoard.custom_fields.length === 0) && (
                    <div className="col-span-2 py-4 px-6 bg-bg-secondary/30 rounded-2xl border-2 border-dashed border-border-light text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">No custom fields defined for this board.</p>
                      <button onClick={() => {}} className="text-[10px] text-brand-primary font-bold hover:underline mt-1">Configure Fields</button>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Subtasks ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-700">Subtasks</h3>
                  </div>
                  <button onClick={addSubtask} className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline">
                    <Plus size={14} />
                    Add
                  </button>
                </div>
                <div className="pl-6 space-y-3">
                  {subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-bg-secondary/40 rounded-2xl border border-transparent hover:border-border-light hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md" onClick={() => openCardDetails(sub.id)}>
                      <div className={`w-4 h-4 rounded-lg border-2 flex items-center justify-center transition-all ${sub.is_completed ? 'bg-success border-success text-white' : 'border-border-medium'}`}>
                        {sub.is_completed && <Check size={10} strokeWidth={4} />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[13px] font-bold ${sub.is_completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>{sub.title}</span>
                      </div>
                      <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {subtasks.length === 0 && (
                    <div className="py-4 border-2 border-dashed border-border-light rounded-2xl text-center">
                      <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest">Connect micro-tasks for clarity</p>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Dependencies ── */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Network size={16} className="text-gray-500" />
                  <h3 className="text-sm font-bold text-gray-700">Dependencies</h3>
                </div>
                <div className="pl-6 space-y-4">
                  {blockers.length > 0 && (
                  <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-danger">Blocking this card</p>
                      {blockers.map(dep => (
                        <div key={dep.id} className="flex items-center gap-2 p-2 bg-danger/5 rounded-lg border border-danger/10">
                          <AlertCircle size={12} className="text-danger" />
                          <span className="text-xs font-medium text-text-primary">{dep.cards?.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cardsBlockingOthers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-success">Blocked by this card</p>
                      {cardsBlockingOthers.map(dep => (
                        <div key={dep.id} className="flex items-center gap-2 p-2 bg-success/5 rounded-lg border border-success/10">
                          <CheckCircle2 size={12} className="text-success" />
                          <span className="text-xs font-medium text-text-primary">{dep.cards?.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {blockers.length === 0 && cardsBlockingOthers.length === 0 && (
                    <p className="text-[10px] text-text-tertiary font-medium">No active dependencies. Add relations in the Dependency Map.</p>
                  )}
                </div>
              </section>

              {/* ── Attachments ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-700">Attachments</h3>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isCompressing}
                    className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline disabled:opacity-50 transition-all"
                  >
                    {isCompressing ? (
                      <>
                        <Sparkles size={12} className="animate-pulse text-yellow-500" />
                        <span className="animate-pulse">Optimizing...</span>
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="pl-6 space-y-4">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  
                  {attachments.map(att => (
                    <div key={att.id} className="flex gap-4 p-3 bg-bg-secondary/40 rounded-2xl border border-transparent hover:border-border-light hover:bg-white transition-all group">
                       {(att.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.url)) ? (
                         <div className="w-24 h-24 rounded-xl overflow-hidden bg-bg-tertiary shrink-0 border border-border-light">
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="w-24 h-24 rounded-xl bg-bg-secondary flex items-center justify-center text-text-tertiary shrink-0 border border-border-light">
                            <Paperclip size={24} />
                         </div>
                       )}
                       <div className="flex-1 min-w-0 py-1">
                          <p className="font-bold text-sm text-text-primary truncate">{att.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                             <span>Added {formatDistanceToNow(new Date(att.created_at), { addSuffix: true })}</span>
                             <span>•</span>
                             <span>{(att.size_bytes / 1024).toFixed(1)} KB</span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                             <a 
                               href={att.url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1"
                             >
                               <ExternalLink size={10} />
                               Open
                             </a>
                             <button 
                               onClick={() => removeAttachment(att.id, att.url)}
                               className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                               Delete
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}

                  {attachments.length === 0 && !isUploading && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-border-light rounded-[32px] text-center cursor-pointer hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all group"
                    >
                      <Paperclip size={24} className="mx-auto mb-2 text-text-tertiary group-hover:text-brand-primary transition-colors" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary group-hover:text-brand-primary transition-colors">Attach cloud assets or files</p>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Checklists ── */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-700">Checklist</h3>
                  </div>
                  <button onClick={() => setAddingChecklist(true)} className="text-xs font-semibold text-brand-primary hover:underline">
                    + Add
                  </button>
                </div>
                <div className="pl-6 space-y-6">
                  {checklists.map(cl => (
                    <div key={cl.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{cl.title}</span>
                      </div>
                      <ChecklistProgress items={cl.checklist_items || []} />
                      <div className="space-y-1 mt-2">
                        {(cl.checklist_items || []).sort((a,b) => a.position - b.position).map(item => (
                          <div key={item.id} className="flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-gray-50 group transition-colors">
                            <button
                              onClick={() => toggleChecklistItem(cl.id, item.id, item.is_completed)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${item.is_completed ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 hover:border-brand-primary'}`}
                            >
                              {item.is_completed && <Check size={10} className="text-white" strokeWidth={3} />}
                            </button>
                            <span className={`text-sm flex-1 ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            placeholder="Add an item..."
                            value={newItemText[cl.id] || ''}
                            onChange={e => setNewItemText(p => ({ ...p, [cl.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addChecklistItem(cl.id)}
                            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/60 transition-all placeholder:text-gray-400"
                          />
                          <button onClick={() => addChecklistItem(cl.id)} className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold hover:bg-brand-primary-hover transition-colors">
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {addingChecklist && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <input
                        autoFocus
                        placeholder="Checklist title..."
                        value={newChecklistName}
                        onChange={e => setNewChecklistName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addChecklist(); if (e.key === 'Escape') setAddingChecklist(false); }}
                        className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary/20"
                      />
                      <button onClick={addChecklist} className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold">Create</button>
                      <button onClick={() => setAddingChecklist(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {checklists.length === 0 && !addingChecklist && (
                    <button onClick={() => setAddingChecklist(true)} className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-brand-primary/40 hover:text-brand-primary transition-all font-semibold">
                      + Create Checklist
                    </button>
                  )}
                </div>
              </section>

              {/* ── Activity Feed ── */}
              <section>
                <div className="space-y-6">
                  {/* Comment composer */}
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-brand-primary/20">
                      {(user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="relative group">
                        <textarea
                          rows={2}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                          placeholder="Write a comment... (Enter to post)"
                          className="w-full text-sm bg-bg-secondary border-none rounded-2xl px-5 py-3 outline-none focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all resize-none placeholder:text-text-tertiary font-medium"
                        />
                        <div className="absolute right-3 bottom-3 flex gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                          <button onClick={postComment} className="p-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all">
                            <MessageCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unified Activity List */}
                  <CardActivityList cardId={card.id} />
                </div>
              </section>
            </div>

            {/* ── Sidebar ── */}
            <div className="w-52 shrink-0 border-l border-gray-100 bg-gray-50/50 px-4 py-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Add to card */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Add to card</p>
                <div className="space-y-0.5">
                  <SidebarBtn icon={UserPlus} label="Members" onClick={() => setShowMemberPanel(p => !p)} active={showMemberPanel} />
                  <SidebarBtn icon={Tag} label="Labels" onClick={() => setShowLabelPanel(p => !p)} active={showLabelPanel} />
                  <SidebarBtn icon={CheckSquare} label="Checklist" onClick={() => setAddingChecklist(true)} />
                  <SidebarBtn icon={Calendar} label="Dates" onClick={() => setShowDatePanel(p => !p)} active={showDatePanel} />
                  <SidebarBtn icon={Palette} label="Cover" onClick={() => setShowCoverPanel(p => !p)} active={showCoverPanel} />
                  <SidebarBtn icon={Paperclip} label="Attachment" onClick={() => fileInputRef.current?.click()} />
                </div>
              </div>

              {/* ── Cover Panel ── */}
              <AnimatePresence>
                {showCoverPanel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3 px-1">Card Cover</p>
                    <div className="grid grid-cols-4 gap-2 px-1">
                      {['#F4F5F7', '#0052CC', '#36B37E', '#FFab00', '#FF5630', '#00B8D9', '#6554C0', '#FF8B00'].map(c => (
                        <button 
                          key={c}
                          onClick={() => updateField({ cover_type: 'COLOR', cover_value: c })}
                          className={`aspect-square rounded-lg border-2 transition-all ${card.cover_value === c ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-110' : 'border-transparent hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <button 
                        onClick={() => updateField({ cover_type: 'NONE', cover_value: null })}
                        className="aspect-square rounded-lg bg-white border border-border-light flex items-center justify-center text-text-tertiary hover:text-text-primary"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Member Panel ── */}
              <AnimatePresence>
                {showMemberPanel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Assign Members</p>
                    <div className="space-y-1">
                      {members?.map(m => {
                        const assigned = cardAssignees.some(a => a.user_id === m.user_id);
                        const name = m.profiles?.full_name || m.profiles?.email || 'User';
                        return (
                          <button key={m.user_id} onClick={() => toggleAssignee(m)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${assigned ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}>
                            <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {name[0].toUpperCase()}
                            </div>
                            <span className="text-xs truncate">{name}</span>
                            {assigned && <Check size={12} className="ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Label Panel ── */}
              <AnimatePresence>
                {showLabelPanel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Labels</p>
                    <div className="space-y-1">
                      {labels?.map(l => {
                        const active = cardLabels.includes(l.id);
                        return (
                          <button key={l.id} onClick={() => toggleLabel(l.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-bold transition-all ${active ? 'ring-2' : 'opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: l.color + '20', color: l.color, ringColor: l.color }}>
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                            {l.name}
                            {active && <Check size={11} className="ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Dates Panel ── */}
              <AnimatePresence>
                {showDatePanel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Due Date</p>
                    <input 
                      type="datetime-local"
                      defaultValue={card.due_date ? card.due_date.slice(0, 16) : ''}
                      onChange={e => updateField({ due_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-primary/20"
                    />
                    <div className="mt-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 px-1">Priority</p>
                      <div className="space-y-1">
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                          <button key={key} onClick={() => updateField({ priority: key })}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${card.priority === key ? cfg.bg + ' ' + cfg.color : 'hover:bg-gray-100 text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                            {card.priority === key && <Check size={10} className="ml-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Actions</p>
                <div className="space-y-0.5">
                  <SidebarBtn icon={ArrowRight} label="Move" onClick={() => {}} />
                  <SidebarBtn icon={Copy} label="Copy" onClick={() => {}} />
                  <SidebarBtn icon={Archive} label="Archive" onClick={() => updateField({ is_archived: true }).then(handleClose)} danger />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardDetailsModal;

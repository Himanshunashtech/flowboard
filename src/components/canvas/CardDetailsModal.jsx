import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, AlignLeft, CheckSquare, MessageCircle, Paperclip, Clock, 
  UserPlus, Tag, Flag, Trash2, Share2, Plus, Timer, Play, Pause, 
  Square, Calendar, MoreHorizontal, Check, ChevronDown, Copy,
  ArrowRight, Star, Eye, Zap, Archive, Edit3, Network, Settings2,
  Sparkles, AlertCircle, CheckCircle2, Palette, Loader2, ExternalLink, Globe,
  MapPin, CloudUpload
} from 'lucide-react';
import { updateCard, setLabels, moveCard, addCard, deleteCard, addDependency, removeDependency } from '../../store/slices/boardSlice';
import { addNotification, toggleModal, setActiveCardId } from '../../store/slices/uiSlice';
import { supabase, getBoardChannel } from '../../lib/supabase';
import { throttle } from '../../lib/utils';
import { compressImage } from '../../lib/imageUtils';
import RichTextEditor from '../ui/RichTextEditor';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import CardActivityList from './CardActivityList';

import LabelsPopover from './LabelsPopover';
import EditLabelPopover from './EditLabelPopover';
import MoveCardPopover from './MoveCardPopover';
import DependencySelector from './DependencySelector';
import LocationSelector from './LocationSelector';

// ─── Priority Config ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  NONE:     { label: 'No Priority', color: 'text-gray-400',   bg: 'bg-gray-100',      dot: 'bg-gray-300' },
  LOW:      { label: 'Low',         color: 'text-blue-500',   bg: 'bg-blue-50',       dot: 'bg-blue-400' },
  MEDIUM:   { label: 'Medium',      color: 'text-yellow-600', bg: 'bg-yellow-50',     dot: 'bg-yellow-400' },
  HIGH:     { label: 'High',        color: 'text-orange-500', bg: 'bg-orange-50',     dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical',    color: 'text-red-600',    bg: 'bg-red-50',        dot: 'bg-red-500' },
};

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useTimer(cardId, userId, onStart, onStop) {
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
    if (data) { 
      setActiveEntry(data); 
      setRunning(true); 
      if (onStart) onStart(data);
    }
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

// ─── Navigation Action Button ────────────────────────────────────────────────────
const NavBtn = ({ icon: Icon, label, onClick, danger, active }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all border
      ${danger ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100' : active ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary shadow-sm' : 'border-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
  >
    <Icon size={14} className="shrink-0" />
    <span>{label}</span>
  </button>
);

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CardDetailsModal = () => {
  const dispatch = useDispatch();
  const { activeBoard, lists, cards, members, labels, presence, dependencies: allBoardDependencies } = useSelector(s => s.board);
  const { activeCardId } = useSelector(s => s.ui);
  const { user, profile } = useSelector(s => s.auth);

  const viewers = Object.values(presence || {}).filter(p => p.activeCardId === activeCardId && p.user?.id !== user?.id);
  const typers = viewers.filter(p => p.typing);

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
  
  // Label management state
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelSubView, setLabelSubView] = useState('list'); // 'list', 'edit', 'create'
  const [showMovePopover, setShowMovePopover] = useState(false);
  const [movePopoverMode, setMovePopoverMode] = useState('move');
  const [showDependencyPanel, setShowDependencyPanel] = useState(false);
  const [depPanelType, setDepPanelType] = useState('blocker'); // 'blocker' or 'blocked'
  const [showLocationPanel, setShowLocationPanel] = useState(false);

  const timer = useTimer(card?.id, user?.id, 
    (newEntry) => {
      // Update board store for real-time icon
      const newEntries = [...(card.time_entries || []), newEntry];
      dispatch(updateCard({ id: card.id, time_entries: newEntries }));
    },
    (stoppedEntry) => {
      setTimeEntries(prev => [stoppedEntry, ...prev]);
      // Update board store (mark all as ended or just update the one)
      const newEntries = (card.time_entries || []).map(t => 
        t.id === stoppedEntry.id ? stoppedEntry : t
      );
      dispatch(updateCard({ id: card.id, time_entries: newEntries }));
    }
  );

  const fileInputRef = useRef(null);
  const coverImageUploadRef = useRef(null);
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
        .from('card-attachments')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('card-attachments')
        .getPublicUrl(filePath);

      const { data: attachment, error: attachError } = await supabase
        .from('attachments')
        .insert({
          card_id: card.id,
          name: fileToUpload.name || 'compressed-image.jpg',
          url: publicUrlData.publicUrl,
          storage_path: filePath,
          mime_type: fileToUpload.type,
          size_bytes: fileToUpload.size,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (attachError) throw attachError;

      setAttachments(prev => [attachment, ...prev]);
      
      // Update board store to reflect count on card item immediately
      const newAttachments = [...(card.attachments || []), attachment];
      dispatch(updateCard({ id: card.id, attachments: newAttachments }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload attachment.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = async (id, storagePath) => {
    // 1. Remove from Storage
    if (storagePath) {
      await supabase.storage.from('card-attachments').remove([storagePath]);
    }

    // 2. Remove from Database
    const { error } = await supabase.from('attachments').delete().eq('id', id);
    if (!error) {
      setAttachments(prev => prev.filter(a => a.id !== id));
      
      // Update board store
      const newAttachments = (card.attachments || []).filter(a => a.id !== id);
      dispatch(updateCard({ id: card.id, attachments: newAttachments }));
    }
  };

  // ── Presence Tracking ──
  const presenceUpdate = useCallback(
    throttle((data) => {
      if (!card) return;
      const channel = getBoardChannel(card.board_id);
      
      // Safety check: Don't track if the channel isn't fully joined yet
      // This prevents the "tried to push presence before joining" error
      if (channel.state !== 'joined') return;

      channel.track({
        user: {
          id: user?.id,
          full_name: profile?.full_name || user?.email,
          avatar_url: profile?.avatar_url
        },
        activeCardId: card.id,
        lastActive: Date.now(),
        ...data
      });
    }, 500),
    [card, user, profile]
  );

  useEffect(() => {
    if (card) {
      presenceUpdate({ typing: false });
    }
  }, [card, presenceUpdate]);

  useEffect(() => {
    if (commentText.length > 0) {
      presenceUpdate({ typing: true });
      const timer = setTimeout(() => presenceUpdate({ typing: false }), 2000);
      return () => clearTimeout(timer);
    } else {
      presenceUpdate({ typing: false });
    }
  }, [commentText, presenceUpdate]);

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

  useEffect(() => {
    if (card) {
      setAttachments(card.attachments || []);
      setCardLabels((card.card_labels || []).map(cl => cl.label_id));
      setCardAssignees(card.card_assignments || []);
      
      // Calculate local dependencies from board state
      if (allBoardDependencies) {
        setBlockers(allBoardDependencies.filter(d => d.blocked_card_id === card.id));
        setCardsBlockingOthers(allBoardDependencies.filter(d => d.blocking_card_id === card.id));
      }
    }
  }, [card?.id, allBoardDependencies]);

  const fetchAll = async (cardId) => {
    const [cls, lbls, assigns, cmts, atts, entries, fields, subs] = await Promise.all([
      supabase.from('checklists').select('*, checklist_items(*)').eq('card_id', cardId).order('position'),
      supabase.from('card_labels').select('label_id').eq('card_id', cardId),
      supabase.from('card_assignments').select('user_id, profiles(full_name, avatar_url, email)').eq('card_id', cardId),
      supabase.from('comments').select('*, profiles(full_name, avatar_url)').eq('card_id', cardId).order('created_at', { ascending: false }),
      supabase.from('attachments').select('*').eq('card_id', cardId).order('created_at', { ascending: false }),
      supabase.from('time_entries').select('*').eq('card_id', cardId).not('ended_at', 'is', null).order('started_at', { ascending: false }),
      supabase.from('custom_field_values').select('*').eq('card_id', cardId),
      supabase.from('cards').select('id, title, is_completed').eq('parent_card_id', cardId)
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
      
      // Update store for real-time consistency on card item
      const newLabels = card.card_labels?.filter(cl => cl.label_id !== labelId) || [];
      dispatch(updateCard({ id: card.id, card_labels: newLabels }));
    } else {
      await supabase.from('card_labels').insert({ card_id: card.id, label_id: labelId });
      setCardLabels(prev => [...prev, labelId]);
      
      // Update store
      const newLabels = [...(card.card_labels || []), { label_id: labelId }];
      dispatch(updateCard({ id: card.id, card_labels: newLabels }));
    }
  };

  const saveLabel = async (labelData) => {
    if (labelData.id) {
      // Update
      const { data, error } = await supabase.from('labels')
        .update({ name: labelData.name, color: labelData.color })
        .eq('id', labelData.id)
        .select()
        .single();
      if (!error && data) {
         // Update Redux labels
         const newLabels = (labels || []).map(l => l.id === data.id ? data : l);
         dispatch(setLabels(newLabels));
         setLabelSubView('list');
      }
    } else {
      // Create
      const { data, error } = await supabase.from('labels')
        .insert({ board_id: card.board_id, name: labelData.name, color: labelData.color })
        .select()
        .single();
      if (!error && data) {
         dispatch(setLabels([...(labels || []), data]));
         setLabelSubView('list');
      }
    }
  };

  const deleteLabel = async (labelId) => {
    const { error } = await supabase.from('labels').delete().eq('id', labelId);
    if (!error) {
      dispatch(setLabels((labels || []).filter(l => l.id !== labelId)));
      setCardLabels(prev => prev.filter(id => id !== labelId));
      setLabelSubView('list');
    }
  };

  // ── Dependencies ─────────────────────────────────────────────────────────────
  const addDependencyAction = async (targetCard, type = 'blocker') => {
    const blockingId = type === 'blocker' ? targetCard.id : card.id;
    const blockedId = type === 'blocker' ? card.id : targetCard.id;

    if (blockingId === blockedId) return;

    // 1. Optimistic UI
    const newDep = { blocking_card_id: blockingId, blocked_card_id: blockedId, cards: targetCard };
    dispatch(addDependency(newDep));
    setShowDependencyPanel(false);

    // 2. DB Update
    const { error } = await supabase.from('card_dependencies').insert({
      blocking_card_id: blockingId,
      blocked_card_id: blockedId,
      created_by: user.id
    });

    if (error) {
      dispatch(addNotification({ message: 'Dependency already exists or failed', type: 'error' }));
    }
  };

  const removeDependencyAction = async (blockingId, blockedId) => {
    // 1. Optimistic
    dispatch(removeDependency({ blocking_card_id: blockingId, blocked_card_id: blockedId }));

    // 2. DB
    await supabase.from('card_dependencies').delete()
      .eq('blocking_card_id', blockingId)
      .eq('blocked_card_id', blockedId);
  };

  // ── Location ───────────────────────────────────────────────────────────────
  const handleSaveLocation = async (locationData) => {
    // 1. Optimistic
    dispatch(updateCard({ id: card.id, location: locationData }));
    setShowLocationPanel(false);

    // 2. DB
    const { error } = await supabase.from('cards').update({ location: locationData }).eq('id', card.id);
    if (error) {
       dispatch(addNotification({ message: 'Failed to save location', type: 'error' }));
    }
  };

  const handleRemoveLocation = async () => {
    // 1. Optimistic
    dispatch(updateCard({ id: card.id, location: null }));

    // 2. DB
    await supabase.from('cards').update({ location: null }).eq('id', card.id);
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
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Enforce 100kb limit as requested
      const compressedFile = await compressImage(file, 100);
      
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${card.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('card-covers')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('card-covers')
        .getPublicUrl(filePath);

      await updateField({ 
        cover_type: 'IMAGE', 
        cover_value: publicUrl 
      });

      dispatch(addNotification({ message: 'Cover updated!', type: 'success' }));
    } catch (err) {
      console.error('Cover upload failed:', err);
      dispatch(addNotification({ message: 'Failed to upload cover', type: 'error' }));
    } finally {
      setIsUploading(false);
    }
  };

  const PREDEFINED_COVERS = [
    '/assets/covers/cover_1.png',
    '/assets/covers/cover_2.png',
    '/assets/covers/cover_3.png',
    '/assets/covers/cover_4.png',
    '/assets/covers/cover_5.png',
    '/assets/covers/cover_6.png',
  ];

  const postComment = async () => {
    if (!commentText.trim()) return;
    const { data } = await supabase.from('comments')
      .insert({ card_id: card.id, author_id: user.id, content: { type: 'doc', content: [] }, content_text: commentText })
      .select('*, profiles(full_name, avatar_url)').single();
    if (data) {
      setComments(prev => [...prev, data]);
      setCommentText('');
      
      // Update board store
      const newComments = [...(card.comments || []), data];
      dispatch(updateCard({ id: card.id, comments: newComments }));
    }
  };

  const totalTracked = timeEntries.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
  const handleMoveCopyAction = async ({ type, boardId, listId, position, numericIndex }) => {
    if (type === 'move') {
      const isCrossBoard = boardId !== activeBoard.id;
      
      // 1. Optimistic Update
      if (!isCrossBoard) {
        dispatch(moveCard({ cardId: card.id, newListId: listId, newPosition: position }));
      } else {
        // Moving to another board: delete from current board state
        dispatch(toggleModal({ modalName: 'cardDetails', isOpen: false }));
        dispatch(setActiveCardId(null));
        dispatch(deleteCard(card.id));
      }

      // 2. DB Update
      const { error } = await supabase
        .from('cards')
        .update({ board_id: boardId, list_id: listId, position })
        .eq('id', card.id);

      if (error) {
        dispatch(addNotification({ message: 'Failed to move card', type: 'error' }));
        // Rollback or re-fetch would be complex here, usually simple update is reliable
      } else if (isCrossBoard) {
        dispatch(addNotification({ message: `Card moved to another board`, type: 'success' }));
      }
    } else {
      // ── COPY LOGIC ──
      try {
        // 1. Create New Card
        const { data: newCard, error: cardError } = await supabase
          .from('cards')
          .insert({
            board_id: boardId,
            list_id: listId,
            position,
            title: card.title,
            description: card.description,
            description_text: card.description_text,
            priority: card.priority,
            cover_type: card.cover_type,
            cover_value: card.cover_value,
            due_date: card.due_date,
            created_by: user.id
          })
          .select()
          .single();

        if (cardError) throw cardError;

        // 2. Clone Labels
        if (cardLabels.length > 0) {
          await supabase.from('card_labels').insert(
            cardLabels.map(lid => ({ card_id: newCard.id, label_id: lid }))
          );
        }

        // 3. Clone Checklists
        if (checklists.length > 0) {
          for (const cl of checklists) {
            const { data: newCl } = await supabase
              .from('checklists')
              .insert({ card_id: newCard.id, title: cl.title, position: cl.position })
              .select().single();
            
            if (newCl && cl.checklist_items?.length > 0) {
              await supabase.from('checklist_items').insert(
                cl.checklist_items.map(item => ({
                  checklist_id: newCl.id,
                  title: item.title,
                  is_completed: item.is_completed,
                  position: item.position
                }))
              );
            }
          }
        }

        // 4. Clone Attachments (Link existing ones)
        if (attachments.length > 0) {
          await supabase.from('attachments').insert(
            attachments.map(a => ({
              card_id: newCard.id,
              name: a.name,
              url: a.url,
              storage_path: a.storage_path,
              mime_type: a.mime_type,
              size_bytes: a.size_bytes,
              uploaded_by: user.id
            }))
          );
        }

        // 5. Update UI if on same board
        if (boardId === activeBoard.id) {
          dispatch(addCard(newCard));
          dispatch(addNotification({ message: 'Card copied successfully', type: 'success' }));
        } else {
          dispatch(addNotification({ message: 'Card copied to another board', type: 'success' }));
        }
      } catch (err) {
        console.error('Copy failed:', err);
        dispatch(addNotification({ message: 'Failed to copy card', type: 'error' }));
      }
    }
  };

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
          className="w-full max-w-[98vw] bg-white rounded-[24px] shadow-2xl overflow-hidden mb-6 border border-white/20 backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Cover Strip */}
          {card.cover_type !== 'NONE' && (card.cover_value || card.cover_image_url) && (
            <div className="h-48 w-full relative overflow-hidden">
               {card.cover_type === 'IMAGE' ? (
                 <img 
                   src={card.cover_value || card.cover_image_url} 
                   className="w-full h-full object-cover"
                   alt="Card Cover"
                 />
               ) : (
                 <div className="w-full h-full" style={{ backgroundColor: card.cover_value }} />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
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
              {/* Viewing Stakeholders */}
              {viewers.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="flex -space-x-2">
                    {viewers.map(v => (
                      <div key={v.user.id} className="group relative">
                        {v.user.avatar_url ? (
                          <img src={v.user.avatar_url} alt={v.user.full_name} className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-black/5 object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-primary border-2 border-white ring-1 ring-black/5 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {v.user.full_name?.[0] || 'U'}
                          </div>
                        )}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10 pointer-events-none">
                          {v.user.full_name} is viewing
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest animate-pulse">
                    Currently Viewing
                  </span>
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
                {card.location && (
                  <div 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-xs font-bold cursor-pointer hover:bg-brand-primary/20 transition-all"
                    onClick={() => {
                       const section = document.getElementById('location-section');
                       section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                  >
                    <MapPin size={11} />
                    {card.location.name}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 px-6 pt-6">
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* New Horizontal Navbar */}
          <div className="px-8 py-4 border-y border-gray-100 bg-gray-50/30 flex items-center flex-wrap gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mr-2">Quick Actions</p>
            <NavBtn icon={UserPlus} label="Members" onClick={() => setShowMemberPanel(p => !p)} active={showMemberPanel} />
            <NavBtn icon={Tag} label="Labels" onClick={() => setShowLabelPanel(p => !p)} active={showLabelPanel} />
            <NavBtn icon={CheckSquare} label="Checklist" onClick={() => setAddingChecklist(true)} />
            <NavBtn icon={Calendar} label="Dates" onClick={() => setShowDatePanel(p => !p)} active={showDatePanel} />
            <NavBtn icon={Palette} label="Cover" onClick={() => setShowCoverPanel(p => !p)} active={showCoverPanel} />
            <NavBtn icon={Paperclip} label="Attachment" onClick={() => fileInputRef.current?.click()} />
            
            <div className="h-6 w-px bg-gray-200 mx-2" />
            
            <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mr-2">Card</p>
            <div className="relative">
              <NavBtn icon={ArrowRight} label="Move" onClick={() => { setMovePopoverMode('move'); setShowMovePopover(p => !p); }} active={showMovePopover && movePopoverMode === 'move'} />
              {showMovePopover && movePopoverMode === 'move' && (
                <div className="absolute top-full left-0 mt-2 z-[250]">
                  <MoveCardPopover 
                    card={card} 
                    initialBoard={activeBoard} 
                    initialList={list} 
                    mode="move"
                    onAction={handleMoveCopyAction}
                    onClose={() => setShowMovePopover(false)}
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <NavBtn icon={Copy} label="Copy" onClick={() => { setMovePopoverMode('copy'); setShowMovePopover(p => !p); }} active={showMovePopover && movePopoverMode === 'copy'} />
              {showMovePopover && movePopoverMode === 'copy' && (
                <div className="absolute top-full left-0 mt-2 z-[250]">
                  <MoveCardPopover 
                    card={card} 
                    initialBoard={activeBoard} 
                    initialList={list} 
                    mode="copy"
                    onAction={handleMoveCopyAction}
                    onClose={() => setShowMovePopover(false)}
                  />
                </div>
              )}
            </div>
            
            <div className="relative">
              <NavBtn icon={MapPin} label="Location" onClick={() => setShowLocationPanel(p => !p)} active={showLocationPanel} />
              {showLocationPanel && (
                <div className="absolute top-full left-0 mt-2 z-[250]">
                  <LocationSelector 
                    onSelect={handleSaveLocation}
                    onClose={() => setShowLocationPanel(false)}
                  />
                </div>
              )}
            </div>
            <NavBtn icon={Archive} label="Archive" onClick={() => updateField({ is_archived: true }).then(handleClose)} danger />
          </div>

          {/* Expandable Action Panels */}
          <div className="px-8 bg-gray-50/50">
            {/* Cover Panel */}
            <AnimatePresence>
              {showCoverPanel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Select Card Cover Color</p>
                    <button onClick={() => setShowCoverPanel(false)} className="text-text-tertiary hover:text-text-primary"><X size={14}/></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3 px-1">Select Cover Color</p>
                      <div className="flex flex-wrap gap-3 px-1">
                        {['#F4F5F7', '#0052CC', '#36B37E', '#FFab00', '#FF5630', '#00B8D9', '#6554C0', '#FF8B00'].map(c => (
                          <button 
                            key={c}
                            onClick={() => updateField({ cover_type: 'COLOR', cover_value: c })}
                            className={`w-10 h-10 rounded-xl border-2 transition-all ${card.cover_type === 'COLOR' && card.cover_value === c ? 'border-brand-primary ring-4 ring-brand-primary/10 scale-110' : 'border-transparent hover:scale-110 shadow-sm'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <button 
                          onClick={() => updateField({ cover_type: 'NONE', cover_value: null })}
                          className="w-10 h-10 rounded-xl bg-white border-2 border-dashed border-border-light flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-brand-primary transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-3 px-1">Predefined Blueprints</p>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 px-1">
                        {PREDEFINED_COVERS.map((url, idx) => (
                          <button 
                            key={url}
                            onClick={() => updateField({ cover_type: 'IMAGE', cover_value: url })}
                            className={`aspect-video rounded-xl bg-bg-secondary overflow-hidden border-2 transition-all ${card.cover_type === 'IMAGE' && card.cover_value === url ? 'border-brand-primary ring-4 ring-brand-primary/10 scale-105' : 'border-transparent hover:scale-105 shadow-sm'}`}
                          >
                             <img src={url} alt={`Material Cover ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                        <button 
                          onClick={() => coverImageUploadRef.current?.click()}
                          className="aspect-video rounded-xl bg-bg-secondary border-2 border-dashed border-border-light flex flex-col items-center justify-center gap-1 text-text-tertiary hover:text-brand-primary hover:border-brand-primary transition-all group"
                        >
                           <CloudUpload size={18} className="group-hover:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-tighter">Upload</span>
                        </button>
                        <input 
                          type="file" 
                          ref={coverImageUploadRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleCoverUpload} 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Member Panel */}
            <AnimatePresence>
              {showMemberPanel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Assign Board Members</p>
                    <button onClick={() => setShowMemberPanel(false)} className="text-text-tertiary hover:text-text-primary"><X size={14}/></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {members?.map(m => {
                      const assigned = cardAssignees.some(a => a.user_id === m.user_id);
                      const name = m.profiles?.full_name || m.profiles?.email || 'User';
                      return (
                        <button key={m.user_id} onClick={() => toggleAssignee(m)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${assigned ? 'bg-brand-primary/5 border-brand-primary/20 text-brand-primary font-bold shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-700 shadow-sm'}`}>
                          <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            {name[0].toUpperCase()}
                          </div>
                          <span className="text-xs">{name}</span>
                          {assigned && <Check size={12} className="ml-1 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Label Panel (New Popover Style) */}
            <AnimatePresence>
              {showLabelPanel && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: -10 }} 
                  className="absolute left-40 top-48 z-[210]"
                >
                  {labelSubView === 'list' ? (
                    <LabelsPopover 
                      labels={labels}
                      cardLabels={cardLabels}
                      onToggleLabel={toggleLabel}
                      onEditLabel={(l) => { setEditingLabel(l); setLabelSubView('edit'); }}
                      onCreateNewLabel={() => { setEditingLabel(null); setLabelSubView('create'); }}
                      onClose={() => setShowLabelPanel(false)}
                    />
                  ) : (
                    <EditLabelPopover 
                      label={editingLabel}
                      onSave={saveLabel}
                      onDelete={() => deleteLabel(editingLabel?.id)}
                      onBack={() => setLabelSubView('list')}
                      onClose={() => setShowLabelPanel(false)}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dates Panel */}
            <AnimatePresence>
              {showDatePanel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden py-4 border-b border-gray-100 max-w-2xl">
                   <div className="flex items-center justify-between mb-3 px-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Scheduling & Priority</p>
                    <button onClick={() => setShowDatePanel(false)} className="text-text-tertiary hover:text-text-primary"><X size={14}/></button>
                  </div>
                  <div className="flex flex-wrap gap-6 px-1">
                    <div className="space-y-2 flex-1 min-w-[200px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Due Date</p>
                      <input 
                        type="datetime-local"
                        defaultValue={card.due_date ? card.due_date.slice(0, 16) : ''}
                        onChange={e => updateField({ due_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="w-full text-xs bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/40 transition-all font-bold text-gray-700 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2 flex-[2] min-w-[300px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority Level</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                          <button key={key} onClick={() => updateField({ priority: key })}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${card.priority === key ? cfg.bg + ' ' + cfg.color + ' border-current' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-500 shadow-sm'}`}>
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                            {card.priority === key && <Check size={12} className="ml-1" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Body Split */}
          <div className="flex flex-1 overflow-hidden min-h-[600px]">
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

              {/* ── Location ── */}
              {card.location && (
                <section>
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <h3 className="text-sm font-bold text-gray-700">Location</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <a 
                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.location.address)}`}
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1"
                        >
                           Open in Maps <ExternalLink size={10} />
                        </a>
                        <button 
                           onClick={handleRemoveLocation}
                           className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline"
                        >
                           Remove
                        </button>
                      </div>
                   </div>
                   <div className="pl-6">
                      <div className="group relative bg-bg-secondary/40 rounded-3xl border border-border-light overflow-hidden hover:shadow-2xl transition-all duration-500 min-h-[300px] flex flex-col">
                         {/* Interactive Map Embed */}
                         <div className="flex-1 w-full relative">
                            {card.location.google_place_id && import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                              <iframe
                                width="100%"
                                height="300"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                className="opacity-90 group-hover:opacity-100 transition-opacity"
                                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=place_id:${card.location.google_place_id}`}
                              />
                            ) : (
                              <iframe
                                width="100%"
                                height="300"
                                style={{ border: 0 }}
                                loading="lazy"
                                className="opacity-90 group-hover:opacity-100 transition-opacity"
                                src={card.location.lat && card.location.lng 
                                  ? `https://www.openstreetmap.org/export/embed.html?bbox=${card.location.lng-0.01},${card.location.lat-0.01},${card.location.lng+0.01},${card.location.lat+0.01}&layer=mapnik&marker=${card.location.lat},${card.location.lng}`
                                  : `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(card.location.address)}`
                                }
                              />
                            )}
                         </div>
                         
                         <div className="relative z-10 flex flex-col gap-4">
                            <div>
                               <p className="text-xs font-black text-text-primary mb-1 uppercase tracking-wider">{card.location.name}</p>
                               <p className="text-[11px] font-medium text-text-tertiary leading-relaxed max-w-[80%]">{card.location.address}</p>
                            </div>
                            
                            <a 
                               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.location.address)}`}
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/90 transition-all w-fit shadow-lg shadow-brand-primary/20"
                            >
                               <ExternalLink size={12} />
                               View on Google Maps
                            </a>
                         </div>
                      </div>
                   </div>
                </section>
              )}

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
                      <button 
                        onClick={() => dispatch(toggleModal({ modalName: 'boardSettings', isOpen: true }))} 
                        className="text-[10px] text-brand-primary font-bold hover:underline mt-1"
                      >
                        Configure Fields
                      </button>
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

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-gray-500" />
                    <h3 className="text-sm font-bold text-gray-700">Dependencies</h3>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => { setDepPanelType('blocker'); setShowDependencyPanel(p => !p); }} 
                      className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} />
                      Add Blocker
                    </button>
                    {showDependencyPanel && (
                      <div className="absolute right-0 top-full mt-2 z-[250]">
                        <DependencySelector 
                          currentCardId={card.id} 
                          onSelect={(c) => addDependencyAction(c, depPanelType)}
                          onClose={() => setShowDependencyPanel(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pl-6 space-y-4">
                  {blockers.length > 0 && (
                  <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-danger">Blocking this card</p>
                      {blockers.map(dep => (
                        <div key={dep.blocking_card_id} className="group flex items-center justify-between p-3 bg-danger/5 rounded-2xl border border-danger/10 hover:bg-danger/10 transition-all">
                          <div className="flex items-center gap-3">
                            <AlertCircle size={14} className="text-danger" />
                            <span className="text-[13px] font-bold text-text-primary">{dep.cards?.title || 'Unknown Card'}</span>
                          </div>
                          <button 
                            onClick={() => removeDependencyAction(dep.blocking_card_id, dep.blocked_card_id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-danger/10 rounded-lg transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {cardsBlockingOthers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-success">Blocked by this card</p>
                      {cardsBlockingOthers.map(dep => (
                        <div key={dep.blocked_card_id} className="group flex items-center justify-between p-3 bg-success/5 rounded-2xl border border-success/10 hover:bg-success/10 transition-all">
                           <div className="flex items-center gap-3">
                            <CheckCircle2 size={14} className="text-success" />
                            <span className="text-[13px] font-bold text-text-primary">{dep.cards_blocked?.title || 'Another Card'}</span>
                          </div>
                          <button 
                            onClick={() => removeDependencyAction(dep.blocking_card_id, dep.blocked_card_id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-danger/10 rounded-lg transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {blockers.length === 0 && cardsBlockingOthers.length === 0 && (
                    <div className="py-4 border-2 border-dashed border-border-light rounded-2xl text-center">
                      <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest">Connect dependencies to visualize flow</p>
                    </div>
                  )}
                </div>
              </section>



              {/* ── Location & Maps ── */}
              {card.location && (
                <section id="location-section" className="scroll-mt-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-gray-500" />
                       <h3 className="text-sm font-bold text-gray-700">Location</h3>
                    </div>
                    <button 
                      onClick={handleRemoveLocation}
                      className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="pl-6">
                    <div className="bg-white rounded-3xl border border-border-light shadow-xl overflow-hidden group">
                       <div className="h-[220px] w-full bg-bg-secondary relative">
                          <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD7_ibpCTgMRShrNQJbnZyY1KaWhrRrT4g&q=${encodeURIComponent(card.location.address || card.location.name)}`}
                          ></iframe>
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between">
                             <div className="min-w-0">
                                <p className="text-white text-sm font-black truncate">{card.location.name}</p>
                                <p className="text-white/70 text-[10px] font-medium truncate">{card.location.address}</p>
                             </div>
                             <a 
                               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.location.address || card.location.name)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-all"
                             >
                                <Globe size={16} />
                             </a>
                          </div>
                       </div>
                    </div>
                  </div>
                </section>
              )}

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
                             <span>Added {att.created_at && !isNaN(new Date(att.created_at).getTime()) ? formatDistanceToNow(new Date(att.created_at), { addSuffix: true }) : 'recently'}</span>
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
                               onClick={() => removeAttachment(att.id, att.storage_path)}
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

            </div>

            {/* ── Side Nav: Activity & Timeline ── */}
            <div className="w-[380px] shrink-0 border-l border-gray-100 bg-gray-50/40 flex flex-col h-full overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Sparkles size={18} className="text-brand-primary" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Timeline</h3>
                    </div>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                       <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {/* Comment composer moved here */}
                  <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-lg shadow-brand-primary/20">
                          {(user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="relative group">
                            <textarea
                              rows={3}
                              value={commentText}
                              onChange={e => setCommentText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                              placeholder="Add to timeline..."
                              className="w-full text-[13px] bg-white border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/40 transition-all resize-none placeholder:text-text-tertiary font-bold shadow-sm"
                            />
                            <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                              <button onClick={postComment} className="p-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-110 transition-all">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                            {typers.length > 0 && (
                              <div className="absolute left-2 -bottom-5 flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                  <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-1 h-1 bg-brand-primary rounded-full animate-bounce" />
                                </div>
                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                                  {typers[0].user.full_name.split(' ')[0]} typing...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
                  <CardActivityList cardId={card.id} />
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CardDetailsModal;

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart2, 
  Calendar as CalendarIcon, 
  User, 
  Tag, 
  MoreVertical,
  Flag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { setActiveCardId } from '../../store/slices/uiSlice';
import { updateCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';

const TableView = () => {
  const dispatch = useDispatch();
  const { lists, cards } = useSelector((state) => state.board);
  const [sortConfig, setSortConfig] = useState({ key: 'position', direction: 'asc' });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 ring-1 ring-red-100';
      case 'HIGH':     return 'text-orange-600 bg-orange-50 ring-1 ring-orange-100';
      case 'MEDIUM':   return 'text-blue-600 bg-blue-50 ring-1 blue-100';
      case 'LOW':      return 'text-gray-600 bg-gray-50 ring-1 ring-gray-100';
      default:         return 'text-gray-400 bg-gray-50';
    }
  };

  const getListName = (listId) => {
    return lists.find(l => l.id === listId)?.title || 'Unknown';
  };

  const openCardDetails = (card) => {
    dispatch(setActiveCardId(card.id));
  };

  const toggleComplete = async (e, card) => {
    e.stopPropagation();
    const newStatus = !card.is_completed;
    dispatch(updateCard({ id: card.id, is_completed: newStatus }));
    await supabase.from('cards').update({ is_completed: newStatus }).eq('id', card.id);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCards = useMemo(() => {
    let items = [...cards];
    items.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'list_name') {
        valA = getListName(a.list_id);
        valB = getListName(b.list_id);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [cards, sortConfig, lists]);

  const SortHeader = ({ label, sortKey, className = "" }) => (
    <th 
      className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary cursor-pointer hover:bg-bg-secondary transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortConfig.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
        ) : (
          <ArrowUpDown size={10} className="text-text-tertiary/30" />
        )}
      </div>
    </th>
  );

  return (
    <div className="absolute inset-0 bg-white overflow-auto flex flex-col">
      <div className="flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border-light bg-bg-secondary/30 sticky top-0 z-10 backdrop-blur-sm">
              <SortHeader label="Task Name" sortKey="title" className="w-1/3" />
              <SortHeader label="List" sortKey="list_name" />
              <SortHeader label="Priority" sortKey="priority" />
              <SortHeader label="Due Date" sortKey="due_date" />
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Assignees</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {sortedCards.map((card) => (
              <tr 
                key={card.id} 
                className="hover:bg-bg-secondary/30 transition-all group cursor-pointer border-l-2 border-transparent hover:border-brand-primary"
                onClick={() => openCardDetails(card)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => toggleComplete(e, card)}
                      className={`group/check p-0.5 rounded-full transition-all ${card.is_completed ? 'text-success' : 'text-text-tertiary hover:text-brand-primary'}`}
                    >
                      {card.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <span className={`text-sm font-bold text-text-primary transition-all ${card.is_completed ? 'line-through opacity-40 grayscale' : ''}`}>
                      {card.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-bg-secondary text-text-secondary border border-border-light/50">
                    <BarChart2 size={12} className="text-text-tertiary" />
                    <span className="text-[10px] font-black uppercase tracking-tight">{getListName(card.list_id)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${getPriorityColor(card.priority)}`}>
                    <Flag size={10} className="fill-current" />
                    {card.priority || 'NONE'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-2 text-xs font-bold ${!card.is_completed && card.due_date && new Date(card.due_date) < new Date() ? 'text-danger' : 'text-text-secondary'}`}>
                    <CalendarIcon size={14} className="text-text-tertiary" />
                    <span>
                      {card.due_date ? format(new Date(card.due_date), 'MMM d, yyyy') : '--'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-bg-tertiary flex items-center justify-center text-[10px] font-bold shadow-sm hover:z-10 transition-transform hover:scale-110">
                        <User size={14} className="text-text-tertiary" />
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 hover:bg-bg-tertiary rounded-xl text-text-tertiary opacity-0 group-hover:opacity-100 transition-all hover:text-text-primary">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {cards.length === 0 && (
        <div className="p-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="bg-bg-secondary w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 text-text-tertiary rotate-3 shadow-inner">
             <BarChart2 size={40} className="opacity-20" />
          </div>
          <h3 className="font-bold text-xl text-text-primary tracking-tight">No tasks available in this board</h3>
          <p className="text-sm text-text-secondary mt-2 max-w-xs transition-opacity opacity-60">Switch back to the Board view to start brainstorming and adding cards.</p>
        </div>
      )}
    </div>
  );
};

export default TableView;


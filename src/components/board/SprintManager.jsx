import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Calendar,
  Plus,
  ChevronRight,
  MoreVertical,
  Play,
  CheckCircle2,
  Clock,
  X,
  Box
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SprintManager = ({ onClose }) => {
  const { sprints, activeBoard } = useSelector((state) => state.board);
  const [newSprintName, setNewSprintName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreateSprint = async () => {
    if (!newSprintName) return;
    const { data } = await supabase
      .from('sprints')
      .insert({
        board_id: activeBoard.id,
        name: newSprintName,
        start_date: startDate || null,
        end_date: endDate || null,
        status: 'PLANNED'
      })
      .select()
      .single();

    if (data) {
      setNewSprintName('');
      setStartDate('');
      setEndDate('');
      // Store update logic or re-fetch would go here
    }
  };

  const updateSprintStatus = async (sprintId, status) => {
    const { error } = await supabase
      .from('sprints')
      .update({ status })
      .eq('id', sprintId);
    
    if (!error) {
       // dispatch(updateSprint({id: sprintId, status}));
    }
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-white shadow-2xl border-l border-border-light z-[60] flex flex-col p-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-xl font-bold flex items-center gap-3 text-text-primary">
          <Calendar size={24} className="text-brand-primary" />
          Sprints
        </h2>
        <button
          className="p-2 hover:bg-bg-secondary rounded-xl text-text-tertiary hover:text-text-primary transition-all"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-10">
        <div className="space-y-3">
          <input
            placeholder="Sprint name (e.g. Iteration 1)"
            className="w-full h-10 bg-bg-secondary border-none rounded-xl px-4 text-sm font-bold text-text-primary focus:bg-white focus:ring-2 focus:ring-brand-primary/10 transition-all outline-none"
            value={newSprintName}
            onChange={(e) => setNewSprintName(e.target.value)}
          />
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">Start</label>
              <input 
                type="date"
                className="w-full h-10 bg-bg-secondary border-none rounded-xl px-3 text-[11px] font-bold text-text-primary outline-none"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-text-tertiary ml-1">End</label>
              <input 
                type="date"
                className="w-full h-10 bg-bg-secondary border-none rounded-xl px-3 text-[11px] font-bold text-text-primary outline-none"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button className="w-full btn btn-primary !h-10 !rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={handleCreateSprint}>
            <Plus size={16} className="mr-2" />
            Create Sprint
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {sprints.map(sprint => (
          <div key={sprint.id} className="p-5 border border-border-light rounded-2xl bg-white hover:border-brand-primary/40 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-text-primary group-hover:text-brand-primary transition-colors">{sprint.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${sprint.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-tertiary'
                }`}>
                {sprint.status}
              </span>
            </div>

            <div className="text-xs text-text-secondary flex items-center gap-5 mb-5 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-text-tertiary" />
                <span>2 Weeks</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Box size={14} className="text-text-tertiary" />
                <span>0 Cards</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border-light/60">
              {sprint.status === 'PLANNED' && (
                <button 
                  onClick={() => updateSprintStatus(sprint.id, 'ACTIVE')}
                  className="btn btn-secondary flex-1 !h-8 !text-[11px] !rounded-lg !bg-bg-secondary"
                >
                  <Play size={12} className="fill-current" />
                  Start Sprint
                </button>
              )}
              {sprint.status === 'ACTIVE' && (
                <button 
                  onClick={() => updateSprintStatus(sprint.id, 'COMPLETED')}
                  className="btn btn-primary flex-1 !h-8 !text-[11px] !rounded-lg shadow-sm"
                >
                  <CheckCircle2 size={12} />
                  Complete Sprint
                </button>
              )}
              <button className="p-1.5 hover:bg-bg-secondary rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
        {sprints.length === 0 && (
          <div className="text-center p-12 bg-bg-secondary/50 rounded-3xl border-2 border-dashed border-border-medium flex flex-col items-center gap-3">
            <div className="p-3 bg-white rounded-full text-text-tertiary shadow-sm">
              <Calendar size={24} />
            </div>
            <p className="text-sm font-bold text-text-tertiary italic">No sprints planned yet.</p>
            <p className="text-[10px] text-text-tertiary px-6">Create your first sprint to start tracking iterations and team velocity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintManager;

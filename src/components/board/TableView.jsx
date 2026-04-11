import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
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
  Circle,
  Filter,
  Search,
  Layout,
  Plus,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { setActiveCardId, addNotification } from '../../store/slices/uiSlice';
import { updateCard, addCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { resolvePrismStyles } from '../../lib/prismEvaluator';
import { evaluateFormula } from '../../lib/formulaEvaluator';
import PrismRulesDialog from '../modals/PrismRulesDialog';

const columnHelper = createColumnHelper();

// ─── Editable Components ──────────────────────────────────────────────────────

const EditableTextCell = ({ value: initialValue, row, column, updateData }) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const onBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      updateData(row.original.id, column.id, value);
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={e => e.key === 'Enter' && onBlur()}
        className="w-full bg-bg-secondary px-2 py-1 rounded-lg border-2 border-brand-primary outline-none font-bold text-sm"
      />
    );
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
      className={`text-sm font-bold text-text-primary px-2 py-1 rounded-lg hover:bg-bg-secondary transition-colors cursor-text truncate max-w-[300px] ${row.original.is_completed ? 'line-through opacity-40' : ''}`}
    >
      {value}
    </div>
  );
};

const PrioritySelectCell = ({ value: priority, row, updateData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'];

  const colors = {
    CRITICAL: 'text-red-600 bg-red-50 ring-1 ring-red-100',
    HIGH: 'text-orange-600 bg-orange-50 ring-1 ring-orange-100',
    MEDIUM: 'text-blue-600 bg-blue-50 ring-1 ring-blue-100',
    LOW: 'text-gray-600 bg-gray-50 ring-1 ring-gray-100',
    NONE: 'text-gray-400 bg-bg-secondary'
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight transition-all hover:scale-105 active:scale-95 ${colors[priority || 'NONE']}`}
      >
        <Flag size={10} className="fill-current" />
        {priority || 'NONE'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute left-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-border-light p-2 z-40 overflow-hidden"
            >
              {priorities.map(p => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateData(row.original.id, 'priority', p);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black tracking-tight hover:bg-bg-secondary transition-colors ${colors[p]} mb-1 last:mb-0`}
                >
                  <Flag size={10} className="fill-current" />
                  {p}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ListSelectCell = ({ value: initialListId, row, lists, updateData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentList = lists.find(l => l.id === initialListId);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-bg-secondary text-text-secondary border border-border-light/50 font-black text-[9px] uppercase tracking-tighter hover:bg-bg-tertiary transition-all"
      >
        <Layout size={10} className="text-text-tertiary" />
        {currentList?.title || 'Unlisted'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-border-light p-2 z-40 overflow-hidden"
            >
              <p className="px-3 py-2 text-[8px] font-black text-text-tertiary uppercase tracking-widest border-b border-border-light mb-1">Move to List</p>
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateData(row.original.id, 'list_id', list.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold text-text-secondary hover:bg-bg-secondary hover:text-brand-primary transition-all ${list.id === initialListId ? 'bg-brand-primary/5 text-brand-primary' : ''}`}
                >
                  <Layout size={12} className={list.id === initialListId ? 'text-brand-primary' : 'text-text-tertiary'} />
                  {list.title}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Table Component ─────────────────────────────────────────────────────

const TableView = () => {
  const dispatch = useDispatch();
  const { lists, cards, activeBoard } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isPrismOpen, setIsPrismOpen] = useState(false);
  const [customFields, setCustomFields] = useState([]);

  useEffect(() => {
    const fetchCustomFields = async () => {
      const { data } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('board_id', activeBoard.id);
      if (data) setCustomFields(data);
    };
    if (activeBoard?.id) fetchCustomFields();
  }, [activeBoard?.id]);

  const updateData = async (cardId, columnId, value) => {
    // Optimistic Update
    const patch = { [columnId]: value };
    dispatch(updateCard({ id: cardId, ...patch }));

    // Remote Persistence
    const { error } = await supabase.from('cards').update(patch).eq('id', cardId);
    if (error) {
      dispatch(addNotification({ message: 'Failed to update card', type: 'error' }));
      // Rollback logic could be added here if needed
    }
  };

  const handleQuickAdd = async (e) => {
    if (e.key === 'Enter' && quickAddTitle.trim() && lists.length > 0) {
      const newListId = lists[0].id; // Default to first list
      const newCard = {
        board_id: activeBoard.id,
        list_id: newListId,
        title: quickAddTitle.trim(),
        created_by: user.id,
        position: 'n', // default position
      };

      const { data, error } = await supabase.from('cards').insert(newCard).select().single();
      if (data) {
        dispatch(addCard(data));
        setQuickAddTitle('');
      } else if (error) {
        dispatch(addNotification({ message: 'Failed to create task', type: 'error' }));
      }
    }
  };

  // Data mapping for table
  const data = useMemo(() => cards.map(card => ({
    ...card,
    listName: lists.find(l => l.id === card.list_id)?.title || 'Unlisted',
  })), [cards, lists]);

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Task Name',
      cell: info => (
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = !info.row.original.is_completed;
              updateData(info.row.original.id, 'is_completed', newStatus);
            }}
            className={`p-0.5 rounded-full transition-all shrink-0 ${info.row.original.is_completed ? 'text-green-500' : 'text-text-tertiary hover:text-brand-primary'}`}
          >
            {info.row.original.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <EditableTextCell
            value={info.getValue()}
            row={info.row}
            column={info.column}
            updateData={updateData}
          />
        </div>
      ),
    }),
    columnHelper.accessor('list_id', {
      header: 'List',
      cell: info => <ListSelectCell value={info.getValue()} row={info.row} lists={lists} updateData={updateData} />,
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PrioritySelectCell value={info.getValue()} row={info.row} updateData={updateData} />,
    }),
    columnHelper.accessor('due_date', {
      header: 'Due Date',
      cell: info => {
        const date = info.getValue();
        if (!date) return (
          <button className="text-text-tertiary opacity-40 hover:opacity-100 transition-opacity text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-bg-secondary">
            Set date
          </button>
        );
        const isPastDue = new Date(date) < new Date() && !info.row.original.is_completed;
        return (
          <div className={`flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-lg hover:bg-bg-secondary transition-colors ${isPastDue ? 'text-red-500' : 'text-text-secondary'}`}>
            <CalendarIcon size={14} className="opacity-40" />
            {format(new Date(date), 'MMM d, yyyy')}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <button className="p-2 hover:bg-bg-tertiary rounded-xl text-text-tertiary opacity-0 group-hover:opacity-100 transition-all hover:text-text-primary">
          <MoreVertical size={16} />
        </button>
      ),
    }),
    // Dynamic Formula Columns
    ...customFields
      .filter(f => f.type === 'FORMULA')
      .map(field => 
        columnHelper.accessor(row => evaluateFormula(row, field.options?.formula), {
          id: `formula-${field.id}`,
          header: field.name,
          cell: info => (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary/50 rounded-xl border border-border-light/50">
               <Calculator size={12} className="text-brand-primary opacity-40 shrink-0" />
               <span className="text-[11px] font-black text-text-primary tracking-tight">
                 {info.getValue()}
               </span>
            </div>
          ),
        })
      )
  ], [lists, customFields, dispatch]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col h-full bg-white transition-all duration-500">
      {/* Table Toolbar */}
      <div className="h-16 border-b border-border-light px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors" size={16} />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Filter Nexus Grid..."
              className="w-full pl-12 pr-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary rounded-2xl text-sm font-medium outline-none border border-transparent focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all">
              <Filter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all">
              <ArrowUpDown size={14} />
              Sort
            </button>
            <button
              onClick={() => setIsPrismOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 transition-all border border-brand-primary/10"
            >
              <Zap size={14} />
              Prism
            </button>
          </div>
        </div>

        {isPrismOpen && (
          <PrismRulesDialog
            isOpen={isPrismOpen}
            onClose={() => setIsPrismOpen(false)}
            board={activeBoard}
          />
        )}

        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-border-light mx-2" />
          <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest bg-bg-secondary px-3 py-1 rounded-full">
            {table.getFilteredRowModel().rows.length} Nexus Units
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-border-light bg-bg-secondary/30 sticky top-0 z-10 backdrop-blur-sm">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary select-none cursor-pointer hover:bg-bg-secondary transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ArrowUp size={10} className="text-brand-primary" />,
                        desc: <ArrowDown size={10} className="text-brand-primary" />,
                      }[header.column.getIsSorted()] ?? <ArrowUpDown size={10} className="opacity-20" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border-light">
            {table.getRowModel().rows.map(row => {
              const prismRules = activeBoard?.settings?.prism_rules || [];
              const prismStyles = resolvePrismStyles(row.original, prismRules);

              return (
                <motion.tr
                  key={row.id}
                  initial={false}
                  animate={{
                    backgroundColor: prismStyles.rowBg || 'transparent',
                    borderColor: prismStyles.rowBorder || 'transparent',
                    color: prismStyles.textColor || 'inherit'
                  }}
                  whileHover={{ backgroundColor: prismStyles.rowBg ? `${prismStyles.rowBg}CC` : 'rgba(243, 244, 246, 0.2)' }}
                  className={`transition-all group cursor-pointer border-l-2 hover:border-brand-primary ${prismStyles.glow ? 'shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}
                  onClick={() => dispatch(setActiveCardId(row.original.id))}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-8 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              );
            })}

            {/* Quick Add Row */}
            <tr className="bg-bg-secondary/10 hover:bg-bg-secondary/30 transition-all">
              <td className="px-8 py-4 flex items-center gap-3">
                <div className="p-0.5 text-text-tertiary opacity-40">
                  <Plus size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Quick add new task..."
                  value={quickAddTitle}
                  onChange={e => setQuickAddTitle(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  className="bg-transparent border-none outline-none font-bold text-sm text-text-primary w-full placeholder:text-text-tertiary/40"
                />
              </td>
              <td colSpan={4} />
            </tr>
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && !quickAddTitle && (
          <div className="p-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[28px] bg-bg-secondary flex items-center justify-center text-text-tertiary shadow-inner mb-8 rotate-12">
              <BarChart2 size={48} className="opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">System Empty</h3>
            <p className="text-sm text-text-tertiary mt-2 max-w-xs leading-relaxed font-medium">The Nexus Grid is clear. Use the quick add row or the board view to initialize tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableView;

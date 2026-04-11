import React, { useMemo, useState } from 'react';
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
  Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { setActiveCardId } from '../../store/slices/uiSlice';
import { updateCard } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const columnHelper = createColumnHelper();

const TableView = () => {
  const dispatch = useDispatch();
  const { lists, cards } = useSelector((state) => state.board);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

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
              dispatch(updateCard({ id: info.row.original.id, is_completed: newStatus }));
              supabase.from('cards').update({ is_completed: newStatus }).eq('id', info.row.original.id);
            }}
            className={`p-0.5 rounded-full transition-all ${info.row.original.is_completed ? 'text-green-500' : 'text-text-tertiary hover:text-brand-primary'}`}
          >
            {info.row.original.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <span className={`text-sm font-bold text-text-primary ${info.row.original.is_completed ? 'line-through opacity-40' : ''}`}>
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('listName', {
      header: 'List',
      cell: info => (
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-bg-secondary text-text-secondary border border-border-light/50 font-black text-[9px] uppercase tracking-tighter">
          <Layout size={10} className="text-text-tertiary" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => {
        const priority = info.getValue() || 'NONE';
        const colors = {
          CRITICAL: 'text-red-600 bg-red-50 ring-1 ring-red-100',
          HIGH:     'text-orange-600 bg-orange-50 ring-1 ring-orange-100',
          MEDIUM:   'text-blue-600 bg-blue-50 ring-1 ring-blue-100',
          LOW:      'text-gray-600 bg-gray-50 ring-1 ring-gray-100',
          NONE:     'text-gray-400 bg-bg-secondary'
        };
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${colors[priority]}`}>
            <Flag size={10} className="fill-current" />
            {priority}
          </div>
        );
      },
    }),
    columnHelper.accessor('due_date', {
      header: 'Due Date',
      cell: info => {
        const date = info.getValue();
        if (!date) return <span className="text-text-tertiary opacity-40 text-[10px] font-bold">--</span>;
        const isPastDue = new Date(date) < new Date() && !info.row.original.is_completed;
        return (
          <div className={`flex items-center gap-2 text-xs font-bold ${isPastDue ? 'text-red-500' : 'text-text-secondary'}`}>
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
  ], [dispatch]);

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
              placeholder="Search tasks, priorities, lists..."
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
            {table.getFilteredRowModel().rows.length} Tasks
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
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="hover:bg-bg-secondary/20 transition-all group cursor-pointer border-l-2 border-transparent hover:border-brand-primary"
                onClick={() => dispatch(setActiveCardId(row.original.id))}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-8 py-5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="p-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-[40px] bg-bg-secondary flex items-center justify-center text-text-tertiary shadow-inner mb-8 rotate-12">
               <BarChart2 size={48} className="opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight">No results found</h3>
            <p className="text-sm text-text-tertiary mt-2 max-w-xs leading-relaxed font-medium">Try adjusting your search or filters to find the tasks you are looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableView;

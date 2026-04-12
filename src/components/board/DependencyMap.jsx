import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Network, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Maximize2,
  Zap,
  Flag,
  Layout
} from 'lucide-react';
import { setActiveCardId } from '../../store/slices/uiSlice';
import { addDependency } from '../../store/slices/boardSlice';
import { supabase } from '../../lib/supabase';

// --- Custom Node Component ---
const CardNode = ({ data }) => {
  const isCompleted = data.card.is_completed;
  const priority = data.card.priority || 'NONE';
  
  const priorityColors = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-blue-500',
    LOW: 'bg-gray-400',
    NONE: 'bg-gray-200'
  };

  return (
    <div className={`p-4 rounded-3xl bg-white border-2 transition-all hover:shadow-2xl min-w-[200px] shadow-sm relative overflow-hidden group ${isCompleted ? 'border-green-500/30' : 'border-white hover:border-brand-primary'}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-300 !w-2 !h-2" />
      
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-green-500' : priorityColors[priority]}`} />
      
      <div className="flex items-start justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
          {isCompleted ? 'Completed' : 'Active Task'}
        </span>
        {isCompleted ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-text-tertiary" />}
      </div>
      
      <h4 className="text-xs font-bold text-text-primary leading-tight line-clamp-2 mb-2 pr-2">
        {data.card.title}
      </h4>

      <div className="flex items-center justify-between mt-auto">
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black text-white ${priorityColors[priority]}`}>
          {priority}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 size={10} className="text-text-tertiary" />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-brand-primary !w-2 !h-2" />
    </div>
  );
};

const nodeTypes = {
  cardNode: CardNode,
};

const DependencyMap = () => {
  const dispatch = useDispatch();
  const { cards, dependencies, lists } = useSelector((state) => state.board);
  const { user } = useSelector((state) => state.auth);

  // --- Graph Initialization ---
  const initialElements = useMemo(() => {
    const nodes = [];
    const edges = [];

    // 1. Create Nodes for ALL active board cards
    // Sort cards to ensure consistent deterministic layout if needed
    const listMap = {};
    lists.forEach((l, i) => listMap[l.id] = i);

    cards.filter(c => !c.is_archived).forEach((card) => {
      const listIdx = listMap[card.list_id] ?? 0;
      // Get index of card within its own list for Y positioning
      const cardsInList = cards.filter(c => !c.is_archived && c.list_id === card.list_id);
      const cardIdx = cardsInList.findIndex(c => c.id === card.id);

      nodes.push({
        id: card.id,
        type: 'cardNode',
        data: { card },
        // Simple Grid Layout: X = List Column, Y = Card Row
        position: { 
          x: listIdx * 350, 
          y: cardIdx * 180 + (listIdx % 2 === 0 ? 0 : 40) // Slight stagger for better visual flow
        },
      });
    });

    // 2. Create Edges from dependencies
    dependencies.forEach(dep => {
      // Only show edge if both cards exist in current node set
      if (nodes.some(n => n.id === dep.blocking_card_id) && nodes.some(n => n.id === dep.blocked_card_id)) {
        edges.push({
          id: `e-${dep.blocking_card_id}-${dep.blocked_card_id}`,
          source: dep.blocking_card_id,
          target: dep.blocked_card_id,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: { type: 'arrowclosed', color: '#3b82f6' }
        });
      }
    });

    return { nodes, edges };
  }, [cards, dependencies, lists]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  const onConnect = useCallback(async (params) => {
    const { source, target } = params;
    if (source === target) return;

    // 1. Optimistic Update
    const newDep = {
      blocking_card_id: source,
      blocked_card_id: target,
      type: 'FINISH_TO_START'
    };
    
    dispatch(addDependency(newDep));
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 3 }, markerEnd: { type: 'arrowclosed', color: '#3b82f6' } }, eds));

    // 2. DB Persistence
    const { error } = await supabase
      .from('card_dependencies')
      .insert({
        blocking_card_id: source,
        blocked_card_id: target,
        created_by: user.id
      });

    if (error) {
      console.error('Failed to save dependency:', error);
      // Rollback would be nice but for now we rely on the next fetch
    }
  }, [setEdges, dispatch, user.id]);

  const onNodeClick = (_, node) => {
    dispatch(setActiveCardId(node.data.card.id));
  };

  return (
    <div className="absolute inset-0 bg-bg-secondary/30 flex flex-col">
      {/* HUD Header */}
      <div className="shrink-0 p-8 flex items-center justify-between relative z-20 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <div className="px-6 py-4 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Dependency Graph</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-text-primary">{edges.length}</span>
              <Network className="text-brand-primary mb-1" size={18} />
            </div>
          </div>
          <div className="px-6 py-4 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-3xl flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Project Scope</span>
            <div className="flex items-end gap-2">
               <span className="text-3xl font-black text-slate-800">{nodes.length}</span>
               <Layout className="text-slate-400 mb-1" size={18} />
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-text-tertiary text-xs font-bold uppercase tracking-widest">
           <Zap size={14} className="text-brand-primary" />
           Interactive Flow Map
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 min-h-0 relative">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#E2E8F0" gap={20} />
            <Controls className="!bg-white !border-border-light !rounded-xl !shadow-xl" />
            <MiniMap 
              nodeColor={n => n.data.card.is_completed ? '#22C55E' : '#3B82F6'} 
              className="!bg-white !border-border-light !rounded-2xl !shadow-2xl"
              maskColor="rgba(255, 255, 255, 0.5)"
            />
          </ReactFlow>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 bg-white/50 backdrop-blur-xl rounded-[48px] shadow-2xl flex items-center justify-center border border-white/40">
              <Network size={64} className="text-brand-primary/20" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-text-primary">No Network Established</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed italic">
                Connect tasks in the card details to visualize your project's dependency flow.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-border-light bg-white/30 backdrop-blur-md shrink-0 flex items-center justify-center gap-8">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Blocking Task</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Blocked Task</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-300 border-t-2 border-dotted border-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Animated Flow</span>
         </div>
      </div>
    </div>
  );
};

export default DependencyMap;

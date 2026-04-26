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
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Layout, 
  CheckCircle2, 
  Clock,
  Maximize2,
  Sparkles,
  Layers,
  Box
} from 'lucide-react';
import { setActiveCardId } from '../../store/slices/uiSlice';

// --- Custom Node Components ---

const BoardNode = ({ data }) => (
  <div className="px-8 py-5 rounded-[40px] bg-primary text-white border-4 border-white shadow-2xl min-w-[240px] flex flex-col items-center justify-center gap-2 relative group overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <Layers size={24} className="mb-1" />
    <h3 className="text-lg font-black uppercase tracking-widest text-center leading-tight">
      {data.label}
    </h3>
    <div className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Project Root</div>
    <Handle type="source" position={Position.Right} className="!bg-white !w-3 !h-3 !border-primary border-2" />
  </div>
);

const ListNode = ({ data }) => (
  <div className="px-6 py-4 rounded-[28px] bg-white border-2 border-slate-200 shadow-xl min-w-[200px] flex flex-col gap-1 relative hover:border-primary transition-all group">
    <Handle type="target" position={Position.Left} className="!bg-slate-300 !w-2 !h-2" />
    <div className="flex items-center gap-2 mb-1">
      <Box size={14} className="text-primary" />
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-tertiary">Group</span>
    </div>
    <h4 className="text-sm font-black text-foreground capitalize">
      {data.label}
    </h4>
    <Handle type="source" position={Position.Right} className="!bg-primary !w-2 !h-2" />
  </div>
);

const TaskNode = ({ data }) => {
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
    <div className={`p-4 rounded-3xl bg-white border-2 transition-all hover:shadow-2xl min-w-[220px] shadow-sm relative overflow-hidden group ${isCompleted ? 'border-green-500/30' : 'border-slate-100 hover:border-primary'}`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-300 !w-2 !h-2" />
      
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isCompleted ? 'bg-green-500' : priorityColors[priority]}`} />
      
      <div className="flex items-start justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
          {isCompleted ? 'Finished' : 'In Progress'}
        </span>
        {isCompleted ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-text-tertiary" />}
      </div>
      
      <h4 className="text-xs font-bold text-foreground leading-tight line-clamp-2 mb-2 pr-4">
        {data.card.title}
      </h4>

      <div className="flex items-center justify-between mt-auto">
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black text-white ${priorityColors[priority]}`}>
          {priority}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[9px] font-black uppercase text-primary tracking-tighter">Details</span>
           <Maximize2 size={10} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  boardNode: BoardNode,
  listNode: ListNode,
  taskNode: TaskNode,
};

const MindmapView = () => {
  const dispatch = useDispatch();
  const { activeBoard, cards, lists } = useSelector((state) => state.board);

  const initialElements = useMemo(() => {
    if (!activeBoard) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];

    // 1. Root Node (Board)
    nodes.push({
      id: 'root',
      type: 'boardNode',
      data: { label: activeBoard.title },
      position: { x: 0, y: (lists.length * 200) / 2 },
    });

    // 2. Compute Spacing
    const LIST_X = 400;
    const TASK_X = 800;
    const Y_SPACING = 200;

    let currentY = 0;

    // 3. Process Lists and their Cards
    lists.forEach((list, lIdx) => {
      const listNodeId = `list-${list.id}`;
      const listCards = cards.filter(c => c.list_id === list.id && !c.is_archived);
      
      // Calculate Y for this list based on the middle of its cards
      const listBlockHeight = Math.max(1, listCards.length) * 120;
      const listY = currentY + (listBlockHeight / 2) - 30;

      nodes.push({
        id: listNodeId,
        type: 'listNode',
        data: { label: list.title },
        position: { x: LIST_X, y: listY },
      });

      edges.push({
        id: `e-root-${listNodeId}`,
        source: 'root',
        target: listNodeId,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.3 },
      });

      // Process Cards in this List
      listCards.forEach((card, cIdx) => {
        const cardNodeId = card.id;
        const cardY = currentY + (cIdx * 120);

        nodes.push({
          id: cardNodeId,
          type: 'taskNode',
          data: { card },
          position: { x: TASK_X, y: cardY },
        });

        edges.push({
          id: `e-${listNodeId}-${cardNodeId}`,
          source: listNodeId,
          target: cardNodeId,
          style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
        });
      });

      currentY += Math.max(1, listCards.length) * 140; // Add buffers between lists
    });

    return { nodes, edges };
  }, [activeBoard, cards, lists]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  const onNodeClick = useCallback((_, node) => {
    if (node.type === 'taskNode') {
      dispatch(setActiveCardId(node.data.card.id));
    }
  }, [dispatch]);

  return (
    <div className="absolute inset-0 bg-slate-50/50 flex flex-col">
       {/* HUD */}
       <div className="shrink-0 p-8 flex items-start justify-between relative z-20 pointer-events-none">
          <div className="flex gap-4 pointer-events-auto">
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border border-white/40 shadow-xl rounded-[32px] flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Mindmap Logic</span>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-foreground">Breakdown</span>
                <Sparkles className="text-primary mb-1 animate-pulse" size={18} />
              </div>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-text-tertiary text-xs font-bold uppercase tracking-widest">
             <Layout size={14} className="text-primary" />
             Hierarchical Project Flow
          </div>
       </div>

       <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#E2E8F0" gap={40} />
            <Controls className="!bg-white !border-border-light !rounded-2xl !shadow-2xl" />
            <MiniMap 
               nodeColor={n => {
                  if (n.type === 'boardNode') return '#6366f1';
                  if (n.type === 'listNode') return '#94a3b8';
                  return n.data.card.is_completed ? '#22C55E' : '#e2e8f0';
               }}
               className="!bg-white !border-border-light !rounded-3xl !shadow-2xl overflow-hidden" 
            />
          </ReactFlow>
       </div>
    </div>
  );
};

export default MindmapView;

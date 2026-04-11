import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Network, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Maximize2,
  Lock,
  Zap
} from 'lucide-react';
import { setActiveCardId } from '../../store/slices/uiSlice';

const DependencyMap = () => {
  const dispatch = useDispatch();
  const { cards, dependencies, activeBoard } = useSelector((state) => state.board);

  const openCardDetails = (cardId) => {
    dispatch(setActiveCardId(cardId));
  };

  // ── Graph Logic ─────────────────────────────────────────────────────────────
  const graphData = useMemo(() => {
    if (!dependencies.length) return { nodes: [], links: [], levels: [] };

    const nodesMap = new Map();
    const links = [];
    
    // 1. Identify all cards involved in dependencies
    dependencies.forEach(dep => {
      const parent = cards.find(c => c.id === dep.blocking_card_id);
      const child = cards.find(c => c.id === dep.blocked_card_id);
      
      if (parent && child) {
        if (!nodesMap.has(parent.id)) nodesMap.set(parent.id, { ...parent, children: [], parents: [] });
        if (!nodesMap.has(child.id)) nodesMap.set(child.id, { ...child, children: [], parents: [] });
        
        nodesMap.get(parent.id).children.push(child.id);
        nodesMap.get(child.id).parents.push(parent.id);
        links.push({ from: parent.id, to: child.id });
      }
    });

    // 2. Assign Levels (Ranks) using a simple topological approach
    const nodes = Array.from(nodesMap.values());
    const levels = [];
    const processed = new Set();
    let remaining = [...nodes];

    // Safety counter to prevent infinite loops in cyclic dependencies
    let iterations = 0;
    while (remaining.length > 0 && iterations < 100) {
      const currentLevel = remaining.filter(node => 
        node.parents.every(pId => processed.has(pId))
      );
      
      if (currentLevel.length === 0) {
        // Handle cycles or stranded nodes by just pushing the rest
        levels.push(remaining);
        break;
      }

      levels.push(currentLevel);
      currentLevel.forEach(n => processed.add(n.id));
      remaining = remaining.filter(n => !processed.has(n.id));
      iterations++;
    }

    return { nodes, links, levels };
  }, [cards, dependencies]);

  const blockersCount = dependencies.length;
  const criticalTasks = cards.filter(c => 
    dependencies.some(d => d.blocked_card_id === c.id)
  ).length;

  // ── Render Helpers ──────────────────────────────────────────────────────────
  const BOX_WIDTH = 220;
  const BOX_HEIGHT = 80;
  const GAP_X = 120;
  const GAP_Y = 40;

  return (
    <div className="absolute inset-0 bg-bg-secondary/30 overflow-auto scrollbar-hide select-none flex flex-col">
      {/* HUD Header */}
      <div className="shrink-0 p-8 flex items-center justify-between pointer-events-none relative z-20">
        <div className="flex gap-4 pointer-events-auto">
          <div className="px-6 py-4 glass-card border border-white/40 shadow-xl rounded-3xl flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Active Blocks</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-text-primary">{blockersCount}</span>
              <Network className="text-brand-primary mb-1" size={18} />
            </div>
          </div>
          <div className="px-6 py-4 glass-card border border-white/40 shadow-xl rounded-3xl flex flex-col gap-1 min-w-[160px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Blocked Tasks</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-red-500">{criticalTasks}</span>
              <AlertCircle className="text-red-500 mb-1" size={18} />
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-text-tertiary text-xs font-bold uppercase tracking-widest">
           <Zap size={14} className="text-brand-primary" />
           Live Project Map
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="flex-1 min-h-0 relative">
        {graphData.levels.length > 0 ? (
          <div 
            className="p-20 relative" 
            style={{ 
              width: graphData.levels.length * (BOX_WIDTH + GAP_X) + 200,
              height: Math.max(...graphData.levels.map(l => l.length)) * (BOX_HEIGHT + GAP_Y) + 200
            }}
          >
            {/* Connection Layer (SVG) */}
            <svg 
              className="absolute inset-0 pointer-events-none overflow-visible"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#CBD5E1" />
                </marker>
              </defs>
              
              {graphData.links.map((link, i) => {
                // Find node positions
                let startX, startY, endX, endY;
                graphData.levels.forEach((lv, lIdx) => {
                  lv.forEach((node, nIdx) => {
                    const x = 200 + lIdx * (BOX_WIDTH + GAP_X);
                    const y = 200 + nIdx * (BOX_HEIGHT + GAP_Y);
                    if (node.id === link.from) { startX = x + BOX_WIDTH; startY = y + BOX_HEIGHT / 2; }
                    if (node.id === link.to) { endX = x; endY = y + BOX_HEIGHT / 2; }
                  });
                });

                if (startX === undefined || endX === undefined) return null;

                // Bezier path
                const cp1X = startX + (GAP_X / 2);
                const cp2X = endX - (GAP_X / 2);
                const pathData = `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;

                return (
                  <motion.path
                    key={`link-${i}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: i * 0.05 }}
                    d={pathData}
                    stroke="#E2E8F0"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>

            {/* Node Layer */}
            {graphData.levels.map((level, lIdx) => (
              <div key={`level-${lIdx}`}>
                {level.map((node, nIdx) => {
                  const x = 200 + lIdx * (BOX_WIDTH + GAP_X);
                  const y = 200 + nIdx * (BOX_HEIGHT + GAP_Y);

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 20, delay: lIdx * 0.1 }}
                      className="absolute group"
                      style={{ left: x, top: y, width: BOX_WIDTH, height: BOX_HEIGHT }}
                    >
                      <div 
                        onClick={() => openCardDetails(node.id)}
                        className={`w-full h-full glass-card border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl flex flex-col p-4 overflow-hidden relative
                          ${node.is_completed ? 'border-green-500/30' : 'border-white/60 hover:border-brand-primary/40'}`}
                      >
                        {/* Status Bar */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${node.is_completed ? 'bg-green-500' : 'bg-brand-primary/20 group-hover:bg-brand-primary transition-colors'}`} />
                        
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary truncate max-w-[140px]">
                            {node.list_id ? 'Active Task' : 'Orphan'}
                          </span>
                          {node.is_completed ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <Clock size={12} className="text-text-tertiary" />
                          )}
                        </div>
                        
                        <h4 className="text-xs font-bold text-text-primary leading-tight line-clamp-2 pr-2">
                          {node.title}
                        </h4>
                        
                        <div className="mt-auto flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1">
                             <div className="w-4 h-4 rounded-full bg-bg-secondary flex items-center justify-center text-[8px] font-black">
                               {node.priority?.[0] || 'N'}
                             </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <Maximize2 size={10} className="text-text-tertiary" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 bg-white/50 backdrop-blur-xl rounded-[48px] shadow-2xl flex items-center justify-center border border-white/40">
              <Network size={64} className="text-brand-primary/20" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-text-primary">No Dependencies Visualized</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                Add blocking relationships to your cards to see the project's critical path and network graph.
              </p>
              <button 
                onClick={() => dispatch(setActiveCardId(cards[0]?.id))}
                className="mt-4 px-6 py-3 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Open First Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend / Key */}
      {graphData.levels.length > 0 && (
        <div className="p-8 border-t border-border-light bg-white/30 backdrop-blur-md shrink-0 flex items-center justify-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-primary/20 border border-brand-primary/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Active Chain</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Resolved</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-10 h-[2px] bg-slate-200" />
              <div className="w-1.5 h-1.5 rotate-45 border-r border-t border-slate-300 -ml-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Blocking Relationship</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default DependencyMap;

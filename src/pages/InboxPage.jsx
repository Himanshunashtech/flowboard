import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Inbox, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  Layout, 
  Send,
  CheckCircle2,
  Sparkles,
  MousePointer2,
  Mail,
  Zap,
  MessageSquare,
  Globe,
  Copy,
  Check,
  Power,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchInbox, convertToCard, addInboxItem, deleteInboxItem } from '../store/slices/inboxSlice';
import AppLayout from '../components/layout/AppLayout';

const IntegrationModal = ({ isOpen, onClose, services, captureEmail }) => {
   if (!isOpen) return null;

   return (
     <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-2xl"
        >
           <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h2 className="text-3xl font-black text-text-primary tracking-tighter">Connection Hub</h2>
                   <p className="text-sm font-bold text-text-tertiary">Power up your capture workflow.</p>
                </div>
                <button onClick={onClose} className="p-3 bg-bg-secondary rounded-2xl hover:bg-bg-tertiary transition-all">
                   <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                  <div key={service.name} className="p-6 rounded-[32px] bg-bg-secondary border border-border-light flex items-center justify-between group hover:border-indigo-600 transition-all">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${service.color}`}>
                           {service.icon}
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-xl font-black text-text-primary tracking-tight">{service.name}</h4>
                           <p className="text-xs font-bold text-text-tertiary">{service.description}</p>
                        </div>
                     </div>
                     <button className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${service.connected ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-text-primary text-white hover:bg-indigo-600'}`}>
                        {service.connected ? (
                          <>
                             <ShieldCheck size={14} />
                             <span>Connected</span>
                          </>
                        ) : (
                          <>
                             <span>Connect Now</span>
                             <ChevronRight size={14} />
                          </>
                        )}
                     </button>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-[40px] bg-indigo-50 border border-indigo-100 space-y-4">
                 <div className="flex items-center gap-3 text-indigo-600">
                    <Mail size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Universal Email Capture</span>
                 </div>
                 <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                    Forward any email to your unique address and it will instantly appear in your triage list. 
                    Great for newsletters, meeting notes, and action items.
                 </p>
                 <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-indigo-100 mt-4">
                    <code className="text-xs font-bold text-indigo-600 truncate pe-4">{captureEmail}</code>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        navigator.clipboard.writeText(captureEmail);
                        alert("Capture email copied!");
                      }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                         <Copy size={16} />
                      </button>
                      <button 
                         onClick={services.find(s => s.name === 'Gmail')?.onSimulate || (() => {})} 
                         className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                      >
                         Simulate Inbound
                      </button>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
     </div>
   );
};

const InboxPage = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const { items, loading } = useSelector((state) => state.inbox);
  const { workspaces } = useSelector((state) => state.workspaces);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [captureInput, setCaptureInput] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInbox());
  }, [dispatch]);

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCapture = (e) => {
    e.preventDefault();
    if (!captureInput.trim() || !user) return;

    dispatch(addInboxItem({
      user_id: user.id,
      title: captureInput,
      source: 'MANUAL',
      content: {}
    }));
    setCaptureInput('');
  };

  const handleProcess = () => {
    if (!selectedItem || !selectedBoardId) return;

    const board = workspaces.flatMap(ws => ws.boards || []).find(b => b.id === selectedBoardId);
    if (!board || !board.lists?.[0]) {
       alert("Target board must have at least one list.");
       return;
    }

    dispatch(convertToCard({
      inboxId: selectedItem.id,
      boardId: selectedBoardId,
      listId: board.lists[0].id,
      position: 'a0'
    }));
    setSelectedItem(null);
    setSelectedBoardId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteInboxItem(id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const copyEmail = () => {
    if (profile?.inbound_capture_email) {
      navigator.clipboard.writeText(profile.inbound_capture_email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const simulateEmailByFunction = async () => {
    if (!profile?.inbound_capture_email) return;
    
    // In a real scenario, an inbound parser calls the Edge Function.
    // We can simulate this by calling our Edge Function directly if deployed, 
    // or just inserting directly for local testing.
    
    const sampleSubject = `Mission Objective: ${['Reconnaissance', 'Deep Sea Exploration', 'Lunar Base Maintenance', 'Quantum Encryption Setup'][Math.floor(Math.random() * 4)]}`;
    
    dispatch(addInboxItem({
      user_id: user.id,
      title: sampleSubject,
      source: 'EMAIL',
      content: {
        from: "hello@unitsconverter.in",
        body_text: "Target coordinates confirmed. Proceed with operation at 0600 hours.",
        captured_at: new Date().toISOString()
      }
    }));
    
    setIsModalOpen(false);
  };

  const getSourceIcon = (source) => {
    switch(source) {
      case 'SLACK': return <MessageSquare size={16} />;
      case 'EMAIL': return <Mail size={16} />;
      case 'WEB': return <Globe size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  const getSourceColor = (source) => {
    switch(source) {
      case 'SLACK': return 'bg-[#4A154B]';
      case 'EMAIL': return 'bg-blue-600';
      case 'WEB': return 'bg-emerald-600';
      case 'GMAIL': return 'bg-red-600';
      default: return 'bg-indigo-600';
    }
  };

  const services = [
    { 
      name: 'Slack', 
      description: 'Push messages to FlowBoard using shortcuts.', 
      icon: <MessageSquare size={24} />, 
      color: 'bg-[#4A154B]',
      connected: true
    },
    { 
      name: 'Gmail', 
      description: 'Create tasks directly from your inbox.', 
      icon: <Mail size={24} />, 
      color: 'bg-red-600',
      connected: false,
      onSimulate: simulateEmailByFunction
    },
    { 
      name: 'GitHub', 
      description: 'Sync issues and pull requests.', 
      icon: <Zap size={24} />, 
      color: 'bg-black',
      connected: true
    }
  ];

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-bg-secondary/30">
        <IntegrationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          services={services}
          captureEmail={profile?.inbound_capture_email}
        />

        {/* Header */}
        <header className="px-10 py-8 bg-white border-b border-border-light flex items-center justify-between sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Inbox size={24} />
              </div>
              <h1 className="text-3xl font-black text-text-primary tracking-tight">Personal Inbox</h1>
            </div>
            <p className="text-sm font-medium text-text-tertiary">
              {items.length} untriaged missions waiting for deployment.
            </p>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center bg-bg-secondary rounded-2xl px-4 py-2 gap-3 border border-border-light group cursor-pointer hover:border-indigo-600 transition-all" onClick={copyEmail}>
                <div className="p-1.5 bg-white rounded-lg text-indigo-600 shadow-sm">
                   <Mail size={14} />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Capture Email</p>
                   <p className="text-[11px] font-bold text-text-primary lowercase">{profile?.inbound_capture_email || 'generating...'}</p>
                </div>
                <div className="ms-2">
                   {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-text-tertiary group-hover:text-indigo-600 transition-colors" />}
                </div>
             </div>
             <div className="h-10 w-[1px] bg-border-light" />
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter inbox..."
                  className="bg-bg-secondary border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-600 w-48 transition-all"
                />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main List */}
          <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
            
            {/* Capture Bar */}
            <form onSubmit={handleCapture} className="relative group">
               <div className="absolute inset-y-0 left-6 flex items-center text-indigo-600">
                  <Zap size={20} className="fill-indigo-600" />
               </div>
               <input 
                type="text"
                value={captureInput}
                onChange={(e) => setCaptureInput(e.target.value)}
                placeholder="Capture a thought, email summary, or Slack snippet..."
                className="w-full bg-white border-2 border-transparent focus:border-indigo-600 rounded-[32px] py-6 pl-16 pr-24 text-lg font-bold shadow-xl shadow-indigo-500/5 placeholder:text-text-tertiary transition-all"
               />
               <button 
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-200"
               >
                  <Send size={20} />
               </button>
            </form>

            <div className="space-y-4 pb-20">
              {loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">Accessing mission logs...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full pt-20 gap-6 select-none animate-in fade-in duration-1000">
                  <div className="w-24 h-24 rounded-[48px] bg-white shadow-xl shadow-indigo-500/5 flex items-center justify-center text-indigo-600 ring-1 ring-border-light">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">Inbox Absolute Zero</h3>
                    <p className="font-bold text-sm text-text-tertiary max-w-[300px]">Everything is triaged. Your mental bandwidth is maximized.</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {filteredItems.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: -20 }}
                      onClick={() => setSelectedItem(item)}
                      className={`group p-6 rounded-[32px] bg-white border border-border-light hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex items-center justify-between ${selectedItem?.id === item.id ? 'ring-2 ring-indigo-600 shadow-xl shadow-indigo-600/5' : ''}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5 ${getSourceColor(item.source)}`}>
                           {getSourceIcon(item.source)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-text-primary tracking-tight line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-text-tertiary">
                            <span className="flex items-center gap-1.5 uppercase tracking-widest">
                              <Clock size={12} strokeWidth={3} />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span className="w-1 h-1 bg-border-medium rounded-full" />
                            <span className="uppercase tracking-[0.2em] font-black text-indigo-600">{item.source || 'Manual'} source</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-3 bg-bg-secondary text-text-tertiary hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform duration-500">
                           <ArrowRight size={24} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right Panel (Triage Sidebar) */}
          <aside className="w-[450px] border-l border-border-light bg-white p-10 hidden xl:flex flex-col gap-10">
            {selectedItem ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12 h-full flex flex-col"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Sparkles size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Triage System</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${getSourceColor(selectedItem.source)}`}>
                       {selectedItem.source || 'Manual'}
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-text-primary tracking-tighter leading-tight">
                    {selectedItem.title}
                  </h2>
                </div>

                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                   <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] ps-1">Select Target Board</label>
                   <div className="grid grid-cols-2 gap-4">
                     {workspaces.flatMap(ws => ws.boards || []).map(board => (
                        <button 
                          key={board.id}
                          onClick={() => setSelectedBoardId(board.id)}
                          className={`p-6 rounded-[28px] border-2 text-left transition-all active:scale-95 group/board ${selectedBoardId === board.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-transparent bg-bg-secondary hover:bg-white hover:border-border-medium'}`}
                        >
                           <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center mb-4 transition-colors ${selectedBoardId === board.id ? 'bg-indigo-600 text-white' : 'bg-white text-text-tertiary'}`}>
                              <Layout size={18} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest block truncate">{board.title}</span>
                           <span className="text-[9px] font-bold text-text-tertiary opacity-60">Mission Deployment</span>
                        </button>
                     ))}
                   </div>
                </div>

                <div className="mt-auto space-y-6">
                   <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                         <Zap size={20} className="fill-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">Rapid Deployment</p>
                         <p className="text-[9px] font-bold text-indigo-600 opacity-70">Will be added to the backlog</p>
                      </div>
                   </div>
                   <button 
                    disabled={!selectedBoardId}
                    onClick={handleProcess}
                    className={`w-full py-6 rounded-[32px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${selectedBoardId ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30 hover:-translate-y-1' : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-50'}`}
                   >
                     <span>Deploy to Board</span>
                     <ArrowRight size={18} />
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-8 opacity-40 select-none">
                <div className="w-32 h-32 rounded-[56px] bg-bg-secondary flex items-center justify-center border-4 border-dashed border-border-medium text-text-tertiary">
                   <MousePointer2 size={44} />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-black uppercase tracking-[0.3em] text-text-primary">Ready for Triage</p>
                   <p className="text-[11px] font-bold text-text-tertiary max-w-[240px] leading-relaxed">
                      Select a captured objective to designate its target environment and deploy to a board.
                   </p>
                </div>

                {/* Integration Quicklinks */}
                <div className="mt-20 w-full space-y-4">
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ps-1">Active Integrations</p>
                    <div className="flex items-center gap-2">
                        {services.map(service => (
                            <div 
                              key={service.name} 
                              onClick={() => setIsModalOpen(true)}
                              className={`p-3 rounded-2xl border border-border-light flex-1 flex items-center justify-center transition-all cursor-pointer ${service.connected ? 'bg-indigo-50 text-indigo-600 border-indigo-100 grayscale-0 opacity-100' : 'bg-bg-secondary text-text-tertiary opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
                            >
                                {service.icon}
                            </div>
                        ))}
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-3 rounded-2xl bg-bg-secondary text-[9px] font-black uppercase tracking-widest text-text-tertiary hover:bg-bg-tertiary transition-all"
                    >
                       Manage Connections
                    </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
};

export default InboxPage;

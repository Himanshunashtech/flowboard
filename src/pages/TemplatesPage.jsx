import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Layout, 
  Zap, 
  ClipboardList, 
  Target, 
  Rocket, 
  ShieldCheck, 
  FileText, 
  Bug, 
  Code2, 
  AlertTriangle, 
  GitBranch,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { TEMPLATES } from '../components/modals/TemplateGallery';
import { toggleModal } from '../store/slices/uiSlice';
import TemplatePreviewModal from '../components/modals/TemplatePreviewModal';

const TemplatesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    setSelectedTemplateForPreview(template);
  };

  return (
    <AppLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <header className="space-y-6 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Sparkles size={28} />
            </div>
            <h1 className="text-6xl font-black text-foreground tracking-tighter leading-none">
              Template Gallery
            </h1>
          </div>
          <p className="text-xl font-medium text-muted-foreground max-w-2xl leading-relaxed">
            Jumpstart your productivity with professionally designed blueprints for every workflow, from engineering to creative production.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border p-4 rounded-[32px] shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="flex items-center gap-2 p-1.5 bg-bg-secondary rounded-2xl border border-border-light shadow-inner w-full md:w-auto">
            {['all', 'basic', 'developer'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-text-tertiary hover:bg-white hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search blueprints..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={template.id}
                className="group bg-card rounded-[48px] border border-border shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 overflow-hidden flex flex-col"
              >
                {/* Visual Header */}
                <div className="p-4">
                  <div className="h-56 rounded-[36px] overflow-hidden relative shadow-inner">
                    <img 
                      src={template.coverImage} 
                      alt={template.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Icon Badge */}
                    <div className="absolute top-6 left-6">
                      <div className={`p-4 rounded-2xl ${template.color} shadow-2xl backdrop-blur-md border border-white/20 group-hover:rotate-6 transition-transform duration-500`}>
                        {template.icon ? <template.icon size={24} strokeWidth={2.5} /> : <Layout size={24} />}
                      </div>
                    </div>

                    {/* Meta Badge */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/20">
                        {template.lists.length} Workstreams
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-10 pb-10 pt-4 flex-1 flex flex-col">
                  <h3 className="text-3xl font-black text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-tertiary line-clamp-3 leading-relaxed mb-8 font-medium">
                    {template.description}
                  </p>
                  
                  {/* List Preview Tags */}
                  <div className="flex flex-wrap gap-2 mb-10">
                    {template.lists.slice(0, 3).map((list, i) => (
                      <span key={i} className="px-3 py-1.5 bg-bg-secondary rounded-xl text-[10px] font-black uppercase tracking-tight text-text-secondary border border-border-light shadow-sm">
                        {typeof list === 'string' ? list : list.title}
                      </span>
                    ))}
                    {template.lists.length > 3 && (
                      <span className="px-3 py-1.5 bg-bg-secondary/50 rounded-xl text-[10px] font-black uppercase tracking-tight text-text-tertiary">
                        +{template.lists.length - 3} More
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-4">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-primary text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      <span>Deploy Template</span>
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="py-32 text-center animate-in fade-in zoom-in-95">
            <div className="inline-flex p-8 bg-bg-secondary rounded-[40px] mb-8 text-text-tertiary">
              <Zap size={48} />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">No blueprints found</h3>
            <p className="text-muted-foreground font-medium">Try adjusting your filters or search query to find the perfect starting point.</p>
            <button 
              onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
              className="mt-8 text-xs font-black uppercase tracking-widest text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pro Banner */}
        <section className="bg-foreground text-white rounded-[64px] p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
            <Sparkles size={300} />
          </div>
          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="px-6 py-2 bg-white/10 rounded-full inline-block text-[11px] font-black uppercase tracking-widest border border-white/10">Coming Soon</div>
            <h2 className="text-5xl font-black tracking-tighter leading-none">Custom Workspace Blueprints</h2>
            <p className="text-lg text-white/60 font-medium leading-relaxed">
              Soon you will be able to save your own board structures as private templates for your entire organization to use.
            </p>
            <button className="bg-white text-foreground px-10 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
              Join Early Access
            </button>
          </div>
        </section>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {selectedTemplateForPreview && (
            <TemplatePreviewModal 
              template={selectedTemplateForPreview}
              isOpen={!!selectedTemplateForPreview}
              onClose={() => setSelectedTemplateForPreview(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default TemplatesPage;

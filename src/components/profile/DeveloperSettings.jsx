import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, AlertTriangle, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DeveloperSettings = ({ user }) => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setKeys(data);
    setLoading(false);
  };

  const generateKey = async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    
    // In a real world scenario, this would be an Edge Function to ensure secure hashing
    // For this build, we'll simulate the generation and store the prefix + dummy hash
    const secret = `fb_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const prefix = secret.substring(0, 8);
    
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: newKeyName,
        key_prefix: prefix,
        key_hash: secret, // This is a simplification; normally we'd hash this
        scopes: ['read:cards', 'write:cards']
      })
      .select()
      .single();

    if (!error) {
      setLastGeneratedKey(secret);
      setKeys([data, ...keys]);
      setNewKeyName('');
    }
    setGenerating(false);
  };

  const deleteKey = async (id) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (!error) {
      setKeys(keys.filter(k => k.id !== id));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lastGeneratedKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-text-primary tracking-tight">Developer Ecosystem</h2>
        <p className="text-sm text-text-tertiary">Build custom tools and integrations using the FlowBoard API.</p>
      </div>

      {/* New Key Generator */}
      <div className="bg-bg-secondary/30 rounded-3xl p-6 border border-border-light relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Terminal size={120} />
        </div>
        
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
          <Key size={16} className="text-brand-primary" />
          Create New API Key
        </h3>
        
        <div className="flex gap-3 relative z-10">
          <input 
            type="text"
            placeholder="Key Name (e.g. My Website Tracker)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-white border border-border-light rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
          />
          <button 
            onClick={generateKey}
            disabled={generating || !newKeyName.trim()}
            className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>

        <AnimatePresence>
          {lastGeneratedKey && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-yellow-800">Save this key now! We won't show it again.</p>
                  <div className="mt-3 flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-yellow-200">
                    <code className="flex-1 text-sm font-mono text-yellow-900 break-all">{lastGeneratedKey}</code>
                    <button 
                      onClick={handleCopy}
                      className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => setLastGeneratedKey(null)} className="text-yellow-400 hover:text-yellow-600">
                  <EyeOff size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Existing Keys */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Active API Keys</h3>
        {loading ? (
          <div className="space-y-3">
             {[1,2].map(i => <div key={i} className="h-16 bg-bg-secondary rounded-2xl animate-pulse" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border-light rounded-3xl">
             <Key size={32} className="mx-auto mb-3 text-border-medium" />
             <p className="text-sm text-text-tertiary font-medium">No active API keys found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map(key => (
              <div key={key.id} className="group flex items-center justify-between p-5 bg-white border border-border-light rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-bg-secondary rounded-xl text-text-secondary">
                    <Terminal size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{key.name}</p>
                    <p className="text-[10px] font-mono text-text-tertiary mt-1">Prefix: {key.key_prefix}••••••••••••</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Created</p>
                    <p className="text-xs font-bold text-text-secondary">{new Date(key.created_at).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => deleteKey(key.id)}
                    className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* API Docs Link */}
      <div className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Plus size={20} />
           </div>
           <div>
              <p className="text-sm font-bold text-text-primary">Want to extend FlowBoard?</p>
              <p className="text-xs text-text-tertiary">Check out our developer documentation and SDKs.</p>
           </div>
        </div>
        <button className="text-xs font-black uppercase tracking-widest text-brand-primary hover:underline">
           View Documentation
        </button>
      </div>
    </div>
  );
};

export default DeveloperSettings;

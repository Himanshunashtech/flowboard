import React, { useState } from 'react';
import {
  X, Copy, Check, QrCode, FileJson, FileSpreadsheet,
  Printer, Globe, Lock, Users, Shield, Link as LinkIcon,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

const BoardSharePopover = ({
  board,
  onClose,
  onUpdateVisibility,
  members,
  lists,
  cards
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToCSV = () => {
    const headers = ['List', 'Card Title', 'Description', 'Due Date', 'Status'];
    const rows = cards.map(card => {
      const list = lists.find(l => l.id === card.list_id);
      return [
        list?.title || 'Unknown',
        `"${card.title.replace(/"/g, '""')}"`,
        `"${(card.description_text || '').replace(/"/g, '""')}"`,
        card.due_date || '',
        card.is_completed ? 'Completed' : 'Active'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${board.title.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const exportData = {
      board,
      lists,
      cards,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${board.title.replace(/\s+/g, '_')}_data.json`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-[580px] bg-white rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-border-light overflow-hidden flex flex-col z-100"
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-border-light flex items-center justify-between bg-bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Globe size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest text-foreground">Sharing Protocol</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-xl text-text-tertiary transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-8 space-y-8">
        {/* Horizontal Split: Permissions & Link */}
        <div className="grid grid-cols-5 gap-8">
          {/* Column 1: Permissions (60%) */}
          <div className="col-span-3 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Access Configuration</label>
            <div className="flex gap-2">
              {[
                { id: 'PRIVATE', icon: Lock, title: 'Locked' },
                { id: 'WORKSPACE', icon: Users, title: 'Team' },
                { id: 'PUBLIC', icon: Globe, title: 'Public' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => onUpdateVisibility(type.id)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all
                      ${board.visibility === type.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-bg-secondary bg-bg-secondary/30 text-text-tertiary hover:border-border-light'}`}
                >
                  <type.icon size={20} className={board.visibility === type.id ? 'animate-pulse' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{type.title}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary font-bold px-2 leading-relaxed italic">
              {board.visibility === 'PUBLIC' ? 'Anyone with the link can view this board. Search engines will not index it.' : 'Access restricted to authenticated workspace members only.'}
            </p>
          </div>

          {/* Column 2: Link & QR (40%) */}
          <div className="col-span-2 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Connect</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all border shadow-sm group
                    ${copied ? 'bg-success border-success text-white' : 'bg-white border-border-light hover:border-primary text-foreground'}`}
              >
                <div className="flex items-center gap-3">
                  {copied ? <Check size={16} /> : <LinkIcon size={16} className="text-primary" />}
                  <span className="text-xs font-bold">{copied ? 'Copied' : 'Copy Link'}</span>
                </div>
                <ChevronRight size={14} className="opacity-20 group-hover:opacity-100" />
              </button>

              <button
                onClick={() => setShowQR(!showQR)}
                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all border shadow-sm group
                    ${showQR ? 'bg-primary border-primary text-white' : 'bg-white border-border-light hover:border-primary text-foreground'}`}
              >
                <div className="flex items-center gap-3">
                  <QrCode size={16} className={showQR ? 'text-white' : 'text-primary'} />
                  <span className="text-xs font-bold">Show QR Code</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showQR ? 'bg-white' : 'bg-border-light'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable QR Center */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-bg-secondary rounded-[32px] p-6 flex items-center justify-center gap-8 border border-border-light shadow-inner"
            >
              <div className="p-3 bg-white rounded-2xl shadow-xl ring-4 ring-bg-secondary">
                <QRCodeSVG value={shareUrl} size={120} level="H" includeMargin />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Live Share</h4>
                <p className="text-[10px] font-bold text-text-tertiary max-w-[200px] leading-relaxed">Scan this code to instantly open this command board on any mobile device.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: Exports (Horizontal Bar) */}
        <div className="pt-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1 mb-3 block text-center">Export Protocols</label>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={exportToCSV} className="flex items-center justify-center gap-3 py-4 bg-bg-secondary/50 hover:bg-green-50 rounded-[20px] transition-all border border-border-light group">
              <FileSpreadsheet size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Data Grid</p>
                <p className="text-[8px] font-bold text-green-600 opacity-60">Export CSV</p>
              </div>
            </button>
            <button onClick={exportToJSON} className="flex items-center justify-center gap-3 py-4 bg-bg-secondary/50 hover:bg-blue-50 rounded-[20px] transition-all border border-border-light group">
              <FileJson size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">System JSON</p>
                <p className="text-[8px] font-bold text-blue-600 opacity-60">Backup Data</p>
              </div>
            </button>
            <button onClick={handlePrint} className="flex items-center justify-center gap-3 py-4 bg-bg-secondary/50 hover:bg-gray-50 rounded-[20px] transition-all border border-border-light group">
              <Printer size={18} className="text-gray-600 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Hard Copy</p>
                <p className="text-[8px] font-bold text-text-tertiary opacity-60">Print View</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BoardSharePopover;

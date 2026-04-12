import React from 'react';
import { AlertCircle, RefreshCcw, Home, Terminal } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // In a real world app, you would log to Sentry or a similar service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRestart = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border border-red-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-100">
                <AlertCircle size={40} />
              </div>
              
              <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-4 italic">
                Protocol <span className="text-red-500">Interrupted.</span>
              </h1>
              
              <p className="text-lg text-text-secondary font-medium mb-10 leading-relaxed italic">
                FlowBoard's internal logic engine encountered an unexpected state. 
                We've quarantined the process to protect your data.
              </p>

              <div className="bg-bg-secondary/50 rounded-2xl p-6 mb-10 text-left border border-border-light relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-3">
                   <Terminal size={14} className="text-text-tertiary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Diagnostic Data</span>
                </div>
                <code className="text-xs font-mono text-text-primary break-all">
                   {this.state.error?.toString() || "Unknown logical disconnect."}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button 
                  onClick={this.handleRestart}
                  className="flex items-center gap-2 px-8 py-3.5 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <RefreshCcw size={16} />
                  Initialize Recovery Protocol
                </button>
                <a 
                  href="/"
                  className="flex items-center gap-2 px-8 py-3.5 bg-bg-secondary text-text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-border-light transition-all"
                >
                  <Home size={16} />
                  Return to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

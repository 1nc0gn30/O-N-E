import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, X, Check } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  createdAt: number;
  completedAt?: number;
}

export default function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<Task[]>([]);
  const [inputText, setInputText] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedActive = localStorage.getItem('one_active_task');
    const savedHistory = localStorage.getItem('one_history');
    if (savedActive) setActiveTask(JSON.parse(savedActive));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (activeTask) {
      localStorage.setItem('one_active_task', JSON.stringify(activeTask));
    } else {
      localStorage.removeItem('one_active_task');
    }
    localStorage.setItem('one_history', JSON.stringify(history));
  }, [activeTask, history, isLoaded]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHolding && activeTask) {
      timer = setTimeout(() => {
        handleComplete();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [isHolding, activeTask]);

  const handleCommit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) {
        setActiveTask({
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          text: inputText.trim(),
          createdAt: Date.now(),
        });
        setInputText('');
      }
    }
  };

  const handleComplete = () => {
    if (!activeTask) return;
    setIsCompleting(true);
    
    setTimeout(() => {
      setHistory(prev => [{ ...activeTask, completedAt: Date.now() }, ...prev]);
      setActiveTask(null);
      setIsCompleting(false);
      setIsHolding(false);
    }, 600);
  };

  if (!isLoaded) return null;

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      {/* Background Orb */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: isCompleting ? 3 : isHolding ? 1.5 : activeTask ? 1.2 : 1,
            opacity: isCompleting ? 0 : isHolding ? 0.3 : activeTask ? 0.1 : 0.03,
          }}
          transition={{ duration: isCompleting ? 0.6 : 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <div className="text-xs font-serif italic text-white/30">O N E</div>
        <button 
          onClick={() => setShowHistory(true)}
          className="text-white/30 hover:text-white transition-colors p-2"
          aria-label="View History"
        >
          <History size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {!activeTask ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-6"
            >
              <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-8">What is your focus?</p>
              <textarea
                autoFocus
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleCommit}
                placeholder="Type here..."
                aria-label="What is your focus?"
                className="w-full bg-transparent text-center font-serif text-4xl md:text-6xl lg:text-7xl text-white placeholder:text-white/10 focus:outline-none resize-none overflow-hidden leading-tight"
                rows={1}
                style={{ minHeight: '1.5em' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <motion.p 
                animate={{ opacity: inputText.trim() ? 1 : 0 }}
                className="text-[10px] tracking-widest text-white/20 uppercase mt-12"
              >
                Press Enter to commit
              </motion.p>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isCompleting ? 0 : 1, scale: isCompleting ? 1.05 : 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto px-6"
            >
              <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase mb-12">Current Focus</p>
              
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-center leading-tight tracking-tight text-white mb-24 max-w-full break-words">
                {activeTask.text}
              </h1>

              <div className="flex flex-col items-center gap-8">
                <motion.button
                  onPointerDown={() => setIsHolding(true)}
                  onPointerUp={() => setIsHolding(false)}
                  onPointerLeave={() => setIsHolding(false)}
                  onTouchStart={() => setIsHolding(true)}
                  onTouchEnd={() => setIsHolding(false)}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center group cursor-pointer select-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Hold to complete focus"
                >
                  {/* Background circle */}
                  <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/20 transition-colors" />
                  
                  {/* Progress circle */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="47"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="296"
                      initial={{ strokeDashoffset: 296 }}
                      animate={{ strokeDashoffset: isHolding ? 0 : 296 }}
                      transition={{ duration: isHolding ? 1.5 : 0.4, ease: isHolding ? "linear" : "easeOut" }}
                    />
                  </svg>

                  {/* Inner icon */}
                  <motion.div 
                    animate={{ scale: isHolding ? 0.8 : 1, opacity: isHolding ? 0 : 1 }}
                    className="text-white/40 group-hover:text-white transition-colors"
                  >
                    <Check size={28} strokeWidth={1} />
                  </motion.div>
                </motion.button>
                
                <motion.p 
                  animate={{ opacity: isHolding ? 1 : 0.3 }}
                  className="text-[10px] tracking-[0.2em] uppercase transition-colors"
                >
                  {isHolding ? "Keep holding..." : "Hold to complete"}
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isHolding ? 0 : 1 }}
                transition={{ delay: 2 }}
                onClick={() => setActiveTask(null)}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.2em] text-white/20 hover:text-white/60 uppercase transition-colors"
              >
                Drop Focus
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md glass-panel z-50 flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-white/50">Archive</h2>
                <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white transition-colors" aria-label="Close Archive">
                  <X size={20} strokeWidth={1} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                {history.length === 0 ? (
                  <p className="text-white/20 text-sm italic font-serif text-center mt-12">The archive is empty.</p>
                ) : (
                  <div className="space-y-10">
                    {history.map(task => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={task.id} 
                        className="relative pl-6 border-l border-white/10"
                      >
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-white/30 -left-[3.5px] top-1.5" />
                        <p className="text-[9px] tracking-widest text-white/30 uppercase mb-3">
                          {new Date(task.completedAt || task.createdAt).toLocaleDateString(undefined, { 
                            weekday: 'long',
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="font-serif text-xl text-white/80 leading-snug">
                          {task.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, Check, Plus } from 'lucide-react';
import type { Task, Category } from '../types';
import clsx from 'clsx';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskModal({ task, onClose, onSave, onDelete }: TaskModalProps) {
  if (!task) return null;

  const [editedTask, setEditedTask] = useState<Task>(task);
  const [newNote, setNewNote] = useState('');
  
  const [isFocusing, setIsFocusing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isFocusing && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsFocusing(false);
    }
    return () => clearInterval(timer);
  }, [isFocusing, timeLeft]);

  // Update internal state when task prop changes (e.g., opening a different task)
  useEffect(() => {
    setEditedTask(task);
    setIsFocusing(false);
    setTimeLeft(25 * 60);
  }, [task]);

  const toggleFocus = () => {
    setIsFocusing(!isFocusing);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setEditedTask({
      ...editedTask,
      notes: [...editedTask.notes, { id: Date.now().toString(), text: newNote, completed: false }]
    });
    setNewNote('');
  };

  const toggleNote = (id: string) => {
    setEditedTask({
      ...editedTask,
      notes: editedTask.notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n)
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl bg-bg-card border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] z-10"
        >
          <div className="flex-1 p-6 border-r border-slate-200 bg-bg-base/80">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-main">Chỉnh sửa công việc</h2>
              <button onClick={onClose} className="text-text-muted hover:text-slate-800 md:hidden">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Tiêu đề</label>
                <input 
                  type="text" 
                  value={editedTask.title}
                  onChange={e => setEditedTask({...editedTask, title: e.target.value})}
                  className="w-full bg-bg-card border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors text-slate-800"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-text-muted mb-1 block">Bắt đầu</label>
                  <input 
                    type="time" 
                    value={editedTask.startTime}
                    onChange={e => setEditedTask({...editedTask, startTime: e.target.value})}
                    className="w-full bg-bg-card border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-text-muted mb-1 block">Kết thúc</label>
                  <input 
                    type="time" 
                    value={editedTask.endTime}
                    onChange={e => setEditedTask({...editedTask, endTime: e.target.value})}
                    className="w-full bg-bg-card border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-text-muted mb-1 block">Danh mục</label>
                <div className="flex gap-2">
                  {['Học tập', 'Dự án', 'Cá nhân'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditedTask({...editedTask, category: cat as Category})}
                      className={clsx(
                        "flex-1 py-2 rounded-lg text-sm border transition-all cursor-pointer font-medium",
                        editedTask.category === cat 
                          ? cat === 'Học tập' ? 'bg-purple-500/20 border-purple-500 text-purple-700' 
                            : cat === 'Dự án' ? 'bg-blue-500/20 border-blue-500 text-blue-700'
                            : 'bg-pink-500/20 border-pink-500 text-pink-700'
                          : 'bg-bg-card border-slate-200 text-text-muted hover:border-[#a4a1b5]'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-200 flex justify-between">
                <button 
                  onClick={() => { onDelete(editedTask.id); onClose(); }}
                  className="text-pink-500 hover:text-pink-400 px-4 py-2 cursor-pointer font-medium"
                >
                  Xóa
                </button>
                <div className="space-x-3">
                  <button onClick={onClose} className="px-4 py-2 text-text-muted hover:text-slate-800 cursor-pointer font-medium">
                    Hủy
                  </button>
                  <button 
                    onClick={() => { 
                      if (editedTask.endTime < editedTask.startTime) {
                        alert("Thời gian kết thúc không thể nhỏ hơn thời gian bắt đầu!");
                        return;
                      }
                      onSave(editedTask); 
                      onClose(); 
                    }}
                    className="bg-gradient-to-r from-blue-500 to-[#a855f7] hover:opacity-90 text-slate-800 px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer shadow-lg"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 bg-bg-card flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-text-main">Ghi chú & Tập trung</h2>
              <button onClick={onClose} className="text-text-muted hover:text-slate-800 hidden md:block cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-bg-base rounded-xl p-6 border border-slate-200 mb-6 flex flex-col items-center justify-center relative overflow-hidden group">
              <div className={clsx(
                "absolute inset-0 opacity-20 transition-colors",
                isFocusing ? "bg-purple-500" : "bg-transparent"
              )} />
              <div className="text-5xl font-mono font-bold mb-4 z-10 text-text-main drop-shadow-md">
                {formatTime(timeLeft)}
              </div>
              <div className="flex gap-4 z-10">
                <button 
                  onClick={toggleFocus}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all active:scale-95 cursor-pointer shadow-lg",
                    isFocusing ? "bg-pink-500/20 text-pink-700 border border-pink-500/50" : "bg-purple-500 text-slate-800 hover:bg-purple-500/90"
                  )}
                >
                  {isFocusing ? <><Square className="w-4 h-4 fill-current"/> Dừng</> : <><Play className="w-4 h-4 fill-current"/> Bắt đầu tập trung</>}
                </button>
                <button 
                  onClick={() => { setIsFocusing(false); setTimeLeft(25 * 60); }}
                  className="px-4 py-2 text-text-muted hover:text-slate-800 cursor-pointer font-medium"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[200px]">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
                {editedTask.notes.map(note => (
                  <div key={note.id} className="flex items-center gap-3 group">
                    <button 
                      onClick={() => toggleNote(note.id)}
                      className={clsx(
                        "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer",
                        note.completed ? "bg-blue-500 border-blue-500" : "border-[#a4a1b5] hover:border-[#f8f9fa] bg-bg-base"
                      )}
                    >
                      {note.completed && <Check className="w-3 h-3 text-slate-800" />}
                    </button>
                    <span className={clsx(
                      "text-sm flex-1",
                      note.completed ? "text-text-muted line-through opacity-70" : "text-text-main"
                    )}>
                      {note.text}
                    </span>
                    <button 
                      onClick={() => setEditedTask({
                        ...editedTask,
                        notes: editedTask.notes.filter(n => n.id !== note.id)
                      })}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-pink-500 transition-opacity cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative mt-auto">
                <input 
                  type="text"
                  placeholder="Thêm ghi chú... (Enter để lưu)"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddNote();
                  }}
                  className="w-full bg-bg-base border border-slate-200 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-blue-500 text-slate-800 placeholder-[#a4a1b5]"
                />
                <button 
                  onClick={handleAddNote}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-slate-800 p-1 cursor-pointer bg-blue-500/10 hover:bg-blue-500/30 rounded-md transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

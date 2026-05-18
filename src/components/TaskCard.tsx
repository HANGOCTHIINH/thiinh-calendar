import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle } from 'lucide-react';
import type { Task } from '../types';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

const categoryColors = {
  'Học tập': 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100',
  'Dự án': 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
  'Cá nhân': 'bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100',
};

const indicatorColors = {
  'Học tập': 'bg-purple-500',
  'Dự án': 'bg-blue-500',
  'Cá nhân': 'bg-pink-500',
};

export function TaskCard({ task, onClick, onToggleComplete }: TaskCardProps) {
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      // Fireworks effect
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#a855f7', '#06b6d4', '#ec4899']
      });
    }
    onToggleComplete(e);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={clsx(
        'relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden group',
        categoryColors[task.category],
        task.completed ? 'opacity-40 grayscale' : 'hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
      )}
    >
      {/* Category Indicator Line */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1', indicatorColors[task.category])} />
      
      <div className="flex justify-between items-start ml-2">
        <div className="flex-1">
          <h4 className={clsx(
            "font-medium text-sm mb-1 group-hover:text-slate-800 transition-colors",
            task.completed && "line-through text-gray-400"
          )}>
            {task.title}
          </h4>
          <div className="text-xs opacity-75 font-mono">
            {task.startTime} - {task.endTime}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={handleComplete}
            className="text-gray-400 hover:text-slate-800 transition-colors"
          >
            <CheckCircle className={clsx("w-5 h-5", task.completed && "text-green-400")} />
          </button>
          {task.notes && task.notes.length > 0 && (
            <FileText className="w-4 h-4 opacity-75" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

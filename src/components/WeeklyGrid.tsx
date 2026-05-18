import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TaskCard } from './TaskCard';
import type { Task, DailyData } from '../types';
import { Plus, Sun, Sunrise, Moon } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface WeeklyGridProps {
  tasks: Task[];
  dailyData: DailyData[];
  onTaskClick: (task: Task) => void;
  onAddTask: (date: string) => void;
  onToggleComplete: (taskId: string, e: React.MouseEvent) => void;
  onEnergyChange: (date: string, level: number) => void;
  currentDate: Date;
}

export function WeeklyGrid({ tasks, dailyData, onTaskClick, onAddTask, onToggleComplete, onEnergyChange, currentDate }: WeeklyGridProps) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col lg:grid lg:grid-cols-7 gap-4"
    >
      {days.map((day, index) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const dayData = dailyData.find(d => d.date === dateStr);
        const energy = dayData?.energyLevel || 50;
        const isToday = isSameDay(day, new Date());

        const morningTasks = dayTasks.filter(t => {
          const hour = parseInt(t.startTime.split(':')[0]);
          return hour >= 0 && hour < 12;
        });
        const afternoonTasks = dayTasks.filter(t => {
          const hour = parseInt(t.startTime.split(':')[0]);
          return hour >= 12 && hour < 18;
        });
        const eveningTasks = dayTasks.filter(t => {
          const hour = parseInt(t.startTime.split(':')[0]);
          return hour >= 18;
        });

        return (
          <motion.div 
            key={dateStr} 
            variants={item}
            whileHover={{ y: -5 }}
            className={clsx(
              "bg-bg-card/90 backdrop-blur-xl rounded-3xl border flex flex-col overflow-hidden min-h-[500px] transition-shadow shadow-sm",
              isToday ? "border-purple-500 shadow-[0_10px_30px_rgba(168,85,247,0.2)]" : "border-slate-200 hover:shadow-lg"
            )}
          >
            <div className={clsx(
              "p-4 text-center border-b transition-colors duration-500",
              isToday ? "bg-gradient-to-br from-purple-100 to-pink-50 border-purple-200" : "bg-slate-50 border-slate-200"
            )}>
              <div className="text-xs uppercase font-bold text-text-muted tracking-widest mb-1">
                {format(day, 'EEEE', { locale: vi })}
              </div>
              <div className={clsx(
                "text-3xl font-black tracking-tight",
                isToday ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500" : "text-text-main"
              )}>
                {format(day, 'dd/MM')}
              </div>
              
              <div className="mt-4 group relative cursor-pointer">
                <div className="text-[10px] text-slate-500 font-medium mb-1.5 flex justify-between">
                  <span>Năng lượng</span>
                  <span>{energy}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${energy}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={clsx(
                      "h-full rounded-full transition-colors duration-500",
                      energy > 70 ? "bg-gradient-to-r from-blue-400 to-blue-500" : energy > 30 ? "bg-gradient-to-r from-purple-400 to-purple-500" : "bg-gradient-to-r from-pink-400 to-pink-500"
                    )}
                  />
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={energy}
                  onChange={(e) => onEnergyChange(dateStr, parseInt(e.target.value))}
                  className="w-full absolute top-6 left-0 opacity-0 group-hover:opacity-100 h-2 cursor-pointer z-10 transition-opacity"
                />
              </div>
            </div>

            <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar bg-slate-50/50">
              
              {/* Sáng */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Sunrise className="w-3.5 h-3.5 text-amber-500" /> Sáng
                </div>
                {morningTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onToggleComplete={(e) => onToggleComplete(task.id, e)} />
                ))}
                {morningTasks.length === 0 && <div className="text-xs text-slate-400 italic text-center py-1">Trống</div>}
              </div>

              {/* Chiều */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-t border-slate-200 pt-3">
                  <Sun className="w-3.5 h-3.5 text-orange-500" /> Chiều
                </div>
                {afternoonTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onToggleComplete={(e) => onToggleComplete(task.id, e)} />
                ))}
                {afternoonTasks.length === 0 && <div className="text-xs text-slate-400 italic text-center py-1">Trống</div>}
              </div>

              {/* Tối */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 border-t border-slate-200 pt-3">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Tối
                </div>
                {eveningTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} onToggleComplete={(e) => onToggleComplete(task.id, e)} />
                ))}
                {eveningTasks.length === 0 && <div className="text-xs text-slate-400 italic text-center py-1">Trống</div>}
              </div>

            </div>

            <div className="p-3 border-t border-slate-200 bg-white">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddTask(dateStr)}
                className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm công việc
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

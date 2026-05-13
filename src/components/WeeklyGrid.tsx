
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TaskCard } from './TaskCard';
import type { Task, DailyData } from '../types';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

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

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-7 gap-4">
      {days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const dayData = dailyData.find(d => d.date === dateStr);
        const energy = dayData?.energyLevel || 50;
        const isToday = isSameDay(day, new Date());

        return (
          <div key={dateStr} className={clsx(
            "bg-bg-card/80 backdrop-blur-md rounded-2xl border flex flex-col overflow-hidden min-h-[400px] transition-all",
            isToday ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : "border-slate-200 hover:border-[#3c3266]"
          )}>
            <div className={clsx(
              "p-3 text-center border-b",
              isToday ? "bg-purple-500/20 border-purple-500/50" : "bg-black/20 border-slate-200"
            )}>
              <div className="text-xs uppercase font-semibold text-text-muted mb-1">
                {format(day, 'EEEE', { locale: vi })}
              </div>
              <div className={clsx(
                "text-2xl font-bold",
                isToday ? "text-purple-700" : "text-text-main"
              )}>
                {format(day, 'dd/MM')}
              </div>
              
              <div className="mt-3 group relative cursor-pointer">
                <div className="text-[10px] text-text-muted mb-1">Năng lượng: {energy}%</div>
                <div className="h-1.5 w-full bg-bg-card-hover rounded-full overflow-hidden relative">
                  <div 
                    className={clsx(
                      "h-full transition-all",
                      energy > 70 ? "bg-blue-500" : energy > 30 ? "bg-purple-500" : "bg-pink-500"
                    )}
                    style={{ width: `${energy}%` }}
                  />
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={energy}
                  onChange={(e) => onEnergyChange(dateStr, parseInt(e.target.value))}
                  className="w-full absolute top-5 left-0 opacity-0 group-hover:opacity-100 h-2 cursor-pointer z-10"
                />
              </div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
              {dayTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                  onToggleComplete={(e) => onToggleComplete(task.id, e)}
                />
              ))}
            </div>

            <div className="p-2 border-t border-slate-200 bg-bg-base/50">
              <button 
                onClick={() => onAddTask(dateStr)}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-slate-800 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

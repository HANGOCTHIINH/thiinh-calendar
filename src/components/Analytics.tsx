import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Task, DailyData, Mood } from '../types';
import { Smile, Meh, Frown, Heart, ThumbsDown } from 'lucide-react';
import clsx from 'clsx';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AnalyticsProps {
  tasks: Task[];
  dailyData: DailyData[];
  onMoodChange: (date: string, mood: Mood) => void;
}

const COLORS = {
  'Học tập': '#a855f7',
  'Dự án': '#06b6d4',
  'Cá nhân': '#ec4899'
};

const moods: { type: Mood; icon: React.ReactNode; color: string }[] = [
  { type: 'Tuyệt vời', icon: <Heart className="w-8 h-8" />, color: 'text-pink-500' },
  { type: 'Tốt', icon: <Smile className="w-8 h-8" />, color: 'text-green-500' },
  { type: 'Bình thường', icon: <Meh className="w-8 h-8" />, color: 'text-yellow-500' },
  { type: 'Tệ', icon: <Frown className="w-8 h-8" />, color: 'text-orange-500' },
  { type: 'Rất tệ', icon: <ThumbsDown className="w-8 h-8" />, color: 'text-red-500' }
];

export function Analytics({ tasks, dailyData, onMoodChange }: AnalyticsProps) {
  const stats = tasks.reduce((acc, task) => {
    const [startH, startM] = task.startTime.split(':').map(Number);
    const [endH, endM] = task.endTime.split(':').map(Number);
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration = 0; // Prevent negative
    if (duration > 0) {
      acc[task.category] = (acc[task.category] || 0) + duration;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(stats).map(([name, value]) => ({
    name,
    value: Math.round(value / 60 * 10) / 10
  }));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayData = dailyData.find(d => d.date === todayStr);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dataObj = dailyData.find(x => x.date === dateStr);
    return {
      date: d,
      dateStr,
      mood: dataObj?.mood,
      dayName: format(d, 'EEEE', { locale: vi })
    };
  });

  return (
    <div className="flex flex-col gap-8 mt-12 bg-bg-card/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center">
        <h3 className="text-xl font-semibold mb-6 text-center text-text-main">Cảm xúc hôm nay</h3>
        <div className="flex justify-center gap-4">
          {moods.map((m) => (
            <button
              key={m.type}
              onClick={() => onMoodChange(todayStr, m.type)}
              className={clsx(
                "p-4 rounded-full transition-all hover:scale-110 cursor-pointer",
                todayData?.mood === m.type ? "bg-slate-100 ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "hover:bg-slate-50 opacity-50 hover:opacity-100",
                m.color
              )}
              title={m.type}
            >
              {m.icon}
            </button>
          ))}
        </div>
        {todayData?.mood && (
          <p className="text-center mt-4 text-gray-400">
            Bạn đang cảm thấy: <strong className="text-slate-800 ml-1">{todayData.mood}</strong>
          </p>
        )}
      </div>

      <div className="flex-1 h-[250px] flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-center text-gray-200">Phân bổ thời gian (Giờ)</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chưa có dữ liệu thời gian để thống kê
          </div>
        )}
      </div>
      </div>

      {/* Weekly Mood Analysis */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-xl font-semibold mb-6 text-center text-text-main">Phân tích cảm xúc 7 ngày qua</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {last7Days.map(day => {
            const moodInfo = moods.find(m => m.type === day.mood);
            return (
              <div key={day.dateStr} className="bg-slate-50 rounded-xl p-4 flex flex-col items-center gap-2 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium capitalize">{day.dayName}</span>
                <span className="text-sm font-bold text-slate-700">{format(day.date, 'dd/MM')}</span>
                <div className="h-12 flex items-center justify-center">
                  {moodInfo ? (
                    <div className={clsx("transition-transform hover:scale-110 cursor-help", moodInfo.color)} title={moodInfo.type}>
                      {moodInfo.icon}
                    </div>
                  ) : (
                    <div className="text-slate-300" title="Chưa ghi nhận">
                      <Meh className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

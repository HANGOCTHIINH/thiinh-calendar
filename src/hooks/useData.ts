import { useState, useEffect, useMemo } from 'react';
import type { Task, DailyData, SpecialDay, TimesheetRecord } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const VIETNAM_HOLIDAYS: SpecialDay[] = [
  { id: 'vnh-1', name: 'Tết Dương Lịch', date: '01-01', type: 'holiday' },
  { id: 'vnh-2', name: 'Ngày Quốc tế Phụ nữ', date: '03-08', type: 'holiday' },
  { id: 'vnh-3', name: 'Giải phóng miền Nam', date: '04-30', type: 'holiday' },
  { id: 'vnh-4', name: 'Quốc tế Lao động', date: '05-01', type: 'holiday' },
  { id: 'vnh-5', name: 'Quốc khánh', date: '09-02', type: 'holiday' },
  { id: 'vnh-6', name: 'Phụ nữ Việt Nam', date: '10-20', type: 'holiday' },
  { id: 'vnh-7', name: 'Nhà giáo Việt Nam', date: '11-20', type: 'holiday' },
  { id: 'vnh-8', name: 'Quân đội Nhân dân', date: '12-22', type: 'holiday' }
];

export function useData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [userSpecialDays, setUserSpecialDays] = useState<SpecialDay[]>([]);
  const [timesheetRecords, setTimesheetRecords] = useState<TimesheetRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedSD = localStorage.getItem('thiinh-special-days');
      if (savedSD) setUserSpecialDays(JSON.parse(savedSD));

      const savedTS = localStorage.getItem('thiinh-timesheet');
      if (savedTS) setTimesheetRecords(JSON.parse(savedTS));

      if (user) {
        const [
          { data: tData },
          { data: dData },
          { data: sData },
          { data: tsData }
        ] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', user.id),
          supabase.from('daily_data').select('*').eq('user_id', user.id),
          supabase.from('special_days').select('*').eq('user_id', user.id),
          supabase.from('timesheet_records').select('*').eq('user_id', user.id)
        ]);
        
        if (tData) setTasks(tData);
        if (dData) setDailyData(dData);
        if (sData) setUserSpecialDays(sData);
        if (tsData) setTimesheetRecords(tsData);
      } else {
        const savedT = localStorage.getItem('thiinh-tasks');
        const savedD = localStorage.getItem('thiinh-daily-data');
        if (savedT) setTasks(JSON.parse(savedT));
        if (savedD) setDailyData(JSON.parse(savedD));
      }
      setIsLoaded(true);
    };
    loadData();
  }, [user]);

  const updateTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('thiinh-tasks', JSON.stringify(newTasks));
    if (user) {
      if (newTasks.length > 0) {
        await supabase.from('tasks').upsert(newTasks.map(t => ({ ...t, user_id: user.id })));
        await supabase.from('tasks').delete().eq('user_id', user.id).not('id', 'in', `(${newTasks.map(t => t.id).join(',')})`);
      } else {
        await supabase.from('tasks').delete().eq('user_id', user.id);
      }
    }
  };

  const updateDailyData = async (newData: DailyData[]) => {
    setDailyData(newData);
    localStorage.setItem('thiinh-daily-data', JSON.stringify(newData));
    if (user) {
      if (newData.length > 0) {
        await supabase.from('daily_data').upsert(newData.map(d => ({ ...d, user_id: user.id })));
        await supabase.from('daily_data').delete().eq('user_id', user.id).not('date', 'in', `(${newData.map(d => d.date).join(',')})`);
      } else {
        await supabase.from('daily_data').delete().eq('user_id', user.id);
      }
    }
  };

  const updateSpecialDays = async (newSpecialDays: SpecialDay[]) => {
    setUserSpecialDays(newSpecialDays);
    localStorage.setItem('thiinh-special-days', JSON.stringify(newSpecialDays));
    if (user) {
      if (newSpecialDays.length > 0) {
        await supabase.from('special_days').upsert(newSpecialDays.map(sd => ({ ...sd, user_id: user.id })));
        await supabase.from('special_days').delete().eq('user_id', user.id).not('id', 'in', `(${newSpecialDays.map(sd => sd.id).join(',')})`);
      } else {
        await supabase.from('special_days').delete().eq('user_id', user.id);
      }
    }
  };

  const updateTimesheetRecords = async (newRecords: TimesheetRecord[]) => {
    setTimesheetRecords(newRecords);
    localStorage.setItem('thiinh-timesheet', JSON.stringify(newRecords));
    if (user) {
      if (newRecords.length > 0) {
        await supabase.from('timesheet_records').upsert(newRecords.map(r => ({ ...r, user_id: user.id })));
        await supabase.from('timesheet_records').delete().eq('user_id', user.id).not('id', 'in', `(${newRecords.map(r => r.id).join(',')})`);
      } else {
        await supabase.from('timesheet_records').delete().eq('user_id', user.id);
      }
    }
  };

  const allSpecialDays = useMemo(() => {
    return [...VIETNAM_HOLIDAYS, ...userSpecialDays];
  }, [userSpecialDays]);

  return { 
    tasks, setTasks: updateTasks, 
    dailyData, setDailyData: updateDailyData, 
    specialDays: allSpecialDays, userSpecialDays, setSpecialDays: updateSpecialDays,
    timesheetRecords, setTimesheetRecords: updateTimesheetRecords,
    isLoaded 
  };
}

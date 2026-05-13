import { useState, useEffect } from 'react';
import type { Task, DailyData } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useData() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const { data: tData } = await supabase.from('tasks').select('*').eq('user_id', user.id);
        const { data: dData } = await supabase.from('daily_data').select('*').eq('user_id', user.id);
        if (tData) setTasks(tData);
        if (dData) setDailyData(dData);
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
    if (user) {
      // Sync logic for supabase can be complex for full sync, but for simplicity:
      // We assume operations add/update/delete are handled specifically.
      // Since this is a simple hook, we can just replace everything (inefficient but works for small datasets),
      // OR we just use localStorage locally and don't overwrite Supabase completely here.
      // To properly sync, we should expose add/update/delete methods.
    }
    localStorage.setItem('thiinh-tasks', JSON.stringify(newTasks));
  };

  const updateDailyData = async (newData: DailyData[]) => {
    setDailyData(newData);
    localStorage.setItem('thiinh-daily-data', JSON.stringify(newData));
  };

  return { tasks, setTasks: updateTasks, dailyData, setDailyData: updateDailyData, isLoaded };
}

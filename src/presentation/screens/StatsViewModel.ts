import { useState, useEffect } from 'react';
import { container } from '../../di/container';
import { DailyStats, TotalStats } from '../../domain/types';
import { auth } from '../../config/firebase';

export interface StatsState {
  weeklyStats: DailyStats[];
  totalStats: TotalStats;
  loading: boolean;
}

export function useStatsViewModel() {
  const [state, setState] = useState<StatsState>({
    weeklyStats: [],
    totalStats: { totalPomodoros: 0, totalTasks: 0, totalMinutes: 0, streak: 0 },
    loading: true,
  });

  const loadStats = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setState(prev => ({ ...prev, loading: true }));

    const [weekly, total] = await Promise.all([
      container.getStatsUseCase.getWeeklyStats(userId),
      container.getStatsUseCase.getTotalStats(userId),
    ]);

    setState({
      weeklyStats: weekly,
      totalStats: total,
      loading: false,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    state,
    refreshStats: loadStats,
  };
}

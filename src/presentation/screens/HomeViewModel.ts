import { useState, useEffect, useCallback, useMemo } from 'react';
import { container } from '../../di/container';
import { Task, TimerSettings, DailyPriorities } from '../../domain/types';
import { auth } from '../../config/firebase';

export type CelebrationType = 'step' | 'task' | null;

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export interface HomeState {
  tasks: Task[];
  currentTaskIndex: number;
  loading: boolean;
  timerSettings: TimerSettings;
  showAddModal: boolean;
  showEditModal: boolean;
  showHistory: boolean;
  showSettingsModal: boolean;
  showStatsModal: boolean;
  showPrivacyModal: boolean;
  showDeleteAccountModal: boolean;
  showReportAIModal: boolean;
  showBrainDump: boolean;
  showShutdownRitual: boolean;
  showMoodTracker: boolean;
  taskToEdit: Task | null;
  dailyPriorities: DailyPriorities | null;
}

export function useHomeViewModel() {
  const [state, setState] = useState<HomeState>({
    tasks: [],
    currentTaskIndex: 0,
    loading: true,
    timerSettings: { workMinutes: 25, breakMinutes: 5 },
    showAddModal: false,
    showEditModal: false,
    showHistory: false,
    showSettingsModal: false,
    showStatsModal: false,
    showPrivacyModal: false,
    showDeleteAccountModal: false,
    showReportAIModal: false,
    showBrainDump: false,
    showShutdownRitual: false,
    showMoodTracker: false,
    taskToEdit: null,
    dailyPriorities: null,
  });

  // Ordenar tareas: prioridades primero, luego el resto
  const activeTasks = useMemo(() => {
    const incomplete = state.tasks.filter(task => !task.completed);
    
    if (!state.dailyPriorities) return incomplete;
    
    const { taskIds } = state.dailyPriorities;
    const prioritized: Task[] = [];
    const rest: Task[] = [];
    
    // Primero las tareas con prioridad (en orden de prioridad)
    for (const taskId of taskIds) {
      if (taskId) {
        const task = incomplete.find(t => t.id === taskId);
        if (task) {
          prioritized.push(task);
        }
      }
    }
    
    // Luego el resto
    for (const task of incomplete) {
      if (!taskIds.includes(task.id!)) {
        rest.push(task);
      }
    }
    
    return [...prioritized, ...rest];
  }, [state.tasks, state.dailyPriorities]);

  const completedTasks = state.tasks.filter(task => task.completed);
  const currentTask = activeTasks.length > 0 ? activeTasks[state.currentTaskIndex] || null : null;

  useEffect(() => {
    loadSettings();
    loadDailyPriorities();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = container.getTasksUseCase.subscribe(userId, (updatedTasks) => {
      setState(prev => ({ ...prev, tasks: updatedTasks, loading: false }));
    });

    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const settings = await container.getTimerSettingsUseCase.execute(userId);
    setState(prev => ({ ...prev, timerSettings: settings }));
  };

  const loadDailyPriorities = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const priorities = await container.getDailyPrioritiesUseCase.execute(userId, getTodayKey());
    setState(prev => ({ ...prev, dailyPriorities: priorities }));
  };

  const setCurrentTaskIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentTaskIndex: index }));
  }, []);

  const setShowAddModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showAddModal: show }));
  }, []);

  const setShowEditModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showEditModal: show }));
  }, []);

  const setShowHistory = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showHistory: show }));
  }, []);

  const setShowSettingsModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showSettingsModal: show }));
  }, []);

  const setShowStatsModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showStatsModal: show }));
  }, []);

  const setShowPrivacyModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPrivacyModal: show }));
  }, []);

  const setShowDeleteAccountModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showDeleteAccountModal: show }));
  }, []);

  const setShowReportAIModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showReportAIModal: show }));
  }, []);

  const setShowBrainDump = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showBrainDump: show }));
  }, []);

  const setShowShutdownRitual = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showShutdownRitual: show }));
  }, []);

  const setShowMoodTracker = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showMoodTracker: show }));
  }, []);

  const setTaskToEdit = useCallback((task: Task | null) => {
    setState(prev => ({ ...prev, taskToEdit: task }));
  }, []);

  const handleAddTask = async (taskTitle: string, steps: { title: string; description: string }[]) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await container.createTaskUseCase.execute(userId, {
      title: taskTitle,
      steps,
      order: state.tasks.length,
    });
  };

  const handleCompleteStep = async (): Promise<CelebrationType> => {
    if (!currentTask) return null;

    const result = await container.completeStepUseCase.execute(
      currentTask.id!,
      currentTask.currentStepIndex,
      currentTask.steps.length
    );

    if (result.allCompleted) {
      await container.incrementTaskCompletedUseCase.execute(auth.currentUser?.uid || '');
      return 'task';
    }

    return 'step';
  };

  const handleDeleteTask = async (taskId: string) => {
    await container.deleteTaskUseCase.execute(taskId);
    
    const newActiveTasks = state.tasks.filter(task => !task.completed && task.id !== taskId);
    if (state.currentTaskIndex >= newActiveTasks.length) {
      setCurrentTaskIndex(Math.max(0, newActiveTasks.length - 1));
    }
  };

  const handleSettingsSave = async (newSettings: TimerSettings) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    await container.saveTimerSettingsUseCase.execute(userId, newSettings);
    setState(prev => ({ ...prev, timerSettings: newSettings }));
  };

  const handleStartTask = async (taskId: string) => {
    await container.startTaskUseCase.execute(taskId);
  };

  const handleLogout = async () => {
    await container.logoutUseCase.execute();
  };

  const refreshDailyPriorities = useCallback(async () => {
    await loadDailyPriorities();
  }, []);

  return {
    state,
    activeTasks,
    completedTasks,
    currentTask,
    setCurrentTaskIndex,
    setShowAddModal,
    setShowEditModal,
    setShowHistory,
    setShowSettingsModal,
    setShowStatsModal,
    setShowPrivacyModal,
    setShowDeleteAccountModal,
    setShowReportAIModal,
    setShowBrainDump,
    setShowShutdownRitual,
    setShowMoodTracker,
    setTaskToEdit,
    handleAddTask,
    handleStartTask,
    handleCompleteStep,
    handleDeleteTask,
    handleSettingsSave,
    handleLogout,
    refreshDailyPriorities,
  };
}

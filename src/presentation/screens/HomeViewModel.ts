import { useState, useEffect, useCallback } from 'react';
import { container } from '../../di/container';
import { Task, TimerSettings } from '../../domain/types';
import { auth } from '../../config/firebase';

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
  taskToEdit: Task | null;
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
    taskToEdit: null,
  });

  const activeTasks = state.tasks.filter(task => !task.completed);
  const completedTasks = state.tasks.filter(task => task.completed);
  const currentTask = activeTasks.length > 0 ? activeTasks[state.currentTaskIndex] || null : null;

  useEffect(() => {
    loadSettings();
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

  const handleCompleteStep = async () => {
    if (!currentTask) return;

    const result = await container.completeStepUseCase.execute(
      currentTask.id!,
      currentTask.currentStepIndex,
      currentTask.steps.length
    );

    if (result.allCompleted) {
      await container.incrementTaskCompletedUseCase.execute(auth.currentUser?.uid || '');
    }

    return result;
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

  const handleLogout = async () => {
    await container.logoutUseCase.execute();
  };

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
    setTaskToEdit,
    handleAddTask,
    handleCompleteStep,
    handleDeleteTask,
    handleSettingsSave,
    handleLogout,
  };
}

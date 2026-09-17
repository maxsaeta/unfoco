import { useState, useEffect, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import { scheduleTimerNotification, cancelAllNotifications } from '../services/notificationService';

export type TimerMode = 'work' | 'break';

interface UseTimerProps {
  workMinutes?: number;
  breakMinutes?: number;
  onWorkComplete?: () => void;
  onBreakComplete?: () => void;
}

export function useTimer({ 
  workMinutes = 25, 
  breakMinutes = 5,
  onWorkComplete,
  onBreakComplete,
}: UseTimerProps = {}) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [minutes, setMinutes] = useState(workMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef<string | null>(null);

  const workCompleteRef = useRef(onWorkComplete);
  const breakCompleteRef = useRef(onBreakComplete);

  useEffect(() => {
    workCompleteRef.current = onWorkComplete;
    breakCompleteRef.current = onBreakComplete;
  }, [onWorkComplete, onBreakComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setMinutes(prevMin => {
              if (prevMin === 0) {
                setIsRunning(false);
                clearInterval(intervalRef.current!);

                if (mode === 'work') {
                  const pattern = Platform.OS === 'ios' ? [0, 500, 200, 500] : [0, 500, 200, 500];
                  Vibration.vibrate(pattern);
                  workCompleteRef.current?.();
                  setMode('break');
                  setMinutes(breakMinutes);
                } else {
                  const pattern = Platform.OS === 'ios' ? [0, 300, 100, 300, 100, 300] : [0, 300, 100, 300, 100, 300];
                  Vibration.vibrate(pattern);
                  breakCompleteRef.current?.();
                  setMode('work');
                  setMinutes(workMinutes);
                }

                return mode === 'work' ? breakMinutes : workMinutes;
              }
              return prevMin - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, workMinutes, breakMinutes]);

  const start = useCallback(async () => {
    setIsRunning(true);
    // Schedule notification for when timer completes
    const totalSeconds = mode === 'work' 
      ? (minutes * 60 + seconds)
      : (minutes * 60 + seconds);
    
    if (totalSeconds > 0) {
      try {
        await cancelAllNotifications();
        const title = mode === 'work' ? '🍅 Pomodoro completado' : '☕ Descanso terminado';
        const body = mode === 'work' 
          ? '¡Hora de descansar! Tómate un respiro.' 
          : '¡Listo para otro Pomodoro?';
        notificationIdRef.current = await scheduleTimerNotification(totalSeconds, title, body);
      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    }
  }, [mode, minutes, seconds]);

  const pause = useCallback(async () => {
    setIsRunning(false);
    if (notificationIdRef.current) {
      await cancelAllNotifications();
      notificationIdRef.current = null;
    }
  }, []);

  const reset = useCallback(async () => {
    setIsRunning(false);
    setMode('work');
    setMinutes(workMinutes);
    setSeconds(0);
    if (notificationIdRef.current) {
      await cancelAllNotifications();
      notificationIdRef.current = null;
    }
  }, [workMinutes]);

  const skipBreak = useCallback(async () => {
    if (mode === 'break') {
      setIsRunning(false);
      setMode('work');
      setMinutes(workMinutes);
      setSeconds(0);
      if (notificationIdRef.current) {
        await cancelAllNotifications();
        notificationIdRef.current = null;
      }
    }
  }, [mode, workMinutes]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  return {
    mode,
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    reset,
    toggle,
    skipBreak,
  };
}
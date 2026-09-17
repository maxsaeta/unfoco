import { useState, useEffect, useRef, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';

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

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);

  const reset = useCallback(() => {
    setIsRunning(false);
    setMode('work');
    setMinutes(workMinutes);
    setSeconds(0);
  }, [workMinutes]);

  const skipBreak = useCallback(() => {
    if (mode === 'break') {
      setIsRunning(false);
      setMode('work');
      setMinutes(workMinutes);
      setSeconds(0);
    }
  }, [mode, workMinutes]);

  const toggle = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

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
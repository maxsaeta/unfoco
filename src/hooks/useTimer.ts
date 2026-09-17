import { useState, useEffect, useRef } from 'react';
import { Vibration, Platform } from 'react-native';

interface UseTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  onComplete?: () => void;
}

export function useTimer({ 
  initialMinutes = 25, 
  initialSeconds = 0,
  onComplete 
}: UseTimerProps = {}) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completado
            setIsRunning(false);
            // Vibrar para notificar
            const pattern = Platform.OS === 'ios' ? [0, 500, 200, 500] : [0, 500, 200, 500];
            Vibration.vibrate(pattern);
            onComplete?.();
            clearInterval(intervalRef.current!);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds, onComplete]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  const toggle = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  return {
    minutes,
    seconds,
    isRunning,
    start,
    pause,
    reset,
    toggle,
  };
}
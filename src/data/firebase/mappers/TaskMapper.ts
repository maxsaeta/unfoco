import { Timestamp } from 'firebase/firestore';
import { Task, TaskStep } from '../../../domain/types';

export interface FirebaseTaskData {
  userId: string;
  title: string;
  steps: FirebaseTaskStep[];
  currentStepIndex: number;
  completed: boolean;
  order: number;
  createdAt: Timestamp;
  startedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  step?: string; // Legacy format
}

export interface FirebaseTaskStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const TaskMapper = {
  toDomain(id: string, data: FirebaseTaskData): Task {
    // Handle legacy format (single step)
    if (!data.steps && data.step) {
      return {
        id,
        userId: data.userId,
        title: data.title,
        steps: [{
          id: generateStepId(),
          title: data.step,
          description: '',
          completed: data.completed || false,
        }],
        currentStepIndex: data.completed ? 1 : 0,
        completed: data.completed || false,
        order: data.order,
        createdAt: data.createdAt?.toDate() || new Date(),
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
      };
    }

    return {
      id,
      userId: data.userId,
      title: data.title,
      steps: data.steps || [],
      currentStepIndex: data.currentStepIndex,
      completed: data.completed,
      order: data.order,
      createdAt: data.createdAt?.toDate() || new Date(),
      startedAt: data.startedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
    };
  },

  toFirebase(task: Omit<Task, 'id' | 'createdAt'>): Omit<FirebaseTaskData, 'createdAt'> {
    return {
      userId: task.userId,
      title: task.title,
      steps: task.steps,
      currentStepIndex: task.currentStepIndex,
      completed: task.completed,
      order: task.order,
      completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
    };
  },

  stepsToFirebase(steps: TaskStep[]): FirebaseTaskStep[] {
    return steps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      completed: step.completed,
    }));
  },
};

function generateStepId(): string {
  return Math.random().toString(36).substring(2, 15);
}

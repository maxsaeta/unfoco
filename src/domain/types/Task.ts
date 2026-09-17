export interface TaskStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id?: string;
  userId: string;
  title: string;
  steps: TaskStep[];
  currentStepIndex: number;
  completed: boolean;
  order: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateTaskDTO {
  title: string;
  steps: Omit<TaskStep, 'id' | 'completed'>[];
  order: number;
}

export interface UpdateTaskDTO {
  title?: string;
  steps?: TaskStep[];
}

export interface CompleteStepResult {
  steps: TaskStep[];
  currentStepIndex: number;
  allCompleted: boolean;
}

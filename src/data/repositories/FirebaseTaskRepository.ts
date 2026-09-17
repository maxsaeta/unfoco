import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Unsubscribe,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ITaskRepository } from '../../domain/repositories';
import { Task, CreateTaskDTO, UpdateTaskDTO, CompleteStepResult } from '../../domain/types';
import { TaskMapper, FirebaseTaskData } from '../firebase/mappers/TaskMapper';

const COLLECTION_NAME = 'tasks';

export class FirebaseTaskRepository implements ITaskRepository {
  async create(userId: string, data: CreateTaskDTO): Promise<string> {
    const steps = data.steps.map((step, index) => ({
      id: Math.random().toString(36).substring(2, 15),
      title: step.title,
      description: step.description,
      completed: false,
    }));

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      title: data.title,
      steps,
      currentStepIndex: 0,
      completed: false,
      order: data.order,
      createdAt: Timestamp.now(),
    });

    return docRef.id;
  }

  async getByUserId(userId: string): Promise<Task[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data() as FirebaseTaskData;
      return TaskMapper.toDomain(doc.id, data);
    });

    return tasks.sort((a, b) => a.order - b.order);
  }

  subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );

    const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirebaseTaskData;
        return TaskMapper.toDomain(doc.id, data);
      });

      const sortedTasks = tasks.sort((a, b) => a.order - b.order);
      callback(sortedTasks);
    }, (error) => {
      console.error('Error in tasks subscription:', error);
    });

    return unsubscribe;
  }

  async update(taskId: string, data: UpdateTaskDTO): Promise<void> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const updateData: Record<string, unknown> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.steps !== undefined) updateData.steps = TaskMapper.stepsToFirebase(data.steps);

    await updateDoc(taskRef, updateData);
  }

  async completeStep(
    taskId: string,
    currentStepIndex: number,
    totalSteps: number
  ): Promise<CompleteStepResult> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    
    // We need to get current task to update steps
    const taskDoc = await getDocs(query(
      collection(db, COLLECTION_NAME),
      where('__name__', '==', taskId)
    ));
    
    if (taskDoc.empty) {
      throw new Error('Task not found');
    }

    const taskData = taskDoc.docs[0].data() as FirebaseTaskData;
    const steps = taskData.steps ? [...taskData.steps] : [];
    
    if (steps[currentStepIndex]) {
      steps[currentStepIndex] = { ...steps[currentStepIndex], completed: true };
    }

    const nextIndex = currentStepIndex + 1;
    const allCompleted = nextIndex >= totalSteps;

    await updateDoc(taskRef, {
      steps,
      currentStepIndex: nextIndex,
      completed: allCompleted,
      completedAt: allCompleted ? Timestamp.now() : null,
    });

    return { steps, currentStepIndex: nextIndex, allCompleted };
  }

  async goToPreviousStep(taskId: string, currentStepIndex: number): Promise<number> {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const previousIndex = Math.max(0, currentStepIndex - 1);

    await updateDoc(taskRef, {
      currentStepIndex: previousIndex,
      completed: false,
      completedAt: null,
    });

    return previousIndex;
  }

  async delete(taskId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, taskId));
  }
}

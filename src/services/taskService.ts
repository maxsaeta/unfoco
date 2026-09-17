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
import { db } from '../config/firebase';

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Task {
  id?: string;
  userId: string;
  title: string;
  steps: TaskStep[];
  currentStepIndex: number;
  completed: boolean;
  order: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

const COLLECTION_NAME = 'tasks';

// Generar ID único para pasos
function generateStepId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Crear tarea
export async function createTask(task: Omit<Task, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...task,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Obtener tareas del usuario (una sola vez)
export async function getUserTasks(userId: string) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Compatibilidad con formato antiguo (solo un paso)
      if (!data.steps && data.step) {
        return {
          id: doc.id,
          ...data,
          steps: [{
            id: generateStepId(),
            title: data.step,
            description: '',
            completed: data.completed || false
          }],
          currentStepIndex: data.completed ? 1 : 0,
          completed: data.completed || false
        } as Task;
      }
      
      return {
        id: doc.id,
        ...data
      } as Task;
    });
    
    // Ordenar por order en JavaScript
    return tasks.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

// Suscribirse a tareas en tiempo real
export function subscribeToUserTasks(
  userId: string, 
  callback: (tasks: Task[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Compatibilidad con formato antiguo (solo un paso)
      if (!data.steps && data.step) {
        return {
          id: doc.id,
          ...data,
          steps: [{
            id: generateStepId(),
            title: data.step,
            description: '',
            completed: data.completed || false
          }],
          currentStepIndex: data.completed ? 1 : 0,
          completed: data.completed || false
        } as Task;
      }
      
      return {
        id: doc.id,
        ...data
      } as Task;
    });
    
    // Ordenar por order en JavaScript
    const sortedTasks = tasks.sort((a, b) => a.order - b.order);
    callback(sortedTasks);
  }, (error) => {
    console.error('Error in tasks subscription:', error);
  });
}

// Completar paso actual y pasar al siguiente
export async function completeCurrentStep(taskId: string, task: Task) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const steps = [...task.steps];
    const currentIndex = task.currentStepIndex;
    
    // Marcar paso actual como completado
    if (steps[currentIndex]) {
      steps[currentIndex] = { ...steps[currentIndex], completed: true };
    }
    
    const nextIndex = currentIndex + 1;
    const allCompleted = nextIndex >= steps.length;
    
    await updateDoc(taskRef, {
      steps,
      currentStepIndex: nextIndex,
      completed: allCompleted,
      completedAt: allCompleted ? Timestamp.now() : null
    });
    
    return { steps, currentStepIndex: nextIndex, allCompleted };
  } catch (error) {
    console.error('Error completing step:', error);
    throw error;
  }
}

// Volver al paso anterior
export async function goToPreviousStep(taskId: string, task: Task) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const previousIndex = Math.max(0, task.currentStepIndex - 1);
    
    await updateDoc(taskRef, {
      currentStepIndex: previousIndex,
      completed: false,
      completedAt: null
    });
    
    return { currentStepIndex: previousIndex };
  } catch (error) {
    console.error('Error going to previous step:', error);
    throw error;
  }
}

// Actualizar tarea
export async function updateTask(taskId: string, updates: { title?: string; steps?: TaskStep[] }) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, updates);
    return { id: taskId, ...updates };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Eliminar tarea
export async function deleteTask(taskId: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
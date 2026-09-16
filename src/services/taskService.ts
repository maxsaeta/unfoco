import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Task {
  id?: string;
  userId: string;
  title: string;
  step: string;
  completed: boolean;
  order: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

const COLLECTION_NAME = 'tasks';

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

// Obtener tareas del usuario
export async function getUserTasks(userId: string) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Task[];
  } catch (error) {
    console.error('Error getting tasks:', error);
    throw error;
  }
}

// Marcar tarea como completada
export async function completeTask(taskId: string) {
  try {
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      completed: true,
      completedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error completing task:', error);
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
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key de Google Gemini (configurar en .env)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export interface TaskStep {
  step: string;
  description: string;
}

// Generar pasos para una tarea usando IA
export async function generateTaskSteps(taskTitle: string): Promise<TaskStep[]> {
  if (!genAI) {
    throw new Error('API Key de Gemini no configurada');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

  const prompt = `Eres un asistente productivo especializado en ayudar personas con TDAH a dividir tareas en pasos pequeños y manejables.

Tarea: "${taskTitle}"

Genera entre 3 y 5 pasos concretos, pequeños y accionables para completar esta tarea. Cada paso debe ser específico y poder completarse en menos de 5 minutos.

Responde SOLO con un JSON válido en este formato exacto:
[
  {"step": "Nombre del paso", "description": "Descripción breve"},
  {"step": "Nombre del paso", "description": "Descripción breve"}
]

No incluyas texto adicional, solo el JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar la respuesta y parsear JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No se pudo parsear la respuesta');
  } catch (error) {
    console.error('Error generating steps:', error);
    throw error;
  }
}

// Generar un resumen de la tarea
export async function generateTaskSummary(taskTitle: string): Promise<string> {
  if (!genAI) {
    return 'API Key no configurada';
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

  const prompt = `En una oración corta (máximo 20 palabras), explica por qué esta tarea es importante para la productividad personal:

Tarea: "${taskTitle}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return 'No se pudo generar resumen';
  }
}
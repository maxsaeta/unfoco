import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Task, TaskStep } from '../services/taskService';
import { generateTaskSteps } from '../services/aiService';
import { updateTask } from '../services/taskService';

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export function EditTaskModal({ visible, task, onClose, onUpdate }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSteps([...task.steps]);
    }
  }, [task, visible]);

  const handleUpdate = async () => {
    if (!task || !title.trim()) {
      Alert.alert('Error', 'Escribe el nombre de la tarea');
      return;
    }

    if (steps.length === 0) {
      Alert.alert('Error', 'Agrega al menos un paso');
      return;
    }

    try {
      const updatedTask = await updateTask(task.id!, {
        title: title.trim(),
        steps: steps
      });
      
      onUpdate({ ...task, title: title.trim(), steps });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la tarea');
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, {
      id: Math.random().toString(36).substring(2, 15),
      title: '',
      description: '',
      completed: false
    }]);
  };

  const handleUpdateStep = (index: number, field: 'title' | 'description', value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setSteps(updatedSteps);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      Alert.alert('Error', 'Debe haber al menos un paso');
      return;
    }
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleGenerateAISteps = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Escribe primero el nombre de la tarea');
      return;
    }

    setLoadingAI(true);
    try {
      const aiSteps = await generateTaskSteps(title.trim());
      const newSteps: TaskStep[] = aiSteps.map(s => ({
        id: Math.random().toString(36).substring(2, 15),
        title: s.step,
        description: s.description,
        completed: false
      }));
      setSteps(newSteps);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron generar los pasos');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleClose = () => {
    if (task) {
      setTitle(task.title);
      setSteps([...task.steps]);
    }
    onClose();
  };

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modificar Tarea</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Nombre de la tarea"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Botón de IA */}
          <TouchableOpacity 
            style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]}
            onPress={handleGenerateAISteps}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <ActivityIndicator color={COLORS.accent} size="small" />
            ) : (
              <Ionicons name="sparkles" size={20} color={COLORS.accent} />
            )}
            <Text style={styles.aiButtonText}>
              {loadingAI ? 'Generando...' : 'Regenerar pasos con IA'}
            </Text>
          </TouchableOpacity>

          {/* Lista de pasos */}
          <View style={styles.stepsHeader}>
            <Text style={styles.stepsTitle}>Pasos ({steps.length})</Text>
            <TouchableOpacity onPress={handleAddStep}>
              <Ionicons name="add-circle" size={24} color={COLORS.accent} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.stepsList}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepInputs}>
                  <TextInput
                    style={styles.stepInput}
                    placeholder="Título del paso"
                    placeholderTextColor={COLORS.textMuted}
                    value={step.title}
                    onChangeText={(value) => handleUpdateStep(index, 'title', value)}
                  />
                  <TextInput
                    style={styles.stepInputDescription}
                    placeholder="Descripción (opcional)"
                    placeholderTextColor={COLORS.textMuted}
                    value={step.description}
                    onChangeText={(value) => handleUpdateStep(index, 'description', value)}
                  />
                </View>
                <TouchableOpacity onPress={() => handleRemoveStep(index)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonCancel} onPress={handleClose}>
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSave} onPress={handleUpdate}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.textPrimary} />
              <Text style={styles.buttonSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    marginBottom: SPACING.md,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: COLORS.accent,
    fontSize: FONTS.size.small,
    fontWeight: '600',
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  stepsTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  stepsList: {
    maxHeight: 250,
    marginBottom: SPACING.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepInputs: {
    flex: 1,
    gap: SPACING.xs,
  },
  stepInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: FONTS.size.small,
  },
  stepInputDescription: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  buttonCancelText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
  buttonSave: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
  },
  buttonSaveText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
});
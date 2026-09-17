import React, { useState } from 'react';
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
import { COLORS, SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { generateTaskSteps, TaskStep } from '../services/aiService';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, steps: { title: string; description: string }[]) => void;
}

export function AddTaskModal({ visible, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [manualStep, setManualStep] = useState('');
  const [aiSteps, setAiSteps] = useState<TaskStep[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Set<number>>(new Set());
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateSteps = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Escribe primero el nombre de la tarea');
      return;
    }

    setLoadingAI(true);
    try {
      const steps = await generateTaskSteps(title.trim());
      setAiSteps(steps);
      // Seleccionar todos los pasos por defecto
      const allSelected = new Set(steps.map((_, index) => index));
      setSelectedSteps(allSelected);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron generar los pasos. Verifica tu API Key.');
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleStepSelection = (index: number) => {
    const newSelected = new Set(selectedSteps);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSteps(newSelected);
  };

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Escribe el nombre de la tarea');
      return;
    }

    const stepsToAdd: { title: string; description: string }[] = [];

    // Agregar pasos seleccionados de la IA
    aiSteps.forEach((step, index) => {
      if (selectedSteps.has(index)) {
        stepsToAdd.push({ title: step.step, description: step.description });
      }
    });

    // Agregar paso manual si existe
    if (manualStep.trim()) {
      stepsToAdd.push({ title: manualStep.trim(), description: '' });
    }

    if (stepsToAdd.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un paso o escribe uno manual');
      return;
    }

    onAdd(title.trim(), stepsToAdd);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setManualStep('');
    setAiSteps([]);
    setSelectedSteps(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Botón de IA */}
          <TouchableOpacity 
            style={[styles.aiButton, loadingAI && styles.aiButtonDisabled]}
            onPress={handleGenerateSteps}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <ActivityIndicator color={COLORS.accent} size="small" />
            ) : (
              <Ionicons name="sparkles" size={20} color={COLORS.accent} />
            )}
            <Text style={styles.aiButtonText}>
              {loadingAI ? 'Generando...' : 'Generar pasos con IA'}
            </Text>
          </TouchableOpacity>

          {/* Pasos de IA */}
          {aiSteps.length > 0 && (
            <View style={styles.aiStepsContainer}>
              <Text style={styles.aiStepsTitle}>
                Selecciona los pasos ({selectedSteps.size}/{aiSteps.length}):
              </Text>
              <ScrollView style={styles.aiStepsList}>
                {aiSteps.map((aiStep, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.aiStepItem,
                      selectedSteps.has(index) && styles.aiStepItemSelected
                    ]}
                    onPress={() => toggleStepSelection(index)}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedSteps.has(index) && styles.checkboxSelected
                    ]}>
                      {selectedSteps.has(index) && (
                        <Ionicons name="checkmark" size={16} color={COLORS.textPrimary} />
                      )}
                    </View>
                    <View style={styles.aiStepContent}>
                      <Text style={styles.aiStepTitle}>{aiStep.step}</Text>
                      <Text style={styles.aiStepDescription}>{aiStep.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Paso manual */}
          <View style={styles.manualStepContainer}>
            <Text style={styles.manualStepTitle}>O agrega un paso manual:</Text>
            <TextInput
              style={styles.input}
              placeholder="Escribe un paso adicional..."
              placeholderTextColor={COLORS.textMuted}
              value={manualStep}
              onChangeText={setManualStep}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonCancel} onPress={handleClose}>
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.buttonAdd, 
                (selectedSteps.size === 0 && !manualStep.trim()) && styles.buttonAddDisabled
              ]} 
              onPress={handleAdd}
              disabled={selectedSteps.size === 0 && !manualStep.trim()}
            >
              <Ionicons name="add-circle" size={20} color={COLORS.textPrimary} />
              <Text style={styles.buttonAddText}>Agregar</Text>
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
    borderRadius: BORDER_RADIUS.xl,
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
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGETS.minSize,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
    marginBottom: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: COLORS.accent,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  aiStepsContainer: {
    marginBottom: SPACING.md,
  },
  aiStepsTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.sm,
  },
  aiStepsList: {
    maxHeight: 200,
  },
  aiStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  aiStepItemSelected: {
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  aiStepContent: {
    flex: 1,
  },
  aiStepTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
    marginBottom: 2,
  },
  aiStepDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.xs,
  },
  manualStepContainer: {
    marginBottom: SPACING.md,
  },
  manualStepTitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    minHeight: TOUCH_TARGETS.minSize,
  },
  buttonCancelText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  buttonAdd: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    minHeight: TOUCH_TARGETS.minSize,
  },
  buttonAddDisabled: {
    opacity: 0.5,
  },
  buttonAddText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
});

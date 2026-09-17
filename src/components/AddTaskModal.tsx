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
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { generateTaskSteps, TaskStep } from '../services/aiService';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, steps: { title: string; description: string }[]) => void;
}

function useStyles(colors: Colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    modal: {
      backgroundColor: colors.surface,
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
      color: colors.textPrimary,
      fontSize: FONTS.size.xlarge,
      fontWeight: FONTS.weight.bold,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
      color: colors.textPrimary,
      fontSize: FONTS.size.medium,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderColor: colors.accent,
      backgroundColor: colors.transparent,
      marginBottom: SPACING.md,
      minHeight: TOUCH_TARGETS.minSize,
    },
    aiButtonDisabled: {
      opacity: 0.6,
    },
    aiButtonText: {
      color: colors.accent,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
    },
    aiStepsContainer: {
      marginBottom: SPACING.md,
    },
    aiStepsTitle: {
      color: colors.textSecondary,
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
      backgroundColor: colors.background,
      marginBottom: SPACING.sm,
      gap: SPACING.md,
      minHeight: TOUCH_TARGETS.minSize,
    },
    aiStepItemSelected: {
      borderWidth: 1,
      borderColor: colors.accent,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: BORDER_RADIUS.sm,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    aiStepContent: {
      flex: 1,
    },
    aiStepTitle: {
      color: colors.textPrimary,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
      marginBottom: 2,
    },
    aiStepDescription: {
      color: colors.textSecondary,
      fontSize: FONTS.size.xs,
    },
    manualStepContainer: {
      marginBottom: SPACING.md,
    },
    manualStepTitle: {
      color: colors.textSecondary,
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
      backgroundColor: colors.background,
      minHeight: TOUCH_TARGETS.minSize,
    },
    buttonCancelText: {
      color: colors.textSecondary,
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
      backgroundColor: colors.accent,
      minHeight: TOUCH_TARGETS.minSize,
    },
    buttonAddDisabled: {
      opacity: 0.5,
    },
    buttonAddText: {
      color: colors.textPrimary,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
    },
  });
}

export function AddTaskModal({ visible, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [manualStep, setManualStep] = useState('');
  const [aiSteps, setAiSteps] = useState<TaskStep[]>([]);
  const [selectedSteps, setSelectedSteps] = useState<Set<number>>(new Set());
  const [loadingAI, setLoadingAI] = useState(false);

  const { colors } = useTheme();
  const styles = useStyles(colors);

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
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={colors.textMuted}
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
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <Ionicons name="sparkles" size={20} color={colors.accent} />
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
                        <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
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
              placeholderTextColor={colors.textMuted}
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
              <Ionicons name="add-circle" size={20} color={colors.textPrimary} />
              <Text style={styles.buttonAddText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

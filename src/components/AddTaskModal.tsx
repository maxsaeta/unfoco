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
  Platform
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, step: string) => void;
}

export function AddTaskModal({ visible, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [step, setStep] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Escribe el nombre de la tarea');
      return;
    }
    if (!step.trim()) {
      Alert.alert('Error', 'Escribe el primer paso');
      return;
    }
    onAdd(title.trim(), step.trim());
    setTitle('');
    setStep('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Nueva Tarea</Text>
          
          <TextInput
            style={styles.input}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          
          <TextInput
            style={styles.input}
            placeholder="Primer paso pequeño..."
            placeholderTextColor={COLORS.textMuted}
            value={step}
            onChangeText={setStep}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonCancel} onPress={onClose}>
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonAdd} onPress={handleAdd}>
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
    paddingHorizontal: SPACING.xl,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'center',
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
  buttonAdd: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.accent,
  },
  buttonAddText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
});
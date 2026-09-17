import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { container } from '../di/container';
import { auth } from '../config/firebase';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const { colors } = useTheme();
  const styles = useStyles(colors);

  const handleDelete = async () => {
    if (confirmText !== 'ELIMINAR') {
      Alert.alert('Error', 'Debes escribir "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'No se encontró la sesión del usuario');
        return;
      }

      // Delete all user data from Firestore
      await container.deleteAccountUseCase.execute(userId);

      // Delete Firebase Auth account
      const { deleteUser } = await import('firebase/auth');
      await deleteUser(auth.currentUser!);

      Alert.alert(
        'Cuenta eliminada',
        'Tu cuenta y todos tus datos han sido eliminados permanentemente.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Sesión expirada',
          'Para eliminar tu cuenta, necesitas iniciar sesión nuevamente. Cierra sesión y vuelve a entrar.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
      setConfirmText('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Eliminar Cuenta</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={64} color={colors.error} />
          </View>

          <Text style={styles.warningTitle}>¿Estás seguro?</Text>
          
          <Text style={styles.description}>
            Esta acción eliminará permanentemente tu cuenta y todos los datos asociados:
          </Text>

          <View style={styles.dataList}>
            <View style={styles.dataItem}>
              <Ionicons name="mail-outline" size={20} color={colors.error} />
              <Text style={styles.dataItemText}>Tu cuenta de correo electrónico</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="list-outline" size={20} color={colors.error} />
              <Text style={styles.dataItemText}>Todas tus tareas y pasos</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="stats-chart-outline" size={20} color={colors.error} />
              <Text style={styles.dataItemText}>Tus estadísticas de productividad</Text>
            </View>
            <View style={styles.dataItem}>
              <Ionicons name="settings-outline" size={20} color={colors.error} />
              <Text style={styles.dataItemText}>Tu configuración de temporizador</Text>
            </View>
          </View>

          <Text style={styles.irreversible}>
            ⚠️ Esta acción es IRREVERSIBLE y no se puede deshacer.
          </Text>

          <Text style={styles.confirmLabel}>
            Escribe <Text style={styles.bold}>ELIMINAR</Text> para confirmar:
          </Text>

          <TextInput
            style={styles.confirmInput}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="ELIMINAR"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.deleteButton,
                (confirmText !== 'ELIMINAR' || loading) && styles.deleteButtonDisabled
              ]}
              onPress={handleDelete}
              disabled={confirmText !== 'ELIMINAR' || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
  },
  closeButton: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  warningIcon: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  warningTitle: {
    color: colors.error,
    fontSize: FONTS.size.xxlarge,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  dataList: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  dataItemText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    flex: 1,
  },
  irreversible: {
    color: colors.error,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: colors.tintedAccent,
    borderRadius: BORDER_RADIUS.md,
  },
  confirmLabel: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    marginBottom: SPACING.sm,
  },
  bold: {
    fontWeight: FONTS.weight.bold,
    color: colors.textPrimary,
  },
  confirmInput: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: SPACING.xl,
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGETS.recommendedSize,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
});

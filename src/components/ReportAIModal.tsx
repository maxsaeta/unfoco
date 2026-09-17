import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface ReportAIModalProps {
  visible: boolean;
  onClose: () => void;
  reportedContent?: string;
}

export function ReportAIModal({ visible, onClose, reportedContent }: ReportAIModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const reasons = [
    'Contenido ofensivo',
    'Información falsa o engañosa',
    'Contenido inapropiado',
    'Spam o publicidad',
    'Otro'
  ];

  const handleReport = async () => {
    if (!reason) {
      Alert.alert('Error', 'Selecciona un motivo de reporte');
      return;
    }

    setLoading(true);
    
    // Simular envío del reporte
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    Alert.alert(
      'Reporte enviado',
      'Gracias por reportar este contenido. Revisaremos tu reporte lo antes posible.',
      [{ text: 'OK', onPress: onClose }]
    );
    setReason('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reportar Contenido IA</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={colors.accent} />
            <Text style={styles.infoText}>
              Si el contenido generado por la IA es ofensivo, inapropiado o contiene información falsa, por favor repórtalo para que podamos mejorar.
            </Text>
          </View>

          {reportedContent && (
            <View style={styles.contentPreview}>
              <Text style={styles.contentLabel}>Contenido reportado:</Text>
              <Text style={styles.contentText} numberOfLines={3}>
                {reportedContent}
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Motivo del reporte:</Text>

          <View style={styles.reasonsList}>
            {reasons.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.reasonItem,
                  reason === r && styles.reasonItemActive
                ]}
                onPress={() => setReason(r)}
              >
                <View style={[
                  styles.radio,
                  reason === r && styles.radioActive
                ]}>
                  {reason === r && <View style={styles.radioInner} />}
                </View>
                <Text style={[
                  styles.reasonText,
                  reason === r && styles.reasonTextActive
                ]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                styles.reportButton,
                (!reason || loading) && styles.reportButtonDisabled
              ]}
              onPress={handleReport}
              disabled={!reason || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.reportButtonText}>Enviar Reporte</Text>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.tintedInfo,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    lineHeight: 20,
  },
  contentPreview: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  contentLabel: {
    color: colors.textMuted,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.sm,
  },
  contentText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    fontStyle: 'italic',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
    marginBottom: SPACING.md,
  },
  reasonsList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    minHeight: TOUCH_TARGETS.minSize,
  },
  reasonItemActive: {
    backgroundColor: colors.tintedAccent,
    borderWidth: 1,
    borderColor: colors.error,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.error,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    flex: 1,
  },
  reasonTextActive: {
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 'auto',
    paddingBottom: SPACING.xl,
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
  reportButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  reportButtonDisabled: {
    opacity: 0.5,
  },
  reportButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
});

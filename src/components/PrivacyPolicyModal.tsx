import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRIVACY_POLICY_URL = 'https://1paso-web.netlify.app/legal/privacy.html';

export function PrivacyPolicyModal({ visible, onClose }: PrivacyPolicyModalProps) {
  const handleOpenWebVersion = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Política de Privacidad</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Última actualización: 17 de septiembre de 2026</Text>

          <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          <Text style={styles.text}>
            UnPaso recopila la siguiente información para proporcionar y mejorar nuestro servicio:
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Información de cuenta:</Text> Dirección de correo electrónico y contraseña (encriptada) utilizada para crear y acceder a tu cuenta.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Datos de tareas:</Text> Títulos, pasos, estado de completado y timestamps de las tareas que creas en la aplicación.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Estadísticas de uso:</Text> Datos de productividad como pomodoros completados, tareas finalizadas, minutos de concentración y rachas diarias.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Configuración:</Text> Preferencias de temporizador (minutos de trabajo y descanso).
          </Text>

          <Text style={styles.sectionTitle}>2. Uso de Inteligencia Artificial</Text>
          <Text style={styles.text}>
            UnPaso utiliza Google Gemini (modelo gemini-flash-lite-latest) para generar pasos de tareas de forma automática. Cuando usas esta función:
          </Text>
          <Text style={styles.text}>
            • El título de tu tarea se envía a los servidores de Google para procesamiento.
          </Text>
          <Text style={styles.text}>
            • Los datos enviados NO se almacenan permanentemente en los servidores de Google.
          </Text>
          <Text style={styles.text}>
            • Google processa estos datos según su propia política de privacidad.
          </Text>
          <Text style={styles.text}>
            • Puedes reportar contenido ofensivo o inapropiado generado por la IA utilizando el botón de reporte disponible en cada respuesta de la IA.
          </Text>

          <Text style={styles.sectionTitle}>3. Uso de la Información</Text>
          <Text style={styles.text}>
            Utilizamos tu información exclusivamente para:
          </Text>
          <Text style={styles.text}>
            • Proporcionar y mantener el servicio de productividad
          </Text>
          <Text style={styles.text}>
            • Generar pasos de tareas mediante inteligencia artificial
          </Text>
          <Text style={styles.text}>
            • Calcular y almacenar tus estadísticas de productividad
          </Text>
          <Text style={styles.text}>
            • Sincronizar tus datos entre dispositivos
          </Text>

          <Text style={styles.sectionTitle}>4. Almacenamiento y Seguridad</Text>
          <Text style={styles.text}>
            • Tus datos se almacenan en Firebase (Google Cloud), servidores seguros con encriptación en tránsito y en reposo.
          </Text>
          <Text style={styles.text}>
            • Las contraseñas se almacenan de forma hasheada y nunca son accesibles de forma directa.
          </Text>
          <Text style={styles.text}>
            • No vendemos ni compartimos tu información personal con terceros para fines de marketing.
          </Text>

          <Text style={styles.sectionTitle}>5. Compartición con Terceros</Text>
          <Text style={styles.text}>
            Compartimos datos únicamente con los siguientes proveedores de servicios que procesan información bajo nuestras instrucciones:
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Firebase (Google):</Text> Autenticación, base de datos y almacenamiento en la nube.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Google Gemini:</Text> Procesamiento de IA para generación de pasos de tareas.
          </Text>

          <Text style={styles.sectionTitle}>6. Tus Derechos</Text>
          <Text style={styles.text}>
            Tienes derecho a:
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Acceder:</Text> Ver toda la información que tenemos sobre ti.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Eliminar:</Text> Solicitar la eliminación completa de tu cuenta y todos tus datos.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Exportar:</Text> Descargar una copia de tus datos.
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Reportar:</Text> Denunciar contenido generado por IA que consideres ofensivo.
          </Text>

          <Text style={styles.sectionTitle}>7. Eliminación de Cuenta</Text>
          <Text style={styles.text}>
            Puedes eliminar tu cuenta y todos tus datos asociados en cualquier momento desde la configuración de la app. Al eliminar tu cuenta:
          </Text>
          <Text style={styles.text}>
            • Se eliminarán permanentemente tus datos de autenticación
          </Text>
          <Text style={styles.text}>
            • Se eliminarán todas tus tareas y estadísticas
          </Text>
          <Text style={styles.text}>
            • Esta acción es irreversible
          </Text>

          <Text style={styles.sectionTitle}>8. Retención de Datos</Text>
          <Text style={styles.text}>
            Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, todos los datos se eliminan permanentemente de nuestros servidores de forma inmediata.
          </Text>

          <Text style={styles.sectionTitle}>9. Cambios en esta Política</Text>
          <Text style={styles.text}>
            Nos reservamos el derecho de actualizar esta política de privacidad. Te notificaremos de cualquier cambio significativo a través de la aplicación o por correo electrónico.
          </Text>

          <Text style={styles.sectionTitle}>10. Contacto</Text>
          <Text style={styles.text}>
            Si tienes preguntas sobre esta política de privacidad o sobre el manejo de tus datos, contáctanos a través de:
          </Text>
          <Text style={styles.text}>
            Email: maxsaeta@gmail.com
          </Text>

          <TouchableOpacity style={styles.webLinkButton} onPress={handleOpenWebVersion}>
            <Ionicons name="open-outline" size={20} color={COLORS.accent} />
            <Text style={styles.webLinkText}>Ver versión completa en web</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
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
    paddingTop: SPACING.md,
  },
  lastUpdated: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  bold: {
    fontWeight: FONTS.weight.semibold,
    color: COLORS.textPrimary,
  },
  webLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  webLinkText: {
    color: COLORS.accent,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  bottomSpacer: {
    height: SPACING.xxxl * 2,
  },
});

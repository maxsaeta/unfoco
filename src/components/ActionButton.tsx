import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { SPACING, FONTS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
}

export function ActionButton({ 
  title, 
  onPress, 
  variant = 'primary',
  style 
}: ActionButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  text: {
    fontSize: FONTS.size.small,
    fontWeight: '600',
  },
  textPrimary: {
    color: colors.textPrimary,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  textDanger: {
    color: colors.textPrimary,
  },
});

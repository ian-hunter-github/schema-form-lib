import type { Theme } from './themes/default';
import type { VariantConfig } from './variants/types';

// Utility function to create CSS styles from theme tokens with density support
export const createStyles = (theme: Theme, variants?: VariantConfig) => {
  const density = variants?.density || 'normal';
  const densityStyles = theme.components.density[density];
  
  return {
  // Field styles with density support
  fieldContainer: {
    marginBottom: densityStyles.components.fieldContainer.marginBottom,
    position: 'relative' as const,
  },
  
  fieldInput: {
    padding: densityStyles.components.fieldInput.padding,
    fontSize: theme.typography.field.input.fontSize,
    fontWeight: theme.typography.field.input.fontWeight,
    lineHeight: theme.typography.field.input.lineHeight,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '0.375rem',
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.field.default,
  },
  
  fieldInputHover: {
    borderColor: theme.colors.primary[500],
  },
  
  fieldInputFocus: {
    outline: 'none',
    borderColor: theme.colors.primary[500],
    boxShadow: theme.shadows.field.focus,
  },
  
  fieldInputError: {
    borderColor: theme.colors.semantic.error,
    boxShadow: theme.shadows.field.error,
  },
  
  fieldInputDirty: {
    backgroundColor: theme.colors.state.dirty,
    borderColor: theme.colors.state.dirtyBorder,
  },
  
  fieldLabel: {
    fontSize: theme.typography.field.label.fontSize,
    fontWeight: theme.typography.field.label.fontWeight,
    lineHeight: theme.typography.field.label.lineHeight,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    display: 'block',
  },
  
  fieldLabelRequired: {
    '&::after': {
      content: '" *"',
      color: theme.colors.semantic.error,
    },
  },
  
  fieldDescription: {
    fontSize: theme.typography.field.description.fontSize,
    fontWeight: theme.typography.field.description.fontWeight,
    lineHeight: theme.typography.field.description.lineHeight,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  
  fieldError: {
    fontSize: theme.typography.field.error.fontSize,
    fontWeight: theme.typography.field.error.fontWeight,
    lineHeight: theme.typography.field.error.lineHeight,
    color: theme.colors.semantic.error,
    marginTop: theme.spacing.xs,
  },
  
  fieldHelper: {
    fontSize: theme.typography.field.helper.fontSize,
    fontWeight: theme.typography.field.helper.fontWeight,
    lineHeight: theme.typography.field.helper.lineHeight,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  
  // Button styles with density support
  button: {
    padding: densityStyles.components.button.padding,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
    lineHeight: theme.typography.button.lineHeight,
    borderRadius: '0.375rem',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.button.gap,
    boxShadow: theme.shadows.button.default,
  },
  
  buttonPrimary: {
    backgroundColor: theme.colors.primary[500],
    color: theme.colors.text.inverse,
  },
  
  buttonSecondary: {
    backgroundColor: theme.colors.background.primary,
    color: theme.colors.text.primary,
    borderColor: theme.colors.border.primary,
  },
  
  buttonDanger: {
    backgroundColor: theme.colors.semantic.error,
    color: theme.colors.text.inverse,
  },
  
  // Array styles with density support
  arrayContainer: {
    marginBottom: densityStyles.spacing.formSection,
  },
  
  arrayItem: {
    marginBottom: densityStyles.components.arrayItem.marginBottom,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '0.5rem',
    backgroundColor: theme.colors.background.primary,
    boxShadow: theme.shadows.card.default,
  },
  
  arrayHeader: {
    padding: densityStyles.components.arrayHeader.padding,
    borderBottom: `1px solid ${theme.colors.border.primary}`,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: '0.5rem 0.5rem 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  
  arrayContent: {
    padding: densityStyles.components.arrayContent.padding,
  },
  
  // Checkbox styles
  checkboxWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.field.gap,
    padding: `${theme.spacing.sm} 0`,
  },
  
  checkboxInput: {
    width: '1rem',
    height: '1rem',
    margin: 0,
    accentColor: theme.colors.primary[500],
  },
  
  checkboxLabel: {
    fontSize: theme.typography.field.label.fontSize,
    fontWeight: theme.typography.field.label.fontWeight,
    color: theme.colors.text.primary,
    cursor: 'pointer',
  },

  // Grid-12 layout specific styles
  grid12FloatingContainer: {
    position: 'relative' as const,
    width: '100%',
  },

  grid12FloatingInput: {
    width: '100%',
    padding: '12px 8px 4px 8px',
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: 'transparent',
    transition: 'border-color 0.2s ease',
    color: theme.colors.text.primary,
  },

  grid12FloatingInputFocus: {
    outline: 'none',
    borderColor: theme.colors.primary[500],
    boxShadow: `0 0 0 2px ${theme.colors.primary[500]}40`, // 25% opacity
  },

  grid12FloatingInputError: {
    borderColor: theme.colors.semantic.error,
    boxShadow: `0 0 0 2px ${theme.colors.semantic.error}40`, // 25% opacity
  },

  grid12FloatingInputDirty: {
    borderColor: theme.colors.state.dirtyBorder,
    backgroundColor: theme.colors.state.dirty,
  },

  grid12FloatingLabel: {
    position: 'absolute' as const,
    left: '8px',
    top: '12px',
    fontSize: '16px',
    color: theme.colors.text.secondary,
    pointerEvents: 'none' as const,
    transition: 'all 0.2s ease',
    backgroundColor: theme.colors.background.primary,
    padding: '0 4px',
  },

  grid12FloatingLabelActive: {
    top: '-8px',
    fontSize: '12px',
    color: theme.colors.primary[500],
    fontWeight: 500,
  },

  grid12FloatingLabelError: {
    color: theme.colors.semantic.error,
  },

  grid12FloatingSelect: {
    width: '100%',
    padding: '12px 8px 4px 8px',
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: theme.colors.background.primary,
    transition: 'border-color 0.2s ease',
    color: theme.colors.text.primary,
  },

  grid12BooleanContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },

  grid12BooleanContainerDirty: {
    backgroundColor: theme.colors.state.dirty,
    borderRadius: '4px',
    padding: '4px',
    border: `1px solid ${theme.colors.state.dirtyBorder}`,
  },

  grid12BooleanCheckbox: {
    width: '18px',
    height: '18px',
    margin: 0,
    accentColor: theme.colors.primary[500],
  },

  grid12BooleanLabel: {
    fontSize: '16px',
    color: theme.colors.text.primary,
    cursor: 'pointer',
    userSelect: 'none' as const,
  },

  grid12FieldDescription: {
    color: theme.colors.text.secondary,
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },

  grid12FieldError: {
    color: theme.colors.semantic.error,
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },

  grid12DirtyIndicator: {
    color: theme.colors.state.dirtyBorder,
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: 'bold',
    display: 'block',
  },
  };
};

// Helper function to merge styles
export const mergeStyles = (...styles: (React.CSSProperties | undefined)[]): React.CSSProperties => {
  return styles.filter((style): style is React.CSSProperties => Boolean(style)).reduce((acc, style) => ({ ...acc, ...style }), {});
};

// Helper function to apply conditional styles
export const conditionalStyle = (condition: boolean, style: React.CSSProperties): React.CSSProperties => {
  return condition ? style : {};
};

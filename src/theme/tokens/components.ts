import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export const components = {
  // Density variants - spacing adjustments for different density levels
  density: {
    compact: {
      spacing: {
        fieldMargin: '0.375rem',     // 6px - reduced from 12px
        fieldPadding: '0.5rem',      // 8px - reduced from 12px
        formSection: '1rem',         // 16px - reduced from 24px
        formGroup: '0.5rem',         // 8px - reduced from 16px
        arrayItem: '0.5rem',         // 8px - reduced from 12px
        arrayContent: '0.75rem',     // 12px - reduced from 16px
        arrayHeader: '0.5rem',       // 8px - reduced from 12px
        buttonPadding: '0.375rem 0.75rem', // 6px 12px - reduced
      },
      components: {
        fieldContainer: { marginBottom: '0.375rem' },
        fieldInput: { padding: '0.5rem' },
        arrayItem: { marginBottom: '0.5rem' },
        arrayContent: { padding: '0.75rem' },
        arrayHeader: { padding: '0.5rem' },
        button: { padding: '0.375rem 0.75rem' },
      },
    },
    normal: {
      spacing: {
        fieldMargin: spacing.form.field,     // 12px - default
        fieldPadding: spacing.field.padding, // 12px - default
        formSection: spacing.form.section,   // 24px - default
        formGroup: spacing.form.group,       // 16px - default
        arrayItem: spacing.array.item,       // 12px - default
        arrayContent: spacing.array.content, // 16px - default
        arrayHeader: spacing.array.header,   // 12px - default
        buttonPadding: spacing.button.padding, // 8px 16px - default
      },
      components: {
        fieldContainer: { marginBottom: spacing.form.field },
        fieldInput: { padding: spacing.field.padding },
        arrayItem: { marginBottom: spacing.array.item },
        arrayContent: { padding: spacing.array.content },
        arrayHeader: { padding: spacing.array.header },
        button: { padding: spacing.button.padding },
      },
    },
    comfortable: {
      spacing: {
        fieldMargin: '1rem',         // 16px - increased from 12px
        fieldPadding: '1rem',        // 16px - increased from 12px
        formSection: '2rem',         // 32px - increased from 24px
        formGroup: '1.5rem',         // 24px - increased from 16px
        arrayItem: '1rem',           // 16px - increased from 12px
        arrayContent: '1.5rem',      // 24px - increased from 16px
        arrayHeader: '1rem',         // 16px - increased from 12px
        buttonPadding: '0.75rem 1.5rem', // 12px 24px - increased
      },
      components: {
        fieldContainer: { marginBottom: '1rem' },
        fieldInput: { padding: '1rem' },
        arrayItem: { marginBottom: '1rem' },
        arrayContent: { padding: '1.5rem' },
        arrayHeader: { padding: '1rem' },
        button: { padding: '0.75rem 1.5rem' },
      },
    },
  },

  // Field components
  field: {
    container: {
      marginBottom: spacing.form.field,
      position: 'relative' as const,
    },
    
    input: {
      padding: spacing.field.padding,
      fontSize: typography.field.input.fontSize,
      fontWeight: typography.field.input.fontWeight,
      lineHeight: typography.field.input.lineHeight,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '0.375rem', // 6px
      backgroundColor: colors.background.primary,
      color: colors.text.primary,
      transition: 'all 0.2s ease',
      boxShadow: shadows.field.default,
      
      '&:hover': {
        borderColor: colors.primary[500],
      },
      
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary[500],
        boxShadow: shadows.field.focus,
      },
      
      '&:disabled': {
        backgroundColor: colors.state.disabled,
        color: colors.text.tertiary,
        cursor: 'not-allowed',
      },
      
      '&.error': {
        borderColor: colors.semantic.error,
        boxShadow: shadows.field.error,
      },
      
      '&.dirty': {
        backgroundColor: colors.state.dirty,
        borderColor: colors.state.dirtyBorder,
      },
    },
    
    label: {
      fontSize: typography.field.label.fontSize,
      fontWeight: typography.field.label.fontWeight,
      lineHeight: typography.field.label.lineHeight,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      display: 'block',
      
      '&.required::after': {
        content: '" *"',
        color: colors.semantic.error,
      },
      
      '&.floating': {
        position: 'absolute' as const,
        top: spacing.field.padding,
        left: spacing.field.padding,
        backgroundColor: colors.background.primary,
        padding: `0 ${spacing.xs}`,
        transition: 'all 0.2s ease',
        pointerEvents: 'none' as const,
        
        '&.active': {
          top: '-0.5rem',
          fontSize: typography.field.helper.fontSize,
          color: colors.primary[500],
        },
      },
    },
    
    description: {
      fontSize: typography.field.description.fontSize,
      fontWeight: typography.field.description.fontWeight,
      lineHeight: typography.field.description.lineHeight,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    
    error: {
      fontSize: typography.field.error.fontSize,
      fontWeight: typography.field.error.fontWeight,
      lineHeight: typography.field.error.lineHeight,
      color: colors.semantic.error,
      marginTop: spacing.xs,
    },
    
    helper: {
      fontSize: typography.field.helper.fontSize,
      fontWeight: typography.field.helper.fontWeight,
      lineHeight: typography.field.helper.lineHeight,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
    },
  },
  
  // Button components
  button: {
    base: {
      padding: spacing.button.padding,
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      lineHeight: typography.button.lineHeight,
      borderRadius: '0.375rem', // 6px
      border: '1px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.button.gap,
      boxShadow: shadows.button.default,
      
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    
    variants: {
      primary: {
        backgroundColor: colors.primary[500],
        color: colors.text.inverse,
        
        '&:hover:not(:disabled)': {
          backgroundColor: colors.primary[600],
          boxShadow: shadows.button.hover,
        },
        
        '&:active': {
          backgroundColor: colors.primary[700],
          boxShadow: shadows.button.active,
        },
      },
      
      secondary: {
        backgroundColor: colors.background.primary,
        color: colors.text.primary,
        borderColor: colors.border.primary,
        
        '&:hover:not(:disabled)': {
          backgroundColor: colors.state.hover,
          boxShadow: shadows.button.hover,
        },
        
        '&:active': {
          backgroundColor: colors.state.active,
          boxShadow: shadows.button.active,
        },
      },
      
      danger: {
        backgroundColor: colors.semantic.error,
        color: colors.text.inverse,
        
        '&:hover:not(:disabled)': {
          backgroundColor: '#b91c1c', // darker red
          boxShadow: shadows.button.hover,
        },
        
        '&:active': {
          backgroundColor: '#991b1b', // even darker red
          boxShadow: shadows.button.active,
        },
      },
    },
    
    sizes: {
      sm: {
        padding: '0.375rem 0.75rem', // 6px 12px
        fontSize: typography.fontSize.sm,
      },
      md: {
        padding: spacing.button.padding,
        fontSize: typography.button.fontSize,
      },
      lg: {
        padding: '0.75rem 1.5rem', // 12px 24px
        fontSize: typography.fontSize.base,
      },
    },
  },
  
  // Array components
  array: {
    container: {
      marginBottom: spacing.form.section,
    },
    
    item: {
      marginBottom: spacing.array.item,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '0.5rem', // 8px
      backgroundColor: colors.background.primary,
      boxShadow: shadows.card.default,
      
      '&:hover': {
        boxShadow: shadows.card.hover,
      },
    },
    
    header: {
      padding: spacing.array.header,
      borderBottom: `1px solid ${colors.border.primary}`,
      backgroundColor: colors.background.secondary,
      borderRadius: '0.5rem 0.5rem 0 0', // 8px top corners
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      
      '&:hover': {
        backgroundColor: colors.state.hover,
      },
    },
    
    content: {
      padding: spacing.array.content,
    },
    
    addButton: {
      marginTop: spacing.md,
    },
  },
  
  // Checkbox components
  checkbox: {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.field.gap,
      padding: `${spacing.sm} 0`,
    },
    
    input: {
      width: '1rem',
      height: '1rem',
      margin: 0,
      accentColor: colors.primary[500],
    },
    
    label: {
      fontSize: typography.field.label.fontSize,
      fontWeight: typography.field.label.fontWeight,
      color: colors.text.primary,
      cursor: 'pointer',
      
      '&.required::after': {
        content: '" *"',
        color: colors.semantic.error,
      },
    },
  },
} as const;

export type Components = typeof components;

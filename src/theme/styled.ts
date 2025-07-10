import styled from '@emotion/styled';
import { defaultTheme } from './themes/default';
import type { VariantConfig } from './variants/types';

// Use the actual defaultTheme type for better compatibility
type Theme = typeof defaultTheme;

// Helper to access theme properties safely with type assertion
const getTheme = (props: { theme?: unknown }) => (props.theme || defaultTheme) as Theme;

// Helper to get density styles
const getDensityStyles = (density: VariantConfig['density'], theme: Theme) => {
  return theme.components.density[density || 'normal'];
};

// Enhanced field container with layout support
export const StyledFieldContainer = styled.div<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  density?: VariantConfig['density'];
  layout?: 'default' | 'floating';
}>`
  margin-bottom: ${props => {
    const densityStyles = getDensityStyles(props.density, getTheme(props));
    return densityStyles.components.fieldContainer.marginBottom;
  }};
  position: relative;
  width: 97%;
  
  ${props => props.layout === 'floating' && `
    position: relative;
  `}
`;

// Enhanced field input with variant support
export const StyledFieldSelect = styled.select<{
  hasError?: boolean;
  isDirty?: boolean;
  variant?: 'default' | 'floating';
}>`
  width: 100%;
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: ${props => props.variant === 'floating' ? '4px' : '0.375rem'};
  background-color: ${props => props.variant === 'floating' ? 'transparent' : getTheme(props).colors.background.primary};
  color: ${props => getTheme(props).colors.text.primary};
  transition: all 0.2s ease;
  padding: ${props => props.variant === 'floating' ? '12px 8px 4px 8px' : '8px'};
  font-size: ${props => props.variant === 'floating' ? '16px' : getTheme(props).typography.field.input.fontSize};
  font-weight: ${props => getTheme(props).typography.field.input.fontWeight};
  line-height: ${props => getTheme(props).typography.field.input.lineHeight};
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 1rem;

  &:hover {
    border-color: ${props => getTheme(props).colors.primary[500]};
  }

  &:focus {
    outline: none;
    border-color: ${props => getTheme(props).colors.primary[500]};
    box-shadow: ${props => props.variant === 'floating' 
      ? `0 0 0 2px ${getTheme(props).colors.primary[500]}40`
      : getTheme(props).shadows.field.focus
    };
  }

  &:disabled {
    background-color: ${props => getTheme(props).colors.state.disabled};
    color: ${props => getTheme(props).colors.text.tertiary};
    cursor: not-allowed;
  }

  ${props => props.hasError && `
    border-color: ${getTheme(props).colors.semantic.error};
    box-shadow: ${props.variant === 'floating' 
      ? `0 0 0 2px ${getTheme(props).colors.semantic.error}40`
      : getTheme(props).shadows.field.error
    };
  `}

  ${props => props.isDirty && `
    background-color: ${getTheme(props).colors.state.dirty};
    border-color: ${getTheme(props).colors.state.dirtyBorder};
  `}
`;

export const StyledFieldInput = styled.input<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  density?: VariantConfig['density'];
  variant?: 'default' | 'floating';
}>`
  width: 100%;
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: ${props => props.variant === 'floating' ? '4px' : '0.375rem'};
  background-color: ${props => props.variant === 'floating' ? 'transparent' : getTheme(props).colors.background.primary};
  color: ${props => getTheme(props).colors.text.primary};
  transition: all 0.2s ease;
  
  /* Density-based padding */
  padding: ${props => {
    const densityStyles = getDensityStyles(props.density, getTheme(props));
    return props.variant === 'floating' 
      ? '12px 8px 4px 8px' 
      : densityStyles.components.fieldInput.padding;
  }};
  
  /* Typography */
  font-size: ${props => props.variant === 'floating' ? '16px' : getTheme(props).typography.field.input.fontSize};
  font-weight: ${props => getTheme(props).typography.field.input.fontWeight};
  line-height: ${props => getTheme(props).typography.field.input.lineHeight};
  
  /* Default shadow for non-floating variant */
  ${props => props.variant !== 'floating' && `
    box-shadow: ${getTheme(props).shadows.field.default};
  `}
  
  &:hover {
    border-color: ${props => getTheme(props).colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => getTheme(props).colors.primary[500]};
    box-shadow: ${props => props.variant === 'floating' 
      ? `0 0 0 2px ${getTheme(props).colors.primary[500]}40`
      : getTheme(props).shadows.field.focus
    };
  }
  
  &:disabled {
    background-color: ${props => getTheme(props).colors.state.disabled};
    color: ${props => getTheme(props).colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${props => props.hasError && `
    border-color: ${getTheme(props).colors.semantic.error};
    box-shadow: ${props.variant === 'floating' 
      ? `0 0 0 2px ${getTheme(props).colors.semantic.error}40`
      : getTheme(props).shadows.field.error
    };
  `}
  
  ${props => props.isDirty && `
    background-color: ${getTheme(props).colors.state.dirty};
    border-color: ${getTheme(props).colors.state.dirtyBorder};
  `}
`;

// Enhanced field label with floating support
export const StyledFieldLabel = styled.label<{ 
  required?: boolean; 
  floating?: boolean; 
  active?: boolean;
  hasError?: boolean;
}>`
  font-size: ${props => getTheme(props).typography.field.label.fontSize};
  font-weight: ${props => getTheme(props).typography.field.label.fontWeight};
  line-height: ${props => getTheme(props).typography.field.label.lineHeight};
  color: ${props => getTheme(props).colors.text.secondary};
  display: block;
  
  ${props => !props.floating && `
    margin-bottom: ${getTheme(props).spacing.xs};
  `}
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${getTheme(props).colors.semantic.error};
    }
  `}
  
  ${props => props.floating && `
    position: absolute;
    left: 8px;
    top: 12px;
    font-size: 16px;
    color: ${getTheme(props).colors.text.secondary};
    pointer-events: none;
    transition: all 0.2s ease;
    background: ${getTheme(props).colors.background.primary};
    padding: 0 4px;
  `}
  
  ${props => props.floating && props.active && `
    top: -8px;
    font-size: 12px;
    color: ${getTheme(props).colors.primary[500]};
    font-weight: 500;
  `}
  
  ${props => props.floating && props.hasError && `
    color: ${getTheme(props).colors.semantic.error};
  `}
`;

export const StyledFieldDescription = styled.div`
  font-size: ${props => getTheme(props).typography.field.description.fontSize};
  font-weight: ${props => getTheme(props).typography.field.description.fontWeight};
  line-height: ${props => getTheme(props).typography.field.description.lineHeight};
  color: ${props => getTheme(props).colors.text.secondary};
  margin-top: ${props => getTheme(props).spacing.xs};
`;

export const StyledFieldError = styled.div`
  font-size: ${props => getTheme(props).typography.field.error.fontSize};
  font-weight: ${props => getTheme(props).typography.field.error.fontWeight};
  line-height: ${props => getTheme(props).typography.field.error.lineHeight};
  color: ${props => getTheme(props).colors.semantic.error};
  margin-top: ${props => getTheme(props).spacing.xs};
`;

export const StyledFieldHelper = styled.div`
  font-size: ${props => getTheme(props).typography.field.helper.fontSize};
  font-weight: ${props => getTheme(props).typography.field.helper.fontWeight};
  line-height: ${props => getTheme(props).typography.field.helper.lineHeight};
  color: ${props => getTheme(props).colors.text.tertiary};
  margin-top: ${props => getTheme(props).spacing.xs};
`;

export const StyledButton = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}>`
  padding: ${props => getTheme(props).spacing.button.padding};
  font-size: ${props => getTheme(props).typography.button.fontSize};
  font-weight: ${props => getTheme(props).typography.button.fontWeight};
  line-height: ${props => getTheme(props).typography.button.lineHeight};
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => getTheme(props).spacing.button.gap};
  box-shadow: ${props => getTheme(props).shadows.button.default};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Primary variant (default) */
  background-color: ${props => getTheme(props).colors.primary[500]};
  color: ${props => getTheme(props).colors.text.inverse};
  
  &:hover:not(:disabled) {
    background-color: ${props => getTheme(props).colors.primary[600]};
    box-shadow: ${props => getTheme(props).shadows.button.hover};
  }
  
  &:active {
    background-color: ${props => getTheme(props).colors.primary[700]};
    box-shadow: ${props => getTheme(props).shadows.button.active};
  }
  
  /* Secondary variant */
  ${props => props.variant === 'secondary' && `
    background-color: ${getTheme(props).colors.background.primary};
    color: ${getTheme(props).colors.text.primary};
    border-color: ${getTheme(props).colors.border.primary};
    
    &:hover:not(:disabled) {
      background-color: ${getTheme(props).colors.state.hover};
    }
    
    &:active {
      background-color: ${getTheme(props).colors.state.active};
    }
  `}
  
  /* Danger variant */
  ${props => props.variant === 'danger' && `
    background-color: ${getTheme(props).colors.semantic.error};
    color: ${getTheme(props).colors.text.inverse};
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
    }
    
    &:active {
      background-color: #991b1b;
    }
  `}
  
  /* Size variants */
  ${props => props.size === 'sm' && `
    padding: 0.375rem 0.75rem;
    font-size: ${getTheme(props).typography.fontSize.sm};
  `}
  
  ${props => props.size === 'lg' && `
    padding: 0.75rem 1.5rem;
    font-size: ${getTheme(props).typography.fontSize.base};
  `}
`;

export const StyledArrayContainer = styled.div`
  margin-bottom: ${props => getTheme(props).spacing.form.section};
`;

export const StyledArrayItem = styled.div<{ isDirty?: boolean }>`
  margin-bottom: ${props => getTheme(props).spacing.array.item};
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: 0.5rem;
  background-color: ${props => getTheme(props).colors.background.primary};
  box-shadow: ${props => getTheme(props).shadows.card.default};
  
  &:hover {
    box-shadow: ${props => getTheme(props).shadows.card.hover};
  }
`;

export const StyledArrayHeader = styled.div<{ hasBottomBorder?: boolean }>`
  padding: ${props => getTheme(props).spacing.array.header};
  border-bottom: 1px solid ${props => getTheme(props).colors.border.primary};
  background-color: ${props => getTheme(props).colors.background.secondary};
  border-radius: 0.5rem 0.5rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => getTheme(props).colors.state.hover};
  }
`;

export const StyledArrayContent = styled.div`
  padding: ${props => getTheme(props).spacing.array.content};
`;

export const StyledCheckboxWrapper = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => getTheme(props).spacing.field.gap};
  padding: ${props => getTheme(props).spacing.sm} 0;
  
  ${props => props.isDirty && `
    &::before {
      content: "";
      position: absolute;
      left: -4px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: ${getTheme(props).colors.state.dirtyBorder};
    }
  `}
`;

export const StyledCheckboxInput = styled.input`
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: ${props => getTheme(props).colors.primary[500]};
`;

export const StyledCheckboxLabel = styled.label<{ required?: boolean }>`
  font-size: ${props => getTheme(props).typography.field.label.fontSize};
  font-weight: ${props => getTheme(props).typography.field.label.fontWeight};
  color: ${props => getTheme(props).colors.text.primary};
  cursor: pointer;
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${getTheme(props).colors.semantic.error};
    }
  `}
`;

// Grid-12 specific boolean field components
export const StyledGrid12BooleanContainer = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => getTheme(props).spacing.md};
  padding: ${props => getTheme(props).spacing.sm} 0;
  position: relative;
  
  ${props => props.isDirty && `
    &::before {
      content: "";
      position: absolute;
      left: -4px;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: ${getTheme(props).colors.state.dirtyBorder};
    }
  `}
`;

export const StyledGrid12BooleanCheckbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: ${props => getTheme(props).colors.primary[500]};
  position: relative;
  top: -1px;
`;

export const StyledGrid12BooleanLabel = styled.label<{ required?: boolean }>`
  font-size: ${props => getTheme(props).typography.field.label.fontSize};
  font-weight: ${props => getTheme(props).typography.field.label.fontWeight};
  color: ${props => getTheme(props).colors.text.primary};
  cursor: pointer;
  flex-grow: 1;
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${getTheme(props).colors.semantic.error};
    }
  `}
`;

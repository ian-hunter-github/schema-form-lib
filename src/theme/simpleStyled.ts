import styled from '@emotion/styled';
import { defaultTheme } from './themes/default';

// Simple styled components that use the theme directly without complex typing
export const SimpleFieldContainer = styled.div<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  isFloating?: boolean;
}>`
  margin-bottom: ${defaultTheme.spacing.form.field};
  position: relative;
  width: 100%;
`;

export const SimpleFieldInput = styled.input<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  isFloating?: boolean;
}>`
  width: 100%;
  border: 1px solid ${defaultTheme.colors.border.primary};
  border-radius: ${props => props.isFloating ? '4px' : '0.375rem'};
  background-color: ${props => props.isFloating ? 'transparent' : defaultTheme.colors.background.primary};
  color: ${defaultTheme.colors.text.primary};
  transition: all 0.2s ease;
  
  /* Padding based on variant */
  padding: ${props => props.isFloating ? '12px 8px 4px 8px' : defaultTheme.spacing.field.padding};
  
  /* Typography */
  font-size: ${props => props.isFloating ? '16px' : defaultTheme.typography.field.input.fontSize};
  font-weight: ${defaultTheme.typography.field.input.fontWeight};
  line-height: ${defaultTheme.typography.field.input.lineHeight};
  
  /* Default shadow for non-floating variant */
  ${props => !props.isFloating && `
    box-shadow: ${defaultTheme.shadows.field.default};
  `}
  
  &:hover {
    border-color: ${defaultTheme.colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${defaultTheme.colors.primary[500]};
    box-shadow: ${props => props.isFloating 
      ? `0 0 0 2px ${defaultTheme.colors.primary[500]}40`
      : defaultTheme.shadows.field.focus
    };
  }
  
  &:disabled {
    background-color: ${defaultTheme.colors.state.disabled};
    color: ${defaultTheme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${props => props.hasError && `
    border-color: ${defaultTheme.colors.semantic.error};
    box-shadow: ${props.isFloating 
      ? `0 0 0 2px ${defaultTheme.colors.semantic.error}40`
      : defaultTheme.shadows.field.error
    };
  `}
  
  ${props => props.isDirty && `
    background-color: ${defaultTheme.colors.state.dirty};
    border-color: ${defaultTheme.colors.state.dirtyBorder};
  `}
`;

export const SimpleFieldLabel = styled.label<{ 
  required?: boolean; 
  isFloating?: boolean; 
  isActive?: boolean;
  hasError?: boolean;
}>`
  font-size: ${defaultTheme.typography.field.label.fontSize};
  font-weight: ${defaultTheme.typography.field.label.fontWeight};
  line-height: ${defaultTheme.typography.field.label.lineHeight};
  color: ${defaultTheme.colors.text.secondary};
  display: block;
  
  ${props => !props.isFloating && `
    margin-bottom: ${defaultTheme.spacing.xs};
  `}
  
  ${props => props.required && `
    color: ${defaultTheme.colors.text.primary};
  `}
  
  ${props => props.isFloating && `
    position: absolute;
    left: 8px;
    top: 12px;
    font-size: 16px;
    color: ${defaultTheme.colors.text.secondary};
    pointer-events: none;
    transition: all 0.2s ease;
    background: ${defaultTheme.colors.background.primary};
    padding: 0 4px;
  `}
  
  ${props => props.isFloating && props.isActive && `
    top: -8px;
    font-size: 12px;
    color: ${defaultTheme.colors.primary[500]};
    font-weight: 500;
  `}
  
  ${props => props.isFloating && props.hasError && `
    color: ${defaultTheme.colors.semantic.error};
  `}
`;

export const SimpleFieldDescription = styled.div`
  font-size: ${defaultTheme.typography.field.description.fontSize};
  font-weight: ${defaultTheme.typography.field.description.fontWeight};
  line-height: ${defaultTheme.typography.field.description.lineHeight};
  color: ${defaultTheme.colors.text.secondary};
  margin-top: ${defaultTheme.spacing.xs};
`;

export const SimpleFieldError = styled.div`
  font-size: ${defaultTheme.typography.field.error.fontSize};
  font-weight: ${defaultTheme.typography.field.error.fontWeight};
  line-height: ${defaultTheme.typography.field.error.lineHeight};
  color: ${defaultTheme.colors.semantic.error};
  margin-top: ${defaultTheme.spacing.xs};
`;

export const SimpleFieldHelper = styled.div`
  font-size: ${defaultTheme.typography.field.helper.fontSize};
  font-weight: ${defaultTheme.typography.field.helper.fontWeight};
  line-height: ${defaultTheme.typography.field.helper.lineHeight};
  color: ${defaultTheme.colors.text.tertiary};
  margin-top: ${defaultTheme.spacing.xs};
`;

// Select field styled component
export const SimpleFieldSelect = styled.select<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  isFloating?: boolean;
}>`
  width: 100%;
  border: 1px solid ${defaultTheme.colors.border.primary};
  border-radius: ${props => props.isFloating ? '4px' : '0.375rem'};
  background-color: ${props => props.isFloating ? 'white' : defaultTheme.colors.background.primary};
  color: ${defaultTheme.colors.text.primary};
  transition: all 0.2s ease;
  
  /* Padding based on variant */
  padding: ${props => props.isFloating ? '12px 8px 4px 8px' : defaultTheme.spacing.field.padding};
  
  /* Typography */
  font-size: ${props => props.isFloating ? '16px' : defaultTheme.typography.field.input.fontSize};
  font-weight: ${defaultTheme.typography.field.input.fontWeight};
  line-height: ${defaultTheme.typography.field.input.lineHeight};
  
  /* Default shadow for non-floating variant */
  ${props => !props.isFloating && `
    box-shadow: ${defaultTheme.shadows.field.default};
  `}
  
  &:hover {
    border-color: ${defaultTheme.colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${defaultTheme.colors.primary[500]};
    box-shadow: ${props => props.isFloating 
      ? `0 0 0 2px ${defaultTheme.colors.primary[500]}40`
      : defaultTheme.shadows.field.focus
    };
  }
  
  &:disabled {
    background-color: ${defaultTheme.colors.state.disabled};
    color: ${defaultTheme.colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${props => props.hasError && `
    border-color: ${defaultTheme.colors.semantic.error};
    box-shadow: ${props.isFloating 
      ? `0 0 0 2px ${defaultTheme.colors.semantic.error}40`
      : defaultTheme.shadows.field.error
    };
  `}
  
  ${props => props.isDirty && `
    background-color: ${defaultTheme.colors.state.dirty};
    border-color: ${defaultTheme.colors.state.dirtyBorder};
  `}
`;

// Button styled components
export const SimpleButton = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}>`
  padding: ${defaultTheme.spacing.button.padding};
  font-size: ${defaultTheme.typography.button.fontSize};
  font-weight: ${defaultTheme.typography.button.fontWeight};
  line-height: ${defaultTheme.typography.button.lineHeight};
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${defaultTheme.spacing.button.gap};
  box-shadow: ${defaultTheme.shadows.button.default};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Primary variant (default) */
  background-color: ${defaultTheme.colors.primary[500]};
  color: ${defaultTheme.colors.text.inverse};
  
  &:hover:not(:disabled) {
    background-color: ${defaultTheme.colors.primary[600]};
    box-shadow: ${defaultTheme.shadows.button.hover};
  }
  
  &:active {
    background-color: ${defaultTheme.colors.primary[700]};
    box-shadow: ${defaultTheme.shadows.button.active};
  }
  
  /* Secondary variant */
  ${props => props.variant === 'secondary' && `
    background-color: ${defaultTheme.colors.background.primary};
    color: ${defaultTheme.colors.text.primary};
    border-color: ${defaultTheme.colors.border.primary};
    
    &:hover:not(:disabled) {
      background-color: ${defaultTheme.colors.state.hover};
    }
    
    &:active {
      background-color: ${defaultTheme.colors.state.active};
    }
  `}
  
  /* Danger variant */
  ${props => props.variant === 'danger' && `
    background-color: ${defaultTheme.colors.semantic.error};
    color: ${defaultTheme.colors.text.inverse};
    
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
    font-size: ${defaultTheme.typography.fontSize.sm};
  `}
  
  ${props => props.size === 'lg' && `
    padding: 0.75rem 1.5rem;
    font-size: ${defaultTheme.typography.fontSize.base};
  `}
`;

// Array container styled components
export const SimpleArrayContainer = styled.div`
  margin-bottom: ${defaultTheme.spacing.form.section};
`;

export const SimpleArrayItem = styled.div<{ isDirty?: boolean }>`
  margin-bottom: ${defaultTheme.spacing.array.item};
  border: 1px solid ${defaultTheme.colors.border.primary};
  border-radius: 0.5rem;
  background-color: ${defaultTheme.colors.background.primary};
  box-shadow: ${defaultTheme.shadows.card.default};
  
  &:hover {
    box-shadow: ${defaultTheme.shadows.card.hover};
  }
  
  ${props => props.isDirty && `
    background-color: ${defaultTheme.colors.state.dirty};
    border-color: ${defaultTheme.colors.state.dirtyBorder};
  `}
`;

export const SimpleArrayHeader = styled.div<{ hasBottomBorder?: boolean }>`
  padding: ${defaultTheme.spacing.array.header};
  ${props => props.hasBottomBorder && `border-bottom: 1px solid ${defaultTheme.colors.border.primary};`}
  background-color: ${defaultTheme.colors.background.secondary};
  border-radius: 0.5rem 0.5rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    background-color: ${defaultTheme.colors.state.hover};
  }
`;

export const SimpleArrayContent = styled.div`
  padding: ${defaultTheme.spacing.array.content};
`;

// Checkbox wrapper for boolean fields
export const SimpleCheckboxWrapper = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${defaultTheme.spacing.field.gap};
  padding: ${defaultTheme.spacing.sm} 0;
  
  ${props => props.isDirty && `
    background-color: ${defaultTheme.colors.state.dirty};
    border-radius: 4px;
    padding: 4px;
    border: 1px solid ${defaultTheme.colors.state.dirtyBorder};
  `}
`;

export const SimpleCheckboxInput = styled.input`
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: ${defaultTheme.colors.primary[500]};
`;

export const SimpleCheckboxLabel = styled.label<{ required?: boolean }>`
  font-size: ${defaultTheme.typography.field.label.fontSize};
  font-weight: ${defaultTheme.typography.field.label.fontWeight};
  color: ${defaultTheme.colors.text.primary};
  cursor: pointer;
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${defaultTheme.colors.semantic.error};
    }
  `}
`;

// Grid-12 specific checkbox wrapper
export const SimpleGrid12BooleanContainer = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  
  ${props => props.isDirty && `
    background-color: ${defaultTheme.colors.state.dirty};
    border-radius: 4px;
    padding: 4px;
    border: 1px solid ${defaultTheme.colors.state.dirtyBorder};
  `}
`;

export const SimpleGrid12BooleanCheckbox = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: ${defaultTheme.colors.primary[500]};
`;

export const SimpleGrid12BooleanLabel = styled.label<{ required?: boolean }>`
  font-size: 16px;
  color: ${defaultTheme.colors.text.primary};
  cursor: pointer;
  user-select: none;
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${defaultTheme.colors.semantic.error};
    }
  `}
`;

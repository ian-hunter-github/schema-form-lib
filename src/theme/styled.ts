import styled from '@emotion/styled';
import type { Theme } from './themes/default';

// Helper to access theme properties safely
const getTheme = (props: { theme: Theme }) => props.theme;

// Common styled components that can be reused
export const StyledFieldContainer = styled.div<{ hasError?: boolean; isDirty?: boolean }>`
  margin-bottom: ${props => getTheme(props).spacing.form.field};
  position: relative;
`;

export const StyledFieldInput = styled.input<{ hasError?: boolean; isDirty?: boolean }>`
  padding: ${props => getTheme(props).spacing.field.padding};
  font-size: ${props => getTheme(props).typography.field.input.fontSize};
  font-weight: ${props => getTheme(props).typography.field.input.fontWeight};
  line-height: ${props => getTheme(props).typography.field.input.lineHeight};
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: 0.375rem;
  background-color: ${props => getTheme(props).colors.background.primary};
  color: ${props => getTheme(props).colors.text.primary};
  transition: all 0.2s ease;
  box-shadow: ${props => getTheme(props).shadows.field.default};
  width: 100%;
  
  &:hover {
    border-color: ${props => getTheme(props).colors.primary[500]};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => getTheme(props).colors.primary[500]};
    box-shadow: ${props => getTheme(props).shadows.field.focus};
  }
  
  &:disabled {
    background-color: ${props => getTheme(props).colors.state.disabled};
    color: ${props => getTheme(props).colors.text.tertiary};
    cursor: not-allowed;
  }
  
  ${props => props.hasError && `
    border-color: ${getTheme(props).colors.semantic.error};
    box-shadow: ${getTheme(props).shadows.field.error};
  `}
  
  ${props => props.isDirty && `
    background-color: ${getTheme(props).colors.state.dirty};
    border-color: ${getTheme(props).colors.state.dirtyBorder};
  `}
`;

export const StyledFieldLabel = styled.label<{ required?: boolean; floating?: boolean; active?: boolean }>`
  font-size: ${props => getTheme(props).typography.field.label.fontSize};
  font-weight: ${props => getTheme(props).typography.field.label.fontWeight};
  line-height: ${props => getTheme(props).typography.field.label.lineHeight};
  color: ${props => getTheme(props).colors.text.secondary};
  margin-bottom: ${props => getTheme(props).spacing.xs};
  display: block;
  
  ${props => props.required && `
    &::after {
      content: " *";
      color: ${getTheme(props).colors.semantic.error};
    }
  `}
  
  ${props => props.floating && `
    position: absolute;
    top: ${getTheme(props).spacing.field.padding};
    left: ${getTheme(props).spacing.field.padding};
    background: ${getTheme(props).colors.background.primary};
    padding: 0 ${getTheme(props).spacing.xs};
    transition: all 0.2s ease;
    pointer-events: none;
  `}
  
  ${props => props.floating && props.active && `
    top: -0.5rem;
    font-size: ${getTheme(props).typography.field.helper.fontSize};
    color: ${getTheme(props).colors.primary[500]};
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

export const StyledArrayItem = styled.div`
  margin-bottom: ${props => getTheme(props).spacing.array.item};
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: 0.5rem;
  background-color: ${props => getTheme(props).colors.background.primary};
  box-shadow: ${props => getTheme(props).shadows.card.default};
  
  &:hover {
    box-shadow: ${props => getTheme(props).shadows.card.hover};
  }
`;

export const StyledArrayHeader = styled.div`
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

export const StyledCheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => getTheme(props).spacing.field.gap};
  padding: ${props => getTheme(props).spacing.sm} 0;
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

import styled from '@emotion/styled';
import { defaultTheme } from './themes/default';
import type { VariantConfig } from './variants/types';

// Helper to access theme properties safely with type assertion
const getTheme = (props: { theme?: unknown }) => (props.theme || defaultTheme) as typeof defaultTheme;

// Helper to get density styles
const getDensityStyles = (density: VariantConfig['density'], theme: typeof defaultTheme) => {
  return theme.components.density[density || 'normal'];
};

// [Rest of the styled components including StyledFieldContainer, StyledFieldInput, etc...]
// Make sure to include all previously defined styled components that were being imported
// in StringField.tsx (StyledFieldContainer, StyledFieldLabel, StyledFieldDescription,
// StyledFieldError, StyledFieldHelper)

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

import type { SerializedStyles } from '@emotion/react';

export const StyledFieldInput = styled.input<{ 
  hasError?: boolean; 
  isDirty?: boolean;
  density?: VariantConfig['density'];
  variant?: 'default' | 'floating';
  css?: SerializedStyles;
}>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: ${props => getTheme(props).colors.background.primary};
  color: ${props => getTheme(props).colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => getTheme(props).colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => getTheme(props).colors.primary[100]};
  }

  ${props => props.hasError && `
    border-color: ${getTheme(props).colors.semantic.error};
    &:focus {
      box-shadow: 0 0 0 2px ${getTheme(props).colors.semantic.errorLight};
    }
  `}

  ${props => props.isDirty && `
    background-color: rgb(255, 243, 205);
    border-color: rgb(255, 193, 7);
  `}

  ${props => props.variant === 'floating' && `
    padding-top: 18px;
    padding-bottom: 6px;
    &:focus + ${StyledFieldLabel} {
      transform: translateY(-8px) scale(0.85);
      color: ${getTheme(props).colors.primary[500]};
    }
  `}

  &:disabled {
    background-color: ${props => getTheme(props).colors.background.secondary};
    cursor: not-allowed;
  }

  /* Dirty state styles - highest specificity */
  && {
    &[data-dirty="true"],
    &.dirty-field,
    &[style*="background-color: rgb(255, 243, 205)"] {
      background-color: rgb(255, 243, 205) !important;
      border-color: rgb(255, 193, 7) !important;
    }
  }
`;

export const StyledFieldLabel = styled.label<{ 
  required?: boolean; 
  floating?: boolean; 
  active?: boolean;
  hasError?: boolean;
}>`
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: ${props => getTheme(props).colors.text.secondary};
  transition: all 0.2s ease;

  ${props => props.required && `
    &:after {
      content: ' *';
      color: ${getTheme(props).colors.semantic.error};
    }
  `}

  ${props => props.floating && `
    position: absolute;
    top: 0;
    left: 12px;
    transform: translateY(12px);
    pointer-events: none;
    transition: all 0.2s ease;
    font-size: 14px;
    color: ${getTheme(props).colors.text.secondary};
    background-color: ${getTheme(props).colors.background.primary};
    padding: 0 4px;
    z-index: 1;
    margin-bottom: 0;
  `}

  ${props => props.floating && props.active && `
    transform: translateY(-8px) scale(0.85);
    color: ${getTheme(props).colors.primary[500]};
  `}

  ${props => props.hasError && `
    color: ${getTheme(props).colors.semantic.error};
  `}
`;

export const StyledFieldDescription = styled.div`
  /* ... existing StyledFieldDescription styles ... */
`;

export const StyledFieldError = styled.div`
  /* ... existing StyledFieldError styles ... */
`;

export const StyledFieldHelper = styled.div<{ isDirty?: boolean }>`
  /* ... existing StyledFieldHelper styles ... */
`;

export const StyledFieldSelect = styled.select<{
  hasError?: boolean;
  isDirty?: boolean;
  variant?: 'default' | 'floating';
}>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => getTheme(props).colors.border.primary};
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: ${props => getTheme(props).colors.background.primary};
  color: ${props => getTheme(props).colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${props => getTheme(props).colors.primary[500]};
    box-shadow: 0 0 0 2px ${props => getTheme(props).colors.primary[100]};
  }

  ${props => props.hasError && `
    border-color: ${getTheme(props).colors.semantic.error};
    &:focus {
      box-shadow: 0 0 0 2px ${getTheme(props).colors.semantic.errorLight};
    }
  `}

  ${props => props.isDirty && `
    background-color: rgb(255, 243, 205);
    border-color: rgb(255, 193, 7);
  `}

  ${props => props.variant === 'floating' && `
    padding-top: 18px;
    padding-bottom: 6px;
  `}

  &:disabled {
    background-color: ${props => getTheme(props).colors.background.secondary};
    cursor: not-allowed;
  }
`;

// [Include any other styled components that were previously in the file]

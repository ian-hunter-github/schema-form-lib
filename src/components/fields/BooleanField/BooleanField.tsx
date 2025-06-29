import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  StyledFieldContainer,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
  StyledCheckboxWrapper,
  StyledCheckboxInput,
  StyledCheckboxLabel,
  StyledGrid12BooleanContainer,
  StyledGrid12BooleanCheckbox,
  StyledGrid12BooleanLabel,
} from '../../../theme/styled';

export interface BooleanFieldProps {
  field: FormField;
  onChange: (value: boolean, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const BooleanField: React.FC<BooleanFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  
  // Get layout context to determine if we should use grid-12 styling
  const { isGrid12 } = useLayoutContext();
  
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  
  // Grid-12 layout with special boolean styling
  if (isGrid12) {
    return (
      <StyledFieldContainer>
        <StyledGrid12BooleanContainer isDirty={field.hasChanges}>
          <StyledGrid12BooleanCheckbox
            id={fieldId}
            data-testid={fieldId}
            type="checkbox"
            checked={(field.value as boolean) || false}
            disabled={field.schema.readOnly}
            onChange={(e) => onChange(e.target.checked, false)}
            onBlur={(e) => onChange(e.target.checked, true)}
          />
          <StyledGrid12BooleanLabel 
            htmlFor={fieldId} 
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={field.required}
          >
            {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
          </StyledGrid12BooleanLabel>
        </StyledGrid12BooleanContainer>

        {field.schema.description && (
          <StyledFieldDescription 
            id={`${fieldId}-description`} 
            data-testid={`${fieldId}-description`}
          >
            {field.schema.description}
          </StyledFieldDescription>
        )}
        
        {hasErrors && (
          <StyledFieldError 
            id={`${fieldId}-error`} 
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {field.dirty && (
          <StyledFieldHelper 
            id={`${fieldId}-dirty-indicator`} 
            data-testid={`${fieldId}-dirty-indicator`}
          >
            Modified
          </StyledFieldHelper>
        )}
      </StyledFieldContainer>
    );
  }

  // Default layout (non-grid-12)
  return (
    <StyledFieldContainer>
      <StyledCheckboxWrapper isDirty={field.hasChanges}>
        <StyledCheckboxInput
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={(field.value as boolean) || false}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
          onBlur={(e) => onChange(e.target.checked, true)}
        />
        <StyledCheckboxLabel 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          required={field.required}
        >
          {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
        </StyledCheckboxLabel>
      </StyledCheckboxWrapper>

      {field.schema.description && (
        <StyledFieldDescription 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
        >
          {field.schema.description}
        </StyledFieldDescription>
      )}
      
      {hasErrors && (
        <StyledFieldError 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`}
        >
          {errorMessage}
        </StyledFieldError>
      )}
      
      {field.dirty && (
        <StyledFieldHelper 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
        >
          Modified
        </StyledFieldHelper>
      )}
    </StyledFieldContainer>
  );
};

export default BooleanField;

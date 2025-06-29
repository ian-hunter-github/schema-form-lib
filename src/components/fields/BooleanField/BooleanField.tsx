import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  SimpleFieldContainer,
  SimpleFieldDescription,
  SimpleFieldError,
  SimpleFieldHelper,
  SimpleCheckboxWrapper,
  SimpleCheckboxInput,
  SimpleCheckboxLabel,
  SimpleGrid12BooleanContainer,
  SimpleGrid12BooleanCheckbox,
  SimpleGrid12BooleanLabel,
} from '../../../theme/simpleStyled';

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
      <SimpleFieldContainer>
        <SimpleGrid12BooleanContainer isDirty={field.hasChanges}>
          <SimpleGrid12BooleanCheckbox
            id={fieldId}
            data-testid={fieldId}
            type="checkbox"
            checked={(field.value as boolean) || false}
            disabled={field.schema.readOnly}
            onChange={(e) => onChange(e.target.checked, false)}
            onBlur={(e) => onChange(e.target.checked, true)}
          />
          <SimpleGrid12BooleanLabel 
            htmlFor={fieldId} 
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={field.required}
          >
            {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
          </SimpleGrid12BooleanLabel>
        </SimpleGrid12BooleanContainer>

        {field.schema.description && (
          <SimpleFieldDescription 
            id={`${fieldId}-description`} 
            data-testid={`${fieldId}-description`}
          >
            {field.schema.description}
          </SimpleFieldDescription>
        )}
        
        {hasErrors && (
          <SimpleFieldError 
            id={`${fieldId}-error`} 
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </SimpleFieldError>
        )}
        
        {field.dirty && (
          <SimpleFieldHelper 
            id={`${fieldId}-dirty-indicator`} 
            data-testid={`${fieldId}-dirty-indicator`}
          >
            Modified
          </SimpleFieldHelper>
        )}
      </SimpleFieldContainer>
    );
  }

  // Default layout (non-grid-12)
  return (
    <SimpleFieldContainer>
      <SimpleCheckboxWrapper isDirty={field.hasChanges}>
        <SimpleCheckboxInput
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={(field.value as boolean) || false}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
          onBlur={(e) => onChange(e.target.checked, true)}
        />
        <SimpleCheckboxLabel 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          required={field.required}
        >
          {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
        </SimpleCheckboxLabel>
      </SimpleCheckboxWrapper>

      {field.schema.description && (
        <SimpleFieldDescription 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
        >
          {field.schema.description}
        </SimpleFieldDescription>
      )}
      
      {hasErrors && (
        <SimpleFieldError 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`}
        >
          {errorMessage}
        </SimpleFieldError>
      )}
      
      {field.dirty && (
        <SimpleFieldHelper 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
        >
          Modified
        </SimpleFieldHelper>
      )}
    </SimpleFieldContainer>
  );
};

export default BooleanField;

import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  SimpleFieldContainer,
  SimpleFieldInput,
  SimpleFieldLabel,
  SimpleFieldDescription,
  SimpleFieldError,
  SimpleFieldHelper,
} from '../../../theme/simpleStyled';

export interface NumberFieldProps {
  field: FormField;
  onChange: (value: number, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const NumberField: React.FC<NumberFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  const fieldValue = field.value === 0 ? '0' : (field.value as number) || '';
  
  // Get layout context to determine if we should use floating labels
  const { isGrid12 } = useLayoutContext();
  
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  const isFloating = isGrid12;
  const isActive = isFloating && fieldValue !== '';

  return (
    <SimpleFieldContainer
      hasError={hasErrors}
      isDirty={field.hasChanges}
      isFloating={isFloating}
    >
      <SimpleFieldInput
        id={fieldId}
        data-testid={fieldId}
        type="number"
        value={fieldValue}
        disabled={field.schema.readOnly}
        onChange={(e) => onChange(Number(e.target.value), false)}
        onBlur={(e) => onChange(Number(e.target.value), true)}
        placeholder={isFloating ? " " : undefined}
        hasError={hasErrors}
        isDirty={field.hasChanges}
        isFloating={isFloating}
      />
      
      <SimpleFieldLabel
        htmlFor={fieldId}
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        required={field.required}
        isFloating={isFloating}
        isActive={isActive}
        hasError={hasErrors}
      >
        {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </SimpleFieldLabel>

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

export default NumberField;

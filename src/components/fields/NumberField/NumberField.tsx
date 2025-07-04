import React, { memo } from 'react';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  StyledFieldContainer,
  StyledFieldInput,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

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
    <StyledFieldContainer
      hasError={hasErrors}
      isDirty={field.hasChanges}
      layout={isFloating ? 'floating' : 'default'}
    >
      <StyledFieldInput
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
        variant={isFloating ? 'floating' : 'default'}
      />
      
      <StyledFieldLabel
        htmlFor={fieldId}
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        required={field.required}
        floating={isFloating}
        active={isActive}
        hasError={hasErrors}
      >
        {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </StyledFieldLabel>

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

const areEqual = (prevProps: NumberFieldProps, nextProps: NumberFieldProps) => {
  return (
    prevProps.field.value === nextProps.field.value &&
    prevProps.field.errors === nextProps.field.errors &&
    prevProps.field.hasChanges === nextProps.field.hasChanges &&
    prevProps.field.schema === nextProps.field.schema
  );
};

export default memo(NumberField, areEqual);

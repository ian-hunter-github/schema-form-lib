import React from 'react';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  StyledFieldContainer,
  StyledFieldSelect,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

export interface EnumFieldProps {
  field: FormField;
  onChange: (value: string | string[], shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const EnumField: React.FC<EnumFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  
  // Get layout context to determine if we should use floating labels
  const { isGrid12 } = useLayoutContext();

  if (!field.schema.enum) {
    return null;
  }

  const isMultiple = field.schema.type === 'array';
  const selectValue = isMultiple 
    ? Array.isArray(field.value) ? (field.value as string[]).map(String) : []
    : typeof field.value === 'string' || typeof field.value === 'number' 
      ? String(field.value) 
      : '';
      
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  const hasValue = isMultiple ? selectValue.length > 0 : selectValue !== '';
  const isFloating = isGrid12;
  const isActive = isFloating && hasValue;

  return (
    <StyledFieldContainer
      hasError={hasErrors}
      isDirty={field.hasChanges}
      layout={isFloating ? 'floating' : 'default'}
    >
      <StyledFieldSelect
        id={fieldId}
        data-testid={fieldId}
        multiple={isMultiple}
        value={selectValue}
        disabled={field.schema.readOnly}
        autoComplete="off"
        data-lpignore="true"
        onChange={(e) => {
          const newValue = isMultiple 
            ? Array.from(e.target.selectedOptions, option => option.value)
            : e.target.value;
          onChange(newValue, false);
        }}
        onBlur={(e) => {
          const newValue = isMultiple 
            ? Array.from(e.target.selectedOptions, option => option.value)
            : e.target.value;
          onChange(newValue, true);
        }}
        hasError={hasErrors}
        isDirty={field.hasChanges}
        variant={isFloating ? 'floating' : 'default'}
        style={{ minHeight: isMultiple ? '80px' : 'auto' }}
      >
        {!isMultiple && (
          <option value="">{isFloating ? "" : "-- Select an option --"}</option>
        )}
        {field.schema.enum.map((option) => {
          const stringOption = String(option);
          return (
            <option key={stringOption} value={stringOption}>
              {stringOption}
            </option>
          );
        })}
      </StyledFieldSelect>
      
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

export default EnumField;

import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useLayoutContext } from '../../../contexts/LayoutContext';
import {
  SimpleFieldContainer,
  SimpleFieldSelect,
  SimpleFieldLabel,
  SimpleFieldDescription,
  SimpleFieldError,
  SimpleFieldHelper,
} from '../../../theme/simpleStyled';

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
    <SimpleFieldContainer
      hasError={hasErrors}
      isDirty={field.hasChanges}
      isFloating={isFloating}
    >
      <SimpleFieldSelect
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
        isFloating={isFloating}
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
      </SimpleFieldSelect>
      
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

export default EnumField;

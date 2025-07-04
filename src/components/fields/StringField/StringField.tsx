import React, { memo } from 'react';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
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
import { VALIDATION_MESSAGES } from '../../../utils/form/FormValidator/validationMessages';

export interface StringFieldProps {
  field: FormField;
  onChange: (value: string, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const StringField: React.FC<StringFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  const fieldValue = (field.value as string) || '';
  
  // Get layout context
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
        type="text"
        value={fieldValue}
        disabled={field.schema.readOnly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value, false)}
        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value, true)}
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
          style={errorMessage === VALIDATION_MESSAGES.REQUIRED ? {
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: '0'
          } : undefined}
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

const areEqual = (prevProps: StringFieldProps, nextProps: StringFieldProps) => {
  return (
    prevProps.field.value === nextProps.field.value &&
    prevProps.field.errors === nextProps.field.errors &&
    prevProps.field.hasChanges === nextProps.field.hasChanges &&
    prevProps.field.schema === nextProps.field.schema
  );
};

export default memo(StringField, areEqual);

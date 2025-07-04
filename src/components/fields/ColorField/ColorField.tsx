import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
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

export interface ColorFieldProps {
  field: FormField;
  onChange: (value: string, shouldValidate?: boolean) => void;
  formModel?: never; // Explicitly mark as not used
}

const ColorField: React.FC<ColorFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const fieldValue = (field.value as string) || '';
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
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          value={fieldValue || '#000000'}
          onChange={(e) => {
            const val = e.target.value;
            if (val && /^#[0-9a-fA-F]{6}$/.test(val)) {
              onChange(val, false);
            }
          }}
          onBlur={(e) => {
            const val = e.target.value;
            if (val && /^#[0-9a-fA-F]{6}$/.test(val)) {
              onChange(val, true);
            }
          }}
          style={{
            width: '40px',
            height: '40px',
            padding: '2px',
            borderRadius: '4px',
            border: hasErrors ? '1px solid #dc2626' : '1px solid #d1d5db'
          }}
        />
        <SimpleFieldInput
          id={fieldId}
          data-testid={fieldId}
          type="text"
          value={fieldValue || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^#[0-9a-fA-F]{0,6}$/.test(val)) {
              onChange(val, false);
            }
          }}
          onBlur={(e) => {
            let val = e.target.value;
            if (!val) {
              onChange('', true);
            } else {
              if (!val.startsWith('#')) {
                val = `#${val}`;
              }
              if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                onChange(val, true);
              } else {
                onChange('', true);
              }
            }
          }}
          placeholder={isFloating ? " " : undefined}
          hasError={hasErrors}
          isDirty={field.hasChanges}
          isFloating={isFloating}
          style={{ flex: 1 }}
        />
      </div>

      <SimpleFieldLabel
        htmlFor={fieldId}
        required={field.required}
        isFloating={isFloating}
        isActive={isActive}
        hasError={hasErrors}
      >
        {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </SimpleFieldLabel>

      {field.schema.description && (
        <SimpleFieldDescription>
          {field.schema.description}
        </SimpleFieldDescription>
      )}
      
      {hasErrors && (
        <SimpleFieldError>
          {field.errors[0]}
        </SimpleFieldError>
      )}
      
      {field.dirty && (
        <SimpleFieldHelper>
          Modified
        </SimpleFieldHelper>
      )}
    </SimpleFieldContainer>
  );
};

export default ColorField;

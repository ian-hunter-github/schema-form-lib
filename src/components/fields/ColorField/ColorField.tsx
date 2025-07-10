import React from 'react';
import type { FormField } from '../../../types';
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
    <StyledFieldContainer
      hasError={hasErrors}
      isDirty={field.hasChanges}
      layout={isFloating ? 'floating' : 'default'}
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
        <StyledFieldInput
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
          variant={isFloating ? 'floating' : 'default'}
          style={{ flex: 1 }}
        />
      </div>

      <StyledFieldLabel
        htmlFor={fieldId}
        required={field.required}
        floating={isFloating}
        active={isActive}
        hasError={hasErrors}
      >
        {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </StyledFieldLabel>

      {field.schema.description && (
        <StyledFieldDescription>
          {field.schema.description}
        </StyledFieldDescription>
      )}
      
      {hasErrors && (
        <StyledFieldError>
          {field.errors[0]}
        </StyledFieldError>
      )}
      
      {field.dirty && (
        <StyledFieldHelper>
          Modified
        </StyledFieldHelper>
      )}
    </StyledFieldContainer>
  );
};

export default ColorField;

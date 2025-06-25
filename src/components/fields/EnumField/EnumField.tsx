import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';

export interface EnumFieldProps {
  field: FormField;
  onChange: (value: string | string[], triggerValidation?: boolean) => void;
  domContextId?: string;
}

const EnumField: React.FC<EnumFieldProps> = ({ field, onChange, domContextId }) => {
  const fieldId = domContextId ? `${domContextId}.${field.path}` : field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;

  if (!field.schema.enum) {
    return null;
  }

  const isMultiple = field.schema.type === 'array';
  const selectValue = isMultiple 
    ? Array.isArray(field.value) ? (field.value as string[]).map(String) : []
    : typeof field.value === 'string' || typeof field.value === 'number' 
      ? String(field.value) 
      : '';

  return (
    <div className="field-container">
      <select
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
        style={{
          backgroundColor: field.hasChanges ? '#fff3cd' : undefined,
          ...field.hasChanges && { borderColor: '#ffc107' }
        }}
      >
        {!isMultiple && (
          <option value="">-- Select an option --</option>
        )}
        {field.schema.enum.map((option) => {
          const stringOption = String(option);
          return (
            <option key={stringOption} value={stringOption}>
              {stringOption}
            </option>
          );
        })}
      </select>
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        className={field.required ? 'label required' : 'label'}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
      </label>

      {field.schema.description && (
        <div 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
        >
          {field.schema.description}
        </div>
      )}
      
      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={{ color: 'red' }}
        >
          {errorMessage}
        </div>
      )}
      
      {field.dirty && (
        <div 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
          style={{ fontSize: '0.8em', color: '#666' }}
        >
          Modified
        </div>
      )}
    </div>
  );
};

export default EnumField;

import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';

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

  return (
    <div className="field-container">
      <input
        id={fieldId}
        data-testid={fieldId}
        type="number"
        value={field.value === 0 ? '0' : (field.value as number) || ''}
        disabled={field.schema.readOnly}
        onChange={(e) => onChange(Number(e.target.value), false)}
        onBlur={(e) => onChange(Number(e.target.value), true)}
        placeholder=" "
        style={{
          backgroundColor: field.hasChanges ? '#fff3cd' : undefined,
          ...field.hasChanges && { borderColor: '#ffc107' }
        }}
      />
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

export default NumberField;

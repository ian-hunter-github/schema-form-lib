import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';

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

  return (
    <div className="field-container">
      <div className="checkbox-wrapper">
        <input
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={(field.value as boolean) || false}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
          onBlur={(e) => onChange(e.target.checked, true)}
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
      </div>

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

export default BooleanField;

import React from 'react';
import type { FieldProps } from '../../types/schema';
import { capitalizeFirstLetter } from '../../utils/StringUtils';

const NumberField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, domContextId }) => {
  const fieldId = domContextId ? domContextId + '.' + name : name;
  return (
    <div className="field-container">
      <input
        id={fieldId}
        data-testid={fieldId}
        type="number"
        value={value as number}
        disabled={schema.readOnly}
        onChange={(e) => onChange(Number(e.target.value), false)}
        onBlur={(e) => onChange(Number(e.target.value), true)}
        placeholder=" "
      />
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        className={schema.required ? 'label required' : 'label'}
      >
        {capitalizeFirstLetter(schema.title || name)}
      </label>

      {schema.description && (
        <div id={`${fieldId}-description`}>{schema.description}</div>
      )}
      {error && (
        <div id={`${fieldId}-error`} data-testid={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default NumberField;

import React from 'react';
import type { FieldProps } from '../../types/schema';
import { capitalizeFirstLetter } from '../../utils/StringUtils';

const StringField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, parentId }) => {

  const fieldId = parentId ? parentId + '.' + name : name;

  return (
    <div className="field-container">
      <input
        id={fieldId}
        data-testid={fieldId}
        type="text"
        value={value as string}
        disabled={schema.readOnly}
        onChange={(e) => onChange(e.target.value)}
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
        <div id={`${fieldId}-description`} data-testid={`${fieldId}-description`}>{schema.description}</div>
      )}
      {error && (
        <div id={`${fieldId}-error`} data-testid={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default StringField;

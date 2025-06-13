import React from 'react';
import type { FieldProps } from '../../types/schema';

const StringField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, parentId }) => {

  const fieldId = parentId ? parentId + '.' + name : name;

  return (
    <>
      <label htmlFor={fieldId} id={`${fieldId}-label`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div id={`${fieldId}-description`} data-testId={`${fieldId}-description`} >{schema.description}</div>
      )}
      <input
        id={fieldId}
        data-testid={fieldId}
        type="text"
        value={value as string}
        disabled={schema.readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <div id={`${fieldId}-error`} data-testId={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </>
  );
};

export default StringField;

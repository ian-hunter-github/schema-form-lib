import React from 'react';
import type { JSONSchema } from '../../types/schema';

interface DemoBooleanFieldProps {
  schema: JSONSchema;
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export const DemoBooleanField: React.FC<DemoBooleanFieldProps> = ({ 
  schema,
  value = false,
  onChange
}) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        {schema.title || 'Checkbox'}
        {schema.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {schema.description && (
        <small style={{ display: 'block', marginTop: '0.25rem' }}>
          {schema.description}
        </small>
      )}
    </div>
  );
};

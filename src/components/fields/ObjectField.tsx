import React, { useState } from 'react';
import type { FieldProps, FormValue } from '../../types/schema';
import FieldRenderer from '../FieldRenderer';

const ObjectField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, depth = 0, testIdPrefix }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const objectValue = value as Record<string, FormValue> || {};

  if (!schema.properties) {
    return <div>Error: Object field missing properties</div>;
  }

  const handleFieldChange = (fieldName: string, fieldValue: FormValue) => {
    onChange({
      ...objectValue,
      [fieldName]: fieldValue
    });
  };

  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      {depth > 0 && (
        <button 
          type="button"
          data-testid={`${testIdPrefix || name}-accordion`}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {isExpanded ? '▼' : '▶'} {schema.title || name}
        </button>
      )}
      {isExpanded && (
        <div style={{ borderLeft: depth > 0 ? '1px solid #ccc' : 'none', paddingLeft: '8px' }}>
          {Object.entries(schema.properties).map(([key, fieldSchema]) => (
            <FieldRenderer
              key={key}
              name={key}
              value={objectValue[key]}
              schema={fieldSchema}
              onChange={(val) => handleFieldChange(key, val)}
              error={error}
              depth={depth + 1}
              testIdPrefix={testIdPrefix ? `${testIdPrefix}.${key}` : key}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectField;

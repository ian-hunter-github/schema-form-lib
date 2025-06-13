import React, { useState } from 'react';
import type { FieldProps, FormValue } from '../../types/schema';
import FieldRenderer from '../FieldRenderer';

const ObjectField: React.FC<FieldProps> = ({ name, value, schema, onChange, error, depth = 0, parentId }) => {
  console.debug('ObjectField props:', { name, parentId });
  const [isExpanded, setIsExpanded] = useState(false);
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

  const thisId = parentId ? `${parentId}.${name}` : name;

  return (
    <div id={thisId} data-testid={thisId} style={{ marginLeft: `${depth * 16}px` }}>
      <button 
        type="button"
        id={`${thisId}-accordion`}
        data-testid={`${thisId}-accordion`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isExpanded ? '▼' : '▶'} {schema.title || name}
      </button>
      {isExpanded && (
        <div style={{ borderLeft: depth > 0 ? '1px solid #ccc' : 'none', paddingLeft: '8px' }}>
          {Object.entries(schema.properties).map(([key, fieldSchema]) => {
            console.debug('Rendering property:', { key, parentId}); //, fieldSchema}); //, value: objectValue[key] });
            return (
              <FieldRenderer
                key={key}
                name={key}
                value={objectValue[key]}
                schema={fieldSchema}
                onChange={(val) => handleFieldChange(key, val)}
                error={error}
                depth={depth + 1}
                parentId={thisId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ObjectField;

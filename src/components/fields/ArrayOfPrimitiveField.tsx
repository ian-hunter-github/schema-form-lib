import React, { useState } from 'react';
import type { FieldProps } from '../../types/schema';

const ArrayOfPrimitiveField: React.FC<FieldProps> = ({ name, value = [], schema, onChange, error, parentId }) => {

  const fieldId = parentId ? parentId + "." + name : name;
  
  const [items, setItems] = useState<string[]>(
    Array.isArray(value) ? value.map(String) : []
  );

  const handleAddItem = () => {
    const newItems = [...items, ''];
    setItems(newItems);
    onChange(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemChange = (index: number, newValue: string) => {
    const newItems = [...items];
    newItems[index] = newValue;
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div id={fieldId} data-testid={fieldId}>
      <label htmlFor={`${fieldId}`} id={`${fieldId}-label`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div id={`${fieldId}-description`}>{schema.description}</div>
      )}
      {items.map((item, index) => (
        <div key={index}>
          <input
            id={`${fieldId}.${index}`}
            data-testid={`${fieldId}.${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={schema.readOnly}
          />
          <button
            id={`${fieldId}.${index}-remove`}
            data-testid={`${fieldId}.${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        id={`${fieldId}-add`}
        data-testid={`${fieldId}-add`}
        type="button"
        onClick={handleAddItem}
      >
        Add Item
      </button>
      {error && (
        <div id={`${fieldId}-error`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ArrayOfPrimitiveField;

import React, { useState } from 'react';
import type { FieldProps } from '../../types/schema';

const ArrayOfPrimitiveField: React.FC<FieldProps> = ({ name, value = [], schema, onChange, error }) => {
  const [items, setItems] = useState<string[]>(Array.isArray(value) ? value : []);

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
    <div>
      <label htmlFor={`${name}-0`} data-testid={`label-${name}`}>
        {schema.title || name}
      </label>
      {schema.description && (
        <div data-testid={`description-${name}`}>{schema.description}</div>
      )}
      {items.map((item, index) => (
        <div key={index}>
          <input
            data-testid={`${name}-${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            disabled={schema.readOnly}
          />
          <button
            data-testid={`${name}-${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        data-testid={`add-${name}`}
        type="button"
        onClick={handleAddItem}
      >
        Add Item
      </button>
      {error && (
        <div data-testid={`error-${name}`} style={{ color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ArrayOfPrimitiveField;

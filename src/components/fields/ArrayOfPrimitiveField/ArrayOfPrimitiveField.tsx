import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import {
  SimpleArrayContainer,
  SimpleFieldLabel,
  SimpleFieldDescription,
  SimpleFieldInput,
  SimpleButton,
  SimpleFieldError,
  SimpleFieldHelper,
} from '../../../theme/simpleStyled';

export interface ArrayOfPrimitiveFieldProps {
  field: FormField;
  onChange: (value: string[], shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const ArrayOfPrimitiveField: React.FC<ArrayOfPrimitiveFieldProps> = ({ field, formModel }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;

  // Get items directly from FormModel
  const items = Array.isArray(field.value) ? (field.value as string[]).map(String) : [];

  const handleAddItem = () => {
    formModel.addValue(field.path, '');
  };

  const handleRemoveItem = (index: number) => {
    const elementPath = `${field.path}.${index}`;
    formModel.deleteValue(elementPath);
  };

  const handleItemChange = (index: number, newValue: string) => {
    const elementPath = `${field.path}.${index}`;
    formModel.setValue(elementPath, newValue);
  };

  const handleItemBlur = (index: number, newValue: string) => {
    const elementPath = `${field.path}.${index}`;
    formModel.setValue(elementPath, newValue);
    formModel.validate();
  };

  return (
    <SimpleArrayContainer id={fieldId} data-testid={fieldId}>
      <SimpleFieldLabel 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        required={field.required}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
      </SimpleFieldLabel>

      {field.schema.description && (
        <SimpleFieldDescription 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
        >
          {field.schema.description}
        </SimpleFieldDescription>
      )}

      {items.map((item, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '0.75rem' 
        }}>
          <SimpleFieldInput
            id={`${fieldId}.${index}`}
            data-testid={`${fieldId}.${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            onBlur={(e) => handleItemBlur(index, e.target.value)}
            disabled={field.schema.readOnly}
            isDirty={field.hasChanges}
            style={{ flex: 1 }}
          />
          <SimpleButton
            id={`${fieldId}.${index}-remove`}
            data-testid={`${fieldId}.${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={field.schema.readOnly}
            variant="danger"
            size="sm"
          >
            Remove
          </SimpleButton>
        </div>
      ))}

      <SimpleButton
        id={`${fieldId}-add`}
        data-testid={`${fieldId}-add`}
        type="button"
        onClick={handleAddItem}
        disabled={field.schema.readOnly}
        variant="primary"
        style={{ marginTop: '0.5rem' }}
      >
        Add Item
      </SimpleButton>

      {hasErrors && (
        <SimpleFieldError 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`}
        >
          {errorMessage}
        </SimpleFieldError>
      )}
      
      {field.dirty && (
        <SimpleFieldHelper 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
        >
          Modified
        </SimpleFieldHelper>
      )}
    </SimpleArrayContainer>
  );
};

export default ArrayOfPrimitiveField;

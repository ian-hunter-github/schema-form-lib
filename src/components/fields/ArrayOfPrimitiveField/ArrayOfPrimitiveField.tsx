import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';

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
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);

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
    <div id={fieldId} data-testid={fieldId} style={styles.arrayContainer}>
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        style={styles.fieldLabel}
      >
        {capitalizeFirstLetter(field.schema.title || displayName)}
        {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
      </label>

      {field.schema.description && (
        <div 
          id={`${fieldId}-description`} 
          data-testid={`${fieldId}-description`}
          style={styles.fieldDescription}
        >
          {field.schema.description}
        </div>
      )}

      {items.map((item, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          gap: spacing.field.gap, 
          marginBottom: spacing.array.item 
        }}>
          <input
            id={`${fieldId}.${index}`}
            data-testid={`${fieldId}.${index}`}
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            onBlur={(e) => handleItemBlur(index, e.target.value)}
            disabled={field.schema.readOnly}
            style={mergeStyles(
              styles.fieldInput,
              conditionalStyle(field.hasChanges, styles.fieldInputDirty),
              { flex: 1 }
            )}
          />
          <button
            id={`${fieldId}.${index}-remove`}
            data-testid={`${fieldId}.${index}-remove`}
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={field.schema.readOnly}
            style={mergeStyles(
              styles.button,
              styles.buttonDanger,
              { fontSize: typography.field.helper.fontSize }
            )}
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
        disabled={field.schema.readOnly}
        style={mergeStyles(
          styles.button,
          styles.buttonPrimary,
          { marginTop: spacing.sm }
        )}
      >
        Add Item
      </button>

      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={mergeStyles(styles.fieldError, { marginTop: spacing.xs })}
        >
          {errorMessage}
        </div>
      )}
      
      {field.dirty && (
        <div 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
          style={mergeStyles(styles.fieldHelper, { marginTop: spacing.xs })}
        >
          Modified
        </div>
      )}
    </div>
  );
};

export default ArrayOfPrimitiveField;

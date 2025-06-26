import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';
import { useLayoutContext } from '../../../contexts/LayoutContext';

export interface StringFieldProps {
  field: FormField;
  onChange: (value: string, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const StringField: React.FC<StringFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  const fieldValue = (field.value as string) || '';
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);
  
  // Get layout context to determine if we should use floating labels
  const { isGrid12 } = useLayoutContext();
  
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  
  // Grid-12 layout with floating labels
  if (isGrid12) {
    const inputClassName = `floating-label-input${hasErrors ? ' has-error' : ''}${field.hasChanges ? ' has-changes' : ''}`;
    const labelClassName = `floating-label${fieldValue ? ' active' : ''}`;
    
    return (
      <div className="floating-label-container">
        <input
          id={fieldId}
          data-testid={fieldId}
          type="text"
          value={fieldValue}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.value, false)}
          onBlur={(e) => onChange(e.target.value, true)}
          placeholder=" "
          className={inputClassName}
        />
        <label 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          className={labelClassName}
        >
          {fieldTitle}
          {field.required && <span style={{ color: '#dc3545' }}> *</span>}
        </label>

        {field.schema.description && (
          <div 
            id={`${fieldId}-description`} 
            data-testid={`${fieldId}-description`}
            className="field-description"
          >
            {field.schema.description}
          </div>
        )}
        
        {hasErrors && (
          <div 
            id={`${fieldId}-error`} 
            data-testid={`${fieldId}-error`} 
            className="field-error"
          >
            {errorMessage}
          </div>
        )}
        
        {field.dirty && (
          <div 
            id={`${fieldId}-dirty-indicator`} 
            data-testid={`${fieldId}-dirty-indicator`}
            className="field-description"
            style={{ color: '#007bff', fontWeight: 'bold' }}
          >
            Modified
          </div>
        )}
      </div>
    );
  }

  // Default layout (non-grid-12)
  return (
    <div style={styles.fieldContainer}>
      <input
        id={fieldId}
        data-testid={fieldId}
        type="text"
        value={fieldValue}
        disabled={field.schema.readOnly}
        onChange={(e) => onChange(e.target.value, false)}
        onBlur={(e) => onChange(e.target.value, true)}
        placeholder=" "
        style={mergeStyles(
          styles.fieldInput,
          conditionalStyle(hasErrors, styles.fieldInputError),
          conditionalStyle(field.hasChanges, styles.fieldInputDirty)
        )}
      />
      <label 
        htmlFor={fieldId} 
        id={`${fieldId}-label`}
        data-testid={`${fieldId}-label`}
        style={styles.fieldLabel}
      >
        {fieldTitle}
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
      
      {hasErrors && (
        <div 
          id={`${fieldId}-error`} 
          data-testid={`${fieldId}-error`} 
          style={styles.fieldError}
        >
          {errorMessage}
        </div>
      )}
      
      {field.dirty && (
        <div 
          id={`${fieldId}-dirty-indicator`} 
          data-testid={`${fieldId}-dirty-indicator`}
          style={styles.fieldHelper}
        >
          Modified
        </div>
      )}
    </div>
  );
};

export default StringField;

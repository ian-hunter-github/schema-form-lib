import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';
import { useLayoutContext } from '../../../contexts/LayoutContext';

export interface BooleanFieldProps {
  field: FormField;
  onChange: (value: boolean, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const BooleanField: React.FC<BooleanFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);
  
  // Get layout context to determine if we should use grid-12 styling
  const { isGrid12 } = useLayoutContext();
  
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  
  // Grid-12 layout with special boolean styling
  if (isGrid12) {
    const containerClassName = `boolean-field-container${field.hasChanges ? ' has-changes' : ''}`;
    
    return (
      <div className={containerClassName}>
        <input
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={(field.value as boolean) || false}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
          onBlur={(e) => onChange(e.target.checked, true)}
          className="boolean-field-checkbox"
        />
        <label 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          className="boolean-field-label"
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
      <div style={mergeStyles(
        styles.checkboxWrapper,
        conditionalStyle(field.hasChanges, { backgroundColor: colors.state.dirty })
      )}>
        <input
          id={fieldId}
          data-testid={fieldId}
          type="checkbox"
          checked={(field.value as boolean) || false}
          disabled={field.schema.readOnly}
          onChange={(e) => onChange(e.target.checked, false)}
          onBlur={(e) => onChange(e.target.checked, true)}
          style={styles.checkboxInput}
        />
        <label 
          htmlFor={fieldId} 
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          style={styles.checkboxLabel}
        >
          {fieldTitle}
          {field.required && <span style={{ color: colors.semantic.error }}> *</span>}
        </label>
      </div>

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

export default BooleanField;

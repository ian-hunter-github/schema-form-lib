import React from 'react';
import type { FormField } from '../../../utils/formModel/types';
import type { FormModel } from '../../../utils/formModel/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import { useThemeTokens, useVariants } from '../../../theme';
import { createStyles, mergeStyles, conditionalStyle } from '../../../theme/utils';
import { useLayoutContext } from '../../../contexts/LayoutContext';

export interface EnumFieldProps {
  field: FormField;
  onChange: (value: string | string[], shouldValidate?: boolean) => void;
  formModel: FormModel;
}

const EnumField: React.FC<EnumFieldProps> = ({ field, onChange }) => {
  const fieldId = field.path;
  const displayName = field.path.split('.').pop() || field.path;
  const hasErrors = field.errors.length > 0;
  const errorMessage = hasErrors ? field.errors[0] : undefined;
  
  // Get theme tokens and variants
  const { colors, spacing, typography, shadows, components } = useThemeTokens();
  const { variants } = useVariants();
  const styles = createStyles({ colors, spacing, typography, shadows, components, name: 'default', overrides: {} }, variants);
  
  // Get layout context to determine if we should use floating labels
  const { isGrid12 } = useLayoutContext();

  if (!field.schema.enum) {
    return null;
  }

  const isMultiple = field.schema.type === 'array';
  const selectValue = isMultiple 
    ? Array.isArray(field.value) ? (field.value as string[]).map(String) : []
    : typeof field.value === 'string' || typeof field.value === 'number' 
      ? String(field.value) 
      : '';
      
  const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
  const hasValue = isMultiple ? selectValue.length > 0 : selectValue !== '';

  // Grid-12 layout with floating labels
  if (isGrid12) {
    const selectClassName = `floating-label-select${hasErrors ? ' has-error' : ''}${field.hasChanges ? ' has-changes' : ''}`;
    const labelClassName = `floating-label${hasValue ? ' active' : ''}`;
    
    return (
      <div className="floating-label-container">
        <select
          id={fieldId}
          data-testid={fieldId}
          multiple={isMultiple}
          value={selectValue}
          disabled={field.schema.readOnly}
          autoComplete="off"
          data-lpignore="true"
          onChange={(e) => {
            const newValue = isMultiple 
              ? Array.from(e.target.selectedOptions, option => option.value)
              : e.target.value;
            onChange(newValue, false);
          }}
          onBlur={(e) => {
            const newValue = isMultiple 
              ? Array.from(e.target.selectedOptions, option => option.value)
              : e.target.value;
            onChange(newValue, true);
          }}
          className={selectClassName}
          style={{ minHeight: isMultiple ? '80px' : 'auto' }}
        >
          {!isMultiple && (
            <option value=""></option>
          )}
          {field.schema.enum.map((option) => {
            const stringOption = String(option);
            return (
              <option key={stringOption} value={stringOption}>
                {stringOption}
              </option>
            );
          })}
        </select>
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
      <select
        id={fieldId}
        data-testid={fieldId}
        multiple={isMultiple}
        value={selectValue}
        disabled={field.schema.readOnly}
        autoComplete="off"
        data-lpignore="true"
        onChange={(e) => {
          const newValue = isMultiple 
            ? Array.from(e.target.selectedOptions, option => option.value)
            : e.target.value;
          onChange(newValue, false);
        }}
        onBlur={(e) => {
          const newValue = isMultiple 
            ? Array.from(e.target.selectedOptions, option => option.value)
            : e.target.value;
          onChange(newValue, true);
        }}
        style={mergeStyles(
          styles.fieldInput,
          conditionalStyle(hasErrors, styles.fieldInputError),
          conditionalStyle(field.hasChanges, styles.fieldInputDirty),
          { minHeight: isMultiple ? '80px' : 'auto' }
        )}
      >
        {!isMultiple && (
          <option value="">-- Select an option --</option>
        )}
        {field.schema.enum.map((option) => {
          const stringOption = String(option);
          return (
            <option key={stringOption} value={stringOption}>
              {stringOption}
            </option>
          );
        })}
      </select>
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

export default EnumField;

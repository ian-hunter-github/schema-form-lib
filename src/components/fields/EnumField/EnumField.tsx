import React from 'react';
import { BaseField } from '../BaseField';
import type { BaseFieldProps } from '../BaseField';
import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import {
  StyledFieldContainer,
  StyledFieldSelect,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
} from '../../../theme/styled';

export interface EnumFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
  isGrid12?: boolean;
  /** Whether to show field descriptions (default: true) */
  showDescriptions?: boolean;
}

export class EnumField extends BaseField<EnumFieldProps> {
  private selectRef = React.createRef<HTMLSelectElement>();
  private isDirtyState = false;

  componentDidUpdate() {
    const isDirty = this.isDirty();
    if (this.selectRef.current) {
      this.selectRef.current.dataset.dirty = String(isDirty);
    }
    this.isDirtyState = isDirty;
  }

  isDirty() {
    return super.isDirty() || this.isDirtyState;
  }

  render() {
    const { field } = this.props;
    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = field.errors.length > 0;
    const errorMessage = hasErrors ? field.errors[0] : undefined;
    
    if (!field.schema.enum) {
      return null;
    }

    const isMultiple = field.schema.type === 'array';
    const selectValue = isMultiple 
      ? Array.isArray(this.currentValue) ? (this.currentValue as string[]).map(String) : []
      : typeof this.currentValue === 'string' || typeof this.currentValue === 'number' 
        ? String(this.currentValue) 
        : '';
        
    const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
    const hasValue = isMultiple ? selectValue.length > 0 : selectValue !== '';
    const isFloating = true;
    const isActive = hasValue;
    const isDirty = this.isDirty();

    return (
      <StyledFieldContainer
        hasError={hasErrors}
        isDirty={isDirty}
        layout={isFloating ? 'floating' : 'default'}
      >
        <StyledFieldSelect
          ref={this.selectRef}
          id={fieldId}
          data-testid={fieldId}
          multiple={isMultiple}
          value={selectValue}
          disabled={field.schema.readOnly}
          autoComplete="off"
          data-lpignore="true"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue = isMultiple 
              ? Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
              : e.target.value;
            this.setValue(newValue);
            this.isDirtyState = true;
            this.props.onChange?.(newValue, false);
          }}
          onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
            const newValue = isMultiple 
              ? Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)
              : e.target.value;
            this.validate();
            this.props.onChange?.(newValue, true);
          }}
          hasError={hasErrors}
          isDirty={isDirty}
          variant="floating"
          style={{ minHeight: isMultiple ? '80px' : 'auto', paddingTop: isFloating ? '18px' : '8px' }}
        >
          {!isMultiple && <option value=""></option>}
          {field.schema.enum.map((option) => {
            const stringOption = String(option);
            return (
              <option key={stringOption} value={stringOption}>
                {stringOption}
              </option>
            );
          })}
        </StyledFieldSelect>
        
        <StyledFieldLabel
          htmlFor={fieldId}
          id={`${fieldId}-label`}
          data-testid={`${fieldId}-label`}
          required={field.required}
          floating={isFloating}
          active={isActive}
          hasError={hasErrors}
        >
          {fieldTitle}
        </StyledFieldLabel>

        {field.schema.description && this.props.showDescriptions !== false && (
          <StyledFieldDescription
            id={`${fieldId}-description`}
            data-testid={`${fieldId}-description`}
          >
            {field.schema.description}
          </StyledFieldDescription>
        )}
        
        {hasErrors && (
          <StyledFieldError
            id={`${fieldId}-error`}
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {field.dirty && !hasErrors && (
          <div
            id={`${fieldId}-dirty-indicator`}
            data-testid={`${fieldId}-dirty-indicator`}
            style={{
              display: 'block',
              color: '#666',
              fontSize: '0.875rem',
              marginTop: '0.25rem',
              padding: '0.25rem',
              backgroundColor: '#f8f9fa',
              borderLeft: '3px solid #6c757d'
            }}
          >
            Modified
          </div>
        )}
      </StyledFieldContainer>
    );
  }
}

export default EnumField;

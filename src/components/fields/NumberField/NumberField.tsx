import React from 'react';
import { BaseField } from '../BaseField';
import type { BaseFieldProps } from '../BaseField';
import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import {
  StyledFieldContainer,
  StyledFieldInput,
  StyledFieldLabel,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';
import { VALIDATION_MESSAGES } from '../../../utils/form/FormValidator/validationMessages';

export interface NumberFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
  className?: string;
}

export class NumberField extends BaseField<NumberFieldProps> {
  private inputRef = React.createRef<HTMLInputElement>();

  componentDidUpdate() {
    if (this.inputRef.current) {
      this.inputRef.current.dataset.dirty = String(this.isDirty());
    }
  }

  protected validate(): void {
    this.errors = [];
    const value = this.currentValue as number;
    const { field } = this.props;

    if (field.required && (value === null || value === undefined || isNaN(value))) {
      this.errors.push(VALIDATION_MESSAGES.REQUIRED);
    }
    
    // Add custom validation from field schema
    if (field.schema.validationMessage) {
      this.errors.push(field.schema.validationMessage);
    }

    // Ensure UI updates with errors and dirty state
    this.forceUpdate();
  }

  render() {
    const { field, className } = this.props;
    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = this.errors.length > 0;
    const errorMessage = hasErrors ? this.errors[0] : undefined;
    const fieldValue = this.currentValue === 0 ? '0' : (this.currentValue as number) || '';
    const isDirty = this.isDirty();
    const showError = hasErrors && this.props.formModel?.shouldShowErrors();
    const showDirty = isDirty && this.props.formModel?.shouldShowDirty();
    
    const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);
    const isFloating = true;
    const isActive = fieldValue !== '';

    return (
      <StyledFieldContainer
        hasError={hasErrors}
        isDirty={isDirty}
        layout={isFloating ? 'floating' : 'default'}
        data-testid={`${fieldId}-container`}
      >
        <StyledFieldInput
          ref={this.inputRef}
          id={fieldId}
          data-testid={fieldId}
          type="number"
          value={fieldValue}
          disabled={field.schema.readOnly}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            let numValue: number;
            if (e.target.value === '') {
              numValue = 0;
            } else {
              // Explicitly check for invalid input
              numValue = isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
            }
            this.setValue(numValue);
            this.props.onChange?.(numValue, false);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            const numValue = e.target.value === '' ? 0 : Number(e.target.value);
            const prevValue = this.currentValue;
            this.setValue(numValue);
            this.validate();
            // Trigger validation on blur if value changed
            if (prevValue !== numValue) {
              this.props.onChange?.(numValue, true);
            }
          }}
          placeholder=" "
          hasError={hasErrors}
          variant="floating"
          className={`${className || ''}`}
          data-dirty={isDirty}
          style={isDirty ? {
            backgroundColor: 'rgb(255, 243, 205)',
            borderColor: 'rgb(255, 193, 7)',
            position: 'relative',
            zIndex: 1
          } : {}}
        />
        
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

        {field.schema.description && (
          <StyledFieldDescription
            id={`${fieldId}-description`}
            data-testid={`${fieldId}-description`}
          >
            {field.schema.description}
          </StyledFieldDescription>
        )}
        
        {showError && (
          <StyledFieldError
            id={`${fieldId}-error`}
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {showDirty && (
          <StyledFieldHelper
            id={`${fieldId}-dirty-indicator`}
            data-testid={`${fieldId}-dirty-indicator`}
            isDirty={isDirty}
          >
            Modified
          </StyledFieldHelper>
        )}
      </StyledFieldContainer>
    );
  }
}

export default NumberField;

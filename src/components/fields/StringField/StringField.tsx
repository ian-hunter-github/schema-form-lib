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

export interface StringFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
  className?: string;
}

export class StringField extends BaseField<StringFieldProps> {
  private inputRef = React.createRef<HTMLInputElement>();

  public isDirty(): boolean {
    return this.props.field.dirty;
  }

  componentDidUpdate(prevProps: StringFieldProps) {
    const isDirty = this.isDirty();
    if (this.inputRef.current) {
      this.inputRef.current.dataset.dirty = String(isDirty);
    }
    // Force update if dirty state changed
    if (isDirty !== prevProps.field.dirty) {
      this.forceUpdate();
    }
  }

  render() {
    const { field, className } = this.props;
    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = field.errors.length > 0;
    const errorMessage = hasErrors ? field.errors[0] : undefined;
    const fieldValue = (this.currentValue as string) || '';
    const isDirty = this.isDirty();
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
          type="text"
          value={fieldValue}
          disabled={field.schema.readOnly}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setValue(e.target.value);
            this.props.field.dirty = true;
            this.forceUpdate();
            this.props.onChange?.(e.target.value, false);
          }}
          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
            this.setValue(e.target.value);
            this.validate();
            this.props.onChange?.(e.target.value, true);
            if (this.props.formModel) {
              this.props.formModel.validate();
            }
          }}
          placeholder=" "
          hasError={hasErrors}
          variant="floating"
          className={`${className || ''}`}
          data-dirty={isDirty}
          required={field.required || undefined}
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
        
        {hasErrors && (
          <StyledFieldError
            id={`${fieldId}-error`}
            data-testid={`${fieldId}-error`}
            style={errorMessage === VALIDATION_MESSAGES.REQUIRED ? {
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: '0',
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: '0'
            } : undefined}
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {isDirty && (
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

export default StringField;

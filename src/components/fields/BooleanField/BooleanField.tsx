import React from 'react';
import styled from '@emotion/styled';
import { BaseField } from '../BaseField';
import type { BaseFieldProps } from '../BaseField';
import type { JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import type { FormModel } from '../../../utils/form/FormModel';
import { capitalizeFirstLetter } from '../../../utils/StringUtils';
import {
  StyledFieldContainer,
  StyledFieldDescription,
  StyledFieldError,
  StyledFieldHelper,
} from '../../../theme/styled';

// Boolean field specific styled components
const StyledCheckboxWrapper = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
`;

const StyledCheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
`;

const StyledCheckboxLabel = styled.label<{ required?: boolean }>`
  font-size: 14px;
  cursor: pointer;
  ${props => props.required && `
    &::after {
      content: ' *';
      color: #dc2626;
    }
  `}
`;

const StyledGrid12BooleanContainer = styled.div<{ isDirty?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
`;

const StyledGrid12BooleanCheckbox = styled.input`
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
`;

const StyledGrid12BooleanLabel = styled.label<{ required?: boolean }>`
  font-size: 14px;
  cursor: pointer;
  ${props => props.required && `
    &::after {
      content: ' *';
      color: #dc2626;
    }
  `}
`;

export interface BooleanFieldProps extends BaseFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

export class BooleanField extends BaseField<BooleanFieldProps> {
  private inputRef = React.createRef<HTMLInputElement>();

  public isDirty(): boolean {
    return this.props.field.dirty;
  }

  componentDidUpdate(prevProps: BooleanFieldProps) {
    const isDirty = this.isDirty();
    if (this.inputRef.current) {
      this.inputRef.current.dataset.dirty = String(isDirty);
    }
    if (isDirty !== prevProps.field.dirty) {
      this.forceUpdate();
    }
  }

  render() {
    const { field } = this.props;
    const fieldId = field.path;
    const displayName = field.path.split('.').pop() || field.path;
    const hasErrors = field.errors.length > 0;
    const errorMessage = hasErrors ? field.errors[0] : undefined;
    const fieldValue = (this.currentValue as boolean) || false;
    const isDirty = this.isDirty();
    const isGrid12 = this.props.formModel?.layoutContext?.isGrid12 || false;
    const fieldTitle = capitalizeFirstLetter(field.schema.title || displayName);

    // Grid-12 layout with special boolean styling
    if (isGrid12) {
      return (
        <StyledFieldContainer
          hasError={hasErrors}
          isDirty={isDirty}
          data-testid={`${fieldId}-container`}
        >
          <StyledGrid12BooleanContainer isDirty={isDirty}>
            <StyledGrid12BooleanCheckbox
              ref={this.inputRef}
              id={fieldId}
              data-testid={fieldId}
              type="checkbox"
              checked={fieldValue}
              disabled={field.schema.readOnly}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newValue = e.target.checked;
              this.setValue(newValue);
              this.props.field.dirty = true;
              this.forceUpdate();
              this.props.onChange?.(newValue, false);
            }}
            onBlur={() => {
              this.validate();
              // Don't change the value on blur, just validate
              this.props.onChange?.(this.props.field.value as boolean, true);
            }}
            />
            <StyledGrid12BooleanLabel 
              htmlFor={fieldId} 
              id={`${fieldId}-label`}
              data-testid={`${fieldId}-label`}
              required={field.required}
            >
              {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
            </StyledGrid12BooleanLabel>
          </StyledGrid12BooleanContainer>

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
            >
              {errorMessage}
            </StyledFieldError>
          )}
          
          {isDirty && (
            <StyledFieldHelper 
              id={`${fieldId}-dirty-indicator`} 
              data-testid={`${fieldId}-dirty-indicator`}
            >
              Modified
            </StyledFieldHelper>
          )}
        </StyledFieldContainer>
      );
    }

    // Default layout (non-grid-12)
    return (
      <StyledFieldContainer
        hasError={hasErrors}
        isDirty={isDirty}
        data-testid={`${fieldId}-container`}
      >
        <StyledCheckboxWrapper isDirty={isDirty}>
          <StyledCheckboxInput
            ref={this.inputRef}
            id={fieldId}
            data-testid={fieldId}
            type="checkbox"
            checked={fieldValue}
            disabled={field.schema.readOnly}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newValue = e.target.checked;
              this.setValue(newValue);
              this.props.field.dirty = true;
              this.forceUpdate();
              this.props.onChange?.(newValue, false);
            }}
            onBlur={() => {
              this.validate();
              // Don't change the value on blur, just validate
              this.props.onChange?.(this.props.field.value as boolean, true);
            }}
          />
          <StyledCheckboxLabel 
            htmlFor={fieldId} 
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={field.required}
          >
            {fieldTitle}{field.required && <span style={{ color: '#dc2626' }}> *</span>}
          </StyledCheckboxLabel>
        </StyledCheckboxWrapper>

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
          >
            {errorMessage}
          </StyledFieldError>
        )}
        
        {isDirty && (
          <StyledFieldHelper 
            id={`${fieldId}-dirty-indicator`} 
            data-testid={`${fieldId}-dirty-indicator`}
          >
            Modified
          </StyledFieldHelper>
        )}
      </StyledFieldContainer>
    );
  }
}

export default BooleanField;

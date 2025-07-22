import React from "react";
import { capitalizeFirstLetter } from "../../../utils/StringUtils";
import type { JSONValue } from "../../../types/schema";
import type { FormField } from "../../../types/fields";
import type { FormModel } from "../../../utils/form/FormModel";
import { ArrayFieldBase } from "../ArrayFieldBase";
import FieldRenderer from "../../FieldRenderer";
import styled from "@emotion/styled";
import {
  StyledFieldLabel,
  StyledFieldError,
  StyledFieldHelper,
} from "../../../theme/styled";

const StyledArrayContainer = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
`;

const StyledArrayItem = styled.div<{ isDirty?: boolean }>`
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: ${(props) =>
    props.isDirty ? "rgba(255, 243, 205, 0.3)" : "white"};
`;

const StyledArrayHeader = styled.div<{ hasBottomBorder?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: #f9fafb;
  border-bottom: ${(props) =>
    props.hasBottomBorder ? "1px solid #e5e7eb" : "none"};
  &:hover {
    background-color: #f3f4f6;
  }
`;

const StyledArrayContent = styled.div`
  padding: 1rem;
`;

const StyledButton = styled.button<{
  variant?: "primary" | "danger";
  size?: "sm" | "md";
  disabled?: boolean;
}>`
  padding: ${(props) =>
    props.size === "sm" ? "0.25rem 0.5rem" : "0.5rem 1rem"};
  border-radius: 0.25rem;
  font-size: ${(props) => (props.size === "sm" ? "0.875rem" : "1rem")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${(props) =>
    props.variant === "primary" &&
    `
    background-color: ${props.disabled ? "#9ca3af" : "#3b82f6"};
    color: white;
    &:hover {
      background-color: ${props.disabled ? "#9ca3af" : "#2563eb"};
    }
  `}

  ${(props) =>
    props.variant === "danger" &&
    `
    background-color: ${props.disabled ? "#9ca3af" : "#ef4444"};
    color: white;
    &:hover {
      background-color: ${props.disabled ? "#9ca3af" : "#dc2626"};
    }
  `}
`;

export interface ArrayOfObjectsFieldProps {
  field: FormField;
  onChange: (value: JSONValue, shouldValidate?: boolean) => void;
  formModel: FormModel;
}

class ArrayOfObjectsField extends ArrayFieldBase<ArrayOfObjectsFieldProps> {
  private expandedItems = new Set<number>();

  protected renderItem(index: number): React.ReactNode {
    const itemSchema = this.props.field.schema.items;
    if (!itemSchema || !itemSchema.properties) {
      return null;
    }

    const isExpanded = this.isItemExpanded(index);
    const itemPath = `${this.props.field.path}.${index}`;
    const itemField = this.props.formModel.getField(itemPath);
    const properties = itemSchema.properties;
    const propertyKeys = Object.keys(properties);

    return (
      <StyledArrayItem key={index} isDirty={this.isItemDirty(index)}>
        <StyledArrayHeader
          hasBottomBorder={isExpanded}
          onClick={() => this.toggleItemExpansion(index)}
        >
          <span
            style={{
              marginRight: "0.25rem",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ▶
          </span>
          <span style={{ flex: 1, fontWeight: "500" }}>
            {this.props.field.schema.title
              ? `${this.toSingular(this.props.field.schema.title)} ${index + 1}`
              : (() => {
                  const pathParts = this.props.field.path.split(".");
                  const lastPart = pathParts[pathParts.length - 1];
                  return lastPart
                    ? `${this.toSingular(lastPart)} ${index + 1}`
                    : `Entity ${index + 1}`;
                })()}
          </span>

          {itemField?.dirty && (
            <StyledFieldHelper style={{ marginRight: "0.5rem" }} />
          )}

          <StyledButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              this.handleRemoveItem(index);
            }}
            disabled={this.props.field.schema.readOnly}
            variant="danger"
            size="sm"
            data-testid={`${this.props.field.path}.${index}-remove`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0.25rem",
            }}
            aria-label="Remove item"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledButton>
        </StyledArrayHeader>

        {isExpanded && (
          <StyledArrayContent>
            {propertyKeys.map((propertyKey) => {
              const nestedField = this.getNestedField(index, propertyKey);
              if (!nestedField) return null;

              return (
                <div key={propertyKey} style={{ marginBottom: "1rem" }}>
                  <FieldRenderer
                    field={nestedField}
                    formModel={this.props.formModel}
                    onChange={(value: JSONValue, shouldValidate?: boolean) =>
                      this.handleNestedChange(
                        index,
                        propertyKey,
                        value,
                        shouldValidate
                      )
                    }
                  />
                </div>
              );
            })}

            {propertyKeys.length === 0 && (
              <StyledFieldHelper style={{ fontStyle: "italic" }}>
                No properties defined for this object
              </StyledFieldHelper>
            )}
          </StyledArrayContent>
        )}
      </StyledArrayItem>
    );
  }

  protected getDefaultItemValue(): JSONValue {
    return this.createDefaultObjectValue(this.props.field.schema.items);
  }

  protected isItemExpanded(index: number): boolean {
    return this.expandedItems.has(index);
  }

  protected toggleItemExpansion(index: number): void {
    const newExpandedItems = new Set(this.expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    this.expandedItems = newExpandedItems;
    this.forceUpdate();
  }

  private getNestedField(
    itemIndex: number,
    propertyKey: string
  ): FormField | undefined {
    const nestedPath = `${this.props.field.path}.${itemIndex}.${propertyKey}`;
    return this.props.formModel.getField(nestedPath);
  }

  private handleNestedChange(
    itemIndex: number,
    propertyKey: string,
    value: JSONValue,
    shouldValidate?: boolean
  ) {
    const nestedPath = `${this.props.field.path}.${itemIndex}.${propertyKey}`;
    this.props.formModel.setValue(nestedPath, value);
    if (shouldValidate) {
      this.props.formModel.validate();
    }
  }

  private toSingular(word: string): string {
    if (!word) return "Item";

    const exceptions: Record<string, string> = {
      "alumni": "alumnus",
      "analyses": "analysis",
      "appendices": "appendix",
      "attributes": "attribute",
      "axes": "axis",
      "bacteria": "bacterium",
      "cacti": "cactus",
      "children": "child",
      "corpora": "corpus",
      "criteria": "criterion",
      "crises": "crisis",
      "data": "datum",
      "diagnoses": "diagnosis",
      "feet": "foot",
      "focuses": "focus",
      "fungi": "fungus",
      "hypotheses": "hypothesis",
      "indices": "index",
      "loci": "locus",
      "matrices": "matrix",
      "media": "medium",
      "nuclei": "nucleus",
      "oases": "oasis",
      "people": "person",
      "phenomena": "phenomenon",
      "radiuses": "radius",
      "responses": "response",
      "roles": "role",
      "series": "series",
      "species": "species",
      "stimuli": "stimulus",
      "strata": "stratum",
      "syllabi": "syllabus",
      "teeth": "tooth",
      "theses": "thesis",
      "vertices": "vertex",
    };

    if (exceptions[word]) {
      return exceptions[word];
    }

    // Handle common English plural patterns
    if (word.endsWith("ies")) {
      word = word.slice(0, -3) + "y";
    } else if (word.endsWith("es")) {
      word = word.slice(0, -2);
    } else if (word.endsWith("s") && word.length > 1) {
      word = word.slice(0, -1);
    }

    // Capitalize first letter
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private createDefaultObjectValue(itemSchema?: {
    properties?: Record<string, { type?: string; default?: JSONValue }>;
  }): Record<string, JSONValue> {
    if (!itemSchema || !itemSchema.properties) {
      return {};
    }

    const defaultObj: Record<string, JSONValue> = {};
    const properties = itemSchema.properties;

    for (const [key, propSchema] of Object.entries(properties)) {
      const prop = propSchema;
      if (prop.default !== undefined) {
        defaultObj[key] = prop.default;
      } else {
        switch (prop.type) {
          case "array":
            defaultObj[key] = [];
            break;
          case "boolean":
            defaultObj[key] = false;
            break;
          case "integer":
          case "number":
            defaultObj[key] = 0;
            break;
          case "object":
            defaultObj[key] = {};
            break;
          case "string":
            defaultObj[key] = "";
            break;
          default:
            defaultObj[key] = null;
        }
      }
    }

    return defaultObj;
  }

  render() {
    const fieldId = this.props.field.path;
    const displayName =
      this.props.field.path.split(".").pop() || this.props.field.path;
    const hasErrors = this.props.field.errors.length > 0;
    const errorMessage = hasErrors ? this.props.field.errors[0] : undefined;
    const items = this.getItems();

    return (
      <StyledArrayContainer id={fieldId} data-testid={fieldId}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <StyledFieldLabel
            htmlFor={fieldId}
            id={`${fieldId}-label`}
            data-testid={`${fieldId}-label`}
            required={this.props.field.required}
            style={{
              fontSize: "2rem",
              marginBottom: "0",
            }}
          >
            {capitalizeFirstLetter(displayName)}
          </StyledFieldLabel>

          <StyledButton
            id={`${fieldId}-add`}
            data-testid={`${fieldId}-add`}
            type="button"
            onClick={this.handleAddItem}
            disabled={this.props.field.schema.readOnly}
            variant="primary"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0",
            }}
            aria-label="Add item"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledButton>
        </div>

        <div>
          {items.map((_, index) => this.renderItem(index))}

          {items.length === 0 && (
            <div
              style={{
                color: "#6b7280",
                fontStyle: "italic",
                padding: "1.5rem",
                textAlign: "center" as const,
                border: "2px dashed #e5e7eb",
                borderRadius: "0.375rem",
                marginBottom: "0.5rem",
              }}
            >
              No items added yet
            </div>
          )}
        </div>

        {hasErrors && (
          <StyledFieldError
            id={`${fieldId}-error`}
            data-testid={`${fieldId}-error`}
          >
            {errorMessage}
          </StyledFieldError>
        )}
      </StyledArrayContainer>
    );
  }
}

export default ArrayOfObjectsField;

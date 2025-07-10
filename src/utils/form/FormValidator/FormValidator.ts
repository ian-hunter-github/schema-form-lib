import type {
  JSONSchema,
  JSONSchemaProperties,
  JSONValue,
  FormValue,
} from "../../../types/schema";
import type { FormField } from "../../../types/fields";
import { VALIDATION_MESSAGES } from "./validationMessages";

export class FormValidator {
  /**
   * Validates all fields in a form model
   * @param fields Map of form fields to validate
   * @returns Record mapping field paths to error arrays
   */
  static validateAll(fields: Map<string, FormField>): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    const processedFields = new Set<string>();

    // First validate the root object if it exists
    const rootField = fields.get("");
    if (rootField) {
      // Validate root object itself
      const rootErrors = this.validateFieldInternal(
        rootField.schema,
        "",
        rootField.value,
        new Set<string>(),
        20,
        0,
        fields
      );
      if (rootErrors.length > 0) {
        errors[""] = rootErrors;
      }
      processedFields.add("");

      // Validate required fields from root schema
      if (rootField.schema.required && Array.isArray(rootField.schema.required)) {
        for (const requiredField of rootField.schema.required) {
          const fieldPath = requiredField;
          const field = fields.get(fieldPath);
          
          // Validate field if it exists in fields map
          if (field && !processedFields.has(fieldPath)) {
            const fieldErrors = this.validateFieldInternal(
              field.schema,
              fieldPath,
              field.value,
              new Set<string>(),
              20,
              0,
              fields
            );
            if (fieldErrors.length > 0) {
              errors[fieldPath] = fieldErrors;
            }
            // Special case: field exists but has empty string value and is required
            else if (field.value === "" && rootField.schema.required?.includes(fieldPath)) {
              errors[fieldPath] = [VALIDATION_MESSAGES.REQUIRED];
            }
            processedFields.add(fieldPath);
          }
          // If field doesn't exist in fields map but is required, add error
          else if (!field) {
            errors[fieldPath] = [VALIDATION_MESSAGES.REQUIRED];
          }
        }
      }
    }

    // Then validate all other fields with their required status from root schema
    for (const [path, field] of fields) {
      if (processedFields.has(path) || path === "") continue;

      // Skip validation for readOnly fields
      if (field.schema.readOnly) {
        processedFields.add(path);
        continue;
      }

      // Validate each field independently with its own visited set
      const fieldErrors = this.validateFieldInternal(
        field.schema,
        path,
        field.value,
        new Set<string>(), // Fresh visited set for each field
        20, // maxDepth
        0, // currentDepth
        fields // Pass fields map for required field checking
      );
      if (fieldErrors.length > 0) {
        errors[path] = fieldErrors;
      }
      processedFields.add(path);
    }

    return errors;
  }

  private static validateFieldInternal(
    schema: JSONSchema,
    path: string,
    value: FormValue,
    visited: Set<string>,
    maxDepth: number,
    currentDepth = 0,
    fields?: Map<string, FormField>
  ): string[] {
    if (currentDepth > maxDepth) {
      return [VALIDATION_MESSAGES.MAX_DEPTH_EXCEEDED(maxDepth)];
    }
    if (visited.has(path)) {
      return [VALIDATION_MESSAGES.CIRCULAR_REFERENCE(path)];
    }

    const errors: string[] = [];

    // Check required fields first - either explicit required, minLength=1 for strings,
    // or required from parent schema
    const isRequired = schema.required || 
                      (schema.type === "string" && schema.minLength === 1) ||
                      (path.includes('.') && schema.required === undefined && 
                       fields?.get(path.split('.')[0])?.schema.required?.includes(path.split('.').pop()!));

    // Check required status first
    const isEmpty = value === undefined || value === null || 
                   (typeof value === 'string' && value.trim() === '') ||
                   (Array.isArray(value) && value.length === 0) ||
                   (typeof value === 'object' && Object.keys(value).length === 0);

    if (isRequired && isEmpty) {
      errors.push(VALIDATION_MESSAGES.REQUIRED);
    }

    // Only skip further validation if value is completely undefined/null
    // For empty strings/arrays/objects, we still want to run other validations
    if (value === undefined || value === null) {
      return errors;
    }

    // Type-specific validation
    if (schema.type === "string" && typeof value === "string") {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push(VALIDATION_MESSAGES.MIN_LENGTH(schema.minLength));
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push(VALIDATION_MESSAGES.MAX_LENGTH(schema.maxLength));
      }
    } else if (schema.type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push(VALIDATION_MESSAGES.NUMBER_REQUIRED);
      } else {
        if (schema.minimum !== undefined && num < schema.minimum) {
          errors.push(VALIDATION_MESSAGES.MIN_NUMBER(schema.minimum));
        }
        if (schema.maximum !== undefined && num > schema.maximum) {
          errors.push(VALIDATION_MESSAGES.MAX_NUMBER(schema.maximum));
        }
      }
    }

    visited.add(path);
    return errors;
  }

  private static validateObjectInternal(
    properties: JSONSchemaProperties,
    value: Record<string, JSONValue>,
    prefix = "",
    visited: Set<string>,
    maxDepth: number,
    currentDepth = 0
  ): Record<string, string[]> {
    if (currentDepth > maxDepth) {
      return { [prefix]: [`Maximum validation depth (${maxDepth}) exceeded`] };
    }
    const errors: Record<string, string[]> = {};
    
    if (!value || typeof value !== 'object') {
      return { [prefix]: [VALIDATION_MESSAGES.OBJECT_REQUIRED] };
    }


    for (const [key, schema] of Object.entries(properties)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const fieldValue = value?.[key];
      
      
      // Only validate if field exists in the value object
      if (key in value) {
        const fieldErrors = this.validateFieldInternal(
          schema,
          fullKey,
          fieldValue,
          visited,
          maxDepth,
          currentDepth + 1
        );
        
        if (fieldErrors.length > 0) {
          errors[fullKey] = fieldErrors;
        }
      }

      // Handle nested objects
      if (schema.type === "object" && schema.properties) {
        const nestedErrors = this.validateObjectInternal(
          schema.properties,
          fieldValue as Record<string, JSONValue> || {},
          fullKey,
          visited,
          maxDepth,
          currentDepth + 1
        );
        Object.assign(errors, nestedErrors);
      }
      
      // Handle nested arrays
      if (schema.type === "array" && Array.isArray(fieldValue) && schema.items) {
        for (let i = 0; i < fieldValue.length; i++) {
          const itemPath = `${fullKey}.${i}`;
          const itemValue = fieldValue[i];
          const itemSchema = schema.items as JSONSchema;
          
          if (!visited.has(itemPath)) {
            const itemErrors = this.validateFieldInternal(
              itemSchema,
              itemPath,
              itemValue,
              visited,
              maxDepth,
              currentDepth + 1
            );
            
            if (itemErrors.length > 0) {
              errors[itemPath] = itemErrors;
            }
            
            // Recursively validate nested structures in array items
            if (itemSchema.type === "object" && itemSchema.properties) {
              const nestedObjectErrors = this.validateObjectInternal(
                itemSchema.properties,
                itemValue as Record<string, JSONValue> || {},
                itemPath,
                visited,
                maxDepth,
                currentDepth + 1
              );
              Object.assign(errors, nestedObjectErrors);
            }
          }
        }
      }
    }

    return errors;
  }

  // Keep existing public methods for backward compatibility
  static validateField(
    schema: JSONSchemaProperties,
    path: string,
    value: FormValue,
    options: {
      visited?: Set<string>;
      maxDepth?: number;
      currentDepth?: number;
    } = {}
  ): string[] {
    // Get the full nested schema for the path
    const fieldSchema = this.getNestedSchema(schema, path);
    if (!fieldSchema) return [];
    
    return this.validateFieldInternal(
      fieldSchema,
      path,
      value,
      options.visited || new Set(),
      options.maxDepth || 20,
      options.currentDepth || 0
    );
  }

  static validateObject(
    properties: JSONSchemaProperties,
    value: Record<string, JSONValue>,
    prefix = "",
    options: {
      visited?: Set<string>;
      maxDepth?: number;
      currentDepth?: number;
    } = {}
  ): Record<string, string[]> {
    return this.validateObjectInternal(
      properties,
      value,
      prefix,
      options.visited || new Set(),
      options.maxDepth || 20,
      options.currentDepth || 0
    );
  }

  static validateForm(
    formData: Record<string, JSONValue>,
    schema: JSONSchemaProperties,
    options: {
      maxDepth?: number;
    } = {}
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    const visited = new Set<string>();
    const maxDepth = options.maxDepth || 20;

    for (const [key, value] of Object.entries(formData)) {
      const fieldSchema = this.getNestedSchema(schema, key);
      if (!fieldSchema) continue;

      if (fieldSchema.type === "object" && fieldSchema.properties) {
        const objectErrors = this.validateObjectInternal(
          fieldSchema.properties,
          value as Record<string, JSONValue>,
          key,
          visited,
          maxDepth
        );
        Object.assign(errors, objectErrors);
      } else {
        const fieldErrors = this.validateFieldInternal(
          fieldSchema,
          key,
          value,
          visited,
          maxDepth
        );
        if (fieldErrors.length > 0) {
          errors[key] = fieldErrors;
        }
      }
    }

    return errors;
  }

  private static getNestedSchema(
    schema: JSONSchemaProperties,
    path: string
  ): JSONSchema | undefined {
    const parts = path.split(".");
    let current: JSONSchema | undefined = {
      type: "object",
      properties: schema,
    };

    for (const part of parts) {
      if (!current || typeof current !== "object" || !("properties" in current)) {
        return undefined;
      }

      const properties = current.properties as JSONSchemaProperties;
      if (!properties) return undefined;

      current = properties[part];
      if (!current || typeof current !== "object") {
        return undefined;
      }
    }

    return current;
  }
}

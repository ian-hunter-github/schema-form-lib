import type {
  JSONSchema,
  JSONSchemaProperties,
  JSONValue,
  FormValue,
} from "../types/schema";

export class FormValidator {
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
    const { visited = new Set(), maxDepth = 20, currentDepth = 0 } = options;
    
    if (currentDepth > maxDepth) {
      return [`Maximum validation depth (${maxDepth}) exceeded`];
    }
    if (visited.has(path)) {
      return [`Circular reference detected at path: ${path}`];
    }
    visited.add(path);
    const errors: string[] = [];
    const fieldName = path.split('.').pop() || '';
    const field = schema[fieldName] || this.getNestedSchema(schema, path);

    if (!field || field.readOnly) {
      return errors;
    }

    // Check if field is required - either explicitly marked in its own schema
    // or included in parent's required array
    let isRequired = field.required === true;
    if (!isRequired && path.includes('.')) {
      const parentPath = path.split('.').slice(0, -1).join('.');
      const parentSchema = parentPath ? this.getNestedSchema(schema, parentPath) : schema;
      if (parentSchema?.required && Array.isArray(parentSchema.required)) {
        isRequired = parentSchema.required.includes(fieldName);
      }
    }
    
    // Validate required fields
    if (isRequired && (value === undefined || value === null || 
        (typeof value === 'string' && value.trim() === ''))) {
      errors.push("This field is required.");
      return errors; // Skip further validation for missing required fields
    }

    if (field.type === "object" && field.properties) {
      const objectErrors = this.validateObject(
        field.properties,
        value as Record<string, JSONValue>,
        path
      );
      // Collect all nested errors
      for (const errs of Object.values(objectErrors)) {
        errors.push(...errs);
      }
    }

    if (field.type === "string" && typeof value === "string") {
      if (field.minLength && value.length < field.minLength) {
        errors.push(`Must be at least ${field.minLength} characters.`);
      }
      if (field.maxLength && value.length > field.maxLength) {
        errors.push(`Must be no more than ${field.maxLength} characters.`);
      }
    }

    if (field.type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push("Must be a number.");
      }
      if (field.minimum !== undefined && num < field.minimum) {
        errors.push(`Must be at least ${field.minimum}.`);
      }
      if (field.maximum !== undefined && num > field.maximum) {
        errors.push(`Must be no more than ${field.maximum}.`);
      }
    }

    return errors;
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
    const { visited = new Set(), maxDepth = 20, currentDepth = 0 } = options;
    
    if (currentDepth > maxDepth) {
      return { [prefix]: [`Maximum validation depth (${maxDepth}) exceeded`] };
    }
    const errors: Record<string, string[]> = {};
    
    if (!value || typeof value !== 'object') {
      return { [prefix]: ['Must be an object'] };
    }

    Object.keys(properties).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const field = properties[key];
      const fieldValue = value?.[key];
      
      // Check if field is required - either explicitly marked in its own schema
      // or included in parent's required array
      let isRequired = field.required === true;
      if (!isRequired && fullKey.includes('.')) {
        const parentPath = fullKey.split('.').slice(0, -1).join('.');
        const parentSchema = parentPath ? this.getNestedSchema(properties, parentPath) : properties;
        if (parentSchema?.required && Array.isArray(parentSchema.required)) {
          isRequired = parentSchema.required.includes(key);
        }
      }
      // Keep track of whether field is required without modifying schema
      const fieldIsRequired = isRequired;

      if (field.type === "object" && field.properties) {
        const nestedErrors = this.validateObject(
          field.properties,
          fieldValue as Record<string, JSONValue> || {},
          fullKey,
          { visited, maxDepth, currentDepth: currentDepth + 1 }
        );
        Object.assign(errors, nestedErrors);
      } else {
        const fieldSchema = this.getNestedSchema(properties, key);
        const fieldErrors = fieldSchema 
          ? this.validateField(
              { 
                [key]: {
                  ...fieldSchema,
                  required: fieldIsRequired
                } 
              } as JSONSchemaProperties,
              fullKey,
              fieldValue,
              { visited, maxDepth, currentDepth: currentDepth + 1 }
            )
          : this.validateField(
              properties, 
              fullKey, 
              fieldValue, 
              { visited, maxDepth, currentDepth: currentDepth + 1 }
            );
        
        if (fieldErrors.length > 0) {
          errors[fullKey] = fieldErrors;
        }
      }
    });

    return errors;
  }

  static validateForm(
    formData: Record<string, JSONValue>,
    schema: JSONSchemaProperties,
    options: {
      maxDepth?: number;
    } = {}
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      const fieldSchema = this.getNestedSchema(schema, key);
      
      if (fieldSchema?.type === "object" && fieldSchema.properties) {
        const objectErrors = this.validateObject(
          fieldSchema.properties,
          value as Record<string, JSONValue>,
          key,
          { maxDepth: options.maxDepth }
        );
        Object.assign(errors, objectErrors);
      } else {
        const fieldErrors = this.validateField(schema, key, value, { maxDepth: options.maxDepth });
        if (fieldErrors.length > 0) {
          errors[key] = fieldErrors;
        }
      }
    });

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

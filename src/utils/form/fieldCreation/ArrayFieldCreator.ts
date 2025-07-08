import type { JSONSchema, JSONValue } from '../../../types/schema';
import type { FormField } from '../../../types/fields';
import { FieldInitializer } from './FieldInitializer';
import { SchemaAnalyzer } from '../valueHandling/SchemaAnalyzer';
import { PathBuilder } from '../pathResolution/PathBuilder';

export class ArrayFieldCreator {
  static canHandle(schema: JSONSchema): boolean {
    return SchemaAnalyzer.isArraySchema(schema);
  }

  static createField(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema,
    value?: JSONValue
  ): FormField {
    const arrayValue = this.prepareArrayValue(schema, value);
    const field = FieldInitializer.createField(path, schema, arrayValue);
    fields.set(path, field);
    
    // Create fields for existing array items
    this.createItemFields(fields, path, schema, arrayValue);
    
    return field;
  }

  static createFieldsForSchema(
    fields: Map<string, FormField>,
    path: string,
    schema: JSONSchema
  ): void {
    this.createField(fields, path, schema);
  }

  private static prepareArrayValue(schema: JSONSchema, value?: JSONValue): JSONValue[] {
    if (Array.isArray(value)) {
      return value;
    }
    
    if (Array.isArray(schema.default)) {
      return [...schema.default];
    }
    
    return [];
  }

  private static createItemFields(
    fields: Map<string, FormField>,
    arrayPath: string,
    schema: JSONSchema,
    arrayValue: JSONValue[]
  ): void {
    const itemSchema = SchemaAnalyzer.getArrayItemSchema(schema);
    if (!itemSchema) return;

    for (let i = 0; i < arrayValue.length; i++) {
      const itemPath = PathBuilder.buildArrayItemPath(arrayPath, i);
      const itemValue = arrayValue[i];
      
      this.createItemField(fields, itemPath, itemSchema, itemValue);
    }
  }

  private static createItemField(
    fields: Map<string, FormField>,
    itemPath: string,
    itemSchema: JSONSchema,
    itemValue: JSONValue
  ): void {
    if (SchemaAnalyzer.isObjectSchema(itemSchema)) {
      // Will be handled by ObjectFieldCreator through factory
      const field = FieldInitializer.createField(itemPath, itemSchema, itemValue);
      fields.set(itemPath, field);
    } else if (SchemaAnalyzer.isArraySchema(itemSchema)) {
      // Nested array
      this.createField(fields, itemPath, itemSchema, itemValue);
    } else {
      // Primitive item
      const field = FieldInitializer.createField(itemPath, itemSchema, itemValue);
      fields.set(itemPath, field);
    }
  }

  static addArrayItem(
    fields: Map<string, FormField>,
    arrayPath: string,
    value: JSONValue
  ): string {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !SchemaAnalyzer.isArraySchema(arrayField.schema)) {
      throw new Error(`Cannot add item to non-array field at path: ${arrayPath}`);
    }

    if (!Array.isArray(arrayField.value)) {
      arrayField.value = [];
    }

    const newIndex = arrayField.value.length;
    arrayField.value.push(value);
    const newItemPath = PathBuilder.buildArrayItemPath(arrayPath, newIndex);

    // Create field for the new item
    const itemSchema = SchemaAnalyzer.getArrayItemSchema(arrayField.schema);
    if (itemSchema) {
      this.createItemField(fields, newItemPath, itemSchema, value);
    }

    FieldInitializer.markFieldDirty(arrayField);
    return newItemPath;
  }

  static removeArrayItem(
    fields: Map<string, FormField>,
    arrayPath: string,
    index: number
  ): void {
    const arrayField = fields.get(arrayPath);
    if (!arrayField || !Array.isArray(arrayField.value)) {
      throw new Error(`Cannot remove item from non-array field at path: ${arrayPath}`);
    }

    // Remove the item from the array
    arrayField.value.splice(index, 1);

    // Remove all fields for this index and its children
    const itemPath = PathBuilder.buildArrayItemPath(arrayPath, index);
    this.removeFieldsWithPrefix(fields, itemPath);

    // Update paths for remaining items (shift indices down)
    this.updateArrayIndices(fields, arrayPath, index);

    FieldInitializer.markFieldDirty(arrayField);
  }

  private static removeFieldsWithPrefix(fields: Map<string, FormField>, prefix: string): void {
    const keysToRemove: string[] = [];
    for (const [path] of fields) {
      if (path === prefix || path.startsWith(prefix + '.')) {
        keysToRemove.push(path);
      }
    }
    
    for (const key of keysToRemove) {
      fields.delete(key);
    }
  }

  private static updateArrayIndices(
    fields: Map<string, FormField>,
    arrayPath: string,
    removedIndex: number
  ): void {
    const fieldsToUpdate = new Map<string, FormField>();
    const fieldsToRemove: string[] = [];

    for (const [path, field] of fields) {
      if (path.startsWith(arrayPath + '.')) {
        const relativePath = path.substring(arrayPath.length + 1);
        const firstSegment = relativePath.split('.')[0];
        const currentIndex = parseInt(firstSegment, 10);
        
        if (!isNaN(currentIndex) && currentIndex > removedIndex) {
          const newIndex = currentIndex - 1;
          const newPath = path.replace(
            `${arrayPath}.${currentIndex}`,
            `${arrayPath}.${newIndex}`
          );
          
          fieldsToUpdate.set(newPath, {
            ...field,
            path: newPath
          });
          fieldsToRemove.push(path);
        }
      }
    }

    // Remove old fields and add updated ones
    for (const path of fieldsToRemove) {
      fields.delete(path);
    }
    for (const [path, field] of fieldsToUpdate) {
      fields.set(path, field);
    }
  }
}

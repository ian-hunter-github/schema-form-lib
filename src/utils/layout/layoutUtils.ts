import type { FormField } from '../../types/fields';
import type { JSONSchemaWithLayout, LayoutConfig, FieldLayoutConfig, ResponsiveBreakpoint } from '../../types/layout';
import { DEFAULT_FIELD_WIDTHS, BREAKPOINTS } from '../../types/layout';

/**
 * Calculate the optimal field width based on field type and content
 */
export const calculateFieldWidth = (field: FormField): number => {
  const schema = field.schema as JSONSchemaWithLayout;
  const fieldLayout = schema['x-layout'];
  
  // Use explicit column configuration if provided
  if (fieldLayout?.columns && typeof fieldLayout.columns === 'number') {
    return fieldLayout.columns;
  }
  
  // Get base width from field type
  const baseWidth = DEFAULT_FIELD_WIDTHS[schema.type] || 6;
  
  // Adjust based on content hints
  let adjustedWidth = baseWidth;
  
  // Adjust based on maxLength for string fields
  if (schema.type === 'string' && schema.maxLength) {
    if (schema.maxLength <= 10) adjustedWidth = Math.min(baseWidth, 3);
    else if (schema.maxLength <= 30) adjustedWidth = Math.min(baseWidth, 4);
    else if (schema.maxLength <= 50) adjustedWidth = Math.min(baseWidth, 6);
    else if (schema.maxLength > 100) adjustedWidth = 12;
  }
  
  // Adjust based on enum options
  if (schema.enum) {
    if (schema.enum.length <= 2) adjustedWidth = Math.min(baseWidth, 3);
    else if (schema.enum.length <= 4) adjustedWidth = Math.min(baseWidth, 4);
    else adjustedWidth = Math.min(baseWidth, 6);
  }
  
  // Adjust based on title length
  if (schema.title && schema.title.length > 20) {
    adjustedWidth = Math.max(adjustedWidth, 6);
  }
  
  // Adjust for validation errors (need more space for error messages)
  if (field.errors.length > 0) {
    adjustedWidth = Math.max(adjustedWidth, 6);
  }
  
  // Adjust based on field description length
  if (schema.description && schema.description.length > 50) {
    adjustedWidth = Math.max(adjustedWidth, 8);
  }
  
  // Apply min/max constraints
  if (fieldLayout?.minColumns) {
    adjustedWidth = Math.max(adjustedWidth, fieldLayout.minColumns);
  }
  if (fieldLayout?.maxColumns) {
    adjustedWidth = Math.min(adjustedWidth, fieldLayout.maxColumns);
  }
  
  // Ensure width is between 1 and 12
  return Math.max(1, Math.min(12, adjustedWidth));
};

/**
 * Get the current responsive breakpoint based on window width
 */
export const getCurrentBreakpoint = (width: number): ResponsiveBreakpoint => {
  if (width <= BREAKPOINTS.mobile.max) return 'mobile';
  if (width <= BREAKPOINTS.tablet.max) return 'tablet';
  return 'desktop';
};

/**
 * Get responsive column count for a field
 */
export const getResponsiveColumns = (
  fieldLayout: FieldLayoutConfig | undefined,
  breakpoint: ResponsiveBreakpoint,
  defaultColumns: number
): number => {
  if (!fieldLayout?.columns) return defaultColumns;
  
  if (typeof fieldLayout.columns === 'number') {
    return fieldLayout.columns;
  }
  
  // Return breakpoint-specific value or fall back to default
  return fieldLayout.columns[breakpoint] || defaultColumns;
};

/**
 * Determine if a row should break before adding the next field
 */
export const shouldBreakRow = (
  currentField: FormField,
  nextField: FormField | undefined,
  currentRowWidth: number,
  breakpoint: ResponsiveBreakpoint
): boolean => {
  const currentSchema = currentField.schema as JSONSchemaWithLayout;
  const currentLayout = currentSchema['x-layout'];
  
  // Force break if current field has breakAfter
  if (currentLayout?.breakAfter) return true;
  
  if (!nextField) return false;
  
  const nextSchema = nextField.schema as JSONSchemaWithLayout;
  const nextLayout = nextSchema['x-layout'];
  
  // Force break if next field has breakBefore
  if (nextLayout?.breakBefore) return true;
  
  // const currentWidth = calculateFieldWidth(currentField);
  const nextWidth = calculateFieldWidth(nextField);
  
  // Get responsive widths
  // const responsiveCurrentWidth = getResponsiveColumns(currentLayout, breakpoint, currentWidth);
  const responsiveNextWidth = getResponsiveColumns(nextLayout, breakpoint, nextWidth);
  
  // Break if adding next field would exceed 12 columns
  if (currentRowWidth + responsiveNextWidth > 12) return true;
  
  // Break before full-width fields
  if (responsiveNextWidth === 12) return true;
  
  // Break after certain field types for logical grouping
  if (currentField.schema.type === 'object' || currentField.schema.type === 'array') {
    return true;
  }
  
  return false;
};

/**
 * Adjust field widths in a row to fill remaining space (no gaps on the right)
 */
export const adjustRowFieldWidths = (
  fields: FormField[],
  breakpoint: ResponsiveBreakpoint
): { field: FormField; adjustedWidth: number }[] => {
  if (fields.length === 0) return [];
  
  // Calculate initial widths
  const fieldWidths = fields.map(field => {
    const fieldWidth = calculateFieldWidth(field);
    const schema = field.schema as JSONSchemaWithLayout;
    const fieldLayout = schema['x-layout'];
    return getResponsiveColumns(fieldLayout, breakpoint, fieldWidth);
  });
  
  const totalWidth = fieldWidths.reduce((sum, width) => sum + width, 0);
  const remainingSpace = 12 - totalWidth;
  
  // If no remaining space or already full, return as-is
  if (remainingSpace <= 0) {
    return fields.map((field, index) => ({
      field,
      adjustedWidth: fieldWidths[index]
    }));
  }
  
  // Distribute remaining space among fields that can expand
  const adjustedWidths = [...fieldWidths];
  let spaceToDistribute = remainingSpace;
  
  // Find fields that can be expanded (not at max width and not boolean/small fields)
  const expandableFields = fields.map((field, index) => {
    const schema = field.schema as JSONSchemaWithLayout;
    const fieldLayout = schema['x-layout'];
    const maxColumns = fieldLayout?.maxColumns || 12;
    const currentWidth = fieldWidths[index];
    
    // Don't expand boolean fields beyond 4 columns or fields already at max
    const canExpand = currentWidth < maxColumns && 
                     (schema.type !== 'boolean' || currentWidth < 4);
    
    return { index, canExpand, maxExpansion: maxColumns - currentWidth };
  }).filter(item => item.canExpand);
  
  // Distribute space evenly among expandable fields
  while (spaceToDistribute > 0 && expandableFields.length > 0) {
    const spacePerField = Math.max(1, Math.floor(spaceToDistribute / expandableFields.length));
    
    for (let i = expandableFields.length - 1; i >= 0; i--) {
      const expandableField = expandableFields[i];
      const expansion = Math.min(spacePerField, expandableField.maxExpansion, spaceToDistribute);
      
      adjustedWidths[expandableField.index] += expansion;
      expandableField.maxExpansion -= expansion;
      spaceToDistribute -= expansion;
      
      // Remove field if it can't expand further
      if (expandableField.maxExpansion <= 0) {
        expandableFields.splice(i, 1);
      }
      
      if (spaceToDistribute <= 0) break;
    }
  }
  
  return fields.map((field, index) => ({
    field,
    adjustedWidth: adjustedWidths[index]
  }));
};

/**
 * Group fields into rows based on layout strategy
 */
export const groupFieldsIntoRows = (
  fields: FormField[],
  layoutConfig: LayoutConfig,
  breakpoint: ResponsiveBreakpoint
): FormField[][] => {
  if (layoutConfig.strategy === 'vertical') {
    return fields.map(field => [field]);
  }
  
  const rows: FormField[][] = [];
  let currentRow: FormField[] = [];
  let currentRowWidth = 0;
  
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const nextField = fields[i + 1];
    const fieldWidth = calculateFieldWidth(field);
    const schema = field.schema as JSONSchemaWithLayout;
    const fieldLayout = schema['x-layout'];
    const responsiveWidth = getResponsiveColumns(fieldLayout, breakpoint, fieldWidth);
    
    // Check if we should start a new row
    if (currentRow.length === 0 || 
        (currentRowWidth + responsiveWidth <= 12 && 
         !shouldBreakRow(currentRow[currentRow.length - 1], field, currentRowWidth, breakpoint))) {
      currentRow.push(field);
      currentRowWidth += responsiveWidth;
    } else {
      // Start new row
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [field];
      currentRowWidth = responsiveWidth;
    }
    
    // Check if we should break after this field
    if (shouldBreakRow(field, nextField, currentRowWidth, breakpoint)) {
      rows.push(currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }
  }
  
  // Add the last row if it has fields
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
};

/**
 * Generate CSS class name for field column span
 */
export const getFieldColumnClass = (
  field: FormField,
  breakpoint: ResponsiveBreakpoint
): string => {
  const fieldWidth = calculateFieldWidth(field);
  const schema = field.schema as JSONSchemaWithLayout;
  const fieldLayout = schema['x-layout'];
  const responsiveWidth = getResponsiveColumns(fieldLayout, breakpoint, fieldWidth);
  
  return `field-col-${responsiveWidth}`;
};

/**
 * Get CSS gap value from layout configuration
 */
export const getLayoutGap = (gap: LayoutConfig['gap'] = 'md'): string => {
  const gapMap = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  };
  
  return gapMap[gap];
};

/**
 * Determine if intelligent flow should be used based on field types
 */
export const shouldUseIntelligentFlow = (fields: FormField[]): boolean => {
  // Use intelligent flow if we have a mix of short and long fields
  const shortFields = fields.filter(field => calculateFieldWidth(field) <= 4).length;
  const longFields = fields.filter(field => calculateFieldWidth(field) >= 8).length;
  
  return shortFields > 0 && longFields > 0;
};

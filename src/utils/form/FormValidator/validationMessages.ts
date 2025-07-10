export const VALIDATION_MESSAGES = {
  REQUIRED: 'Field is required',
  MIN_LENGTH: (minLength: number) => `Must be at least ${minLength} characters`,
  MAX_LENGTH: (maxLength: number) => `Must be no more than ${maxLength} characters`,
  NUMBER_REQUIRED: "Must be a number",
  MIN_NUMBER: (minimum: number) => `Must be at least ${minimum}`,
  MAX_NUMBER: (maximum: number) => `Must be no more than ${maximum}`,
  MAX_DEPTH_EXCEEDED: (maxDepth: number) => `Maximum validation depth (${maxDepth}) exceeded`,
  CIRCULAR_REFERENCE: (path: string) => `Circular reference detected at path: ${path}`,
  OBJECT_REQUIRED: "Must be an object"
} as const;

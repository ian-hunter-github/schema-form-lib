# Form Buffering and Revert System Guide

This guide explains how to use the enhanced FormModel buffering system that allows users to make changes to forms while maintaining the ability to revert individual fields, branches, or the entire form.

## Overview

The buffering system provides a three-layer data management approach:

1. **Pristine Values**: Original/saved values that serve as the baseline
2. **Current Values**: Working values that users are actively editing
3. **UI Display Values**: What's currently shown in the form fields

## Key Concepts

### Dirty vs HasChanges

- **`dirty`**: Indicates whether a field has been touched/interacted with (interaction tracking)
- **`hasChanges`**: Indicates whether the current value differs from the pristine value (data change tracking)

**Example scenarios:**
```typescript
// Initial: value = "John", pristineValue = "John"
// dirty = false, hasChanges = false

field.setValue("Jane");  // dirty = true, hasChanges = true
field.setValue("John");  // dirty = true, hasChanges = false (back to original)
```

## Core Components

### 1. Enhanced FormField Interface

```typescript
interface FormField {
  path: string;
  value: JSONValue;           // Current working value
  pristineValue: JSONValue;   // Original value for revert
  schema: JSONSchema;
  errors: string[];
  errorCount: number;
  required: boolean;
  dirty: boolean;             // Has been touched
  dirtyCount: number;         // Number of modifications
  hasChanges: boolean;        // Current value ≠ pristine value
  lastModified: Date;         // Timestamp of last change
}
```

### 2. BufferingManager

Handles all buffering operations:

```typescript
// Revert operations
BufferingManager.revertField(fields, path)      // Revert single field
BufferingManager.revertBranch(fields, path)     // Revert object/array branch
BufferingManager.revertAll(fields)              // Revert entire form

// Change detection
BufferingManager.hasUnsavedChanges(fields)      // Check for any changes
BufferingManager.getChangedFields(fields)       // Get modified fields
BufferingManager.getChangedPaths(fields)        // Get modified paths

// Snapshots (for undo/redo)
BufferingManager.createSnapshot(fields)         // Create state snapshot
BufferingManager.restoreFromSnapshot(fields, snapshot)

// Save simulation
BufferingManager.setPristineValues(fields)      // Mark current as saved
```

### 3. Enhanced FormModel

The FormModel now includes buffering methods:

```typescript
const model = new FormModel(schema);

// Basic operations
model.setValue(path, value);
model.validate();

// Buffering operations
model.revertField(path);                    // Revert single field
model.revertBranch(branchPath);            // Revert branch
model.revertAll();                         // Revert everything

// State queries
model.hasUnsavedChanges();                 // Boolean
model.getChangedFields();                  // Array of changed fields
model.getChangedPaths();                   // Array of changed paths
model.getChangeStatistics();               // Detailed stats

// Snapshots
const snapshot = model.createSnapshot();
model.restoreFromSnapshot(snapshot);

// Save simulation
model.setPristineValues();                 // Mark as saved
```

## React Integration

### useFormBuffer Hook

The main hook for React integration:

```typescript
import { useFormBuffer } from './hooks/useFormBuffer';

const {
  formModel,
  fields,
  setValue,
  revertField,
  revertBranch,
  revertAll,
  hasUnsavedChanges,
  getChangedFields,
  getChangedPaths,
  createSnapshot,
  restoreFromSnapshot,
  setPristineValues,
  validate,
  getChangeStatistics
} = useFormBuffer(schema, {
  onUnsavedChangesWarning: (hasChanges) => {
    console.log('Unsaved changes:', hasChanges);
  },
  autoSave: false,
  autoSaveDelay: 1000
});
```

### Additional Hooks

#### useUnsavedChangesWarning
Warns users before leaving the page with unsaved changes:

```typescript
import { useUnsavedChangesWarning } from './hooks/useFormBuffer';

useUnsavedChangesWarning(hasUnsavedChanges);
```

#### useFormKeyboardShortcuts
Enables keyboard shortcuts for undo/redo operations:

```typescript
import { useFormKeyboardShortcuts } from './hooks/useFormBuffer';

const { saveSnapshot, undo, redo } = useFormKeyboardShortcuts(
  revertAll,
  createSnapshot,
  restoreFromSnapshot
);

// Keyboard shortcuts:
// Ctrl+Z: Undo
// Ctrl+Y or Ctrl+Shift+Z: Redo
// Alt+Ctrl+R: Revert All
```

## Usage Patterns

### Basic Form with Buffering

```typescript
function MyForm() {
  const {
    formModel,
    setValue,
    revertField,
    revertAll,
    hasUnsavedChanges,
    setPristineValues,
    validate
  } = useFormBuffer(schema);

  const handleSave = () => {
    if (validate()) {
      // Simulate save operation
      setPristineValues();
      alert('Saved!');
    }
  };

  return (
    <div>
      <input
        value={formModel.getField('name')?.value as string || ''}
        onChange={(e) => setValue('name', e.target.value)}
      />
      
      {formModel.getField('name')?.hasChanges && (
        <button onClick={() => revertField('name')}>
          Revert Name
        </button>
      )}
      
      <button onClick={handleSave} disabled={!hasUnsavedChanges}>
        Save
      </button>
      
      <button onClick={revertAll} disabled={!hasUnsavedChanges}>
        Revert All
      </button>
    </div>
  );
}
```

### Advanced Usage with Statistics

```typescript
function AdvancedForm() {
  const { getChangeStatistics, getChangedPaths } = useFormBuffer(schema);
  
  const stats = getChangeStatistics();
  const changedPaths = getChangedPaths();
  
  return (
    <div>
      <div>Total Fields: {stats.totalFields}</div>
      <div>Changed Fields: {stats.changedFields}</div>
      <div>Dirty Fields: {stats.dirtyFields}</div>
      
      {changedPaths.length > 0 && (
        <div>
          Changed Paths:
          <ul>
            {changedPaths.map(path => <li key={path}>{path}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Branch-Level Reverts

```typescript
function ProfileForm() {
  const { revertBranch, getChangedPaths } = useFormBuffer(schema);
  
  const hasProfileChanges = getChangedPaths().some(path => 
    path.startsWith('user.profile')
  );
  
  return (
    <div>
      {/* Profile fields */}
      
      <button 
        onClick={() => revertBranch('user.profile')}
        disabled={!hasProfileChanges}
      >
        Revert Profile Changes
      </button>
    </div>
  );
}
```

## Common Scenarios

### 1. Round-trip Changes
When a user changes a value and then changes it back to the original:
- `dirty` remains `true` (field was touched)
- `hasChanges` becomes `false` (value equals pristine)
- Form shows no unsaved changes

### 2. Partial Reverts
Reverting only specific fields or branches while keeping other changes:
```typescript
// Revert only the profile section
model.revertBranch('user.profile');

// Other sections remain changed
model.hasUnsavedChanges(); // Still true if other fields changed
```

### 3. Save Operations
After successfully saving data:
```typescript
// Update pristine values to current values
model.setPristineValues();

// Now all fields show as saved
model.hasUnsavedChanges(); // false
```

### 4. Undo/Redo with Snapshots
```typescript
// Create snapshot before major changes
const snapshot = model.createSnapshot();

// Make changes...
model.setValue('name', 'New Name');

// Restore if needed
model.restoreFromSnapshot(snapshot);
```

## Best Practices

1. **Use `hasChanges` for save indicators**: Only show "unsaved changes" when there are actual differences from pristine values.

2. **Use `dirty` for interaction tracking**: Track which fields users have interacted with for analytics or UX purposes.

3. **Implement navigation warnings**: Use `useUnsavedChangesWarning` to prevent accidental data loss.

4. **Provide granular revert options**: Allow users to revert individual fields, sections, or the entire form.

5. **Show change indicators**: Display visual indicators next to fields that have changes.

6. **Enable keyboard shortcuts**: Use `useFormKeyboardShortcuts` for power users.

7. **Create snapshots strategically**: Save snapshots before major operations for undo functionality.

## Example Implementation

See `src/examples/BufferedFormExample.tsx` for a complete working example that demonstrates:

- Real-time change tracking
- Individual field revert buttons
- Branch-level revert operations
- Save simulation with pristine value updates
- Change statistics display
- Keyboard shortcuts
- Navigation warnings

## Testing

The buffering system includes comprehensive tests in `src/__tests__/BufferingManager.test.ts` covering:

- Pristine value tracking
- Change detection
- Round-trip changes
- Individual field reverts
- Branch reverts
- Full form reverts
- Snapshot creation and restoration
- Save simulation
- Array field handling
- Change statistics

Run tests with:
```bash
npm test BufferingManager

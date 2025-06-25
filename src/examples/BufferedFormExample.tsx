import React, { useState } from 'react';
import { useFormBuffer, useUnsavedChangesWarning, useFormKeyboardShortcuts } from '../hooks/useFormBuffer';
import type { JSONSchemaProperties } from '../types/schema';

const schema: JSONSchemaProperties = {
  user: {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John Doe' },
          email: { type: 'string', default: 'john@example.com' },
          age: { type: 'number', default: 25 }
        }
      },
      preferences: {
        type: 'object',
        properties: {
          theme: { type: 'string', default: 'light' },
          notifications: { type: 'boolean', default: true }
        }
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        default: ['developer', 'javascript']
      }
    }
  }
};

export function BufferedFormExample() {
  const [showStats, setShowStats] = useState(false);
  
  const {
    formModel,
    setValue,
    revertField,
    revertBranch,
    revertAll,
    hasUnsavedChanges,
    getChangedPaths,
    createSnapshot,
    restoreFromSnapshot,
    setPristineValues,
    validate,
    getChangeStatistics
  } = useFormBuffer(schema, {
    onUnsavedChangesWarning: (hasChanges) => {
      console.log('Unsaved changes:', hasChanges);
    }
  });

  // Enable browser warning for unsaved changes
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Enable keyboard shortcuts (Ctrl+Z, Ctrl+Y, etc.)
  const { saveSnapshot } = useFormKeyboardShortcuts(
    revertAll,
    createSnapshot,
    restoreFromSnapshot
  );

  const handleSave = () => {
    if (validate()) {
      // Simulate save operation
      setPristineValues();
      alert('Form saved successfully!');
    } else {
      alert('Please fix validation errors before saving.');
    }
  };

  const handleCreateSnapshot = () => {
    saveSnapshot();
    alert('Snapshot created! Use Ctrl+Z to undo or Ctrl+Y to redo.');
  };

  const stats = getChangeStatistics();
  const changedPaths = getChangedPaths();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Buffered Form Example</h1>
      
      {/* Status Bar */}
      <div style={{ 
        background: hasUnsavedChanges ? '#fff3cd' : '#d4edda', 
        padding: '10px', 
        borderRadius: '4px',
        marginBottom: '20px',
        border: `1px solid ${hasUnsavedChanges ? '#ffeaa7' : '#c3e6cb'}`
      }}>
        <strong>Status:</strong> {hasUnsavedChanges ? 'Unsaved Changes' : 'All Changes Saved'}
        {hasUnsavedChanges && (
          <span style={{ marginLeft: '10px', fontSize: '0.9em' }}>
            ({stats.changedFields} field{stats.changedFields !== 1 ? 's' : ''} modified)
          </span>
        )}
      </div>

      {/* Form Fields */}
      <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label>
            <strong>Name:</strong>
            <input
              type="text"
              value={formModel.getField('user.profile.name')?.value as string || ''}
              onChange={(e) => setValue('user.profile.name', e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
            {formModel.getField('user.profile.name')?.hasChanges && (
              <button 
                onClick={() => revertField('user.profile.name')}
                style={{ marginLeft: '5px', fontSize: '0.8em' }}
              >
                Revert
              </button>
            )}
          </label>
        </div>

        <div>
          <label>
            <strong>Email:</strong>
            <input
              type="email"
              value={formModel.getField('user.profile.email')?.value as string || ''}
              onChange={(e) => setValue('user.profile.email', e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
            {formModel.getField('user.profile.email')?.hasChanges && (
              <button 
                onClick={() => revertField('user.profile.email')}
                style={{ marginLeft: '5px', fontSize: '0.8em' }}
              >
                Revert
              </button>
            )}
          </label>
        </div>

        <div>
          <label>
            <strong>Age:</strong>
            <input
              type="number"
              value={formModel.getField('user.profile.age')?.value as number || 0}
              onChange={(e) => setValue('user.profile.age', parseInt(e.target.value) || 0)}
              style={{ marginLeft: '10px', padding: '5px', width: '80px' }}
            />
            {formModel.getField('user.profile.age')?.hasChanges && (
              <button 
                onClick={() => revertField('user.profile.age')}
                style={{ marginLeft: '5px', fontSize: '0.8em' }}
              >
                Revert
              </button>
            )}
          </label>
        </div>

        <div>
          <label>
            <strong>Theme:</strong>
            <select
              value={formModel.getField('user.preferences.theme')?.value as string || 'light'}
              onChange={(e) => setValue('user.preferences.theme', e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
            {formModel.getField('user.preferences.theme')?.hasChanges && (
              <button 
                onClick={() => revertField('user.preferences.theme')}
                style={{ marginLeft: '5px', fontSize: '0.8em' }}
              >
                Revert
              </button>
            )}
          </label>
        </div>

        <div>
          <label>
            <strong>Notifications:</strong>
            <input
              type="checkbox"
              checked={formModel.getField('user.preferences.notifications')?.value as boolean || false}
              onChange={(e) => setValue('user.preferences.notifications', e.target.checked)}
              style={{ marginLeft: '10px' }}
            />
            {formModel.getField('user.preferences.notifications')?.hasChanges && (
              <button 
                onClick={() => revertField('user.preferences.notifications')}
                style={{ marginLeft: '5px', fontSize: '0.8em' }}
              >
                Revert
              </button>
            )}
          </label>
        </div>

        <div>
          <strong>Tags:</strong>
          <div style={{ marginTop: '5px' }}>
            {(formModel.getField('user.tags')?.value as string[] || []).map((tag, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setValue(`user.tags.${index}`, e.target.value)}
                  style={{ padding: '3px', marginRight: '5px' }}
                />
                {formModel.getField(`user.tags.${index}`)?.hasChanges && (
                  <button 
                    onClick={() => revertField(`user.tags.${index}`)}
                    style={{ fontSize: '0.8em' }}
                  >
                    Revert
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: hasUnsavedChanges ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed'
          }}
        >
          Save Changes
        </button>

        <button 
          onClick={() => revertBranch('user.profile')}
          disabled={!changedPaths.some(path => path.startsWith('user.profile'))}
          style={{ padding: '10px 20px' }}
        >
          Revert Profile
        </button>

        <button 
          onClick={() => revertBranch('user.preferences')}
          disabled={!changedPaths.some(path => path.startsWith('user.preferences'))}
          style={{ padding: '10px 20px' }}
        >
          Revert Preferences
        </button>

        <button 
          onClick={revertAll}
          disabled={!hasUnsavedChanges}
          style={{ padding: '10px 20px' }}
        >
          Revert All
        </button>

        <button 
          onClick={handleCreateSnapshot}
          style={{ padding: '10px 20px' }}
        >
          Create Snapshot
        </button>

        <button 
          onClick={() => setShowStats(!showStats)}
          style={{ padding: '10px 20px' }}
        >
          {showStats ? 'Hide' : 'Show'} Statistics
        </button>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Form Statistics</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            <div><strong>Total Fields:</strong> {stats.totalFields}</div>
            <div><strong>Changed Fields:</strong> {stats.changedFields}</div>
            <div><strong>Dirty Fields:</strong> {stats.dirtyFields}</div>
            <div><strong>Has Unsaved Changes:</strong> {stats.hasUnsavedChanges ? 'Yes' : 'No'}</div>
            
            {changedPaths.length > 0 && (
              <div>
                <strong>Changed Paths:</strong>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {changedPaths.map(path => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: '#e9ecef', 
        borderRadius: '4px',
        fontSize: '0.9em'
      }}>
        <strong>Keyboard Shortcuts:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li><kbd>Ctrl+Z</kbd> - Undo</li>
          <li><kbd>Ctrl+Y</kbd> or <kbd>Ctrl+Shift+Z</kbd> - Redo</li>
          <li><kbd>Alt+Ctrl+R</kbd> - Revert All</li>
        </ul>
      </div>
    </div>
  );
}

export default BufferedFormExample;

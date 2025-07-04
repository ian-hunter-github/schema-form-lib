import React, { useState } from 'react';
import UnifiedFormRenderer from './components/UnifiedFormRenderer';
import { BufferedFormExample } from './examples/BufferedFormExample';
import LayoutDemo from './examples/LayoutDemo';
import { ThemeSchemaDemo } from './demo/ThemeSchemaDemo';
import type { JSONSchemaProperties } from './types/schema';
import { ThemeProvider, useVariants } from './theme';
import './App.css';

// Density selector component
const DensitySelector: React.FC = () => {
  const { variants, updateVariant } = useVariants();
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Density Settings</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {(['compact', 'normal', 'comfortable'] as const).map((density) => (
          <button
            key={density}
            onClick={() => updateVariant('density', density)}
            style={{
              padding: '8px 16px',
              backgroundColor: variants.density === density ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {density}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
        Current density: <strong>{variants.density}</strong> - 
        {variants.density === 'compact' && ' Reduced spacing for dense layouts'}
        {variants.density === 'normal' && ' Default spacing'}
        {variants.density === 'comfortable' && ' Increased spacing for better accessibility'}
      </p>
    </div>
  );
};

function App() {
  const [currentExample, setCurrentExample] = useState<'unified' | 'buffered' | 'layout' | 'theme'>('unified');

  const schema: JSONSchemaProperties = {
    name: { 
      type: 'string', 
      isRequired: true,
      title: 'Full Name',
      description: 'Enter your full name'
    },
    age: { 
      type: 'number',
      title: 'Age',
      description: 'Your age in years',
      minimum: 0,
      maximum: 150
    },
    isStudent: { 
      type: 'boolean',
      title: 'Student Status',
      description: 'Are you currently a student?'
    },
    gender: { 
      type: 'string', 
      enum: ['', 'male', 'female', 'other'], 
      isRequired: true,
      title: 'Gender',
      description: 'Select your gender'
    },
    tags: { 
      type: 'array', 
      items: { type: 'string' },
      title: 'Tags',
      description: 'Add relevant tags about yourself',
      default: ['developer']
    },
    contacts: {
      type: 'array',
      title: 'Emergency Contacts',
      description: 'Add your emergency contact information',
      items: {
        type: 'object',
        properties: {
            name: {
            type: 'string',
            title: 'Contact Name',
            description: 'Full name of the contact person',
            isRequired: true
          },
            relationship: {
            type: 'string',
            title: 'Relationship',
            description: 'Your relationship to this person',
            enum: ['', 'spouse', 'parent', 'sibling', 'friend', 'colleague', 'other'],
            isRequired: true
          },
          phone: {
            type: 'string',
            title: 'Phone Number',
            description: 'Primary phone number',
            pattern: '^[+]?[1-9]\\d{1,14}$'
          },
          email: {
            type: 'string',
            title: 'Email Address',
            description: 'Email address for contact'
          },
          isPrimary: {
            type: 'boolean',
            title: 'Primary Contact',
            description: 'Is this your primary emergency contact?',
            default: false
          }
        }
      },
      default: [
        {
          name: 'John Doe',
          relationship: 'spouse',
          phone: '+1-555-123-4567',
          email: 'john.doe@example.com',
          isPrimary: true
        }
      ]
    },
    address: {
      type: 'object',
      title: 'Address Information',
      description: 'Your residential address details',
      properties: {
        street: { 
          type: 'string', 
          isRequired: true,
          title: 'Street Address',
          description: 'Your street address'
        },
        city: { 
          type: 'string',
          title: 'City',
          description: 'Your city'
        },
        zipCode: { 
          type: 'string', 
          minLength: 5, 
          maxLength: 10, 
          isRequired: true,
          title: 'ZIP Code',
          description: 'Your postal/ZIP code'
        },
        coords: {
          type: 'object',
          title: 'Coordinates',
          description: 'GPS coordinates of your address',
          properties: {
            latitude: { 
              type: 'number', 
              minimum: -90, 
              maximum: 90, 
              default: 20.0,
              title: 'Latitude',
              description: 'Latitude coordinate'
            },
            longitude: { 
              type: 'number', 
              minimum: -180, 
              maximum: 180, 
              default: 30.0,
              title: 'Longitude',
              description: 'Longitude coordinate'
            },
          }
        },
        features: { 
          type: 'array', 
          items: { type: 'string' }, 
          default: ['feature1', 'feature2'], 
          isRequired: true,
          title: 'Area Features',
          description: 'Notable features in your area'
        },
      },
    },
  };

  const handleSubmit = () => {
    alert('Form submitted successfully!');
  };

  return (
    <ThemeProvider>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Unified Schema Form Architecture</h1>
      
      <DensitySelector />
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Choose Example:</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setCurrentExample('unified')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentExample === 'unified' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Unified Form Renderer
          </button>
          <button
            onClick={() => setCurrentExample('buffered')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentExample === 'buffered' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Buffered Form Example
          </button>
          <button
            onClick={() => setCurrentExample('layout')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentExample === 'layout' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Layout Strategy Demo
          </button>
          <button
            onClick={() => setCurrentExample('theme')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentExample === 'theme' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Theme Schema Demo
          </button>
        </div>
      </div>

      {currentExample === 'unified' && (
        <div>
          <h2>Unified Form Renderer</h2>
          <p>
            This demonstrates the new unified architecture with:
          </p>
          <ul>
            <li><strong>Single Source of Truth:</strong> FormModel manages all state</li>
            <li><strong>Reactive Updates:</strong> Automatic re-renders via listeners</li>
            <li><strong>Built-in Buffering:</strong> Change tracking, revert capabilities</li>
            <li><strong>Consistent Validation:</strong> Real-time validation feedback</li>
            <li><strong>No Local State:</strong> All fields are purely controlled</li>
            <li><strong>Array of Objects:</strong> NEW! Expandable object arrays (see Emergency Contacts)</li>
          </ul>
          
          <div style={{ 
            border: '2px solid #007bff', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <UnifiedFormRenderer
              schema={schema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={true}
              showUnsavedWarning={true}
              showBufferingControls={true}
            />
          </div>
        </div>
      )}

      {currentExample === 'buffered' && (
        <div>
          <h2>Advanced Buffered Form Example</h2>
          <p>
            This demonstrates advanced buffering features:
          </p>
          <ul>
            <li><strong>Keyboard Shortcuts:</strong> Ctrl+Z (undo), Ctrl+Y (redo)</li>
            <li><strong>Snapshot Management:</strong> Create and restore snapshots</li>
            <li><strong>Browser Warnings:</strong> Warns before leaving with unsaved changes</li>
            <li><strong>Granular Revert:</strong> Revert individual fields or branches</li>
          </ul>
          
          <div style={{ 
            border: '2px solid #28a745', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <BufferedFormExample />
          </div>
        </div>
      )}

      {currentExample === 'theme' && (
        <div>
          <h2>Theme Configuration Editor</h2>
          <p>
            This demonstrates the theme configuration form built from theme.schema.json:
          </p>
          <ul>
            <li><strong>Schema-Driven:</strong> Form generated from JSON Schema</li>
            <li><strong>Type Safety:</strong> Proper TypeScript typing</li>
            <li><strong>FormRenderer:</strong> Uses the new FormRenderer component</li>
            <li><strong>Live Preview:</strong> Shows submitted data</li>
          </ul>
          
          <div style={{ 
            border: '2px solid #9c27b0', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <ThemeSchemaDemo />
          </div>
        </div>
      )}

      {currentExample === 'layout' && (
        <div>
          <h2>Form Layout Strategy Demo</h2>
          <p>
            This demonstrates the new flexible layout system with:
          </p>
          <ul>
            <li><strong>Multiple Layout Strategies:</strong> Vertical, Intelligent Flow, 12-Column Grid, Responsive Adaptive</li>
            <li><strong>Intelligent Field Sizing:</strong> Automatic width calculation based on field type and content</li>
            <li><strong>Responsive Design:</strong> Adapts to different screen sizes automatically</li>
            <li><strong>Nested Object Layouts:</strong> Different layout strategies for nested objects</li>
            <li><strong>Schema-Driven Configuration:</strong> Layout defined in JSON Schema with x-layout extensions</li>
            <li><strong>CSS Grid & Flexbox:</strong> Modern CSS layout techniques for optimal performance</li>
          </ul>
          
          <div style={{ 
            border: '2px solid #ff9800', 
            borderRadius: '8px', 
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <LayoutDemo />
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px'
      }}>
        <h3>Architecture Benefits</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>✅ What We Achieved</h4>
            <ul>
              <li>Single source of truth (FormModel)</li>
              <li>Consistent state management</li>
              <li>True reactivity across all components</li>
              <li>Built-in buffering and change tracking</li>
              <li>No duplicate state in field components</li>
              <li>Unified validation approach</li>
              <li>Better performance with optimized re-renders</li>
            </ul>
          </div>
          <div>
            <h4>🔧 Key Components</h4>
            <ul>
              <li><strong>useFormModel:</strong> React integration hook</li>
              <li><strong>UnifiedFormRenderer:</strong> Single form renderer</li>
              <li><strong>FormModel:</strong> Core state management</li>
              <li><strong>Field Components:</strong> Pure, stateless UI</li>
              <li><strong>Buffering System:</strong> Change tracking & revert</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}

export default App;

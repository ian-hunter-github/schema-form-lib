import React, { useState } from 'react';
import { useFormModel } from '../hooks/useFormModel';
import FormRenderer from '../components/FormRenderer';
import type { LayoutConfig, LayoutStrategy } from '../types/layout';
import type { JSONSchema } from '../types/schema';

// Demo schemas with different layout configurations
const createDemoSchema = (layoutConfig?: LayoutConfig): JSONSchema => ({
  type: 'object',
  title: 'Layout Demo Form',
  'x-layout': layoutConfig,
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      maxLength: 20,
      'x-layout': { columns: 6 }
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      maxLength: 20,
      'x-layout': { columns: 6 }
    },
    email: {
      type: 'string',
      title: 'Email Address',
      'x-layout': { columns: 8 }
    },
    phone: {
      type: 'string',
      title: 'Phone',
      maxLength: 15,
      'x-layout': { columns: 4 }
    },
    isSubscribed: {
      type: 'boolean',
      title: 'Subscribe to Newsletter',
      'x-layout': { columns: 3 }
    },
    country: {
      type: 'string',
      title: 'Country',
      enum: ['USA', 'Canada', 'UK', 'Germany', 'France'],
      'x-layout': { columns: 4 }
    },
    age: {
      type: 'number',
      title: 'Age',
      minimum: 18,
      maximum: 120,
      'x-layout': { columns: 3 }
    },
    bio: {
      type: 'string',
      title: 'Biography',
      maxLength: 500,
      'x-layout': { columns: 12 }
    },
    address: {
      type: 'object',
      title: 'Address',
      'x-layout': { strategy: 'grid-12', gap: 'sm' },
      properties: {
        street: {
          type: 'string',
          title: 'Street Address',
          'x-layout': { columns: 8 }
        },
        city: {
          type: 'string',
          title: 'City',
          'x-layout': { columns: 6 }
        },
        state: {
          type: 'string',
          title: 'State',
          'x-layout': { columns: 3 }
        },
        zip: {
          type: 'string',
          title: 'ZIP Code',
          maxLength: 10,
          'x-layout': { columns: 3 }
        }
      }
    }
  }
} as any);

const LayoutDemo: React.FC = () => {
  const [currentStrategy, setCurrentStrategy] = useState<LayoutStrategy>('grid-12');
  const [currentGap, setCurrentGap] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  const [debugMode, setDebugMode] = useState<boolean>(true);
  
  const layoutConfig: LayoutConfig = {
    strategy: currentStrategy,
    gap: currentGap,
    debug: debugMode,
    breakpoints: {
      mobile: 'vertical',
      tablet: 'intelligent-flow',
      desktop: currentStrategy
    }
  };

  const schema = createDemoSchema(layoutConfig);
  const { formModel } = useFormModel(schema);

  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  const strategies: { value: LayoutStrategy; label: string; description: string }[] = [
    {
      value: 'vertical',
      label: 'Vertical',
      description: 'One field per row - ideal for mobile and simple forms'
    },
    {
      value: 'intelligent-flow',
      label: 'Intelligent Flow',
      description: 'Smart wrapping based on field content and screen size'
    },
    {
      value: 'grid-12',
      label: '12-Column Grid',
      description: 'CSS Grid with intelligent field sizing based on content'
    },
    {
      value: 'responsive-adaptive',
      label: 'Responsive Adaptive',
      description: 'Automatically adapts strategy based on screen size'
    }
  ];

  const gaps: { value: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; label: string }[] = [
    { value: 'xs', label: 'Extra Small (4px)' },
    { value: 'sm', label: 'Small (8px)' },
    { value: 'md', label: 'Medium (16px)' },
    { value: 'lg', label: 'Large (24px)' },
    { value: 'xl', label: 'Extra Large (32px)' }
  ];

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        Form Layout Strategy Demo
      </h1>
      
      {/* Controls */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Layout Strategy:
          </label>
          <select 
            value={currentStrategy} 
            onChange={(e) => setCurrentStrategy(e.target.value as LayoutStrategy)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              minWidth: '200px'
            }}
          >
            {strategies.map(strategy => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#666', 
            marginTop: '0.25rem',
            maxWidth: '250px'
          }}>
            {strategies.find(s => s.value === currentStrategy)?.description}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Gap Size:
          </label>
          <select 
            value={currentGap} 
            onChange={(e) => setCurrentGap(e.target.value as any)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              minWidth: '150px'
            }}
          >
            {gaps.map(gap => (
              <option key={gap.value} value={gap.value}>
                {gap.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Debug Mode:
          </label>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            backgroundColor: debugMode ? '#e8f5e8' : '#f5f5f5',
            borderRadius: '4px',
            border: `1px solid ${debugMode ? '#4caf50' : '#ccc'}`,
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={debugMode}
              onChange={(e) => setDebugMode(e.target.checked)}
              style={{ margin: 0 }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>
              Show Grid Lines
            </span>
          </label>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#666', 
            marginTop: '0.25rem',
            maxWidth: '200px'
          }}>
            {debugMode ? 'Grid lines and field boundaries visible' : 'Normal view without debug indicators'}
          </div>
        </div>
      </div>

      {/* Current Configuration Display */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px',
        border: '1px solid #2196f3'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
          Current Configuration
        </h3>
        <pre style={{ 
          margin: 0, 
          fontSize: '0.875rem',
          backgroundColor: 'white',
          padding: '0.5rem',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(layoutConfig, null, 2)}
        </pre>
      </div>

      {/* Layout Examples */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>
          Layout Examples
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          marginBottom: '2rem'
        }}>
          {/* Field Width Examples */}
          <div style={{ 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Field Width Examples</h4>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <div><strong>Boolean:</strong> 3 columns (25%)</div>
              <div><strong>Number:</strong> 4 columns (33%)</div>
              <div><strong>String:</strong> 6 columns (50%)</div>
              <div><strong>Long Text:</strong> 12 columns (100%)</div>
            </div>
          </div>

          {/* Responsive Behavior */}
          <div style={{ 
            padding: '1rem', 
            border: '1px solid #ddd', 
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <h4 style={{ margin: '0 0 1rem 0' }}>Responsive Behavior</h4>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <div><strong>Mobile (≤768px):</strong> Vertical layout</div>
              <div><strong>Tablet (769-1024px):</strong> Intelligent flow</div>
              <div><strong>Desktop (≥1025px):</strong> Selected strategy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Demo */}
      <div style={{ 
        border: '2px solid #2196f3', 
        borderRadius: '8px', 
        padding: '1.5rem',
        backgroundColor: 'white'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#1976d2' }}>
          Live Demo Form
        </h2>
        
        <FormRenderer
          formModel={formModel}
          layoutConfig={layoutConfig}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Instructions */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#fff3e0', 
        borderRadius: '8px',
        border: '1px solid #ff9800'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#f57c00' }}>
          Try This:
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666' }}>
          <li>Switch between different layout strategies to see how the form adapts</li>
          <li>Resize your browser window to see responsive behavior</li>
          <li>Notice how field widths are automatically calculated based on content</li>
          <li>Observe how the nested Address object uses its own layout configuration</li>
          <li>Try different gap sizes to see spacing changes</li>
        </ul>
      </div>
    </div>
  );
};

export default LayoutDemo;

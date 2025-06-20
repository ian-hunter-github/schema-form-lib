import JsonSchemaForm from './components/JsonSchemaForm';
import type { JSONSchemaProperties } from './types/schema';
import './App.css';

function App() {
  const schema: JSONSchemaProperties = {
    name: { type: 'string', required: true },
    age: { type: 'number' },
    isStudent: { type: 'boolean' },
    gender: { type: 'string', enum: ['', 'male', 'female', 'other'], required: true },
    tags: { type: 'array', items: { type: 'string' } },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string', required: true },
        city: { type: 'string' },
        zipCode: { type: 'string', minLength: 5, maxLength: 10, required: true },
        coords: {
          type: 'object',
          properties: {
            latitude: { type: 'number', minimum: -90, maximum: 90, default: 20.0 },
            longitude: { type: 'number', minimum: -180, maximum: 180, default: 30.0 },
          }
        },
        features: { type: 'array', items: { type: 'string' }, default: ['feature1', 'feature2'], required: true },
      },
    },
  };
  return (
    <div>
      <h1>Schema Form Example</h1>
      <JsonSchemaForm schema={schema} parentId=""/>
    </div>
  );
}

export default App;

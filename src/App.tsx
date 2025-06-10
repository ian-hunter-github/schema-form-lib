import JsonSchemaForm from './components/JsonSchemaForm';
import type { JSONSchemaProperties } from './types/schema';
import './App.css';

function App() {
  const schema: JSONSchemaProperties = {
    name: { type: 'string' },
    age: { type: 'number' },
    isStudent: { type: 'boolean' },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    tags: { type: 'array', items: { type: 'string' } },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        city: { type: 'string' },
        zipCode: { type: 'string', minLength: 5, maxLength: 10 },
      },
    },
  };
  return (
    <div>
      <h1>Schema Form Example</h1>
      <JsonSchemaForm schema={schema} />
    </div>
  );
}

export default App;

import JsonSchemaForm from './components/JsonSchemaForm';
import type { JSONSchemaProperties } from './components/JsonSchemaForm';
import './App.css';

function App() {
  const schema: JSONSchemaProperties = {
    name: { type: 'string' },
    age: { type: 'number' },
    isStudent: { type: 'boolean' },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    tags: { type: 'array', items: { type: 'string' } },
  };
  return (
    <div>
      <h1>Schema Form Example</h1>
      <JsonSchemaForm schema={schema} />
    </div>
  );
}

export default App;

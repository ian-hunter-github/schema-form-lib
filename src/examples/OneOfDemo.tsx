import React, { useState } from 'react';
import { OneOfField } from '../components/fields/OneOfField/OneOfField';
import { oneOfDemoSchema } from './schemas/oneOfDemoSchema';

export const OneOfDemo: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const handleChange = (path: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [path]: value
    }));
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Contact Method</h2>
      <OneOfField 
        schema={oneOfDemoSchema}
        path="contactMethod"
        onChange={handleChange}
      />
      <div style={{ marginTop: '2rem' }}>
        <h3>Current Data:</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

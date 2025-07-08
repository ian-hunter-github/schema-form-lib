import React from 'react';
import FormContainer from '../components/FormContainer';
import { useFormModel } from '../hooks/useFormModel';
import type { JSONSchema } from '../types/schema';

const FormContainerDemo: React.FC = () => {
  const demoSchema: JSONSchema = {
    type: 'object',
    properties: {
      personalInfo: {
        type: 'object',
        title: 'Personal Information',
        properties: {
          firstName: {
            type: 'string',
            title: 'First Name',
            minLength: 2,
            isRequired: true
          },
          lastName: {
            type: 'string',
            title: 'Last Name', 
            minLength: 2,
            isRequired: true
          },
          age: {
            type: 'number',
            title: 'Age',
            minimum: 18,
            maximum: 120
          }
        }
      },
      contactInfo: {
        type: 'object',
        title: 'Contact Information',
        properties: {
          email: {
            type: 'string',
            title: 'Email',
            format: 'email',
            isRequired: true
          },
          phone: {
            type: 'string',
            title: 'Phone Number',
            pattern: '^\\+?[0-9\\-\\s]+$'
          },
          subscribe: {
            type: 'boolean',
            title: 'Subscribe to newsletter'
          }
        }
      },
      addresses: {
        type: 'array',
        title: 'Shipping Addresses',
        items: {
          type: 'object',
          properties: {
            street: { type: 'string', isRequired: true },
            city: { type: 'string', isRequired: true },
            country: { type: 'string', isRequired: true },
            zip: { 
              type: 'string',
              pattern: '^\\d{5}(-\\d{4})?$'
            }
          }
        }
      }
    }
  };

  const { formModel } = useFormModel({
    schema: demoSchema,
    initialValues: {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        age: 30
      },
      contactInfo: {
        email: 'john@example.com',
        subscribe: true
      },
      addresses: [{
        street: '123 Main St',
        city: 'Anytown',
        country: 'USA'
      }]
    }
  });

  const handleSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
    alert(`Form submitted successfully!\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Form Container Demo</h2>
      <p>This demonstrates the FormContainer with:</p>
      <ul>
        <li>Nested object fields</li>
        <li>Array fields</li>
        <li>Field validation</li>
        <li>Default mouse event handlers</li>
      </ul>
      
      <FormContainer 
        formModel={formModel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default FormContainerDemo;

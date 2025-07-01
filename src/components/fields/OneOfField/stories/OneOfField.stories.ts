import type { Meta, StoryObj } from '@storybook/react-vite';
import { OneOfField } from '../OneOfField';

const meta: Meta<typeof OneOfField> = {
  title: 'Components/Fields/OneOfField',
  component: OneOfField,
  tags: ['autodocs'],
  argTypes: {
    schema: {
      control: 'object',
      description: 'JSONSchema with oneOf array'
    },
    path: {
      control: 'text',
      description: 'Path for form data'
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes'
    }
  }
};

export default meta;

type Story = StoryObj<typeof OneOfField>;

export const Basic: Story = {
  args: {
    path: 'example',
    schema: {
      type: 'object',
      oneOf: [
        {
          title: 'String Option',
          type: 'string',
          description: 'Select this for a text input'
        },
        {
          title: 'Number Option',
          type: 'number',
          description: 'Select this for a number input'
        }
      ]
    }
  }
};

export const ComplexOptions: Story = {
  args: {
    path: 'complex',
    schema: {
      type: 'object',
      oneOf: [
        {
          title: 'Person',
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        },
        {
          title: 'Company',
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            employees: { type: 'number' }
          }
        }
      ]
    }
  }
};

export const WithDefaultSelection: Story = {
  args: {
    path: 'withDefault',
    schema: {
      type: 'object',
      oneOf: [
        {
          title: 'Option A',
          type: 'string'
        },
        {
          title: 'Option B',
          type: 'number'
        },
        {
          title: 'Option C',
          type: 'boolean'
        }
      ]
    }
  }
};

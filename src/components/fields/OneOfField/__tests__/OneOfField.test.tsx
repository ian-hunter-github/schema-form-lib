import { render, screen, fireEvent } from '@testing-library/react';
import { OneOfField } from '../OneOfField';
import type { JSONSchema } from '../../../../types/schema';
import { describe, it, expect, vi } from 'vitest';

describe('OneOfField', () => {
  const mockSchema: JSONSchema = {
    type: 'object',
    oneOf: [
      {
        type: 'object',
        title: 'Email Option',
        properties: {
          value: { 
            type: 'string',
            format: 'email'
          }
        }
      },
      {
        type: 'object',
        title: 'Phone Option',
        properties: {
          value: {
            type: 'string',
            pattern: '^\\+?[0-9]{10,15}$'
          }
        }
      }
    ]
  };

  it('renders option selection buttons', () => {
    render(<OneOfField schema={mockSchema} path="test" />);
    expect(screen.getByText('Email Option')).toBeInTheDocument();
    expect(screen.getByText('Phone Option')).toBeInTheDocument();
  });

  it('switches between options when clicked', async () => {
    render(<OneOfField schema={mockSchema} path="test" />);
    
    fireEvent.click(screen.getByText('Phone Option'));
    expect(screen.getByText('Phone Option')).toHaveClass('active');
  });

  it('calls onChange when child field changes', async () => {
    const mockOnChange = vi.fn();
    render(<OneOfField schema={mockSchema} path="test" onChange={mockOnChange} />);
    
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('test', 'test@example.com');
  });

  it('does not render when schema has no oneOf', () => {
    const { container } = render(
      <OneOfField schema={{ type: 'string' }} path="test" />
    );
    expect(container.firstChild).toBeNull();
  });
});

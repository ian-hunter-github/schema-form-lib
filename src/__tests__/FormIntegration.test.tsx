import { render, screen, fireEvent } from './test-utils';
import { FormModel } from '../utils/form/FormModel';
import FormRenderer from '../components/FormRenderer';
import { testSchema } from './testSchema';
import { vi } from 'vitest';

// Mock FieldRenderer and LayoutContainer
interface MockFieldProps {
  field: {
    path: string;
    schema: {
      title: string;
    };
    value: string;
    onChange: (value: string) => void;
  };
}

interface MockLayoutProps {
  fields: Array<{
    path: string;
    schema: {
      title: string;
    };
    value: string;
  }>;
  onChange: (path: string, value: string) => void;
}

vi.mock('../components/FieldRenderer', () => ({
  default: ({ field }: MockFieldProps) => (
    <div>
      <label htmlFor={field.path}>{field.schema.title}</label>
      <input
        id={field.path}
        data-testid={`input-${field.path}`}
        value={field.value || ''}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </div>
  )
}));

vi.mock('../components/layout/LayoutContainer', () => ({
  default: ({ fields, onChange }: MockLayoutProps) => (
    <div>
      {fields.map((field) => (
        <div key={field.path}>
          <label htmlFor={field.path}>{field.schema.title}</label>
          <input
            id={field.path}
            data-testid={`input-${field.path}`}
            value={field.value || ''}
            onChange={(e) => onChange(field.path, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}));

describe('FormModel and FormRenderer Integration', () => {
  let formModel: FormModel;

  beforeEach(() => {
    formModel = new FormModel(testSchema);
  });

  test('should render form fields based on schema', () => {
    render(<FormRenderer formModel={formModel} />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  test('should update form model on field changes', () => {
    render(<FormRenderer formModel={formModel} />);
    const firstNameInput = screen.getByLabelText('First Name');
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    const field = formModel.getField('firstName');
    expect(field.value).toBe('John');
  });

  test('should validate form on submission', () => {
    const mockSubmit = vi.fn();
    render(<FormRenderer formModel={formModel} onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText('Submit'));
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(formModel.validate()).toBe(false);
  });
});

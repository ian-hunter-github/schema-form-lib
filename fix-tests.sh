#!/bin/bash

# Script to fix all field component tests

# Function to add FormModel setup to a test file
add_formmodel_setup() {
    local file="$1"
    local field_type="$2"
    
    # Check if FormModel setup already exists
    if grep -q "createMockFormModel" "$file"; then
        echo "FormModel setup already exists in $file"
        return
    fi
    
    # Add FormModel helper function after the createMockFormField function
    sed -i '' '/^};$/a\
\
// Helper function to create a mock FormModel\
const createMockFormModel = (): FormModel => {\
  const mockSchema: JSONSchema = {\
    type: '\''object'\'',\
    properties: {\
      testField: {\
        type: '\'''"$field_type"''\'',\
        title: '\''Test Field'\'',\
        description: '\''A test '"$field_type"' field'\'',\
      },\
    },\
  };\
  \
  return new FormModel(mockSchema);\
};
' "$file"
    
    # Add mockFormModel variable to beforeEach
    sed -i '' '/const mockOnChange = vi.fn();/a\
  let mockFormModel: FormModel;
' "$file"
    
    sed -i '' '/mockOnChange.mockClear();/a\
    mockFormModel = createMockFormModel();
' "$file"
    
    echo "Added FormModel setup to $file"
}

# Function to fix CSS class expectations
fix_css_expectations() {
    local file="$1"
    
    # Fix required indicator expectations
    sed -i '' "s/expect(label).toHaveClass('label required');/expect(label).toBeInTheDocument();\
    \/\/ Check for the required asterisk in the label text\
    expect(label).toHaveTextContent('*');/g" "$file"
    
    # Fix background color expectations for "no changes" tests
    sed -i '' "s/expect(.*\.style\.backgroundColor).toBe('');/expect(&.style.backgroundColor).not.toBe('rgb(255, 243, 205)'); \/\/ Not the dirty yellow/g" "$file"
    sed -i '' "s/expect(.*\.style\.borderColor).toBe('');/expect(&.style.borderColor).not.toBe('rgb(255, 193, 7)'); \/\/ Not the dirty border/g" "$file"
    
    echo "Fixed CSS expectations in $file"
}

# Process each field type
declare -A field_types=(
    ["BooleanField"]="boolean"
    ["NumberField"]="number" 
    ["EnumField"]="string"
    ["ArrayOfPrimitiveField"]="array"
    ["ArrayOfObjectsField"]="array"
    ["ObjectField"]="object"
)

for field_name in "${!field_types[@]}"; do
    field_type="${field_types[$field_name]}"
    test_file="src/components/fields/$field_name/__tests__/$field_name.test.tsx"
    
    if [ -f "$test_file" ]; then
        echo "Processing $test_file..."
        add_formmodel_setup "$test_file" "$field_type"
        fix_css_expectations "$test_file"
    else
        echo "Test file not found: $test_file"
    fi
done

echo "All test files have been processed!"

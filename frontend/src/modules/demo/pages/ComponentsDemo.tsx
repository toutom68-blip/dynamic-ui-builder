import React, { useState } from 'react';
import { DynamicInput } from '@/modules/shared/components/DynamicInput';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { DynamicDropdown } from '@/modules/shared/components/DynamicDropdown';
import { DynamicGrid } from '@/modules/shared/components/DynamicGrid';
import { DynamicFileUploader } from '@/modules/shared/components/DynamicFileUploader';
import { DynamicImage } from '@/modules/shared/components/DynamicImage';
import { DynamicSubMenu } from '@/modules/shared/components/DynamicSubMenu';
import { DynamicForm } from '@/modules/shared/components/DynamicForm';
import { Home, Settings, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const ComponentsDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValues, setMultiSelectValues] = useState<(string | number)[]>([]);

  const dropdownOptions = [
    { label: 'Option 1', value: '1', icon: <Home className="h-4 w-4" /> },
    { label: 'Option 2', value: '2', icon: <Settings className="h-4 w-4" /> },
    { label: 'Option 3', value: '3', icon: <Users className="h-4 w-4" /> },
  ];

  const gridData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin' },
  ];

  const gridColumns = [
    { key: 'id', title: 'ID', width: '80px', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role' },
  ];

  const menuItems = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: <Home className="h-4 w-4" />,
      onClick: () => toast.info('Dashboard clicked'),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings className="h-4 w-4" />,
      children: [
        { label: 'General', value: 'general', onClick: () => toast.info('General clicked') },
        { label: 'Security', value: 'security', onClick: () => toast.info('Security clicked') },
      ],
    },
    {
      label: 'Users',
      value: 'users',
      icon: <Users className="h-4 w-4" />,
      onClick: () => toast.info('Users clicked'),
    },
  ];

  const formFields = [
    {
      fieldType: 'input' as const,
      name: 'username',
      label: 'Username',
      placeholder: 'Enter username',
      required: true,
      validation: { required: true, minLength: 3 },
    },
    {
      fieldType: 'input' as const,
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
      required: true,
      validation: { required: true },
    },
    {
      fieldType: 'select' as const,
      name: 'role',
      label: 'Role',
      options: dropdownOptions,
      required: true,
      validation: { required: true },
    },
    {
      fieldType: 'textarea' as const,
      name: 'bio',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
    },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-6">Components Demo</h2>
        <p className="text-muted-foreground mb-8">
          Explore fully configurable, reusable components with extensive styling options.
        </p>
      </div>

      {/* Inputs Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Input</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DynamicInput
            type="text"
            placeholder="Standard input"
            value={inputValue}
            onChange={setInputValue}
          />
          <DynamicInput
            type="email"
            placeholder="Styled input"
            value={inputValue}
            onChange={setInputValue}
            backgroundColor="hsl(var(--muted))"
            borderColor="hsl(var(--primary))"
            borderWidth="2px"
          />
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <DynamicButton variant="primary" onClick={() => toast.success('Primary clicked')}>
            Primary
          </DynamicButton>
          <DynamicButton variant="secondary" onClick={() => toast.info('Secondary clicked')}>
            Secondary
          </DynamicButton>
          <DynamicButton variant="outline" icon={<FileText className="h-4 w-4" />}>
            With Icon
          </DynamicButton>
          <DynamicButton variant="destructive" size="lg">
            Large Destructive
          </DynamicButton>
          <DynamicButton variant="ghost" disabled>
            Disabled
          </DynamicButton>
        </div>
      </section>

      {/* Dropdowns Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Dropdowns</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm mb-2 text-muted-foreground">Single Select</p>
            <DynamicDropdown
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder="Select an option"
            />
          </div>
          <div>
            <p className="text-sm mb-2 text-muted-foreground">Multi Select</p>
            <DynamicDropdown
              options={dropdownOptions}
              value={multiSelectValues}
              onChange={setMultiSelectValues}
              multiSelect
              placeholder="Select multiple"
            />
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Grid</h3>
        <DynamicGrid
          columns={gridColumns}
          data={gridData}
          striped
          hoverable
          onRowClick={(row) => toast.info(`Clicked: ${row.name}`)}
        />
      </section>

      {/* File Uploader Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">File Uploader</h3>
        <DynamicFileUploader
          multiple
          maxSize={5}
          accept="image/*"
          onUpload={async (files) => {
            toast.success(`Uploaded ${files.length} file(s)`);
          }}
        />
      </section>

      {/* Image Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Image</h3>
        <DynamicImage
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
          alt="Workspace"
          width="100%"
          height="300px"
          borderRadius="12px"
        />
      </section>

      {/* SubMenu Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic SubMenu</h3>
        <DynamicSubMenu items={menuItems} collapsible />
      </section>

      {/* Dynamic Form Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">Dynamic Form</h3>
        <DynamicForm
          fields={formFields}
          layout="grid"
          columns={2}
          onSubmit={async (values) => {
            console.log('Form values:', values);
            toast.success('Form submitted successfully!');
          }}
          onCancel={() => toast.info('Form cancelled')}
        />
      </section>
    </div>
  );
};

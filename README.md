# Dynamic Component System

A comprehensive, fully configurable component library built with React, TypeScript, and Tailwind CSS. Every component accepts extensive styling and behavior props for maximum flexibility and reusability.

## Project Structure

```
├── frontend/          # Main React application (in src/)
│   ├── modules/       # Feature-based modules
│   │   ├── shared/    # Shared components, layouts, and utilities
│   │   └── demo/      # Demo module showcasing components
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── hooks/         # Custom React hooks
├── backend/           # Backend code (planned - use Lovable Cloud)
└── mobile/            # Mobile configurations (planned - PWA or Capacitor)
```

## Features

### Fully Configurable Components
Every component supports extensive customization through props:
- **Styling**: fontSize, fontColor, fontFamily, backgroundColor, backgroundImage
- **Borders**: borderColor, borderWidth, borderRadius, borderStyle
- **Layout**: width, height, padding, margin
- **Behavior**: disabled, hidden, onClick, onChange
- **Custom**: styleClass, content, htmlContent

### Component Library
- **DynamicInput** - Text inputs with full styling control
- **DynamicButton** - Buttons with variants, icons, and loading states
- **DynamicDropdown** - Single and multi-select dropdowns with search
- **DynamicGrid** - Data tables with sorting, infinite scroll, and row actions
- **DynamicFileUploader** - Single/multi file uploads with previews
- **DynamicImage** - Images with editing capabilities
- **DynamicSubMenu** - Hierarchical navigation menus
- **DynamicForm** - Complete form builder with validation

### Layout System
Configurable layout components:
- **Header** - Top navigation with full style control
- **Footer** - Bottom content area
- **Sidebar** - Side navigation panel
- **Content** - Main content wrapper
- **MainLayout** - Complete layout orchestration

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Usage Examples

### Basic Component Usage
```tsx
import { DynamicInput, DynamicButton } from '@/modules/shared/components';

<DynamicInput
  type="email"
  placeholder="Enter email"
  fontSize="16px"
  backgroundColor="hsl(var(--muted))"
  borderRadius="8px"
  onChange={(value) => console.log(value)}
/>

<DynamicButton
  variant="primary"
  size="lg"
  icon={<Icon />}
  onClick={() => alert('Clicked!')}
>
  Submit
</DynamicButton>
```

### Layout Configuration
```tsx
import { MainLayout } from '@/modules/shared/layout/MainLayout';

<MainLayout
  headerProps={{
    backgroundColor: "#ffffff",
    content: <YourHeader />
  }}
  sidebarProps={{
    hidden: false,
    width: "280px"
  }}
  footerProps={{
    backgroundColor: "#1a1a1a",
    fontColor: "#ffffff"
  }}
>
  <YourContent />
</MainLayout>
```

### Dynamic Form
```tsx
import { DynamicForm } from '@/modules/shared/components';

const fields = [
  {
    fieldType: 'input',
    name: 'email',
    label: 'Email',
    required: true,
    validation: { required: true }
  },
  // ... more fields
];

<DynamicForm
  fields={fields}
  layout="grid"
  columns={2}
  onSubmit={(values) => console.log(values)}
/>
```

## Architecture

### Modular Design
- **Module-based organization** - Features are grouped in logical modules
- **Shared module** - Common components and utilities accessible across the app
- **Custom hooks** - Reusable logic extracted into hooks
- **Type safety** - Full TypeScript coverage with comprehensive interfaces

### Design System
A complete design system in `index.css` and `tailwind.config.ts`:
- Semantic color tokens (primary, secondary, muted, accent, destructive)
- Layout-specific variables (header, footer, sidebar, content)
- Typography system (heading and body fonts)
- Consistent shadows, transitions, and borders

### Styling Architecture
- **No inline overrides** - All styles defined in the design system
- **Semantic tokens** - Colors referenced through CSS variables
- **Utility builder** - Centralized style building in `styleBuilder.ts`
- **Component variants** - Defined variants for different use cases

## Backend Integration (Coming Soon)

Enable backend functionality with **Lovable Cloud**:
- User authentication
- Database storage
- File uploads
- Serverless functions
- API integrations

## Mobile Conversion (Coming Soon)

Convert to mobile app using:
- **PWA** - Installable web app for all devices
- **Capacitor** - Native iOS/Android apps with full device access

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool
- **shadcn/ui** - Base component library
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Lucide React** - Icons

## Documentation

Visit the [Lovable Docs](https://docs.lovable.dev/) for more information about:
- Component customization
- Backend setup
- Mobile deployment
- Best practices

## License

This is a Lovable-generated project. Customize and deploy as needed.

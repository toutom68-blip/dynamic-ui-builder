# Shared Components Documentation

## DynamicPopup Component

A reusable popup/dialog component for confirmations and information messages.

### Usage with usePopup Hook

```tsx
import { usePopup } from '@/hooks/usePopup';
import { DynamicPopup } from '@/modules/shared/components/DynamicPopup';

const MyComponent = () => {
  const popup = usePopup();

  const handleDelete = () => {
    popup.showConfirmation(
      'Delete Item',
      'Are you sure you want to delete this item?',
      async () => {
        // Your delete logic here
        await api.delete('/item/123');
      }
    );
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <DynamicPopup
        open={popup.isOpen}
        onOpenChange={popup.hidePopup}
        {...popup.config}
      />
    </>
  );
};
```

### Popup Types

- **confirmation**: Shows confirm and cancel buttons
- **info**: Shows only OK button
- **error**: Error message with OK button
- **warning**: Warning message with OK button
- **success**: Success message with OK button

### usePopup Methods

- `showConfirmation(title, description?, onConfirm?, onCancel?)`
- `showInfo(title, description?, onConfirm?)`
- `showError(title, description?, onConfirm?)`
- `showWarning(title, description?, onConfirm?)`
- `showSuccess(title, description?, onConfirm?)`

## Loading System

### LoadingSpinner Component

A flexible loading spinner with different sizes and optional text.

```tsx
import { LoadingSpinner } from '@/modules/shared/components/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// With text and size
<LoadingSpinner size="lg" text="Loading data..." />

// Full screen overlay
<LoadingSpinner fullScreen size="xl" text="Please wait..." />
```

### LoadingProvider & useLoading Hook

Global loading state management integrated with axios.

```tsx
import { useLoading } from '@/contexts/LoadingContext';

const MyComponent = () => {
  const { startLoading, stopLoading } = useLoading();

  const handleManualLoading = async () => {
    startLoading('Processing...');
    try {
      await someOperation();
    } finally {
      stopLoading();
    }
  };

  return <button onClick={handleManualLoading}>Start</button>;
};
```

### Automatic Loading with API Calls

Loading is automatically triggered for all axios API calls. To disable auto-loading for specific requests:

```tsx
import { api } from '@/lib/axios';

// This will show loading
await api.get('/data');

// This will NOT show loading
await api.get('/data', {
  headers: { 'x-no-loading': 'true' }
});
```

### LoadingPage Component

A full-page loading component for route transitions.

```tsx
import { LoadingPage } from '@/modules/shared/pages/LoadingPage';

<LoadingPage text="Loading your data..." />
```

## Example

See `src/modules/shared/examples/PopupExample.tsx` for a complete working example.

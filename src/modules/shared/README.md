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

### SkeletonLoader Component

A flexible skeleton loading component with multiple variants for different use cases.

```tsx
import { SkeletonLoader, AutocompleteListSkeleton, GridTableSkeleton } from '@/modules/shared/components/SkeletonLoader';

// Basic usage with variants
<SkeletonLoader variant="text" />
<SkeletonLoader variant="avatar" />
<SkeletonLoader variant="card" showImage lines={3} />
<SkeletonLoader variant="listItem" count={5} />
<SkeletonLoader variant="tableRow" />
<SkeletonLoader variant="autocompleteItem" />
<SkeletonLoader variant="calendarEvent" />

// Specialized components
<AutocompleteListSkeleton count={4} />
<GridTableSkeleton rows={5} columns={5} />
<CalendarGridSkeleton />
<MapSearchSkeleton />
```

### Available Variants

- **text**: Single line text placeholder
- **title**: Larger title placeholder  
- **avatar**: Circular avatar placeholder
- **thumbnail**: Square image thumbnail
- **card**: Full card with optional image, avatar, and text lines
- **listItem**: List item with avatar and text
- **tableRow**: Table row with multiple columns
- **autocompleteItem**: Dropdown item with icon and text
- **calendarEvent**: Calendar event placeholder
- **mapMarker**: Map marker placeholder
- **custom**: Custom dimensions with width/height props

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

### Components with Built-in Skeleton Loading

- **DynamicAutocomplete**: Shows skeleton placeholders while fetching API results
- **DynamicGrid**: Enhanced skeleton rows during data loading
- **DynamicEventCalendar**: Calendar grid skeleton during lazy loading
- **MapSearch**: Loading overlay while map initializes and searching

## Example

See `src/modules/shared/examples/PopupExample.tsx` for a complete working example.

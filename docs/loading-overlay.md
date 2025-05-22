# Loading Overlay System

This documentation provides comprehensive instructions on how to use the loading overlay components in your project.

## Overview

The loading system consists of several integrated parts:

1. `LoadingOverlay`: A component that renders loading indicators with messages using React Portal
2. `LoadingProvider`: A context provider for application-wide loading states
3. `useLoading`: A hook for component-level loading states
4. `useApiLoading`: A specialized hook for API calls with loading states

## Global Loading (Application-wide)

For application-wide loading indicators (e.g. during navigation, authentication):

1. Make sure the `LoadingProvider` is wrapping your application in `App.tsx` (already done)

2. Use the `useLoadingContext` hook to access the global loading state:

```tsx
import { useLoadingContext } from "@/components/ui/LoadingContext";
import type { LoadingVariant } from "@/components/ui/LoadingOverlay";

function YourComponent() {
  const { showLoading, hideLoading, updateMessage, updateVariant } = useLoadingContext();
  
  const handleOperation = async () => {
    // Start with initial message and specified variant
    showLoading("Processing...", "spinner"); // spinner, dots, or pulse
    
    try {
      // Your async operations
      await someApiCall();
      
      // Optionally update the message during processing
      updateMessage("Almost done...");
      
      // Change the animation style if desired
      updateVariant("pulse");
      
      await anotherApiCall();
    } finally {
      // Always hide the loading indicator when done
      hideLoading();
    }
  };
  
  return <button onClick={handleOperation}>Start Operation</button>;
}
```

### Available Loading Variants

The `LoadingOverlay` component supports three different loading animations:

1. **spinner**: A rotating border spinner (default)
2. **dots**: Three bouncing dots animation
3. **pulse**: A pulsing circle animation

## Component-Level Loading

For component-specific loading (when you don't want to block the entire screen):

```tsx
import { useLoading } from "@/hooks/useLoading";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

function YourComponent() {
  const { 
    isLoading, 
    message, 
    startLoading, 
    stopLoading, 
    updateMessage 
  } = useLoading();
  
  const handleOperation = async () => {
    startLoading("Working...");
    
    try {
      // Your component-specific operations
      await someOperation();
      
      // Update the message if needed
      updateMessage("Finalizing...");
      
      await finalOperation();
    } finally {
      stopLoading();
    }
  };
  
  return (
    <div>
      <button onClick={handleOperation} disabled={isLoading}>Start</button>
      <LoadingOverlay isLoading={isLoading} message={message} />
    </div>
  );
}
```

## API Loading Hook

The `useApiLoading` hook is specifically designed for API calls with integrated loading state management:

```tsx
import { useApiLoading } from "@/hooks/useApiLoading";

function DataFetcher() {
  const { 
    loading, 
    error, 
    data, 
    execute 
  } = useApiLoading({
    useGlobalLoader: true,           // Use the global loading overlay 
    initialMessage: "Fetching data...",
    successMessage: "Data retrieved!",
    errorMessage: "Failed to fetch data",
    showSuccessState: true,          // Show success message before hiding
    successStateDuration: 1000       // How long to show success message
  });
  
  const fetchData = async () => {
    // execute wraps your API call with loading state management
    const result = await execute(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    });
    
    if (result) {
      // Do something with the result
      console.log(result);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data'}
      </button>
      {error && <p className="error">{error.message}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Contained Loading (Non-Fullscreen)

You can use the `LoadingOverlay` component in a specific container rather than fullscreen:

```tsx
<div className="relative h-64 border rounded">
  <p>Content in the container...</p>
  
  <LoadingOverlay 
    isLoading={loading} 
    message="Loading..." 
    fullScreen={false}
  />
</div>
```

## Best Practices

1. **Error Handling**: Always use try/finally to ensure the loading state is cleared even if an error occurs.
2. **Sequential Operations**: Use `updateMessage` to keep users informed during multi-step processes.
3. **Timeouts**: Consider adding small delays when showing success messages before navigation.
4. **Prevent Flashes**: The overlay has a built-in delay to prevent flashes for quick operations.
5. **Loading Variants**: Choose the appropriate animation style based on the context of the operation.

## Examples

See `LoadingDemo.tsx` for a complete example of all loading approaches and variants.

## OAuth Integration

The OAuth redirect component (in `src/routes/_auth/oauth-redirect.tsx`) demonstrates how to use the loading overlay during authentication flows. It shows success and error states during the OAuth process.

## Accessibility Considerations

The loading overlay system is designed with accessibility in mind:
- It uses appropriate ARIA attributes
- Provides visual feedback through animations
- Includes text descriptions of the loading state

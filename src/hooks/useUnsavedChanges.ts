import { useEffect, useState } from 'react';

import { type UseFormReturn } from 'react-hook-form';
import { type FieldValues } from 'react-hook-form';

interface UseUnsavedChangesOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  defaultValues: T;
  isOpen: boolean;
  /** Minimum changes required to show warning (default: any change) */
  significanceThreshold?: (values: T, defaultValues: T) => boolean;
}

/**
 * Hook to detect unsaved changes in a form and provide confirmation before losing data
 */
export function useUnsavedChanges<T extends Record<string, any>>({
  form,
  defaultValues,
  isOpen,
  significanceThreshold
}: UseUnsavedChangesOptions<T>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Watch all form values
  const currentValues = form.watch();

  // Check if changes are significant
  const checkSignificance = (values: T, defaults: T): boolean => {
    if (significanceThreshold) {
      return significanceThreshold(values, defaults);
    }

    // Default: any non-empty field is significant
    return Object.keys(values).some((key) => {
      const value = values[key];
      const defaultValue = defaults[key];

      // Handle different types of form fields
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return (
          Object.keys(value).length > 0 &&
          Object.values(value).some(
            (v) => v !== '' && v !== null && v !== undefined
          )
        );
      }
      if (typeof value === 'string') {
        return value.trim() !== '' && value !== defaultValue;
      }

      return value !== defaultValue;
    });
  };

  // Update unsaved changes status
  useEffect(() => {
    if (isOpen) {
      const hasChanges = checkSignificance(currentValues, defaultValues);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [currentValues, defaultValues, isOpen]);

  const resetForm = () => {
    form.reset(defaultValues);
    setHasUnsavedChanges(false);
  };

  return {
    hasUnsavedChanges,
    resetForm,
    currentValues
  };
}

import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';

import type { ApplicationType } from '../dashboard.types';
import { useUpdateJobApplication } from '../hooks/useUpdateJobApplication';

interface EditableSalaryCellProps {
  application: ApplicationType;
}

export function EditableSalaryCell({ application }: EditableSalaryCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(
    application.salary ? String(application.salary) : ''
  );
  const { updateJobApplication, loading } = useUpdateJobApplication();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(application.salary ? String(application.salary) : '');
  }, [application.salary]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return '';
    return amount.toLocaleString();
  };

  const parseNumberFromInput = (input: string): number | null => {
    // Remove all non-digit characters except decimal point
    const cleaned = input.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : Math.round(parsed);
  };

  const handleSave = async () => {
    const numericValue = parseNumberFromInput(value);
    const originalValue = application.salary;

    if (numericValue !== originalValue) {
      try {
        await updateJobApplication({
          variables: {
            id: application.id,
            salary: numericValue
          }
        });
        // Apollo's cache update will automatically refresh the UI
      } catch (_error) {
        setValue(originalValue ? String(originalValue) : '');
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(application.salary ? String(application.salary) : '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow digits
    const digitsOnly = inputValue.replace(/\D/g, '');
    setValue(digitsOnly);
  };

  if (isEditing) {
    return (
      <div className="text-right">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-8 py-1 px-2 text-right"
          placeholder="Enter salary"
          disabled={loading}
          inputMode="numeric"
          pattern="[0-9]*"
        />
      </div>
    );
  }

  return (
    <div
      className="text-right font-medium cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-h-[2rem] flex items-center justify-end"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {formatCurrency(application.salary) || 0}
    </div>
  );
}

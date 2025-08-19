import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { DISPLAY_LIMITS } from '../dashboard.constants';
import type { ApplicationType } from '../dashboard.types';
import { useUpdateJobApplication } from '../hooks/useUpdateJobApplication';

interface EditablePositionCellProps {
  application: ApplicationType;
}

export function EditablePositionCell({
  application
}: EditablePositionCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(application.positionTitle || '');
  const { updateJobApplication, loading } = useUpdateJobApplication();
  const inputRef = useRef<HTMLInputElement>(null);

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return text;

    // Only truncate if the text is actually longer than maxLength + 3 (for "...")
    // This ensures we only truncate when it actually saves space
    if (text.length <= maxLength + 3) return text;

    return text.substring(0, maxLength).trim() + '...';
  };

  const truncatedTitle = truncateText(
    application.positionTitle || '',
    DISPLAY_LIMITS.POSITION_TITLE_DISPLAY_LENGTH
  );
  const shouldShowTooltip =
    (application.positionTitle || '').length >
    DISPLAY_LIMITS.POSITION_TITLE_DISPLAY_LENGTH + 3;

  useEffect(() => {
    setValue(application.positionTitle || '');
  }, [application.positionTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value !== application.positionTitle) {
      try {
        await updateJobApplication({
          variables: {
            id: application.id,
            positionTitle: value
          }
        });
        // Apollo's cache update will automatically refresh the UI
      } catch (_error) {
        // Reset to original value on error
        setValue(application.positionTitle || '');
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(application.positionTitle || '');
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

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 py-1 px-2"
        disabled={loading}
      />
    );
  }

  const renderCell = () => (
    <div
      className="capitalize cursor-text hover:bg-muted/50 rounded px-2 py-1 min-h-[2rem] flex items-center"
      onClick={() => setIsEditing(true)}
      title={shouldShowTooltip ? undefined : 'Click to edit'}
    >
      {truncatedTitle || 'Click to edit'}
    </div>
  );

  if (shouldShowTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{renderCell()}</TooltipTrigger>
          <TooltipContent>
            <p>{application.positionTitle}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderCell();
}

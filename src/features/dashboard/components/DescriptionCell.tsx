import React, { useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { DISPLAY_LIMITS } from '../dashboard.constants';

interface DescriptionCellProps {
  description: string;
}

export const DescriptionCell: React.FC<DescriptionCellProps> = ({
  description
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Get first N meaningful characters (non-whitespace)
  const getMeaningfulChars = (text: string, count: number): string => {
    if (!text) return '';

    // Remove extra whitespace and get meaningful characters
    const cleaned = text.replace(/\s+/g, ' ').trim();

    // Only truncate if the text is actually longer than count + 3 (for "...")
    // This ensures we only truncate when it actually saves space
    if (cleaned.length <= count + 3) {
      return cleaned;
    }

    // Find the last complete word within the character limit
    const truncated = cleaned.substring(0, count);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    // If there's a space, cut at the word boundary; otherwise just truncate
    const result =
      lastSpaceIndex > count * 0.6
        ? truncated.substring(0, lastSpaceIndex)
        : truncated;

    return result + '...';
  };

  const truncatedText = getMeaningfulChars(
    description,
    DISPLAY_LIMITS.DESCRIPTION_PREVIEW_LENGTH
  );

  if (!description || description.trim() === '') {
    return <div className="text-muted-foreground">No description</div>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                className="text-left hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
                onClick={() => setIsPopoverOpen(true)}
              >
                {truncatedText}
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <p>Click to see more</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          className="w-96 max-h-80 overflow-y-auto p-4"
          align="start"
          side="top"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm text-muted-foreground">
                Job Description
              </h4>
              <span className="text-xs text-muted-foreground">
                {description.length.toLocaleString()} characters
              </span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {description}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};

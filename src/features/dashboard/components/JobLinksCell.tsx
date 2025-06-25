import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { DISPLAY_LIMITS } from '../dashboard.constants';

interface JobLinksCellProps {
  links: string[];
}

export const JobLinksCell: React.FC<JobLinksCellProps> = ({ links }) => {
  if (!links || links.length === 0) {
    return <span className="text-muted-foreground">No links</span>;
  }

  // Get the first link for display
  const firstLink = links[0];
  const truncateUrl = (url: string, maxLength: number): string => {
    if (!url) return url;

    // Only truncate if the URL is actually longer than maxLength + 3 (for "...")
    // This ensures we only truncate when it actually saves space
    if (url.length <= maxLength + 3) return url;

    return url.substring(0, maxLength).trim() + '...';
  };

  const truncatedLink = truncateUrl(
    firstLink,
    DISPLAY_LIMITS.JOB_LINKS_DISPLAY_LENGTH
  );
  const shouldShowTooltip =
    firstLink.length > DISPLAY_LIMITS.JOB_LINKS_DISPLAY_LENGTH + 3;

  const renderLink = () => (
    <a
      href={firstLink}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline cursor-pointer"
      title={shouldShowTooltip ? undefined : firstLink}
    >
      {truncatedLink}
      {links.length > 1 && (
        <span className="ml-1 text-muted-foreground text-xs">
          (+{links.length - 1} more)
        </span>
      )}
    </a>
  );

  if (shouldShowTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{renderLink()}</TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-medium">
                Job Link{links.length > 1 ? 's' : ''}:
              </p>
              {links.slice(0, 3).map((link, index) => (
                <p key={index} className="text-xs break-all">
                  {link}
                </p>
              ))}
              {links.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  ...and {links.length - 3} more
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderLink();
};

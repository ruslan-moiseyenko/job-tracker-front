import React from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { DISPLAY_LIMITS } from '../dashboard.constants';

interface CompanyCellProps {
  company: {
    id: string;
    name: string;
  };
}

export const CompanyCell: React.FC<CompanyCellProps> = ({ company }) => {
  if (!company?.name) {
    return <span className="text-muted-foreground">No company</span>;
  }

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return text;

    // Only truncate if the text is actually longer than maxLength + 3 (for "...")
    // This ensures we only truncate when it actually saves space
    if (text.length <= maxLength + 3) return text;

    return text.substring(0, maxLength).trim() + '...';
  };

  const truncatedName = truncateText(
    company.name,
    DISPLAY_LIMITS.COMPANY_NAME_DISPLAY_LENGTH
  );
  const shouldShowTooltip =
    company.name.length > DISPLAY_LIMITS.COMPANY_NAME_DISPLAY_LENGTH + 3;

  const renderCompany = () => <div className="capitalize">{truncatedName}</div>;

  if (shouldShowTooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>{renderCompany()}</TooltipTrigger>
          <TooltipContent>
            <p>{company.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return renderCompany();
};

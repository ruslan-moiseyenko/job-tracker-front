import React from 'react';

import { Skull, Star } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { CompanyFragment } from '@/features/dashboard/graphql/fragments';

import { DISPLAY_LIMITS } from '../dashboard.constants';
import { CompanySheet } from './company-sheet/company-sheet';

interface CompanyCellProps {
  company: CompanyFragment;
}

export const CompanyCell: React.FC<CompanyCellProps> = ({ company }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);
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

  const getStatusIcon = () => {
    if (company.isBlacklisted) {
      return <Skull size={12} className="absolute -top-2 right-0" />;
    }
    if (company.isFavorite) {
      return <Star size={12} className="absolute -top-2 right-0" />;
    }
    return null;
  };

  const renderCompany = () => (
    <button
      type="button"
      onClick={openSheet}
      className="capitalize relative text-left w-full hover:underline hover:text-primary underline-offset-4 cursor-pointer"
      aria-label={`Open company ${company.name}`}
    >
      {getStatusIcon()}
      {truncatedName}
    </button>
  );

  return (
    <>
      {shouldShowTooltip ? (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>{renderCompany()}</TooltipTrigger>
            <TooltipContent>
              <p>{company.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderCompany()
      )}

      <CompanySheet
        companyId={company.id}
        isOpen={isOpen}
        onClose={closeSheet}
      />
    </>
  );
};

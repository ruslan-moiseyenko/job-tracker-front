import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Building2, Check, Loader2 } from 'lucide-react';

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  type Company,
  useSearchCompanies
} from '@/dashboard/hooks/useSearchCompanies';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';

export type CompanySelection =
  | {
      id?: string; // If present, it's an existing company
      name: string; // Company name (always present)
    }
  | null
  | undefined;

interface CompanyAutocompleteProps {
  value?: CompanySelection;
  onChange: (selection: CompanySelection) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter company name...',
  disabled = false,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { companies, loading, setSearchTerm } = useSearchCompanies();

  // Handle clicking outside to close dropdown
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (open) {
      setOpen(false);
    }
  });

  // Sync input value with prop value on mount and when value changes from outside
  useEffect(() => {
    // Only sync if the value is different AND we're not currently editing
    if (value?.name !== undefined && value.name !== inputValue) {
      setInputValue(value.name);
    } else if (value === undefined || value === null) {
      setInputValue('');
    }
  }, [value?.name]); // Only depend on the name property

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);

    if (newValue.trim() === '') {
      setSearchTerm('');
      onChange(undefined);
      setOpen(false);
    } else {
      onChange({ name: newValue.trim() });
      setSearchTerm(newValue);
      setOpen(true);
    }
  };

  const handleSelectExistingCompany = (company: Company) => {
    setInputValue(company.name);
    setSearchTerm(''); // Clear search to prevent conflicts
    onChange({ id: company.id, name: company.name }); // Only existing companies have IDs
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setOpen(false); // Just close dropdown on Enter
    }
  };

  const showDropdown = useMemo(
    () => open && inputValue.trim().length >= 2 && companies.length > 0,
    [open, inputValue, companies.length]
  );

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-8',
            value?.id && 'border-green-500 bg-green-50' // Existing company styling
          )}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {value?.id && <Check className="h-4 w-4 text-green-600" />}
          {value && !value.id && (
            <Building2 className="h-4 w-4 text-blue-600" />
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 border rounded-md bg-background shadow-lg mt-1 max-h-[200px] overflow-auto">
          <Command shouldFilter={false}>
            <CommandList>
              {companies.length > 0 && (
                <CommandGroup heading="Existing Companies">
                  {companies.map((company) => (
                    <CommandItem
                      key={company.id}
                      onSelect={() => handleSelectExistingCompany(company)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-green-600" />
                        <span>{company.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {/* Visual indicator of selection type */}
      {value && (
        <div className="mt-1 text-xs">
          {value.id ? (
            <span className="text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Existing company selected
            </span>
          ) : (
            <span className="text-blue-600 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              New company will be created
            </span>
          )}
        </div>
      )}
    </div>
  );
};

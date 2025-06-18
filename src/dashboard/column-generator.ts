import React from 'react';

import type { ColumnDef } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { CurrentStageSelectCell } from './components/CurrentStageSelectCell';
import { EditablePositionCell } from './components/EditablePositionCell';
import { EditableSalaryCell } from './components/EditableSalaryCell';
import {
  type AllColumnKeys,
  APPLICATION_COLUMN_CONFIGS,
  type ColumnConfig
} from './dashboard.constants';
import type { ApplicationType } from './dashboard.types';

// Type-safe column generators based on configuration
export const generateColumnFromConfig = (
  config: ColumnConfig
): ColumnDef<ApplicationType> => {
  const { key } = config;

  // Handle special columns
  if (key === 'select') {
    return {
      id: key,
      header: ({ table }) =>
        React.createElement(Checkbox, {
          checked:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate'),
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Select all'
        }),
      cell: ({ row }) =>
        React.createElement(Checkbox, {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          'aria-label': 'Select row'
        }),
      enableSorting: false,
      enableHiding: false
    };
  }

  if (key === 'actions') {
    return {
      id: key,
      enableHiding: false,
      cell: ({ row }) => {
        const application = row.original;
        return React.createElement(
          DropdownMenu,
          null,
          React.createElement(
            DropdownMenuTrigger,
            { asChild: true },
            React.createElement(
              Button,
              { variant: 'ghost', className: 'h-8 w-8 p-0' },
              React.createElement(
                'span',
                { className: 'sr-only' },
                'Open menu'
              ),
              React.createElement(MoreHorizontal)
            )
          ),
          React.createElement(
            DropdownMenuContent,
            { align: 'end', className: 'bg-secondary' },
            React.createElement(DropdownMenuLabel, null, 'Actions'),
            React.createElement(
              DropdownMenuItem,
              {
                onClick: () => navigator.clipboard.writeText(application.id)
              },
              'Copy application ID'
            ),
            React.createElement(DropdownMenuSeparator),
            React.createElement(DropdownMenuItem, null, 'View details'),
            React.createElement(DropdownMenuItem, null, 'Edit application')
          )
        );
      }
    };
  }

  // Handle data columns with custom renderers
  return generateDataColumn(key as keyof ApplicationType, config);
};

// Generate data columns with proper typing
const generateDataColumn = (
  key: keyof ApplicationType,
  config: ColumnConfig
): ColumnDef<ApplicationType> => {
  const baseColumn: ColumnDef<ApplicationType> = {
    accessorKey: key,
    header: config.label,
    enableSorting: config.sortable ?? true,
    enableHiding: config.hideable ?? true
  };

  // Add custom cell renderers based on data type
  switch (key) {
    case 'company':
      return {
        ...baseColumn,
        cell: ({ row }) => {
          const company = row.getValue(key) as {
            id: string;
            name: string;
          };
          return React.createElement(
            'div',
            { className: 'capitalize' },
            company?.name
          );
        },
        filterFn: (row, id, value) => {
          const company = row.getValue(id) as { id: string; name: string };
          return company?.name?.toLowerCase().includes(value.toLowerCase());
        }
      };

    case 'currentStage':
      return {
        ...baseColumn,
        cell: ({ row }) => {
          const application = row.original;
          return React.createElement(CurrentStageSelectCell, { application });
        },
        filterFn: (row, id, value) => {
          const stage = row.getValue(id) as {
            id: string;
            name: string;
            order: number;
            color: string;
          };
          return value.includes(stage?.name?.toLowerCase());
        }
      };

    case 'jobLinks':
      return {
        ...baseColumn,
        cell: ({ row }) => {
          const links = row.getValue(key) as string[];
          return links && links.length > 0
            ? React.createElement(
                'a',
                {
                  href: links[0],
                  target: '_blank',
                  rel: 'noreferrer'
                },
                String(links[0].slice(0, 15) + '...')
              )
            : null;
        }
      };

    case 'salary':
      return {
        ...baseColumn,
        header: () =>
          React.createElement('div', { className: 'text-right' }, config.label),
        cell: ({ row }) => {
          const application = row.original;
          return React.createElement(EditableSalaryCell, { application });
        }
      };

    case 'positionTitle':
      return {
        ...baseColumn,
        cell: ({ row }) => {
          const application = row.original;
          return React.createElement(EditablePositionCell, { application });
        }
      };

    case 'applicationDate':
    case 'createdAt':
    case 'updatedAt':
      return {
        ...baseColumn,
        cell: ({ row }) => {
          const date = row.getValue(key) as string | Date;
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          return React.createElement('div', null, dateObj.toLocaleDateString());
        }
      };

    default:
      return {
        ...baseColumn,
        cell: ({ row }) =>
          React.createElement('div', null, String(row.getValue(key)))
      };
  }
};

// Generate all columns automatically from configuration
export const generateAllColumns = (
  visibleColumnKeys?: AllColumnKeys[]
): ColumnDef<ApplicationType>[] => {
  const columnsToShow =
    visibleColumnKeys ||
    (Object.keys(APPLICATION_COLUMN_CONFIGS) as AllColumnKeys[]);

  return columnsToShow
    .map((key) => APPLICATION_COLUMN_CONFIGS[key])
    .filter(Boolean)
    .map(generateColumnFromConfig);
};

// Generate only data columns (exclude special columns and never-shown columns)
export const generateDataColumns = (): ColumnDef<ApplicationType>[] => {
  const dataKeys = Object.keys(APPLICATION_COLUMN_CONFIGS).filter((key) => {
    // Exclude special columns
    if (key === 'select' || key === 'actions') return false;
    // Exclude columns that should never be shown
    if (key === 'id' || key === 'customColor') return false;
    return true;
  }) as AllColumnKeys[];

  return dataKeys
    .map((key) => APPLICATION_COLUMN_CONFIGS[key])
    .filter(Boolean)
    .map(generateColumnFromConfig);
};

// Helper to generate columns with select and actions (includes updatedAt for user selection)
export const generateStandardColumns = (): ColumnDef<ApplicationType>[] => {
  return [
    generateColumnFromConfig(APPLICATION_COLUMN_CONFIGS.select),
    ...generateDataColumns(),
    generateColumnFromConfig(APPLICATION_COLUMN_CONFIGS.actions)
  ];
};

// Export specific column generators for advanced use cases
export const generateSelectColumn = (): ColumnDef<ApplicationType> => {
  return generateColumnFromConfig(APPLICATION_COLUMN_CONFIGS.select);
};

export const generateActionsColumn = (): ColumnDef<ApplicationType> => {
  return generateColumnFromConfig(APPLICATION_COLUMN_CONFIGS.actions);
};

// Generate columns by specific keys with type safety
export const generateColumnsByKeys = (
  keys: AllColumnKeys[]
): ColumnDef<ApplicationType>[] => {
  return keys
    .map((key) => APPLICATION_COLUMN_CONFIGS[key])
    .filter(Boolean)
    .map(generateColumnFromConfig);
};

// Helper to generate columns with custom configuration overrides
export const generateCustomColumns = (
  overrides: Partial<Record<AllColumnKeys, Partial<ColumnConfig>>>
): ColumnDef<ApplicationType>[] => {
  const keys = Object.keys(APPLICATION_COLUMN_CONFIGS) as AllColumnKeys[];

  return keys.map((key) => {
    const baseConfig = APPLICATION_COLUMN_CONFIGS[key];
    const override = overrides[key];
    const mergedConfig = override ? { ...baseConfig, ...override } : baseConfig;

    return generateColumnFromConfig(mergedConfig);
  });
};

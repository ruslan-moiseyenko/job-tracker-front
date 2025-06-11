import type { Table } from '@tanstack/react-table';

import {
  type AllColumnKeys,
  APPLICATION_COLUMN_CONFIGS,
  APPLICATION_COLUMNS,
  type ColumnConfig
} from './dashboard.constants';
import type { ApplicationType } from './dashboard.types';

// Helper function to get a column with type safety
export const getApplicationColumn = (
  table: Table<ApplicationType>,
  columnKey: string
) => {
  return table.getColumn(columnKey);
};

// Type-safe column keys type
export type ApplicationColumnKey =
  (typeof APPLICATION_COLUMNS)[keyof typeof APPLICATION_COLUMNS];

// Helper to ensure we're using valid column keys
export const isValidApplicationColumn = (
  key: string
): key is ApplicationColumnKey => {
  return Object.values(APPLICATION_COLUMNS).includes(
    key as ApplicationColumnKey
  );
};

// NEW: Enhanced utilities using the type-safe approach

// Get column configuration by key
export const getColumnConfig = (
  key: AllColumnKeys
): ColumnConfig | undefined => {
  return APPLICATION_COLUMN_CONFIGS[key];
};

// Get all visible columns based on configuration
export const getVisibleColumns = (
  hiddenColumns: string[] = []
): ColumnConfig[] => {
  return Object.values(APPLICATION_COLUMN_CONFIGS).filter(
    (config) => !hiddenColumns.includes(config.key)
  );
};

// Get column label by key
export const getColumnLabel = (key: AllColumnKeys): string => {
  return APPLICATION_COLUMN_CONFIGS[key]?.label || key;
};

// Check if a column can be filtered
export const isColumnFilterable = (key: AllColumnKeys): boolean => {
  return APPLICATION_COLUMN_CONFIGS[key]?.filterable || false;
};

// Check if a column can be sorted
export const isColumnSortable = (key: AllColumnKeys): boolean => {
  return APPLICATION_COLUMN_CONFIGS[key]?.sortable || false;
};

// Check if a column can be hidden
export const isColumnHideable = (key: AllColumnKeys): boolean => {
  return APPLICATION_COLUMN_CONFIGS[key]?.hideable || false;
};

// Type guard to check if a string is a valid column key
export const isValidColumnKey = (key: string): key is AllColumnKeys => {
  return key in APPLICATION_COLUMN_CONFIGS;
};

// Get default column widths
export const getColumnWidth = (key: AllColumnKeys): string | undefined => {
  return APPLICATION_COLUMN_CONFIGS[key]?.width;
};

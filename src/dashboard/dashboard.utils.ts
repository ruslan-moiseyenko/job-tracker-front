import type { Table } from '@tanstack/react-table';

import { APPLICATION_COLUMNS } from './dashboard.constants';
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

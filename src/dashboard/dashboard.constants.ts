import type { Table } from '@tanstack/react-table';

import type { ApplicationType } from './dashboard.types';

// Type-safe column keys based on ApplicationType
export const APPLICATION_COLUMNS = {
  SELECT: 'select',
  COMPANY: 'company',
  POSITION_TITLE: 'positionTitle',
  CURRENT_STAGE: 'currentStage',
  JOB_LINKS: 'jobLinks',
  SALARY: 'salary',
  ACTIONS: 'actions'
} as const;

// Type to ensure column keys match ApplicationType properties
type ApplicationColumnKeys = {
  [K in keyof typeof APPLICATION_COLUMNS]: K extends 'SELECT' | 'ACTIONS'
    ? string
    : (typeof APPLICATION_COLUMNS)[K] extends keyof ApplicationType
      ? (typeof APPLICATION_COLUMNS)[K]
      : never;
};

// Verify our constants match the type (this will cause a compile error if they don't match)
const _typeCheck: ApplicationColumnKeys = APPLICATION_COLUMNS;

// TODO: Fetch this from a server
// Filter options for faceted filters
export const STAGE_FILTER_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' }
] as const;

// Placeholder texts
export const FILTER_PLACEHOLDERS = {
  COMPANY: 'Filter companies...',
  STAGE: 'Filter stages...',
  POSITION: 'Filter positions...'
} as const;

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

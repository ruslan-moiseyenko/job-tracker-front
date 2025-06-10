import type { ApplicationType } from './dashboard.types';

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

// Placeholder texts
export const FILTER_PLACEHOLDERS = {
  COMPANY: 'Filter companies...',
  STAGE: 'Filter stages...',
  POSITION: 'Filter positions...'
} as const;

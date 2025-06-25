import type { ApplicationType } from './dashboard.types';

// Legacy constants (keep for backward compatibility)
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

// NEW: More type-safe approach based on ApplicationType
// Extract all possible column keys from ApplicationType
type ApplicationDataKeys = keyof ApplicationType;

// Special columns that don't correspond to data fields
type SpecialColumnKeys = 'select' | 'actions';

// All possible column keys (data + special)
export type AllColumnKeys = ApplicationDataKeys | SpecialColumnKeys;

// Type-safe column configuration with metadata
export type ColumnConfig<T extends AllColumnKeys = AllColumnKeys> = {
  key: T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  width?: string;
};

// Define column configurations with strict typing
export const APPLICATION_COLUMN_CONFIGS: Record<AllColumnKeys, ColumnConfig> = {
  // Special columns
  select: {
    key: 'select',
    label: 'Select',
    sortable: false,
    filterable: false,
    hideable: false,
    width: '50px'
  },
  actions: {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    filterable: false,
    hideable: false,
    width: '60px'
  },
  // Data columns - automatically typed based on ApplicationType
  // Note: id and customColor are excluded from standard columns (never shown)
  id: {
    key: 'id',
    label: 'ID',
    sortable: true,
    filterable: true,
    hideable: true
  },
  company: {
    key: 'company',
    label: 'Company',
    sortable: true,
    filterable: true,
    hideable: false
  },
  positionTitle: {
    key: 'positionTitle',
    label: 'Position',
    sortable: true,
    filterable: true,
    hideable: false
  },
  currentStage: {
    key: 'currentStage',
    label: 'Stage',
    sortable: true,
    filterable: true,
    hideable: false
  },
  jobDescription: {
    key: 'jobDescription',
    label: 'Description',
    sortable: false,
    filterable: true,
    hideable: true
  },
  customColor: {
    key: 'customColor',
    label: 'Color',
    sortable: false,
    filterable: false,
    hideable: true
  },
  applicationDate: {
    key: 'applicationDate',
    label: 'Applied Date',
    sortable: true,
    filterable: false,
    hideable: true
  },
  jobLinks: {
    key: 'jobLinks',
    label: 'Job Links',
    sortable: false,
    filterable: false,
    hideable: true
  },
  salary: {
    key: 'salary',
    label: 'Salary',
    sortable: true,
    filterable: true,
    hideable: true
  },
  updatedAt: {
    key: 'updatedAt',
    label: 'Updated',
    sortable: true,
    filterable: false,
    hideable: true
  },
  createdAt: {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    filterable: false,
    hideable: true
  }
} as const;

// Helper to get only data columns (excluding special columns)
export const getDataColumnConfigs = (): ColumnConfig<ApplicationDataKeys>[] => {
  return Object.entries(APPLICATION_COLUMN_CONFIGS)
    .filter(([key]) => key !== 'select' && key !== 'actions')
    .map(([, config]) => config as ColumnConfig<ApplicationDataKeys>);
};

// Helper to get columns by criteria
export const getFilterableColumns = (): ColumnConfig[] => {
  return Object.values(APPLICATION_COLUMN_CONFIGS).filter(
    (config) => config.filterable
  );
};

export const getSortableColumns = (): ColumnConfig[] => {
  return Object.values(APPLICATION_COLUMN_CONFIGS).filter(
    (config) => config.sortable
  );
};

export const getHideableColumns = (): ColumnConfig[] => {
  return Object.values(APPLICATION_COLUMN_CONFIGS).filter(
    (config) => config.hideable
  );
};

// Placeholder texts
export const FILTER_PLACEHOLDERS = {
  COMPANY: 'Filter companies...',
  STAGE: 'Filter stages...',
  POSITION: 'Filter positions...'
} as const;

export const SEARCH_DEBOUNCE_DELAY = 400; // 400ms debounce for search inputs

export const PREDEFINED_STAGE_COLORS = [
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#84cc16', // lime
  '#f59e0b', // amber
  '#f97316', // orange
  '#d946ef', // fuchsia
  '#e11d48', // rose
  '#ef4444', // red
  '#ec4899' // pink
];

// Field validation constants
export const FIELD_LIMITS = {
  POSITION_TITLE_MAX_LENGTH: 100,
  JOB_DESCRIPTION_MAX_LENGTH: 5000,
  WARNING_THRESHOLD: 0.9 // 90% of max length triggers warning
} as const;

// Display truncation constants
export const DISPLAY_LIMITS = {
  POSITION_TITLE_DISPLAY_LENGTH: 20,
  DESCRIPTION_PREVIEW_LENGTH: 15,
  JOB_LINKS_DISPLAY_LENGTH: 20,
  COMPANY_NAME_DISPLAY_LENGTH: 25
} as const;

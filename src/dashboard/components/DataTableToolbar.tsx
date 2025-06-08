'use client';

import type { Table } from '@tanstack/react-table';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from '@/dashboard/components/DataTableFacetedFilter';
import { fakeStages } from '@/dashboard/components/fakeData';
import {
  APPLICATION_COLUMNS,
  FILTER_PLACEHOLDERS
} from '@/dashboard/dashboard.constants';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={FILTER_PLACEHOLDERS.COMPANY}
          value={
            (table
              .getColumn(APPLICATION_COLUMNS.COMPANY)
              ?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table
              .getColumn(APPLICATION_COLUMNS.COMPANY)
              ?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn(APPLICATION_COLUMNS.CURRENT_STAGE) && (
          <DataTableFacetedFilter
            column={table.getColumn(APPLICATION_COLUMNS.CURRENT_STAGE)}
            title="Stage"
            options={fakeStages}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      {/* <DataTableViewOptions table={table} /> */}
    </div>
  );
}

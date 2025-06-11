// Example of how to migrate your existing DataTable to use the new type-safe approach
// This file shows the migration path without breaking existing functionality
import { useState } from 'react';

import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table';

import { ChevronDown } from 'lucide-react';

import { useUserData } from '@/auth/hooks/useUserData';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LocalLoadingOverlay } from '@/components/ui/LocalLoadingOverlay';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
// NEW: Import the type-safe column generators
import { generateStandardColumns } from '@/dashboard/column-generator';
import { DataTableToolbar } from '@/dashboard/components/DataTableToolbar';
import { useGetApplicationBySearchId } from '@/dashboard/hooks/useGetApplicationBySearchId';
import { useGetStages } from '@/dashboard/hooks/useGetStages';

export function TypeSafeDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { userData } = useUserData();
  const { stageFilterOptions, loading: stagesLoading } = useGetStages();
  const {
    applications,
    loading: appsLoading,
    error
  } = useGetApplicationBySearchId(userData?.lastActiveSearchId);

  const loading = stagesLoading || appsLoading;

  // NEW: Generate columns automatically based on ApplicationType
  const columns = generateStandardColumns();

  const table = useReactTable({
    data: applications,
    columns, // Now using auto-generated columns
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  if (error) {
    return (
      <div className="w-full flex items-center justify-center h-[400px] text-center">
        <div>
          <p className="text-destructive mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center py-4 px-4">
        <DataTableToolbar
          table={table}
          stageFilterOptions={stageFilterOptions}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Local loading overlay - shows over existing content */}
      <LocalLoadingOverlay
        isLoading={loading}
        message={
          stagesLoading && appsLoading
            ? 'Loading data...'
            : stagesLoading
              ? 'Loading stages...'
              : 'Loading applications...'
        }
        variant="spinner"
      />
    </div>
  );
}

// Example usage with custom column selection
export function CustomDataTable() {
  // You can now easily customize which columns to show
  const customColumns = generateStandardColumns();

  // Or generate only specific columns
  // const customColumns = generateAllColumns(['select', 'company', 'positionTitle', 'currentStage', 'salary', 'actions']);

  // Rest of component remains the same...
  return <div>Custom table implementation</div>;
}

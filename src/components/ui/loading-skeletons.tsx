import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface DataTableSkeletonProps {
  /**
   * Number of rows to show in the skeleton
   * @default 5
   */
  rows?: number;
  /**
   * Number of columns to show in the skeleton
   * @default 4
   */
  columns?: number;
  /**
   * Whether to show the header skeleton
   * @default true
   */
  showHeader?: boolean;
  /**
   * Whether to show the toolbar skeleton (search, filters, etc.)
   * @default true
   */
  showToolbar?: boolean;
}

export function DataTableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showToolbar = true
}: DataTableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Toolbar skeleton */}
      {showToolbar && (
        <div className="flex items-center py-4 px-4">
          <div className="flex flex-1 items-center space-x-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
          <Skeleton className="h-8 w-[80px] ml-auto" />
        </div>
      )}

      {/* Table skeleton */}
      <div className="rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-full" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton
                      className={`h-4 ${
                        colIndex === 0
                          ? 'w-4' // First column (checkbox)
                          : colIndex === columns - 1
                            ? 'w-8' // Last column (actions)
                            : 'w-full'
                      }`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-4 w-[200px]" />
        <div className="space-x-2 flex">
          <Skeleton className="h-8 w-[70px]" />
          <Skeleton className="h-8 w-[50px]" />
        </div>
      </div>
    </div>
  );
}

// Additional skeleton components for other UI elements

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-lg border p-6 ${className}`}>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function ListSkeleton({
  items = 3,
  className
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@radix-ui/react-dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';

import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { APPLICATION_COLUMNS } from '@/dashboard/dashboard.constants';
import type { ApplicationType } from '@/dashboard/dashboard.types';

export const applicationColumns: ColumnDef<ApplicationType>[] = [
  {
    id: APPLICATION_COLUMNS.SELECT,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: APPLICATION_COLUMNS.COMPANY,
    header: 'Company',
    cell: ({ row }) => {
      const company = row.getValue(APPLICATION_COLUMNS.COMPANY) as {
        id: string;
        name: string;
      };
      return <div className="capitalize">{company?.name}</div>;
    },
    filterFn: (row, id, value) => {
      const company = row.getValue(id) as { id: string; name: string };
      return company?.name?.toLowerCase().includes(value.toLowerCase());
    }
  },
  {
    accessorKey: APPLICATION_COLUMNS.POSITION_TITLE,
    header: 'Title',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue(APPLICATION_COLUMNS.POSITION_TITLE)}
      </div>
    )
  },
  {
    accessorKey: APPLICATION_COLUMNS.CURRENT_STAGE,
    header: 'Stage',
    cell: ({ row }) => {
      const stage = row.getValue(APPLICATION_COLUMNS.CURRENT_STAGE) as {
        id: string;
        name: string;
        order: number;
        color: string;
      };
      return (
        <div className="capitalize" style={{ backgroundColor: stage?.color }}>
          {stage?.name}
        </div>
      );
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
  },
  {
    accessorKey: APPLICATION_COLUMNS.JOB_LINKS,
    header: 'URL',
    cell: ({ row }) => {
      const links = row.getValue(APPLICATION_COLUMNS.JOB_LINKS) as string[];
      return links && links.length > 0 ? (
        <a href={links[0]} target="_blank" rel="noreferrer">
          View Job
        </a>
      ) : null;
    }
  },
  // {
  //   accessorKey: 'email',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         Email
  //         <ArrowUpDown />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>
  // },
  {
    accessorKey: APPLICATION_COLUMNS.SALARY,
    header: () => <div className="text-right">Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue(APPLICATION_COLUMNS.SALARY));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);

      return <div className="text-right font-medium">{formatted}</div>;
    }
  },
  {
    id: APPLICATION_COLUMNS.ACTIONS,
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-secondary">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(application.id)}
            >
              Copy application ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit application</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

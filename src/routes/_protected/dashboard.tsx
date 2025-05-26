import { createFileRoute } from '@tanstack/react-router';

import { DataTable } from '@/dashboard/components/DataTable';

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage
});

function DashboardPage() {
  return <DataTable />;
}

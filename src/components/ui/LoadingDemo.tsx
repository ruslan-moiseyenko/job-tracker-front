import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DotsLoader,
  Loader,
  PulseLoader,
  SpinnerLoader
} from '@/components/ui/loader';
import { DataTableSkeleton } from '@/components/ui/loading-skeletons';

import { useApiLoading } from '@/hooks/useApiLoading';

export function LoadingDemo() {
  const [showDataTableSkeleton, setShowDataTableSkeleton] =
    React.useState(false);

  // Example of using the API loading hook
  const { loading: apiLoading, execute } = useApiLoading({
    useGlobalLoader: false,
    initialMessage: 'Fetching data...',
    successMessage: 'Data loaded successfully!'
  });

  const simulateApiCall = async () => {
    await execute(async () => {
      // Simulate API delay
      return new Promise((resolve) => setTimeout(resolve, 2000));
    });
  };

  const simulateDataTableLoading = () => {
    setShowDataTableSkeleton(true);
    setTimeout(() => setShowDataTableSkeleton(false), 3000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Loading Components Demo</h1>
        <p className="text-muted-foreground">
          Examples of different loading states and components
        </p>
      </div>

      {/* Inline Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Loaders</CardTitle>
          <CardDescription>
            Small loaders that can be used inside buttons, cards, or other
            components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spinner variations */}
            <div className="space-y-4">
              <h3 className="font-semibold">Spinner Loaders</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <SpinnerLoader size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center gap-3">
                  <SpinnerLoader size="md" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <SpinnerLoader size="lg" />
                  <span className="text-sm">Large</span>
                </div>
                <div className="flex items-center gap-3">
                  <SpinnerLoader size="xl" />
                  <span className="text-sm">Extra Large</span>
                </div>
              </div>
            </div>

            {/* Dots variations */}
            <div className="space-y-4">
              <h3 className="font-semibold">Dots Loaders</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <DotsLoader size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center gap-3">
                  <DotsLoader size="md" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <DotsLoader size="lg" />
                  <span className="text-sm">Large</span>
                </div>
                <div className="flex items-center gap-3">
                  <DotsLoader size="xl" />
                  <span className="text-sm">Extra Large</span>
                </div>
              </div>
            </div>

            {/* Pulse variations */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pulse Loaders</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <PulseLoader size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center gap-3">
                  <PulseLoader size="md" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-3">
                  <PulseLoader size="lg" />
                  <span className="text-sm">Large</span>
                </div>
                <div className="flex items-center gap-3">
                  <PulseLoader size="xl" />
                  <span className="text-sm">Extra Large</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loaders with text */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Loaders with Text</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Loader variant="spinner" size="md" text="Loading..." />
              <Loader variant="dots" size="md" text="Processing..." />
              <Loader variant="pulse" size="md" text="Please wait..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Button Loading States</CardTitle>
          <CardDescription>
            Examples of how to use loaders in buttons and interactive elements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button disabled={apiLoading} onClick={simulateApiCall}>
              {apiLoading ? (
                <>
                  <SpinnerLoader size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                'Simulate API Call'
              )}
            </Button>

            <Button variant="outline" disabled={apiLoading}>
              {apiLoading ? (
                <>
                  <DotsLoader size="sm" className="mr-2" />
                  Processing
                </>
              ) : (
                'Another Action'
              )}
            </Button>

            <Button variant="secondary" disabled={apiLoading}>
              {apiLoading ? (
                <>
                  <PulseLoader size="sm" className="mr-2" />
                  Please wait
                </>
              ) : (
                'Third Action'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table Loading Skeleton</CardTitle>
          <CardDescription>
            Skeleton loader for data tables and complex layouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={simulateDataTableLoading} className="mb-4">
            Show Table Loading Skeleton
          </Button>

          {showDataTableSkeleton ? (
            <DataTableSkeleton rows={5} columns={6} />
          ) : (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              Click the button above to see the table loading skeleton
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

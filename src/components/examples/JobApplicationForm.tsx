import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpinnerLoader } from '@/components/ui/loader';
import { useApiLoading } from '@/hooks/useApiLoading';

export function JobApplicationForm() {
  const [formData, setFormData] = React.useState({
    companyName: '',
    position: '',
    jobUrl: ''
  });

  const { loading, execute } = useApiLoading({
    useGlobalLoader: false,
    initialMessage: 'Submitting application...',
    successMessage: 'Application submitted successfully!',
    errorMessage: 'Failed to submit application'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await execute(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate potential error (uncomment to test error handling)
      // if (Math.random() > 0.7) {
      //   throw new Error('Network error');
      // }

      return { id: Date.now(), ...formData };
    });

    if (result) {
      // Reset form on success
      setFormData({ companyName: '', position: '', jobUrl: '' });
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Job Application</CardTitle>
        <CardDescription>
          Submit a new job application with loading states
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={formData.companyName}
              onChange={handleInputChange('companyName')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={handleInputChange('position')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input
              id="jobUrl"
              type="url"
              value={formData.jobUrl}
              onChange={handleInputChange('jobUrl')}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <SpinnerLoader size="sm" className="mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

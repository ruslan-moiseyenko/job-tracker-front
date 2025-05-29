import { type FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@radix-ui/react-dialog';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateJobSearch } from '@/app-sidebar/hooks/useCreateJobSearch';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateDefaultSearchTitle } from '@/lib/utils';

const jobSearchSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
});

type JobSearchFormData = z.infer<typeof jobSearchSchema>;

type CreateNewSearchDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const CreateNewSearchDialog: FC<CreateNewSearchDialogProps> = ({
  setIsOpen,
  isOpen
}) => {
  const { createJobSearch, loading: isCreating } = useCreateJobSearch();

  const form = useForm<JobSearchFormData>({
    resolver: zodResolver(jobSearchSchema),
    defaultValues: {
      title: generateDefaultSearchTitle(),
      description: ''
    }
  });

  const onSubmit = async (data: JobSearchFormData) => {
    try {
      await createJobSearch(data);
      form.reset();
      setIsOpen(false);
      toast.success('Job search created successfully!', {
        description: `Created "${data.title}" and set it as your active search.`
      });
    } catch (error) {
      toast.error('Failed to create job search', {
        description:
          'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Job Search</DialogTitle>
          <DialogDescription>
            Create a new job search to organize and track your job applications.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Frontend Developer Jobs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description for this job search..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Job Search'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

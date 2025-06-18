import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { Plus, PlusCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUserData } from '@/auth/hooks/useUserData';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { StageManagementDialog } from '@/dashboard/components/stage-management';
import type { CompanyInputType } from '@/dashboard/dashboard.types';
import { useCreateJobApplication } from '@/dashboard/hooks/useCreateJobApplication';
import { useGetStages } from '@/dashboard/hooks/useGetStages';
import { useApiLoading } from '@/hooks/useApiLoading';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

import { InputCompanyAutocomplete } from './InputCompanyAutocomplete';

const applicationSchema = z.object({
  company: z
    .object({
      id: z.string().optional(),
      name: z.string().min(1, 'Company name is required')
    })
    .nullable()
    .refine(
      (data) => data !== null && data?.name && data.name.trim().length > 0,
      {
        message: 'Company is required'
      }
    ),
  positionTitle: z
    .string()
    .min(1, 'Position title is required')
    .max(100, 'Position title must be less than 100 characters'),
  stageId: z.string().min(1, 'Stage is required'),
  jobDescription: z
    .string()
    .max(2000, 'Job description must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  jobLinks: z.array(z.string().url('Invalid URL format')),
  salary: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val === '' || Number(val) > 0, {
      message: 'Salary must be positive'
    })
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AddNewApplicationProps {
  onApplicationCreated?: () => void | Promise<void | unknown>;
}

export const AddNewApplication = ({
  onApplicationCreated
}: AddNewApplicationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showErrorSummary, setShowErrorSummary] = useState(true);

  const { userData } = useUserData();
  const { stages, loading: stagesLoading } = useGetStages();
  const {
    createJobApplication,
    loading: mutationLoading,
    error: mutationError
  } = useCreateJobApplication();

  const defaultValues: ApplicationFormData = {
    company: null,
    positionTitle: '',
    stageId: '',
    jobDescription: '',
    jobLinks: [],
    salary: ''
  };

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: 'onChange' // Validate on every change
  });

  const { loading: apiLoading, execute } = useApiLoading({
    useGlobalLoader: false,
    initialMessage: 'Creating application...',
    successMessage: 'Application created successfully!',
    errorMessage: '' // Don't show generic error - we handle specific errors above
  });

  // Combine loading states
  const loading = apiLoading || mutationLoading;

  // Unsaved changes detection
  const { hasUnsavedChanges, resetForm } = useUnsavedChanges({
    form,
    defaultValues,
    isOpen,
    significanceThreshold: (values) => {
      // Changes considered as significant if:
      // - Company is selected/typed
      // - Position title has meaningful text (3+ chars)
      // - Job description has meaningful text (10+ chars)
      // - Job links are added
      const hasCompany =
        values.company?.name && values.company.name.trim().length > 0;
      const hasPosition =
        values.positionTitle && values.positionTitle.trim().length >= 3;
      const hasDescription =
        values.jobDescription && values.jobDescription.trim().length >= 10;
      const hasLinks = values.jobLinks && values.jobLinks.length > 0;

      return !!(hasCompany || hasPosition || hasDescription || hasLinks);
    }
  });

  // Confirmation dialog
  const { dialog, showConfirmation } = useConfirmationDialog();

  // Set default stage and handle fallback when selected stage is deleted
  useEffect(() => {
    if (stages.length > 0) {
      const currentStageId = form.getValues('stageId');
      const firstStage = [...stages].sort((a, b) => a.order - b.order)[0];

      // Set  default stage
      if (!currentStageId) {
        form.setValue('stageId', firstStage.id);
        form.trigger('stageId');
      }
      // Scenario 2: Current selected stage no longer exists - fallback to first stage
      else if (!stages.find((stage) => stage.id === currentStageId)) {
        console.log(
          'Selected stage no longer exists, falling back to:',
          firstStage.name
        );
        form.setValue('stageId', firstStage.id);
        form.trigger('stageId');
      }
    }
  }, [stages, form]);

  // Handle specific GraphQL errors with user-friendly messages
  useEffect(() => {
    if (mutationError) {
      console.error('GraphQL mutation error:', mutationError);

      // Extract user-friendly error message
      let userMessage = 'Failed to create application';

      if (mutationError.graphQLErrors?.length > 0) {
        const graphQLError = mutationError.graphQLErrors[0];
        userMessage = graphQLError.message || userMessage;
      } else if (mutationError.networkError) {
        userMessage =
          'Network error. Please check your connection and try again.';
      }

      // Show user-friendly error message
      toast.error(userMessage);
    }
  }, [mutationError]);

  // Reset error summary when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      // Show error summary again when form changes (in case user dismissed it)
      setShowErrorSummary(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const addJobLink = () => {
    if (urlInput.trim()) {
      try {
        new URL(urlInput); // Validate URL
        const currentLinks = form.getValues('jobLinks') || [];
        form.setValue('jobLinks', [...currentLinks, urlInput.trim()]);
        setUrlInput('');
      } catch {
        toast.error('Please enter a valid URL');
      }
    }
  };

  const removeJobLink = (index: number) => {
    const currentLinks = form.getValues('jobLinks') || [];
    form.setValue(
      'jobLinks',
      currentLinks.filter((_, i) => i !== index)
    );
  };

  const onSubmit = async (data: ApplicationFormData) => {
    if (!userData?.lastActiveSearchId) {
      toast.error(
        'No active job search found. Please create a job search first.'
      );
      return;
    }

    if (!data.company) {
      toast.error('Company is required');
      return;
    }

    const result = await execute(async () => {
      // Build company input based on whether it has an ID (existing) or not (new)
      const companyInput: CompanyInputType = data.company!.id
        ? { existingCompanyId: data.company!.id } // Existing company
        : { newCompany: { name: data.company!.name } }; // New company

      const response = await createJobApplication({
        variables: {
          jobSearchId: userData.lastActiveSearchId!,
          positionTitle: data.positionTitle,
          currentStageId: data.stageId,
          jobDescription: data.jobDescription || undefined,
          salary: data.salary ? parseInt(data.salary) : undefined,
          company: companyInput,
          jobLinks: data.jobLinks
        }
      });

      return response.data?.createJobApplication;
    });

    if (result) {
      resetForm();
      setUrlInput('');
      setIsOpen(false);

      // Call the callback to trigger any additional updates (like refetching)
      try {
        await onApplicationCreated?.();
      } catch (error) {
        // The cache update should have worked, so this is just a fallback
        console.warn('Callback after application creation failed:', error);
      }
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      showConfirmation(
        'Discard unsaved changes?',
        'You have unsaved changes that will be lost if you close this form. Are you sure you want to continue?',
        () => {
          resetForm();
          setUrlInput('');
          setIsOpen(false);
        }
      );
    } else {
      resetForm();
      setUrlInput('');
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      showConfirmation(
        'Discard unsaved changes?',
        'You have unsaved changes that will be lost if you close this form. Are you sure you want to continue?',
        () => {
          resetForm();
          setUrlInput('');
          setIsOpen(false);
        }
      );
    } else {
      if (!open) {
        resetForm();
        setUrlInput('');
      }
      setIsOpen(open);
    }
  };

  const currentJobLinks = form.watch('jobLinks') || [];

  return (
    <>
      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        description={dialog.description}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        confirmText="Discard"
        cancelText="Keep editing"
        variant="destructive"
      />

      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <Button variant="default">
            <PlusCircle />
            New application
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Job Application</SheetTitle>
            <SheetDescription>
              Create a new job application to track your progress.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            {/* Error Summary */}
            {showErrorSummary &&
              (Object.keys(form.formState.errors).length > 0 ||
                mutationError) && (
                <Card className="border-destructive/50 bg-destructive/5 mt-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-destructive text-sm">
                        Please fix the following issues:
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Clear form errors and hide error summary
                          form.clearErrors();
                          setShowErrorSummary(false);
                        }}
                        className="h-6 w-6 p-0 text-destructive/70 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="list-disc list-inside space-y-1 text-sm text-destructive/90">
                      {Object.entries(form.formState.errors).map(
                        ([field, error]) => (
                          <li key={field}>
                            <span className="font-medium capitalize">
                              {field}:
                            </span>{' '}
                            {error?.message}
                          </li>
                        )
                      )}
                      {mutationError && (
                        <li>
                          <span className="font-medium">Server Error:</span>{' '}
                          {mutationError.graphQLErrors?.[0]?.message ||
                            mutationError.networkError?.message ||
                            'An unexpected error occurred'}
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-6 p-4"
            >
              {/* Company */}
              <FormField
                control={form.control}
                name="company"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <InputCompanyAutocomplete
                        value={field.value}
                        onChange={(selection) => {
                          field.onChange(selection);
                        }}
                        placeholder="e.g., Google, Microsoft, Apple"
                        disabled={loading}
                        className={fieldState.error ? 'border-destructive' : ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position Title */}
              <FormField
                control={form.control}
                name="positionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Frontend Developer"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Application Stage */}
              <FormField
                control={form.control}
                name="stageId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Application Stage *</FormLabel>
                      <StageManagementDialog />
                    </div>
                    <FormControl>
                      <Select
                        value={field.value || ''}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Trigger validation to immediately clear errors
                          form.trigger('stageId');
                        }}
                        disabled={loading || stagesLoading}
                      >
                        <SelectTrigger
                          className="capitalize"
                          style={(() => {
                            const selected = stages.find(
                              (s) => s.id === field.value
                            );
                            return selected && selected.color
                              ? { backgroundColor: selected.color }
                              : undefined;
                          })()}
                        >
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem
                              key={stage.id}
                              value={stage.id}
                              className="capitalize"
                              style={
                                field.value === stage.id && stage.color
                                  ? { backgroundColor: stage.color }
                                  : undefined
                              }
                            >
                              {stage.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Description */}
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter job description, requirements, responsibilities..."
                        className="min-h-[100px]"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Links */}
              <div className="space-y-3">
                <Label>Job Links</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://company.com/jobs/123"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addJobLink();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addJobLink}
                    disabled={loading || !urlInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {currentJobLinks.length > 0 && (
                  <div className="space-y-2">
                    {currentJobLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                      >
                        <span className="flex-1 text-sm truncate">{link}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJobLink(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Salary */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 150000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || stagesLoading}>
                  {loading ? 'Creating...' : 'Create Application'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};

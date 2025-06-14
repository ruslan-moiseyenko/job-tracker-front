import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';

import { Check, ChevronsUpDown, Plus, PlusCircle, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUserData } from '@/auth/hooks/useUserData';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';

import { CompanyAutocomplete } from './CompanyAutocomplete';

const applicationSchema = z.object({
  company: z
    .object({
      id: z.string().optional(),
      name: z.string().min(1, 'Company name is required')
    })
    .optional()
    .refine((data) => data !== undefined, {
      message: 'Company is required'
    }),
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
  const [stageOpen, setStageOpen] = useState(false);

  const { userData } = useUserData();
  const { stages, stageFilterOptions, loading: stagesLoading } = useGetStages();
  const { createJobApplication } = useCreateJobApplication();

  const defaultValues = {
    company: undefined,
    positionTitle: '',
    stageId: '',
    jobDescription: '',
    jobLinks: [],
    salary: ''
  };

  const form = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues
  });

  const { loading, execute } = useApiLoading({
    useGlobalLoader: false,
    initialMessage: 'Creating application...',
    successMessage: 'Application created successfully!',
    errorMessage: 'Failed to create application'
  });

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

      return hasCompany || hasPosition || hasDescription || hasLinks;
    }
  });

  // Confirmation dialog
  const { dialog, showConfirmation } = useConfirmationDialog();

  // Set default stage when stages are loaded
  useEffect(() => {
    if (stages.length > 0 && !form.getValues('stageId')) {
      const firstStage = [...stages].sort((a, b) => a.order - b.order)[0];
      form.setValue('stageId', firstStage.id);
    }
  }, [stages, form]);

  const selectedStage = stages.find(
    (stage) => stage.id === form.watch('stageId')
  );

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
      const companyInput: CompanyInputType = data.company.id
        ? { existingCompanyId: data.company.id } // Existing company
        : { newCompany: { name: data.company.name } }; // New company

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
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-6 p-4"
            >
              {/* Company */}
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <CompanyAutocomplete
                        value={field.value}
                        onChange={(selection) => {
                          field.onChange(selection);
                        }}
                        placeholder="e.g., Google, Microsoft, Apple"
                        disabled={loading}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Application Stage *</FormLabel>

                    <Popover open={stageOpen} onOpenChange={setStageOpen}>
                      <div className="flex items-center justify-between">
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={stageOpen}
                              className={cn(
                                'justify-between w-fit min-w-fit',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={loading || stagesLoading}
                            >
                              {selectedStage ? (
                                <span className="flex items-center gap-2">
                                  {selectedStage.name}
                                </span>
                              ) : (
                                'Select stage'
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <StageManagementDialog />
                      </div>
                      <PopoverContent className="w-full p-2">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No stages</CommandEmpty>
                            <CommandGroup>
                              {stageFilterOptions.map((stage) => (
                                <CommandItem
                                  value={stage.label}
                                  key={stage.id}
                                  onSelect={() => {
                                    form.setValue('stageId', stage.id!);
                                    setStageOpen(false);
                                  }}
                                  className="justify-start cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      stage.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {stage.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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

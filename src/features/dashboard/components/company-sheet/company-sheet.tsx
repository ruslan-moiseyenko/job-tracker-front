import { useEffect, useState } from 'react';

import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { FragmentCacheUtils } from '@/features/dashboard/graphql/cache-utils';
import {
  GET_COMPANY,
  UPDATE_COMPANY
} from '@/features/dashboard/graphql/dashboard.queries';
import type { CompanyDetailsFragment } from '@/features/dashboard/graphql/fragments';

import { CompanyStatusSwitchers } from './company-status-switchers';

interface CompanySheetProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CompanySheet = ({
  companyId,
  isOpen,
  onClose
}: CompanySheetProps) => {
  const client = useApolloClient();

  const { data, loading, error } = useQuery(GET_COMPANY, {
    variables: { id: companyId },
    skip: !companyId || !isOpen
  });

  const [updateCompany] = useMutation(UPDATE_COMPANY, {
    onCompleted: (res) => {
      const updated: CompanyDetailsFragment = res.updateCompany;

      try {
        const cacheUtils = new FragmentCacheUtils(client.cache);
        // Write the updated company to cache
        cacheUtils.writeCompany({
          __typename: 'Company',
          id: updated.id,
          name: updated.name,
          isBlacklisted: updated.isBlacklisted,
          isFavorite: updated.isFavorite
        });
      } catch (_e) {
        console.warn('Failed to update company in cache:', _e);
      }

      toast.success('Company updated');
      onClose();
    },
    onError: (err) => {
      toast.error('Failed to update company');
      console.error('updateCompany error', err);
    }
  });

  const company: CompanyDetailsFragment | undefined = data?.getCompanyById;

  // State for company status switches
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { register, handleSubmit, reset } = useForm<{
    name: string;
    website?: string;
    description?: string;
    companyNote?: string;
  }>({
    defaultValues: {
      name: company?.name || '',
      website: company?.website || '',
      description: company?.description || '',
      companyNote: (company as any)?.companyNote || ''
    }
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        website: company.website || '',
        description: company.description || '',
        companyNote: (company as any).companyNote || ''
      });
      setIsBlacklisted(company.isBlacklisted || false);
      setIsFavorite(company.isFavorite || false);
    }
  }, [company, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateCompany({
        variables: {
          id: companyId,
          name: values.name,
          website: values.website || null,
          description: values.description || null,
          companyNote: values.companyNote || null,
          isBlacklisted,
          isFavorite
        }
      });
    } catch (_err) {
      // handled in onError
    }
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[40rem] min-w-[19rem] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Company Details</SheetTitle>
          <SheetDescription>
            View and edit company information.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-destructive">Error loading company</p>}

          {company && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2">
                  Name
                </Label>
                <Input {...register('name', { required: true })} id="name" />
              </div>

              <div>
                <Label htmlFor="website" className="mb-2">
                  Website
                </Label>
                <Input {...register('website')} id="website" />
              </div>

              <div>
                <Label htmlFor="description" className="mb-2">
                  Description
                </Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  className="max-h-[8rem] overflow-y-auto resize-none"
                />
              </div>

              <div>
                <Label htmlFor="companyNote" className="mb-2">
                  Company Notes
                </Label>
                <Textarea
                  {...register('companyNote')}
                  placeholder="Add any notes about this company..."
                  id="companyNote"
                  className="max-h-[8rem] overflow-y-auto resize-none"
                />
              </div>

              <Separator />

              <CompanyStatusSwitchers
                isBlacklisted={isBlacklisted}
                isFavorite={isFavorite}
                onBlacklistChange={setIsBlacklisted}
                onFavoriteChange={setIsFavorite}
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

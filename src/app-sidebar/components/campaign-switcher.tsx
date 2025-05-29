import { useEffect, useMemo, useState } from 'react';

import { ChevronsUpDown, GalleryVerticalEnd, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { CreateNewSearchDialog } from '@/app-sidebar/components/create-search-dialog';
import { useGetFilteredJobSearches } from '@/app-sidebar/hooks/useGetFilteredJobSearches';
import { useUpdateLastActiveSearch } from '@/app-sidebar/hooks/useUpdateLastActiveSearch';
import { useUserWithJobSearch } from '@/app-sidebar/hooks/useUserWithJobSearch';
import type { JobSearchType } from '@/app-sidebar/sidebar.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SpinnerLoader } from '@/components/ui/loader';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function CampaignSwitcher() {
  const [openDialog, setDialogIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isMobile } = useSidebar();
  const { userData: _userData, jobSearch } = useUserWithJobSearch();
  const { updateLastActiveSearch, loading: isUpdating } =
    useUpdateLastActiveSearch();

  // Local state for immediate UI feedback before server response
  const [optimisticActiveId, setOptimisticActiveId] = useState<string | null>(
    null
  );

  const {
    allJobSearches: campaigns,
    loading,
    error: _error,
    refetch: _refetch
  } = useGetFilteredJobSearches({
    pagination: { limit: 3, offset: 0 }
  });

  // Determine the active campaign
  const activeCampaign = useMemo(() => {
    // If we have an optimistic update pending, use that
    if (optimisticActiveId) {
      const optimisticCampaign = campaigns.find(
        (c) => c.id === optimisticActiveId
      );
      if (optimisticCampaign) return optimisticCampaign;
    }

    // Otherwise use the job search from server data
    if (jobSearch) return jobSearch;

    // Fallback to first campaign if no active search is set
    return campaigns.length > 0 ? campaigns[0] : null;
  }, [optimisticActiveId, jobSearch, campaigns]);

  // Clear optimistic state when server data updates
  useEffect(() => {
    if (jobSearch?.id === optimisticActiveId) {
      setOptimisticActiveId(null);
    }
  }, [jobSearch?.id, optimisticActiveId]);

  const handleCampaignSwitch = async (campaign: JobSearchType) => {
    if (campaign.id === activeCampaign?.id) return; // Already active

    try {
      // Set optimistic state for immediate UI feedback
      setOptimisticActiveId(campaign.id);

      await updateLastActiveSearch(campaign.id);

      toast.success('Campaign switched successfully', {
        description: `Now viewing ${campaign.title}`
      });
    } catch (_error) {
      // Revert optimistic state on error
      setOptimisticActiveId(null);
      toast.error('Failed to switch campaign', {
        description:
          'Please try again or contact support if the issue persists.'
      });
    }
  };

  const handleOpenDialog = () => {
    // To avoid conflicts, close dropdown first,
    // then open dialog after a small delay
    setDropdownOpen(false);
    setTimeout(() => {
      setDialogIsOpen(true);
    }, 100);
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <SpinnerLoader size="sm" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading campaigns...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeCampaign) {
    return (
      <SidebarMenu>
        <SidebarMenuItem className="border animate-pulse-border rounded-md">
          <SidebarMenuButton size="lg" onClick={() => setDialogIsOpen(true)}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus className="size-4" />
            </div>
            <div className="text-muted-foreground font-medium">
              Start a new search
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <CreateNewSearchDialog
          isOpen={openDialog}
          setIsOpen={setDialogIsOpen}
        />
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeCampaign?.title}
                </span>
                <span className="truncate text-xs">Search campaign</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Campaigns
            </DropdownMenuLabel>
            {campaigns.map((campaign, index) => (
              <DropdownMenuItem
                key={campaign.id}
                onClick={() => handleCampaignSwitch(campaign)}
                className="gap-2 p-2"
                disabled={isUpdating}
              >
                <div className="flex size-6 min-w-6 items-center justify-center rounded-md border">
                  {isUpdating && optimisticActiveId === campaign.id ? (
                    <SpinnerLoader size="sm" />
                  ) : (
                    index + 1
                  )}
                </div>
                {campaign.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={handleOpenDialog}
              onSelect={(e) => {
                e.preventDefault(); // Prevent default closing behavior
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Start new Search campaign
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <CreateNewSearchDialog isOpen={openDialog} setIsOpen={setDialogIsOpen} />
    </SidebarMenu>
  );
}

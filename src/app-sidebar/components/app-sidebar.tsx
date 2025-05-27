import * as React from 'react';

import { CampaignSwitcher } from '@/app-sidebar/components/campaign-switcher';
import { NavMain } from '@/app-sidebar/components/nav-main';
// import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/app-sidebar/components/nav-user';
import { useUserWithJobSearch } from '@/app-sidebar/hooks/useUserWithJobSearch';
import { NAVIGATION_DATA } from '@/app-sidebar/sidebar.variables';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, jobSearch: _jobSearch, isLoading } = useUserWithJobSearch();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CampaignSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={NAVIGATION_DATA} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {userData ? (
          <NavUser user={userData} />
        ) : (
          <div className="flex items-center justify-center p-4">
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Loading user data...' : 'User data not available'}
            </span>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

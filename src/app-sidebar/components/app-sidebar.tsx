import * as React from 'react';

import { CampaignSwitcher } from '@/app-sidebar/components/campaign-switcher';
import { NavMain } from '@/app-sidebar/components/nav-main';
// import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/app-sidebar/components/nav-user';
import { NAVIGATION_DATA } from '@/app-sidebar/sidebar.variables';
import { useUserData } from '@/auth/hooks/useUserData';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Direct data fetching - no complex context layer
  const { userData, loading } = useUserData();

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
              {loading ? 'Loading user data...' : 'User data not available'}
            </span>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

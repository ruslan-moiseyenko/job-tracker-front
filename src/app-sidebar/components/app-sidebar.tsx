import * as React from 'react';

import { CampaignSwitcher } from '@/app-sidebar/components/campaign-switcher';
import { NavMain } from '@/app-sidebar/components/nav-main';
// import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/app-sidebar/components/nav-user';
import { useUserData } from '@/auth/hooks/userDataHook';
import {
  AudioWaveform,
  ChartLine,
  Command,
  GalleryVerticalEnd,
  TableProperties
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free'
    }
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: TableProperties,
      isActive: true
    },
    {
      title: 'Statistics',
      url: '/panel',
      icon: ChartLine
    }
  ]
  // projects: [
  //   {
  //     name: 'Design Engineering',
  //     url: '#',
  //     icon: Frame
  //   },
  //   {
  //     name: 'Sales & Marketing',
  //     url: '#',
  //     icon: PieChart
  //   },
  //   {
  //     name: 'Travel',
  //     url: '#',
  //     icon: Map
  //   }
  // ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { userData, loading } = useUserData();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CampaignSwitcher campaigns={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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

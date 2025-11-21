import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui-shadcn/sidebar';
import {
  BarChart3,
  Beaker,
  FileText,
  Settings,
  Brain,
  TrendingUp,
  Users,
  Shield,
  Activity,
  Database,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', icon: BarChart3, url: '/' },
      { title: 'Experiments', icon: Beaker, url: '/experiments' },
      { title: 'Analytics', icon: TrendingUp, url: '/analytics' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { title: 'SYMBI Framework', icon: Brain, url: '/symbi' },
      { title: 'Reports', icon: FileText, url: '/reports' },
      { title: 'Activity', icon: Activity, url: '/activity' },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Data Sources', icon: Database, url: '/data-sources' },
      { title: 'Team', icon: Users, url: '/team' },
      { title: 'Security', icon: Shield, url: '/security' },
      { title: 'Settings', icon: Settings, url: '/settings' },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              SYMBI Resonate
            </h1>
            <p className="text-xs text-muted-foreground">AI Analytics Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url}>
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-3 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                JD
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
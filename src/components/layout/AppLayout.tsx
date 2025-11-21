import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from '../ui/sidebar'
import { Header } from './Header'
import { BarChart3, Beaker, FileText, Target, Settings, Puzzle, Users, LineChart } from 'lucide-react'

export const AppLayout: React.FC<{ children: React.ReactNode; onThemeToggle: () => void; isDarkMode: boolean }> = ({ children, onThemeToggle, isDarkMode }) => {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar side="left" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">S</div>
              <span className="text-sm font-semibold">SYMBI Resonate</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/')}>{
                    <Link to="/">
                      <BarChart3 />
                      <span>Dashboard</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/assessment')}>{
                    <Link to="/assessment">
                      <Target />
                      <span>Assessment</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/analytics')}>{
                    <Link to="/analytics">
                      <LineChart />
                      <span>Analytics</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/reports')}>{
                    <Link to="/reports">
                      <FileText />
                      <span>Reports</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/experiments')}>{
                    <Link to="/experiments">
                      <Beaker />
                      <span>Experiments</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/integrations')}>{
                    <Link to="/integrations">
                      <Puzzle />
                      <span>Integrations</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/users')}>{
                    <Link to="/users">
                      <Users />
                      <span>Users</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/settings')}>{
                    <Link to="/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  }</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b">
            <div className="container mx-auto px-4 flex h-14 items-center gap-2">
              <SidebarTrigger />
              <div className="flex-1" />
              <Header onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
            </div>
          </div>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
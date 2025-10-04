import { Home, Dumbbell, Utensils, MessageSquare, Crown, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Workouts', url: '/workouts', icon: Dumbbell },
  { title: 'Meals', url: '/meals', icon: Utensils },
  { title: 'AI Coach', url: '/chatbot', icon: MessageSquare },
  { title: 'Premium', url: '/premium', icon: Crown },
  { title: 'Profile', url: '/profile', icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Fitgenix
            </span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
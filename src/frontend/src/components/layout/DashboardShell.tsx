import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useLoginIntent } from '../../hooks/useLoginIntent';
import { branding } from '../../utils/branding';

interface DashboardShellProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export default function DashboardShell({ children, sidebar }: DashboardShellProps) {
  const { clear } = useInternetIdentity();
  const { profile } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearIntent } = useLoginIntent();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    clearIntent();
    navigate({ to: '/' });
  };

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Background with subtle overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/assets/generated/dashboard-bg.dim_1920x1080.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.02]"
        />
        <div className="absolute inset-0 pastel-overlay" />
      </div>

      {/* Sidebar with clean white surface */}
      <aside className="relative z-10 w-64 tokyo-surface shadow-sm">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src="/assets/generated/pms-logo.dim_512x512.png"
                alt={branding.appName}
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg text-foreground">{branding.appName}</h1>
                <p className="text-xs text-muted-foreground">{branding.systemLabel}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">{sidebar}</div>

          {/* User Menu */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-medium truncate">{profile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email || ''}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

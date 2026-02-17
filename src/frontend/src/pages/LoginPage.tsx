import { useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, ShieldCheck, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLoginIntent } from '../hooks/useLoginIntent';
import { useQueryClient } from '@tanstack/react-query';
import { useBootstrapAdmin } from '../hooks/useBootstrapAdmin';
import { BootstrapAdminResult } from '../backend';
import { authMessages } from '../utils/authMessages';
import { branding } from '../utils/branding';

export default function LoginPage() {
  const { login, identity, isLoggingIn, isLoginError, clear } = useInternetIdentity();
  const { role, profile, isLoading: userLoading, isFetched, verificationStatus, refetchProfile, refetchRole } = useCurrentUser();
  const { intent, setIntent, clearIntent } = useLoginIntent();
  const navigate = useNavigate();
  const saveProfile = useSaveCallerUserProfile();
  const queryClient = useQueryClient();
  const bootstrapAdmin = useBootstrapAdmin();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', department: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [bootstrapAttempted, setBootstrapAttempted] = useState(false);

  // Handle bootstrap admin for first-time admin login
  useEffect(() => {
    const attemptBootstrap = async () => {
      if (
        identity &&
        intent === 'admin' &&
        verificationStatus === 'unassigned' &&
        !bootstrapAttempted &&
        !isBootstrapping
      ) {
        setIsBootstrapping(true);
        setBootstrapAttempted(true);
        
        try {
          const result = await bootstrapAdmin.mutateAsync();
          
          if (result === BootstrapAdminResult.success) {
            // Bootstrap succeeded, refetch role and profile
            await Promise.all([refetchRole(), refetchProfile()]);
            toast.success('Welcome! You are now the first admin.');
          } else if (result === BootstrapAdminResult.adminAlreadyExists) {
            // Admin already exists - show clear error message
            setErrorMessage(authMessages.unassigned.adminAlreadyExists);
          }
        } catch (error) {
          console.error('Bootstrap failed:', error);
          setErrorMessage(authMessages.verificationError);
        } finally {
          setIsBootstrapping(false);
        }
      }
    };

    attemptBootstrap();
  }, [identity, intent, verificationStatus, bootstrapAttempted, isBootstrapping, bootstrapAdmin, refetchRole, refetchProfile]);

  // Handle role verification and navigation
  useEffect(() => {
    if (!identity || !intent || verificationStatus === 'loading' || isBootstrapping) {
      return;
    }

    // Handle unassigned role (no role assigned and bootstrap didn't work or wasn't attempted)
    if (verificationStatus === 'unassigned' && bootstrapAttempted && !isBootstrapping && !errorMessage) {
      const message = intent === 'admin'
        ? authMessages.unassigned.adminAlreadyExists
        : authMessages.unassigned.assistantNeedsAssignment;
      setErrorMessage(message);
      return;
    }

    // Handle error state
    if (verificationStatus === 'error') {
      setErrorMessage(authMessages.verificationError);
      return;
    }

    // Check for role mismatch
    if (verificationStatus === 'success' && role && isFetched) {
      const expectedRole = intent === 'admin' ? 'admin' : 'user';
      
      if (role !== expectedRole) {
        const message = intent === 'admin'
          ? authMessages.roleMismatch.admin
          : authMessages.roleMismatch.assistant;
        setErrorMessage(message);
        return;
      }

      // Role matches, proceed with profile check
      if (profile) {
        // User is authenticated, role matches, and has profile - redirect to dashboard
        if (role === 'admin') {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/assistant' });
        }
      } else if (profile === null && !userLoading) {
        // User is authenticated, role matches, but has no profile
        setShowProfileSetup(true);
      }
    }
  }, [identity, role, profile, navigate, isFetched, userLoading, intent, verificationStatus, isBootstrapping, bootstrapAttempted, errorMessage]);

  const handleLoginWithIntent = (selectedIntent: 'admin' | 'assistant') => {
    try {
      setIntent(selectedIntent);
      setErrorMessage(null);
      setBootstrapAttempted(false);
      login();
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogoutAndRetry = async () => {
    await clear();
    queryClient.clear();
    clearIntent();
    setErrorMessage(null);
    setBootstrapAttempted(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email || !profileForm.department) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await saveProfile.mutateAsync(profileForm);
      await refetchProfile();
      setShowProfileSetup(false);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  // Show error screen for role mismatch or unassigned
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background with subtle overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/generated/dashboard-bg.dim_1920x1080.png"
            alt=""
            className="w-full h-full object-cover opacity-[0.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-primary/3 to-accent/3" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md px-6">
          <div className="tokyo-surface-strong rounded-xl shadow-pastel-lg p-8 space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Access Denied</h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>

            <Button
              onClick={handleLogoutAndRetry}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {authMessages.logoutAction}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show role selection if not authenticated or no intent selected
  const showRoleSelection = !identity || (!intent && identity);

  // Show verifying state when authenticated with intent but still loading/bootstrapping
  const showVerifying = identity && intent && (verificationStatus === 'loading' || isBootstrapping);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with subtle overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/dashboard-bg.dim_1920x1080.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/98 via-primary/3 to-accent/3" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {showVerifying ? (
          <div className="tokyo-surface-strong rounded-xl shadow-pastel-lg p-12 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">
                  {isBootstrapping ? 'Setting up admin access...' : 'Verifying access...'}
                </h2>
                <p className="text-sm text-muted-foreground">Please wait a moment</p>
              </div>
            </div>
          </div>
        ) : showRoleSelection ? (
          <div className="tokyo-surface-strong rounded-xl shadow-pastel-lg p-8 space-y-8">
            {/* Logo */}
            <div className="flex flex-col items-center space-y-4">
              <img
                src="/assets/generated/pms-logo.dim_512x512.png"
                alt={`${branding.appName} Logo`}
                className="w-20 h-20 object-contain"
              />
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Welcome to {branding.appName}</h1>
                <p className="text-muted-foreground">{branding.systemLabel}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">Select your role to continue</p>
              
              <div className="grid gap-4">
                <Button
                  onClick={() => handleLoginWithIntent('admin')}
                  disabled={isLoggingIn}
                  size="lg"
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-primary hover:bg-primary/90 shadow-sm"
                >
                  <ShieldCheck className="h-8 w-8" />
                  <div className="space-y-1">
                    <div className="font-semibold text-base">Admin</div>
                    <div className="text-xs opacity-90 font-normal">Manage system and users</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleLoginWithIntent('assistant')}
                  disabled={isLoggingIn}
                  size="lg"
                  variant="secondary"
                  className="h-auto py-6 flex flex-col items-center gap-3 shadow-sm"
                >
                  <Users className="h-8 w-8" />
                  <div className="space-y-1">
                    <div className="font-semibold text-base">Placement Assistant</div>
                    <div className="text-xs opacity-90 font-normal">View your performance data</div>
                  </div>
                </Button>
              </div>

              {isLoginError && (
                <p className="text-sm text-destructive text-center">
                  Login failed. Please try again.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Profile Setup Dialog */}
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your information to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                placeholder="Engineering"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveProfile.isPending} className="w-full">
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

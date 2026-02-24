import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useLoginIntent } from '../../hooks/useLoginIntent';
import { authMessages } from '../../utils/authMessages';

interface AccessDeniedScreenProps {
  title?: string;
  message: string;
}

export default function AccessDeniedScreen({ title = 'Access Denied', message }: AccessDeniedScreenProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { clearIntent } = useLoginIntent();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    clearIntent();
    navigate({ to: '/' });
  };

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
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>

          <Button
            onClick={handleLogout}
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

import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import AppLoadingScreen from '../components/common/AppLoadingScreen';
import { useLoginIntent } from '../hooks/useLoginIntent';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { identity, isInitializing, isLoggingIn } = useInternetIdentity();
  const { intent } = useLoginIntent();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isInitializing && !isLoggingIn && !identity) {
      navigate({ to: '/' });
      return;
    }

    // Redirect to login if authenticated but no intent selected
    if (!isInitializing && !isLoggingIn && identity && !intent) {
      navigate({ to: '/' });
    }
  }, [identity, isInitializing, isLoggingIn, intent, navigate]);

  if (isInitializing || isLoggingIn) {
    return <AppLoadingScreen />;
  }

  if (!identity || !intent) {
    return null;
  }

  return <>{children}</>;
}

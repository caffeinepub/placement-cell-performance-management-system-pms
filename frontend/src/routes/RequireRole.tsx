import { ReactNode } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import AccessDeniedScreen from '../components/common/AccessDeniedScreen';
import AppLoadingScreen from '../components/common/AppLoadingScreen';
import { useLoginIntent } from '../hooks/useLoginIntent';
import { authMessages } from '../utils/authMessages';

interface RequireRoleProps {
  children: ReactNode;
  requiredRole: 'admin' | 'user';
}

export default function RequireRole({ children, requiredRole }: RequireRoleProps) {
  const { role, verificationStatus } = useCurrentUser();
  const { intent } = useLoginIntent();

  if (verificationStatus === 'loading') {
    return <AppLoadingScreen />;
  }

  if (verificationStatus === 'error') {
    return (
      <AccessDeniedScreen
        title="Verification Error"
        message={authMessages.verificationError}
      />
    );
  }

  if (verificationStatus === 'unassigned' || !role || role === 'guest') {
    return (
      <AccessDeniedScreen
        title="No Role Assigned"
        message={authMessages.unassigned.generic}
      />
    );
  }

  // Check for intent-role mismatch
  if (intent) {
    const expectedRole = intent === 'admin' ? 'admin' : 'user';
    if (role !== expectedRole) {
      const message = intent === 'admin'
        ? authMessages.roleMismatch.admin
        : authMessages.roleMismatch.assistant;
      return (
        <AccessDeniedScreen
          title="Role Mismatch"
          message={message}
        />
      );
    }
  }

  // Admin can access everything
  if (role === 'admin') {
    return <>{children}</>;
  }

  // User can only access user routes
  if (requiredRole === 'user' && role === 'user') {
    return <>{children}</>;
  }

  return (
    <AccessDeniedScreen
      title="Access Denied"
      message="You do not have permission to access this page."
    />
  );
}

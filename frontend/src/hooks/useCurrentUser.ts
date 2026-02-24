import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, UserRole } from '../backend';

export type VerificationStatus = 
  | 'loading'
  | 'success'
  | 'unassigned'
  | 'error';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const roleQuery = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const role = await actor.getCallerUserRole();
      return role;
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: Infinity
  });

  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false
  });

  const isAdminQuery = useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: Infinity
  });

  // Determine verification status
  const getVerificationStatus = (): VerificationStatus => {
    if (actorFetching || roleQuery.isLoading || profileQuery.isLoading) {
      return 'loading';
    }
    
    if (roleQuery.isError || profileQuery.isError) {
      return 'error';
    }
    
    // Check if role is unassigned (guest means no role assigned)
    if (roleQuery.data === 'guest') {
      return 'unassigned';
    }
    
    if (roleQuery.isFetched && profileQuery.isFetched) {
      return 'success';
    }
    
    return 'loading';
  };

  return {
    role: roleQuery.data,
    profile: profileQuery.data,
    isAdmin: isAdminQuery.data ?? false,
    isLoading: actorFetching || roleQuery.isLoading || profileQuery.isLoading,
    isFetched: !!actor && roleQuery.isFetched && profileQuery.isFetched,
    verificationStatus: getVerificationStatus(),
    roleError: roleQuery.error,
    profileError: profileQuery.error,
    refetchRole: roleQuery.refetch,
    refetchProfile: profileQuery.refetch
  };
}

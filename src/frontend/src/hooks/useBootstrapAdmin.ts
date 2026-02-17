import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { BootstrapAdminResult } from '../backend';

/**
 * Hook to bootstrap the first admin using the dedicated backend bootstrapAdmin endpoint.
 * Returns a deterministic result that the UI can interpret (success vs adminAlreadyExists).
 */
export function useBootstrapAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<BootstrapAdminResult> => {
      if (!actor) throw new Error('Actor not available');
      
      // Call the dedicated bootstrap endpoint
      const result = await actor.bootstrapAdmin();
      return result;
    },
    onSuccess: (result) => {
      if (result === BootstrapAdminResult.success) {
        // Bootstrap succeeded - invalidate role and profile queries to refetch
        queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
        queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      }
    }
  });
}

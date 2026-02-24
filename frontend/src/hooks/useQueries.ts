import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Goal, Competency, SkillRating, PerformanceReview, FeedbackItem, DevelopmentPlan, UserProfile, GoalStatus, UserRole, AssignmentType } from '../backend';
import { Principal } from '@dfinity/principal';

// Goal queries
export function useListGoals() {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: Goal[]; assignedToMe: Goal[] }>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return { assignedToAll: [], assignedToMe: [] };
      return actor.listGoals();
    },
    enabled: !!actor && !isFetching
  });
}

export function useListUpcomingGoals() {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: Goal[]; assignedToMe: Goal[] }>({
    queryKey: ['upcomingGoals'],
    queryFn: async () => {
      if (!actor) return { assignedToAll: [], assignedToMe: [] };
      return actor.listUpcomingGoals();
    },
    enabled: !!actor && !isFetching
  });
}

export function useCreateGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, deadline, assignment }: { title: string; description: string; deadline: bigint; assignment: AssignmentType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGoal(title, description, deadline, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingGoals'] });
    }
  });
}

export function useUpdateGoalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, progress }: { id: bigint; status: GoalStatus; progress: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGoalStatus(id, status, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingGoals'] });
    }
  });
}

// Competency queries
export function useListCompetencies() {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: Competency[]; assignedToMe: Competency[] }>({
    queryKey: ['competencies'],
    queryFn: async () => {
      if (!actor) return { assignedToAll: [], assignedToMe: [] };
      return actor.listCompetencies();
    },
    enabled: !!actor && !isFetching
  });
}

export function useAddCompetency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, assignment }: { name: string; description: string; assignment: AssignmentType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCompetency(name, description, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] });
    }
  });
}

export function useGetUserSkillRatings(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<SkillRating[]>({
    queryKey: ['skillRatings', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getUserSkillRatings(user);
    },
    enabled: !!actor && !isFetching && !!user
  });
}

export function useRateSkill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ competencyId, rating }: { competencyId: bigint; rating: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateSkill(competencyId, rating);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillRatings'] });
    }
  });
}

// Performance Review queries
export function useListPerformanceReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: PerformanceReview[]; assignedToMe: PerformanceReview[] }>({
    queryKey: ['performanceReviews'],
    queryFn: async () => {
      if (!actor) return { assignedToAll: [], assignedToMe: [] };
      return actor.listPerformanceReviews();
    },
    enabled: !!actor && !isFetching
  });
}

export function useSubmitPerformanceReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateName,
      questions,
      selfAssessment,
      managerAssessment,
      peerAssessment,
      assignment
    }: {
      templateName: string;
      questions: string[];
      selfAssessment: string[];
      managerAssessment: string[];
      peerAssessment: string[];
      assignment: AssignmentType;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPerformanceReview(templateName, questions, selfAssessment, managerAssessment, peerAssessment, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
    }
  });
}

// Feedback queries
export function useGetFeedbackForUser(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: FeedbackItem[]; assignedToMe: FeedbackItem[] }>({
    queryKey: ['feedbackFor', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return { assignedToAll: [], assignedToMe: [] };
      return actor.getFeedbackForUser(user);
    },
    enabled: !!actor && !isFetching && !!user
  });
}

export function useGetFeedbackFromUser(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: FeedbackItem[]; assignedToMe: FeedbackItem[] }>({
    queryKey: ['feedbackFrom', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return { assignedToAll: [], assignedToMe: [] };
      return actor.getFeedbackFromUser(user);
    },
    enabled: !!actor && !isFetching && !!user
  });
}

export function useAddFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, comment, assignment }: { to: Principal; comment: string; assignment: AssignmentType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFeedback(to, comment, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbackFor'] });
      queryClient.invalidateQueries({ queryKey: ['feedbackFrom'] });
    }
  });
}

// Development Plan queries
export function useGetDevelopmentPlansForUser(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<{ assignedToAll: DevelopmentPlan[]; assignedToMe: DevelopmentPlan[] }>({
    queryKey: ['developmentPlans', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return { assignedToAll: [], assignedToMe: [] };
      return actor.getDevelopmentPlansForUser(user);
    },
    enabled: !!actor && !isFetching && !!user
  });
}

export function useCreateDevelopmentPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ description, dueDate, assignment }: { description: string; dueDate: bigint; assignment: AssignmentType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDevelopmentPlan(description, dueDate, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developmentPlans'] });
    }
  });
}

export function useUpdateDevelopmentPlanStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: GoalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDevelopmentPlanStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developmentPlans'] });
    }
  });
}

// User Profile queries
export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    }
  });
}

// Role assignment (admin only)
export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    }
  });
}

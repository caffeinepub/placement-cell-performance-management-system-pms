import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListGoals, useUpdateGoalStatus } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { GoalStatus } from '../../../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

export default function MyGoalsModule() {
  const { data, isLoading, error, refetch } = useListGoals();
  const updateStatus = useUpdateGoalStatus();
  const [updatingGoal, setUpdatingGoal] = useState<string | null>(null);

  const handleUpdateProgress = async (goalId: bigint, newProgress: number, currentStatus: GoalStatus) => {
    setUpdatingGoal(goalId.toString());
    try {
      let newStatus = currentStatus;
      if (newProgress === 100) {
        newStatus = GoalStatus.completed;
      } else if (newProgress > 0) {
        newStatus = GoalStatus.inProgress;
      }

      await updateStatus.mutateAsync({
        id: goalId,
        status: newStatus,
        progress: BigInt(newProgress)
      });
      toast.success('Progress updated!');
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setUpdatingGoal(null);
    }
  };

  if (error) {
    return <ErrorState message="Failed to load goals" onRetry={() => refetch()} />;
  }

  const assignedToAll = data?.assignedToAll || [];
  const assignedToMe = data?.assignedToMe || [];

  const renderGoalCard = (goal: any) => (
    <Card key={goal.id.toString()}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-chart-1" />
              {goal.title}
            </CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </div>
          <Badge variant={goal.status === GoalStatus.completed ? 'default' : 'secondary'}>{goal.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Number(goal.progress)}%</span>
            </div>
            <Progress value={Number(goal.progress)} className="h-2" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Deadline: {new Date(Number(goal.deadline) / 1_000_000).toLocaleDateString()}
            </span>
            <Select
              value={goal.progress.toString()}
              onValueChange={(value) => handleUpdateProgress(goal.id, parseInt(value), goal.status)}
              disabled={updatingGoal === goal.id.toString()}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Update progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% - Not Started</SelectItem>
                <SelectItem value="25">25% - Started</SelectItem>
                <SelectItem value="50">50% - In Progress</SelectItem>
                <SelectItem value="75">75% - Almost Done</SelectItem>
                <SelectItem value="100">100% - Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
        <p className="text-muted-foreground mt-1">View and update your assigned goals</p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : assignedToAll.length === 0 && assignedToMe.length === 0 ? (
        <EmptyState title="No goals assigned" description="You don't have any goals assigned yet. Check back later!" />
      ) : (
        <div className="space-y-8">
          {/* Assigned to All Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to All</h2>
            {assignedToAll.length === 0 ? (
              <EmptyState 
                title="No goals for all members" 
                description="There are no goals assigned to all team members yet" 
              />
            ) : (
              <div className="grid gap-4">
                {assignedToAll.map(renderGoalCard)}
              </div>
            )}
          </div>

          {/* Assigned to Me Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to Me</h2>
            {assignedToMe.length === 0 ? (
              <EmptyState 
                title="No personal goals" 
                description="You don't have any goals specifically assigned to you yet" 
              />
            ) : (
              <div className="grid gap-4">
                {assignedToMe.map(renderGoalCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetDevelopmentPlansForUser } from '../../../hooks/useQueries';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import { GoalStatus } from '../../../backend';

export default function MyDevelopmentPlanModule() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() || null;
  const { data, isLoading } = useGetDevelopmentPlansForUser(principal);

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.completed:
        return 'default';
      case GoalStatus.inProgress:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const assignedToAll = data?.assignedToAll || [];
  const assignedToMe = data?.assignedToMe || [];

  const renderPlanCard = (plan: any) => (
    <Card key={plan.id.toString()}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-chart-4" />
              Development Plan
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          <Badge variant={getStatusColor(plan.status)}>{plan.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Due: {new Date(Number(plan.dueDate) / 1_000_000).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Development Plan</h1>
        <p className="text-muted-foreground mt-1">Track your personal development and improvement plans</p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : assignedToAll.length === 0 && assignedToMe.length === 0 ? (
        <EmptyState title="No development plans" description="You don't have any development plans assigned yet" />
      ) : (
        <div className="space-y-8">
          {/* Assigned to All Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to All</h2>
            {assignedToAll.length === 0 ? (
              <EmptyState 
                title="No plans for all members" 
                description="There are no development plans assigned to all team members yet" 
              />
            ) : (
              <div className="grid gap-4">
                {assignedToAll.map(renderPlanCard)}
              </div>
            )}
          </div>

          {/* Assigned to Me Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to Me</h2>
            {assignedToMe.length === 0 ? (
              <EmptyState 
                title="No personal plans" 
                description="You don't have any development plans specifically assigned to you yet" 
              />
            ) : (
              <div className="grid gap-4">
                {assignedToMe.map(renderPlanCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListGoals, useListPerformanceReviews, useListCompetencies } from '../../../hooks/useQueries';
import { Target, ClipboardCheck, Award, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalStatus } from '../../../backend';

export default function AdminOverview() {
  const { data: goalsData, isLoading: goalsLoading } = useListGoals();
  const { data: reviewsData, isLoading: reviewsLoading } = useListPerformanceReviews();
  const { data: competenciesData, isLoading: competenciesLoading } = useListCompetencies();

  // Combine split data into flat arrays
  const goals = goalsData ? [...goalsData.assignedToAll, ...goalsData.assignedToMe] : [];
  const reviews = reviewsData ? [...reviewsData.assignedToAll, ...reviewsData.assignedToMe] : [];
  const competencies = competenciesData ? [...competenciesData.assignedToAll, ...competenciesData.assignedToMe] : [];

  const completedGoals = goals.filter((g) => g.status === GoalStatus.completed).length;
  const inProgressGoals = goals.filter((g) => g.status === GoalStatus.inProgress).length;
  const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;

  const stats = [
    {
      title: 'Total Goals',
      value: goals.length,
      icon: Target,
      description: `${completedGoals} completed, ${inProgressGoals} in progress`,
      color: 'text-chart-1'
    },
    {
      title: 'Performance Reviews',
      value: reviews.length,
      icon: ClipboardCheck,
      description: 'Total submissions',
      color: 'text-chart-2'
    },
    {
      title: 'Competencies',
      value: competencies.length,
      icon: Award,
      description: 'Skill frameworks defined',
      color: 'text-chart-3'
    },
    {
      title: 'Goal Completion',
      value: `${Math.round(goalCompletionRate)}%`,
      icon: TrendingUp,
      description: 'Overall progress',
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your placement cell performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Goals</CardTitle>
          <CardDescription>Latest goals across all team members</CardDescription>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals yet</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id.toString()} className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{goal.title}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={Number(goal.progress)} className="h-2" />
                    </div>
                    <Badge variant={goal.status === GoalStatus.completed ? 'default' : 'secondary'}>
                      {goal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

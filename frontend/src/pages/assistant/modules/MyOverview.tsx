import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListGoals, useListPerformanceReviews } from '../../../hooks/useQueries';
import { Target, ClipboardCheck, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalStatus } from '../../../backend';

export default function MyOverview() {
  const { data: goalsData } = useListGoals();
  const { data: reviewsData } = useListPerformanceReviews();

  // Combine split data into flat arrays
  const goals = goalsData ? [...goalsData.assignedToAll, ...goalsData.assignedToMe] : [];
  const reviews = reviewsData ? [...reviewsData.assignedToAll, ...reviewsData.assignedToMe] : [];

  const completedGoals = goals.filter((g) => g.status === GoalStatus.completed).length;
  const inProgressGoals = goals.filter((g) => g.status === GoalStatus.inProgress).length;
  const avgProgress = goals.length > 0 ? goals.reduce((sum, g) => sum + Number(g.progress), 0) / goals.length : 0;

  const stats = [
    {
      title: 'My Goals',
      value: goals.length,
      icon: Target,
      description: `${completedGoals} completed, ${inProgressGoals} in progress`,
      color: 'text-chart-1'
    },
    {
      title: 'Reviews Submitted',
      value: reviews.length,
      icon: ClipboardCheck,
      description: 'Performance reviews',
      color: 'text-chart-2'
    },
    {
      title: 'Average Progress',
      value: `${Math.round(avgProgress)}%`,
      icon: TrendingUp,
      description: 'Across all goals',
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your performance and development</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
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
          <CardTitle>My Active Goals</CardTitle>
          <CardDescription>Your current goals and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals assigned yet</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
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

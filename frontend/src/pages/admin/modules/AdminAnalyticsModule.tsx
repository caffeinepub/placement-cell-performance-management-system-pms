import { useListGoals } from '../../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { GoalStatus } from '../../../backend';
import ErrorState from '../../../components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAnalyticsModule() {
  const { data: goalsData, isLoading, error, refetch } = useListGoals();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">System-wide performance metrics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load analytics data" onRetry={refetch} />;
  }

  // Combine assignedToAll and assignedToMe into flat arrays for system-wide metrics
  const allGoals = [...(goalsData?.assignedToAll || []), ...(goalsData?.assignedToMe || [])];

  // Goal Status Distribution
  const statusCounts = allGoals.reduce((acc, goal) => {
    const status = GoalStatus[goal.status];
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/([A-Z])/g, ' $1').trim(),
    value: count,
  }));

  // Goal Progress Distribution
  const progressRanges = [
    { name: '0-25%', min: 0, max: 25, count: 0 },
    { name: '26-50%', min: 26, max: 50, count: 0 },
    { name: '51-75%', min: 51, max: 75, count: 0 },
    { name: '76-100%', min: 76, max: 100, count: 0 },
  ];

  allGoals.forEach((goal) => {
    const progress = Number(goal.progress);
    const range = progressRanges.find((r) => progress >= r.min && progress <= r.max);
    if (range) range.count++;
  });

  const progressData = progressRanges.map(({ name, count }) => ({ name, count }));

  const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--chart-2))', 'oklch(var(--chart-3))', 'oklch(var(--chart-4))'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">System-wide performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Goal Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Overview of all goal statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: 'Goals',
                  color: 'oklch(var(--chart-1))',
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="oklch(var(--chart-1))"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Goal Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Distribution</CardTitle>
            <CardDescription>Goals grouped by completion percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: 'Goals',
                  color: 'oklch(var(--chart-2))',
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                  <XAxis dataKey="name" stroke="oklch(var(--muted-foreground))" />
                  <YAxis stroke="oklch(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

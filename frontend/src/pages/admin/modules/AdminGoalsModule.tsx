import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListGoals, useCreateGoal } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { GoalStatus, AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';

export default function AdminGoalsModule() {
  const { data, isLoading, error, refetch } = useListGoals();
  const allGoals = data ? [...data.assignedToAll, ...data.assignedToMe] : [];
  const createGoal = useCreateGoal();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    deadline: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.deadline) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.assignmentMode === 'specific' && !form.specificMembers.trim()) {
      toast.error('Please enter at least one member principal ID');
      return;
    }

    try {
      const deadlineNano = BigInt(new Date(form.deadline).getTime()) * BigInt(1_000_000);
      
      let assignment: AssignmentType;
      if (form.assignmentMode === 'all') {
        assignment = { __kind__: 'allMembers', allMembers: null };
      } else {
        const principals = parsePrincipalList(form.specificMembers);
        if (principals.length === 0) {
          toast.error('Please enter valid principal IDs');
          return;
        }
        assignment = { __kind__: 'specificMembers', specificMembers: principals };
      }

      await createGoal.mutateAsync({
        title: form.title,
        description: form.description,
        deadline: deadlineNano,
        assignment
      });
      toast.success('Goal created successfully!');
      setForm({ title: '', description: '', deadline: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.completed:
        return 'default';
      case GoalStatus.inProgress:
        return 'secondary';
      case GoalStatus.onHold:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getAssignmentBadge = (assignment: AssignmentType) => {
    if (assignment.__kind__ === 'allMembers') {
      return (
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          All Members
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          {assignment.specificMembers.length} Member{assignment.specificMembers.length > 1 ? 's' : ''}
        </Badge>
      );
    }
  };

  if (error) {
    return <ErrorState message="Failed to load goals" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals Management</h1>
          <p className="text-muted-foreground mt-1">Create and track team goals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>Set a new goal for the team</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., Complete Q1 Training"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the goal..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignmentMode">Assignment</Label>
                  <Select
                    value={form.assignmentMode}
                    onValueChange={(value: 'all' | 'specific') => setForm({ ...form, assignmentMode: value })}
                  >
                    <SelectTrigger id="assignmentMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Assign to All Assistance Members</SelectItem>
                      <SelectItem value="specific">Assign to Specific Member(s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.assignmentMode === 'specific' && (
                  <div className="space-y-2">
                    <Label htmlFor="specificMembers">Member Principal IDs</Label>
                    <Textarea
                      id="specificMembers"
                      value={form.specificMembers}
                      onChange={(e) => setForm({ ...form, specificMembers: e.target.value })}
                      placeholder="Enter principal IDs (one per line or comma-separated)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter one or more principal IDs, separated by commas or new lines
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : allGoals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Create your first goal to start tracking team progress"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allGoals.map((goal) => (
            <Card key={goal.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-1" />
                    {goal.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(goal.status)}>
                      {GoalStatus[goal.status]}
                    </Badge>
                    {getAssignmentBadge(goal.assignment)}
                  </div>
                </div>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Number(goal.progress)}%</span>
                  </div>
                  <Progress value={Number(goal.progress)} />
                  <p className="text-xs text-muted-foreground">
                    Deadline: {new Date(Number(goal.deadline) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

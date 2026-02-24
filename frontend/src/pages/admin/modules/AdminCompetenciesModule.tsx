import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListCompetencies, useAddCompetency } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';

export default function AdminCompetenciesModule() {
  const { data, isLoading, error, refetch } = useListCompetencies();
  const allCompetencies = data ? [...data.assignedToAll, ...data.assignedToMe] : [];
  const addCompetency = useAddCompetency();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    description: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.assignmentMode === 'specific' && !form.specificMembers.trim()) {
      toast.error('Please enter at least one member principal ID');
      return;
    }

    try {
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

      await addCompetency.mutateAsync({ 
        name: form.name, 
        description: form.description,
        assignment
      });
      toast.success('Competency added successfully!');
      setForm({ name: '', description: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add competency');
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
    return <ErrorState message="Failed to load competencies" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competencies & Skills</h1>
          <p className="text-muted-foreground mt-1">Define and track skill frameworks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Competency
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Competency</DialogTitle>
                <DialogDescription>Define a new skill or competency to track</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Competency Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Communication Skills"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe this competency..."
                    rows={3}
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
                <Button type="submit" disabled={addCompetency.isPending}>
                  {addCompetency.isPending ? 'Adding...' : 'Add Competency'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : allCompetencies.length === 0 ? (
        <EmptyState
          title="No competencies defined"
          description="Add competencies to start tracking team skills and development"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Competency
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {allCompetencies.map((competency) => (
            <Card key={competency.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-chart-3" />
                    {competency.name}
                  </CardTitle>
                  {getAssignmentBadge(competency.assignment)}
                </div>
                <CardDescription>{competency.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

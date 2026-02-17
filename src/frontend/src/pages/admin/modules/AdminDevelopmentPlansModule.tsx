import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDevelopmentPlan } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';

export default function AdminDevelopmentPlansModule() {
  const createPlan = useCreateDevelopmentPlan();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    description: '',
    dueDate: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.assignmentMode === 'specific' && !form.specificMembers.trim()) {
      toast.error('Please enter at least one member principal ID');
      return;
    }

    try {
      const dueDateNano = BigInt(new Date(form.dueDate).getTime()) * BigInt(1_000_000);
      
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

      await createPlan.mutateAsync({ 
        description: form.description, 
        dueDate: dueDateNano,
        assignment
      });
      toast.success('Development plan created successfully!');
      setForm({ description: '', dueDate: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create development plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Development Plans & PIPs</h1>
          <p className="text-muted-foreground mt-1">Manage performance improvement and development plans</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Development Plan</DialogTitle>
                <DialogDescription>Create a new development or improvement plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Plan Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the development plan..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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
                <Button type="submit" disabled={createPlan.isPending}>
                  {createPlan.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-chart-4" />
            Development Plans Management
          </CardTitle>
          <CardDescription>
            Create development plans that will be visible to all or specific assistance team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the "Create Plan" button above to add new development plans. Team members will see plans assigned to them in their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

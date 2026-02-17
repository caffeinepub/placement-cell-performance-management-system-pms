import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddFeedback } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';
import { Principal } from '@dfinity/principal';

export default function AdminFeedbackModule() {
  const addFeedback = useAddFeedback();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    comment: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      toast.error('Please enter feedback comment');
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

      // Use a placeholder principal for 'to' since backend requires it
      // The assignment field determines actual recipients
      const placeholderPrincipal = Principal.fromText('aaaaa-aa');
      
      await addFeedback.mutateAsync({ 
        to: placeholderPrincipal, 
        comment: form.comment,
        assignment
      });
      toast.success('Feedback created successfully!');
      setForm({ comment: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to create feedback');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Continuous Feedback</h1>
          <p className="text-muted-foreground mt-1">Create and manage team feedback</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Feedback</DialogTitle>
                <DialogDescription>Provide feedback to team members</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="comment">Feedback</Label>
                  <Textarea
                    id="comment"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Write your feedback..."
                    rows={4}
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
                <Button type="submit" disabled={addFeedback.isPending}>
                  {addFeedback.isPending ? 'Creating...' : 'Create Feedback'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-chart-3" />
            Feedback Management
          </CardTitle>
          <CardDescription>
            Create feedback items that will be visible to all or specific assistance team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the "Create Feedback" button above to add new feedback items. Team members will see feedback assigned to them in their dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetFeedbackForUser, useGetFeedbackFromUser, useAddFeedback } from '../../../hooks/useQueries';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';

export default function MyFeedbackModule() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() ?? null;
  const { data: receivedData, isLoading: receivedLoading, error: receivedError, refetch: refetchReceived } = useGetFeedbackForUser(principal);
  const { data: sentData, isLoading: sentLoading, error: sentError, refetch: refetchSent } = useGetFeedbackFromUser(principal);
  const addFeedback = useAddFeedback();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    to: '', 
    comment: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.to || !form.comment) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.assignmentMode === 'specific' && !form.specificMembers.trim()) {
      toast.error('Please enter at least one member principal ID');
      return;
    }

    try {
      const toPrincipal = parsePrincipalList(form.to)[0];
      if (!toPrincipal) {
        toast.error('Invalid recipient principal ID');
        return;
      }

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

      await addFeedback.mutateAsync({ 
        to: toPrincipal, 
        comment: form.comment,
        assignment
      });
      toast.success('Feedback sent successfully!');
      setForm({ to: '', comment: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to send feedback');
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

  if (receivedError || sentError) {
    return <ErrorState message="Failed to load feedback" onRetry={() => { refetchReceived(); refetchSent(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Feedback</h1>
          <p className="text-muted-foreground mt-1">View and provide feedback</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Give Feedback
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Give Feedback</DialogTitle>
                <DialogDescription>Provide feedback to a team member</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="to">Recipient Principal ID</Label>
                  <Input
                    id="to"
                    value={form.to}
                    onChange={(e) => setForm({ ...form, to: e.target.value })}
                    placeholder="Enter principal ID"
                  />
                </div>
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
                  {addFeedback.isPending ? 'Sending...' : 'Send Feedback'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedLoading ? (
            <TableSkeleton />
          ) : !receivedData || (receivedData.assignedToAll.length === 0 && receivedData.assignedToMe.length === 0) ? (
            <EmptyState
              title="No feedback received"
              description="You haven't received any feedback yet"
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Give Feedback
                </Button>
              }
            />
          ) : (
            <>
              {receivedData.assignedToAll.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned to All</h3>
                  <div className="space-y-3">
                    {receivedData.assignedToAll.map((item) => (
                      <Card key={item.id.toString()}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <MessageSquare className="h-4 w-4 text-chart-2" />
                              Feedback from {item.from.toString().slice(0, 8)}...
                            </CardTitle>
                            {getAssignmentBadge(item.assignment)}
                          </div>
                          <CardDescription>
                            {new Date(Number(item.timestamp) / 1_000_000).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{item.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {receivedData.assignedToMe.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Assigned to Me</h3>
                  <div className="space-y-3">
                    {receivedData.assignedToMe.map((item) => (
                      <Card key={item.id.toString()}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <MessageSquare className="h-4 w-4 text-chart-2" />
                              Feedback from {item.from.toString().slice(0, 8)}...
                            </CardTitle>
                            {getAssignmentBadge(item.assignment)}
                          </div>
                          <CardDescription>
                            {new Date(Number(item.timestamp) / 1_000_000).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{item.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentLoading ? (
            <TableSkeleton />
          ) : !sentData || (sentData.assignedToAll.length === 0 && sentData.assignedToMe.length === 0) ? (
            <EmptyState
              title="No feedback sent"
              description="You haven't sent any feedback yet"
              action={
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Give Feedback
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {[...sentData.assignedToAll, ...sentData.assignedToMe].map((item) => (
                <Card key={item.id.toString()}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4 text-chart-2" />
                        Feedback to {item.to.toString().slice(0, 8)}...
                      </CardTitle>
                      {getAssignmentBadge(item.assignment)}
                    </div>
                    <CardDescription>
                      {new Date(Number(item.timestamp) / 1_000_000).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListPerformanceReviews, useSubmitPerformanceReview } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Plus, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { AssignmentType } from '../../../backend';
import { parsePrincipalList } from '../../../utils/principals';

export default function MyReviewsModule() {
  const { data, isLoading, error, refetch } = useListPerformanceReviews();
  const submitReview = useSubmitPerformanceReview();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    templateName: '', 
    questions: '',
    selfAssessment: '',
    assignmentMode: 'all' as 'all' | 'specific',
    specificMembers: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.templateName || !form.questions || !form.selfAssessment) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.assignmentMode === 'specific' && !form.specificMembers.trim()) {
      toast.error('Please enter at least one member principal ID');
      return;
    }

    try {
      const questions = form.questions.split('\n').filter(q => q.trim());
      const selfAssessment = form.selfAssessment.split('\n').filter(a => a.trim());

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

      await submitReview.mutateAsync({
        templateName: form.templateName,
        questions,
        selfAssessment,
        managerAssessment: [],
        peerAssessment: [],
        assignment
      });
      toast.success('Review submitted successfully!');
      setForm({ templateName: '', questions: '', selfAssessment: '', assignmentMode: 'all', specificMembers: '' });
      setOpen(false);
    } catch (error) {
      toast.error('Failed to submit review');
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
    return <ErrorState message="Failed to load reviews" onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground mt-1">View and submit performance reviews</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Submit Performance Review</DialogTitle>
                <DialogDescription>Complete your self-assessment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Review Template Name</Label>
                  <Input
                    id="templateName"
                    value={form.templateName}
                    onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                    placeholder="e.g., Q1 2024 Review"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questions">Questions (one per line)</Label>
                  <Textarea
                    id="questions"
                    value={form.questions}
                    onChange={(e) => setForm({ ...form, questions: e.target.value })}
                    placeholder="Enter questions, one per line"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selfAssessment">Self Assessment (one per line)</Label>
                  <Textarea
                    id="selfAssessment"
                    value={form.selfAssessment}
                    onChange={(e) => setForm({ ...form, selfAssessment: e.target.value })}
                    placeholder="Enter your answers, one per line"
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
                <Button type="submit" disabled={submitReview.isPending}>
                  {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : !data || (data.assignedToAll.length === 0 && data.assignedToMe.length === 0) ? (
        <EmptyState
          title="No reviews yet"
          description="Submit your first performance review"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Submit Review
            </Button>
          }
        />
      ) : (
        <>
          {data.assignedToAll.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Assigned to All</h3>
              <div className="space-y-3">
                {data.assignedToAll.map((review) => (
                  <Card key={review.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-chart-4" />
                          {review.templateName}
                        </CardTitle>
                        {getAssignmentBadge(review.assignment)}
                      </div>
                      <CardDescription>
                        {review.questions.length} question{review.questions.length > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Self Assessment:</span> {review.selfAssessment.length} response{review.selfAssessment.length > 1 ? 's' : ''}
                        </div>
                        <div>
                          <span className="font-medium">Manager Assessment:</span> {review.managerAssessment.length} response{review.managerAssessment.length > 1 ? 's' : ''}
                        </div>
                        <div>
                          <span className="font-medium">Peer Assessment:</span> {review.peerAssessment.length} response{review.peerAssessment.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {data.assignedToMe.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Assigned to Me</h3>
              <div className="space-y-3">
                {data.assignedToMe.map((review) => (
                  <Card key={review.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardCheck className="h-5 w-5 text-chart-4" />
                          {review.templateName}
                        </CardTitle>
                        {getAssignmentBadge(review.assignment)}
                      </div>
                      <CardDescription>
                        {review.questions.length} question{review.questions.length > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Self Assessment:</span> {review.selfAssessment.length} response{review.selfAssessment.length > 1 ? 's' : ''}
                        </div>
                        <div>
                          <span className="font-medium">Manager Assessment:</span> {review.managerAssessment.length} response{review.managerAssessment.length > 1 ? 's' : ''}
                        </div>
                        <div>
                          <span className="font-medium">Peer Assessment:</span> {review.peerAssessment.length} response{review.peerAssessment.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

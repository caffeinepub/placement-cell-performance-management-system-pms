import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListPerformanceReviews } from '../../../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Users, User } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';
import ErrorState from '../../../components/common/ErrorState';
import { AssignmentType } from '../../../backend';

export default function AdminReviewsModule() {
  const { data, isLoading, error, refetch } = useListPerformanceReviews();

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

  const allReviews = data ? [...data.assignedToAll, ...data.assignedToMe] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
        <p className="text-muted-foreground mt-1">View and manage team performance reviews</p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : allReviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Performance reviews will appear here once team members submit them"
        />
      ) : (
        <div className="grid gap-4">
          {allReviews.map((review) => (
            <Card key={review.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-chart-2" />
                      {review.templateName}
                    </CardTitle>
                    <CardDescription>
                      Submitted by: {review.submittedBy.toString().slice(0, 10)}...
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getAssignmentBadge(review.assignment)}
                    <Badge>Submitted</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {review.selfAssessment.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Self Assessment</h4>
                      <p className="text-sm text-muted-foreground">{review.selfAssessment[0]}</p>
                    </div>
                  )}
                  {review.managerAssessment.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Manager Assessment</h4>
                      <p className="text-sm text-muted-foreground">{review.managerAssessment[0]}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

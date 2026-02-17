import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useListCompetencies, useGetUserSkillRatings, useRateSkill } from '../../../hooks/useQueries';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Award, Star } from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from '../../../components/common/EmptyState';
import { TableSkeleton } from '../../../components/common/Skeletons';

export default function MyCompetenciesModule() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() || null;
  const { data, isLoading: loadingCompetencies } = useListCompetencies();
  const { data: ratings = [], isLoading: loadingRatings } = useGetUserSkillRatings(principal);
  const rateSkill = useRateSkill();

  const handleRate = async (competencyId: bigint, rating: number) => {
    try {
      await rateSkill.mutateAsync({ competencyId, rating: BigInt(rating) });
      toast.success('Rating saved!');
    } catch (error) {
      toast.error('Failed to save rating');
    }
  };

  const getRating = (competencyId: bigint) => {
    const rating = ratings.find((r) => r.competencyId === competencyId);
    return rating ? Number(rating.rating) : 0;
  };

  const isLoading = loadingCompetencies || loadingRatings;
  const assignedToAll = data?.assignedToAll || [];
  const assignedToMe = data?.assignedToMe || [];

  const renderCompetencyCard = (competency: any) => {
    const currentRating = getRating(competency.id);
    return (
      <Card key={competency.id.toString()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-chart-3" />
            {competency.name}
          </CardTitle>
          <CardDescription>{competency.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(competency.id, star)}
                  disabled={rateSkill.isPending}
                  className="transition-colors hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentRating === 0 ? 'Not rated yet' : `Your rating: ${currentRating}/5`}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Skills & Competencies</h1>
        <p className="text-muted-foreground mt-1">Rate your skills and track your development</p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : assignedToAll.length === 0 && assignedToMe.length === 0 ? (
        <EmptyState title="No competencies defined" description="Competencies will appear here once they are added by administrators" />
      ) : (
        <div className="space-y-8">
          {/* Assigned to All Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to All</h2>
            {assignedToAll.length === 0 ? (
              <EmptyState 
                title="No competencies for all members" 
                description="There are no competencies assigned to all team members yet" 
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {assignedToAll.map(renderCompetencyCard)}
              </div>
            )}
          </div>

          {/* Assigned to Me Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned to Me</h2>
            {assignedToMe.length === 0 ? (
              <EmptyState 
                title="No personal competencies" 
                description="You don't have any competencies specifically assigned to you yet" 
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {assignedToMe.map(renderCompetencyCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

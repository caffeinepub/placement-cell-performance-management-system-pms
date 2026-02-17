import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { LayoutDashboard, Target, ClipboardCheck, MessageSquare, Award, BookOpen } from 'lucide-react';
import MyGoalsModule from './modules/MyGoalsModule';
import MyReviewsModule from './modules/MyReviewsModule';
import MyFeedbackModule from './modules/MyFeedbackModule';
import MyCompetenciesModule from './modules/MyCompetenciesModule';
import MyDevelopmentPlanModule from './modules/MyDevelopmentPlanModule';
import MyOverview from './modules/MyOverview';

export default function AssistantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = (
    <nav className="space-y-1">
      <button
        onClick={() => setActiveTab('overview')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'overview'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        Overview
      </button>
      <button
        onClick={() => setActiveTab('goals')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'goals'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Target className="h-5 w-5" />
        My Goals
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'reviews'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <ClipboardCheck className="h-5 w-5" />
        My Reviews
      </button>
      <button
        onClick={() => setActiveTab('feedback')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'feedback'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <MessageSquare className="h-5 w-5" />
        Feedback
      </button>
      <button
        onClick={() => setActiveTab('competencies')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'competencies'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Award className="h-5 w-5" />
        My Skills
      </button>
      <button
        onClick={() => setActiveTab('development')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'development'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <BookOpen className="h-5 w-5" />
        Development Plan
      </button>
    </nav>
  );

  return (
    <DashboardShell sidebar={navigation}>
      <div className="space-y-6">
        {activeTab === 'overview' && <MyOverview />}
        {activeTab === 'goals' && <MyGoalsModule />}
        {activeTab === 'reviews' && <MyReviewsModule />}
        {activeTab === 'feedback' && <MyFeedbackModule />}
        {activeTab === 'competencies' && <MyCompetenciesModule />}
        {activeTab === 'development' && <MyDevelopmentPlanModule />}
      </div>
    </DashboardShell>
  );
}

import { useState } from 'react';
import DashboardShell from '../../components/layout/DashboardShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Target, ClipboardCheck, MessageSquare, Award, BookOpen, BarChart3, Users } from 'lucide-react';
import AdminOverview from './modules/AdminOverview';
import AdminGoalsModule from './modules/AdminGoalsModule';
import AdminReviewsModule from './modules/AdminReviewsModule';
import AdminFeedbackModule from './modules/AdminFeedbackModule';
import AdminCompetenciesModule from './modules/AdminCompetenciesModule';
import AdminDevelopmentPlansModule from './modules/AdminDevelopmentPlansModule';
import AdminAnalyticsModule from './modules/AdminAnalyticsModule';
import AdminUsersRolesModule from './modules/AdminUsersRolesModule';

export default function AdminDashboard() {
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
        onClick={() => setActiveTab('users')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'users'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Users className="h-5 w-5" />
        Users & Roles
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
        Goals
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
        Reviews
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
        Competencies
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
        Development Plans
      </button>
      <button
        onClick={() => setActiveTab('analytics')}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'analytics'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <BarChart3 className="h-5 w-5" />
        Analytics
      </button>
    </nav>
  );

  return (
    <DashboardShell sidebar={navigation}>
      <div className="space-y-6">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && <AdminUsersRolesModule />}
        {activeTab === 'goals' && <AdminGoalsModule />}
        {activeTab === 'reviews' && <AdminReviewsModule />}
        {activeTab === 'feedback' && <AdminFeedbackModule />}
        {activeTab === 'competencies' && <AdminCompetenciesModule />}
        {activeTab === 'development' && <AdminDevelopmentPlansModule />}
        {activeTab === 'analytics' && <AdminAnalyticsModule />}
      </div>
    </DashboardShell>
  );
}

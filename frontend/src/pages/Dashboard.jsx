import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Brain, FileText, BookOpen, Users, MessageSquare, 
  TrendingUp, Clock, CheckCircle, AlertCircle, Calendar,
  ArrowRight, Sparkles, GraduationCap, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardFooter from '@/components/dashboard/DashboardFooter';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    assignments: { pending: 0, completed: 0 },
    aiQueries: 0,
    pastPapers: 0,
    tutorSessions: 0
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Get student profile
      const students = await base44.entities.Student.filter({ user_id: userData.id });
      if (students.length > 0) {
        setProfile(students[0]);
        
        // Load student stats
        const [submissions, aiConvos, tutorSessions] = await Promise.all([
          base44.entities.Submission.filter({ student_id: students[0].id }),
          base44.entities.AIConversation.filter({ user_id: userData.id }),
          base44.entities.TutorSession.filter({ student_id: students[0].id })
        ]);

        setStats({
          assignments: {
            pending: submissions.filter(s => s.status === 'pending').length,
            completed: submissions.filter(s => ['submitted', 'ai_graded', 'teacher_reviewed'].includes(s.status)).length
          },
          aiQueries: aiConvos.length,
          pastPapers: 0,
          tutorSessions: tutorSessions.filter(s => s.status === 'completed').length
        });
      }

      // Load recent assignments
      const assignments = await base44.entities.Assignment.list('-created_date', 5);
      setRecentAssignments(assignments);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Brain, label: 'Ask AI Tutor', page: 'AITutor', color: 'from-violet-500 to-purple-600' },
    { icon: FileText, label: 'Past Papers', page: 'PastPapers', color: 'from-blue-500 to-cyan-600' },
    { icon: BookOpen, label: 'Study Notes', page: 'Notes', color: 'from-emerald-500 to-green-600' },
    { icon: Users, label: 'Find Tutor', page: 'Tutors', color: 'from-orange-500 to-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
            <Sparkles className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 mb-6">
            {profile?.level === 'senior_secondary' 
              ? `You're in ${profile?.grade_class}. Keep up the great work!`
              : 'Ready to continue your learning journey?'}
          </p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} to={createPageUrl(action.page)}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <action.icon className="h-6 w-6 mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending Assignments</p>
                <p className="text-3xl font-bold text-slate-900">{stats.assignments.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-3xl font-bold text-slate-900">{stats.assignments.completed}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">AI Questions Asked</p>
                <p className="text-3xl font-bold text-slate-900">{stats.aiQueries}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tutor Sessions</p>
                <p className="text-3xl font-bold text-slate-900">{stats.tutorSessions}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Assignments */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Assignments</CardTitle>
            <Link to={createPageUrl('Assignments')}>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{assignment.title}</h4>
                      <p className="text-sm text-slate-500">{assignment.subject} • {assignment.grade_class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Due {new Date(assignment.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Tutor Promo */}
        <Card className="border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Tutor</h3>
            <p className="text-sm text-slate-600 mb-4">
              Get instant answers to your questions with voice explanations powered by multiple AI models.
            </p>
            <Link to={createPageUrl('AITutor')}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Preview */}
      {profile && (
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <Link to={createPageUrl('Performance')}>
              <Button variant="ghost" size="sm">
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Assignment Completion</span>
                  <span className="text-sm font-medium">
                    {stats.assignments.completed + stats.assignments.pending > 0
                      ? Math.round((stats.assignments.completed / (stats.assignments.completed + stats.assignments.pending)) * 100)
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.assignments.completed + stats.assignments.pending > 0
                    ? (stats.assignments.completed / (stats.assignments.completed + stats.assignments.pending)) * 100
                    : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">AI Learning Sessions</span>
                  <span className="text-sm font-medium">{stats.aiQueries} queries</span>
                </div>
                <Progress value={Math.min(stats.aiQueries * 10, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Tutor Engagement</span>
                  <span className="text-sm font-medium">{stats.tutorSessions} sessions</span>
                </div>
                <Progress value={Math.min(stats.tutorSessions * 20, 100)} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DashboardFooter />
    </div>
  );
}
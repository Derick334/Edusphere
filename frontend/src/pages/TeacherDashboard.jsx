import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Users, FileText, Plus, Eye, Edit, Trash2, 
  Loader2, CheckCircle, Clock, GraduationCap,
  BarChart3, Calendar, Settings, AlertTriangle, ThumbsUp, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import RubricBuilder from '@/components/assignments/RubricBuilder';
import GradingSettings from '@/components/assignments/GradingSettings';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    level: '',
    grade_class: '',
    due_date: '',
    total_marks: 100,
    assignment_type: 'essay',
    grading_rubric: null,
    auto_approval_threshold: 80,
    flag_review_threshold: 50,
    plagiarism_check_enabled: true,
    plagiarism_threshold: 20
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 
    'Biology', 'History', 'Geography', 'CRE', 'Business Studies'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const teachers = await base44.entities.Teacher.filter({ user_id: userData.id });
      if (teachers.length > 0) {
        setProfile(teachers[0]);
        
        // Load teacher's assignments
        const teacherAssignments = await base44.entities.Assignment.filter(
          { teacher_id: teachers[0].id },
          '-created_date'
        );
        setAssignments(teacherAssignments);

        // Load submissions for these assignments
        const allSubmissions = [];
        for (const assignment of teacherAssignments.slice(0, 5)) {
          const subs = await base44.entities.Submission.filter({ assignment_id: assignment.id });
          allSubmissions.push(...subs.map(s => ({ ...s, assignment })));
        }
        setSubmissions(allSubmissions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.subject || !newAssignment.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      await base44.entities.Assignment.create({
        ...newAssignment,
        teacher_id: profile.id,
        teacher_name: profile.full_name,
        school_id: profile.school_id,
        is_published: true
      });

      toast.success('Assignment created successfully!');
      setShowCreateDialog(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: '',
        level: '',
        grade_class: '',
        due_date: '',
        total_marks: 100,
        assignment_type: 'essay',
        grading_rubric: null,
        auto_approval_threshold: 80,
        flag_review_threshold: 50,
        plagiarism_check_enabled: true,
        plagiarism_threshold: 20
      });
      setShowAdvancedSettings(false);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleReviewSubmission = async (submission, score, feedback) => {
    try {
      await base44.entities.Submission.update(submission.id, {
        teacher_score: score,
        teacher_feedback: feedback,
        status: 'teacher_reviewed'
      });
      toast.success('Submission reviewed!');
      loadData();
    } catch (error) {
      toast.error('Failed to save review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const pendingReviews = submissions.filter(s => s.status === 'ai_graded' || s.status === 'flagged_review');
  const flaggedSubmissions = submissions.filter(s => s.status === 'flagged_review');
  const autoApproved = submissions.filter(s => s.status === 'auto_approved');
  const reviewedSubmissions = submissions.filter(s => s.status === 'teacher_reviewed');

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500">Manage assignments and review submissions</p>
          </div>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  placeholder="e.g., Algebra Quiz Week 5"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Instructions for students..."
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select 
                    value={newAssignment.subject} 
                    onValueChange={(v) => setNewAssignment({...newAssignment, subject: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade/Form</Label>
                  <Input 
                    placeholder="e.g., Form 3"
                    value={newAssignment.grade_class}
                    onChange={(e) => setNewAssignment({...newAssignment, grade_class: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input 
                    type="date"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input 
                    type="number"
                    value={newAssignment.total_marks}
                    onChange={(e) => setNewAssignment({...newAssignment, total_marks: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assignment Type</Label>
                <Select 
                  value={newAssignment.assignment_type} 
                  onValueChange={(v) => setNewAssignment({...newAssignment, assignment_type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvancedSettings ? 'Hide' : 'Show'} AI Grading Settings
              </Button>

              {showAdvancedSettings && (
                <div className="space-y-4 pt-4 border-t">
                  <GradingSettings 
                    settings={{
                      auto_approval_threshold: newAssignment.auto_approval_threshold,
                      flag_review_threshold: newAssignment.flag_review_threshold,
                      plagiarism_check_enabled: newAssignment.plagiarism_check_enabled,
                      plagiarism_threshold: newAssignment.plagiarism_threshold
                    }}
                    onChange={(settings) => setNewAssignment({...newAssignment, ...settings})}
                  />
                  
                  <RubricBuilder 
                    rubric={newAssignment.grading_rubric}
                    onChange={(rubric) => setNewAssignment({...newAssignment, grading_rubric: rubric})}
                    assignmentType={newAssignment.assignment_type}
                  />
                </div>
              )}

              <Button 
                onClick={handleCreateAssignment} 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Assignment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{assignments.length}</p>
              <p className="text-sm text-slate-500">Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
              <p className="text-sm text-slate-500">Pending Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviewedSubmissions.length}</p>
              <p className="text-sm text-slate-500">Reviewed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="reviews">
            Pending Reviews
            {pendingReviews.length > 0 && (
              <Badge className="ml-2 bg-orange-100 text-orange-700">{pendingReviews.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4">
          {assignments.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No assignments yet</h3>
              <p className="text-slate-500 mb-4">Create your first assignment to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                          <Badge variant="secondary">{assignment.subject}</Badge>
                          {assignment.grade_class && (
                            <Badge variant="outline">{assignment.grade_class}</Badge>
                          )}
                        </div>
                        {assignment.description && (
                          <p className="text-sm text-slate-600 mb-2">{assignment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          <span>Total: {assignment.total_marks} marks</span>
                        </div>
                      </div>
                      <Badge className={assignment.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                        {assignment.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-16 w-16 mx-auto text-green-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
              <p className="text-slate-500">No submissions pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Flagged submissions first */}
              {flaggedSubmissions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-orange-600 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Flagged for Review ({flaggedSubmissions.length})
                  </h3>
                  {flaggedSubmissions.map((submission) => (
                    <Card key={submission.id} className="border-orange-200 bg-orange-50 mb-3">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-900">{submission.assignment?.title}</h3>
                            <p className="text-sm text-slate-500">
                              Submitted by: {submission.student_name}
                              {submission.is_late && <Badge className="ml-2 bg-red-100 text-red-700">Late</Badge>}
                            </p>
                            {submission.needs_review_reason && (
                              <p className="text-sm text-orange-600 mt-1">
                                ⚠️ {submission.needs_review_reason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              AI Score: {submission.ai_score}/{submission.assignment?.total_marks}
                            </p>
                          </div>
                        </div>
                        
                        {/* Plagiarism Alert */}
                        {submission.plagiarism_result?.flagged && (
                          <div className="bg-red-100 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            <span className="text-sm text-red-700">
                              Plagiarism detected: {submission.plagiarism_result.score}% similarity
                            </span>
                          </div>
                        )}
                        
                        {/* Rubric Scores */}
                        {submission.ai_rubric_scores && (
                          <div className="bg-white rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium mb-2">Rubric Breakdown:</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {Object.entries(submission.ai_rubric_scores)
                                .filter(([key]) => key !== 'criteria_scores')
                                .map(([key, value]) => (
                                  <div key={key} className="flex justify-between bg-slate-50 p-2 rounded">
                                    <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="font-medium">{value}%</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {submission.answers?.[0]?.text && (
                          <div className="bg-white rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                            <p className="text-sm text-slate-500 mb-1">Student's Answer:</p>
                            <p className="text-slate-700 text-sm">{submission.answers[0].text}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReviewSubmission(submission, submission.ai_score, 'Reviewed and approved after manual check')}
                          >
                            Approve Anyway
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Review & Adjust Score
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Regular AI graded submissions */}
              {pendingReviews.filter(s => s.status === 'ai_graded').map((submission) => (
                <Card key={submission.id} className="border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{submission.assignment?.title}</h3>
                        <p className="text-sm text-slate-500">
                          Submitted by: {submission.student_name}
                          {submission.is_late && <Badge className="ml-2 bg-red-100 text-red-700">Late</Badge>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          AI Score: {submission.ai_score}/{submission.assignment?.total_marks}
                        </p>
                      </div>
                    </div>
                    
                    {submission.answers?.[0]?.text && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-slate-500 mb-1">Student's Answer:</p>
                        <p className="text-slate-700">{submission.answers[0].text}</p>
                      </div>
                    )}
                    
                    {submission.ai_feedback && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-600 mb-1">AI Feedback:</p>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{submission.ai_feedback}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewSubmission(submission, submission.ai_score, 'Reviewed and approved')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Accept AI Score
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Review & Edit
                      </Button>
                    </div>
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
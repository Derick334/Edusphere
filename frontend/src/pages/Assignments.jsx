import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Clock, CheckCircle, AlertCircle, 
  Calendar, Loader2, Upload, Send, Brain, FileText,
  Shield, AlertTriangle, ThumbsUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { performAIGrading, performPlagiarismCheck, determineSubmissionStatus } from '@/components/assignments/AIGradingService';

export default function Assignments() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [viewSubmission, setViewSubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Get student profile
      const students = await base44.entities.Student.filter({ user_id: userData.id });
      if (students.length > 0) {
        setProfile(students[0]);
        
        // Load assignments for student's school/level
        const [allAssignments, studentSubmissions] = await Promise.all([
          base44.entities.Assignment.filter({ is_published: true }, '-created_date', 50),
          base44.entities.Submission.filter({ student_id: students[0].id })
        ]);

        setAssignments(allAssignments);
        setSubmissions(studentSubmissions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  const getStatusBadge = (assignment) => {
    const submission = getSubmissionForAssignment(assignment.id);
    const dueDate = new Date(assignment.due_date);
    const now = new Date();

    if (submission) {
      if (submission.status === 'teacher_reviewed') {
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
      }
      if (submission.status === 'auto_approved') {
        return <Badge className="bg-green-100 text-green-700"><ThumbsUp className="h-3 w-3 mr-1" />Auto-Approved</Badge>;
      }
      if (submission.status === 'flagged_review') {
        return <Badge className="bg-orange-100 text-orange-700"><AlertTriangle className="h-3 w-3 mr-1" />Under Review</Badge>;
      }
      if (submission.status === 'ai_graded') {
        return <Badge className="bg-blue-100 text-blue-700"><Brain className="h-3 w-3 mr-1" />AI Graded</Badge>;
      }
      return <Badge className="bg-slate-100 text-slate-700">Submitted</Badge>;
    }
    
    if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-700">Overdue</Badge>;
    }
    
    return <Badge className="bg-orange-100 text-orange-700">Pending</Badge>;
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      toast.error('Please enter your answer');
      return;
    }

    setSubmitting(true);
    try {
      const dueDate = new Date(selectedAssignment.due_date);
      const isLate = new Date() > dueDate;

      // Create submission
      const submission = await base44.entities.Submission.create({
        assignment_id: selectedAssignment.id,
        student_id: profile.id,
        student_name: profile.full_name,
        answers: [{ text: answerText }],
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        is_late: isLate
      });

      // Plagiarism check if enabled
      let plagiarismResult = null;
      if (selectedAssignment.plagiarism_check_enabled !== false) {
        toast.info('Checking for plagiarism...');
        const existingSubmissions = await base44.entities.Submission.filter({
          assignment_id: selectedAssignment.id
        });
        plagiarismResult = await performPlagiarismCheck(answerText, existingSubmissions.filter(s => s.id !== submission.id));
      }

      // AI Grading with rubric
      toast.info('AI is grading your submission...');
      const gradingResponse = await performAIGrading(selectedAssignment, submission, answerText);

      // Calculate final score
      const rubricScores = gradingResponse.rubric_scores || {};
      const essayWeightings = selectedAssignment.grading_rubric?.essay_weightings || {
        content_accuracy: 40,
        structure_organization: 20,
        coherence_flow: 15,
        argumentation: 15,
        grammar_spelling: 10
      };

      let weightedScore = 0;
      Object.keys(essayWeightings).forEach(key => {
        const categoryScore = rubricScores[key] || 0;
        weightedScore += (categoryScore / 100) * essayWeightings[key];
      });

      const finalScore = Math.round((weightedScore / 100) * selectedAssignment.total_marks);

      // Determine submission status based on thresholds
      const statusResult = determineSubmissionStatus(finalScore, selectedAssignment, plagiarismResult);

      // Build comprehensive feedback
      const feedback = buildDetailedFeedback(gradingResponse, plagiarismResult);

      // Update submission with AI grade
      await base44.entities.Submission.update(submission.id, {
        ai_score: finalScore,
        ai_feedback: feedback,
        ai_rubric_scores: {
          ...rubricScores,
          criteria_scores: gradingResponse.criteria_scores || []
        },
        plagiarism_result: plagiarismResult,
        status: statusResult.status,
        auto_approved: statusResult.auto_approved,
        needs_review_reason: statusResult.needs_review_reason
      });

      if (statusResult.auto_approved) {
        toast.success('Assignment submitted and auto-approved!');
      } else if (statusResult.status === 'flagged_review') {
        toast.warning('Assignment submitted - flagged for teacher review');
      } else {
        toast.success('Assignment submitted and graded!');
      }
      
      setSelectedAssignment(null);
      setAnswerText('');
      loadData();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const buildDetailedFeedback = (gradingResponse, plagiarismResult) => {
    let feedback = '';
    
    if (gradingResponse.strengths?.length > 0) {
      feedback += '**Strengths:**\n' + gradingResponse.strengths.map(s => `• ${s}`).join('\n') + '\n\n';
    }
    
    if (gradingResponse.areas_for_improvement?.length > 0) {
      feedback += '**Areas for Improvement:**\n' + gradingResponse.areas_for_improvement.map(a => `• ${a}`).join('\n') + '\n\n';
    }
    
    feedback += `**Detailed Feedback:**\n${gradingResponse.detailed_feedback || ''}\n\n`;
    
    if (gradingResponse.suggestions) {
      feedback += `**Suggestions:**\n${gradingResponse.suggestions}`;
    }
    
    if (plagiarismResult?.flagged) {
      feedback += `\n\n⚠️ **Plagiarism Alert:** Similarity score of ${plagiarismResult.score}% detected.`;
    }
    
    return feedback;
  };

  const pendingAssignments = assignments.filter(a => !getSubmissionForAssignment(a.id));
  const submittedAssignments = assignments.filter(a => getSubmissionForAssignment(a.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
            <p className="text-slate-500">Submit and track your assignments</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingAssignments.length}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{submittedAssignments.length}</p>
              <p className="text-sm text-slate-500">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {submissions.filter(s => s.status === 'ai_graded' || s.status === 'teacher_reviewed').length}
              </p>
              <p className="text-sm text-slate-500">Graded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-16 w-16 mx-auto text-green-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">All caught up!</h3>
              <p className="text-slate-500">No pending assignments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                            {getStatusBadge(assignment)}
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{assignment.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {assignment.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                            <span>Total: {assignment.total_marks} marks</span>
                          </div>
                        </div>
                        <Button onClick={() => setSelectedAssignment(assignment)}>
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="mt-4">
          {submittedAssignments.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions yet</h3>
              <p className="text-slate-500">Complete your pending assignments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedAssignments.map((assignment, index) => {
                const submission = getSubmissionForAssignment(assignment.id);
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                              {getStatusBadge(assignment)}
                              {submission?.is_late && (
                                <Badge variant="outline" className="text-red-600 border-red-200">Late</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                              <span>{assignment.subject}</span>
                              <span>Submitted: {new Date(submission?.submitted_at).toLocaleDateString()}</span>
                            </div>
                            {(submission?.ai_score !== undefined || submission?.teacher_score !== undefined) && (
                              <div className="flex items-center gap-4">
                                {submission?.ai_score !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">
                                      AI Score: {submission.ai_score}/{assignment.total_marks}
                                    </span>
                                  </div>
                                )}
                                {submission?.teacher_score !== undefined && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium">
                                      Final Score: {submission.teacher_score}/{assignment.total_marks}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" onClick={() => setViewSubmission({ assignment, submission })}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedAssignment?.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{selectedAssignment?.description}</p>
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <span>{selectedAssignment?.subject}</span>
                <span>Total: {selectedAssignment?.total_marks} marks</span>
                <span>Due: {selectedAssignment?.due_date && new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit & Grade
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Submission Dialog */}
      <Dialog open={!!viewSubmission} onOpenChange={() => setViewSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewSubmission?.assignment?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Your Answer</h4>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {viewSubmission?.submission?.answers?.[0]?.text || 'No text answer'}
                </p>
              </CardContent>
            </Card>

            {viewSubmission?.submission?.ai_feedback && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">AI Feedback</h4>
                    <Badge className="ml-auto bg-blue-100 text-blue-700">
                      {viewSubmission.submission.ai_score}/{viewSubmission.assignment.total_marks}
                    </Badge>
                  </div>
                  
                  {/* Rubric Scores Breakdown */}
                  {viewSubmission.submission.ai_rubric_scores && (
                    <div className="mb-4 p-3 bg-white rounded-lg">
                      <p className="text-sm font-medium mb-2">Score Breakdown:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(viewSubmission.submission.ai_rubric_scores)
                          .filter(([key]) => key !== 'criteria_scores')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-medium">{value}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {viewSubmission.submission.ai_feedback}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Plagiarism Result */}
            {viewSubmission?.submission?.plagiarism_result && (
              <Card className={`${viewSubmission.submission.plagiarism_result.flagged ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`h-5 w-5 ${viewSubmission.submission.plagiarism_result.flagged ? 'text-red-600' : 'text-green-600'}`} />
                    <h4 className="font-medium">Plagiarism Check</h4>
                    <Badge className={`ml-auto ${viewSubmission.submission.plagiarism_result.flagged ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {viewSubmission.submission.plagiarism_result.score}% similarity
                    </Badge>
                  </div>
                  {viewSubmission.submission.plagiarism_result.flagged && (
                    <p className="text-sm text-red-700">
                      ⚠️ This submission has been flagged for potential plagiarism and requires teacher review.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {viewSubmission?.submission?.teacher_feedback && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Teacher Feedback</h4>
                    <Badge className="ml-auto bg-green-100 text-green-700">
                      {viewSubmission.submission.teacher_score}/{viewSubmission.assignment.total_marks}
                    </Badge>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {viewSubmission.submission.teacher_feedback}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
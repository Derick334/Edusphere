import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Award, Target, 
  BookOpen, Calendar, Loader2, Search, BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

export default function Performance() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [searchData, setSearchData] = useState({
    admission_number: '',
    school_code: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const students = await base44.entities.Student.filter({ user_id: userData.id });
      if (students.length > 0) {
        setProfile(students[0]);
        await loadStudentRecords(students[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentRecords = async (studentId) => {
    try {
      const [perfRecords, studentSubmissions] = await Promise.all([
        base44.entities.PerformanceRecord.filter({ student_id: studentId }),
        base44.entities.Submission.filter({ student_id: studentId })
      ]);
      setRecords(perfRecords);
      setSubmissions(studentSubmissions);
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchData.admission_number) return;
    
    setLoading(true);
    try {
      const students = await base44.entities.Student.filter({
        admission_number: searchData.admission_number,
        ...(searchData.school_code && { school_code: searchData.school_code })
      });
      
      if (students.length > 0) {
        setProfile(students[0]);
        await loadStudentRecords(students[0].id);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const submissionScores = submissions
      .filter(s => s.teacher_score !== undefined || s.ai_score !== undefined)
      .map(s => s.teacher_score || s.ai_score);
    
    const recordScores = records.map(r => r.score).filter(s => s !== undefined);
    const allScores = [...submissionScores, ...recordScores];
    
    if (allScores.length === 0) return { average: 0, highest: 0, lowest: 0, trend: 'stable' };
    
    const average = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    const highest = Math.max(...allScores);
    const lowest = Math.min(...allScores);
    
    // Calculate trend (last 5 vs previous 5)
    const recent = allScores.slice(-5);
    const previous = allScores.slice(-10, -5);
    const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
    const prevAvg = previous.length ? previous.reduce((a, b) => a + b, 0) / previous.length : 0;
    const trend = recentAvg > prevAvg ? 'up' : recentAvg < prevAvg ? 'down' : 'stable';
    
    return { average, highest, lowest, trend };
  };

  const stats = calculateStats();

  // Subject performance data
  const subjectData = () => {
    const subjects = {};
    records.forEach(r => {
      if (!subjects[r.subject]) {
        subjects[r.subject] = { scores: [], name: r.subject };
      }
      if (r.score !== undefined) subjects[r.subject].scores.push(r.score);
    });
    
    return Object.values(subjects).map(s => ({
      name: s.name,
      score: s.scores.length ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0
    }));
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Performance</h1>
              <p className="text-slate-500">Track academic progress and insights</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => setSearchMode(!searchMode)}
          >
            <Search className="h-4 w-4 mr-2" />
            {searchMode ? 'View My Records' : 'Search Student'}
          </Button>
        </div>
      </div>

      {/* Search Section */}
      {searchMode && (
        <Card className="mb-6 border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Search Student Records</CardTitle>
            <CardDescription>
              Parents and teachers can search for a student's performance using admission number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Admission Number"
                value={searchData.admission_number}
                onChange={(e) => setSearchData({...searchData, admission_number: e.target.value})}
                className="flex-1"
              />
              <Input
                placeholder="School Code (optional)"
                value={searchData.school_code}
                onChange={(e) => setSearchData({...searchData, school_code: e.target.value})}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Info */}
      {profile && (
        <Card className="mb-6 border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{profile.full_name}</h3>
                <p className="text-slate-600">
                  {profile.grade_class} • {profile.admission_number}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.average}%</p>
                  <p className="text-sm text-slate-500">Average</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.highest}%</p>
                  <p className="text-sm text-slate-500">Highest</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Score</p>
                <p className="text-3xl font-bold text-slate-900">{stats.average}%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Trend</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-slate-900 capitalize">{stats.trend}</p>
                  {stats.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {stats.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                stats.trend === 'up' ? 'bg-green-100' : stats.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
              }`}>
                {stats.trend === 'up' ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : stats.trend === 'down' ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : (
                  <Target className="h-6 w-6 text-slate-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Assignments Done</p>
                <p className="text-3xl font-bold text-slate-900">{submissions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Exams Recorded</p>
                <p className="text-3xl font-bold text-slate-900">{records.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Performance */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                <p>No subject data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['A', 'B', 'C', 'D', 'E'].map((grade, index) => {
                const gradeRecords = records.filter(r => r.grade === grade);
                const percentage = records.length ? Math.round((gradeRecords.length / records.length) * 100) : 0;
                
                return (
                  <div key={grade} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium">{grade}</span>
                    <Progress value={percentage} className="flex-1 h-3" />
                    <span className="w-12 text-sm text-slate-500">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Recent Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 && submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Award className="h-12 w-12 mx-auto mb-3" />
              <p>No performance records yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...records, ...submissions.map(s => ({
                ...s,
                subject: 'Assignment',
                score: s.teacher_score || s.ai_score,
                exam_type: 'assignment'
              }))]
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .slice(0, 10)
                .map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{record.subject}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Badge variant="outline" className="text-xs">
                            {record.exam_type?.replace('_', ' ')}
                          </Badge>
                          {record.term && <span>• {record.term}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">{record.score || 0}%</p>
                      {record.grade && (
                        <Badge className={`
                          ${record.grade === 'A' ? 'bg-green-100 text-green-700' : ''}
                          ${record.grade === 'B' ? 'bg-blue-100 text-blue-700' : ''}
                          ${record.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${record.grade === 'D' || record.grade === 'E' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          Grade {record.grade}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
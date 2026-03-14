import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Users, Search, Star, MapPin, Clock, Video, 
  User as UserIcon, Loader2, Calendar, Check, 
  MessageSquare, Filter, Award, Brain, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AITutorMatcher from '@/components/tutors/AITutorMatcher';
import TutorProfileDialog from '@/components/tutors/TutorProfileDialog';

export default function Tutors() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [displayedTutors, setDisplayedTutors] = useState([]);
  const [aiMatchData, setAiMatchData] = useState(null);
  const [aiConversations, setAiConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [bookingTutor, setBookingTutor] = useState(null);
  const [booking, setBooking] = useState({
    subject: '',
    session_date: '',
    session_time: '',
    duration_hours: 1,
    mode: 'online',
    notes: ''
  });

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'Kiswahili', label: 'Kiswahili' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
  ];

  const modes = [
    { value: 'all', label: 'All Modes' },
    { value: 'online', label: 'Online' },
    { value: 'physical', label: 'Physical' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allTutors = await base44.entities.Tutor.filter({ is_verified: true }, '-rating', 50);
      setTutors(allTutors);
      setDisplayedTutors(allTutors);

      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        const [students, conversations] = await Promise.all([
          base44.entities.Student.filter({ user_id: userData.id }),
          base44.entities.AIConversation.filter({ user_id: userData.id }, '-created_date', 20)
        ]);
        if (students.length > 0) setProfile(students[0]);
        setAiConversations(conversations);
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchesFound = ({ tutors: ranked, matchData, inferredStyle, inferredStyleDetail }) => {
    setDisplayedTutors(ranked);
    setAiMatchData({ matchData, inferredStyle, inferredStyleDetail });
  };

  const filteredTutors = displayedTutors.filter(tutor => {
    const matchesSearch = tutor.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutor.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || tutor.subjects?.includes(selectedSubject);
    const matchesMode = selectedMode === 'all' || 
                       tutor.teaching_mode === 'both' || 
                       tutor.teaching_mode === selectedMode;
    return matchesSearch && matchesSubject && matchesMode;
  });

  const handleBookSession = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to book a session');
      base44.auth.redirectToLogin();
      return;
    }
    if (!booking.subject || !booking.session_date || !booking.session_time) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const amount = bookingTutor.hourly_rate * booking.duration_hours;
      await base44.entities.TutorSession.create({
        tutor_id: bookingTutor.id,
        tutor_name: bookingTutor.full_name,
        student_id: profile.id,
        student_name: profile.full_name,
        subject: booking.subject,
        session_date: booking.session_date,
        session_time: booking.session_time,
        duration_hours: booking.duration_hours,
        mode: booking.mode,
        amount,
        status: 'pending',
        payment_status: 'pending'
      });
      toast.success('Session booked! The tutor will confirm shortly.');
      setBookingTutor(null);
      setBooking({ subject: '', session_date: '', session_time: '', duration_hours: 1, mode: 'online', notes: '' });
    } catch (error) {
      toast.error('Failed to book session. Please try again.');
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Find Tutors</h1>
            <p className="text-slate-500">Book sessions with verified expert tutors</p>
          </div>
        </div>
      </div>

      {/* AI Matcher */}
      {profile && (
        <AITutorMatcher
          tutors={tutors}
          studentProfile={profile}
          aiConversations={aiConversations}
          onMatchesFound={handleMatchesFound}
        />
      )}

      {/* Inferred Learning Style Banner */}
      {aiMatchData?.inferredStyle && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Your Learning Style: {aiMatchData.inferredStyle}</p>
              <p className="text-sm text-blue-600">{aiMatchData.inferredStyleDetail}</p>
            </div>
            <button
              className="ml-auto text-xs text-blue-400 hover:text-blue-600"
              onClick={() => { setAiMatchData(null); setDisplayedTutors(tutors); }}
            >
              Reset
            </button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6 border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tutors by name, subject, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {modes.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredTutors.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tutors found</h3>
          <p className="text-slate-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor, index) => {
            const matchInfo = aiMatchData?.matchData?.[tutor.id];
            return (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 border-slate-200 group">
                  {/* AI Match Score Badge */}
                  {matchInfo && (
                    <div className="px-6 pt-4 pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-orange-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Match
                        </span>
                        <span className="text-xs font-bold text-orange-600">{matchInfo.match_score}%</span>
                      </div>
                      <Progress value={matchInfo.match_score} className="h-1.5 mb-2" />
                    </div>
                  )}
                  <CardContent className="p-6 pt-4">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.profile_photo} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-lg">
                          {tutor.full_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {tutor.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(tutor.rating || 0)}
                          <span className="text-sm text-slate-500">({tutor.total_reviews || 0})</span>
                        </div>
                        {tutor.is_verified && (
                          <Badge className="bg-green-100 text-green-700 mt-1 text-xs">
                            <Check className="h-3 w-3 mr-1" />Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* AI match reason snippet */}
                    {matchInfo?.match_reason ? (
                      <p className="text-xs text-orange-700 bg-orange-50 rounded-lg p-2 mb-3 line-clamp-2">
                        {matchInfo.match_reason}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {tutor.bio || 'Experienced tutor ready to help you succeed.'}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tutor.subjects?.slice(0, 3).map(subject => (
                        <Badge key={subject} variant="secondary" className="bg-slate-100 text-xs">{subject}</Badge>
                      ))}
                      {tutor.subjects?.length > 3 && (
                        <Badge variant="secondary" className="bg-slate-100 text-xs">+{tutor.subjects.length - 3}</Badge>
                      )}
                    </div>

                    {/* Methodologies */}
                    {tutor.teaching_methodologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tutor.teaching_methodologies.slice(0, 2).map(m => (
                          <Badge key={m} variant="outline" className="text-xs text-purple-600 border-purple-200">{m}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                      {tutor.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tutor.location}</span>
                      )}
                      <span className="flex items-center gap-1 capitalize">
                        {tutor.teaching_mode === 'online' && <Video className="h-3.5 w-3.5" />}
                        {tutor.teaching_mode === 'physical' && <UserIcon className="h-3.5 w-3.5" />}
                        {tutor.teaching_mode === 'both' && <><Video className="h-3.5 w-3.5" /><UserIcon className="h-3.5 w-3.5" /></>}
                        {tutor.teaching_mode?.replace('_', ' ')}
                      </span>
                      {tutor.experience_years && (
                        <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{tutor.experience_years} yrs</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xl font-bold text-slate-900">KES {tutor.hourly_rate?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">per hour</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTutor(tutor)}>View</Button>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={() => setBookingTutor(tutor)}>Book</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tutor Profile Dialog */}
      <TutorProfileDialog
        tutor={selectedTutor}
        matchInfo={selectedTutor ? aiMatchData?.matchData?.[selectedTutor.id] : null}
        open={!!selectedTutor}
        onClose={() => setSelectedTutor(null)}
        onBook={(tutor) => setBookingTutor(tutor)}
      />

      {/* Booking Dialog */}
      <Dialog open={!!bookingTutor} onOpenChange={() => setBookingTutor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session with {bookingTutor?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={booking.subject} onValueChange={(v) => setBooking({...booking, subject: v})}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {bookingTutor?.subjects?.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={booking.session_date}
                  onChange={(e) => setBooking({...booking, session_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={booking.session_time}
                  onChange={(e) => setBooking({...booking, session_time: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Select value={String(booking.duration_hours)} onValueChange={(v) => setBooking({...booking, duration_hours: parseFloat(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0.5, 1, 1.5, 2, 3].map(h => (
                      <SelectItem key={h} value={String(h)}>{h} hour{h !== 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={booking.mode} onValueChange={(v) => setBooking({...booking, mode: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(bookingTutor?.teaching_mode === 'both'
                      ? ['online', 'physical']
                      : [bookingTutor?.teaching_mode]
                    ).filter(Boolean).map(m => (
                      <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={booking.notes}
                onChange={(e) => setBooking({...booking, notes: e.target.value})}
                placeholder="Any specific topics or notes for the tutor..."
                rows={3}
              />
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-xl">
                  KES {((bookingTutor?.hourly_rate || 0) * booking.duration_hours).toLocaleString()}
                </span>
              </div>
            </div>
            <Button onClick={handleBookSession} className="w-full bg-orange-600 hover:bg-orange-700">
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
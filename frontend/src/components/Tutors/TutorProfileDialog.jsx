import { MapPin, Video, User as UserIcon, Award, Star, Clock, CheckCircle, Brain, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const TIME_SLOT_LABELS = {
  weekday_morning: 'Weekday Mornings',
  weekday_afternoon: 'Weekday Afternoons',
  weekday_evening: 'Weekday Evenings',
  weekend_morning: 'Weekend Mornings',
  weekend_afternoon: 'Weekend Afternoons',
  weekend_evening: 'Weekend Evenings',
};

export default function TutorProfileDialog({ tutor, matchInfo, open, onClose, onBook }) {
  if (!tutor) return null;

  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );

  const availableTimes = Object.entries(tutor.available_times || {})
    .filter(([, v]) => v)
    .map(([k]) => TIME_SLOT_LABELS[k] || k);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tutor Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={tutor.profile_photo} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                {tutor.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-semibold">{tutor.full_name}</h3>
                {tutor.is_verified && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />Verified
                  </Badge>
                )}
                {tutor.trial_session_available && (
                  <Badge className="bg-blue-100 text-blue-700">Trial Available</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(tutor.rating || 0)}
                <span className="text-sm text-slate-500">({tutor.total_reviews || 0} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                {tutor.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tutor.location}</span>
                )}
                {tutor.experience_years && (
                  <span className="flex items-center gap-1"><Award className="h-3.5 w-3.5" />{tutor.experience_years} yrs exp</span>
                )}
                <span className="flex items-center gap-1 capitalize">
                  {tutor.teaching_mode === 'both' ? <><Video className="h-3.5 w-3.5" /><UserIcon className="h-3.5 w-3.5" /></> :
                   tutor.teaching_mode === 'online' ? <Video className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                  {tutor.teaching_mode?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* AI Match Info */}
          {matchInfo && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-700">AI Match Analysis</span>
                <Badge className="ml-auto bg-orange-100 text-orange-700">
                  {matchInfo.match_score}% match
                </Badge>
              </div>
              <Progress value={matchInfo.match_score} className="h-2 mb-3" />
              <p className="text-sm text-slate-700 mb-2">{matchInfo.match_reason}</p>
              {matchInfo.key_strengths?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {matchInfo.key_strengths.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-orange-300 text-orange-700">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bio */}
          <div>
            <h4 className="font-medium mb-1">About</h4>
            <p className="text-slate-600 text-sm">{tutor.bio || 'No bio available'}</p>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" />Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects?.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
            </div>
          </div>

          {/* Specializations */}
          {tutor.specializations?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><Award className="h-4 w-4" />Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {tutor.specializations.map(s => <Badge key={s} className="bg-purple-100 text-purple-700">{s}</Badge>)}
              </div>
            </div>
          )}

          {/* Teaching Methodologies */}
          {tutor.teaching_methodologies?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4" />Teaching Methodologies</h4>
              <div className="flex flex-wrap gap-2">
                {tutor.teaching_methodologies.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
              </div>
            </div>
          )}

          {/* Learning Style Support */}
          {tutor.learning_style_support?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><Brain className="h-4 w-4" />Learning Styles Supported</h4>
              <div className="flex flex-wrap gap-2">
                {tutor.learning_style_support.map(s => <Badge key={s} className="bg-blue-100 text-blue-700">{s}</Badge>)}
              </div>
            </div>
          )}

          {/* Availability */}
          {availableTimes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2"><Clock className="h-4 w-4" />Availability</h4>
              <div className="flex flex-wrap gap-2">
                {availableTimes.map(t => <Badge key={t} variant="outline" className="text-slate-600">{t}</Badge>)}
              </div>
            </div>
          )}

          {/* Levels */}
          {tutor.levels_taught?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Levels Taught</h4>
              <div className="flex flex-wrap gap-2">
                {tutor.levels_taught.map(l => (
                  <Badge key={l} variant="outline" className="capitalize">{l.replace('_', ' ')}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-2xl font-bold">KES {tutor.hourly_rate?.toLocaleString()}</p>
              <p className="text-xs text-slate-500">per hour</p>
              {tutor.trial_session_available && tutor.trial_session_rate && (
                <p className="text-xs text-blue-600">Trial: KES {tutor.trial_session_rate?.toLocaleString()}</p>
              )}
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => { onClose(); onBook(tutor); }}>
              Book Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
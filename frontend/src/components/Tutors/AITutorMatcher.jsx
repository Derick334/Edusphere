import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Brain, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const TIME_SLOTS = [
  { key: 'weekday_morning', label: 'Weekday Mornings' },
  { key: 'weekday_afternoon', label: 'Weekday Afternoons' },
  { key: 'weekday_evening', label: 'Weekday Evenings' },
  { key: 'weekend_morning', label: 'Weekend Mornings' },
  { key: 'weekend_afternoon', label: 'Weekend Afternoons' },
  { key: 'weekend_evening', label: 'Weekend Evenings' },
];

const SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
  'Kiswahili', 'History', 'Geography', 'CRE', 'Business Studies'
];

export default function AITutorMatcher({ tutors, studentProfile, aiConversations, onMatchesFound }) {
  const [matching, setMatching] = useState(false);
  const [preferences, setPreferences] = useState({
    subjects: [],
    preferred_times: {},
    learning_goals: '',
  });
  const [showForm, setShowForm] = useState(false);

  const toggleSubject = (subject) => {
    setPreferences(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const toggleTime = (key) => {
    setPreferences(prev => ({
      ...prev,
      preferred_times: { ...prev.preferred_times, [key]: !prev.preferred_times[key] }
    }));
  };

  const runAIMatching = async () => {
    if (preferences.subjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    setMatching(true);
    try {
      // Infer learning style from AI conversation history
      const conversationSummary = aiConversations?.length > 0
        ? aiConversations.slice(0, 10).map(c => `Q: ${c.question}`).join('\n')
        : 'No prior AI tutor interactions available.';

      const preferredTimesText = Object.entries(preferences.preferred_times)
        .filter(([, v]) => v)
        .map(([k]) => k.replace(/_/g, ' '))
        .join(', ') || 'flexible';

      const tutorProfiles = tutors.map(t => ({
        id: t.id,
        name: t.full_name,
        subjects: t.subjects || [],
        rating: t.rating || 0,
        experience: t.experience_years || 0,
        mode: t.teaching_mode,
        hourly_rate: t.hourly_rate,
        specializations: t.specializations || [],
        methodologies: t.teaching_methodologies || [],
        learning_style_support: t.learning_style_support || [],
        available_times: t.available_times || {},
        bio: t.bio || '',
        levels_taught: t.levels_taught || []
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI-powered tutor matching system for an educational platform. Analyze the student's needs and rank tutors by suitability.

STUDENT PROFILE:
- Level: ${studentProfile?.level || 'unknown'}
- Grade/Class: ${studentProfile?.grade_class || 'unknown'}
- Subjects Needed: ${preferences.subjects.join(', ')}
- Preferred Times: ${preferredTimesText}

INFERRED LEARNING STYLE (from AI tutor interaction history):
${conversationSummary}

Based on the interaction history, infer whether the student:
- Prefers conceptual/theoretical explanations vs practical examples
- Benefits from step-by-step guidance or exploratory discovery
- Needs encouragement and motivation vs direct, efficient instruction

AVAILABLE TUTORS:
${JSON.stringify(tutorProfiles, null, 2)}

Rank ALL tutors and return their IDs ordered by match score. Consider:
1. Subject alignment (most important)
2. Teaching methodology match to inferred learning style
3. Availability overlap with student's preferred times
4. Experience level appropriate for student's level
5. Rating and reputation

For the top 5, provide a brief personalized match reason.`,
        response_json_schema: {
          type: "object",
          properties: {
            inferred_learning_style: { type: "string" },
            inferred_style_detail: { type: "string" },
            ranked_tutor_ids: { type: "array", items: { type: "string" } },
            top_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tutor_id: { type: "string" },
                  match_score: { type: "number" },
                  match_reason: { type: "string" },
                  key_strengths: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      // Reorder tutors based on AI ranking
      const rankedIds = response.ranked_tutor_ids || [];
      const matchData = {};
      (response.top_matches || []).forEach(m => {
        matchData[m.tutor_id] = m;
      });

      const sortedTutors = [...tutors].sort((a, b) => {
        const aIdx = rankedIds.indexOf(a.id);
        const bIdx = rankedIds.indexOf(b.id);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });

      onMatchesFound({
        tutors: sortedTutors,
        matchData,
        inferredStyle: response.inferred_learning_style,
        inferredStyleDetail: response.inferred_style_detail
      });

      setShowForm(false);
      toast.success('AI found your best tutor matches!');
    } catch (error) {
      console.error('Matching error:', error);
      toast.error('Failed to run AI matching. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  if (!showForm) {
    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">AI Tutor Matching</h3>
                <p className="text-sm text-slate-600">Get personalized tutor recommendations based on your learning style</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Find My Best Match
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5 text-orange-600" />
          Tell us what you need
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Subjects */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Which subjects do you need help with?</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => toggleSubject(subject)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  preferences.subjects.includes(subject)
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Times */}
        <div>
          <Label className="text-sm font-medium mb-2 block">When are you available for sessions?</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <label key={slot.key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50">
                <Checkbox
                  checked={!!preferences.preferred_times[slot.key]}
                  onCheckedChange={() => toggleTime(slot.key)}
                />
                <span className="text-sm">{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={runAIMatching}
            disabled={matching}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {matching ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Find Matches</>
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Search, Filter, Eye, Download, 
  Volume2, VolumeX, Loader2, FileText, School
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedNote, setSelectedNote] = useState(null);
  const [playingVoice, setPlayingVoice] = useState(false);

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'primary', label: 'Primary School' },
    { value: 'junior_secondary', label: 'Junior Secondary' },
    { value: 'senior_secondary', label: 'Senior Secondary' },
    { value: 'post_secondary', label: 'Post Secondary' },
  ];

  const subjects = [
    { value: 'all', label: 'All Subjects' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Kiswahili', label: 'Kiswahili' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'History', label: 'History' },
    { value: 'Geography', label: 'Geography' },
  ];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const allNotes = await base44.entities.Note.list('-created_date', 50);
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || note.level === selectedLevel;
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    
    return matchesSearch && matchesLevel && matchesSubject;
  });

  const getLevelColor = (level) => {
    const colors = {
      primary: 'bg-green-100 text-green-700',
      junior_secondary: 'bg-blue-100 text-blue-700',
      senior_secondary: 'bg-purple-100 text-purple-700',
      post_secondary: 'bg-orange-100 text-orange-700'
    };
    return colors[level] || 'bg-slate-100 text-slate-700';
  };

  const handleVoiceExplanation = (text) => {
    if (playingVoice) {
      window.speechSynthesis.cancel();
      setPlayingVoice(false);
      return;
    }

    setPlayingVoice(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setPlayingVoice(false);
    utterance.onerror = () => setPlayingVoice(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Study Notes</h1>
            <p className="text-slate-500">Access shortened notes for quick revision</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notes by title, topic, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No notes found</h3>
          <p className="text-slate-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-200 border-slate-200 cursor-pointer group"
                    onClick={() => setSelectedNote(note)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                    </div>
                    {note.is_premium && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">Premium</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {note.title}
                  </h3>
                  
                  {note.topic && (
                    <p className="text-sm text-slate-600 mb-3">{note.topic}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className={getLevelColor(note.level)}>
                      {note.level?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{note.subject}</Badge>
                    {note.grade_form && (
                      <Badge variant="outline">{note.grade_form}</Badge>
                    )}
                  </div>

                  {note.school_name && (
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <School className="h-3.5 w-3.5" />
                      {note.school_name}
                    </p>
                  )}

                  <div className="text-sm text-slate-400 mt-2">
                    {note.view_count || 0} views
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Note Detail Dialog */}
      <Dialog open={!!selectedNote} onOpenChange={() => {
        setSelectedNote(null);
        window.speechSynthesis.cancel();
        setPlayingVoice(false);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getLevelColor(selectedNote?.level)}>
                {selectedNote?.level?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{selectedNote?.subject}</Badge>
              {selectedNote?.grade_form && (
                <Badge variant="outline">{selectedNote?.grade_form}</Badge>
              )}
            </div>

            {selectedNote?.topic && (
              <p className="text-slate-600 font-medium">Topic: {selectedNote.topic}</p>
            )}

            <Tabs defaultValue="full">
              <TabsList>
                <TabsTrigger value="full">Full Notes</TabsTrigger>
                <TabsTrigger value="shortened">Shortened</TabsTrigger>
              </TabsList>

              <TabsContent value="full" className="mt-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex justify-end mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoiceExplanation(selectedNote?.content || '')}
                      >
                        {playingVoice ? (
                          <>
                            <VolumeX className="h-4 w-4 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4 mr-1" />
                            Listen
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <ReactMarkdown>{selectedNote?.content || 'No content available'}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shortened" className="mt-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex justify-end mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVoiceExplanation(selectedNote?.shortened_content || '')}
                      >
                        {playingVoice ? (
                          <>
                            <VolumeX className="h-4 w-4 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4 mr-1" />
                            Listen
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <ReactMarkdown>{selectedNote?.shortened_content || 'No shortened version available'}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {selectedNote?.file_url && (
              <a href={selectedNote.file_url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Notes
                </Button>
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
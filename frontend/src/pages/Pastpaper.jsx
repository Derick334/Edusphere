import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Filter, Download, Eye, 
  Calendar, School, BookOpen, Loader2, ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PastPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [viewingSolutions, setViewingSolutions] = useState(false);

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

  const years = [
    { value: 'all', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
  ];

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const allPapers = await base44.entities.PastPaper.list('-year', 50);
      setPapers(allPapers);
    } catch (error) {
      console.error('Error loading papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.school_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || paper.level === selectedLevel;
    const matchesSubject = selectedSubject === 'all' || paper.subject === selectedSubject;
    const matchesYear = selectedYear === 'all' || paper.year?.toString() === selectedYear;
    
    return matchesSearch && matchesLevel && matchesSubject && matchesYear;
  });

  const getTermLabel = (term) => {
    const labels = {
      term_1: 'Term 1',
      term_2: 'Term 2',
      term_3: 'Term 3',
      mock: 'Mock',
      final: 'Final'
    };
    return labels[term] || term;
  };

  const getLevelColor = (level) => {
    const colors = {
      primary: 'bg-green-100 text-green-700',
      junior_secondary: 'bg-blue-100 text-blue-700',
      senior_secondary: 'bg-purple-100 text-purple-700',
      post_secondary: 'bg-orange-100 text-orange-700'
    };
    return colors[level] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Past Papers</h1>
            <p className="text-slate-500">Access thousands of past papers with solutions</p>
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
                placeholder="Search papers by title, subject, or school..."
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

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No papers found</h3>
          <p className="text-slate-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper, index) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-200 border-slate-200 cursor-pointer group"
                    onClick={() => setSelectedPaper(paper)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    {paper.is_premium && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">Premium</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {paper.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className={getLevelColor(paper.level)}>
                      {paper.level?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{paper.subject}</Badge>
                    {paper.term && (
                      <Badge variant="outline">{getTermLabel(paper.term)}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {paper.year}
                    </span>
                    {paper.school_name && (
                      <span className="flex items-center gap-1">
                        <School className="h-3.5 w-3.5" />
                        {paper.school_name}
                      </span>
                    )}
                  </div>

                  {paper.grade_form && (
                    <p className="text-sm text-slate-500 mt-2">{paper.grade_form}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Paper Detail Dialog */}
      <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPaper?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={getLevelColor(selectedPaper?.level)}>
                {selectedPaper?.level?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">{selectedPaper?.subject}</Badge>
              {selectedPaper?.term && (
                <Badge variant="outline">{getTermLabel(selectedPaper?.term)}</Badge>
              )}
              <Badge variant="outline">{selectedPaper?.year}</Badge>
            </div>

            {selectedPaper?.school_name && (
              <p className="text-sm text-slate-600">
                <School className="h-4 w-4 inline mr-1" />
                {selectedPaper.school_name}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {selectedPaper?.paper_file && (
                <a href={selectedPaper.paper_file} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Paper
                  </Button>
                </a>
              )}
              {selectedPaper?.answers_file && (
                <a href={selectedPaper.answers_file} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Answers
                  </Button>
                </a>
              )}
              {selectedPaper?.solutions_text && (
                <Button 
                  variant="outline"
                  onClick={() => setViewingSolutions(!viewingSolutions)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {viewingSolutions ? 'Hide' : 'View'} Solutions
                </Button>
              )}
            </div>

            {viewingSolutions && selectedPaper?.solutions_text && (
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Step-by-Step Solutions</h4>
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                    {selectedPaper.solutions_text}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
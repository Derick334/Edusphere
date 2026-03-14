import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Store, Search, Filter, Star, Download, Eye, 
  BookOpen, FileText, GraduationCap, Package,
  Loader2, Heart, Share2, CheckCircle, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentDetailDialog from '@/components/marketplace/ContentDetailDialog';
import ContentCard from '@/components/marketplace/ContentCard';

export default function ContentMarketplace() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [contents, setContents] = useState([]);
  const [myAccess, setMyAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);

  const contentTypes = [
    { value: 'all', label: 'All Types', icon: Package },
    { value: 'note', label: 'Notes', icon: BookOpen },
    { value: 'past_paper', label: 'Past Papers', icon: FileText },
    { value: 'assignment', label: 'Assignments', icon: GraduationCap },
    { value: 'resource_pack', label: 'Resource Packs', icon: Package }
  ];

  const subjects = [
    'all', 'Mathematics', 'English', 'Kiswahili', 'Physics', 
    'Chemistry', 'Biology', 'History', 'Geography', 'CRE', 'Business Studies'
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'primary', label: 'Primary' },
    { value: 'junior_secondary', label: 'Junior Secondary' },
    { value: 'senior_secondary', label: 'Senior Secondary' },
    { value: 'post_secondary', label: 'Post Secondary' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const [students, teachers] = await Promise.all([
          base44.entities.Student.filter({ user_id: userData.id }),
          base44.entities.Teacher.filter({ user_id: userData.id })
        ]);
        
        if (students.length > 0) {
          setProfile({ type: 'student', data: students[0] });
          const access = await base44.entities.ContentAccess.filter({ accessor_id: students[0].id });
          setMyAccess(access);
        } else if (teachers.length > 0) {
          setProfile({ type: 'teacher', data: teachers[0] });
          const access = await base44.entities.ContentAccess.filter({ accessor_id: teachers[0].id });
          setMyAccess(access);
        } else {
          // Check if school admin
          const adminSchools = await base44.entities.School.filter({ admin_user_id: userData.id });
          if (adminSchools.length > 0) {
            setProfile({ type: 'school_admin', data: adminSchools[0] });
          }
        }
      }

      const allContent = await base44.entities.SharedContent.filter(
        { is_approved: true },
        '-average_rating',
        100
      );
      setContents(allContent);
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.school_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || content.content_type === selectedType;
    const matchesSubject = selectedSubject === 'all' || content.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'all' || content.level === selectedLevel;
    
    return matchesSearch && matchesType && matchesSubject && matchesLevel;
  });

  const featuredContent = filteredContents.filter(c => c.is_featured);
  const hasAccess = (contentId) => myAccess.some(a => a.content_id === contentId);

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
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Marketplace</h1>
            <p className="text-slate-500">Discover and share quality learning materials from schools across Kenya</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="mb-6 border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search content by title, description, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {contentTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedType === type.value
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
            }`}
          >
            <type.icon className="h-4 w-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Featured Section */}
      {featuredContent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Featured Content
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredContent.slice(0, 3).map((content, index) => (
              <ContentCard
                key={content.id}
                content={content}
                hasAccess={hasAccess(content.id)}
                onSelect={() => setSelectedContent(content)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All Content */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          All Content ({filteredContents.length})
        </h2>
        
        {filteredContents.length === 0 ? (
          <div className="text-center py-16">
            <Store className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No content found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContents.map((content, index) => (
              <ContentCard
                key={content.id}
                content={content}
                hasAccess={hasAccess(content.id)}
                onSelect={() => setSelectedContent(content)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Detail Dialog */}
      <ContentDetailDialog
        content={selectedContent}
        open={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        hasAccess={selectedContent ? hasAccess(selectedContent.id) : false}
        user={user}
        profile={profile}
        onAccessGranted={loadData}
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Upload, Share2, BookOpen, FileText, GraduationCap, 
  Package, Loader2, CheckCircle, Eye, DollarSign
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ShareContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myShared, setMyShared] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'note',
    subject: '',
    level: '',
    grade_form: '',
    preview_text: '',
    tags: [],
    is_free: true,
    price: 0,
    visibility: 'subscribers_only',
    file: null
  });

  const contentTypes = [
    { value: 'note', label: 'Study Notes', icon: BookOpen },
    { value: 'past_paper', label: 'Past Paper', icon: FileText },
    { value: 'assignment', label: 'Assignment', icon: GraduationCap },
    { value: 'resource_pack', label: 'Resource Pack', icon: Package }
  ];

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 
    'Biology', 'History', 'Geography', 'CRE', 'Business Studies'
  ];

  const levels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'junior_secondary', label: 'Junior Secondary' },
    { value: 'senior_secondary', label: 'Senior Secondary' },
    { value: 'post_secondary', label: 'Post Secondary' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Support both teachers and school admins
      const [teachers, adminSchools] = await Promise.all([
        base44.entities.Teacher.filter({ user_id: userData.id }),
        base44.entities.School.filter({ admin_user_id: userData.id })
      ]);

      let schoolId = null;
      if (teachers.length > 0) {
        setProfile(teachers[0]);
        schoolId = teachers[0].school_id;
      } else if (adminSchools.length > 0) {
        setProfile({ school_id: adminSchools[0].id, full_name: userData.full_name });
        schoolId = adminSchools[0].id;
        setSchool(adminSchools[0]);
      }

      if (schoolId) {
        const schools = await base44.entities.School.filter({ id: schoolId });
        if (schools.length > 0 && !school) setSchool(schools[0]);

        const shared = await base44.entities.SharedContent.filter(
          { school_id: schoolId },
          '-created_date'
        );
        setMyShared(shared);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, file: file_url }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.subject || !formData.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.file) {
      toast.error('Please upload a file');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.SharedContent.create({
        title: formData.title,
        description: formData.description,
        content_type: formData.content_type,
        subject: formData.subject,
        level: formData.level,
        grade_form: formData.grade_form,
        school_id: profile?.school_id,
        school_name: school?.name,
        school_code: school?.school_code,
        author_name: profile?.full_name,
        file_url: formData.file,
        preview_text: formData.preview_text,
        tags: formData.tags,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
        visibility: formData.visibility,
        is_approved: false // Requires admin approval
      });

      toast.success('Content submitted for review! It will be published after approval.');
      navigate(createPageUrl('ContentMarketplace'));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to share content');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <Share2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">School Account Required</h2>
        <p className="text-slate-500">Only teachers and school administrators can share content to the marketplace.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Share Content</h1>
            <p className="text-slate-500">Share your learning materials with schools across Kenya</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Type */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {contentTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({...formData, content_type: type.value})}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.content_type === type.value
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <type.icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Form 3 Chemistry Notes - Organic Chemistry"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what's included in this content..."
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={formData.subject} onValueChange={(v) => setFormData({...formData, subject: v})}>
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
                  <Label>Level *</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({...formData, level: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grade/Form</Label>
                  <Input
                    value={formData.grade_form}
                    onChange={(e) => setFormData({...formData, grade_form: e.target.value})}
                    placeholder="e.g., Form 3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preview Text</Label>
                <Textarea
                  value={formData.preview_text}
                  onChange={(e) => setFormData({...formData, preview_text: e.target.value})}
                  placeholder="A short preview that users can see before purchasing..."
                  rows={2}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload File *</Label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${
                  formData.file ? 'border-green-300 bg-green-50' : 'border-slate-200'
                }`}>
                  {formData.file ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>File uploaded successfully</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to upload file</p>
                      <p className="text-xs text-slate-400">PDF, DOCX, or images</p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc,.pptx,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Visibility */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Pricing & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Free Content</Label>
                  <p className="text-sm text-slate-500">Make this content available for free</p>
                </div>
                <Switch
                  checked={formData.is_free}
                  onCheckedChange={(v) => setFormData({...formData, is_free: v})}
                />
              </div>

              {!formData.is_free && (
                <div className="space-y-2">
                  <Label>Price (KES)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                    placeholder="e.g., 100"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v) => setFormData({...formData, visibility: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone)</SelectItem>
                    <SelectItem value="subscribers_only">Subscribers Only</SelectItem>
                    <SelectItem value="partner_schools">Partner Schools Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
            Share Content
          </Button>
        </div>

        {/* Sidebar - My Shared Content */}
        <div>
          <Card className="border-slate-200 sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">My Shared Content</CardTitle>
            </CardHeader>
            <CardContent>
              {myShared.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  You haven't shared any content yet
                </p>
              ) : (
                <div className="space-y-3">
                  {myShared.slice(0, 5).map(content => (
                    <div key={content.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-sm truncate">{content.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{content.subject}</Badge>
                        {content.is_approved ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Published</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
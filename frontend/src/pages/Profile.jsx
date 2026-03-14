import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, School, GraduationCap, 
  Calendar, Edit2, Loader2, Camera, Save
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Check profile type
      const [students, teachers, tutors] = await Promise.all([
        base44.entities.Student.filter({ user_id: userData.id }),
        base44.entities.Teacher.filter({ user_id: userData.id }),
        base44.entities.Tutor.filter({ user_id: userData.id })
      ]);

      if (students.length > 0) {
        setProfile(students[0]);
        setProfileType('student');
        setEditData(students[0]);
      } else if (teachers.length > 0) {
        setProfile(teachers[0]);
        setProfileType('teacher');
        setEditData(teachers[0]);
      } else if (tutors.length > 0) {
        setProfile(tutors[0]);
        setProfileType('tutor');
        setEditData(tutors[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditData(prev => ({ ...prev, profile_photo: file_url }));
      toast.success('Photo uploaded');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profileType === 'student') {
        await base44.entities.Student.update(profile.id, editData);
      } else if (profileType === 'teacher') {
        await base44.entities.Teacher.update(profile.id, editData);
      } else if (profileType === 'tutor') {
        await base44.entities.Tutor.update(profile.id, editData);
      }
      
      setProfile(editData);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header Card */}
      <Card className="border-slate-200 mb-6 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={editing ? editData.profile_photo : profile?.profile_photo} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {(profile?.full_name || user?.full_name)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <label className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                  <Camera className="h-4 w-4 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || user?.full_name}
              </h1>
              <p className="text-slate-500">{user?.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <Badge className="capitalize">{profileType || 'User'}</Badge>
                {profile?.level && (
                  <Badge variant="outline" className="capitalize">
                    {profile.level.replace('_', ' ')}
                  </Badge>
                )}
                {profile?.is_verified && (
                  <Badge className="bg-green-100 text-green-700">Verified</Badge>
                )}
              </div>
            </div>
            <Button 
              variant={editing ? 'default' : 'outline'}
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          {profileType === 'student' && (
            <TabsTrigger value="fees">Fees</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {editing ? (
                    <Input 
                      value={editData.full_name || ''}
                      onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                    />
                  ) : (
                    <p className="text-slate-700 py-2">{profile?.full_name || '-'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-slate-700 py-2">{user?.email}</p>
                </div>

                {profileType === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label>Admission Number</Label>
                      <p className="text-slate-700 py-2">{profile?.admission_number || '-'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Parent Phone</Label>
                      {editing ? (
                        <Input 
                          value={editData.parent_phone || ''}
                          onChange={(e) => setEditData({...editData, parent_phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{profile?.parent_phone || '-'}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Parent Email</Label>
                      {editing ? (
                        <Input 
                          value={editData.parent_email || ''}
                          onChange={(e) => setEditData({...editData, parent_email: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{profile?.parent_email || '-'}</p>
                      )}
                    </div>
                  </>
                )}

                {profileType === 'teacher' && (
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    {editing ? (
                      <Input 
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      />
                    ) : (
                      <p className="text-slate-700 py-2">{profile?.phone || '-'}</p>
                    )}
                  </div>
                )}

                {profileType === 'tutor' && (
                  <>
                    <div className="space-y-2">
                      <Label>Hourly Rate (KES)</Label>
                      {editing ? (
                        <Input 
                          type="number"
                          value={editData.hourly_rate || ''}
                          onChange={(e) => setEditData({...editData, hourly_rate: parseInt(e.target.value)})}
                        />
                      ) : (
                        <p className="text-slate-700 py-2">KES {profile?.hourly_rate?.toLocaleString() || '-'}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Location</Label>
                      {editing ? (
                        <Input 
                          value={editData.location || ''}
                          onChange={(e) => setEditData({...editData, location: e.target.value})}
                        />
                      ) : (
                        <p className="text-slate-700 py-2">{profile?.location || '-'}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {editing && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setEditData(profile);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                {profileType === 'student' && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <School className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">School Code</p>
                        <p className="font-medium text-slate-900">{profile?.school_code || 'Not enrolled'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Grade/Form</p>
                        <p className="font-medium text-slate-900">{profile?.grade_class || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Subscription</p>
                        <p className="font-medium text-slate-900 capitalize">
                          {profile?.subscription_type?.replace('_', ' ') || 'Free'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {profileType === 'teacher' && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <School className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">School Code</p>
                        <p className="font-medium text-slate-900">{profile?.school_code || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.subjects?.map(subject => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        )) || <span className="text-slate-400">No subjects assigned</span>}
                      </div>
                    </div>
                  </>
                )}

                {profileType === 'tutor' && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Experience</p>
                        <p className="font-medium text-slate-900">{profile?.experience_years || 0} years</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                        <span className="text-xl">⭐</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Rating</p>
                        <p className="font-medium text-slate-900">
                          {profile?.rating || 0} ({profile?.total_reviews || 0} reviews)
                        </p>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-slate-500 mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.subjects?.map(subject => (
                          <Badge key={subject} variant="secondary">{subject}</Badge>
                        )) || <span className="text-slate-400">No subjects</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {profileType === 'student' && (
          <TabsContent value="fees" className="mt-4">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Fee Information</CardTitle>
                <CardDescription>Current fee balances and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-slate-900">
                      KES {(profile?.fee_balance || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-red-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Arrears</p>
                    <p className="text-3xl font-bold text-red-600">
                      KES {(profile?.fee_arrears || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    For fee payments and queries, please contact your school's administration office.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
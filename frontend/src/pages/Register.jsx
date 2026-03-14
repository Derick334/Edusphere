import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  GraduationCap, User, School, BookOpen, ArrowRight, 
  ArrowLeft, CheckCircle, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    admission_number: '',
    school_code: '',
    level: '',
    grade_class: '',
    parent_phone: '',
    parent_email: '',
    subjects: [],
    hourly_rate: '',
    experience_years: '',
    bio: '',
    teaching_mode: 'both',
    location: '',
    specializations: [],
    teaching_methodologies: [],
    learning_style_support: [],
    available_times: {}
  });

  const methodologyOptions = [
    'Socratic Method', 'Problem-Based Learning', 'Visual Learning',
    'Step-by-Step Guidance', 'Practice & Drill', 'Conceptual Explanation',
    'Real-World Examples', 'Gamification', 'Collaborative Learning'
  ];

  const learningStyleOptions = [
    'Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic',
    'Analytical', 'Creative', 'Structured', 'Self-Paced'
  ];

  const specializationOptions = [
    'Exam Prep (KCSE)', 'Exam Prep (KCPE)', 'University Entrance',
    'Remedial Support', 'Advanced/A-Level', 'Competition Math',
    'Essay Writing', 'Language Skills', 'Science Experiments'
  ];

  const timeSlotOptions = [
    { key: 'weekday_morning', label: 'Weekday Mornings' },
    { key: 'weekday_afternoon', label: 'Weekday Afternoons' },
    { key: 'weekday_evening', label: 'Weekday Evenings' },
    { key: 'weekend_morning', label: 'Weekend Mornings' },
    { key: 'weekend_afternoon', label: 'Weekend Afternoons' },
    { key: 'weekend_evening', label: 'Weekend Evenings' },
  ];

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const userTypes = [
    { 
      id: 'student', 
      icon: User, 
      title: 'Student', 
      description: 'Access past papers, AI tutor, and assignments',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'teacher', 
      icon: BookOpen, 
      title: 'Teacher', 
      description: 'Create assignments and track student progress',
      color: 'from-emerald-500 to-green-600'
    },
    { 
      id: 'tutor', 
      icon: GraduationCap, 
      title: 'Tutor', 
      description: 'Offer tutoring services to students',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'school', 
      icon: School, 
      title: 'School Admin', 
      description: 'Register your school and manage students',
      color: 'from-violet-500 to-purple-600'
    }
  ];

  const levels = [
    { value: 'primary', label: 'Primary School (Grade 1-8)' },
    { value: 'junior_secondary', label: 'Junior Secondary (Grade 9-10)' },
    { value: 'senior_secondary', label: 'Senior Secondary (Form 1-4)' },
    { value: 'post_secondary', label: 'Post Secondary' }
  ];

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 
    'Biology', 'History', 'Geography', 'CRE', 'Business Studies',
    'Agriculture', 'Computer Studies', 'Home Science'
  ];

  const handleSubmit = async () => {
    setLoading(true);
    
    // First, redirect to login to create account
    const currentUrl = window.location.href;
    const params = new URLSearchParams({
      userType,
      ...formData,
      returnUrl: createPageUrl('Dashboard')
    });
    
    // Store registration data
    localStorage.setItem('pendingRegistration', JSON.stringify({
      userType,
      ...formData
    }));
    
    base44.auth.redirectToLogin(createPageUrl('CompleteRegistration'));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Join EduTech AI</CardTitle>
              <CardDescription>Select how you want to use the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setUserType(type.id);
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left hover:border-blue-400 hover:shadow-lg ${
                    userType === type.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                      <type.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{type.title}</h3>
                      <p className="text-sm text-slate-500">{type.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-auto" />
                  </div>
                </button>
              ))}
            </CardContent>
          </motion.div>
        );

      case 2:
        if (userType === 'student') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader className="pb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-fit -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Enter your details to create your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admission Number</Label>
                  <Input 
                    placeholder="e.g., ADM/2024/001"
                    value={formData.admission_number}
                    onChange={(e) => setFormData({...formData, admission_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>School Code (Optional)</Label>
                  <Input 
                    placeholder="Enter your school code if enrolled"
                    value={formData.school_code}
                    onChange={(e) => setFormData({...formData, school_code: e.target.value})}
                  />
                  <p className="text-xs text-slate-500">Leave blank if subscribing individually</p>
                </div>
                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({...formData, level: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade/Form/Class</Label>
                  <Input 
                    placeholder="e.g., Form 3 or Grade 8"
                    value={formData.grade_class}
                    onChange={(e) => setFormData({...formData, grade_class: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parent Phone</Label>
                    <Input 
                      placeholder="+254..."
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Email</Label>
                    <Input 
                      type="email"
                      placeholder="parent@email.com"
                      value={formData.parent_email}
                      onChange={(e) => setFormData({...formData, parent_email: e.target.value})}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  disabled={loading || !formData.full_name || !formData.admission_number || !formData.level}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue to Sign Up
                </Button>
              </CardContent>
            </motion.div>
          );
        }

        if (userType === 'teacher') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader className="pb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-fit -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <CardTitle>Teacher Registration</CardTitle>
                <CardDescription>Register as a school teacher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>School Code</Label>
                  <Input 
                    placeholder="Enter your school's code"
                    value={formData.school_code}
                    onChange={(e) => setFormData({...formData, school_code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subjects You Teach</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 8).map(subject => (
                      <button
                        key={subject}
                        onClick={() => {
                          const newSubjects = formData.subjects.includes(subject)
                            ? formData.subjects.filter(s => s !== subject)
                            : [...formData.subjects, subject];
                          setFormData({...formData, subjects: newSubjects});
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.subjects.includes(subject)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
                  disabled={loading || !formData.full_name || !formData.school_code}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue to Sign Up
                </Button>
              </CardContent>
            </motion.div>
          );
        }

        if (userType === 'tutor') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader className="pb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-fit -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <CardTitle>Tutor Registration</CardTitle>
                <CardDescription>Register to offer tutoring services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hourly Rate (KES)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (Years)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({...formData, experience_years: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Mode</Label>
                  <Select value={formData.teaching_mode} onValueChange={(v) => setFormData({...formData, teaching_mode: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="physical">Physical Only</SelectItem>
                      <SelectItem value="both">Both Online & Physical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    placeholder="e.g., Nairobi, Westlands"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 8).map(subject => (
                      <button key={subject} onClick={() => toggleArrayField('subjects', subject)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.subjects.includes(subject) ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map(s => (
                      <button key={s} onClick={() => toggleArrayField('specializations', s)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.specializations.includes(s) ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Methodologies</Label>
                  <div className="flex flex-wrap gap-2">
                    {methodologyOptions.map(m => (
                      <button key={m} onClick={() => toggleArrayField('teaching_methodologies', m)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.teaching_methodologies.includes(m) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Learning Styles You Support</Label>
                  <div className="flex flex-wrap gap-2">
                    {learningStyleOptions.map(l => (
                      <button key={l} onClick={() => toggleArrayField('learning_style_support', l)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.learning_style_support.includes(l) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Available Times</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlotOptions.map(slot => (
                      <button key={slot.key} onClick={() => setFormData(prev => ({...prev, available_times: {...prev.available_times, [slot.key]: !prev.available_times[slot.key]}}))}
                        className={`px-3 py-2 rounded-lg text-sm transition-all text-left ${formData.available_times[slot.key] ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                  disabled={loading || !formData.full_name || !formData.hourly_rate}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Continue to Sign Up
                </Button>
              </CardContent>
            </motion.div>
          );
        }

        if (userType === 'school') {
          return (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader className="pb-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-fit -ml-2 mb-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <CardTitle>School Registration</CardTitle>
                <CardDescription>Register your school on the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  School registration requires verification. Please continue to create your admin account first.
                </p>
                <Button 
                  onClick={() => {
                    localStorage.setItem('pendingRegistration', JSON.stringify({ userType: 'school' }));
                    base44.auth.redirectToLogin(createPageUrl('SchoolRegister'));
                  }} 
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  Continue to School Registration
                </Button>
              </CardContent>
            </motion.div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md relative shadow-2xl border-slate-200">
        {renderStep()}
        
        <div className="px-6 pb-6">
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button 
              onClick={() => base44.auth.redirectToLogin()}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
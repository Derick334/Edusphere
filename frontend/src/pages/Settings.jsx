import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  School, Upload, Loader2, CheckCircle, ArrowRight, ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function SchoolRegister() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    school_code: '',
    level: '',
    county: '',
    address: '',
    phone: '',
    email: '',
    logo: null,
    certificate: null
  });

  const levels = [
    { value: 'primary', label: 'Primary School' },
    { value: 'junior_secondary', label: 'Junior Secondary' },
    { value: 'senior_secondary', label: 'Senior Secondary' },
    { value: 'post_secondary', label: 'Post Secondary' }
  ];

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 
    'Kiambu', 'Machakos', 'Kakamega', 'Nyeri', 'Meru',
    'Kilifi', 'Uasin Gishu', 'Kisii', 'Bungoma', 'Kajiado'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(createPageUrl('SchoolRegister'));
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
    setFormData(prev => ({ ...prev, email: userData.email }));
    setLoading(false);
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.school_code || !formData.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.School.create({
        ...formData,
        admin_user_id: user.id,
        is_verified: false,
        subscription_plan: 'free'
      });

      toast.success('School registration submitted! We will review and verify your school shortly.');
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to register school. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Register Your School</h1>
          <p className="text-slate-600">
            Join EduTech AI and give your students access to powerful learning tools
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  step >= s 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-violet-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter your school's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>School Name *</Label>
                  <Input 
                    placeholder="e.g., Nairobi Academy"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>School Code *</Label>
                  <Input 
                    placeholder="e.g., NAI001"
                    value={formData.school_code}
                    onChange={(e) => setFormData({...formData, school_code: e.target.value.toUpperCase()})}
                  />
                  <p className="text-xs text-slate-500">
                    Unique identifier for your school. Students will use this to register.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Education Level *</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({...formData, level: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={!formData.name || !formData.school_code || !formData.level}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>How can we reach your school?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>County</Label>
                  <Select value={formData.county} onValueChange={(v) => setFormData({...formData, county: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {counties.map(county => (
                        <SelectItem key={county} value={county}>{county}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea 
                    placeholder="Physical address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+254..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      placeholder="school@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
                <CardDescription>Upload documents for verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>School Logo (optional)</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    {formData.logo ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-slate-600">Logo uploaded</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload logo</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Registration Certificate (optional)</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    {formData.certificate ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-slate-600">Certificate uploaded</span>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload certificate</p>
                        <p className="text-xs text-slate-400">PDF or image</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'certificate')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-violet-50 rounded-xl p-4">
                  <h4 className="font-medium text-violet-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-violet-700 space-y-1">
                    <li>• Our team will review your registration within 24-48 hours</li>
                    <li>• Once verified, you'll receive an email confirmation</li>
                    <li>• You can then add teachers and students to your school</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Submit Registration</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
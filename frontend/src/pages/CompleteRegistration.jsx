import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

export default function CompleteRegistration() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    completeRegistration();
  }, []);

  const completeRegistration = async () => {
    try {
      const pendingData = localStorage.getItem('pendingRegistration');
      if (!pendingData) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      const regData = JSON.parse(pendingData);
      const user = await base44.auth.me();

      if (regData.userType === 'student') {
        await base44.entities.Student.create({
          user_id: user.id,
          admission_number: regData.admission_number,
          school_code: regData.school_code || null,
          full_name: regData.full_name,
          level: regData.level,
          grade_class: regData.grade_class,
          parent_phone: regData.parent_phone,
          parent_email: regData.parent_email,
          subscription_type: regData.school_code ? 'school_based' : 'free'
        });
      } else if (regData.userType === 'teacher') {
        await base44.entities.Teacher.create({
          user_id: user.id,
          full_name: regData.full_name,
          school_code: regData.school_code,
          subjects: regData.subjects || []
        });
      } else if (regData.userType === 'tutor') {
        await base44.entities.Tutor.create({
          user_id: user.id,
          full_name: regData.full_name,
          hourly_rate: parseFloat(regData.hourly_rate) || 0,
          experience_years: parseInt(regData.experience_years) || 0,
          teaching_mode: regData.teaching_mode,
          location: regData.location,
          subjects: regData.subjects || [],
          specializations: regData.specializations || [],
          teaching_methodologies: regData.teaching_methodologies || [],
          learning_style_support: regData.learning_style_support || [],
          available_times: regData.available_times || {}
        });
      }

      localStorage.removeItem('pendingRegistration');
      setStatus('success');
      
      toast.success('Registration completed successfully!');
      
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1500);
    } catch (error) {
      console.error('Error completing registration:', error);
      toast.error('Failed to complete registration');
      setStatus('error');
      setTimeout(() => {
        navigate(createPageUrl('Register'));
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Setting up your account...</h2>
            <p className="text-slate-500">Please wait while we complete your registration</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome to EduTech AI!</h2>
            <p className="text-slate-500">Redirecting to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500">Redirecting back to registration...</p>
          </>
        )}
      </div>
    </div>
  );
}
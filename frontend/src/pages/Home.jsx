import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Brain, BookOpen, FileText, Users, MessageSquare, 
  GraduationCap, CheckCircle, ArrowRight, Sparkles,
  Play, Star, TrendingUp, Clock, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get instant answers from ChatGPT, Gemini, and Perplexity AI with voice explanations",
      color: "from-violet-500 to-purple-600"
    },
    {
      icon: FileText,
      title: "Past Papers Library",
      description: "Access thousands of past papers with detailed solutions from top schools",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: GraduationCap,
      title: "Smart Assignments",
      description: "Submit assignments and get instant AI grading with detailed feedback",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: Users,
      title: "Expert Tutors",
      description: "Book sessions with verified tutors for online or physical classes",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Parents and teachers can monitor academic progress in real-time",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: MessageSquare,
      title: "School Chat",
      description: "Collaborate with classmates and teachers in real-time discussions",
      color: "from-indigo-500 to-blue-600"
    }
  ];

  const levels = [
    { name: "Primary School", grades: "Grade 1-8", icon: "🎒" },
    { name: "Junior Secondary", grades: "Grade 9-10", icon: "📚" },
    { name: "Senior Secondary", grades: "Form 1-4", icon: "🎓" },
    { name: "Post Secondary", grades: "College/University", icon: "🏛️" }
  ];

  const stats = [
    { value: "50K+", label: "Active Students" },
    { value: "200+", label: "Partner Schools" },
    { value: "10K+", label: "Past Papers" },
    { value: "500+", label: "Expert Tutors" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 lg:px-8 pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Education Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Learn Smarter with
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Assistance</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Access past papers, get AI explanations, submit assignments, and connect with expert tutors. 
                All in one platform designed for Kenyan students.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl('Register')}>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/25 h-14 px-8 text-lg">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">Trusted by 50,000+ students</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-6 border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                  alt="Students learning"
                  className="rounded-2xl w-full h-80 object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">AI Grading</p>
                      <p className="text-sm text-slate-500">Instant feedback</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Multi-AI</p>
                      <p className="text-sm text-slate-500">ChatGPT + Gemini</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-slate-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Levels */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Learning for Every Level
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From primary school to post-secondary education, we've got you covered
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{level.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{level.name}</h3>
                    <p className="text-slate-500">{level.grades}</p>
                    <Button variant="ghost" className="mt-4 group-hover:text-blue-600">
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed to help students, teachers, and parents succeed together
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200 group">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of students already using EduTech AI to achieve academic excellence
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={createPageUrl('Register')}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg shadow-xl">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to={createPageUrl('Pricing')}>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <div className="flex justify-center items-center gap-8 mt-8 text-blue-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Free tier available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Secure platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>24/7 AI support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">EduTech AI</span>
              </div>
              <p className="text-sm">
                Empowering students across Kenya with AI-powered education tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('PastPapers')} className="hover:text-white">Past Papers</Link></li>
                <li><Link to={createPageUrl('AITutor')} className="hover:text-white">AI Tutor</Link></li>
                <li><Link to={createPageUrl('Tutors')} className="hover:text-white">Find Tutors</Link></li>
                <li><Link to={createPageUrl('Notes')} className="hover:text-white">Study Notes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Schools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl('SchoolRegister')} className="hover:text-white">Register School</Link></li>
                <li><Link to={createPageUrl('Pricing')} className="hover:text-white">School Plans</Link></li>
                <li><a href="#" className="hover:text-white">Teacher Tools</a></li>
                <li><a href="#" className="hover:text-white">Parent Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2024 EduTech AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
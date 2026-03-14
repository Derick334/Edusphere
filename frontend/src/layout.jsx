import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, BookOpen, FileText, Users, MessageSquare, 
  GraduationCap, Brain, Settings, Menu, X, ChevronDown,
  LogOut, User, Bell, Search, Handshake, ShieldCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const auth = await base44.auth.isAuthenticated();
    setIsAuthenticated(auth);
    if (auth) {
      const userData = await base44.auth.me();
      setUser(userData);
      // Try to get user profile (student, teacher, tutor)
      try {
        const students = await base44.entities.Student.filter({ user_id: userData.id });
        if (students.length > 0) {
          setUserProfile({ type: 'student', data: students[0] });
        } else {
          const teachers = await base44.entities.Teacher.filter({ user_id: userData.id });
          if (teachers.length > 0) {
            setUserProfile({ type: 'teacher', data: teachers[0] });
          } else {
            const tutors = await base44.entities.Tutor.filter({ user_id: userData.id });
            if (tutors.length > 0) {
              setUserProfile({ type: 'tutor', data: tutors[0] });
            }
          }
        }
      } catch (e) {
        console.log('Profile not found');
      }
    }
  };

  const publicPages = ['Home', 'About', 'Pricing', 'Register'];
  const isPublicPage = publicPages.includes(currentPageName);

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'About', icon: BookOpen, page: 'About' },
        { name: 'Pricing', icon: GraduationCap, page: 'Pricing' },
      ];
    }

    const baseItems = [
      { name: 'Dashboard', icon: Home, page: 'Dashboard' },
      { name: 'AI Tutor', icon: Brain, page: 'AITutor' },
      { name: 'Past Papers', icon: FileText, page: 'PastPapers' },
      { name: 'Notes', icon: BookOpen, page: 'Notes' },
      { name: 'Assignments', icon: GraduationCap, page: 'Assignments' },
      { name: 'Marketplace', icon: Users, page: 'ContentMarketplace' },
      { name: 'Find Tutors', icon: Users, page: 'Tutors' },
      { name: 'Chat', icon: MessageSquare, page: 'Chat' },
      { name: 'Performance', icon: GraduationCap, page: 'Performance' },
    ];

    if (userProfile?.type === 'teacher') {
      baseItems.push({ name: 'My Classes', icon: Users, page: 'TeacherDashboard' });
      baseItems.push({ name: 'Share Content', icon: FileText, page: 'ShareContent' });
      baseItems.push({ name: 'Partnerships', icon: Handshake, page: 'SchoolPartnerships' });
    }

    if (user?.role === 'admin') {
      baseItems.push({ name: 'Moderation', icon: ShieldCheck, page: 'ContentModeration' });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <style>{`
        :root {
          --primary: 221 83% 53%;
          --primary-foreground: 210 40% 98%;
          --accent: 142 76% 36%;
          --accent-foreground: 0 0% 100%;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                EduTech AI
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.data?.profile_photo} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">{user?.full_name}</span>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user?.full_name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Settings')} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-slate-600"
                >
                  Sign In
                </Button>
                <Link to={createPageUrl('Register')}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {isAuthenticated && (
          <aside className={`
            fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64
            bg-white/80 backdrop-blur-xl border-r border-slate-200/50
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-slate-600 hover:bg-slate-100'}
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] ${isAuthenticated ? 'lg:ml-0' : ''}`}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
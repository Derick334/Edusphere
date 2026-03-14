import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { GraduationCap, Heart } from 'lucide-react';

export default function DashboardFooter() {
  const year = new Date().getFullYear();

  const links = [
    { label: 'Marketplace', page: 'ContentMarketplace' },
    { label: 'Past Papers', page: 'PastPapers' },
    { label: 'Notes', page: 'Notes' },
    { label: 'Find Tutors', page: 'Tutors' },
    { label: 'AI Tutor', page: 'AITutor' },
  ];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
      <div className="px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-none">EduTech AI</p>
              <p className="text-xs text-slate-500">Empowering Kenyan Education</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map(link => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
            © {year} EduTech AI. Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
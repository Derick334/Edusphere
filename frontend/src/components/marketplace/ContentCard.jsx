import { motion } from 'framer-motion';
import { 
  Star, Download, Eye, BookOpen, FileText, 
  GraduationCap, Package, Lock, CheckCircle, School
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContentCard({ content, hasAccess, onSelect, featured }) {
  const getTypeIcon = (type) => {
    const icons = {
      note: BookOpen,
      past_paper: FileText,
      assignment: GraduationCap,
      resource_pack: Package
    };
    return icons[type] || Package;
  };

  const getTypeColor = (type) => {
    const colors = {
      note: 'from-emerald-500 to-green-600',
      past_paper: 'from-blue-500 to-cyan-600',
      assignment: 'from-purple-500 to-indigo-600',
      resource_pack: 'from-orange-500 to-red-600'
    };
    return colors[type] || 'from-slate-500 to-slate-600';
  };

  const TypeIcon = getTypeIcon(content.content_type);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`h-full cursor-pointer transition-all duration-200 group ${
          featured 
            ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' 
            : 'border-slate-200 hover:border-purple-300 hover:shadow-lg'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getTypeColor(content.content_type)} flex items-center justify-center`}>
              <TypeIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1">
              {hasAccess ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              ) : content.is_free ? (
                <Badge className="bg-emerald-100 text-emerald-700">Free</Badge>
              ) : (
                <Badge variant="secondary">
                  KES {content.price?.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {content.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
            {content.description || 'No description provided'}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">{content.subject}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{content.level?.replace('_', ' ')}</Badge>
            {content.grade_form && (
              <Badge variant="outline" className="text-xs">{content.grade_form}</Badge>
            )}
          </div>

          {/* School Info */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <School className="h-4 w-4" />
            <span className="truncate">{content.school_name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(content.average_rating || 0))}
              <span className="text-xs text-slate-500 ml-1">({content.total_ratings || 0})</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {content.total_downloads || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
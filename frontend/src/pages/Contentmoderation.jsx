import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  ShieldCheck, CheckCircle, XCircle, Eye, Loader2,
  BookOpen, FileText, GraduationCap, Package, School, Star
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const typeIcon = { note: BookOpen, past_paper: FileText, assignment: GraduationCap, resource_pack: Package };
const typeColor = {
  note: 'from-emerald-500 to-green-600',
  past_paper: 'from-blue-500 to-cyan-600',
  assignment: 'from-purple-500 to-indigo-600',
  resource_pack: 'from-orange-500 to-red-600'
};

export default function ContentModeration() {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.role !== 'admin') { setLoading(false); return; }

      const [pendingContent, approvedContent] = await Promise.all([
        base44.entities.SharedContent.filter({ is_approved: false }, '-created_date', 50),
        base44.entities.SharedContent.filter({ is_approved: true }, '-created_date', 50)
      ]);
      setPending(pendingContent);
      setApproved(approvedContent);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (content, featured = false) => {
    setActioning(content.id);
    try {
      await base44.entities.SharedContent.update(content.id, {
        is_approved: true,
        is_featured: featured
      });
      toast.success(`"${content.title}" approved${featured ? ' and featured' : ''}!`);
      loadData();
    } catch (error) {
      toast.error('Failed to approve');
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (content) => {
    setActioning(content.id);
    try {
      await base44.entities.SharedContent.delete(content.id);
      toast.success('Content rejected and removed');
      loadData();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setActioning(null);
    }
  };

  const handleToggleFeatured = async (content) => {
    setActioning(content.id);
    try {
      await base44.entities.SharedContent.update(content.id, { is_featured: !content.is_featured });
      toast.success(content.is_featured ? 'Removed from featured' : 'Marked as featured');
      loadData();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <ShieldCheck className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
        <p className="text-slate-500">Content moderation is only available to platform admins.</p>
      </div>
    );
  }

  const ContentRow = ({ content, showActions = true }) => {
    const Icon = typeIcon[content.content_type] || Package;
    const color = typeColor[content.content_type] || 'from-slate-500 to-slate-600';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="border-slate-200 hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 truncate">{content.title}</h3>
                  {content.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500" />Featured
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><School className="h-3 w-3" />{content.school_name}</span>
                  <span>•</span>
                  <span>{content.subject}</span>
                  <span>•</span>
                  <span className="capitalize">{content.level?.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span>{content.is_free ? 'Free' : `KES ${content.price}`}</span>
                  <span>•</span>
                  <span className="capitalize">{content.visibility?.replace(/_/g, ' ')}</span>
                </div>
                {content.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{content.description}</p>
                )}
              </div>
              {showActions ? (
                <div className="flex flex-wrap gap-2">
                  {content.file_url && (
                    <a href={content.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />Preview
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(content)}
                    disabled={actioning === content.id}
                  >
                    {actioning === content.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => handleApprove(content, true)}
                    disabled={actioning === content.id}
                  >
                    <Star className="h-3 w-3 mr-1" />Feature
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleReject(content)}
                    disabled={actioning === content.id}
                  >
                    <XCircle className="h-3 w-3 mr-1" />Reject
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleFeatured(content)}
                    disabled={actioning === content.id}
                  >
                    <Star className={`h-3 w-3 mr-1 ${content.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    {content.is_featured ? 'Unfeature' : 'Feature'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Moderation</h1>
            <p className="text-slate-500">Review and approve shared content before it appears in the marketplace</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border-yellow-200 bg-yellow-50 text-center p-4">
          <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-sm text-slate-600 mt-1">Awaiting Review</p>
        </Card>
        <Card className="border-green-200 bg-green-50 text-center p-4">
          <p className="text-3xl font-bold text-green-600">{approved.length}</p>
          <p className="text-sm text-slate-600 mt-1">Published</p>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending Review
            {pending.length > 0 && <Badge className="ml-2 bg-yellow-500">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Published ({approved.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>All caught up! No content waiting for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(c => <ContentRow key={c.id} content={c} showActions />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approved.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No approved content yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map(c => <ContentRow key={c.id} content={c} showActions={false} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
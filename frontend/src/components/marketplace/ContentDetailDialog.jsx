import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Star, Download, School, Calendar, User, 
  CheckCircle, Lock, Loader2, MessageSquare, ThumbsUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function ContentDetailDialog({ content, open, onClose, hasAccess, user, profile, onAccessGranted }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [gettingAccess, setGettingAccess] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', review_text: '' });

  useEffect(() => {
    if (content?.id) {
      loadReviews();
    }
  }, [content?.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const contentReviews = await base44.entities.ContentReview.filter(
        { content_id: content.id },
        '-created_date',
        20
      );
      setReviews(contentReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleGetAccess = async () => {
    if (!user) {
      toast.error('Please sign in to access content');
      return;
    }

    setGettingAccess(true);
    try {
      await base44.entities.ContentAccess.create({
        content_id: content.id,
        accessor_type: profile?.type || 'student',
        accessor_id: profile?.data?.id || user.id,
        school_id: profile?.data?.school_id,
        access_granted_at: new Date().toISOString(),
        access_type: content.is_free ? 'free' : 'purchased',
        amount_paid: content.is_free ? 0 : content.price
      });

      // Update download count
      await base44.entities.SharedContent.update(content.id, {
        total_downloads: (content.total_downloads || 0) + 1
      });

      toast.success('Access granted! You can now download this content.');
      onAccessGranted?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get access');
    } finally {
      setGettingAccess(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !hasAccess) {
      toast.error('You must have access to this content to leave a review');
      return;
    }

    if (!newReview.rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      await base44.entities.ContentReview.create({
        content_id: content.id,
        reviewer_id: user.id,
        reviewer_name: profile?.data?.full_name || user.full_name,
        reviewer_school: profile?.data?.school_code,
        reviewer_role: profile?.type || 'student',
        rating: newReview.rating,
        title: newReview.title,
        review_text: newReview.review_text,
        is_verified_purchase: true
      });

      // Update average rating
      const allReviews = [...reviews, { rating: newReview.rating }];
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await base44.entities.SharedContent.update(content.id, {
        average_rating: Math.round(avgRating * 10) / 10,
        total_ratings: allReviews.length
      });

      toast.success('Review submitted!');
      setNewReview({ rating: 5, title: '', review_text: '' });
      loadReviews();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const ratingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      dist[Math.round(r.rating)] = (dist[Math.round(r.rating)] || 0) + 1;
    });
    return dist;
  };

  if (!content) return null;

  const dist = ratingDistribution();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="capitalize">{content.content_type?.replace('_', ' ')}</Badge>
                <Badge variant="outline">{content.subject}</Badge>
                <Badge variant="outline" className="capitalize">{content.level?.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <School className="h-4 w-4" />
                  {content.school_name}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {content.author_name || 'Unknown'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {renderStars(Math.round(content.average_rating || 0))}
                <span className="font-medium">{(content.average_rating || 0).toFixed(1)}</span>
              </div>
              <p className="text-sm text-slate-500">
                {content.total_ratings || 0} reviews • {content.total_downloads || 0} downloads
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-slate-600">{content.description || 'No description provided'}</p>
          </div>

          {/* Preview */}
          {content.preview_text && (
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Preview</h4>
                <p className="text-slate-600 text-sm">{content.preview_text}</p>
              </CardContent>
            </Card>
          )}

          {/* Access Button */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div>
              {content.is_free ? (
                <p className="text-lg font-bold text-emerald-600">Free</p>
              ) : (
                <p className="text-lg font-bold text-slate-900">KES {content.price?.toLocaleString()}</p>
              )}
              <p className="text-sm text-slate-500">One-time access</p>
            </div>
            
            {hasAccess ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  You have access
                </Badge>
                {content.file_url && (
                  <a href={content.file_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <Button 
                onClick={handleGetAccess}
                disabled={gettingAccess}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {gettingAccess ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : content.is_free ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                {content.is_free ? 'Get Free Access' : 'Purchase Access'}
              </Button>
            )}
          </div>

          {/* Reviews Section */}
          <Tabs defaultValue="reviews">
            <TabsList>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              {hasAccess && <TabsTrigger value="write">Write Review</TabsTrigger>}
            </TabsList>

            <TabsContent value="reviews" className="mt-4 space-y-4">
              {/* Rating Summary */}
              {reviews.length > 0 && (
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex gap-8">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-slate-900">{(content.average_rating || 0).toFixed(1)}</p>
                        {renderStars(Math.round(content.average_rating || 0))}
                        <p className="text-sm text-slate-500 mt-1">{reviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm w-3">{star}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <Progress 
                              value={reviews.length ? (dist[star] / reviews.length) * 100 : 0} 
                              className="flex-1 h-2"
                            />
                            <span className="text-sm text-slate-500 w-8">{dist[star]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review List */}
              {loadingReviews ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <Card key={review.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.reviewer_name}</span>
                              {review.is_verified_purchase && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{review.reviewer_role} • {review.reviewer_school}</p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        {review.title && <p className="font-medium mb-1">{review.title}</p>}
                        <p className="text-slate-600 text-sm">{review.review_text}</p>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                          <button className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            Helpful ({review.helpful_votes || 0})
                          </button>
                          <span className="text-xs text-slate-400">
                            {new Date(review.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {hasAccess && (
              <TabsContent value="write" className="mt-4">
                <Card className="border-slate-200">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Rating</label>
                      {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Review Title (optional)</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                        placeholder="Summarize your review"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review</label>
                      <Textarea
                        value={newReview.review_text}
                        onChange={(e) => setNewReview({...newReview, review_text: e.target.value})}
                        placeholder="Share your experience with this content..."
                        rows={4}
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="w-full"
                    >
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
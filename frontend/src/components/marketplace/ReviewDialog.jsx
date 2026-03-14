import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ReviewDialog({ open, onClose, content, user, profile, existingReviews, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.ContentReview.create({
        content_id: content.id,
        reviewer_id: user.id,
        reviewer_name: profile?.data?.full_name || user.full_name,
        reviewer_school: profile?.data?.school_code || profile?.data?.school_name,
        reviewer_role: profile?.type === 'school_admin' ? 'school_admin' : profile?.type || 'student',
        rating,
        title,
        review_text: reviewText,
        is_verified_purchase: true
      });

      // Recalculate average rating
      const allRatings = [...(existingReviews || []).map(r => r.rating), rating];
      const avg = allRatings.reduce((s, r) => s + r, 0) / allRatings.length;
      await base44.entities.SharedContent.update(content.id, {
        average_rating: Math.round(avg * 10) / 10,
        total_ratings: allRatings.length
      });

      toast.success('Review submitted!');
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription className="line-clamp-1">{content?.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-slate-500">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || rating]}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Review Title</Label>
            <Input
              placeholder="Summarize your experience..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Your Review</Label>
            <Textarea
              placeholder="Tell others what you liked or didn't like about this content..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
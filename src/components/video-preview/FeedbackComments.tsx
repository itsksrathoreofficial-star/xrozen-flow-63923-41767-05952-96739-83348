import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, XCircle, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FeedbackCommentsProps {
  feedback: any[];
  currentTime: number;
  onAddFeedback: (comment: string, timestamp?: number) => void;
  onSeekToTimestamp: (seconds: number) => void;
  onResolveFeedback: (feedbackId: string, resolved: boolean) => void;
}

export const FeedbackComments = ({
  feedback,
  currentTime,
  onAddFeedback,
  onSeekToTimestamp,
  onResolveFeedback
}: FeedbackCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [useCurrentTime, setUseCurrentTime] = useState(true);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    onAddFeedback(
      newComment,
      useCurrentTime ? currentTime : undefined
    );
    setNewComment("");
  };

  return (
    <Card className="shadow-elegant h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback & Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Add Feedback</label>
            {useCurrentTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(currentTime)}
              </Badge>
            )}
          </div>
          <Textarea
            placeholder="Type your feedback here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useCurrentTime}
                onChange={(e) => setUseCurrentTime(e.target.checked)}
                className="rounded border-gray-300"
              />
              Use current timestamp
            </label>
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!newComment.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Add Feedback
          </Button>
        </div>

        <Separator />

        {/* Feedback List */}
        <div>
          <h4 className="text-sm font-medium mb-3">
            All Feedback ({feedback.length})
          </h4>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {feedback.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No feedback yet. Be the first to add!
                </p>
              ) : (
                feedback.map((item) => (
                  <Card
                    key={item.id}
                    className={`${
                      item.is_resolved
                        ? "border-success/30 bg-success/5"
                        : "border-border"
                    }`}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        {item.timestamp_seconds !== null && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSeekToTimestamp(item.timestamp_seconds)}
                            className="px-2 h-6 text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(item.timestamp_seconds)}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onResolveFeedback(item.id, !item.is_resolved)
                          }
                          className="px-2 h-6"
                        >
                          {item.is_resolved ? (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm">{item.comment_text}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        {item.is_resolved && (
                          <Badge variant="outline" className="text-xs bg-success/10">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

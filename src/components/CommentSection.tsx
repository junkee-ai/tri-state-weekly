"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CommentSection({ eventId }: { eventId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments and check if user is logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchComments();
  }, [eventId]);

  async function fetchComments() {
    // We use a cool Supabase trick here: 'profiles(username)' fetches the username linked to the user_id!
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);

    const { error } = await supabase.from("comments").insert([
      { event_id: eventId, user_id: user.id, content: newComment.trim() }
    ]);

    if (error) {
      alert("Error posting comment: " + error.message);
    } else {
      setNewComment(""); // Clear the box
      fetchComments(); // Reload the comments instantly
    }
    
    setIsSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Delete your comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) fetchComments();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="mt-12 pt-8 border-t border-surface-border">
      <h3 className="text-2xl font-bold text-foreground mb-6">Community Chatter</h3>

      {/* --- COMMENT INPUT BOX --- */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 relative">
          <textarea 
            rows={3} 
            placeholder="What do you think about this event?" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-surface border border-surface-border rounded-xl p-4 text-sm focus:outline-none focus:border-neon-cyan pr-24"
          ></textarea>
          <button 
            type="submit" 
            disabled={isSubmitting || !newComment.trim()}
            className="absolute bottom-3 right-3 bg-neon-cyan hover:bg-neon-cyan/80 text-black text-xs font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "..." : "Post"}
          </button>
        </form>
      ) : (
        <div className="bg-surface border border-surface-border p-6 rounded-xl mb-8 text-center">
          <p className="text-foreground/60 text-sm">You must be logged in to join the conversation.</p>
        </div>
      )}

      {/* --- THE COMMENTS LIST --- */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-foreground/50 text-sm italic">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-surface/50 border border-surface-border/50 p-4 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-desert-orange/20 flex items-center justify-center text-desert-orange font-bold text-xs">
                    {/* Just grab the first letter of their username for a cool avatar! */}
                    {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neon-cyan">{comment.profiles?.username || "Unknown User"}</p>
                    <p className="text-[10px] text-foreground/40">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
                
                {/* Delete button only shows if the logged-in user wrote the comment */}
                {user && user.id === comment.user_id && (
                  <button onClick={() => handleDelete(comment.id)} className="text-[10px] text-red-500/50 hover:text-red-500 transition-colors uppercase font-bold">
                    Delete
                  </button>
                )}
              </div>
              <p className="text-foreground/90 text-sm pl-10 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
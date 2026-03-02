import { useState, useEffect, useCallback } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { CommentsService } from '../../services/comments.service';
import { useAuth } from '../../hooks/useAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Comment = any;

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    CONSULTANT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function CommentsSection({ projectId }: { projectId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [posting, setPosting] = useState(false);
    const { user } = useAuth();

    const loadComments = useCallback(async () => {
        try {
            const data = await CommentsService.getProjectComments(projectId);
            setComments(data);
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || posting) return;

        setPosting(true);
        setError(null);
        try {

            await CommentsService.addProjectComment(projectId, body.trim());


            // Optimistically add the comment
            const optimistic: Comment = {
                id: `temp-${Date.now()}`,
                body: body.trim(),
                created_at: new Date().toISOString(),
                author: {
                    full_name: user?.full_name || 'You',
                    role: user?.role || 'ADMIN'
                }
            };
            setComments(prev => [optimistic, ...prev]);
            setBody('');
        } catch (err: unknown) {
            console.error('Failed to post comment', err);
            const message = err instanceof Error ? err.message : (err as { message?: string })?.message || 'Failed to post comment';
            setError(message);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="glass-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
                    {comments.length > 0 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                            {comments.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                            {user?.full_name ? getInitials(user.full_name) : 'U'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Add a comment..."
                            rows={2}
                            className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none"
                        />
                        <div className="flex items-center justify-between mt-2">
                            {error && (
                                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
                            )}
                            <div className="ml-auto">
                                <button
                                    type="submit"
                                    disabled={!body.trim() || posting}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {posting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to add one!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment: Comment) => {
                        const authorName = comment.author?.full_name || 'Unknown';
                        const authorRole = comment.author?.role || '';
                        const badgeColor = roleBadgeColors[authorRole] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';

                        return (
                            <div key={comment.id} className="flex space-x-3 group">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                        {getInitials(authorName)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{authorName}</span>
                                        {authorRole && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                                                {authorRole}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {timeAgo(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {comment.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

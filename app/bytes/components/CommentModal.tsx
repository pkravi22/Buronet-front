import React, { useState, useEffect, useCallback } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import type { Comment } from '@/lib/types/Byte';
import { toast } from 'react-hot-toast';
import { get, postApi as post } from '@/lib/api';

interface CommentModalProps {
  byteId: string;
  authorName: string;
  onClose: () => void;
}

const CommentModal = ({ byteId, authorName, onClose }: CommentModalProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await get<Comment[]>(`/bytes/${byteId}/Comments`);
            setComments(data);
        } catch (error) {
            toast.error("Failed to fetch comments.");
        } finally {
            setIsLoading(false);
        }
    }, [byteId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await post(`/bytes/${byteId}/Comments`, { text: newComment });
            setNewComment("");
            toast.success("Comment posted!");
            fetchComments();
        } catch (error) {
            toast.error("Failed to post comment.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end" onClick={onClose}>
            <div className="bg-white w-full max-w-lg h-[70vh] rounded-t-2xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
                <div className="text-center text-black font-bold relative pb-4 border-b">
                    <span>Comments</span>
                    <button onClick={onClose} className="absolute right-0 top-0 text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                        </div>
                     ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 my-4">
                                <img src={comment.creator.pic || `https://i.pravatar.cc/150?u=${comment.creator.id}`} alt={comment.creator.name} className="w-9 h-9 rounded-full bg-gray-200" />
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-700">{comment.creator.name}</p>
                                    <p className="text-sm text-gray-800">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <form onSubmit={handlePostComment} className="flex gap-2 border-t pt-4">
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none text-black" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 flex items-center justify-center transition-colors">
                        <Send size={18}/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;


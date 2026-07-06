"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Heart, MessageCircle, Send, X, Bookmark, Music, UserPlus, Play, Pause, Loader2 } from 'lucide-react';
import { get, postApi, } from '@/lib/api'; // Assume these are helper functions for API calls
import { console } from 'inspector';
import { useAuth } from '@/context/AuthContext';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';

// --- API Helper Functions ---
// In your real app, these would be in a separate file (e.g., lib/api.ts)
// and would use your authentication context to send tokens.
// const API_BASE_URL = 'https://localhost:44381/api'; // Replace with your actual API URL

// const api = {
//   get: async (endpoint: string) => {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       headers: { 'Authorization': `Bearer YOUR_AUTH_TOKEN` }
//     });
//     if (!response.ok) throw new Error('Network response was not ok');
//     return response.json();
//   },
//   post: async (endpoint: string, body?: any) => {
//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer YOUR_AUTH_TOKEN`,
//       },
//       body: body ? JSON.stringify(body) : null,
//     });
//     if (!response.ok) throw new Error('Network response was not ok');
//     return response.json();
//   }
// };


// --- Type Definitions (Matching Backend) ---
type SuggestionType = 'For You' | 'Connections' | 'Popular';

interface Creator {
    id: string;
    name: string;
    handle: string;
    pic: string;
}

interface Submission {
    title: string;
    description: string;
    mediaUrl: string;
    thumbnail: string;
}

interface Byte {
    id: string;
    creator: Creator;
    submission: Submission;
    tags: string[];
    likes: string[]; // Array of user IDs
    saves: string[]; // Array of user IDs
    commentCount: number;
}

interface Comment {
    id: string;
    creator: Creator;
    text: string;
    createdAt: string;
}

// --- Child Component: CommentSheet ---
const CommentSheet = ({ byteId, authorName, onClose, currentUserId: string }: { byteId: string, authorName: string, onClose: () => void, currentUserId: string }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        try {
            const data = await get<Comment[]>(`/bytes/${byteId}/Comments`);
            setComments(data);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
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
            await postApi(`/bytes/${byteId}/Comments`, { text: newComment });
            setNewComment("");
            fetchComments(); // Refresh comments after posting
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end" onClick={onClose}>
            <div className="bg-white w-full max-w-md h-[70vh] rounded-t-2xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
                <div className="text-center font-bold relative pb-4">
                    Comments from {authorName}
                    <button onClick={onClose} className="absolute right-0 top-0"><X /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <Loader2 className="animate-spin mx-auto mt-8" /> : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 my-4">
                                <img src={getProfileImageUrl(comment.creator.pic)} alt={comment.creator.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="text-xs text-gray-500">{comment.creator.name}</p>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <form onSubmit={handlePostComment} className="flex gap-2 border-t pt-4">
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-cyan-500" />
                    <button type="submit" className="bg-cyan-500 text-white rounded-full p-2"><Send /></button>
                </form>
            </div>
        </div>
    );
};

// --- Child Component: ByteCard ---
const ByteCard = ({ byte, isActive, onLike, onCommentClick, currentUserId }: { byte: Byte, isActive: boolean, onLike: (byteId: string) => void, onCommentClick: (byteId: string) => void, currentUserId: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isLiked = byte.likes.includes(currentUserId);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(error => console.error("Video play failed:", error));
            console.log("Playing video for byte ID:", byte.id);
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    const formatCount = (num: number) => num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

    return (
        <div className="relative h-full w-full bg-black snap-start" onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}>
            <video ref={videoRef} src={byte.submission.mediaUrl} loop muted className="w-full h-full object-cover" playsInline />
            {!isPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none"><Play size={64} className="text-white/80" /></div>}

            <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                <div className="flex items-end justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2 pointer-events-auto">
                            <img src={getProfileImageUrl(byte.creator.pic)} alt={byte.creator.name} className="w-10 h-10 rounded-full border-2 border-white" />
                            <div className="ml-3">
                                <p className="text-white font-semibold text-sm">{byte.creator.name}</p>
                                <p className="text-white/80 text-xs">{byte.creator.handle}</p>
                            </div>
                            <button className="ml-4 bg-white text-black px-3 py-1 rounded-md text-xs font-bold">Follow</button>
                        </div>
                        <p className="text-white text-sm mb-2">{byte.submission.description}</p>
                        <div className='flex flex-wrap gap-1.5 mb-2'>
                            {byte.tags.map(tag => <span key={tag} className="text-white text-xs bg-white/20 px-2 py-0.5 rounded">{tag}</span>)}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); onLike(byte.id); }} className="flex flex-col items-center">
                            <Heart size={32} className={`transition-all ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            <span className="text-white text-xs font-semibold mt-1">{formatCount(byte.likes.length)}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onCommentClick(byte.id); }} className="flex flex-col items-center">
                            <MessageCircle size={32} className="text-white" />
                            <span className="text-white text-xs font-semibold mt-1">{formatCount(byte.commentCount)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const BytesPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [bytes, setBytes] = useState<Byte[]>([]);
    const [activeByteId, setActiveByteId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<SuggestionType>('For You');
    const [isLoading, setIsLoading] = useState(true);
    const [commentingOn, setCommentingOn] = useState<{ byteId: string, authorName: string } | null>(null);
    const { user } = useAuth();

    // This would come from your AuthContext
    const currentUserId = user?.id;

    useEffect(() => {
        const fetchBytes = async () => {
            setIsLoading(true);
            try {
                // const data = await get(`/bytes/feed?filter=${activeFilter}`);
                const data = await get<Byte[]>(`/bytes`);
                console.log("Fetched bytes:", data);
                setBytes(data);
                if (data.length > 0) {
                    setActiveByteId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch bytes:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBytes();
    }, [activeFilter]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries.find(e => e.isIntersecting);
                if (entry) {
                    const byteId = entry.target.getAttribute('data-byte-id');
                    setActiveByteId(byteId);
                }
            },
            { root: null, threshold: 0.7 }
        );

        const elements = containerRef.current?.querySelectorAll('[data-byte-id]');
        if (elements) elements.forEach(el => observer.observe(el));
        return () => elements?.forEach(el => observer.unobserve(el));
    }, [bytes]);

    const handleLike = (byteId: string) => {
        // Optimistic update
        setBytes(prevBytes => prevBytes.map(b => {
            if (b.id === byteId) {
                // THIS IS THE FIX: First, ensure currentUserId is not undefined.
                if (typeof currentUserId === 'undefined') {
                    // If there's no user, don't change anything.
                    return b;
                }

                const isLiked = b.likes.includes(currentUserId);
                const newLikes = isLiked
                    ? b.likes.filter(id => id !== currentUserId)
                    // Now, TypeScript knows currentUserId is a string here.
                    : [...b.likes, currentUserId];

                return { ...b, likes: newLikes };
            }
            return b;
        }));
        // API call
        postApi(`/bytes/${byteId}/Like`, {}).catch(err => {
            console.error("Failed to toggle like:", err);
            // Revert on error if needed
        });
    };

    return (
        <>
            <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            <div className="h-screen bg-black relative flex justify-center">
                {/* <div className="absolute top-0 left-0 right-0 z-10 pt-4 bg-gradient-to-b from-black/50 to-transparent flex justify-center">
                    {(['For You', 'Connections', 'Popular'] as SuggestionType[]).map(f => (
                        <button key={f} onClick={() => setActiveFilter(f)} className={`font-semibold pb-2 mx-4 transition-all ${activeFilter === f ? 'text-white border-b-2' : 'text-white/60'}`}>{f}</button>
                    ))}
                </div> */}

                <div ref={containerRef} className="h-full w-full max-w-md snap-y snap-mandatory overflow-y-scroll no-scrollbar">
                    {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div> :
                        bytes.map((byte) => (
                            <div key={byte.id} className="h-full w-full" data-byte-id={byte.id}>
                                <ByteCard byte={byte} isActive={activeByteId === byte.id} onLike={handleLike} onCommentClick={(id) => setCommentingOn({ byteId: id, authorName: byte.creator.name })} currentUserId={typeof currentUserId !== "undefined" ? currentUserId : ""} />
                            </div>
                        ))
                    }
                </div>
                {commentingOn && <CommentSheet byteId={commentingOn.byteId} authorName={commentingOn.authorName} onClose={() => setCommentingOn(null)} currentUserId={typeof currentUserId !== "undefined" ? currentUserId : ""} />}
            </div>
        </>
    );
};

export default BytesPage;


"use client";

import { useEffect, useState, useCallback } from "react";
import Video from "./Video";
import type { Byte, SuggestionType, Comment } from "@/lib/types/Byte";
import { styled } from "styled-components";
import { toast } from "react-hot-toast";
import CommentModal from "./CommentModal";
import { Loader2 } from "lucide-react";
import { postApi as post } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import InfiniteScroll from "react-infinite-scroll-component";
import { usePaginatedBytes } from "@/lib/hooks/usePaginatedBytes";

const VideoListStyled = styled.div`
  display: grid;
  place-items: center;
  min-height: 80vh;
  max-height: 80vh;
  .video-list {
    display: grid;
    place-items: center;
    gap: 1rem;
    scroll-snap-type: y mandatory;
    max-height: calc(100vh - 4rem);
    @media (min-width: 768px) {
      & {
        gap: 2rem;
      }
    }
    & > div:first-child {
      margin-top: 1rem;
    }
    & .video {
      scroll-snap-align: center;
    }
  }
`;

const VideoList = () => {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mute, setMute] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<SuggestionType>('For You');
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const MOCK_CURRENT_USER_ID = user?.id || "mock-current-user-id";
  
  const [commentModalState, setCommentModalState] = useState<{isOpen: boolean; byte: Byte | null}>({ isOpen: false, byte: null });

  const { bytes, isLoading, hasMore, loadMore, reset, updateByte } = usePaginatedBytes(activeFilter);

  // Initial load when filter changes
  useEffect(() => {
    setInitialLoading(true);
    reset();
    loadMore().finally(() => setInitialLoading(false));
  }, [activeFilter, reset, loadMore]);
  
  const handleLike = async (byteId: string) => {
    // Find the byte and update it optimistically
    const byteIndex = bytes.findIndex(b => b.id === byteId);
    if (byteIndex === -1) return;

    const byte = bytes[byteIndex];
    const isLiked = byte.likes.includes(MOCK_CURRENT_USER_ID);
    const newLikes = isLiked
      ? byte.likes.filter(id => id !== MOCK_CURRENT_USER_ID)
      : [...byte.likes, MOCK_CURRENT_USER_ID];

    // Optimistic update
    updateByte(byteId, { likes: newLikes });

    try {
      await post(`/bytes/${byteId}/Like`, {});
    } catch (error) {
      toast.error("Status 'placuit' non potuit renovari.");
      // Revert on error
      updateByte(byteId, { likes: byte.likes });
    }
  };

  const handleCommentClick = (byteId: string) => {
    const byteToComment = bytes.find(b => b.id === byteId);
    if (byteToComment) setCommentModalState({ isOpen: true, byte: byteToComment });
  };
  
  const handleCloseCommentModal = (refresh: boolean) => {
    setCommentModalState({ isOpen: false, byte: null });
    if(refresh) {
      // Refresh
    }
  }

  const filters: SuggestionType[] = ['For You', 'Connections', 'Popular'];

  return (
    <>
       <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div id="bytes-scroll-container" className="relative w-full h-full overflow-hidden flex justify-center">
        {/* <div className="absolute top-4 left-0 right-0 z-10 flex justify-center">
            <div className="flex items-center space-x-4 bg-black/20 backdrop-blur-md p-1 rounded-full">
                {filters.map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`font-semibold px-4 py-1.5 rounded-full text-sm transition-colors duration-200 ${activeFilter === filter ? 'text-white bg-black' : 'text-black/80'}`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div> */}
        
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
          </div>
        ) : bytes.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-500">
             <p className="text-xl font-semibold">No bytes available</p>
             <p className="mt-2">There are no bytes to show in &quot;{activeFilter}&quot;.</p>
           </div>
        ) : (
          <InfiniteScroll
              dataLength={bytes.length}
              next={loadMore}
              hasMore={hasMore}
              scrollableTarget="bytes-scroll-container"
              height="100%"
              loader={<div className="h-24 flex justify-center items-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
              className="snap-y snap-mandatory scrollbar-hide"
              endMessage={
                  <p style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
                    <b>Omnia vidisti!</b>
                  </p>
              }
            >
            {bytes.map((byte) => (
                <div
                  key={byte.id}
                  className="h-full w-full snap-start flex justify-center items-center"
                >
                  <Video
                    byte={byte}
                    mute={mute}
                    link={byte.submission.mediaUrl}
                    setMute={setMute}
                    playingVideo={playingVideoId}
                    setPlayingVideo={setPlayingVideoId}
                    onLike={handleLike}
                    onCommentClick={handleCommentClick}
                    currentUserId={MOCK_CURRENT_USER_ID}
                  />
                </div>
            ))}
          </InfiniteScroll>
        )}
        
        {commentModalState.isOpen && commentModalState.byte && (
            <CommentModal 
                byteId={commentModalState.byte.id}
                authorName={commentModalState.byte.creator.name}
                onClose={() => handleCloseCommentModal(true)}
            />
        )}
      </div>
    </>
  );
};

export default VideoList;


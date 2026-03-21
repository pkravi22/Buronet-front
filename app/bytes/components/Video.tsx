import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import type { Byte } from "@/lib/types/Byte"; // Updated to use the new Byte type
import {
  IoMdPause,
  IoMdPlay,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import { getProfileImageUrl } from '@/lib/helpers/profileImage';
import { useAuth } from '@/context/AuthContext';
import { postApi } from '@/lib/api';

type reportResponse = {
  success: boolean;
}

const VideoStyled = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  height: 100%;
  cursor: pointer;

  /* ================= VIDEO CONTAINER ================= */
  .video {
    position: relative;
    top: 0;
    width: 100%;
    margin-top: 0;
    height: 100%;
    max-height: 100%;
    aspect-ratio: 9 / 16;
    border-radius: 1rem;
    overflow: hidden;
    background: black;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media screen and (min-width: 1024px) and (max-width: 1200px) {
      height: calc(100vh - 0.5rem - 5rem - 3rem);
      width: auto;
      margin-bottom: 0;
    }
    @media screen and (max-width: 1023px) {
      height: 100%;
      margin-bottom: 0;
    }
    @media screen and (max-width: 600px) {
      width: 90% !important;
      margin-left: auto;
      margin-right: auto;
      height: 100%;
      margin-bottom: 0;
    }
    @media screen and (min-width: 1600px) {
      height: calc(((100vh/1.25) - 4rem));
    }
    @media screen and (min-width: 2160px) {
      height: calc(((100vh/1.45) - 4rem));
    }
  }

  /* ================= FULLSCREEN VIDEO ================= */
  .video.fullscreen {
    position: fixed;
    inset: 0;
    width: auto;
    height: 100%;
    max-height: 100%;
    margin: auto;
    border-radius: 0;
    aspect-ratio: 9 / 16;
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ================= TOP ACTIONS ================= */
  .video-actions {
    position: absolute;
    inset: 0 0 auto 0;
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;

    button {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: rgb(var(--light-color));
      transition: background 0.15s;

      &:hover {
        background: rgb(var(--light-color) / 0.25);
      }

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }

  /* ================= VIDEO DETAILS ================= */
  .video-details {
    position: absolute;
    inset: auto 0 0 0;
    padding: 0 3rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: linear-gradient(
      0deg,
      rgba(var(--dark-color) / 0.8),
      rgba(var(--dark-color) / 0)
    );

    p {
      font-size: 0.9rem;
      color: rgb(var(--light-color));
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .creator-details {
      display: flex;
      align-items: center;
      gap: 1rem;

      img {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        object-fit: cover;
      }

      button {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background: rgb(var(--primary-color));
        color: white;
      }
    }
  }

  /* ================= RIGHT ACTIONS ================= */
  .buttons {
    position: absolute;
    right: 0;
    bottom: 0;
    padding: 2rem 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    > div {
      text-align: center;

      span {
        display: block;
        font-size: 0.75rem;
        color: rgb(var(--light-color));
      }

      &.like .liked {
        color: rgb(var(--like-color));
      }
    }

    button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: rgb(var(--light-color));
      transition: background 0.15s;

      &:hover {
        background: rgb(var(--light-color) / 0.25);
      }

      svg {
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    &.hidden {
      display: none;
    }
  }

  /* Hide buttons in fullscreen mode */
  .video.fullscreen ~ .buttons {
    display: none;
  }
`;


// Props are updated to handle interactions from the parent
const Video = ({
  byte,
  mute,
  link,
  setMute,
  playingVideo,
  setPlayingVideo,
  onLike,
  onCommentClick,
  currentUserId,
}: {
  byte: Byte;
  mute: boolean;
  link: string;
  setMute: React.Dispatch<React.SetStateAction<boolean>>;
  playingVideo: string | null;
  setPlayingVideo: React.Dispatch<React.SetStateAction<string | null>>;
  onLike: (byteId: string) => void;
  onCommentClick: (byteId: string) => void;
  currentUserId: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [play, setPlay] = useState(byte.id === playingVideo);
  const isLiked = byte.likes.includes(currentUserId);
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const { user } = useAuth();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  const handleSubmitReport = async () => {
    if (isReporting) return;
    setIsReporting(true);
    try {
      const response: reportResponse = await postApi('/posts/report-byte', {
          postId: byte.id,
          postUrl: byte.submission.mediaUrl,
          message: reportMessage,
          reporter: user
            ? { id: user.id, email: user.email, username: user.username }
            : undefined,
      });

      if (!response.success) {
        throw new Error('Failed to send report');
      }

      setIsReportModalOpen(false);
      setReportMessage('');
      toast.success('Report sent. Thanks for helping keep Buronet safe.');
    } catch (err: any) {
      console.error('Report failed:', err);
      toast.error(err?.message || 'Failed to send report');
    } finally {
      setIsReporting(false);
    }
  };

  // Custom SVG Icons
  const LikeIcon = ({ filled }: { filled: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  const CommentIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  const ShareIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );

  const ReportIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          setPlayingVideo(byte.id);
        } else {
          setPlay(false);
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [byte.id, setPlayingVideo]);

  useEffect(() => {
    if (!videoRef.current) return;
    play && playingVideo === byte.id
      ? videoRef.current.play().catch(() => {})
      : videoRef.current.pause();
  }, [play, playingVideo, byte.id]);

  const formatCount = (n: number) =>
    n > 999 ? `${(n / 1000).toFixed(1)}k` : n;

    const handleProfileClick = (refLink: string | undefined) => {
    if (!refLink) return;
    
    // Remove any leading slash from the prop, then add one back
    const cleanPath = "/profile/" + (refLink.startsWith('/') ? refLink.slice(1) : refLink);
    router.push(cleanPath);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isFullscreen]);

  return (
    <>
    {isFullscreen && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9997,
        }}
        onClick={() => {
          setIsFullscreen(false);
          document.body.style.overflow = '';
        }}
      />
    )}
    <VideoStyled>
      <div className={`video ${isFullscreen ? 'fullscreen' : ''}`}>
        <video
          ref={videoRef}
          src={byte.submission.mediaUrl}
          poster={byte.submission.thumbnail}
          id={byte.id}
          loop
          muted={mute}
          onClick={() => setPlay(!play)}
        />

        <div className="video-actions">
          <button onClick={(e) => { e.stopPropagation(); setPlay(!play); }}>
            {play ? <IoMdPause /> : <IoMdPlay />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setMute(!mute); }}>
            {mute ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}>
            {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          </button>
        </div>

        <div className="video-details">
          <div className="creator-details">
            <img src={getProfileImageUrl(byte.creator.pic)} alt={byte.creator.name} />
            <p onClick={() => handleProfileClick(byte.creator.id)}>{byte.creator.name}</p>
          </div>
          <p>{byte.submission.title}</p>
          <p>{byte.submission.description}</p>
        </div>

        <div className={`buttons ${isFullscreen ? 'hidden' : ''}`}>
          <div className="like">
            <button
              className={isLiked ? "liked" : ""}
              onClick={() => onLike(byte.id)}
            >
              <LikeIcon filled={isLiked} />
            </button>
            <span>{formatCount(byte.likes.length)}</span>
          </div>

          <div>
            <button onClick={() => onCommentClick(byte.id)}>
              <CommentIcon />
            </button>
            <span>{formatCount(byte.commentCount)}</span>
          </div>

          <div>
            <button onClick={() => setIsShareModalOpen(true)}>
              <ShareIcon />
            </button>
            <span>Share</span>
          </div>

          <div>
            <button onClick={() => setIsReportModalOpen(true)}>
              <ReportIcon />
            </button>
            <span>Report</span>
          </div>
        </div>
      </div>
    </VideoStyled>
    {/* SHARE MODAL */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Share this Byte</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                aria-label="Close share modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                <input
                  type="text"
                  readOnly
                  value={link}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReportModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Report Byte</h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded hover:bg-gray-100 text-gray-600"
                aria-label="Close report modal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-3">
              <p className="text-sm text-gray-600">
                This will email our moderators with the byte link automatically.
              </p>
              <textarea
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="w-full text-black bg-transparent min-h-[120px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add details (what's wrong with this byte?)"
                disabled={isReporting}
              />
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                disabled={isReporting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                disabled={isReporting}
              >
                {isReporting ? 'Sending…' : 'Send Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Video;


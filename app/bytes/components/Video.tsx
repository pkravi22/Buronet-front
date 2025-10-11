import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import type { Byte } from "@/lib/types"; // Updated to use the new Byte type
import { RiShareForwardFill } from "react-icons/ri";
import { FaThumbsUp } from "react-icons/fa";
import { MdInsertComment } from "react-icons/md";
import {
  IoMdPause,
  IoMdPlay,
  IoMdVolumeHigh,
  IoMdVolumeOff,
} from "react-icons/io";
import { toast } from "react-hot-toast";

const VideoStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  gap: 1rem;
  height: calc(100vh - 4rem);
  .video {
    height: 90%;
    aspect-ratio: 9 / 16;
    position: relative;
    border-radius: 1rem;
    max-width: calc(100vw - 2.5rem);
    overflow: hidden;
    video {
      height: 100%;
      min-width: 100%;
      object-fit: cover;
    }
    .video-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      button {
        border-radius: 50%;
        width: 2.5rem;
        height: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgb(var(--light-color));
        transition: 0.15s;
        &:hover {
          background: rgb(var(--light-color) / 0.25);
        }
        svg {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
    }
    .video-details {
      position: absolute;
      bottom: 0;
      left: 0;
      right:0;
      padding: 0 3rem 1rem 1rem;
      background: linear-gradient(
        0deg,
        rgba(var(--dark-color) / 0.8) 0%,
        rgba(var(--dark-color) / 0) 100%
      );
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 0.75rem;
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
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          background: rgb(var(--primary-color));
        }
      }
    }
    .buttons {
      position: absolute;
      bottom: 0;
      right: 0;
      padding: 2rem 0.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      & > div {
        & span {
          display: block;
          font-size: 0.75rem;
          color: rgb(var(--light-color));
          text-align: center;
        }
        &.like {
          & button.liked {
            color: rgb(var(--like-color));
          }
        }
      }
      button {
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgb(var(--light-color));
        transition: 0.15s;
        &:hover {
          background: rgb(var(--light-color) / 0.25);
        }
        svg {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
    }
  }
`;

// Props are updated to handle interactions from the parent
const Video = ({
  byte,
  mute,
  setMute,
  playingVideo,
  setPlayingVideo,
  onLike,
  onCommentClick,
  currentUserId,
}: {
  byte: Byte;
  mute: boolean;
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
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPlay(true);
            setPlayingVideo(entry.target.id);
          } else {
            setPlay(false);
          }
        });
      },
      { threshold: 0.7 }
    );
    if (currentVideoRef) observer.observe(currentVideoRef);
    return () => {
      if (currentVideoRef) observer.unobserve(currentVideoRef);
    };
  }, [playingVideo, setPlayingVideo]);

  useEffect(() => {
    if (play && playingVideo === byte.id) {
      videoRef.current?.play().catch(e => console.error("Autoplay was prevented.", e));
    } else {
      videoRef.current?.pause();
    }
  }, [play, playingVideo, byte.id]);

  const formatCount = (num: number) => num > 999 ? `${(num / 1000).toFixed(1)}k` : num;

  return (
    <VideoStyled>
      <div className="video selected">
        <video
          className="no-scrollbar"
          ref={videoRef}
          src={byte.submission.mediaUrl}
          poster={byte.submission.thumbnail}
          id={byte.id}
          loop
          onClick={() => setPlay(!play)}
          muted={mute}
        />
        <div className="video-actions">
          <div className="play-pause">
            <button onClick={(e) => { e.stopPropagation(); setPlay(!play); }}>
              {play ? <IoMdPause /> : <IoMdPlay />}
            </button>
          </div>
          <div className="volume">
             <button onClick={(e) => { e.stopPropagation(); setMute(!mute); }}>
              {mute ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
            </button>
          </div>
        </div>
        <div className="video-details">
          <div className="creator-details">
            <img src={byte.creator.pic} alt={byte.creator.name} />
            <p>{byte.creator.name}</p>
            <button>Subscribe</button>
          </div>
          <p>{byte.submission.title}</p>
          <p>{byte.submission.description}</p>
        </div>
        <div className="buttons">
          <div className="like">
            <button
              title="I like this"
              onClick={() => onLike(byte.id)}
              aria-label="I like this"
              className={`like-button ${isLiked ? "liked" : ""}`}
            >
              <FaThumbsUp />
            </button>
            <span>{formatCount(byte.likes.length)}</span>
          </div>
          <div className="comment">
            <button
              title="Comment"
              aria-label="Comment"
              onClick={() => onCommentClick(byte.id)}
            >
              <MdInsertComment />
            </button>
            <span>{formatCount(byte.commentCount)}</span>
          </div>
          <div className="share">
            <button title="Share" onClick={handleShare} aria-label="Share">
              <RiShareForwardFill />
            </button>
            <span>Share</span>
          </div>
        </div>
      </div>
    </VideoStyled>
  );
};

export default Video;


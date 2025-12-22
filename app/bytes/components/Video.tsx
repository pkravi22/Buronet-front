import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import type { Byte } from "@/lib/types/Byte"; // Updated to use the new Byte type
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
  align-items: flex-start;
  gap: 1rem;
  height: 100%;
  cursor: pointer;

  /* ================= VIDEO CONTAINER ================= */
  .video {
    position: relative;
    top: 0;
    width: 100%;
    margin-top: 4rem;
    height: 80%;
    max-height: 100dvh;
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
      height: 70%;
      width: auto;
      margin-top: 5rem !important;
    }
    @media screen and (max-width: 600px) {
      width: 90% !important;
      margin-left: auto;
      margin-right: auto;
    }
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

  return (
    <VideoStyled>
      <div className="video">
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
              className={isLiked ? "liked" : ""}
              onClick={() => onLike(byte.id)}
            >
              <FaThumbsUp />
            </button>
            <span>{formatCount(byte.likes.length)}</span>
          </div>

          <div>
            <button onClick={() => onCommentClick(byte.id)}>
              <MdInsertComment />
            </button>
            <span>{formatCount(byte.commentCount)}</span>
          </div>

          <div>
            <button onClick={handleShare}>
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


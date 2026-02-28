"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artwork: {
    "150x150": string;
    "480x480": string;
    "1000x1000": string;
    mirrors?: string[];
  };
  user: {
    name: string;
  };
  duration: number;
  play_count: number;
}

function getArtworkWithMirror(artwork: Track["artwork"], size: "150x150" | "480x480" | "1000x1000", mirrorIndex: number): string | null {
  const url = artwork?.[size];
  if (!url) return null;

  if (mirrorIndex === 0) return url;

  const mirrors = artwork.mirrors;
  if (!mirrors || mirrorIndex > mirrors.length) return null;

  try {
    const parsed = new URL(url);
    const mirror = mirrors[mirrorIndex - 1];
    const mirrorHost = new URL(mirror).host;
    parsed.host = mirrorHost;
    return parsed.toString();
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatPlayCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function TrackArtwork({ artwork, alt, size = "150x150" }: { artwork: Track["artwork"]; alt: string; size?: "150x150" | "480x480" | "1000x1000" }) {
  const [mirrorIndex, setMirrorIndex] = useState(0);
  const maxMirrors = (artwork?.mirrors?.length || 0) + 1;

  const src = getArtworkWithMirror(artwork, size, mirrorIndex);

  if (!src || mirrorIndex >= maxMirrors) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover opacity-90 grayscale-[20%]"
      onError={() => {
        if (mirrorIndex < maxMirrors - 1) {
          setMirrorIndex(mirrorIndex + 1);
        }
      }}
    />
  );
}

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
      if (currentIndex < tracks.length - 1) {
        playTrack(tracks[currentIndex + 1].id);
      } else {
        setIsPlaying(false);
        setCurrentTrackId(null);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackId, tracks]);

  const playTrack = async (trackId: string) => {
    if (currentTrackId === trackId && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrackId === trackId && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
      return;
    }

    const streamUrl = `https://api.audius.co/v1/tracks/${trackId}/stream`;

    if (audioRef.current) {
      audioRef.current.src = streamUrl;
      audioRef.current.play();
      setCurrentTrackId(trackId);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  return (
    <>
      <audio ref={audioRef} />

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            onClick={() => playTrack(track.id)}
            className={`group flex cursor-pointer items-center gap-4 rounded px-3 py-3 transition-colors hover:bg-stone-700/50 ${
              currentTrackId === track.id ? "bg-stone-700/30" : ""
            }`}
          >
            <div className="relative w-5 text-right">
              {currentTrackId === track.id && isPlaying ? (
                <Pause className="h-4 w-4 text-stone-300" strokeWidth={1.5} />
              ) : currentTrackId === track.id ? (
                <Play className="h-4 w-4 text-stone-300" strokeWidth={1.5} />
              ) : (
                <>
                  <span className="block font-mono text-xs text-stone-600 group-hover:hidden">
                    {index + 1}
                  </span>
                  <Play className="hidden h-4 w-4 text-stone-400 group-hover:block" strokeWidth={1.5} />
                </>
              )}
            </div>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-stone-700">
              <TrackArtwork artwork={track.artwork} alt={track.title} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={`truncate text-sm ${
                currentTrackId === track.id ? "text-stone-100" : "text-stone-300 group-hover:text-stone-100"
              }`}>
                {track.title}
              </p>
              <p className="truncate text-xs text-stone-500">
                {track.user.name}
                <span className="mx-1.5 text-stone-600">·</span>
                <span>{formatPlayCount(track.play_count)} plays</span>
              </p>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {formatDuration(track.duration)}
            </span>
          </div>
        ))}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-stone-700 bg-[#262926]/95 backdrop-blur-sm">
          <div className="h-1 bg-stone-800">
            <div
              className="h-full bg-stone-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-6 py-3">
            <button
              onClick={() => playTrack(currentTrack.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-600 text-stone-300 transition-colors hover:border-stone-400 hover:text-stone-100"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Play className="h-4 w-4 ml-0.5" strokeWidth={1.5} />
              )}
            </button>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-stone-700">
              <TrackArtwork artwork={currentTrack.artwork} alt={currentTrack.title} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm text-stone-200">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-stone-500">
                {currentTrack.user.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * YouTube's embedded player, driven from React.
 *
 * The player is the official iframe embed — the video is never downloaded, the
 * channel keeps its views, and nothing here breaks YouTube's terms. All we do
 * is seek to a second and stop at another one.
 *
 * Stopping is the fiddly part: the player has no "play until" command, so the
 * position is polled and playback paused when the segment ends. A quarter of a
 * second is close enough that the learner hears the sentence and not the one
 * after it.
 */

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement | string, options: Record<string, unknown>) => YouTubePlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  destroy(): void;
}

let apiPromise: Promise<void> | null = null;

/** Loads YouTube's script once per page, however many players ask for it. */
function loadApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function useYouTube(videoId: string, mountId: string) {
  const player = useRef<YouTubePlayer | null>(null);
  const stopAt = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void loadApi().then(() => {
      if (cancelled || !window.YT) return;
      const mount = document.getElementById(mountId);
      if (!mount) return;

      player.current = new window.YT.Player(mount, {
        videoId,
        playerVars: {
          // No suggested videos at the end, no keyboard shortcuts stealing
          // the learner's keystrokes, no autoplay.
          rel: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => !cancelled && setReady(true),
          onStateChange: (event: { data: number }) => {
            if (!window.YT) return;
            setPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (timer.current) window.clearInterval(timer.current);
      player.current?.destroy();
      player.current = null;
    };
  }, [videoId, mountId]);

  const playSegment = useCallback((start: number, end: number) => {
    const instance = player.current;
    if (!instance) return;

    stopAt.current = end;
    instance.seekTo(start, true);
    instance.playVideo();

    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const current = player.current;
      if (!current || stopAt.current === null) return;
      if (current.getCurrentTime() >= stopAt.current) {
        current.pauseVideo();
        stopAt.current = null;
        if (timer.current) window.clearInterval(timer.current);
      }
    }, 250);
  }, []);

  const stop = useCallback(() => {
    stopAt.current = null;
    if (timer.current) window.clearInterval(timer.current);
    player.current?.pauseVideo();
  }, []);

  return { ready, playing, playSegment, stop };
}

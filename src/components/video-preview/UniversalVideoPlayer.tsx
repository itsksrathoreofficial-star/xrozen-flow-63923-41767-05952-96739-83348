import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface UniversalVideoPlayerProps {
  url: string;
  onTimeUpdate?: (time: number) => void;
}

export const UniversalVideoPlayer = forwardRef<any, UniversalVideoPlayerProps>(
  ({ url, onTimeUpdate }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [platform, setPlatform] = useState<string>("unknown");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = seconds;
        }
      }
    }));

    useEffect(() => {
      detectPlatform(url);
    }, [url]);

    const detectPlatform = (videoUrl: string) => {
      if (!videoUrl) {
        setPlatform("unknown");
        return;
      }

      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        setPlatform("youtube");
      } else if (videoUrl.includes("drive.google.com")) {
        setPlatform("google-drive");
      } else if (videoUrl.includes("vimeo.com")) {
        setPlatform("vimeo");
      } else if (videoUrl.includes("dropbox.com")) {
        setPlatform("dropbox");
      } else if (videoUrl.includes("onedrive.live.com") || videoUrl.includes("sharepoint.com")) {
        setPlatform("onedrive");
      } else {
        setPlatform("direct");
      }
    };

    const getEmbedUrl = (videoUrl: string) => {
      if (!videoUrl) return "";

      if (platform === "youtube") {
        const videoId = extractYouTubeId(videoUrl);
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      } else if (platform === "google-drive") {
        const fileId = extractGoogleDriveId(videoUrl);
        return `https://drive.google.com/file/d/${fileId}/preview`;
      } else if (platform === "vimeo") {
        const videoId = extractVimeoId(videoUrl);
        return `https://player.vimeo.com/video/${videoId}`;
      } else if (platform === "dropbox") {
        return videoUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com");
      }

      return videoUrl;
    };

    const extractYouTubeId = (url: string) => {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match ? match[1] : "";
    };

    const extractGoogleDriveId = (url: string) => {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : "";
    };

    const extractVimeoId = (url: string) => {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : "";
    };

    const handlePlayPause = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleMuteToggle = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleVolumeChange = (value: number[]) => {
      if (videoRef.current) {
        videoRef.current.volume = value[0];
        setVolume(value[0]);
      }
    };

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleSeek = (value: number[]) => {
      if (videoRef.current) {
        videoRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    };

    const handleFullscreen = () => {
      if (videoRef.current) {
        videoRef.current.requestFullscreen();
      }
    };

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!url) {
      return (
        <div className="w-full aspect-video bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">No video URL provided</p>
        </div>
      );
    }

    // For platforms with native embeds (YouTube, Vimeo, etc.)
    if (["youtube", "google-drive", "vimeo", "onedrive"].includes(platform)) {
      return (
        <div className="w-full aspect-video bg-black">
          <iframe
            ref={iframeRef}
            src={getEmbedUrl(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // For direct video files or unsupported platforms
    if (platform === "direct") {
      return (
        <div className="w-full bg-black relative group">
          <video
            ref={videoRef}
            src={url}
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Custom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
              className="mb-4"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handlePlayPause}
                  className="text-white hover:text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMuteToggle}
                  className="text-white hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>

                <Slider
                  value={[volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />

                <span className="text-white text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleFullscreen}
                className="text-white hover:text-white"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unknown platforms
    return (
      <div className="w-full aspect-video bg-muted flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-center">
          This video platform is not directly supported for embedded playback.
        </p>
        <Button asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Open in New Tab
          </a>
        </Button>
      </div>
    );
  }
);

UniversalVideoPlayer.displayName = "UniversalVideoPlayer";

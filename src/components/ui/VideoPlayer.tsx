import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ChevronDown,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Hls from 'hls.js';
import { Button } from './Button';
import { cn } from '../../utils/cn';
import './VideoPlayer.css';

interface VideoPlayerProps {
  embedUrl?: string;
  m3u8Url?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  embedUrl,
  m3u8Url,
  title,
  poster,
  autoPlay = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCenterButton, setShowCenterButton] = useState(true);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [draggedTime, setDraggedTime] = useState(0);
  const [buffered, setBuffered] = useState(0);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const [tooltipTime, setTooltipTime] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use m3u8 URL directly instead of embed
  const videoSrc = m3u8Url || embedUrl;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768) ||
        ('ontouchstart' in window);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    setIsLoading(true);
    setError(null);

    // Check if HLS is supported natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoSrc;
      setIsLoading(false);
    } else if (Hls.isSupported()) {
      // Use HLS.js for other browsers
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        // Get available quality levels
        const levels = hls.levels.map(level => 
          level.height ? `${level.height}p` : `${Math.round(level.bitrate / 1000)}k`
        );
        setQualities(['auto', ...levels]);
        
        if (autoPlay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Lỗi mạng khi tải video');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Lỗi media player');
              break;
            default:
              setError('Không thể phát video');
              break;
          }
        }
      });
    } else {
      setError('Trình duyệt không hỗ trợ phát video HLS');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSrc, autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      // Don't update currentTime while dragging to prevent jumping
      if (!isDraggingProgress) {
        setCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setBuffered((bufferedEnd / duration) * 100);
        }
      }
    };

    const handleRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ratechange', handleRateChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ratechange', handleRateChange);
    };
  }, [isDraggingProgress]);

  // Auto-hide controls after inactivity
  const resetControlsTimeout = () => {
    setControlsVisible(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Only auto-hide on desktop when playing, mobile controls stay visible longer
    if (isPlaying && !isMobile) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    } else if (isPlaying && isMobile) {
      // Mobile: longer timeout and only hide if not interacting
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  useEffect(() => {
    // Show center button when video is paused, hide when playing
    if (!isPlaying) {
      setShowCenterButton(true);
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      setShowCenterButton(false);
      resetControlsTimeout();
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showQualityMenu &&
          !target?.closest('.quality-menu') &&
          !target?.closest('.quality-button')) {
        setShowQualityMenu(false);
      }

      if (showSpeedMenu &&
          !target?.closest('.speed-menu') &&
          !target?.closest('.speed-button')) {
        setShowSpeedMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu, showSpeedMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      // Check if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).isContentEditable ||
        (activeElement as HTMLElement).contentEditable === 'true'
      );

      // Don't handle shortcuts if user is typing
      if (isTyping) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          resetControlsTimeout();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          resetControlsTimeout();
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          resetControlsTimeout();
          break;
        case 'ArrowUp':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          resetControlsTimeout();
          break;
        case 'ArrowDown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          resetControlsTimeout();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          resetControlsTimeout();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenActive = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFullscreenActive);
    };

    // Add event listeners for all browsers
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
  };

  // Touch handling for volume slider on mobile
  const handleVolumeTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent video controls from hiding
  };

  const handleVolumeTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent video controls from hiding
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    setDraggedTime(newTime);

    // Always seek immediately for responsive feedback
    video.currentTime = newTime;
  };

  // Progress bar hover handler
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;
    const position = (e.clientX - rect.left);

    setTooltipTime(time);
    setTooltipPosition(position);
    setShowTimeTooltip(true);
  };

  const handleProgressMouseLeave = () => {
    if (!isDraggingProgress) {
      setShowTimeTooltip(false);
    }
  };

  // Progress bar drag handlers
  const handleProgressMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsDraggingProgress(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    const position = (e.clientX - rect.left);

    setDraggedTime(newTime);
    setTooltipTime(newTime);
    setTooltipPosition(position);
    setShowTimeTooltip(true);

    // Immediately seek to new position
    const video = videoRef.current;
    if (video) {
      video.currentTime = newTime;
    }
  };

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingProgress) return;

      const progressBar = document.querySelector('.progress-bar') as HTMLInputElement;
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = percent * duration;
      const position = (e.clientX - rect.left);

      setDraggedTime(newTime);
      setTooltipTime(newTime);
      setTooltipPosition(position);

      // Update video time in real-time while dragging
      const video = videoRef.current;
      if (video) {
        video.currentTime = newTime;
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingProgress) {
        setIsDraggingProgress(false);
        setShowTimeTooltip(false);
        // Sync currentTime with draggedTime when drag ends
        const video = videoRef.current;
        if (video) {
          setCurrentTime(video.currentTime);
        }
      }
    };

    if (isDraggingProgress) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDraggingProgress, duration]);

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    const video = videoRef.current;
    if (!container || !video) return;

    if (document.fullscreenElement || 
        (document as any).webkitFullscreenElement || 
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    } else {
      // Enter fullscreen - try video element first for better mobile support
      const element = isMobile ? video : container;
      
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(console.error);
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).webkitEnterFullscreen) {
        // iOS Safari specific
        (element as any).webkitEnterFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    }
  };

  const changeQuality = (qualityIndex: number) => {
    if (!hlsRef.current) return;

    if (qualityIndex === 0) {
      // Auto quality
      hlsRef.current.currentLevel = -1;
      setCurrentQuality('auto');
    } else {
      hlsRef.current.currentLevel = qualityIndex - 1;
      setCurrentQuality(qualities[qualityIndex]);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };



  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle video container click
  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on controls or buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.quality-menu')) {
      return;
    }

    if (isMobile) {
      // Mobile: Toggle controls visibility
      if (controlsVisible) {
        // If controls are visible, hide them
        setControlsVisible(false);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } else {
        // If controls are hidden, show them
        setControlsVisible(true);
        // Set auto-hide timer only if video is playing
        if (isPlaying) {
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          controlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
          }, 6000); // 6 seconds for mobile
        }
      }
    } else {
      // Desktop: Toggle play/pause
      togglePlay();
      resetControlsTimeout();
    }
  };

  if (!videoSrc) {
    return (
      <div className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden",
        "aspect-video flex items-center justify-center",
        className
      )}>
        <div className="text-center text-white">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Không có nguồn phim khả dụng</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "relative w-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden",
        "aspect-video flex items-center justify-center border border-red-500/20",
        className
      )}>
        <div className="text-center text-white max-w-md mx-auto p-6">
          <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Không thể phát video</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden group video-player",
        "aspect-video transition-all duration-300",
        controlsVisible ? "cursor-default" : "cursor-none",
        isFullscreen && "!rounded-none !aspect-auto !w-screen !h-screen",
        className
      )}
      onMouseMove={!isMobile ? resetControlsTimeout : undefined}
      onMouseEnter={!isMobile ? resetControlsTimeout : undefined}
      onMouseLeave={!isMobile ? () => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      } : undefined}
      onClick={handleVideoClick}
      onTouchStart={isMobile ? () => {
        // Mobile: Reset timeout when user touches screen
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } : undefined}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full",
          isFullscreen ? "object-contain" : "object-cover"
        )}
        poster={poster}
        playsInline
        preload="metadata"
        onDoubleClick={toggleFullscreen}
        controls={false}
        style={{
          maxWidth: isFullscreen ? '100vw' : '100%',
          maxHeight: isFullscreen ? '100vh' : '100%',
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="loading-icon w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white animate-spin" />
        </div>
      )}

      {/* Controls overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent",
        "flex flex-col justify-end transition-all duration-300",
        controlsVisible ? "opacity-100" : "opacity-0"
      )}>
        {/* Title overlay - Netflix style */}
        {title && (
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 md:top-6 md:left-6 md:right-6">
            <h3 className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl drop-shadow-lg max-w-full line-clamp-2">
              {title}
            </h3>
          </div>
        )}

        {/* Quality menu - Netflix style */}
        {qualities.length > 1 && showQualityMenu && (
          <div className="quality-menu absolute bottom-16 right-2 sm:bottom-20 sm:right-3 md:bottom-24 md:right-6 bg-black/95 backdrop-blur-sm rounded-lg py-2 min-w-[100px] sm:min-w-[120px] md:min-w-[140px] border border-gray-600 z-50">
            <div className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-300 border-b border-gray-600">
              Chất lượng
            </div>
            {qualities.map((quality, index) => (
              <button
                key={quality}
                onClick={() => {
                  changeQuality(index);
                  setShowQualityMenu(false);
                }}
                className={cn(
                  "block w-full text-left px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm text-white hover:bg-white/10 transition-colors",
                  currentQuality === quality && "bg-red-600 text-white"
                )}
              >
                {quality === 'auto' ? 'Tự động' : quality}
              </button>
            ))}
          </div>
        )}

        {/* Center play button - only show when paused */}
        {!isPlaying && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500",
              showCenterButton ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
            onClick={togglePlay}
          >
            <Play className="center-play-icon w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 text-white pointer-events-auto cursor-pointer hover:scale-110 transition-all duration-300" />
          </div>
        )}

        {/* Main controls container - Netflix style */}
        <div 
          className="p-3 pb-2 sm:p-4 sm:pb-3 md:p-6 md:pb-4 space-y-2 sm:space-y-3 md:space-y-4"
          onMouseEnter={() => {
            if (!isPlaying) setShowCenterButton(false);
          }}
          onMouseLeave={() => {
            if (!isPlaying) setShowCenterButton(true);
            if (isMobile && isPlaying) {
              // Mobile: start auto-hide timer when leaving controls
              if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
              }
              controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
              }, 3000);
            }
          }}
          onTouchStart={() => {
            if (controlsTimeoutRef.current) {
              clearTimeout(controlsTimeoutRef.current);
            }
          }}
          onTouchEnd={() => {
            if (isMobile && isPlaying) {
              // Mobile: start auto-hide timer after touch interaction
              controlsTimeoutRef.current = setTimeout(() => {
                setControlsVisible(false);
              }, 4000);
            }
          }}
        >
          {/* Progress bar */}
          <div className="group relative">
            {/* Time tooltip */}
            {showTimeTooltip && (
              <div
                className="time-tooltip absolute bottom-full mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-md pointer-events-none z-10 transform -translate-x-1/2 transition-opacity duration-200"
                style={{
                  left: `${Math.max(24, Math.min(tooltipPosition, window.innerWidth - 48))}px` // Keep tooltip within bounds
                }}
              >
                {formatTime(tooltipTime)}
              </div>
            )}

            {/* Buffer bar background */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              {/* Buffered progress */}
              <div
                className="h-full bg-white/40 transition-all duration-300"
                style={{ width: `${buffered}%` }}
              />
            </div>

            {/* Main progress bar */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={isDraggingProgress ? draggedTime : currentTime}
              onChange={handleSeek}
              onMouseDown={handleProgressMouseDown}
              onMouseMove={handleProgressMouseMove}
              onMouseLeave={handleProgressMouseLeave}
              className={cn(
                "progress-bar absolute top-0 w-full h-1 bg-transparent rounded-full appearance-none cursor-pointer group-hover:h-1.5 transition-all duration-200",
                isDraggingProgress && "dragging"
              )}
              style={{
                background: `linear-gradient(to right, #e50914 0%, #e50914 ${((isDraggingProgress ? draggedTime : currentTime) / duration) * 100}%, transparent ${((isDraggingProgress ? draggedTime : currentTime) / duration) * 100}%, transparent 100%)`
              }}
            />

            {/* Time display */}
            <div className="flex justify-between text-xs text-gray-300 mt-2">
              <span className="text-xs sm:text-sm font-medium">
                {formatTime(isDraggingProgress ? draggedTime : currentTime)}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Control buttons row */}
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 bg-white/10"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                )}
              </Button>

              {/* Volume controls */}
              <div
                className="flex items-center gap-2 group relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                {/* Volume slider */}
                <div className={cn(
                  "transition-all duration-300 overflow-hidden flex items-center",
                  isMobile || showVolumeSlider ? "opacity-100 w-20 sm:w-24" : "opacity-0 w-0"
                )}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onTouchStart={handleVolumeTouchStart}
                    onTouchMove={handleVolumeTouchMove}
                    className="volume-slider w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #e50914 0%, #e50914 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>

                {/* Volume percentage tooltip */}
                {(showVolumeSlider || isMobile) && (
                  <span className="text-xs text-gray-300 min-w-[2rem] text-center">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                )}
              </div>

              {/* Time display - Full on desktop, compact on mobile */}
              {/* Removed time display per user request */}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Playback speed */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="speed-button text-white hover:bg-white/20 px-2 py-1 rounded text-xs sm:text-sm font-medium min-w-[2.5rem]"
                >
                  {playbackRate}x
                </Button>

                {/* Speed menu */}
                {showSpeedMenu && (
                  <div className="speed-menu absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg py-2 min-w-[80px] border border-gray-600 z-50">
                    <div className="px-3 py-1 text-xs font-medium text-gray-300 border-b border-gray-600">
                      Tốc độ
                    </div>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={cn(
                          "block w-full text-left px-3 py-1 text-xs text-white hover:bg-white/10 transition-colors",
                          playbackRate === rate && "bg-red-600 text-white"
                        )}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality selector */}
              {qualities.length > 1 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="quality-button text-white hover:bg-white/20 px-2 py-1 rounded text-xs sm:text-sm font-medium"
                  >
                    {currentQuality === 'auto' ? 'HD' : currentQuality}
                  </Button>
                </div>
              )}

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:scale-110"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EpisodePlayerProps {
  episodes: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }>;
  }>;
  movieTitle?: string;
  poster?: string;
  onEpisodeChange?: (serverIndex: number, episodeIndex: number) => void;
}

export const EpisodePlayer: React.FC<EpisodePlayerProps> = ({
  episodes,
  movieTitle,
  poster,
  onEpisodeChange
}) => {
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [playerKey, setPlayerKey] = useState(0); // Force re-render player

  const currentServer = episodes[selectedServer];
  const currentEpisode = currentServer?.server_data[selectedEpisode];

  const handleServerChange = (serverIndex: number) => {
    setSelectedServer(serverIndex);
    setSelectedEpisode(0); // Reset to first episode when changing server
    setPlayerKey(prev => prev + 1); // Force player reload
    onEpisodeChange?.(serverIndex, 0);
  };

  const handleEpisodeChange = (episodeIndex: number) => {
    setSelectedEpisode(episodeIndex);
    setPlayerKey(prev => prev + 1); // Force player reload
    onEpisodeChange?.(selectedServer, episodeIndex);
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center text-white py-8">
        <p>Không có tập phim khả dụng</p>
      </div>
    );
  }

  const episodeTitle = currentEpisode 
    ? `${movieTitle} - ${currentEpisode.name}` 
    : movieTitle;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div key={playerKey}>
        <VideoPlayer
          m3u8Url={currentEpisode?.link_m3u8}
          embedUrl={currentEpisode?.link_embed}
          title={episodeTitle}
          poster={poster}
          autoPlay={true}
          className="w-full"
        />
      </div>

      {/* Server Selection */}
      {episodes.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Chọn Server
          </h3>
          <div className="flex flex-wrap gap-2">
            {episodes.map((server, serverIndex) => (
              <Button
                key={serverIndex}
                variant={selectedServer === serverIndex ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleServerChange(serverIndex)}
                className="text-sm"
              >
                {server.server_name.replace('#', '')}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Episode Selection */}
      {currentServer && currentServer.server_data.length > 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Play className="w-5 h-5" />
              Danh sách tập ({currentServer.server_data.length} tập)
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="text-white"
            >
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showEpisodes ? "rotate-180" : ""
              )} />
            </Button>
          </div>
          
          {showEpisodes && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
              {currentServer.server_data.map((episode, episodeIndex) => (
                <Button
                  key={episodeIndex}
                  variant={selectedEpisode === episodeIndex ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleEpisodeChange(episodeIndex)}
                  className={cn(
                    "h-auto py-3 px-2 text-center transition-colors duration-200 relative",
                    selectedEpisode === episodeIndex 
                      ? "shadow-lg shadow-red-500/30" 
                      : "hover:bg-slate-600 hover:shadow-md hover:shadow-red-400/20"
                  )}
                >
                  {selectedEpisode === episodeIndex && (
                    <div className="absolute inset-0 rounded-lg border-2 border-red-500/50 pointer-events-none" />
                  )}
                  <div className="space-y-1 relative z-10">
                    <div className="font-medium text-xs">{episode.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Episode Info */}
      {currentEpisode && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">
            Đang phát: {currentEpisode.name}
          </h4>
          {currentEpisode.filename && (
            <p className="text-gray-400 text-sm">
              {currentEpisode.filename}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
